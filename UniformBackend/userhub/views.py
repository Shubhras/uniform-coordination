from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from uniformAdmin.models import AdminUser
from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated
from .utils import generate_custom_tokens
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import*
import logging,uuid

import re

logger = logging.getLogger(__name__)





class SignupAPIView(APIView):

    def post(self, request, *args, **kwargs):
        serializer = UserSignupSerializer(data=request.data)

        try:
            if serializer.is_valid():
                user = serializer.save()

                # Serialize full safe user response
                response_data = UserResponseSerializer(
                    user,
                    context={'request': request}
                ).data

                # Convert profileImage to full URL
                if user.profileImage:
                    response_data["profileImage"] = request.build_absolute_uri(user.profileImage.url)

                return Response({
                    "status": True,
                    "statusCode": 201,
                    "message": "User created successfully.",
                    "data": response_data
                }, status=status.HTTP_201_CREATED)

            else:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation failed.",
                    "error": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as exc:
            logger.exception("Signup error")
            return Response({
                "status": False,
                "statusCode": 500,
                    "message": "Server error while creating user.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class LoginAPIView(APIView):

    def post(self, request):
        try:
            email = request.data.get("email")
            password = request.data.get("password")

            if not email or not password:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation failed.",
                    "error": {
                        "email": "Email is required." if not email else "",
                        "password": "Password is required." if not password else ""
                    }
                }, status=400)

            serializer = LoginSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data["user"]

            # Update last login
            user.lastLogin = now()
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
            })

        except serializers.ValidationError as ve:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Validation failed.",
                "error": ve.detail
            })

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error during login.",
                "error": str(exc)
            })



class GetProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

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

            # Handle profile image
            if "profileImage" in request.FILES:
                user.profileImage = request.FILES["profileImage"]

            user.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Profile updated successfully."
            }, status=200)

        except IntegrityError:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Username already exists.",
            }, status=400)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Unable to update profile.",
                "error": str(exc)
            }, status=500)



class DeleteProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

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

    def post(self, request):
        try:
            email = request.data.get("email")

            if not email:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation failed.",
                    "error": {"email": "Email is required."}
                }, status=400)

            # Check user exists
            try:
                user = Users.objects.get(email=email, isDeleted=False)
            except Users.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "No account found with this email."
                }, status=404)

            # Create reset token
            reset_token = uuid.uuid4().hex
            user.resetToken = reset_token
            user.save()

            # Build reset link
            frontend_url = "http://localhost:3000/reset-password"
            reset_link = f"{frontend_url}?token={reset_token}"

            # (Later) Send email here using reset_link

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

    def post(self, request):
        try:
            reset_token = request.data.get("resetToken")
            new_password = request.data.get("newPassword")

            if not reset_token or not new_password:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation failed.",
                    "error": {
                        "resetToken": "Required." if not reset_token else "",
                        "newPassword": "Required." if not new_password else ""
                    }
                }, status=400)

            try:
                user = Users.objects.get(resetToken=reset_token, isDeleted=False)
            except Users.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "Invalid or expired reset token."
                }, status=404)

            user.password = make_password(new_password)
            user.resetToken = None
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
                    "message": "Passwords do not match.",
                    "error": {
                        "confirmPassword": "Passwords do not match."
                    }
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
