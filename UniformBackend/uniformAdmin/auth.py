from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django.db import transaction
from django.utils import timezone
from django.contrib.auth.tokens import default_token_generator
from .models import AdminUser
from .serializers import *
#use only temprarey check api 
from rest_framework.permissions import BasePermission
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from threading import Thread
from .utils import send_reset_email
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .fabric import CustomPagination

class IsAdminUserJWT(BasePermission):
    message = "Only admin users are allowed."
   
    def has_permission(self, request, view):
        jwt_auth = JWTAuthentication()
        try:
            header = jwt_auth.get_header(request)
            raw_token = jwt_auth.get_raw_token(header)
            validated_token = jwt_auth.get_validated_token(raw_token)
        except Exception:
            return False

        # Role must be admin
        role = validated_token.get("role")
        if role != "admin":
            return False

        # Fetch AdminUser safely
        try:
            user_id = validated_token.get("user_id")
            admin_user = AdminUser.objects.get(id=user_id)
            request.user = admin_user  # override request.user
            
        except AdminUser.DoesNotExist:
            return False

        return True



class LoginAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']

        remember_me = request.data.get("remember_me", False)

        refresh = RefreshToken.for_user(user)
        refresh["user_id"] = user.id
        refresh["role"] = "admin"

        if remember_me:
            refresh.set_exp(lifetime=timezone.timedelta(days=30))
            refresh.access_token.set_exp(lifetime=timezone.timedelta(days=30))
        else:
            refresh.set_exp(lifetime=timezone.timedelta(days=1))
            refresh.access_token.set_exp(lifetime=timezone.timedelta(hours=1))

        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Login successful",
            "data": {
                "admin": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "role": user.role.role_name if user.role else None
                },
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh)
            }
        }, status=status.HTTP_200_OK)
    
class ChangePasswordAPIView(APIView):
    permission_classes = [IsAdminUserJWT]

    def post(self, request):
        serializer = AdminChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        user = request.user

        with transaction.atomic():
            user.set_password(serializer.validated_data["new_password"])
            user.last_login = None
            user.save()

            tokens = OutstandingToken.objects.filter(user=user)
            for token in tokens:
                BlacklistedToken.objects.get_or_create(token=token)

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Password changed successfully. Please login again."
        }, status=status.HTTP_200_OK)

    
class UpdateProfileAPIView(APIView):
    permission_classes = [IsAdminUserJWT]

    def put(self, request):
        serializer = AdminUpdateSerializer(
            request.user,
            data=request.data,
            partial=True   
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Profile updated successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

class ProfileAPIView(APIView):
    permission_classes = [IsAdminUserJWT]

    def get(self, request):
        admin_user = request.user

        # admin_user = AdminUser.objects.get(id=user_id)
        serializer = AdminDetailSerializer(admin_user)
        #serializer = AdminDetailSerializer(request.user)
        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Admin profile fetched successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

class LogoutAPIView(APIView):
    permission_classes = [IsAdminUserJWT]

    def post(self, request):
        refresh_token = request.data.get("refresh_token")
        if not refresh_token:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Refresh token required"
            }, status=status.HTTP_200_OK)

        token = RefreshToken(refresh_token)
        token.blacklist()

        tokens = OutstandingToken.objects.filter(user=request.user)
        for t in tokens:
            BlacklistedToken.objects.get_or_create(token=t)

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Logout successful"
        }, status=status.HTTP_200_OK)

class ForgotPasswordAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({
                "statusCode":400,
                "status":False,
                "message":"Email required.",
            },status=status.HTTP_400_BAD_REQUEST)
        try:
            user = AdminUser.objects.get(email=email, is_active=True)
        except AdminUser.DoesNotExist:
            return Response({"status": False, "message": "User not found"}, status=404)

        token = PasswordResetTokenGenerator().make_token(user)
        reset_link = f"http://23.23.88.239:7001/reset-password/?uid={user.id}&token={token}"

        # ASYNC EMAIL
        Thread(
            target=send_reset_email,
            args=(
                "Reset Your Password",
                f"Click the link to reset password:\n{reset_link}",
                user.email,
            ),
        ).start()

        return Response({
            "status": True,
            "message": "Password reset link sent"
        }, status=200)


#<----------------------B2B--------------->
class AdminUserCreateAPIView(APIView):
    permission_classes = [IsAdminUserJWT]

    def post(self, request):
        try:
            serializer = AdminUserSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "statusCode":201,
                    "status": True,
                    "message": "B2B user created successfully",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)

            return Response({
                "statusCode":400,
                "status": False,
                "message":"Invalide data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({
                "statusCode":500,
                "status":False,
                "message":"Somthink went wrong on server",
                "error":str(e)
             },status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminUserListAPIView(APIView):
    permission_classes = [IsAdminUserJWT]

    def get(self, request):
        queryset = AdminUser.objects.all().order_by("-id")

        # SEARCH
        search = request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(company_name__icontains=search) |
                Q(email__icontains=search) |
                Q(mobile__icontains=search) |
                Q(tier__icontains=search)
            )

        # PAGINATION
        paginator = CustomPagination()
        page = paginator.paginate_queryset(queryset, request)

        serializer = AdminUserSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

class AdminUserDetailAPIView(APIView):
    permission_classes = [IsAdminUserJWT]

    def get(self, request, id):
        try:
            user = get_object_or_404(AdminUser, id=id)
            serializer = AdminUserSerializer(user)
            return Response({
                "statusCode":200,
                "status": True,
                "message":"User data fetch successfully. ",
                "data": serializer.data
            },status = status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                "statusCode":500,
                "status":False,
                "message":"Somthing went wrong on server",
                "error":str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
class AdminUserUpdateAPIView(APIView):
    permission_classes = [IsAdminUserJWT]

    def put(self, request, id):
        user = get_object_or_404(AdminUser, id=id)

        serializer = AdminUserSerializer(
            user,
            data=request.data,
            partial=True   
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": True,
                "message": "User updated successfully",
                "data": serializer.data
            })

        return Response({
            "status": False,
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class AdminUserDeleteAPIView(APIView):
    permission_classes = [IsAdminUserJWT]

    def delete(self, request):
        try:
            user_id = request.query_params.get("id")
            delete_all = request.query_params.get("all")
            ids = request.data.get("ids", [])

            # CONFLICT CHECK
            if delete_all and (user_id or ids):
                return Response({
                    "statusCode":400,
                    "status": False,
                    "message": "Cannot use 'all' with id or ids"
                }, status=status.HTTP_400_BAD_REQUEST)

            # DELETE ALL
            if delete_all == "true":
                count = AdminUser.objects.count()
                if count == 0:
                    return Response({
                        "statusCode":404,
                        "status": False,
                        "message": "No users found to delete"
                    }, status=status.HTTP_404_NOT_FOUND)

                AdminUser.objects.all().delete()
                return Response({
                    "statusCode":204,
                    "status": True,
                    "message": f"{count} users deleted successfully"
                }, status=status.HTTP_204_NO_CONTENT)

            # DELETE BY SINGLE ID
            if user_id:
                try:
                    user = AdminUser.objects.get(id=user_id)
                except AdminUser.DoesNotExist:
                    return Response({
                        "statusCode":404,
                        "status": False,
                        "message": "User not found"
                    }, status=status.HTTP_404_NOT_FOUND)

                user.delete()
                return Response({
                    "statusCode":204,
                    "status": True,
                    "message": "User deleted successfully"
                }, status=status.HTTP_204_NO_CONTENT)

            # BULK DELETE (ids list)
            if ids:
                if not isinstance(ids, list):
                    return Response({
                        "statusCode":400,
                        "status": False,
                        "message": "ids must be a list"
                    }, status=status.HTTP_400_BAD_REQUEST)

                users = AdminUser.objects.filter(id__in=ids)
                if not users.exists():
                    return Response({
                        "statusCode":404,
                        "status": False,
                        "message": "No matching users found"
                    }, status=status.HTTP_404_NOT_FOUND)

                deleted_count = users.count()
                users.delete()
                return Response({
                    "statusCode":204,
                    "status": True,
                    "message": f"{deleted_count} users deleted successfully"
                }, status=status.HTTP_204_NO_CONTENT)

            # NOTHING PROVIDED
            return Response({
                "statusCode":400,
                "status": False,
                "message": "Provide id, ids or all=true"
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                "statuscode":500,
                "status": False,
                "error": str(e)
            }, statuss=status.HTTP_500_INTERNAL_SERVER_ERROR)
