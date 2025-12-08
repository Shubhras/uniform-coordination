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
                    "access": access_token,
                    "refresh": refresh_token,
                    "admin": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "role": "admin",
                        "remember_me": remember_me,
                    }
                }
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except ValidationError as ve:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Validation Error",
                "errors": ve.detail
            }, status=status.HTTP_400_BAD_REQUEST)

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
            }, status=status.HTTP_400_BAD_REQUEST)

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
            }, status=status.HTTP_400_BAD_REQUEST)

        except ObjectDoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

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
                }, status=status.HTTP_403_FORBIDDEN)

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
            }, status=status.HTTP_404_NOT_FOUND)

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
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                token = RefreshToken(refresh_token)
                token.blacklist()  
            except TokenError:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "error": "Invalid token",
                    "details": "Token is already blacklisted or malformed"
                }, status=status.HTTP_400_BAD_REQUEST)

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



