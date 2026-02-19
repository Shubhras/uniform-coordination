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
                
                 # EMAIL VERIFICATION 
                uid = user.id  #urlsafe_base64_encode(force_bytes(user.id))                
                verify_link = request.build_absolute_uri(f"http://localhost:7001/email-verification-page/?user_id={uid}")

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
    
    # @extend_schema(
    # summary="Login API",
    
    # request=LoginSerializer,
    # responses={200: dict},
    # auth=[],
    # tags=["UserHub Authentication"]
    # )
    def post(self, request):
        
        try:
            email = request.data.get("email")
            password = request.data.get("password")
            user_type = request.data.get("userType")  
            
            # ------- CLEAN VALIDATION FIX ----------
            missing_fields = []

            if not email:
                missing_fields.append("Email is required.")
            if not password:
                missing_fields.append("Password is required.")
            if not user_type:
                missing_fields.append("User type is required.")

            # If ANY field missing → return ONLY the FIRST message
            if missing_fields:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": missing_fields[0],
                }, status=200)
            # ----------------------------------------

            serializer = UserLoginSerializer(data=request.data)
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



class UpdateProfileAPIView(APIView):
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
            frontend_url = "http://localhost:7001/reset-password"
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

# class NotificationListAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         try:
#             notifications = Notifications.objects.filter(
#                 user=request.user,
#                 isDeleted=False
#             ).order_by("-created_at")

#             serializer = NotificationSerializer(notifications, many=True)

#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Notifications fetched successfully",
#                 "data": serializer.data
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": str(e),
#                 "data": None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class NotificationDetailAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, pk):
#         try:
#             notification = get_object_or_404(
#                 Notifications,
#                 pk=pk,
#                 user=request.user,
#                 isDeleted=False
#             )

#             serializer = NotificationSerializer(notification)

#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Notification details fetched successfully",
#                 "data": serializer.data
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 404,
#                 "message": str(e),
#                 "data": None
#             }, status=status.HTTP_404_NOT_FOUND)


# class NotificationUpdateAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def put(self, request, pk):
#         try:
#             notification = get_object_or_404(
#                 Notifications,
#                 pk=pk,
#                 user=request.user,
#                 isDeleted=False
#             )

#             serializer = NotificationSerializer(
#                 notification,
#                 data=request.data,
#                 partial=True
#             )

#             if serializer.is_valid():
#                 serializer.save()
#                 return Response({
#                     "status": True,
#                     "statusCode": 200,
#                     "message": "Notification updated successfully",
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


# class NotificationDeleteAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def delete(self, request, pk):
#         try:
#             notification = get_object_or_404(
#                 Notifications,
#                 pk=pk,
#                 user=request.user,
#                 isDeleted=False
#             )

#             notification.isDeleted = True
#             notification.isActive = False
#             notification.save()

#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Notification deleted successfully",
#                 "data": None
#             }, status=status.HTTP_200_OK)

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

    def post(self, request):
        try:
            product_id = request.data.get("product_id")
            quantity = int(request.data.get("quantity", 1))
            product = Product.objects.get(id=product_id)
            cart, _ = Cart.objects.get_or_create(
                user=request.user,
                is_active=True )
            item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product )
            if not created:
                item.quantity += quantity
                item.save()
            else:
                item.quantity = quantity
                item.save()
            serializer = CartItemSerializer(
                item,
                context={"request": request} )
            return Response({
                "status": True,
                "statusCode": 200 if not created else 201,
                "message": "Item already in cart. Quantity updated."
                if not created else "Item added to cart successfully.",
                "data": {
                    "id": serializer.data["id"],
                    "product": serializer.data["product_name"],
                    "quantity": serializer.data["quantity"],
                    "price": Decimal(serializer.data["price"])
                }
            })

        except Product.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Product not found",
                "data": None
            }, status=status.HTTP_404_NOT_FOUND)

# CART LISTING
class CartListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    summary="CartList API",
    tags=["Payment Gateway"],
    responses={200: OpenApiTypes.OBJECT}
    )
    def get(self, request):
        try:
            cart = Cart.objects.get(user=request.user, is_active=True)
            cart_items = CartItem.objects.filter(
                cart=cart,
                is_active=True
            ).order_by('id')

            paginator = CustomPagination()
            paginated_items = paginator.paginate_queryset(cart_items, request)

            serializer = CartItemSerializer(
                paginated_items,
                many=True,
                context={"request": request}  
            )

            return paginator.get_paginated_response(serializer.data)
        except Cart.DoesNotExist:
            return Response({
                "status":False,
                "statusCode":200,
                "massage":"data fetched successfully",
                "count": 0,
                "next": None,
                "previous": None,
                "data": []
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": str(e)
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
    def patch(self, request):
        try:
            item_id = request.data.get("item_id")
            quantity = int(request.data.get("quantity"))
            item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user
            )
            if quantity <= 0:
                item.delete()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Item removed from cart"
                }, status=status.HTTP_200_OK)

            item.quantity = quantity
            item.save()
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Cart item quantity updated successfully"
            }, status=status.HTTP_200_OK)
        
        except CartItem.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "error": "Cart item not found"
            }, status=status.HTTP_404_NOT_FOUND)

# Delete
class RemoveCartItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    summary="RemoveCartItem API",
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
    def delete(self, request):
        try:
            item_id = request.data.get("item_id")
            if not item_id:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": "Item ID is required "
                }, status=status.HTTP_400_BAD_REQUEST)
            item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user
            )
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
                "error": "Item not found"
            }, status=status.HTTP_404_NOT_FOUND)
        
class ClearCartAPIView(APIView):
    permission_classes =[IsAuthenticated]

    def delete(self, request):
        user = request.user
        cart = Cart.objects.filter(user=user, is_active=True).first()
        if not cart:
            return Response({
                "status":False,
                "statusCode":404,
                "message": "No active cart found."},
                status=status.HTTP_404_NOT_FOUND
            )
        cart.items.all().delete()
        return Response({
            "status":True,
            "statusCode":200,
            "message": "Cart cleared successfully."},
            status=status.HTTP_200_OK
        )

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
            cart = Cart.objects.get(user=request.user, is_active=True)
            cart_items = CartItem.objects.filter(cart=cart,is_active=True)

            if not cart_items.exists():
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": "Cart is empty"
                }, status=status.HTTP_400_BAD_REQUEST)

            items_count = sum(item.quantity for item in cart_items)
            subtotal = sum(item.total_price for item in cart_items)
            shipping = None
            tax = None
            fees = None
            
            total_discount = sum(((item.price - item.final_price) * item.quantity) for item in cart_items)
            total_amount = subtotal + Decimal("0.00") + Decimal("0.00") + Decimal("0.00") - total_discount

            items_list = []
            for item in cart_items:
                items_list.append({
                    "name": item.product.productName,
                    "quantity": item.quantity,
                    "price": item.price,
                    "total": item.total_price,
                    "discount": (item.price - item.final_price) 
                })

            return Response({
                "items_count": items_count,
                "items": items_list,
                "subtotal": subtotal,
                "shipping": shipping,
                "tax": tax,
                "fees": fees,
                "discount": total_discount,  
                "total_amount": total_amount
            })

        except Cart.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 400,
                "error": "Cart is empty"
            }, status=status.HTTP_400_BAD_REQUEST)

class CreateOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    summary="CreateOrder API",
    
    tags=["Payment Gateway"],
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "cart_id": {"type": "integer"},
                "customer": {"type": "object"},
                "delivery_address": {"type": "object"},
                "payment": {"type": "object"},
                "rental": {
                    "type": "object",
                    "properties": {
                        "start_date": {"type": "string", "example": "2026-01-20"},
                        "return_date": {"type": "string", "example": "2026-01-25"},
                    }
                },
                "promocode": {
                    "type": "object",
                    "properties": {
                        "code": {"type": "string"}
                    }
                }
            },
            "required": ["cart_id", "rental"]
        }
    },
    responses={
        201: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT,
    },
    )
    def post(self, request):
        try:
            data = request.data
            user = request.user
            customer_data = data.get("customer", {})
            address_data = data.get("delivery_address", {})
            payment_data = data.get("payment", {})
            cart_id = data.get("cart_id")
            rental_data = data.get("rental", {})
            promocode_data = data.get("promocode")
            order_type = data.get("order_type")

            if not cart_id:
                return Response({
                    "status":False,
                    "statusCode":400,
                    "error": "cart_id is required."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                cart = Cart.objects.get(id=cart_id, user=user, is_active=True)
            except Cart.DoesNotExist:
                return Response({
                    "status":False,
                    "statusCode":400,
                    "error": "Cart not found."}, status=status.HTTP_400_BAD_REQUEST)

            # -------------------- CustomerDetails: get or update --------------------
            try:
                customer = CustomerDetails.objects.get(user=user)
                customer.first_name = customer_data.get("first_name", customer.first_name)
                customer.last_name = customer_data.get("last_name", customer.last_name)
                customer.email = customer_data.get("email", customer.email)
                customer.phone = customer_data.get("phone", customer.phone)
                customer.address_line_1 = address_data.get("address_line_1", customer.address_line_1)
                customer.address_line_2 = address_data.get("address_line_2", customer.address_line_2)
                customer.city = address_data.get("city", customer.city)
                customer.postal_code = address_data.get("postal_code", customer.postal_code)
                customer.country = address_data.get("country", customer.country)
                customer.payment_method = payment_data.get("payment_method", customer.payment_method)
                customer.save()
            except CustomerDetails.DoesNotExist:
                customer = CustomerDetails.objects.create(
                    user=user,
                    first_name=customer_data.get("first_name", user.firstName or ""),
                    last_name=customer_data.get("last_name", user.lastName or ""),
                    email=customer_data.get("email", user.email or ""),
                    phone=customer_data.get("phone", user.phone or ""),
                    address_line_1=address_data.get("address_line_1", ""),
                    address_line_2=address_data.get("address_line_2", ""),
                    city=address_data.get("city", ""),
                    postal_code=address_data.get("postal_code", ""),
                    country=address_data.get("country", ""),
                    payment_method=payment_data.get("payment_method", "COD"),
                )

            cart_items = cart.items.all()
            if not cart_items.exists():
                return Response({
                    "status":False,
                    "statusCode":400,
                    "error": "No items found in this cart."}, status=status.HTTP_400_BAD_REQUEST)

            total_amount = sum((Decimal(item.total_price or 0) for item in cart_items), Decimal("0.00"))
            original_amount = total_amount
            discount_amount = Decimal("0.00")

            # -------------------- Rental Dates --------------------
            start_date_str = rental_data.get("start_date")
            return_date_str = rental_data.get("return_date")
            start_date = parse_date(start_date_str) if start_date_str else None
            return_date = parse_date(return_date_str) if return_date_str else None
            if not start_date or not return_date or return_date < start_date:
                return Response({
                    "status":False,
                    "statusCode":400,
                    "error": "Invalid rental dates."}, status=status.HTTP_400_BAD_REQUEST)

            # -------------------- Order Type Validation --------------------
            if order_type not in ["uniform", "table"]:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": "Invalid order_type. Must be 'uniform' or 'table'."
                }, status=status.HTTP_400_BAD_REQUEST)

            # -------------------- Promocode --------------------
            promocode = None
            now = timezone.now()
            if promocode_data and promocode_data.get("code"):
                code = promocode_data.get("code")
                try:
                    promocode = Promocode.objects.get(promocodeName=code, isActive=True, isDeleted=False)
                except Promocode.DoesNotExist:
                    return Response({"status": False,
                                    "statusCode": 400,
                                    "error": "Promocode not found or invalid."},
                                    status=status.HTTP_400_BAD_REQUEST)

                if (promocode.started_at and promocode.started_at > now) or \
                   (promocode.ended_at and promocode.ended_at < now):
                    return Response({"status": False, 
                                     "statusCode": 400, 
                                     "error": "Promocode not active or expired."},
                                    status=status.HTTP_400_BAD_REQUEST)

                if Order.objects.filter(customer=customer, promocode=promocode).exists():
                    return Response({"status": False,
                                      "statusCode": 400,
                                      "error": "You have already used this promocode."},
                                    status=status.HTTP_400_BAD_REQUEST)

                if promocode.promocodeType == "fix_price" and promocode.amount is not None:
                    discount_amount = Decimal(promocode.amount)
                elif promocode.promocodeType == "discount" and promocode.amount is not None:
                    discount_amount = original_amount * (Decimal(promocode.amount) / 100)

                total_amount = max(original_amount - discount_amount, Decimal("0.00"))

            # -------------------- Create Order --------------------
            order = Order.objects.create(
                user=request.user,
                cart=cart,
                customer=customer,
                order_type=order_type,
                total_amount=total_amount,
                shipping_fee=Decimal("100"),
                tax=Decimal("10"),
                start_date=start_date,
                return_date=return_date,
                status="confirmed",
                promocode=promocode
            )

            rental_days = (return_date - start_date).days + 1

            # -------------------- Create Order Items --------------------
            for item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    rental_days=rental_days,
                    price_per_day=item.product.price or 0
                )

            # -------------------- Admin Notification --------------------
            create_admin_order_notification(
                instance=order,
                title=f"New Order created: {order.order_id}",
                message=f"A new Order request has been created by {customer.user}.",
                priority="high",
                object_id=order.order_id
            )

            # -------------------- Response --------------------
            response_data = {
                "cart": {
                    "cart_id": cart.id,
                    "items": [{"id": item.id, "total_price": float(item.total_price or 0)} for item in cart_items]
                },
                "customer": {
                    "first_name": customer.first_name,
                    "last_name": customer.last_name,
                    "email": customer.email,
                    "phone": customer.phone
                },
                "delivery_address": {
                    "address_line_1": customer.address_line_1,
                    "address_line_2": customer.address_line_2,
                    "city": customer.city,
                    "postal_code": customer.postal_code,
                    "country": customer.country
                },
                "rental": {
                    "start_date": start_date.strftime("%Y-%m-%d"),
                    "return_date": return_date.strftime("%Y-%m-%d"),
                    "duration_days": rental_days
                },
                "payment": {
                    "payment_method": customer.payment_method
                },
                "promocode": {
                    "code": promocode.promocodeName if promocode else None
                },
                "order": {
                    "order_id": str(order.order_id),
                    "total_amount": float(total_amount),
                    "discount": float(discount_amount),
                    "order_status": order.status
                }
            }

            return Response({
                "status": True,
                "statusCode": 201,
                "message": "Order created successfully",
                "data": response_data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({
                "status": False,
                "statusCode": 500,
                "error": str(e)
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
            if not order_id:
                return Response({
                    "status":False,
                    "statusCode":400,
                    "message": "Order ID is required."},
                    status=status.HTTP_400_BAD_REQUEST)
            try:
                order = Order.objects.get(order_id=order_id, customer__user=request.user)
            except Order.DoesNotExist:
                return Response({
                    "status":False,
                    "statusCode":404,
                    "message": "Order not found."},
                    status=status.HTTP_404_NOT_FOUND )
            customer = order.customer
            cart_items = order.cart.items.all()  

            order_items_list = []
            for item in cart_items:
                order_items_list.append({
                    "name": item.product.productName,
                    "quantity": item.quantity,
                    "price_per_item": Decimal(item.price),
                    "total_price": Decimal(item.total_price),
                    "product_image": item.product.ProductImage.url if item.product.ProductImage else None
                })
            duration_days = (order.return_date - order.start_date).days + 1
            subtotal = Decimal(sum(item.total_price for item in cart_items))
            total_amount = Decimal(order.total_amount)
            discount = Decimal(subtotal - total_amount) if subtotal > total_amount else 0.0

            response_data = {
                "contact_information": {
                    "name": f"{customer.first_name} {customer.last_name}",
                    "email": customer.email,
                    "phone": customer.phone
                },
                "delivery_address": {
                        "address_line_1": customer.address_line_1,
                        "address_line_2": customer.address_line_2,
                        "city": customer.city,
                        "postal_code": customer.postal_code,
                        "country": customer.country
                    },
                "rental_period": {
                    "start": order.start_date.strftime("%Y-%m-%d"),
                    "return": order.return_date.strftime("%Y-%m-%d"),
                    "duration": f"{duration_days} days"
                },
                "order_items": order_items_list,
                "payment": {
                    "payment_method": order.payment_method
                },
                "promocode": {
                    "code": order.promocode.promocodeName if order.promocode else None
                },
                "order_summary": {
                    "order_id":order.order_id,
                    "subtotal": subtotal,
                    "discount": discount,
                    "total": total_amount
                }
            }
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Order review fetched successfully",
                "data": response_data},status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                    "status": False,
                    "statusCode": 500,
                    "error": "Something went wrong while fetching order summary.",
                    "details": str(e) 
                },status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserOrderListAPIView(APIView):
    permission_classes = [IsAuthenticated]  

    @extend_schema(
    summary="OrderList API",
    
    tags=["Payment Gateway"],
    responses={200: OpenApiTypes.OBJECT}
    )
    def get(self, request):
        user = request.user

        if not user.is_authenticated:
            return Response({
                "status": False,
                "statusCode": 401,
                "message": "Authentication failed. Please login.",
                "data": {}
            })
        orders = Order.objects.filter(user__email=user.email, is_active=True, is_deleted=False).order_by("-created_at")
        if not orders.exists():
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "No orders found for this user",
                "data": []
            })

        serializer = OrderSerializer(orders, many=True)
        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Orders fetched successfully",
            "data": serializer.data
        })
    
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

    def post(self, request):
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

            customer = CustomerDetails.objects.get(user=request.user)
            order = Order.objects.filter(order_id=order_id, customer=customer).first()

            if not order:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "Order not found",
                    "data": {}
                }, status=status.HTTP_404_NOT_FOUND)

            serializer = OrderSerializer(order)
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Order fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({
                "status": False,
                "statusCode": 500,
                "error": "Internal server error.",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserCancelOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        user = request.user
        cancel_reason = request.data.get(
            "cancel_reason",
            "Cancelled by customer"
        )
        try:
            order = Order.objects.get(
                order_id=order_id,
                customer__user=user,
                is_active=True,
                is_deleted=False
            )
            today = timezone.now().date()
            days_until_shipment = (order.start_date - today).days
            if days_until_shipment < 5:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": "Cancellation allowed only more than 5 days before shipment."
                }, status=status.HTTP_400_BAD_REQUEST)
            if order.status not in ["pending", "confirmed"]:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": "Order cannot be cancelled after shipment."
                }, status=status.HTTP_400_BAD_REQUEST)

            order.status = "cancelled"
            order.cancel_reason = cancel_reason
            order.cancelled_by = "customer"
            order.save()

            rentals = Rental.objects.filter(order_item__order=order)
            for rental in rentals:
                rental.status = "cancelled"
                rental.save()

            serializer = OrderSerializer(order)
  
            return Response({
                "status": True,
                "statusCode": 200,
                "message": f"Order {order.order_id} cancelled successfully.",
                "order": serializer.data
            }, status=status.HTTP_200_OK)

        except Order.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "error": "Order not found."
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 400,
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

LATE_FEE_PER_DAY = 10  
COMPENSATION_RATE = 100  

ROUND_TRIP_SHIPPING_FEE = Decimal("50.00")
CONSUMPTION_TAX_RATE = Decimal("0.10")  

#-------------------User Return Order-------------------

class UserReturnOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, order_id):

        user = request.user
        return_items = request.data.get("items", [])
        if not return_items:
            return Response({
                "status": False,
                "statusCode": 400,
                "error": "No items provided for return."
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            order = Order.objects.get(
                order_id=order_id,
                customer__user=user,
                is_active=True,
                is_deleted=False
            )
        except Order.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "error": "Order not found."
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            rental = order.rental  
        except:
            return Response({
                "status": False,
                "statusCode": 404,
                "error": "Rental not found."
            }, status=status.HTTP_404_NOT_FOUND)

        if order.status in ["pending", "confirmed"]:
            return Response({
                "status": False,
                "statusCode": 400,
                "error": "Returns not allowed before shipment."
            }, status=status.HTTP_400_BAD_REQUEST)

        today = timezone.now().date()

        total_late_fee = Decimal("0.00")
        total_lost_compensation = Decimal("0.00")
        for item_data in return_items:

            product_id = item_data.get("product_id")
            qty_to_return = int(item_data.get("quantity", 0))
            lost = item_data.get("lost", False)

            if not product_id or qty_to_return <= 0:
                continue

            try:
                rental_item = RentalItem.objects.get(
                    rental=rental,
                    product_id=product_id
                )
            except RentalItem.DoesNotExist:
                continue

            remaining_qty = (
                rental_item.quantity
                - rental_item.returned_quantity
                - rental_item.lost_quantity
            )

            if qty_to_return > remaining_qty:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": f"Return quantity exceeds remaining quantity for {rental_item.product.productName}."
                }, status=status.HTTP_400_BAD_REQUEST)
            if lost:

                lost_amount = (
                    rental_item.price_per_day
                    * max((rental.end_date - rental.start_date).days, 1)
                    * qty_to_return
                )

                rental_item.lost_quantity += qty_to_return

                if rental_item.lost_quantity >= rental_item.quantity:
                    rental_item.is_lost = True

                total_lost_compensation += lost_amount
            else:

                late_days = max((today - rental.end_date).days, 0)
                late_fee = Decimal(late_days * 20 * qty_to_return) 
                total_late_fee += late_fee
                rental_item.returned_quantity += qty_to_return

                if rental_item.returned_quantity >= rental_item.quantity:
                    rental_item.is_returned = True
                rental_item.product.available_quantity += qty_to_return
                rental_item.product.save()

            rental_item.save()
        rental.late_fee += total_late_fee
        rental.lost_fee += total_lost_compensation
        rental_subtotal = sum(item.subtotal for item in rental.items.all())
        rental.total_amount = (
            rental_subtotal
            + rental.late_fee
            + rental.lost_fee
            + rental.damage_fee
            + rental.shipping_fee
            + rental.tax
            - rental.discount_amount
        )
        remaining_items = rental.items.filter(
            quantity__gt=F("returned_quantity") + F("lost_quantity")
        )

        if not remaining_items.exists():
            rental.status = "returned"
            rental.actual_return_date = today
            order.status = "delivered"
        else:
            rental.status = "partial_return"
            order.status = "processing"

        rental.save()
        order.total_amount = rental.total_amount
        order.save()

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Return processed successfully.",
            "late_fee_added": float(total_late_fee),
            "lost_fee_added": float(total_lost_compensation),
            "updated_total_amount": float(order.total_amount)
        }, status=status.HTTP_200_OK)


class CreateRentalOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        try:
            user = request.user
            data = request.data

            cart_id = data.get("cart_id")
            rental_data = data.get("rental", {})
            payment_method = data.get("payment_method")
            order_type = data.get("order_type")

            if not cart_id:
                return Response({
                    "status": False,
                    "statusCode":400,
                    "error": "cart_id is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            try:
                cart = Cart.objects.get(id=cart_id, user=user, is_active=True)
            except Cart.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode":400,
                    "error": "Cart not found"
                },status=status.HTTP_400_BAD_REQUEST)

            cart_items = cart.items.all()
            if not cart_items.exists():
                return Response({
                    "status": False,
                    "statusCode":400,
                    "error": "Cart is empty",
                }, status=status.HTTP_400_BAD_REQUEST)
            start_date = parse_date(rental_data.get("start_date"))
            return_date = parse_date(rental_data.get("return_date"))

            if not start_date or not return_date or return_date < start_date:
                return Response({
                    "status": False,
                    "statusCode":400,
                    "error": "Invalid rental dates",
                }, status=status.HTTP_400_BAD_REQUEST)

            rental_days = (return_date - start_date).days + 1
            for item in cart_items:
                if item.quantity > item.product.available_quantity:
                    return Response({
                        "status": False,
                        "statusCode":400,
                        "error": f"{item.product.productName} not available",
                    }, status=status.HTTP_400_BAD_REQUEST)
            TAX_RATE = Decimal("0.10")
            SHIPPING_FEE = Decimal("50.00")

            rental_subtotal = Decimal("0.00")

            for item in cart_items:
                rental_subtotal += (
                    Decimal(item.product.price)
                    * item.quantity
                    * rental_days
                )

            shipping_fee = SHIPPING_FEE
            tax_amount = (rental_subtotal + shipping_fee) * TAX_RATE
            total_amount = rental_subtotal + shipping_fee + tax_amount
            try:
                customer = CustomerDetails.objects.get(user=user)
            except CustomerDetails.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": "Customer details not found"
                }, status=status.HTTP_400_BAD_REQUEST)

            order = Order.objects.create(
                cart=cart,
                customer=customer,
                payment_method=payment_method,
                order_type=order_type,
                total_amount=total_amount,
                shipping_fee=shipping_fee,     
                tax=tax_amount,                
                start_date=start_date,
                return_date=return_date,
                status="confirmed"
            )
            # send_notification(
            #     user=order.customer.user,
            #     notification_type="order_confirmation",
            #     subject="Order Confirmed",
            #     message=f"Your order #{order.order_id} has been confirmed."
            # )
            for item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    rental_days=rental_days,
                    price_per_day=item.product.price
                )
                item.product.available_quantity -= item.quantity
                item.product.save()

            rental = Rental.objects.create(
                order=order,                      
                customer=customer,
                start_date=start_date,
                end_date=return_date,
                shipping_address=customer.address_line_1,
                shipping_fee=shipping_fee,
                tax=tax_amount,
                total_amount=total_amount,
                status="rented"
            )
            for order_item in order.items.all():
                RentalItem.objects.create(
                    rental=rental,
                    product=order_item.product,
                    quantity=order_item.quantity,
                    price_per_day=order_item.price_per_day
                )

            cart.items.all().delete()
            cart.is_active = False
            cart.save()
    
            return Response({
                "status": True,
                "statusCode":201,
                "message": "Order created successfully",
                "order_id": order.order_id,
                "total_amount": float(total_amount)
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode":500,
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RentalListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            rentals_qs = Rental.objects.filter(isDeleted=False).order_by("created_at")

            paginator = CustomPagination()
            page = paginator.paginate_queryset(rentals_qs, request)
            serializer = RentalSerializer(page, many=True)

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Rental list fetched successfully",
                "data": serializer.data,
                "pagination": {
                    "page": paginator.page.number,
                    "page_size": paginator.get_page_size(request),
                    "total_pages": paginator.page.paginator.num_pages,
                    "total_items": paginator.page.paginator.count
                }
            })

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "error": str(e)
            }, status=500)


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
    
         
#<------------OrderItem--------------->
class UserOrderItemCreateAPIView(APIView):
    permission_classes=[IsAuthenticated]
    
    def post(self,request):
        try:
            serializer = OrderItemCreateSerializer(data=request.data,context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "statusCode":201,
                    "status":True,
                    "message":"Order Item Create Successfully. ",
                    "data":serializer.data
                },status=status.HTTP_201_CREATED)
            else:
                return Response({
                    "statusCode":400,
                    "status":False,
                    "message":"Unable to create order item",
                    "error":serializer.errors
                },status=status.HTTP_400_BAD_REQUEST)
        except OrderItem.DoesNotExist as e:
            return Response({
                "statusCode":500,
                "status":False,
                "message":"Something went wrong on server",
                "error":str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

#<-----------save quotation-------------->
def send_quotation_contract(quotation):

    pdf_path = quotation.pdf_file.path
    envelope_id = send_contract(quotation, pdf_path)
    # SAVE IN DB
    quotation.external_document_id = envelope_id
    quotation.save()

    return envelope_id

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

