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
from .models import AdminUser, Menu, RoleMenuPermission, RoleSubMenuPermission
from .serializers import *
from rest_framework.views import APIView
from rest_framework.permissions import BasePermission
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from threading import Thread
from .utils import send_reset_email
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .fabric import CustomPagination
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import jwt  # PyJWT library
from django.conf import settings
from drf_spectacular.utils import extend_schema,OpenApiExample,OpenApiResponse,OpenApiParameter,OpenApiTypes
from .utils import send_b2b_welcome_email

from userhub.models import Users

from .serializers import CustomerListSerializer



class IsAdminUserJWT(BaseAuthentication):
    """
    Custom JWT Authentication for AdminUser
    """

    def authenticate(self, request):
        # Get Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None  # No token provided

        # Extract token (accept with or without "Bearer ")
        if " " in auth_header:
            prefix, token = auth_header.split(" ", 1)
            if prefix.lower() != "bearer":
                raise AuthenticationFailed("Invalid token prefix")
        else:
            token = auth_header  # token sent directly without "Bearer"

        # Decode JWT
        try:
            decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid token")

        # Get user_id from token
        user_id = decoded.get("user_id")
        if not user_id:
            raise AuthenticationFailed("Token missing user ID")

        # Fetch admin user from DB
        try:
            user = AdminUser.objects.get(id=user_id, is_active=True)
        except AdminUser.DoesNotExist:
            raise AuthenticationFailed("User not found or inactive")

        # Optional: verify role is admin
        role = decoded.get("role")
        if role != "admin":
            raise AuthenticationFailed("You do not have admin access")

        # Return tuple (user, token) so request.user is set
        return (user, token)

#<-----------------------Authentication access Admin,B2B,Sales-------------------->

class MultiRoleJWTAuth(BaseAuthentication):
    """
    JWT Authentication for Admin, Sales, and B2B users
    """

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None

        # Extract token
        if " " in auth_header:
            prefix, token = auth_header.split(" ", 1)
            if prefix.lower() != "bearer":
                raise AuthenticationFailed("Invalid token prefix")
        else:
            token = auth_header

        # Decode JWT
        try:
            decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token expired")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid token")

        user_id = decoded.get("user_id")
        role_name = decoded.get("role")

        if not user_id or not role_name:
            raise AuthenticationFailed("Invalid token")

        try:
            user = AdminUser.objects.get(id=user_id, is_active=True)
        except AdminUser.DoesNotExist:
            raise AuthenticationFailed("User not found")

        # attach role instance for convenience
        user.role_instance = user.role  # original Role instance
        user.role_name = user.role.role_name if user.role else None

        if user.role_name.lower() != role_name.lower():
            raise AuthenticationFailed("Role mismatch")

        return (user, token)




class AdminSignupAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        tags=["Admin Authentication"],
        summary="Admin Signup",
        description="Register a new admin user.",
        request=AdminSignupSerializer,
        responses={
            201: OpenApiResponse(
                description="Signup successful",
                examples=[
                    OpenApiExample(
                        "Success",
                        value={
                            "status": True,
                            "statusCode": 201,
                            "message": "Admin user registered successfully",
                            "data": {
                                "id": 1,
                                "email": "admin@example.com",
                                "name": "Admin User",
                                "role": "admin"
                            }
                        }
                    )
                ]
            ),
            400: OpenApiResponse(description="Invalid input or validation error")
        }
    )
    def post(self, request):
        serializer = AdminSignupSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            first_error = None

            if isinstance(errors, dict):
                for key, value in errors.items():
                    if isinstance(value, list) and value:
                        first_error = value[0]
                        break

            return Response({
                "status": False,
                "statusCode": 400,
                "message": first_error or "Invalid input",
                "errors": errors
            }, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        response_serializer = AdminDetailSerializer(user)
        return Response({
            "status": True,
            "statusCode": 201,
            "message": "Admin user registered successfully",
            "data": response_serializer.data
        }, status=status.HTTP_201_CREATED)



class AdminLoginAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    @extend_schema(
    tags=["Admin Authentication"],
    summary="Admin Login",
    description="Login admin user and receive JWT access & refresh tokens.",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "email": {"type": "string", "example": "admin@example.com"},
                "password": {"type": "string", "example": "Admin@123"},
                "remember_me": {"type": "boolean", "example": True}
            },
            "required": ["email", "password"]
        }
    },
    responses={
        200: OpenApiResponse(
            description="Login successful",
            examples=[
                OpenApiExample(
                    "Success",
                    value={
                        "status": True,
                        "statusCode": 200,
                        "message": "Login successful",
                        "data": {
                            "user": {
                                "id": 1,
                                "email": "admin@example.com",
                                "name": "Admin User",
                                "role": "admin",
                                "permissions": []
                            },
                            "permissions": [],
                            "access_token": "jwt-access-token",
                            "refresh_token": "jwt-refresh-token"
                        }
                    }
                )
            ]
        ),
        400: OpenApiResponse(description="Invalid credentials")
    }
)
    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            first_error = None

            if isinstance(errors, dict):
                for key, value in errors.items():
                    if isinstance(value, list) and value:
                        first_error = value[0]
                        break

            return Response({
                "status": False,
                "statusCode": 400,
                "message": first_error or "Invalid input",
            }, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data["user"]
        remember_me = request.data.get("remember_me", False)

        # JWT token generate
        refresh = RefreshToken.for_user(user)
        refresh["user_id"] = user.id
        refresh["role"] = user.role.role_name if user.role else "user"

        # Token expiration
        if remember_me:
            refresh.set_exp(lifetime=timezone.timedelta(days=30))
            refresh.access_token.set_exp(lifetime=timezone.timedelta(days=30))
        else:
            refresh.set_exp(lifetime=timezone.timedelta(days=1))
            refresh.access_token.set_exp(lifetime=timezone.timedelta(hours=1))

        # Update last login
        user.last_login = timezone.now()
        user.is_currently_login = True
        user.save(update_fields=["last_login","is_currently_login"])

        # Fetch menu/submenu permissions for user's role
        role = user.role
        permissions_list = []
        if role:
            allowed_menu_ids = RoleMenuPermission.objects.filter(
                role=role, can_view=True
            ).values_list("menu_id", flat=True)

            allowed_submenu_ids = RoleSubMenuPermission.objects.filter(
                role=role, can_view=True
            ).values_list("submenu_id", flat=True)

            menus = Menu.objects.filter(
                id__in=allowed_menu_ids, isDeleted=False, isActive=True
            ).order_by("order")

            for menu in menus:
                submenus_list = []
                for sub in menu.submenus.filter(
                    id__in=allowed_submenu_ids, isDeleted=False, isActive=True
                ).order_by("order"):
                    submenus_list.append({
                        "id": sub.id,
                        "name": sub.name,
                        "slug": sub.slug,
                        "route": sub.route
                    })
                
                permissions_list.append({
                    "id": menu.id,
                    "name": menu.name,
                    "slug": menu.slug,
                    "icon": menu.icon,
                    "route": menu.route,
                    "submenus": submenus_list
                })

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Login successful",
            "data": {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "role": user.role.role_name if user.role else None,
                    # "permissions": permissions_list
                },
                "permissions": permissions_list,
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh)
            }
        }, status=200)
 
    
class ChangePasswordAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]
    #permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["Admin Authentication"],
    summary="Change Admin Password",
    description="Change password for logged-in admin. All tokens will be invalidated.",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "old_password": {"type": "string", "example": "Old@123"},
                "new_password": {"type": "string", "example": "New@123"}
            },
            "required": ["old_password", "new_password"]
        }
    },
    responses={
        200: OpenApiResponse(description="Password changed successfully"),
        400: OpenApiResponse(description="Validation error"),
        401: OpenApiResponse(description="Unauthorized")
    },

)
    def post(self, request):
        serializer = AdminChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        if not serializer.is_valid():
            return Response({
                "statusCode":400,
                "status":False,
                "message":"Validation Error",
                "error":serializer.errors
            },status=status.HTTP_400_BAD_REQUEST)

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
    authentication_classes = [IsAdminUserJWT]
    #permission_classes = [IsAdminUserJWT]

    @extend_schema(
    tags=["Admin Authentication"],
    summary="Update Admin Profile",
    description="Update admin profile details.",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "example": "Updated Admin"},
                "email": {"type": "string", "example": "admin@company.com"}
            }
        }
    },
    responses={
        200: OpenApiResponse(description="Profile updated successfully"),
        400: OpenApiResponse(description="Invalid input"),
        401: OpenApiResponse(description="Unauthorized")
    },
    # security=[{"AdminJWTAuth": []}]
)
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
    authentication_classes = [IsAdminUserJWT]
    #permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["Admin Authentication"],
    summary="Get Admin Profile",
    description="Fetch logged-in admin profile details.",
    responses={
        200: OpenApiResponse(description="Profile fetched successfully"),
        401: OpenApiResponse(description="Unauthorized")
    },
    # security=[{"AdminJWTAuth": []}]
    )
    def get(self, request):
       try:
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
       
       except Exception as e:
           return Response({
               "statusCode":500,
               "status":False,
               "message":"Somthing went wrong server",
               "error":str(e)
           },status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LogoutAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]
    # permission_classes = [IsAdminUserJWT]
    permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["Admin Authentication"],
    summary="Admin Logout",
    description="Logout admin and blacklist refresh token.",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "refresh_token": {
                    "type": "string",
                    "example": "jwt-refresh-token"
                }
            },
            "required": ["refresh_token"]
        }
    },
    responses={
        200: OpenApiResponse(description="Logout successful"),
        400: OpenApiResponse(description="Refresh token required"),
        401: OpenApiResponse(description="Unauthorized")
    },
    # security=[{"AdminJWTAuth": []}]
    )
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

        user = request.user
        user.is_currently_login = False
        user.save(update_fields=['is_currently_login'])    

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Logout successful"
        }, status=status.HTTP_200_OK)


class ForgotPasswordAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        tags=["Admin Authentication"],
        summary="Forgot Password",
        description="Send password reset link to admin email.",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "email": {"type": "string", "example": "admin@example.com"},
                    "type": {
                        "type": "string",
                        "example": "uniform",
                        "enum": ["uniform", "table"]
                    }
                },
                "required": ["email", "userType"]
            }
        },
        responses={
            200: OpenApiResponse(description="Reset link sent"),
            400: OpenApiResponse(description="Invalid request"),
            404: OpenApiResponse(description="User not found")
        }
    )
    def post(self, request):
        email = request.data.get("email")
        user_type = request.data.get("userType")

        if not email:
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Email is required."
            }, status=status.HTTP_400_BAD_REQUEST)

        if not user_type:
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "userType is required."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = AdminUser.objects.get(email=email, is_active=True)
        except AdminUser.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "User not found."
            }, status=status.HTTP_404_NOT_FOUND)

        token = PasswordResetTokenGenerator().make_token(user)

        # Generate frontend URL based on type
        if user_type.lower() == "uniform":
            # base_url = "http://23.23.88.239:7002"
            base_url = "http://104.64.206.82:7002"
        elif user_type.lower() == "table":
            base_url = "http://23.23.88.239:7001"
        else:
            return Response({   
                "status": False,
                "statusCode": 400,
                "message": "Invalid userType. Allowed values are 'uniform' or 'table'."
            }, status=status.HTTP_400_BAD_REQUEST)

        reset_link = f"{base_url}/reset-password/?user_id={user.id}&token={token}"

        Thread(
            target=send_reset_email,
            args=(
                "Reset Your Password",
                f"Click the link to reset your password:\n{reset_link}",
                user.email,
            ),
        ).start()

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Password reset link sent successfully."
        }, status=status.HTTP_200_OK)


class ResetPasswordAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Admin User"],
        summary="Change Password",
        description="Change password for logged-in admin user.",
        request=UpdateChangePasswordSerializer,
        responses={
            200: OpenApiResponse(description="Password changed successfully"),
            400: OpenApiResponse(description="Validation error"),
            401: OpenApiResponse(description="Unauthorized"),
        },
    )
    def post(self, request):
        serializer = UpdateChangePasswordSerializer(
            data=request.data,
            context={"request": request}
        )

        if not serializer.is_valid():
            return Response(
                {
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation Error",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user

        with transaction.atomic():
            user.set_password(serializer.validated_data["new_password"])
            user.save()

        return Response(
            {
                "status": True,
                "statusCode": 200,
                "message": "Password changed successfully.",
            },
            status=status.HTTP_200_OK,
        )
class ChangePasswordAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        tags=["Admin User"],
        summary="Change Password",
        description="Change password using user ID.",
        request=ChangePasswordSerializer,
        responses={
            200: OpenApiResponse(description="Password changed successfully"),
            400: OpenApiResponse(description="Validation error"),
            404: OpenApiResponse(description="User not found"),
        },
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation Error",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = AdminUser.objects.get(id=serializer.validated_data["user_id"])
        except AdminUser.DoesNotExist:
            return Response(
                {
                    "status": False,
                    "statusCode": 404,
                    "message": "User not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        with transaction.atomic():
            user.set_password(serializer.validated_data["new_password"])
            user.save()

        return Response(
            {
                "status": True,
                "statusCode": 200,
                "message": "Password changed successfully."
            },
            status=status.HTTP_200_OK,
        )     


class CreateRoleAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Role"],
        summary="Create Role",
        description="Create a new role.",
        request=RoleSerializer,
        responses={
            201: RoleSerializer,
            400: OpenApiResponse(description="Validation Error"),
        },
    )
    def post(self, request):
        serializer = RoleSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "status": True,
                    "message": "Role created successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {
                "status": False,
                "message": "Validation Error.",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
        
        
class RoleListAPIView(APIView):
    # permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Role"],
        summary="List Roles",
        description="Get all roles.",
        responses={200: RoleSerializer(many=True)},
    )
    def get(self, request):
        roles = Role.objects.all().order_by("id")
        serializer = RoleSerializer(roles, many=True)

        return Response(
            {
                "status": True,
                "message": "Role list fetched successfully.",
                "count": roles.count(),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
                
#<----------------------B2B--------------->
# class AdminUserCreateAPIView(APIView):
#     authentication_classes = [IsAdminUserJWT]

#     def post(self, request):
#         try:
#             serializer = AdminUserSerializer(data=request.data)
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response({
#                     "statusCode":201,
#                     "status": True,
#                     "message": "B2B user created successfully",
#                     "data": serializer.data
#                 }, status=status.HTTP_201_CREATED)

#             return Response({
#                 "statusCode":400,
#                 "status": False,
#                 "message":"Invalide data",
#                 "errors": serializer.errors
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         except Exception as e:
#             return Response({
#                 "statusCode":500,
#                 "status":False,
#                 "message":"Somthink went wrong on server",
#                 "error":str(e)
#              },status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminUserCreateAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
    tags=["Admin Users"],
    summary="Create Admin/B2B User",
    description="Create a new admin or B2B user. Created admin ID is auto-attached from logged-in admin.",
    request=AdminUserSerializer,
    responses={
        201: OpenApiResponse(
            description="User created successfully",
            response=AdminUserSerializer
        ),
        400: OpenApiResponse(description="Invalid data"),
        401: OpenApiResponse(description="Unauthorized"),
        500: OpenApiResponse(description="Server error"),
    }
    )
    def post(self, request):
        try:
            # Automatically attach the admin ID from the logged-in user
            data = request.data.copy()
            data["created_by_admin_id"] = request.user.id  # admin ID attach

            serializer = AdminUserSerializer(data=data)
            if serializer.is_valid():
                user = serializer.save()

                raw_password = request.data.get("password")

    
                send_b2b_welcome_email(user, raw_password)

                return Response({
                    "statusCode": 201,
                    "status": True,
                    "message": "B2B user created successfully",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)

            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": "Something went wrong on server",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminUserListAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Admin Users"],
        summary="List Admin Users",
        description="Get list of admin users with search and pagination support.",
        parameters=[
            OpenApiParameter(
                name="search",
                description="Search by name, email, company name, mobile or tier",
                required=False,
                type=str
            ),
            OpenApiParameter(
                name="page",
                description="Page number",
                required=False,
                type=int
            ),
            OpenApiParameter(
                name="page_size",
                description="Number of items per page",
                required=False,
                type=int
            ),
        ],
        responses={
            200: OpenApiResponse(description="User list fetched successfully"),
            401: OpenApiResponse(description="Unauthorized"),
            400: OpenApiResponse(description="Validation error"),
        }
    )
    def get(self, request):
        try:
            queryset = AdminUser.objects.filter(is_staff=False).order_by("-id")

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
                
            # Active Filter
            is_active = request.query_params.get("isActive")
            if is_active is not None:
                queryset = queryset.filter(
                    is_active=is_active.lower() == "true"
                )    

            # PAGINATION
            paginator = CustomPagination()
            page = paginator.paginate_queryset(queryset, request)

            serializer = AdminUserSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        except ValidationError as ve:
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Validation Error",
                "error": str(ve)
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": "Something went wrong.",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminUserDetailAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
    tags=["Admin Users"],
    summary="Get Admin User Detail",
    description="Fetch admin user details by user ID.",
    parameters=[
        OpenApiParameter(
            name="id",
            description="Admin User ID",
            required=True,
            type=int,
            location=OpenApiParameter.PATH
        )
    ],
    responses={
        200: OpenApiResponse(
            description="User data fetched successfully",
            response=AdminUserSerializer
        ),
        404: OpenApiResponse(description="User not found"),
        401: OpenApiResponse(description="Unauthorized"),
        500: OpenApiResponse(description="Server error"),
    }
    )
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
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
    tags=["Admin Users"],
    summary="Update Admin User",
    description="Update admin user details partially or fully.",
    request=AdminUserSerializer,
    parameters=[
        OpenApiParameter(
            name="id",
            description="Admin User ID",
            required=True,
            type=int,
            location=OpenApiParameter.PATH
        )
    ],
    responses={
        200: OpenApiResponse(
            description="User updated successfully",
            response=AdminUserSerializer
        ),
        400: OpenApiResponse(description="Validation error"),
        404: OpenApiResponse(description="User not found"),
        401: OpenApiResponse(description="Unauthorized"),
    }
    )
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
                "statusCode":200,
                "status": True,
                "message": "User updated successfully",
                "data": serializer.data
            },status=status.HTTP_200_OK)

        return Response({
            "statusCode":400,
            "status": False,
            "message":"Validation Error",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class AdminUserDeleteAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]


    @extend_schema(
    tags=["Admin Users"],
    summary="Delete Admin User(s)",
    description="""
Delete admin users using one of the following:
- Single user by `id`
- Multiple users using `ids` list in request body
- Delete all users using `all=true`
""",
    parameters=[
        OpenApiParameter(
            name="id",
            description="Single Admin User ID",
            required=False,
            type=int
        ),
        OpenApiParameter(
            name="all",
            description="Delete all users (true/false)",
            required=False,
            type=bool
        ),
    ],
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "ids": {
                    "type": "array",
                    "items": {"type": "integer"},
                    "example": [1, 2, 3]
                }
            }
        }
    },
    responses={
        204: OpenApiResponse(description="User(s) deleted successfully"),
        400: OpenApiResponse(description="Invalid request"),
        404: OpenApiResponse(description="User not found"),
        401: OpenApiResponse(description="Unauthorized"),
        500: OpenApiResponse(description="Server error"),
    }
    )
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
            
            

class CustomerListAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Admin Customers"],
        summary="Customer List",
        description="""
        Returns a paginated list of all customers.

        Supports:
        - Search
        - Pagination
        - User Type filter
        - Active status filter
        - Verification status filter
        """,
        parameters=[
            OpenApiParameter(
                name="search",
                description="Search by username, first name, last name, email or phone.",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="userType",
                description="Filter by user type (uniform/table).",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="isActive",
                description="Filter active users (true/false).",
                required=False,
                type=bool,
            ),
            OpenApiParameter(
                name="is_verify",
                description="Filter verified users (true/false).",
                required=False,
                type=bool,
            ),
            OpenApiParameter(
                name="page",
                description="Page number.",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="page_size",
                description="Items per page.",
                required=False,
                type=int,
            ),
        ],
        responses={
            200: OpenApiResponse(description="Customer list fetched successfully."),
            400: OpenApiResponse(description="Validation Error"),
            401: OpenApiResponse(description="Unauthorized"),
        },
    )
    def get(self, request):
        try:
            queryset = Users.objects.filter(
                isDeleted=False
            ).order_by("-id")

            # Search
            search = request.query_params.get("search")
            if search:
                queryset = queryset.filter(
                    Q(userName__icontains=search)
                    | Q(firstName__icontains=search)
                    | Q(lastName__icontains=search)
                    | Q(email__icontains=search)
                    | Q(phone__icontains=search)
                )

            # User Type Filter
            user_type = request.query_params.get("userType")
            if user_type:
                queryset = queryset.filter(userType__iexact=user_type)

            # Active Filter
            is_active = request.query_params.get("isActive")
            if is_active is not None:
                queryset = queryset.filter(
                    isActive=is_active.lower() == "true"
                )

            # Verify Filter
            is_verify = request.query_params.get("is_verify")
            if is_verify is not None:
                queryset = queryset.filter(
                    is_verify=is_verify.lower() == "true"
                )

            paginator = CustomPagination()
            page = paginator.paginate_queryset(queryset, request)

            serializer = CustomerListSerializer(page, many=True)

            return paginator.get_paginated_response(serializer.data)

        except ValidationError as e:
            return Response(
                {
                    "statusCode": 400,
                    "status": False,
                    "message": "Validation Error",
                    "error": str(e),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            return Response(
                {
                    "statusCode": 500,
                    "status": False,
                    "message": "Something went wrong on server.",
                    "error": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
                        
class CustomerDetailAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Admin Customers"],
        summary="Customer Details",
        description="Get complete details of a customer by ID.",
        parameters=[
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                description="Customer ID",
                required=True,
                type=int,
            )
        ],
        responses={
            200: OpenApiResponse(description="Customer details fetched successfully."),
            404: OpenApiResponse(description="Customer not found."),
            401: OpenApiResponse(description="Unauthorized"),
        },
    )
    def get(self, request, id):
        try:
            customer = Users.objects.get(
                id=id,
                isDeleted=False
            )

            serializer = CustomerDetailSerializer(customer)

            return Response(
                {
                    "statusCode": 200,
                    "status": True,
                    "message": "Customer details fetched successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        except Users.DoesNotExist:
            return Response(
                {
                    "statusCode": 404,
                    "status": False,
                    "message": "Customer not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            return Response(
                {
                    "statusCode": 500,
                    "status": False,
                    "message": "Something went wrong on server.",
                    "error": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
            

class CustomerUpdateAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Admin Customers"],
        summary="Update Customer",
        description="Update customer details by ID.",
        parameters=[
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                required=True,
                type=int,
                description="Customer ID",
            )
        ],
        request=CustomerUpdateSerializer,
        responses={
            200: OpenApiResponse(description="Customer updated successfully."),
            400: OpenApiResponse(description="Validation Error"),
            404: OpenApiResponse(description="Customer not found"),
        },
    )
    def put(self, request, id):
        try:
            customer = Users.objects.get(
                id=id,
                isDeleted=False
            )

            serializer = CustomerUpdateSerializer(
                customer,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():
                serializer.save()

                return Response(
                    {
                        "statusCode": 200,
                        "status": True,
                        "message": "Customer updated successfully.",
                        "data": serializer.data,
                    },
                    status=status.HTTP_200_OK,
                )

            return Response(
                {
                    "statusCode": 400,
                    "status": False,
                    "message": "Validation Error.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Users.DoesNotExist:
            return Response(
                {
                    "statusCode": 404,
                    "status": False,
                    "message": "Customer not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            return Response(
                {
                    "statusCode": 500,
                    "status": False,
                    "message": "Something went wrong on server.",
                    "error": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
                        