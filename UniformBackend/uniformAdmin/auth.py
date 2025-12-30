#<=======================Serializers==========================>
from django.contrib.auth import authenticate
from rest_framework import serializers
import re
from .models import *
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            email=attrs.get("email"),
            password=attrs.get("password")
        )

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("User is inactive")

        attrs["user"] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_new_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_new_password"]:
            raise serializers.ValidationError("New password and confirm password do not match")
        return attrs



class AdminUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminUser
        fields = ['name', 'mobile', 'language']

    def validate_mobile(self, value):
        if not re.match(r'^[6-9]\d{9}$', value):
            raise serializers.ValidationError("Enter a valid 10-digit mobile number")

        user = self.instance
        if AdminUser.objects.filter(mobile=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("Mobile number already exists")
        return value

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Please provide at least one field to update")
        return attrs
    

class AdminProfileSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.role_name', read_only=True)

    class Meta:
        model = AdminUser
        exclude = ['password']
        read_only_fields = [
            'id', 'email', 'name', 'mobile', 'language',
            'is_staff', 'is_superuser', 'last_login', 'created_at', 'updated_at'
        ]

class LogoutSerializer(serializers.Serializer):
    refresh_token = serializers.CharField(required=True)


class ForgetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        if not AdminUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email")
        return value


#<==============================APIView===========================>
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken,TokenError
from django.contrib.auth.tokens import default_token_generator


class LoginAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)

        # JWT custom claims
        refresh["user_id"] = user.id
        refresh["email"] = user.email
        refresh["role"] = user.role.role_name if user.role else None
        refresh["is_staff"] = user.is_staff

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Login successful",
            "data": {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role.role_name if user.role else None,
                },
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh)
            }
        }, status=status.HTTP_200_OK)



class ChangePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Password changed successfully"
        }, status=status.HTTP_200_OK)


class UpdateProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        serializer = AdminUpdateSerializer(
            instance=user,
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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  
        serializer = AdminProfileSerializer(user)
        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Profile fetched successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
 
class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh_token")
        if not refresh_token:
            return Response({
                "status": False,
                "statusCode": 400,
                "error": "Bad Request",
                "details": "Refresh token is required for logout"
            }, status=400)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Logout successful"
            }, status=200)

        except TokenError:
            return Response({
                "status": False,
                "statusCode": 400,
                "error": "Invalid token",
                "details": "Token is already blacklisted or malformed"
            }, status=400)  


class ForgotPasswordAPIView(APIView):
    authentication_classes = []  
    permission_classes = []

    def post(self, request):
        serializer = ForgetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        user = AdminUser.objects.get(email=email, is_staff=True)

        # Generate password reset token
        token = default_token_generator.make_token(user)

        # Construct reset link (frontend URL)
        base_url = "http://23.23.88.239:7001/forgotpassword/"
        full_reset_link = f"{base_url}?token={token}&user_id={user.pk}"

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Password reset email sent",
            "reset_link": full_reset_link
        }, status=status.HTTP_200_OK)
