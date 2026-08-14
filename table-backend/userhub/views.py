from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from uniformAdmin.models import AdminUser
from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated ,AllowAny
from .utils import *
from django.core.mail import send_mail
from django.conf import settings
from .serializers import*
from django.db.models import F
from django.shortcuts import get_object_or_404
import logging
from django.db.models import Sum
from django.db import transaction
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.db import IntegrityError
from django.utils.dateparse import parse_date
from .payment import CustomPagination
from uniformAdmin.signal import *
from uniformAdmin.models import *
from rest_framework.permissions import AllowAny
# from django.utils import timezone
from django.db.models import Prefetch
from rest_framework.authentication import BaseAuthentication
from drf_spectacular.utils import extend_schema,OpenApiExample,OpenApiResponse
from drf_spectacular.types import OpenApiTypes
from django.utils.http import urlsafe_base64_decode
from uniformAdmin.signal import *
from .docusign_service import get_docusign_token, send_contract
import re
from uniformAdmin.models import *
logger = logging.getLogger(__name__)
from django.core.files.base import ContentFile
from django.utils.timezone import now
from django.core.mail import EmailMessage
from docusign_esign import EnvelopesApi, ApiClient
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from uniformAdmin.utils import new_build_media_url
from rest_framework.pagination import PageNumberPagination

class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

# class SignupAPIView(APIView):
#     permission_classes=[AllowAny]
#     def post(self, request, *args, **kwargs):
#         # request.data._mutable = True
#         # request.data["userType"] = request.data.get("userType")
#         serializer = UserSignupSerializer(data=request.data)

#         try:
#             if serializer.is_valid():
#                 user = serializer.save()
                
#                  # EMAIL VERIFICATION 
#                 uid = urlsafe_base64_encode(force_bytes(user.id))                
#                 verify_link = request.build_absolute_uri(f"/api/v1/userhub/verify-email/{uid}/")


#                 send_mail(
#                     subject="Verify your email",
#                     message=f"Click here to verify your email, it's you:\n{verify_link}",
#                     from_email=settings.EMAIL_HOST_USER,
#                     recipient_list=[user.email],
#                     fail_silently=False
#                 )

#                 # Serialize full safe user response
#                 response_data = UserResponseSerializer(
#                     user,
#                     context={'request': request}
#                 ).data

#                 # Convert profileImage to full URL
#                 if user.profileImage:
#                     response_data["profileImage"] = request.build_absolute_uri(user.profileImage.url)

#                 return Response({
#                     "status": True,
#                     "statusCode": 201,
#                     "message": "User created successfully.",
#                     "data": response_data
#                 }, status=status.HTTP_201_CREATED)

#             else:

#                 errors = serializer.errors
#                 missing_fields = []

#                 if isinstance(errors, dict):
#                     for field, messages in errors.items():
#                         if isinstance(messages, list) and messages:
#                             # collect fields with "required" error
#                             if "required" in messages[0].lower():
#                                 missing_fields.append(field)

#                 if missing_fields:
#                     fields_str = ", ".join(missing_fields)
#                     error_message = f"Validation failed; {fields_str} : This field is required."
#                 else:
#                     error_message = "Validation failed."
                                            
#                 return Response({
#                     "status": False,
#                     "statusCode": 400,
#                     "message": error_message
#                 }, status=status.HTTP_400_BAD_REQUEST)

#         except Exception as exc:
#             logger.exception("Signup error")
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                     "message": "Server error while creating user.",
#                 "error": str(exc)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SignupAPIView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
    summary="Create a new user ",
    request=UserSignupSerializer,
    responses={201: UserResponseSerializer},
    auth=[],
    tags=["UserHub Authentication"]
)

    def post(self, request, *args, **kwargs):
        serializer = UserSignupSerializer(data=request.data)

        try:
            if serializer.is_valid():
                user = serializer.save()
                send_registration_email(user)
                
                 # EMAIL VERIFICATION 
                uid = user.id  #urlsafe_base64_encode(force_bytes(user.id))       
                email = user.email         
                verify_link = request.build_absolute_uri(f"https://table.dxtspace.com/account-verified-page?user_id={uid}&email={email}")

                # EMAIL VERIFICATION
                # uid = urlsafe_base64_encode(force_bytes(user.id))
                # verify_link = request.build_absolute_uri(
                #     f"/api/v1/userhub/verify-email/{uid}/"
                # )

                send_mail(
                    subject="Verify your email",
                    message=f"Click here to verify your email, it's you:\n{verify_link}",
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[user.email],
                    fail_silently=False,
                )

                response_data = UserResponseSerializer(
                    user, context={"request": request}
                ).data

                if user.profileImage:
                    response_data["profileImage"] = request.build_absolute_uri(
                        user.profileImage.url
                    )

                return Response(
                    {
                        "status": True,
                        "statusCode": 201,
                        "message": "User created successfully.",
                        "data": response_data,
                    },
                    status=status.HTTP_201_CREATED,
                )

            # -------------------------------
            #  VALIDATION FAILED
            # -------------------------------
            errors = serializer.errors
            error_message = "Validation failed."

            if isinstance(errors, dict):
                if "non_field_errors" in errors:
                    error_message = errors["non_field_errors"][0]
                else:
                    missing_fields = []
                    for field, messages in errors.items():
                        if isinstance(messages, list) and messages:
                            if "required" in messages[0].lower():
                                missing_fields.append(field)

                    if missing_fields:
                        fields_str = ", ".join(missing_fields)
                        error_message = f"{fields_str} : This field is required."

            # IMPORTANT: ALWAYS RETURN RESPONSE
            return Response(
                {
                    "status": False,
                    "statusCode": 400,
                    "message": error_message,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as exc:
            logger.exception("Signup error")
            return Response(
                {
                    "status": False,
                    "statusCode": 500,
                    "message": "Server error while creating user.",
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
  
class UserLoginAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        
        try:
            email = request.data.get("email")
            password = request.data.get("password")
            user_type = request.data.get("userType", "table")
            if not user_type:
                user_type = "table"
            
            # ------- CLEAN VALIDATION FIX ----------
            missing_fields = []

            if not email:
                missing_fields.append("Email is required.")
            if not password:
                missing_fields.append("Password is required.")

            # If ANY field missing → return ONLY the FIRST message
            if missing_fields:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": missing_fields[0],
                }, status=200)
            # ----------------------------------------

            serializer = LoginSerializer(data=request.data)

            # serializer = LoginSerializer(data=request.data)

            print("Request Data:", request.data)

            serializer.is_valid(raise_exception=True)

            print("Serializer passed")

            user = serializer.validated_data["user"]

            print("User:", user.email)
            print("User Type:", user.userType)
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data["user"]


           ##
            #  EMAIL VERIFICATION CHECK 
           ##
            if not user.is_verify:
                return Response({
                    "status": False,
                    "statusCode": 403,
                    "message": "Please verify your email before logging in."
                }, status=200)
           ##
            

            # Check matching userType
            if user.userType != user_type:
                return Response({
                    "status": False,
                    "statusCode": 403,
                    "message": "You are not allowed to login in this section."
                }, status=200)

            # Update last login
            user.lastLogin = now()
            # user.is_currently_login = True   #for get currently login 
            user.save()
            send_login_alert_email(user)

            # ---------------------------------------------------------
            # CASE 1: NORMAL USER → call external custom token function
            # ---------------------------------------------------------
            if not isinstance(user, AdminUser):
                tokens = generate_custom_tokens(user)
                access_token = tokens["access"]
                refresh_token = tokens["refresh"]

            # ---------------------------------------------------------
            # CASE 2: ADMIN USER → use SimpleJWT
            # ---------------------------------------------------------
            else:
                jwt_refresh = RefreshToken.for_user(user)
                access_token = str(jwt_refresh.access_token)
                refresh_token = str(jwt_refresh)

            # User serialized data
            user_data = UserResponseSerializer(user, context={"request": request}).data

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Login successful.",
                "data": {
                    "accessToken": access_token,
                    "refreshToken": refresh_token,
                    **user_data
                }
            },status=200)

        except serializers.ValidationError as ve:
            error_msg = ""
            if "non_field_errors" in ve.detail:
                error_msg = ve.detail["non_field_errors"][0]
            else:
                error_msg = str(ve.detail)
            return Response({
                "status": False,
                "statusCode": 400,
                "message": f"Validation failed ; {error_msg}",
            }, status=200)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error during login.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class GetProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
    summary="GetProfile API",
    responses={200: dict},
    tags=["UserHub Authentication"]
    
    )
    def get(self, request):
        try:
            user = request.user

            user_data = {
                "id": user.id,
                "email": user.email,
                "userName": user.userName,
                "phone": user.phone,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "gender": user.gender,
                "language": user.language,
                "profileImage": request.build_absolute_uri(user.profileImage.url) if user.profileImage else None,
                "role": user.role.id if user.role else None,
                "roleName": user.role.role_name if user.role else None,
                "isActive": user.isActive,
                "isDeleted": user.isDeleted,
                "lastLogin": user.lastLogin,
                "appleID": user.appleID,
                "stripeOrderCustomerId": user.stripeOrderCustomerId,
                "loginType": user.loginType,
                "createdAt": user.createdAt,
                "updatedAt": user.updatedAt,
            }

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Profile fetched successfully.",
                "data": user_data
            }, status=200)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Unable to fetch profile.",
                "error": str(exc)
            }, status=500)



class CustomUserJWTAuthentication(BaseAuthentication):

    def authenticate(self, request):
        print("===== CustomUserJWTAuthentication =====")
    permission_classes = [IsAuthenticated]

    @extend_schema(
    summary="UpdateProfile API",
    request=UserResponseSerializer,
    responses={200: UserResponseSerializer},
    tags=["UserHub Authentication"]
    
    )
    def put(self, request):
        try:
            user = request.user
            print("userrrrrrrrrrrrrrrrrrrrrrrrrrr",user.id)

            allowed_fields = [
                "firstName", "lastName", "phone",
                "gender", "language", "userName"
            ]

            for field in allowed_fields:
                if field in request.data:
                    setattr(user, field, request.data[field])

            # NEW — Update userType (as you requested)
            if "userType" in request.data:
                user.userType = request.data["userType"]
                
            # EMAIL VERIFICATION FLAG (FRONTEND CONTROLLED)
            if request.data.get("is_verify") is True:
                user.is_verify = True    

            # Handle profile image
            if "profileImage" in request.FILES:
                user.profileImage = request.FILES["profileImage"]

            user.save()

            # SERIALIZE COMPLETE UPDATED USER DATA
            response_data = UserResponseSerializer(
                user,
                context={"request": request}
            ).data

            # Ensure full profileImage URL
            if user.profileImage:
                response_data["profileImage"] = request.build_absolute_uri(
                    user.profileImage.url
                )

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Profile updated successfully.",
                "data": response_data
            }, status=200)

        except IntegrityError:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Username already exists.",
            }, status=200)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Unable to update profile.",
                "error": str(exc)
            }, status=500)


class userUpdateProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Update Profile API",
        request=UpdateProfileSerializer,
        responses={200: UserResponseSerializer},
        tags=["UserHub Authentication"],
    )
    def put(self, request):
        try:
            user = request.user

            serializer = UpdateProfileSerializer(
                user,
                data=request.data,
                partial=True
            )

            if not serializer.is_valid():
                errors = serializer.errors
                first_key = list(errors.keys())[0]
                message = errors[first_key][0]

                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": message
                }, status=status.HTTP_400_BAD_REQUEST)

            serializer.save()

            # Optional email verification update
            if "is_verify" in request.data:
                user.is_verify = bool(request.data.get("is_verify"))
                user.save(update_fields=["is_verify"])

            response_data = UserResponseSerializer(
                user,
                context={"request": request}
            ).data

            if user.profileImage:
                response_data["profileImage"] = request.build_absolute_uri(
                    user.profileImage.url
                )

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Profile updated successfully.",
                "data": response_data
            }, status=status.HTTP_200_OK)

        except IntegrityError:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Username already exists."
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Unable to update profile.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DeleteProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    summary="DeleteProfile API",
    responses={200: dict},
    tags=["UserHub Authentication"]
    
    )
    def delete(self, request):
        try:
            user = request.user
            user.delete()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Profile deleted permanently."
            }, status=200)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Unable to delete profile.",
                "error": str(exc)
            }, status=500)


class ForgotPasswordAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
    summary="ForgotPassword API",
        
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "email": {
                    "type": "string",
                    "format": "email",
                    "example": "user@example.com"
                }
            },
            "required": ["email"]
        }
    },
    responses={
        200: {
            "type": "object",
            "properties": {
                "status": {"type": "boolean"},
                "statusCode": {"type": "integer"},
                "message": {"type": "string"}
            }
        },
        400: {"type": "object"},
        500: {"type": "object"}
    },
    tags=["UserHub Authentication"]
    
    
    )



    def post(self, request):
        try:
            email = request.data.get("email")
            user_type = request.data.get("userType")  

            if not email and not user_type:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation failed.",
                    "error": {"email": "Email and user_type are required."}
                }, status=400)

            # Check user exists
            try:
                user = Users.objects.get(email=email, isDeleted=False, userType=user_type)
            except Users.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "No account found with this email and user type."
                }, status=400)

            # Create reset token
            # reset_token = uuid.uuid4().hex
            # user.resetToken = reset_token
            # user.save()
            user_id = user.id

            # Build reset link
            frontend_url = "https://table.dxtspace.com/reset-password"
            reset_link = f"{frontend_url}?user_id={user_id}"

            # -------------------------------
            # SMTP: Send Reset Email Here   
            # -------------------------------
            subject = "Reset Your Password"
            message = f"Hello,\n\nClick the link below to reset your password:\n{reset_link}\n\nIf you did not request this, please ignore this email."
            from_email = settings.EMAIL_HOST_USER
            recipient_list = [email]

            send_mail(subject, message, from_email, recipient_list, fail_silently=False)

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Reset link sent successfully.",
                "resetLink": reset_link
            }, status=200)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Unable to process forgot password.",
                "error": str(exc)
            }, status=500)



class ResetPasswordAPIView(APIView):
    permission_classes = [AllowAny]
    
    @extend_schema(
    summary="Reset Password API",
    description="Reset password using userId after forgot password flow.",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "userId": {"type": "integer"},
                "newPassword": {"type": "string"},
                "confirmPassword": {"type": "string"},
            },
            "required": ["userId", "newPassword", "confirmPassword"],
        }
    },
    responses={
        200: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT,
        500: OpenApiTypes.OBJECT,
    },
    examples=[
        OpenApiExample(
            "Reset Password Example",
            value={
                "userId": 12,
                "newPassword": "NewPass@123",
                "confirmPassword": "NewPass@123",
            },
            request_only=True,
        )
    ],
    auth=[],  # no auth (AllowAny)
    tags=["UserHub Authentication"]
    
)
    
    
    def post(self, request):
        try:
            user_id = request.data.get("userId")
            new_password = request.data.get("newPassword")
            confirm_password = request.data.get("confirmPassword")

            # Required fields validation
            if not user_id or not new_password or not confirm_password:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation failed.",
                    "error": {
                        "userId": "Required." if not user_id else "",
                        "newPassword": "Required." if not new_password else "",
                        "confirmPassword": "Required." if not confirm_password else ""
                    }
                }, status=400)

            # Check new & confirm password match
            if new_password != confirm_password:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "New password and confirm password do not match."
                }, status=200)

            # Find user by userId
            try:
                user = Users.objects.get(id=user_id, isDeleted=False)
            except Users.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Invalid user."
                }, status=400)

            # Update password
            user.password = make_password(new_password)
            # user.resetToken = None  # Optional: clear token
            user.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Password reset successfully."
            })

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Unable to reset password.",
                "error": str(exc)
            }, status=500)



class UpdatePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    summary="Update Password API",
    description="Update password for authenticated user.",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "currentPassword": {"type": "string"},
                "newPassword": {"type": "string"},
                "confirmPassword": {"type": "string"},
            },
            "required": ["currentPassword", "newPassword", "confirmPassword"],
        }
    },
    responses={
        200: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT,
        500: OpenApiTypes.OBJECT,
    },
    examples=[
        OpenApiExample(
            "Update Password Example",
            value={
                "currentPassword": "OldPass@123",
                "newPassword": "NewPass@123",
                "confirmPassword": "NewPass@123",
            },
            request_only=True,
        )
    ],
    auth=[{"bearerAuth": []}],  #  JWT required
    tags=["UserHub Authentication"]
        
    )        
                
    def validate_password(self, password):
        """
        Validates password:
        - At least 8 characters
        - Must contain a number
        - Must contain a special character
        """
        if len(password) < 8:
            return "Password must be at least 8 characters long."

        if not re.search(r"\d", password):
            return "Password must contain at least one number."

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            return "Password must contain at least one special character."

        return None

    def post(self, request):
        try:
            user = request.user

            current_password = request.data.get("currentPassword")
            new_password = request.data.get("newPassword")
            confirm_password = request.data.get("confirmPassword")

            # Required fields validation
            if not current_password or not new_password or not confirm_password:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation failed.",
                    "error": {
                        "currentPassword": "Required." if not current_password else "",
                        "newPassword": "Required." if not new_password else "",
                        "confirmPassword": "Required." if not confirm_password else ""
                    }
                }, status=400)

            # Check current password
            if not check_password(current_password, user.password):
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Current password is incorrect."
                }, status=400)

            # Check if new & confirm password match
            if new_password != confirm_password:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "New Password and Confirm Passwords do not match.",
                }, status=400)

            # Apply password policy validation
            password_error = self.validate_password(new_password)
            if password_error:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": password_error
                }, status=400)

            # Prevent same password reuse
            if check_password(new_password, user.password):
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "New password cannot be same as current password."
                }, status=400)

            # Save new password
            user.password = make_password(new_password)
            user.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Password updated successfully."
            }, status=200)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Unable to update password.",
                "error": str(exc)
            }, status=500)


class VerifyUserAPIView(APIView):
    permission_classes = [AllowAny]
    @extend_schema(
    summary="Verify User API",
    request=VerifyUserSerializer,
    responses={200: dict},
    auth=[],
    tags=["UserHub Authentication"]
        
    )
    def post(self, request):
        serializer = VerifyUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_id = serializer.validated_data["user_id"]
        # is_verify is already validated as True by serializer

        try:
            user = Users.objects.get(id=user_id, isDeleted=False)
        except Users.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "User not found."
            }, status=404)

        #  Already verified case (idempotent API)
        if user.is_verify:
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "User already verified."
            }, status=200)

        #  Verify user
        user.is_verify = True
        user.save(update_fields=["is_verify"])

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "User verified successfully."
        }, status=200)


#-----------------Notification-------------------------

# class NotificationCreateAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         try:
#             serializer = NotificationSerializer(data=request.data)
#             if serializer.is_valid():
#                 serializer.save(user=request.user)
#                 return Response({
#                     "status": True,
#                     "statusCode": 200,
#                     "message": "Notification created successfully",
#                     "data": serializer.data
#                 }, status=status.HTTP_200_OK)

#             return Response({
#                 "status": False,
#                 "statusCode": 400,
#                 "message": serializer.errors,
#                 "data": None
#             }, status=status.HTTP_400_BAD_REQUEST)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": str(e),
#                 "data": None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserNotificationListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            target_user = request.user
            if not isinstance(target_user, Users):
                user_obj = Users.objects.filter(Q(email=getattr(request.user, 'email', None)) | Q(id=getattr(request.user, 'id', None))).first()
                if user_obj:
                    target_user = user_obj

            notifications = UserNotification.objects.filter(
                user=target_user,
                isDeleted=False,
                isActive=True
            ).order_by("-created_at")

            serializer = UserNotificationSerializer(notifications, many=True)

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "User notifications fetched successfully",
                "count": notifications.count(),
                "unread_count": notifications.filter(is_read=False).count(),
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": str(e),
                "data": []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserNotificationMarkReadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk=None):
        try:
            target_user = request.user
            if not isinstance(target_user, Users):
                user_obj = Users.objects.filter(Q(email=getattr(request.user, 'email', None)) | Q(id=getattr(request.user, 'id', None))).first()
                if user_obj:
                    target_user = user_obj

            if pk:
                notification = get_object_or_404(UserNotification, pk=pk, user=target_user, isDeleted=False)
                notification.is_read = True
                notification.save(update_fields=["is_read"])
            else:
                UserNotification.objects.filter(user=target_user, isDeleted=False).update(is_read=True)

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Notification(s) marked as read successfully"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserNotificationDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            target_user = request.user
            if not isinstance(target_user, Users):
                user_obj = Users.objects.filter(Q(email=getattr(request.user, 'email', None)) | Q(id=getattr(request.user, 'id', None))).first()
                if user_obj:
                    target_user = user_obj

            notification = get_object_or_404(UserNotification, pk=pk, user=target_user, isDeleted=False)
            notification.isDeleted = True
            notification.isActive = False
            notification.save(update_fields=["isDeleted", "isActive"])

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Notification deleted successfully"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": str(e),
#                 "data": None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ADD TO CART 
class AddToCartAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    summary="AddToCart API",
    
    tags=["Payment Gateway"],
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "product_id": {"type": "integer"},
                "quantity": {"type": "integer"},
            },
            "required": ["product_id"]
        }
    },
    responses={
        200: OpenApiTypes.OBJECT,
        201: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
    },
    )
   
    @transaction.atomic
    def post(self, request):
        try:
            custom_theme_id = request.data.get("custom_theme_id")
            if custom_theme_id:
                try:
                    custom_theme = CustomUpdateThemes.objects.get(id=custom_theme_id, user=request.user)
                except CustomUpdateThemes.DoesNotExist:
                    return Response({
                        "status": False,
                        "statusCode": 404,
                        "message": "Custom theme design not found"
                    }, status=status.HTTP_404_NOT_FOUND)

                if not custom_theme.theme:
                    return Response({
                        "status": False,
                        "statusCode": 404,
                        "message": "Associated theme not found for this customization."
                    }, status=status.HTTP_404_NOT_FOUND)

                from uniformAdmin.models import ThemeItem
                theme_items = ThemeItem.objects.filter(theme=custom_theme.theme).select_related('product')
                if not theme_items.exists():
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": "This theme has no products configured."
                    }, status=status.HTTP_400_BAD_REQUEST)

                cart, _ = Cart.objects.get_or_create(
                    user=request.user,
                    is_active=True,
                )

                added_items = []
                for theme_item in theme_items:
                    prod = theme_item.product
                    if not prod or not prod.isActive:
                        continue

                    item, created = CartItem.objects.select_for_update().get_or_create(
                        cart=cart,
                        product=prod,
                        custom_theme=custom_theme,
                        defaults={"quantity": 0}
                    )

                    new_quantity = item.quantity + 1
                    if new_quantity > prod.available_quantity:
                        new_quantity = max(prod.available_quantity, 1)

                    item.quantity = new_quantity
                    item.save()
                    added_items.append(item)

                serializer = CartItemSerializer(
                    added_items,
                    many=True,
                    context={"request": request}
                )

                return Response({
                    "status": True,
                    "statusCode": 201,
                    "message": "All theme products added to cart successfully.",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)

            product_id = request.data.get("product_id")
            quantity = request.data.get("quantity", 1)


            try:
                quantity = int(quantity)
            except (TypeError, ValueError):
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Quantity must be a valid number"
                }, status=status.HTTP_400_BAD_REQUEST)

            if quantity <= 0:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Quantity must be greater than 0"
                }, status=status.HTTP_400_BAD_REQUEST)

            product = get_object_or_404(Product, id=product_id)

            
            if not product.isActive:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Product is not active"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # product.available_quantity -= quantity
            # product.save()

            cart, _ = Cart.objects.get_or_create(
                user=request.user,
                is_active=True,
              
            )
            item, created = CartItem.objects.select_for_update().get_or_create(
                cart=cart,
                product=product,
                defaults={"quantity": 0}
            )

            new_quantity = item.quantity + quantity

            if new_quantity > product.available_quantity:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": "Not enough stock available"
                }, status=status.HTTP_400_BAD_REQUEST)

            item.quantity = new_quantity
            item.save()

            serializer = CartItemSerializer(
                item,
                context={"request": request}
            )
            if created:
                message = "Item added to cart successfully."
                status_code = status.HTTP_201_CREATED
            else:
                message = "Item already in cart. Quantity updated successfully."
                status_code = status.HTTP_200_OK

            return Response({
                "status": True,
                "statusCode": 201 if created else 200,
                "message": message,
                "data": serializer.data
            }, status=status_code)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CartListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    summary="CartList API",
    tags=["Payment Gateway"],
    responses={200: OpenApiTypes.OBJECT}
    )
    def get(self, request):
        try:
            cart = Cart.objects.filter(
                user=request.user,
                is_active=True
            ).first()

            if not cart:
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Cart is empty",
                    "count": 0,
                    "next": None,
                    "previous": None,
                    "data": []
                }, status=status.HTTP_200_OK)

            cart_items = CartItem.objects.select_related("product").filter(
                cart=cart,
                is_active=True
            ).order_by("id")

            if not cart_items.exists():
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Cart is empty",
                    "count": 0,
                    "next": None,
                    "previous": None,
                    "data": []
                }, status=status.HTTP_200_OK)

            paginator = CustomPagination()
            paginated_items = paginator.paginate_queryset(cart_items, request)

            serializer = CartItemSerializer(
                paginated_items,
                many=True,
                context={"request": request}
            )

            return paginator.get_paginated_response(serializer.data)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Something went wrong",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# UPDATE
class UpdateCartItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    summary="UpdateCartItem API",
    
    tags=["Payment Gateway"],
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "item_id": {"type": "integer"},
                "quantity": {"type": "integer"},
            },
            "required": ["item_id", "quantity"]
        }
    },
    responses={
        200: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
    },
    )
    def patch(self, request, id):
        try:
            quantity = request.data.get("quantity")

            if quantity is None:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Quantity is required"
                }, status=status.HTTP_400_BAD_REQUEST)

            quantity = int(quantity)

            # if quantity < 0:
            #     return Response({
            #         "status": False,
            #         "statusCode": 400,
            #         "message": "Quantity cannot be negative"
            #     }, status=status.HTTP_400_BAD_REQUEST)

            item = CartItem.objects.select_related("product").get(
                id=id,
                cart__user=request.user,
                cart__is_active=True,
                is_active=True
            )

            if quantity > item.product.available_quantity:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": f"Only {item.product.available_quantity} items available in stock"
                }, status=status.HTTP_400_BAD_REQUEST)

            if quantity == 0:
                item.delete()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Item removed from cart"
                }, status=status.HTTP_200_OK)

            item.quantity += quantity
            item.save()

            serializer = CartItemSerializer(
                item,
                context={'request': request}
            )

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Cart item quantity updated successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except CartItem.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "error": "Cart item not found"
            }, status=status.HTTP_404_NOT_FOUND)

        except ValueError:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Quantity must be a valid number"
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "error": "Something went wrong",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   
# Delete
class RemoveCartItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Remove Cart Item API",
        tags=["Payment Gateway"],
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "item_id": {"type": "integer"}
                },
                "required": ["item_id"]
            }
        },
        responses={
            200: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT,
        },
    )
    def delete(self, request, id):
        try:
            if not id:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Item ID is required"
                }, status=status.HTTP_400_BAD_REQUEST)

            item = CartItem.objects.get(
                id=id,
                cart__user=request.user,
                cart__is_active=True
            )

            # Restore product quantity
            product = item.product
            product.available_quantity += item.quantity
            product.save(update_fields=["available_quantity"])

            # Hard delete
            item.delete()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Item removed from cart successfully"
            }, status=status.HTTP_200_OK)

        except CartItem.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Item not found"
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "error": "Something went wrong",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClearCartAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def delete(self, request):
        try:
            cart = Cart.objects.filter(
                user=request.user,
                is_active=True
            ).first()

            if not cart:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "No active cart found."
                }, status=status.HTTP_404_NOT_FOUND)
            
            active_items = cart.items.filter(is_active=True)
            items_count = active_items.count()

            if items_count>0: 
                for item in active_items:
                    product = item.product
                    product.available_quantity += item.quantity
                    product.save()

                active_items.delete()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Cart cleared successfully",
                "items_cleared": items_count,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Something went wrong",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   

class ItemSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    summary="ItemSummary API",
    
    tags=["Payment Gateway"],
    responses={
        200: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT,
    },
    )
    def get(self, request):
        try:
            cart = Cart.objects.filter(
                user=request.user,
                is_active=True
            ).first()
            print("Cart:", cart)

            if not cart:
                return Response({
                    "status": False,
                    "statusCode":200,
                    "message": "Cart is empty",
                    "items": [],
                    "summary": {}
                }, status=status.HTTP_200_OK)

            cart_items = CartItem.objects.select_related("product").filter(
                cart=cart,
                is_active=True
            )

            items = []
            subtotal = 0
            total_discount = 0
            total_items = 0

            for item in cart_items:

                original_total = item.price * item.quantity
                discounted_total = item.final_price * item.quantity
                discount_amount = original_total - discounted_total

                subtotal += discounted_total
                total_discount += discount_amount
                total_items += item.quantity 

                items.append({
                    "product_id": item.product.id,
                    "product_name": item.product.productName,
                    # "product_image": item.product.ProductImage.url if item.product.ProductImage else None,
                    "product_image": new_build_media_url(item.product.ProductImage),
                    "quantity": item.quantity,
                    "unit_price": item.price,
                    "final_price": item.final_price,
                    "total_price": discounted_total,
                    "discount": discount_amount
                })

            shipping = cart.shipping_amount if hasattr(cart, "shipping_amount") else 0
            tax = cart.tax_amount if hasattr(cart, "tax_amount") else 0
            fees = cart.fees_amount if hasattr(cart, "fees_amount") else 0

            grand_total = subtotal + shipping + tax + fees
            total_products = cart_items.count()

            return Response({
                "status": True,
                "statusCode":200,
                "items": items,
                "items_count": total_products, 
                "summary": {
                    "subtotal": subtotal,
                    "total_items": total_items,
                    "discount": total_discount,
                    "shipping": shipping,
                    "tax": tax,
                    "fees": fees,
                    "grand_total": grand_total
                }
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Something went wrong",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    
class CustomerDetailsRetrieveAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            customer = CustomerDetails.objects.filter(user=user, isDeleted=False).first()
            if customer:
                serializer = CustomerDetailsSerializer(customer)
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Customer details retrieved successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            return Response({
                "status": False,
                "statusCode": 200,
                "message": "Customer details not found"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Something went wrong",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreateOrderAPIView(APIView):
    @transaction.atomic
    def post(self, request):
        try:
            user = request.user
            data = request.data

            cart_id = data.get("cart_id")
            if not cart_id:
                return Response({
                    "status": False,
                    "statusCode": 400, 
                    "message": "cart_id is required"
                    }, status=status.HTTP_400_BAD_REQUEST)

            cart = Cart.objects.filter(id=cart_id, user=user, is_active=True).first()
            
            # existing_order = Order.objects.filter(
            #     cart=cart,
            #     user=user,
            #     status__in=["pending", "processing"]
            # ).first()
            
            existing_order = Order.objects.filter(
                user=user,
                cart=cart,
                is_paid=False
            ).first()

            if existing_order:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Order already exists for this cart. Please complete payment."
                }, status=status.HTTP_400_BAD_REQUEST)
            if not cart or not cart.items.exists():
                return Response({
                    "status": False,
                    "statusCode": 404, 
                    "message": "Cart not found or empty"}, status=status.HTTP_404_NOT_FOUND)
            try:
                start_date = datetime.strptime(data.get("rental_start_date"), "%Y-%m-%d").date()
                end_date = datetime.strptime(data.get("rental_end_date"), "%Y-%m-%d").date()
            except:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Invalid date format. Use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)

            if end_date < start_date:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Rental end date cannot be before start date"
                    }, status=status.HTTP_400_BAD_REQUEST)

            rental_days = (end_date - start_date).days

            customer_data = data.get("customer")
            customer_id = data.get("customer_id")
            customer = None

            if customer_id:
                customer = CustomerDetails.objects.filter(id=customer_id, user=user).first()
                if not customer:
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": "Invalid customer_id"}, status=status.HTTP_400_BAD_REQUEST)
                    
                    
            elif customer_data:
                delivery = data.get("delivery_address", {})

                customer, created = CustomerDetails.objects.update_or_create(
                    user=user,
                    defaults={
                        "email": customer_data.get("email"),
                        "first_name": customer_data.get("first_name"),
                        "last_name": customer_data.get("last_name"),
                        "phone": customer_data.get("phone"),
                        "address_line_1": delivery.get("address_line_1"),
                        "address_line_2": delivery.get("address_line_2", ""),
                        "city": delivery.get("city"),
                        "postal_code": delivery.get("postal_code"),
                        "country": delivery.get("country"),
                        "payment_method": data.get("payment_method", "stripe") or "stripe",
                    }
                )        
                               
            
            else:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Customer info is required"
                    },status=status.HTTP_400_BAD_REQUEST)

            subtotal_day = sum([Decimal(item.total_price or 0) for item in cart.items.all()])
            subtotal = subtotal_day * rental_days

            # ------------------- Promocode -------------------
            # promocode_code = data.get("promocode", "").strip()
            promocode = data.get("promocode")
            currency = data.get("currency") or "USD"

            if isinstance(promocode, dict):
                promocode_code = promocode.get("code", "").strip()
            elif isinstance(promocode, str):
                promocode_code = promocode.strip()
            else:
                promocode_code = ""
            promo_discount = Decimal("0.00")
            applied_promo = None

            if promocode_code:
                promo = Promocode.objects.filter(
                    promocodeName__iexact=promocode_code,
                    isActive=True,
                    isDeleted=False
                ).first()

                if not promo:
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": "Promocode not found"
                    })

                now = timezone.now()

                if promo.started_at and promo.started_at > now:
                    return Response({
                        "status": False,
                        "message": "Promocode not started yet"
                    })

                if promo.ended_at and promo.ended_at < now:
                    return Response({
                        "status": False,
                        "message": "Promocode expired"
                    })

                if promo.promocodeType == "discount":
                    promo_discount = (subtotal * promo.amount) / 100

                elif promo.promocodeType == "fix_price":
                    promo_discount = promo.amount

                if promo_discount >= subtotal:
                    return Response({
                        "status": False,
                        "message": "Discount exceeds subtotal"
                    })

                applied_promo = promo
           
            # Corporate / B2B special condition discount
            corporate_discount = Decimal("0.00")
            if user.role and user.role.role_name == "corporate":
                from uniformAdmin.models import SpecialCondition
                cond = SpecialCondition.objects.filter(condition_type="corporate", is_active=True, is_deleted=False).first()
                if cond:
                    corporate_discount = (subtotal * Decimal(cond.discount_percentage)) / 100

            discount_amount = promo_discount + corporate_discount
            if discount_amount >= subtotal:
                return Response({
                    "status": False,
                    "message": "Total discount exceeds subtotal"
                })

            shipping_charge = getattr(settings, 'FLAT_ROUND_TRIP_SHIPPING_FEE', Decimal("150.00"))
            taxable_amount = subtotal - discount_amount + shipping_charge
            if taxable_amount < 0:
                taxable_amount = Decimal("0.00")
            tax_amount = (taxable_amount * Decimal("10")) / Decimal("100")
            total_amount = subtotal - discount_amount + shipping_charge + tax_amount

            # Check if any cart item has an associated custom theme
            custom_theme = None
            for item in cart.items.all():
                if item.custom_theme:
                    custom_theme = item.custom_theme
                    break

            order = Order.objects.create(
                user=user,
                cart=cart,
                customer=customer,
                rental_start_date=start_date,
                rental_end_date=end_date,
                rental_days=rental_days,
                subtotal=subtotal,
                total_amount=total_amount,
                shipping_charge=shipping_charge,
                tax=tax_amount,
                currency=currency,
                promocode=applied_promo,
                custom_theme=custom_theme,
            )

            order_items = []
            for item in cart.items.all():
                line_total = Decimal(item.total_price or 0) * rental_days
                order_item = OrderItem(
                    order=order,
                    product=item.product,
                    rental_days=rental_days,
                    quantity=item.quantity,
                    price_per_day=Decimal(item.final_price or 0),
                    subtotal=line_total,
                    custom_theme=item.custom_theme,
                )
                order_items.append(order_item)

            OrderItem.objects.bulk_create(order_items)
            for item in cart.items.all():
                product = item.product
                product.available_quantity -= item.quantity
                if product.available_quantity < 0:
                    product.available_quantity = 0
                product.save()

            # Create Rental and RentalItems so they show up as "On Rent" in inventory
            from userhub.models import Rental, RentalItem
            rental = Rental.objects.create(
                order=order,
                customer=order.customer,
                start_date=order.rental_start_date,
                end_date=order.rental_end_date,
                shipping_address=getattr(order.customer, "address_line_1", "") or getattr(order.customer, "address", "") or "No Address",
                shipping_fee=order.shipping_charge or 0,
                tax=order.tax or 0,
                total_amount=order.total_amount or 0,
                status='rented'
            )
            for item in order_items:
                RentalItem.objects.create(
                    rental=rental,
                    product=item.product,
                    quantity=item.quantity,
                    price_per_day=item.price_per_day or 0,
                    subtotal=item.subtotal or 0
                )
                
                
            # Clear the cart after order creation
            # cart.items.all().delete()      # remove all cart items
            # cart.is_active = False         # deactivate this cart
            # cart.save(update_fields=["is_active"])    
            cart.items.all().delete()
            cart.delete()

            response_data = {
                "order_id": order.order_id,
                "order_status":order.status,
                "customer": {
                    "id": customer.id,
                    "first_name": customer.first_name,
                    "last_name": customer.last_name,
                    "email": customer.email,
                    "phone": customer.phone
                },
                "delivery_address": {
                    "address_line1": customer.address_line_1,
                    "address_line2": customer.address_line_2,
                    "city": customer.city,
                    "postal_code": customer.postal_code,
                    "country": customer.country
                },
                "rental_period": {
                    "start_date": start_date.strftime("%Y-%m-%d"),
                    "end_date": end_date.strftime("%Y-%m-%d"),
                    "duration_days": rental_days
                },
                "order_items": [
                    {
                        "product_id": item.product.id,
                        "product_name": item.product.productName,
                        "product_image": item.product.ProductImage.url if item.product.ProductImage else None,
                        "quantity": item.quantity,
                        "price_per_day": str(item.price_per_day),
                        "total_price": str(item.subtotal)
                    } for item in order.items.all()
                ],
                "order_summary": {
                    # "status":order.status,
                    "subtotal": str(subtotal),
                    "promo_discount": str(promo_discount),
                    "tax": str(tax_amount),
                    "shipping_charge": str(shipping_charge),
                    "total_amount": str(total_amount)
                },
                "promocode": promocode_code or None,
            }
            # Create Contract
            import uuid
            contract_id_str = f"CTR-{uuid.uuid4().hex[:8].upper()}"
            company_name_val = data.get("company_name") or (customer_data.get("company_name") if customer_data else None) or f"{customer.first_name} {customer.last_name}"
            contact_person_val = f"{customer.first_name} {customer.last_name}"
            additional_note_val = data.get("additional_note") or ""

            contract = Contract.objects.create(
                contract_id=contract_id_str,
                order=order,
                company_name=company_name_val,
                contact_person=contact_person_val,
                email=customer.email,
                phone_number=customer.phone,
                delivery_date=start_date,
                additional_note=additional_note_val,
                workflow_status="REQUESTED",
                contract_status="pending"
            )

            # Generate contract PDF
            from userhub.utils import generate_contract_pdf
            try:
                pdf_path = generate_contract_pdf(contract, request)

                # Send via CloudSign
                from userhub.cloudsign import send_contract_via_cloudsign
                document_id = send_contract_via_cloudsign(contract, pdf_path)
                
                contract.external_document_id = document_id
                contract.workflow_status = "SENT"
                contract.contract_status = "sent"
                contract.save()

                # Audit Log
                ContractAuditLog.objects.create(
                    contract=contract,
                    action="SENT_VIA_CLOUDSIGN",
                    description=f"Contract sent via CloudSign. Document ID: {document_id}"
                )

                # Notification
                from uniformAdmin.utils import create_admin_notification
                create_admin_notification(
                    instance=contract,
                    title=f"Contract {contract.contract_id} Sent",
                    message=f"Contract for Order {order.order_id} has been sent to client.",
                    priority="high"
                )
            except Exception as cs_err:
                logger.error(f"Failed to generate or send contract: {str(cs_err)}")
                # Audit Log
                ContractAuditLog.objects.create(
                    contract=contract,
                    action="SEND_FAILED",
                    description=f"Failed to generate or send contract. Error: {str(cs_err)}"
                )

            send_order_confirmation_email(
                        request.user,
                        order,
                        start_date,
                        end_date,
                        total_amount
                    )
                
            return Response({
                "status": True,
                "statusCode": 201,
                "message": "Order created successfully",
                "data": response_data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "error": "Internal server error.",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OrderSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]
    @extend_schema(
        summary="OrderSummary API",
        
        tags=["Payment Gateway"],
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string"}
                },
                "required": ["order_id"]
            }
        },
        responses={
            200: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT,
        },
        )
    def post(self, request):
        order_id = request.data.get("order_id")
        if not order_id:
            return Response(
                {"error": "Order ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order_id = order_id or request.data.get("order_id")
            if not order_id:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Order ID is required."
                    },status=status.HTTP_400_BAD_REQUEST)
            
            try:
                order = Order.objects.get(order_id=order_id, user=request.user)
            except Order.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "Order not found."
                    },status=status.HTTP_404_NOT_FOUND)

            customer = order.customer
            order_items = order.items.all()

            items_list = []
            for item in order_items:
                items_list.append({
                    "name": item.product.productName,
                    "quantity": item.quantity,
                    "price_per_day": str(Decimal(item.price_per_day)),
                    "total_price": str(Decimal(item.subtotal)),
                    "product_image": request.build_absolute_uri(item.product.ProductImage.url) if item.product.ProductImage else None
                })

            rental_days = (order.rental_end_date - order.rental_start_date).days if order.rental_start_date and order.rental_end_date else 0
            subtotal = Decimal(order.subtotal or sum(item.subtotal for item in order_items))
            shipping = Decimal(order.shipping_charge or 0)
            tax = Decimal(order.tax or 0)
            total_amount = Decimal(order.total_amount)

            response_data = {
                "contact_information": {
                    "name": f"{customer.first_name} {customer.last_name}" if customer else None,
                    "email": customer.email if customer else None,
                    "phone": customer.phone if customer else None
                },
                "delivery_address": {
                    "address_line_1": customer.address_line_1 if customer else None,
                    "address_line_2": customer.address_line_2 if customer else None,
                    "city": customer.city if customer else None,
                    "postal_code": customer.postal_code if customer else None,
                    "country": customer.country if customer else None
                },
                "rental_period": {
                    "start": order.rental_start_date.strftime("%Y-%m-%d") if order.rental_start_date else None,
                    "end": order.rental_end_date.strftime("%Y-%m-%d") if order.rental_end_date else None,
                    "duration": f"{rental_days} days"
                },
                "order_items": items_list,
                "order_summary": {
                    "subtotal": str(subtotal),
                    "shipping": str(shipping),
                    "tax": str(tax),
                    "promocode": order.promocode.promocodeName if order.promocode else None,
                    "amount": str(order.promocode.amount) if order.promocode else None,
                    "total": str(total_amount)
                }
            }
            return Response(
                { "status": True,
                  "statusCode": 200,
                  "message": "Order summary fetched successfully", 
                  "data": response_data},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response({
                    "status": False,
                    "statusCode": 500,
                    "error": "Something went wrong while fetching order summary.",
                    "details": str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework import status

from uniformAdmin.models import Product
from userhub.models import OrderItem

class ProductOrderListAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        try:
            product = Product.objects.filter(
                id=product_id,
                isDeleted=False
            ).first()

            if not product:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "Product not found."
                }, status=status.HTTP_404_NOT_FOUND)

            order_items = (
                OrderItem.objects
                .filter(product_id=product_id)
                .select_related("order", "order__customer", "product")
                .order_by("-order__created_at")
            )

            serializer = ProductOrderListSerializer(order_items, many=True)

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Product orders fetched successfully.",
                "count": order_items.count(),
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Something went wrong.",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            

from rest_framework.pagination import PageNumberPagination
class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class UserOrderListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user

            status_filter = request.query_params.get("status")
            search = request.query_params.get("search")

            orders = Order.objects.filter(
                user=user,
                is_active=True,
                is_deleted=False
            )

            # Filter by status
            if status_filter:
                orders = orders.filter(status__iexact=status_filter)

            # Search
            if search:
                orders = orders.filter(
                    Q(order_id__icontains=search) |
                    # Q(status__icontains=search)
                    # Add more searchable fields if required
                    Q(customer__first_name__icontains=search) |
                    Q(customer__last_name__icontains=search)
                )

            orders = orders.order_by("-created_at")

            if not orders.exists():
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "No orders found for this user",
                    "data": []
                }, status=status.HTTP_200_OK)

            paginator = CustomPagination()
            paginated_orders = paginator.paginate_queryset(orders, request)

            # serializer = OrderSerializer(paginated_orders, many=True)
            serializer = OrderSerializer(
                paginated_orders,
                many=True,
                context={"request": request}
            )

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Orders fetched successfully",
                "data": serializer.data,
                "pagination": {
                    "current_page": paginator.page.number,
                    "page_size": paginator.get_page_size(request),
                    "total_pages": paginator.page.paginator.num_pages,
                    "total_records": paginator.page.paginator.count,
                    "has_next": paginator.page.has_next(),
                    "has_previous": paginator.page.has_previous(),
                    "next_page": paginator.page.next_page_number() if paginator.page.has_next() else None,
                    "previous_page": paginator.page.previous_page_number() if paginator.page.has_previous() else None,
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "error": "Something went wrong while fetching orders.",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
              
# views.py
class OrderDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    @extend_schema(
        summary="OrderDetail API",
        tags=["Payment Gateway"],
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string"}
                },
                "required": ["order_id"]
            }
        },
        responses={
            200: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT,
        },
        )

    def post(self, request, order_id=None):
        order_id = request.data.get("order_id")

        if not order_id:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "order_id is required",
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            if not order_id:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "order_id is required",
                    "data": {}
                }, status=status.HTTP_400_BAD_REQUEST)

            order = Order.objects.filter(order_id=order_id, user=request.user, is_active=True, is_deleted=False).first()
            if not order:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "Order not found",
                    "data": {}
                }, status=status.HTTP_404_NOT_FOUND)

   
            serializer = userOrderSerializer(
                order,
                context={"request": request}
            )
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Order fetched successfully",
                "data": serializer.data
            }) 
        except Exception as e:
            return Response(
                {
                    "status": False,
                    "statusCode": 500,
                    "error": "Something went wrong while fetching order.",
                    "details": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserCancelOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(
                order_id=order_id,
                customer__user=request.user,
                is_active=True,
                is_deleted=False
            )
        except Order.DoesNotExist:
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Order not found"
            }, status=status.HTTP_404_NOT_FOUND)

        if order.status.lower() == "cancelled":
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Order already cancelled. You cannot cancel again."
            }, status=status.HTTP_400_BAD_REQUEST)


        today = timezone.now().date()
        if order.rental_start_date:
            days_until_start = (order.rental_start_date - today).days
            if days_until_start < 5:
                return Response({
                    "statusCode": 400,
                    "status": False,
                    "message": "Cancellations are only permitted up to 5 days before the scheduled rental date."
                }, status=status.HTTP_400_BAD_REQUEST)

        if order.status in ["delivered", "out_for_delivery"]:
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Order already shipped/delivered. Cannot cancel."
            }, status=status.HTTP_400_BAD_REQUEST)

        reason = request.data.get("reason")

        if not reason:
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Cancel reason is required"
            }, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            for item in order.items.select_related("product"):
                item.product.available_quantity += item.quantity
                item.product.save()

            order.status = "cancelled"
            order.cancel_reason = reason
            order.cancelled_by = "customer"
            order.save()

            # Delete the associated Rental if it exists
            if hasattr(order, 'rental') and order.rental:
                order.rental.delete()

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Order cancelled successfully"
        }, status=status.HTTP_200_OK)

class ReturnOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        try:
            order_id = request.data.get("order_id")
            return_items = request.data.get("items", [])

            if not order_id:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "order_id is required."
                }, status=status.HTTP_400_BAD_REQUEST)

            if not return_items:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "No items provided for return."
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                order = Order.objects.select_related("customer", "rental").get(
                    order_id=order_id,
                    customer__user=request.user,
                    is_active=True,
                    is_deleted=False
                )
            except Order.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "Order not found."
                }, status=status.HTTP_404_NOT_FOUND)

            rental = getattr(order, "rental", None)
            if not rental:
                rental = Rental.objects.create(
                    order=order,
                    customer=order.customer,
                    start_date=order.rental_start_date,
                    end_date=order.rental_end_date,
                    shipping_address=getattr(order.customer, "address", ""),
                    shipping_fee=order.shipping_charge or 0,
                    tax=order.tax or 0,
                    total_amount=order.total_amount or 0,
                    status='rented'
                )
                for item in order.items.all():
                    RentalItem.objects.create(
                        rental=rental,
                        product=item.product,
                        quantity=item.quantity,
                        price_per_day=item.price_per_day,
                        subtotal=item.subtotal
                    )

            # if order.status != "delivered":
            #     return Response({
            #         "status": False,
            #         "statusCode": 400,
            #         "error": "Return allowed only after delivery."
            #     }, status=status.HTTP_400_BAD_REQUEST)

            today = timezone.now().date()
            # if today < rental.end_date:
            #     return Response({
            #         "status": False,
            #         "statusCode": 400,
            #         "error": "Return allowed only after rental end date."
            #     }, status=status.HTTP_400_BAD_REQUEST)

            # Grace period logic: day 4 is first late day (i.e. late_days = overdue - 3)
            days_overdue = (today - rental.end_date).days
            if days_overdue <= 3:
                late_days = 0
            else:
                late_days = days_overdue - 3

            total_late_fee = Decimal("0.00")
            total_lost_fee = Decimal("0.00")

            for item_data in return_items:
                product_id = item_data.get("product_id")
                returned_qty = int(item_data.get("quantity", 0))

                if returned_qty <= 0:
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": "Invalid return quantity."
                    }, status=status.HTTP_400_BAD_REQUEST)

                try:
                    rental_item = RentalItem.objects.select_related("product").get(
                        rental=rental,
                        product_id=product_id
                    )
                except RentalItem.DoesNotExist:
                    return Response({
                        "status": False,
                        "statusCode": 404,
                        "message": f"Rental item not found for product {product_id}."
                    }, status=status.HTTP_404_NOT_FOUND)

                if rental_item.returned_quantity + returned_qty > rental_item.quantity:
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": "Return quantity exceeds rented quantity."
                    }, status=status.HTTP_400_BAD_REQUEST)

                # RFID Tracking validation
                is_napkin = rental_item.product.type == "napkin" or "napkin" in rental_item.product.productName.lower()
                rfid_tag = item_data.get("rfid_tag")
                if not is_napkin:
                    if rfid_tag:
                        rental_item.rfid_tag = rfid_tag
                    elif not rental_item.rfid_tag:
                        import uuid
                        rental_item.rfid_tag = f"RFID-{uuid.uuid4().hex[:8].upper()}"

                rental_item.returned_quantity += returned_qty
                if rental_item.returned_quantity == rental_item.quantity:
                    rental_item.is_returned = True
                rental_item.save()



                # Dynamic Late Fee: rental price per item/day * late days * returned quantity
                late_fee = Decimal(late_days) * rental_item.price_per_day * Decimal(returned_qty)
                total_late_fee += late_fee

                remaining_qty = rental_item.quantity - rental_item.returned_quantity
                if remaining_qty > 0:
                    rental_days = max((rental.end_date - rental.start_date).days, 1)
                    lost_fee = rental_item.price_per_day * rental_days * remaining_qty
                    total_lost_fee += lost_fee

            order.total_amount += (total_late_fee + total_lost_fee)
            
            rental.late_fee += total_late_fee
            rental.lost_fee += total_lost_fee
            rental.total_amount += (total_late_fee + total_lost_fee)

            if all(item.is_returned for item in rental.items.all()):
                rental.status = "returned"
            elif any(item.returned_quantity > 0 for item in rental.items.all()):
                rental.status = "partial_return"
            rental.save()
           
            order.status = "returned"
            order.is_returned = True
            order.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Return processed successfully",
                "late_fee": float(total_late_fee),
                "lost_fee": float(total_lost_fee),
                "final_total_amount": float(order.total_amount),
                "order_status": order.status,
                "rental_id": rental.rental_id,
                "rental_status": rental.status
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                    "status": False,
                    "statusCode": 500,
                    "details": str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserQuotationStatusUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["UserHub · QuotationStatusUpdate"],
    summary="Cancel quotation (User)",
    description=(
        "Allows **normal/user** to cancel a quotation.\n\n"
        "**Rules:**\n"
        "- Only `cancel` action is allowed\n"
        "- Cancellation reason is mandatory\n"
        "- Admin / other roles are forbidden"
    ),
    request={
        "application/json": {
            "type": "object",
            "required": ["quotation_id", "action", "reason"],
            "properties": {
                "quotation_id": {
                    "type": "string",
                    "example": "QT-2024-001"
                },
                "action": {
                    "type": "string",
                    "enum": ["cancel"],
                    "example": "cancel"
                },
                "reason": {
                    "type": "string",
                    "example": "Budget constraints"
                }
            }
        }
    },
    responses={
        200: OpenApiResponse(description="Quotation cancelled successfully"),
        400: OpenApiResponse(description="Validation or quotation error"),
        403: OpenApiResponse(description="Unauthorized user role"),
        401: OpenApiResponse(description="Authentication required"),
    },
    examples=[
        OpenApiExample(
            "Cancel Quotation Example",
            value={
                "quotation_id": "QT-2024-001",
                "action": "cancel",
                "reason": "Budget constraints"
            },
            request_only=True
        )
    ]
)

    def post(self, request):
        quotation_id = request.data.get("quotation_id")
        action = request.data.get("action")
        user = request.user
        user_role = user.role.role_name if user.role else None

        # Only normal/user role allowed
        if not user_role or user_role.lower() not in ["user", "normal"]:
            return Response({
                "statusCode": 403,
                "status": False,
                "error": "Unauthorized. Only normal users can cancel."
            }, status=status.HTTP_403_FORBIDDEN)

        # Fetch quotation
        try:
            quotation = QuotationRequest.objects.get(quotation_id=quotation_id)
        except QuotationRequest.DoesNotExist:
            return Response({
                "statusCode": 400,
                "status": False,
                "error": "Quotation not found"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Only cancel allowed
        if action != "cancel":
            return Response({
                "statusCode": 400,
                "status": False,
                "error": "Only cancel action is allowed."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Reason required
        reason = request.data.get("reason")
        if not reason:
            return Response({
                "statusCode": 400,
                "status": False,
                "error": "Cancellation reason is required"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Cancel quotation
        quotation.quotation_status = "cancelled"
        quotation.cancel_reason = reason
        quotation.cancelled_by = user_role
        quotation.save()

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Quotation cancelled successfully",
            "cancelled_by": user_role
        }, status=status.HTTP_200_OK)
         

#<-----------save quotation-------------->
#<-----------save quotation using CloudSign-------------->
def send_quotation_contract(quotation):
    from userhub.cloudsign import send_cloudsign_contract
    pdf_path = quotation.pdf_file.path
    document_id = send_cloudsign_contract(quotation, pdf_path)
    # SAVE IN DB
    quotation.external_document_id = document_id
    quotation.save()

    return document_id

#<----------------CloudSign WebHook---------------->
class CloudSignWebhookAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        print("CLOUDSIGN WEBHOOK DATA:", data)

        document_id = data.get("document_id") or data.get("documentId") or data.get("id")
        status_event = data.get("status") or data.get("event")

        if not document_id:
            return Response({"statusCode": 400, "status": False, "message": "No document id provided"}, status=400)

        status_event = (status_event or "").lower()

        # 1. Search for Contract first
        contract = Contract.objects.filter(external_document_id=document_id).first()
        if contract:
            if "sent" in status_event:
                contract.workflow_status = "SENT"
                contract.contract_status = "sent"
                contract.save()
                ContractAuditLog.objects.create(
                    contract=contract,
                    action="SENT",
                    description="Contract document status updated to sent by CloudSign webhook."
                )
            elif "completed" in status_event or "signed" in status_event:
                contract.workflow_status = "SIGNED"
                contract.contract_status = "signed"
                contract.is_signed = True
                contract.signed_at = now()

                # Fetch signed PDF
                from userhub.cloudsign import download_signed_pdf
                try:
                    pdf_bytes = download_signed_pdf(document_id)
                    contract.signed_pdf.save(
                        f"{contract.contract_id}_signed.pdf",
                        ContentFile(pdf_bytes)
                    )
                    ContractAuditLog.objects.create(
                        contract=contract,
                        action="SIGNED",
                        description=f"Contract signed via CloudSign. Signed PDF downloaded successfully."
                    )
                except Exception as e:
                    ContractAuditLog.objects.create(
                        contract=contract,
                        action="SIGNED_PDF_DOWNLOAD_FAILED",
                        description=f"Contract signed via CloudSign but signed PDF download failed. Error: {str(e)}"
                    )

            elif "declined" in status_event or "rejected" in status_event:
                contract.workflow_status = "DECLINED"
                contract.contract_status = "cancelled"
                contract.save()
                ContractAuditLog.objects.create(
                    contract=contract,
                    action="DECLINED",
                    description="Contract was declined/rejected by the participant."
                )

            contract.save()
            return Response({"statusCode": 201, "status": True, "message": "CloudSign webhook processed for contract"}, status=201)

        # 2. Fallback to QuotationRequest
        try:
            quotation = QuotationRequest.objects.get(external_document_id=document_id)

            if "sent" in status_event:
                quotation.workflow_status = "SENT"

            elif "completed" in status_event or "signed" in status_event:
                quotation.workflow_status = "SIGNED"
                quotation.is_signed = True
                quotation.signed_at = now()

                # Fetch signed PDF
                from userhub.cloudsign import download_signed_pdf
                pdf_bytes = download_signed_pdf(document_id)

                # Save PDF
                quotation.signed_pdf.save(
                    f"{quotation.quotation_id}_signed.pdf",
                    ContentFile(pdf_bytes)
                )

                # Notification
                create_admin_notification(
                    instance=quotation,
                    title=f"Quotation {quotation.quotation_id} Signed",
                    message=f"{quotation.contact_person} has signed the CloudSign contract",
                    priority="high"
                )

                # Email Alert
                mail = EmailMessage(
                    subject=f"CloudSign Contract Signed - {quotation.quotation_id}",
                    body=f"""
                    Hello Admin,

                    Great news! A client has successfully signed the contract via CloudSign.

                    ----------------------------------------
                    QUOTATION DETAILS
                    ----------------------------------------
                    Quotation ID : {quotation.quotation_id}
                    Company Name : {quotation.company_name}
                    Client Name  : {quotation.contact_person}
                    Client Email : {quotation.email}
                    Phone Number : {quotation.phone_number}

                    ----------------------------------------
                    STATUS
                    ----------------------------------------
                    Contract Status : SIGNED
                    Signed At       : {quotation.signed_at.strftime("%d %B %Y, %I:%M %p")}
                    ----------------------------------------

                    You can now proceed with further processing.

                    Thanks,
                    KIREIZ SPACE System
                    """,
                    from_email=settings.EMAIL_HOST_USER,
                    to=["rt61240@gmail.com"]
                )

                if quotation.signed_pdf:
                    quotation.signed_pdf.seek(0)
                    mail.attach(
                        quotation.signed_pdf.name,
                        quotation.signed_pdf.read(),
                        'application/pdf'
                    )

                mail.send(fail_silently=False)

            elif "declined" in status_event or "rejected" in status_event:
                quotation.workflow_status = "DECLINED"

            quotation.save()
            return Response({"statusCode": 201, "status": True, "message": "CloudSign webhook processed"}, status=201)

        except QuotationRequest.DoesNotExist:
            return Response({"statusCode": 400, "status": False, "message": "Document not found in contracts or quotations"}, status=400)

# #<----------------WebHook---------------->
# class DocuSignWebhookAPIView(APIView):
#     permission_classes = []

#     def post(self, request):
#         data = request.data
#         print("WEBHOOK DATA:", data)

#         envelope_id = data.get("envelopeId")
#         status = data.get("status")

#         if not envelope_id:
#             return Response({
#                 "statusCode":400,
#                 "status":False,
#                 "message": "No envelope id"
#                 },status=400)

#         try:
#             quotation = QuotationRequest.objects.get(
#                 external_document_id=envelope_id
#             )

#             status = status.lower()

#             # ---------------- STATUS HANDLING ----------------
#             if status == "sent":
#                 quotation.workflow_status = "SENT"

#             elif status == "completed":
#                 quotation.workflow_status = "SIGNED"
                
#                 #  ADMIN NOTIFICATION
#                 create_admin_notification(
#                     instance=quotation,
#                     title=f"Quotation {quotation.quotation_id} Signed",
#                     message=f"{quotation.contact_person} has signed contract",
#                     priority="high"
#                 )

           
#                 send_mail(
                    
#                     subject=f"Contract Signed - {quotation.quotation_id}",
#                     message=f"""
#                 Hello Admin,

#                 Great news! A client has successfully signed the contract.

#                 ----------------------------------------
#                 QUOTATION DETAILS
#                 ----------------------------------------

#                 Quotation ID : {quotation.quotation_id}
#                 Company Name : {quotation.company_name}
#                 Client Name  : {quotation.contact_person}
#                 Client Email : {quotation.email}
#                 Phone Number : {quotation.phone_number}

#                 ----------------------------------------
#                 STATUS
#                 ----------------------------------------

#                 Contract Status : SIGNED
#                 Signed At       : {now().strftime("%d %B %Y, %I:%M %p")}

#                 ----------------------------------------

#                 You can now proceed with further processing.

#                 Thanks,
#                 Uniform System
#                 """,
#                     from_email=settings.EMAIL_HOST_USER,
#                     recipient_list=["rt61240@gmail.com"],
#                     fail_silently=False,
#                 )
                

#             elif status == "declined":
#                 quotation.workflow_status = "DECLINED"

#             quotation.save()

#             return Response({
#                 "statusCode":201,
#                 "status":True,
#                 "message": "Webhook processed",
#                 },status=201)

#         except QuotationRequest.DoesNotExist:
#             return Response({
#                 "statusCode":400,
#                 "status":False,
#                 "message": "Quotation not found"
#                 }, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class DocuSignWebhookAPIView(APIView):
    permission_classes = []

    def post(self, request):
        data = request.data
        print("WEBHOOK DATA:", data)

        envelope_id = data.get("envelopeId")
        status = data.get("status")
        
        
        if not envelope_id:
            return Response({"statusCode":400,"status":False,"message": "No envelope id"}, status=400)

        try:
            quotation = QuotationRequest.objects.get(external_document_id=envelope_id)
            status = status.lower()

            if status == "sent":
                quotation.workflow_status = "SENT"

            elif status == "completed":
                quotation.workflow_status = "SIGNED"
                quotation.is_signed = True
                quotation.signed_at = now()

                # ---------------- FETCH SIGNED PDF ----------------
                access_token = get_docusign_token()
                api_client = ApiClient()
                api_client.host = "https://demo.docusign.net/restapi"
                api_client.set_default_header("Authorization", f"Bearer {access_token}")

                envelopes_api = EnvelopesApi(api_client)

                pdf_bytes = envelopes_api.get_document(
                    account_id=settings.DOCUSIGN_ACCOUNT_ID,
                    envelope_id=envelope_id,
                    document_id="combined"   # <-- use combined document
                )

                # Save PDF
                quotation.signed_pdf.save(
                    f"{quotation.quotation_id}_signed.pdf",
                    ContentFile(pdf_bytes)
                )

                # ---------------- NOTIFICATION ----------------
                create_admin_notification(
                    instance=quotation,
                    title=f"Quotation {quotation.quotation_id} Signed",
                    message=f"{quotation.contact_person} has signed contract",
                    priority="high"
                )

                # ---------------- EMAIL ----------------
                mail = EmailMessage(
                    subject=f"Contract Signed - {quotation.quotation_id}",
                    body=f"""
                    Hello Admin,

                    Great news! A client has successfully signed the contract.

                    ----------------------------------------
                    QUOTATION DETAILS
                    ----------------------------------------
                    Quotation ID : {quotation.quotation_id}
                    Company Name : {quotation.company_name}
                    Client Name  : {quotation.contact_person}
                    Client Email : {quotation.email}
                    Phone Number : {quotation.phone_number}

                    ----------------------------------------
                    STATUS
                    ----------------------------------------
                    Contract Status : SIGNED
                    Signed At       : {quotation.signed_at.strftime("%d %B %Y, %I:%M %p")}
                    ----------------------------------------

                    You can now proceed with further processing.

                    Thanks,
                    Uniform System
                    """,
                    from_email=settings.EMAIL_HOST_USER,
                    to=["rt61240@gmail.com"]
                )

                if quotation.signed_pdf:
                    quotation.signed_pdf.seek(0)
                    mail.attach(
                        quotation.signed_pdf.name,
                        quotation.signed_pdf.read(),
                        'application/pdf'
                    )

                mail.send(fail_silently=False)

            elif status == "declined":
                quotation.workflow_status = "DECLINED"

            quotation.save()

            return Response({"statusCode":201,"status":True,"message": "Webhook processed"}, status=201)

        except QuotationRequest.DoesNotExist:
            return Response({"statusCode":400,"status":False,"message": "Quotation not found"}, status=400)


from userhub.authentication import CustomUserJWTAuthentication as RealCustomUserJWTAuthentication

class ToggleProductFavouriteAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [RealCustomUserJWTAuthentication]

    def post(self, request):
        product_id = request.data.get("product_id")
        if not product_id:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "product_id is required."
            }, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id, isDeleted=False)
        fav, created = Favourite.objects.get_or_create(product=product, user=request.user)
        
        if created:
            fav.is_like = True
        else:
            fav.is_like = not fav.is_like
        
        fav.isDeleted = False
        fav.isActive = True
        fav.save()

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Product favourite toggled successfully.",
            "data": {
                "product_id": product.id,
                "is_favourite": fav.is_like
            }
        }, status=status.HTTP_200_OK)


class ToggleThemeFavouriteAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [RealCustomUserJWTAuthentication]

    def post(self, request):
        theme_id = request.data.get("theme_id")
        if not theme_id:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "theme_id is required."
            }, status=status.HTTP_400_BAD_REQUEST)

        theme = get_object_or_404(TableTheme, id=theme_id, isDeleted=False)
        fav, created = ThemeFavourite.objects.get_or_create(theme=theme, user=request.user)
        
        if created:
            fav.is_like = True
        else:
            fav.is_like = not fav.is_like
        
        fav.isDeleted = False
        fav.isActive = True
        fav.save()

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Theme favourite toggled successfully.",
            "data": {
                "theme_id": theme.id,
                "is_favourite": fav.is_like
            }
        }, status=status.HTTP_200_OK)


class ReorderOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, order_id=None):
        try:
            user = request.user
            target_user = user
            if not isinstance(target_user, Users):
                found = Users.objects.filter(Q(email=getattr(user, 'email', None)) | Q(id=getattr(user, 'id', None))).first()
                if found:
                    target_user = found

            oid = order_id or request.data.get("order_id")
            if not oid:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "order_id is required."
                }, status=status.HTTP_400_BAD_REQUEST)

            # Retrieve original order
            query = Q(order_id=oid)
            if str(oid).isdigit():
                query |= Q(id=int(oid))

            original_order = Order.objects.filter(query, user=target_user).first()
            if not original_order:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": f"Original order '{oid}' not found."
                }, status=status.HTTP_404_NOT_FOUND)

            # Check item availability & stock
            original_items = OrderItem.objects.filter(order=original_order)
            if not original_items.exists():
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "No items found in original order to reorder."
                }, status=status.HTTP_400_BAD_REQUEST)

            for item in original_items:
                prod = item.product
                if not prod or prod.isDeleted or not prod.isActive:
                    p_name = prod.productName if prod else "Item"
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": f"Product '{p_name}' is currently unavailable for reorder."
                    }, status=status.HTTP_400_BAD_REQUEST)

                if prod.available_quantity < item.quantity:
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": f"Insufficient stock for '{prod.productName}'. Available: {prod.available_quantity}, Requested: {item.quantity}."
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Calculate dates
            today = timezone.now().date()
            rental_days = original_order.rental_days or 1
            start_date = today
            end_date = today + timedelta(days=rental_days)

            # Create new order
            new_order = Order.objects.create(
                user=target_user,
                customer=original_order.customer,
                rental_start_date=start_date,
                rental_end_date=end_date,
                rental_days=rental_days,
                subtotal=original_order.subtotal,
                total_amount=original_order.total_amount,
                shipping_charge=original_order.shipping_charge,
                tax=original_order.tax,
                currency=original_order.currency or "USD",
                promocode=original_order.promocode,
                custom_theme=original_order.custom_theme,
                status="pending",
                is_paid=False
            )

            new_order_items = []
            for item in original_items:
                new_item = OrderItem(
                    order=new_order,
                    product=item.product,
                    rental_days=rental_days,
                    quantity=item.quantity,
                    price_per_day=item.price_per_day,
                    subtotal=item.subtotal,
                    custom_theme=item.custom_theme
                )
                new_order_items.append(new_item)

            OrderItem.objects.bulk_create(new_order_items)

            # Deduct stock
            for item in original_items:
                prod = item.product
                prod.available_quantity = max(0, prod.available_quantity - item.quantity)
                prod.save(update_fields=["available_quantity"])

            # Create Rental & RentalItem entries
            from userhub.models import Rental, RentalItem
            rental = Rental.objects.create(
                order=new_order,
                customer=new_order.customer,
                start_date=new_order.rental_start_date,
                end_date=new_order.rental_end_date,
                shipping_address=getattr(new_order.customer, "address_line_1", "") or getattr(new_order.customer, "address", "") or "No Address",
                shipping_fee=new_order.shipping_charge or 0,
                tax=new_order.tax or 0,
                total_amount=new_order.total_amount or 0,
                status='rented'
            )
            for item in new_order_items:
                RentalItem.objects.create(
                    rental=rental,
                    product=item.product,
                    quantity=item.quantity,
                    price_per_day=item.price_per_day or 0,
                    subtotal=item.subtotal or 0
                )

            # Trigger in-app notification
            create_user_notification(
                target_user,
                title="Reorder Initiated",
                message=f"Reorder #{new_order.order_id} created successfully. Please complete payment.",
                notification_type="order_status",
                order=new_order
            )

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Reorder created successfully! Redirecting to payment...",
                "data": {
                    "order_id": new_order.order_id,
                    "id": new_order.id,
                    "total_amount": str(new_order.total_amount),
                    "redirect_url": f"/overview?orderId={new_order.order_id}"
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": f"Failed to reorder: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

