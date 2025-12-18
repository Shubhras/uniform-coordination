from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from uniformAdmin.serializers import *
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from rest_framework_simplejwt.authentication import JWTAuthentication
from datetime import timedelta
from django.shortcuts import get_object_or_404
from django.contrib.auth.tokens import default_token_generator
from uniformAdmin.fabric import CustomPagination
from rest_framework.parsers import MultiPartParser, FormParser



class AdminLoginAPIView(APIView):
    def post(self, request):
        try:
            serializer = AdminLoginSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']

            remember_me = request.data.get('remember_me', False)
            if isinstance(remember_me, str):
                remember_me = remember_me.lower() == 'true'


            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            refresh["user_id"] = str(user.id)
            refresh["role"] = "admin"
            # refresh["email"] = user.email

            if remember_me:
                refresh.set_exp(lifetime=timedelta(days=30))             
                refresh.access_token.set_exp(lifetime=timedelta(days=30))
            else:
                refresh.set_exp(lifetime=timedelta(days=1))               
                refresh.access_token.set_exp(lifetime=timedelta(hours=1))


            refresh_token = str(refresh)
            access_token = str(refresh.access_token)

            response_data = {
                "status": True,
                "statusCode": 200,
                "message": "Login successful",
                "data": {
                    "admin": {
                        "id": user.id,
                        "email": user.email,
                        "role": user.role.role_name if user.role else None,
                        "name": user.name,
                        "remember_me": remember_me,
                    },
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                
                }
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except ValidationError as ve:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Validation Error",
                "errors": ve.detail
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Something went wrong",
                "errors": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminChangePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]  

    def post(self, request):
        try:
            serializer = AdminChangePasswordSerializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            user = request.user

            # Set new password
            with transaction.atomic():
                user.set_password(serializer.validated_data['new_password'])
                user.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Password changed successfully"
            }, status=status.HTTP_200_OK)

        except ValidationError as ve:
            # **Return 400 for validation errors**
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Validation Error",
                "errors": ve.detail
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # **Only unexpected errors return 500**
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Something went wrong",
                "errors": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminUpdateProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
            user = request.user  
            serializer = AdminUpdateSerializer(user, data=request.data, partial=True)
            
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    'message': 'Profile updated successfully',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)

        except ValidationError as ve:
            return Response({
                "status": False,
                "statusCode": 400,
                'message': 'Validation error',
                'errors': ve.message_dict
            }, status=status.HTTP_200_OK)

        except ObjectDoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                'error': 'User not found'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                'error': 'Something went wrong',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)        


class AdminDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user

            jwt_auth = JWTAuthentication()

            header = jwt_auth.get_header(request)
            raw_token = jwt_auth.get_raw_token(header)
            validated_token = jwt_auth.get_validated_token(raw_token)

            role = validated_token.get('role')

            if role != 'admin':
                return Response({
                    "status": False,
                    "statusCode": 403,
                    "error": "Forbidden",
                    "details": "Only admin users can access this endpoint"
                }, status=status.HTTP_200_OK)

            serializer = AdminDetailSerializer(user)
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Admin details retrieved successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except AttributeError:
            return Response({
                "status": False,
                "statusCode": 404,
                "error": "User not found",
                "details": "The authenticated user does not exist"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "error": "Something went wrong",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminLogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if not refresh_token:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": "Bad Request",
                    "details": "Refresh token is required for logout"
                }, status=status.HTTP_200_OK)

            try:
                token = RefreshToken(refresh_token)
                token.blacklist()  
            except TokenError:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": "Invalid token",
                    "details": "Token is already blacklisted or malformed"
                }, status=status.HTTP_200_OK)

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Logout successful"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "error": "Something went wrong",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminForgotPasswordAPIView(APIView):
    # authentication_classes = [JWTAuthentication] 
    # permission_classes = [IsAuthenticated]  

    def post(self, request):
        """Send password reset email to admin and return reset link in response"""
        ip = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', 'unknown')

        try:
            email = request.data.get("email")
            if not email:
                return Response(
                    {"statusCode": 400, "status": False, "message": "Email is required"},
                    status=status.HTTP_200_OK
                )
            try:
                user = AdminUser.objects.get(email=email, is_staff=True)  
            except AdminUser.DoesNotExist:
                return Response(
                    {"statusCode": 404, "status": False, "message": "Admin not found"},
                    status=status.HTTP_200_OK
                )

            token = default_token_generator.make_token(user)
            base_url = "http://23.23.88.239:7001/forgotpassword/"
            full_reset_link = f"{base_url}?token={token}&user_id={user.pk}"


            # try:
            #     send_mail(
            #         subject="Admin Password Reset Request",
            #         message=f"Click the link to reset your password: {full_reset_link}",
            #         from_email="your-email@gmail.com",
            #         recipient_list=[email],
            #         fail_silently=False,
            #     )
            #     logger.info(f"[Forgot Password] Reset email sent to: {email} | IP: {ip}")
            # except Exception as e:
            #     logger.error(f"[Forgot Password] Failed to send reset email to {email}: {e} | IP: {ip}")
            #     return Response(
            #         {"statusCode": 500, "status": False, "message": "Failed to send email", "error": str(e)},
            #         status=status.HTTP_500_INTERNAL_SERVER_ERROR
            #     )

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Password reset email sent",
                "reset_link": full_reset_link
            }, status=status.HTTP_200_OK)           

        except Exception as e:
            # logger.exception(f"[Forgot Password] Unexpected error: {e} | IP: {ip}")
            return Response(
                {"statusCode": 500, "status": False, "message": "An unexpected error occurred", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )




