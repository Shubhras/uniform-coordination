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
        user_id = request.auth.get("user_id")
        admin_user = AdminUser.objects.get(id=user_id)
        print("DEBUG request.user:", request.user)
        print("DEBUG type:", type(request.user))
        print("DEBUG role obj:", getattr(request.user, 'role', None))
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
                "status": False,
                "statusCode": 400,
                "message": "Email is required"
            }, status=status.HTTP_200_OK)

        try:
            user = AdminUser.objects.get(email=email, is_staff=True)
        except AdminUser.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Admin not found"
            }, status=status.HTTP_200_OK)

        token = default_token_generator.make_token(user)
        reset_link = f"http://23.23.88.239:7001/forgotpassword/?token={token}&user_id={user.id}"

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Password reset link generated",
            "reset_link": reset_link
        }, status=status.HTTP_200_OK)
