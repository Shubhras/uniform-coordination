from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from uniformAdmin.serializers import *
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from rest_framework_simplejwt.authentication import JWTAuthentication
from datetime import timedelta
from django.shortcuts import get_object_or_404
from django.contrib.auth.tokens import default_token_generator
from uniformAdmin.fabric import CustomPagination
from rest_framework.parsers import MultiPartParser, FormParser
from .models import *
from userhub.models import QuotationRequest
from userhub.serializers import QuotationRequestSerializer
from django.db.models import Q
from .fabric import CustomPagination
import traceback
from django.utils.timezone import now
from .fabric import  IsAdministrator 
from django.db.models import Count
from django.db.models.functions import ExtractMonth, ExtractWeek, ExtractWeekDay
from .auth import IsAdminUserJWT,MultiRoleJWTAuth
from drf_spectacular.utils import extend_schema,OpenApiExample,OpenApiResponse,OpenApiParameter,OpenApiTypes

# class AdminLoginAPIView(APIView):
#     authentication_classes = []   # IMPORTANT
#     permission_classes = []       # IMPORTANT

#     def post(self, request):
#         try:
#             serializer = AdminLoginSerializer(data=request.data)
#             serializer.is_valid(raise_exception=True)
#             user = serializer.validated_data['user']

#             remember_me = request.data.get('remember_me', False)
#             if isinstance(remember_me, str):
#                 remember_me = remember_me.lower() == 'true'

#             refresh = RefreshToken.for_user(user)
#             refresh["user_id"] = str(user.id)
#             refresh["role"] = "admin"

#             if remember_me:
#                 refresh.set_exp(lifetime=timedelta(days=30))
#                 refresh.access_token.set_exp(lifetime=timedelta(days=30))
#             else:
#                 refresh.set_exp(lifetime=timedelta(days=1))
#                 refresh.access_token.set_exp(lifetime=timedelta(hours=1))

#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Login successful",
#                 "data": {
#                     "admin": {
#                         "id": user.id,
#                         "email": user.email,
#                         "role": user.role.role_name if user.role else None,
#                         "name": user.name,
#                         "remember_me": remember_me,
#                     },
#                     "access_token": str(refresh.access_token),
#                     "refresh_token": str(refresh),
#                 }
#             }, status=status.HTTP_200_OK)

#         except ValidationError as ve:
#             return Response({
#                 "status": False,
#                 "statusCode": 400,
#                 "message": "Invalid email or password",
#                 "errors": ve.detail
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": "Something went wrong",
#                 "errors": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class AdminChangePasswordAPIView(APIView):
#     permission_classes = [IsAuthenticated]  

#     def post(self, request):
#         try:
#             serializer = AdminChangePasswordSerializer(data=request.data, context={'request': request})
#             serializer.is_valid(raise_exception=True)
#             user = request.user

#             # Set new password
#             with transaction.atomic():
#                 user.set_password(serializer.validated_data['new_password'])
#                 user.save()

#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Password changed successfully"
#             }, status=status.HTTP_200_OK)

#         except ValidationError as ve:
#             # **Return 400 for validation errors**
#             return Response({
#                 "status": False,
#                 "statusCode": 400,
#                 "message": "Validation Error",
#                 "errors": ve.detail
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             # **Only unexpected errors return 500**
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": "Something went wrong",
#                 "errors": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class AdminUpdateProfileAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def patch(self, request):
#         try:
#             user = request.user  
#             serializer = AdminUpdateSerializer(user, data=request.data, partial=True)
            
#             if serializer.is_valid(raise_exception=True):
#                 serializer.save()
#                 return Response({
#                     "status": True,
#                     "statusCode": 200,
#                     'message': 'Profile updated successfully',
#                     'data': serializer.data
#                 }, status=status.HTTP_200_OK)

#         except ValidationError as ve:
#             return Response({
#                 "status": False,
#                 "statusCode": 400,
#                 'message': 'Validation error',
#                 'errors': ve.message_dict
#             }, status=status.HTTP_200_OK)

#         except ObjectDoesNotExist:
#             return Response({
#                 "status": False,
#                 "statusCode": 404,
#                 'error': 'User not found'
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 'error': 'Something went wrong',
#                 'details': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)        


# class AdminDetailAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         try:
#             user = request.user

#             jwt_auth = JWTAuthentication()

#             header = jwt_auth.get_header(request)
#             raw_token = jwt_auth.get_raw_token(header)
#             validated_token = jwt_auth.get_validated_token(raw_token)

#             role = validated_token.get('role')

#             if role != 'admin':
#                 return Response({
#                     "status": False,
#                     "statusCode": 403,
#                     "error": "Forbidden",
#                     "details": "Only admin users can access this endpoint"
#                 }, status=status.HTTP_200_OK)

#             serializer = AdminDetailSerializer(user)
#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Admin details retrieved successfully",
#                 "data": serializer.data
#             }, status=status.HTTP_200_OK)

#         except AttributeError:
#             return Response({
#                 "status": False,
#                 "statusCode": 404,
#                 "error": "User not found",
#                 "details": "The authenticated user does not exist"
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "error": "Something went wrong",
#                 "details": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class AdminLogoutAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         try:
#             refresh_token = request.data.get("refresh_token")
#             if not refresh_token:
#                 return Response({
#                     "status": False,
#                     "statusCode": 400,
#                     "error": "Bad Request",
#                     "details": "Refresh token is required for logout"
#                 }, status=status.HTTP_200_OK)

#             try:
#                 token = RefreshToken(refresh_token)
#                 token.blacklist()  
#             except TokenError:
#                 return Response({
#                     "status": False,
#                     "statusCode": 400,
#                     "error": "Invalid token",
#                     "details": "Token is already blacklisted or malformed"
#                 }, status=status.HTTP_200_OK)

#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Logout successful"
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "error": "Something went wrong",
#                 "details": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class AdminForgotPasswordAPIView(APIView):
#     # authentication_classes = [JWTAuthentication] 
#     # permission_classes = [IsAuthenticated]  

#     def post(self, request):
#         """Send password reset email to admin and return reset link in response"""
#         ip = request.META.get('REMOTE_ADDR')
#         user_agent = request.META.get('HTTP_USER_AGENT', 'unknown')

#         try:
#             email = request.data.get("email")
#             if not email:
#                 return Response(
#                     {"statusCode": 400, "status": False, "message": "Email is required"},
#                     status=status.HTTP_200_OK
#                 )
#             try:
#                 user = AdminUser.objects.get(email=email, is_staff=True)  
#             except AdminUser.DoesNotExist:
#                 return Response(
#                     {"statusCode": 404, "status": False, "message": "Admin not found"},
#                     status=status.HTTP_200_OK
#                 )

#             token = default_token_generator.make_token(user)
#             base_url = "http://23.23.88.239:7001/forgotpassword/"
#             full_reset_link = f"{base_url}?token={token}&user_id={user.pk}"


#             # try:
#             #     send_mail(
#             #         subject="Admin Password Reset Request",
#             #         message=f"Click the link to reset your password: {full_reset_link}",
#             #         from_email="your-email@gmail.com",
#             #         recipient_list=[email],
#             #         fail_silently=False,
#             #     )
#             #     logger.info(f"[Forgot Password] Reset email sent to: {email} | IP: {ip}")
#             # except Exception as e:
#             #     logger.error(f"[Forgot Password] Failed to send reset email to {email}: {e} | IP: {ip}")
#             #     return Response(
#             #         {"statusCode": 500, "status": False, "message": "Failed to send email", "error": str(e)},
#             #         status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             #     )

#             return Response({
#                 "statusCode": 200,
#                 "status": True,
#                 "message": "Password reset email sent",
#                 "reset_link": full_reset_link
#             }, status=status.HTTP_200_OK)           

#         except Exception as e:
#             # logger.exception(f"[Forgot Password] Unexpected error: {e} | IP: {ip}")
#             return Response(
#                 {"statusCode": 500, "status": False, "message": "An unexpected error occurred", "error": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#<--------------------TableTheme------------------

class TableThemeCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    @extend_schema(
    tags=["Table Theme"],
    summary="Create Table Theme",
    description="Create a new table theme.",
    request=TableThemeSerializer,
    responses={
        201: OpenApiResponse(description="Table theme created successfully"),
        400: OpenApiResponse(description="Validation failed"),
        500: OpenApiResponse(description="Server error"),
    },
)
    
    def post(self,request):
        try:
            serializer = TableThemeSerializer(data=request.data,context={"request": request})
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "statusCode":201,
                    "status":True,
                    "message":"Table Theme create successfully.",
                    "data":serializer.data
                },status=status.HTTP_201_CREATED)
            else:
                return Response({
                    "statusCode":400,
                    "status":True,
                    "message":"Validation failed Table name issue.",
                    "error":serializer.errors
                },status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({
                "statusCode":500,
                "status":False,
                "message":"Server error while creating table",
                "error":str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TableThemeListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    @extend_schema(
    tags=["Table Theme"],
    summary="List Table Themes",
    description="Fetch all table themes (not deleted).",
    responses={
        200: OpenApiResponse(description="Table themes fetched successfully"),
        500: OpenApiResponse(description="Server error"),
    },
)
    def get(self,request):
        try:
            themes = TableTheme.objects.filter(isDeleted=False)
            serializer = TableThemeSerializer(themes,many=True, context={"request": request})
            return Response({
                "statusCode":200,
                "status":True,
                "message":"Table Themes Successfully fetch.",
                "data":serializer.data
            },status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                "statusCode":500,
                "status":False,
                "message":"Server error while creating table",
                "error":str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)
  

class TableThemeDetailAPIView(APIView):
    
    @extend_schema(
    tags=["Table Theme"],
    summary="Get Table Theme Detail",
    description="Fetch a single table theme by ID.",
    parameters=[
        OpenApiParameter(
            name="id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description="Table Theme ID",
        )
    ],
    responses={
        200: OpenApiResponse(description="Table theme fetched successfully"),
        404: OpenApiResponse(description="Table theme not found"),
    },
)
    def get(self, request, id):
        try:
            theme = TableTheme.objects.get(id=id, isDeleted=False,)
            serializer = TableThemeSerializer(theme,context={"request": request})
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Table theme fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except TableTheme.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Table theme not found",
                "data": None
            }, status=status.HTTP_404_NOT_FOUND)
        
        
class TableThemeUpdateAPIView(APIView):
    @extend_schema(
    tags=["Table Theme"],
    summary="Update Table Theme",
    description="Update an existing table theme (partial update allowed).",
    parameters=[
        OpenApiParameter(
            name="id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description="Table Theme ID",
        )
    ],
    request=TableThemeSerializer,
    responses={
        200: OpenApiResponse(description="Table theme updated successfully"),
        400: OpenApiResponse(description="Validation error"),
        404: OpenApiResponse(description="Table theme not found"),
    },
)
    def put(self, request, id):
        try:
            theme = TableTheme.objects.get(id=id, isDeleted=False)

            serializer = TableThemeSerializer(
                theme,
                data=request.data,
                partial=True,  # KEY FIX
                context={"request": request}
            )

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Table theme updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Validation error",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except TableTheme.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Table theme not found"
            }, status=status.HTTP_404_NOT_FOUND)
        

class TableThemeDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    @extend_schema(
    tags=["Table Theme"],
    summary="Delete Table Theme",
    description=(
        "Delete table themes.\n\n"
        "• Delete single by URL `pk`\n"
        "• Delete all → `{ \"ids\": \"all\" }`\n"
        "• Bulk delete → `{ \"ids\": [1,2,3] }`"
    ),
    parameters=[
        OpenApiParameter(
            name="pk",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            required=False,
            description="Table Theme ID (optional)",
        )
    ],
    request=OpenApiTypes.OBJECT,
    examples=[
        OpenApiExample(
            "Delete All",
            value={"ids": "all"},
            request_only=True,
        ),
        OpenApiExample(
            "Bulk Delete",
            value={"ids": [1, 2, 3]},
            request_only=True,
        ),
    ],
    responses={
        200: OpenApiResponse(description="Table theme(s) deleted successfully"),
        204: OpenApiResponse(description="Table theme deleted successfully"),
        400: OpenApiResponse(description="Invalid request"),
        404: OpenApiResponse(description="Table theme not found"),
    },
)
    def delete(self, request, pk=None):
        ids = request.data.get('ids', None)  

        # Single delete by URL pk
        if pk:
            try:
                theme = TableTheme.objects.get(pk=pk, isDeleted=False)
                theme.isDeleted = True
                theme.save()

                return Response({
                    "statusCode": 204,
                    "status": True,
                    "message": "Table theme deleted successfully.",
                    "data": None
                }, status=status.HTTP_204_NO_CONTENT)

            except TableTheme.DoesNotExist:
                return Response({
                    "statusCode": 404,
                    "status": False,
                    "message": "Table theme not found.",
                    "data": None
                }, status=status.HTTP_404_NOT_FOUND)

        # Delete all
        if ids == "all":
            queryset = TableTheme.objects.filter(isDeleted=False)
            count = queryset.count()
            queryset.update(isDeleted=True)
            return Response({
                "statusCode": 200,
                "status": True,
                "message": f"All {count} table themes deleted successfully.",
                "data": None
            }, status=status.HTTP_200_OK)

        # Bulk delete by list of IDs
        if not ids or not isinstance(ids, list):
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Please provide a list of IDs in 'ids' field or 'all'.",
                "data": None
            }, status=status.HTTP_400_BAD_REQUEST)

        queryset = TableTheme.objects.filter(id__in=ids, isDeleted=False)
        count = queryset.count()
        queryset.update(isDeleted=True)

        return Response({
            "statusCode": 200,
            "status": True,
            "message": f"{count} table themes deleted successfully.",
            "data": None
        }, status=status.HTTP_200_OK)

# products/views/update_product.py
class AdminCreateProductAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    @extend_schema(
    tags=["Admin Product"],
    summary="Create Product",
    description="Create a new product (Admin only).",
    request=ProductSerializer,
    responses={
        201: OpenApiResponse(description="Product created successfully"),
        400: OpenApiResponse(description="Validation failed"),
        500: OpenApiResponse(description="Server error"),
    },
)
    def post(self, request):
        try:
            serializer = ProductSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 201,
                    "message": "Product created successfully.",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)

             #  ONLY CHANGE STARTS HERE
            if "theme" in serializer.errors:
                error_msg = serializer.errors["theme"][0]

                if "not allowed" in error_msg:
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": "Theme is not allowed for Uniform"
                    }, status=status.HTTP_200_OK)

                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation failed;Please Select Themes"
                }, status=status.HTTP_200_OK)

            
            #  Specific validation messages
            if "productName" in serializer.errors:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation failed; product name issue.",
                    "error": serializer.errors["productName"]
                }, status=status.HTTP_200_OK)

            if "subcategory" in serializer.errors:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Subcategory does not belong to selected category.",
                    "error": serializer.errors["subcategory"]
                }, status=status.HTTP_200_OK)

            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Validation failed.",
                "error": serializer.errors
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while creating product.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminUpdateProductAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    @extend_schema(
    tags=["Admin Product"],
    summary="Update Product",
    description="Update an existing product (partial update supported).",
    parameters=[
        OpenApiParameter(
            name="pk",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description="Product ID",
        )
    ],
    request=ProductSerializer,
    responses={
        200: OpenApiResponse(description="Product updated successfully"),
        400: OpenApiResponse(description="Validation failed"),
        404: OpenApiResponse(description="Product not found"),
        500: OpenApiResponse(description="Server error"),
    },
)
    def put(self, request, pk):
        try:
            product = Product.objects.filter(pk=pk, isDeleted=False).first()
            if not product:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "Product not found."
                }, status=status.HTTP_200_OK)

            serializer = ProductSerializer(product, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Product updated successfully.",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Validation failed.",
                "error": serializer.errors
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while updating product.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# products/views/get_product.py

class AdminGetProductAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    @extend_schema(
    tags=["Admin Product"],
    summary="Get Product Detail",
    description="Fetch a single product by ID.",
    parameters=[
        OpenApiParameter(
            name="pk",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description="Product ID",
        )
    ],
    responses={
        200: OpenApiResponse(description="Product fetched successfully"),
        404: OpenApiResponse(description="Product not found"),
        500: OpenApiResponse(description="Server error"),
    },
)
    def get(self, request, pk):
        try:
            product = Product.objects.filter(pk=pk, isDeleted=False).first()
            if not product:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "Product not found."
                }, status=status.HTTP_200_OK)

            serializer = ProductSerializer(product)
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Product fetched successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while fetching product.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# products/views/list_products.py

class AdminListProductsAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    @extend_schema(
    tags=["Admin Product"],
    summary="List Products",
    description="Fetch all products. Optional filter by subcategory ID.",
    parameters=[
        OpenApiParameter(
            name="subcategoryId",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            required=False,
            description="Filter products by subcategory ID",
        )
    ],
    responses={
        200: OpenApiResponse(description="Products fetched successfully"),
        500: OpenApiResponse(description="Server error"),
    },
)
    def get(self, request):
        try:
            subcategory_id = request.query_params.get("subcategoryId")

            products = Product.objects.filter(isDeleted=False)

            #  FILTER BY SUBCATEGORY ID
            if subcategory_id and subcategory_id.isdigit():
                products = products.filter(subcategory_id=int(subcategory_id))

            products = products.order_by("-created_at")

            serializer = ProductSerializer(products, many=True)

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Products fetched successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while fetching products.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# products/views/delete_product.py
class AdminDeleteProductAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    @extend_schema(
    tags=["Admin Product"],
    summary="Delete Product",
    description="Soft delete a product by ID.",
    parameters=[
        OpenApiParameter(
            name="pk",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description="Product ID",
        )
    ],
    responses={
        200: OpenApiResponse(description="Product deleted successfully"),
        404: OpenApiResponse(description="Product not found"),
        500: OpenApiResponse(description="Server error"),
    },
    )
    def delete(self, request, pk):
        try:
            product = Product.objects.filter(pk=pk, isDeleted=False).first()
            if not product:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "Product not found."
                }, status=status.HTTP_200_OK)

            product.isDeleted = True
            product.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Product deleted successfully."
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while deleting product.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#<------------------------------SpecialCondition----------------------->
class SpecialConditionCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
    tags=["Special Condition"],
    summary="Create Special Condition",
    description="Create a new special condition (Authenticated users only).",
    request=SpecialConditionSerializer,
    responses={
        201: OpenApiResponse(description="Special Condition created successfully"),
        400: OpenApiResponse(description="Validation error"),
        500: OpenApiResponse(description="Server error"),
    },
)
    def post(self,request):
        try:
            serializer = SpecialConditionSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response({
                'statusCode':201,
                'status':True,
                "message":'Special Condition create successfully. ',
                'data':serializer.data
            },status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'statusCode':500,
                'status':False,
                'message':'Something went wrong on server.',
                'error':str(e)
                },status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class  SpecialConditionListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["Special Condition"],
    summary="List Special Conditions",
    description="Fetch all special conditions. Optional filter by comma-separated IDs.",
    parameters=[
        OpenApiParameter(
            name="ids",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            required=False,
            description="Comma separated IDs (e.g. 1,2,3)",
        )
    ],
    responses={
        200: OpenApiResponse(description="Special Conditions fetched successfully"),
        400: OpenApiResponse(description="Invalid ID format"),
        500: OpenApiResponse(description="Server error"),
    },
)
    def get(self,request):
        special = SpecialCondition.objects.filter(is_deleted=False).order_by('-created_at')
        ids = request.GET.get('ids')
        if ids:
            try:
                id_list = [int(i.strip()) for i in ids.split(",")]
                special = special.filter(id__in = id_list)
            except ValueError as ve:
                return Response({
                    'statusCode':400,
                    'status':False,
                    'message':'invalide id formate. ',
                    'error':str(ve)
                },status=status.HTTP_400_BAD_REQUEST)
        
        serializer = SpecialConditionSerializer(special,many=True,context={'request': request})
        return Response({
            'statusCode':200,
            'status':True,
            'message':'Special Condition fetched successfully',
            'data':serializer.data
        },status=status.HTTP_200_OK)
    
class SpecialConditionDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["Special Condition"],
    summary="Get Special Condition Detail",
    description="Fetch a special condition by ID.",
    parameters=[
        OpenApiParameter(
            name="id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description="Special Condition ID",
        )
    ],
    responses={
        200: OpenApiResponse(description="Special Condition fetched successfully"),
        404: OpenApiResponse(description="Special Condition not found"),
    },
    )
    def get(self,request,id):
        special = get_object_or_404(SpecialCondition, id=id,is_deleted=False)
        serializer = SpecialConditionSerializer(special,context={'request': request})
        return Response({
            'statusCode':200,
            'status':True,
            'message':'Special Condition fetched successfully. ',
            'data':serializer.data
        },status=status.HTTP_200_OK)

class SpecialConditionUpdateAPIView(APIView):
    
    permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["Special Condition"],
    summary="Update Special Condition",
    description="Update an existing special condition (partial update supported).",
    parameters=[
        OpenApiParameter(
            name="id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description="Special Condition ID",
        )
    ],
    request=SpecialConditionSerializer,
    responses={
        200: OpenApiResponse(description="Special Condition updated successfully"),
        400: OpenApiResponse(description="Invalid data"),
        404: OpenApiResponse(description="Special Condition not found"),
    },
    )
    def put(self,request,id):
        special = get_object_or_404(SpecialCondition,id=id,is_deleted=False)
        serializer = SpecialConditionSerializer(special,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'statusCode':200,
                'status':True,
                'message':'Special Condition update succesfully.',
                'data':serializer.data
            },status=status.HTTP_200_OK)
        else:
            return Response({
                'statusCode':400,
                'status':False,
                'message':'Invalid data',
                'error':serializer.errors
            },status=status.HTTP_400_BAD_REQUEST)
class SpecialConditionDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["Special Condition"],
    summary="Delete Special Condition",
    description=(
        "Delete special condition(s).\n\n"
        "- Pass `id=all` in URL to delete all\n"
        "- OR send `{ \"id\": [1,2,3] }` in body for bulk delete\n"
        "- OR pass single `id` in URL"
    ),
    parameters=[
        OpenApiParameter(
            name="id",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.PATH,
            required=False,
            description="SpecialCondition ID or 'all'",
        )
    ],
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "array",
                    "items": {"type": "integer"},
                    "example": [1, 2, 3],
                }
            }
        }
    },
    responses={
        204: OpenApiResponse(description="Special Condition deleted successfully"),
        400: OpenApiResponse(description="Invalid delete request"),
        404: OpenApiResponse(description="Special Condition not found"),
    },
    )

    def delete(self, request, id=None):

        # delete all
        if id == "all":
            qs = SpecialCondition.objects.all()
            count = qs.count()
            qs.delete()
            return Response({
                "statusCode": 204,
                "status": True,
                "message": f"All {count} SpecialConditions deleted successfully",
                "data": None
            }, status=status.HTTP_204_NO_CONTENT)

        #delete by body IDs (list)
        ids = request.data.get("id")

        if ids and isinstance(ids, list):
            qs = SpecialCondition.objects.filter(id__in=ids)

            if not qs.exists():
                return Response({
                    "statusCode": 404,
                    "status": False,
                    "message": "SpecialCondition not found",
                    "data": None
                }, status=status.HTTP_404_NOT_FOUND)

            qs.delete()
            return Response({
                "statusCode": 204,
                "status": True,
                "message": "SpecialCondition deleted successfully",
                "data": None
            }, status=status.HTTP_204_NO_CONTENT)

        #single delete via URL
        if id:
            try:
                obj = SpecialCondition.objects.get(id=id)
                obj.delete()
                return Response({
                    "statusCode": 204,
                    "status": True,
                    "message": "SpecialCondition deleted successfully",
                    "data": None
                }, status=status.HTTP_204_NO_CONTENT)

            except SpecialCondition.DoesNotExist:
                return Response({
                    "statusCode": 404,
                    "status": False,
                    "message": "SpecialCondition not found",
                    "data": None
                }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "statusCode": 400,
            "status": False,
            "message": "Invalid delete request",
            "data": None
        }, status=status.HTTP_400_BAD_REQUEST)


class QuotationRequestListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["Quotation Request"],
    summary="List quotation requests",
    description=(
        "Fetch paginated quotation requests with optional filters:\n\n"
        "- **search**: Search by company name, email, item type, or UUID\n"
        "- **status**: Filter by quotation status\n"
        "- **email**: Filter by email (partial match)\n\n"
        "Results are paginated."
    ),
    parameters=[
        OpenApiParameter(
            name="search",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description="Search by company name, email, item type, or UUID",
            required=False
        ),
        OpenApiParameter(
            name="status",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description="Filter by quotation_status",
            required=False
        ),
        OpenApiParameter(
            name="email",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description="Filter by email (partial match)",
            required=False
        ),
        OpenApiParameter(
            name="page",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            description="Page number (pagination)",
            required=False
        ),
        OpenApiParameter(
            name="page_size",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            description="Number of records per page",
            required=False
        ),
    ],
    responses={
        200: OpenApiResponse(
            description="Quotation request list fetched successfully"
        ),
        401: OpenApiResponse(
            description="Authentication credentials were not provided"
        ),
    }
)
    def get(self, request):
        queryset = QuotationRequest.objects.filter(isDeleted=False)

        # Query Params
        search = request.GET.get("search")
        status_param = request.GET.get("status")
        email = request.GET.get("email")

        # Search (partial match)
        if search:
            queryset = queryset.filter(
                Q(company_name__icontains=search) |
                Q(email__icontains=search) |
                Q(item_type__icontains=search) |
                Q(uuids__icontains=search)   
            )

        #  Status filter
        if status_param:
            queryset = queryset.filter(quotation_status=status_param)

        #  Email filter
        if email:
            queryset = queryset.filter(email__icontains=email)

        paginator = CustomPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request)


        serializer = QuotationRequestSerializer(paginated_queryset, many=True)

        return Response({
            'statusCode':200,
            "status": True,
            'message':'Quotation Request fetch data successfully.',
            "count": queryset.count(),
            "data": serializer.data
        },status=status.HTTP_200_OK)
    
#<---------------------QuotationTemplate--------------------->
'''
class QuotationTemplateCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self,request):
        try:
            serializer = QuotationTemplateSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'statusCode':201,
                    'status':True,
                    'message':'Quotation Template create successfully. ',
                    'data':serializer.data
                },status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'statusCode':400,
                    'status':False,
                    'message':'Invalid data',
                    'error':serializer.erros
                },status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({
                'statusCode':500,
                'status':False,
                'message':'Something went wrong on server. ',
                'error':str(e)
            },status=status.HTTP_500_INTERNAL_SERVER_ERROR)'''


from .utils import render_quotation_template

class QuotationTemplateCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["Quotation Template"],
    summary="Create Quotation Template API",
    description="Render a quotation using a selected quotation template.",
    request={
        "application/json": {
            "type": "object",
            "required": ["quotation_id", "template_slug"],
            "properties": {
                "quotation_id": {
                    "type": "string",
                    "example": "QTN-1001"
                },
                "template_slug": {
                    "type": "string",
                    "example": "default-quotation-template"
                }
            }
        }
    },
    responses={
        200: OpenApiResponse(description="Quotation rendered successfully"),
        400: OpenApiResponse(description="Missing required fields"),
        404: OpenApiResponse(description="Quotation or Template not found"),
    },
    )
    def post(self, request):
        quotation_id = request.data.get("quotation_id")
        template_slug = request.data.get("template_slug")

        if not quotation_id or not template_slug:
            return Response(
                {"message": "quotation_id and template_slug are required"},
                status=400
            )

        quotation = QuotationRequest.objects.filter(
            quotation_id=quotation_id,
            isDeleted=False
        ).first()

        template = QuotationTemplate.objects.filter(
            slug=template_slug,
            is_active=True,
            is_deleted=False
        ).first()

        if not quotation:
            return Response({"message": "Quotation not found"}, status=404)

        if not template:
            return Response({"message": "Template not found"}, status=404)

        rendered_text = render_quotation_template(
            template.content,
            quotation
        )

        return Response({
            "quotation_id": quotation.quotation_id,
            "rendered_content": rendered_text
        })

'''
class QuotationTemplateListAPIView(APIView):

    permission_classes = [IsAuthenticated]
    
    def get(self,request):
        quotaion = QuotationRequest.objects.filter(is_deleted=False).order_by('-created_at')
        ids = request.GET.get('ids')
        
        if ids:
            try:
                id_list = [int(i.strip()) for i in ids.split(",")]
                quotation = quotation.filter(id__in = id_list)
            
            except ValueError as ve:
                return Response({
                    'statusCode':400,
                    'status':False,
                    'message':'Invalid id not found',
                    'error': str(ve)
                },status=status.HTTP_400_BAD_REQUEST)
            
        serializer = QuotationRequestSerializer(quotaion,many=True,context={'request': request})
        return Response({
            'statusCode':200,
            'status':True,
            'message':'Quotation Request find successfully. ',
            'data': serializer.data
        })'''


class QuotationTemplateListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["Quotation Template"],
    summary="Quotations Template List API",
    description="Fetch all quotations and render them using active quotation template.",
    parameters=[
        OpenApiParameter(
            name="ids",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            required=False,
            description="Comma separated quotation IDs (e.g. 1,2,3)",
        )
    ],
    responses={
        200: OpenApiResponse(description="Quotations fetched and rendered"),
        400: OpenApiResponse(description="Invalid ID format"),
        404: OpenApiResponse(description="Quotation template not found"),
    },
)
    def get(self, request):
        # Fetch all quotations
        quotations = QuotationRequest.objects.filter(isDeleted=False).order_by('-created_at')

        # filter by ids
        ids = request.GET.get('ids')
        if ids:
            try:
                id_list = [int(i.strip()) for i in ids.split(",")]
                quotations = quotations.filter(id__in=id_list)
            except ValueError as ve:
                return Response({
                    'statusCode': 400,
                    'status': False,
                    'message': 'Invalid id format',
                    'error': str(ve)
                }, status=status.HTTP_400_BAD_REQUEST)

        # Fetch active template (example: default quotation template)
        template = QuotationTemplate.objects.filter(title="quotation", is_active=True, is_deleted=False).first()
        if not template:
            return Response({
                'statusCode': 404,
                'status': False,
                'message': 'Quotation template not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Render each quotation using the template
        rendered_data = []
        for quotation in quotations:
            rendered_content = render_quotation_template(template.content, quotation)
            rendered_data.append({
                'quotation_id': quotation.quotation_id,
                'rendered_content': rendered_content
            })

        return Response({
            'statusCode': 200,
            'status': True,
            'message': 'Quotations fetched and rendered successfully.',
            'data': rendered_data
        })

'''
class QuotationTemplateDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, quotation_id):
        # Fetch the quotation using quotation_id
        quotation = get_object_or_404(QuotationRequest, quotation_id=quotation_id, isDeleted=False)

        serializer = QuotationRequestSerializer(quotation, context={'request': request})

        return Response({
            'statusCode': 200,
            'status': True,
            'message': 'Quotation found successfully using quotation_id.',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
'''
class QuotationTemplateDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["Quotation Template"],
    summary="Quotation Template Detail API",
    description="Fetch and render a single quotation by quotation_id.",
    parameters=[
        OpenApiParameter(
            name="quotation_id",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.PATH,
            description="Quotation ID (e.g. QTN-1001)",
        )
    ],
    responses={
        200: OpenApiResponse(description="Quotation rendered successfully"),
        400: OpenApiResponse(description="quotation_id missing"),
        404: OpenApiResponse(description="Quotation or Template not found"),
    },
)
    def get(self, request, quotation_id=None):
        if not quotation_id:
            return Response({
                'statusCode': 400,
                'status': False,
                'message': 'quotation_id is required in URL'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the quotation by quotation_id
        quotation = QuotationRequest.objects.filter(quotation_id=quotation_id, isDeleted=False).first()
        if not quotation:
            return Response({
                'statusCode': 404,
                'status': False,
                'message': f'Quotation with id {quotation_id} not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Fetch active template (default quotation template)
        template = QuotationTemplate.objects.filter(title="quotation", is_active=True, is_deleted=False).first()
        if not template:
            return Response({
                'statusCode': 404,
                'status': False,
                'message': 'Quotation template not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Render the quotation using the template
        rendered_content = render_quotation_template(template.content, quotation)

        return Response({
            'statusCode': 200,
            'status': True,
            'message': 'Quotation fetched and rendered successfully.',
            'data': {
                'quotation_id': quotation.quotation_id,
                'rendered_content': rendered_content
            }
        })


class QuotationTemplateUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
    tags=["Quotation Template"],
    summary="Quotation Template Update API",
    description="Update quotation data using quotation_id.",
    parameters=[
        OpenApiParameter(
            name="quotation_id",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.PATH,
            description="Quotation ID",
        )
    ],
    request=QuotationRequestSerializer,
    responses={
        200: OpenApiResponse(description="Quotation updated successfully"),
        400: OpenApiResponse(description="Invalid data"),
        404: OpenApiResponse(description="Quotation not found"),
    },
)
    def put(self, request, quotation_id):
        quotation = get_object_or_404(QuotationRequest, quotation_id=quotation_id, isDeleted=False)
        serializer = QuotationRequestSerializer(quotation, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'statusCode': 200,
                'status': True,
                'message': 'Quotation updated successfully by quotation_id.',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'statusCode': 400,
                'status': False,
                'message': 'Invalid data',
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        

class QuotationTemplateDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
    tags=["Quotation Template"],
    summary="Quotation Template Delete API",
    description=(
        "Delete quotation templates.\n\n"
        "- Pass quotation_id in URL for single delete\n"
        "- OR send `{ \"quotation_id\": [\"QTN-1001\", \"QTN-1002\"] }` in body"
    ),
    parameters=[
        OpenApiParameter(
            name="quotation_id",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.PATH,
            required=False,
            description="Quotation ID",
        )
    ],
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "quotation_id": {
                    "type": "array",
                    "items": {"type": "string"},
                    "example": ["QTN-1001", "QTN-1002"],
                }
            }
        }
    },
    responses={
        204: OpenApiResponse(description="Quotation template deleted successfully"),
        400: OpenApiResponse(description="Invalid quotation_id"),
        404: OpenApiResponse(description="Quotation template not found"),
    },
    )
    def delete(self, request, quotation_id=None):
        # Delete multiple by quotation_ids (body)
        ids = request.data.get('quotation_id')
        if ids and isinstance(ids, list):
            qs = QuotationRequest.objects.filter(quotation_id__in=ids)
            if not qs.exists():
                return Response({
                    'statusCode': 404,
                    'status': False,
                    'message': 'Quotation Templates not found.',
                    'data': None
                }, status=status.HTTP_404_NOT_FOUND)
            
            qs.delete()
            return Response({
                'statusCode': 204,
                'status': True,
                'message': 'Quotation Templates deleted successfully.',
                'data': None
            }, status=status.HTTP_204_NO_CONTENT)
        
        # Single delete
        if quotation_id:
            try:
                quotation = QuotationRequest.objects.get(quotation_id=quotation_id)
                quotation.delete()
                return Response({
                    'statusCode': 204,
                    'status': True,
                    'message': 'Quotation Template deleted successfully.',
                    'data': None
                }, status=status.HTTP_204_NO_CONTENT)
            except QuotationRequest.DoesNotExist:
                return Response({
                    'statusCode': 404,
                    'status': False,
                    'message': 'Quotation Template not found.',
                    'data': None
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'statusCode': 400,
            'status': False,
            'message': 'Invalid quotation_id.',
            'data': None
        }, status=status.HTTP_400_BAD_REQUEST)
    
#<------------------AdminNotification------------------>

class AdminNotificationListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["Admin Notification"],
    summary="List admin notifications",
    description="Fetch all admin notifications ordered by latest.",
    responses={
        200: OpenApiResponse(description="Notifications fetched successfully"),
        500: OpenApiResponse(description="Server error"),
    },
)
    def get(self, request):
        try:
            notifications = AdminNotification.objects.all().order_by("-created_at")
            serializer = AdminNotificationSerializer(notifications, many=True)
            return Response({
                "statusCoce":200,
                "status": True,
                "message":"Notification Fetch Successfully",
                "data": serializer.data
            },status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                "statusCode":500,
                "status":False,
                "message":"Something went wrong on server.",
                "error":str(e)
            },status = status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminNotificationDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
    tags=["Admin Notification"],
    summary="Delete admin notifications",
    description=(
        "Delete admin notifications.\n\n"
        "- Delete single notification by passing `id`\n"
        "- Delete all notifications by passing `delete_all=true`"
    ),
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "integer",
                    "example": 12,
                    "description": "Notification ID"
                },
                "delete_all": {
                    "type": "boolean",
                    "example": False,
                    "description": "Set true to delete all notifications"
                }
            }
        }
    },
    responses={
        200: OpenApiResponse(description="Notification deleted successfully"),
        204: OpenApiResponse(description="All notifications deleted"),
        400: OpenApiResponse(description="Invalid notification id"),
        500: OpenApiResponse(description="Server error"),
    },
)
    def delete(self, request):
        try:
            notification_id = request.data.get("id")
            delete_all = request.data.get("delete_all", False)

            if delete_all is False and not notification_id:
            
                return Response({
                    "statusCode": 200,
                    "status": True,
                    "message": f"id requored",
                    
                }, status=status.HTTP_200_OK)

            #Delete ALL
            if delete_all is True:
                count = AdminNotification.objects.count()
                AdminNotification.objects.all().delete()
                return Response({
                    "statusCode": 200,
                    "status": True,
                    "message": f"{count} notifications deleted successfully.",
                    "data": None
                }, status=status.HTTP_204_NO_CONTENT)

            # Delete by ID
            notification = AdminNotification.objects.get(id=notification_id)
            notification.delete()
            return Response({
                "statusCode": 200,
                "status": True,
                "message": "AdminNotification deleted successfully.",
                "data": None
            }, status=status.HTTP_200_OK)

        except AdminNotification.DoesNotExist:
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Invalid notification id.",
                "data": None
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": "Something went wrong on server.",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminDashAPIView(APIView):
    # permission_classes = [IsAdministrator]
    permission_classes  =[IsAuthenticated]   #need to remove after take clone 
    
    @extend_schema(
    tags=["Admin Dashboard"],
    summary="Admin dashboard analytics",
    description="Fetch dashboard statistics including quotations, users, templates, fabrics, and recent updates.",
    responses={
        200: OpenApiResponse(
            description="Dashboard data fetched successfully",
            response={
                "type": "object",
                "properties": {
                    "status": {"type": "boolean"},
                    "statusCode": {"type": "integer", "example": 200},
                    "message": {"type": "string"},
                    "data": {
                        "type": "object",
                        "properties": {
                            "Pending_quotes": {"type": "object"},
                            "Templates": {"type": "object"},
                            "B2B_Users": {"type": "object"},
                            "Quote_status_distribution": {"type": "object"},
                            "Quotation_volume": {"type": "object"},
                            "Pending_Sales_Representation_Action": {"type": "object"},
                            "most_used_fabrics": {"type": "array"},
                            "Recently_update_product_color_part": {"type": "array"},
                        }
                    }
                }
            }
        ),
        500: OpenApiResponse(description="Failed to fetch dashboard data"),
    },
)

    def get(self, request):
        try:
            # ================= PENDING QUOTES (TODAY vs YESTERDAY) =================
            today = now().date()
            yesterday = today - timedelta(days=1)

            pending_today = QuotationRequest.objects.filter(
                quotation_status="pending",
                isDeleted=False,
                created_at__date=today
            ).count()

            pending_yesterday = QuotationRequest.objects.filter(
                quotation_status="pending",
                isDeleted=False,
                created_at__date=yesterday
            ).count()

            if pending_yesterday:
                pending_change_percentage = round(
                    ((pending_today - pending_yesterday) / pending_yesterday) * 100, 2
                )
            else:
                pending_change_percentage = 100 if pending_today else 0

            total_templates = Template.objects.count()

            # ================= B2B USERS (MONTH vs PREVIOUS MONTH) =================
            today_dt = now()
            current_month_start = today_dt.replace(day=1)

            previous_month_end = current_month_start - timedelta(days=1)
            previous_month_start = previous_month_end.replace(day=1)

            current_month_b2b = AdminUser.objects.filter(
                role__role_name="b2b",
                created_at__gte=current_month_start
            ).count()

            previous_month_b2b = AdminUser.objects.filter(
                role__role_name="b2b",
                created_at__gte=previous_month_start,
                created_at__lte=previous_month_end
            ).count()

            if previous_month_b2b:
                b2b_change_percentage = round(
                    ((current_month_b2b - previous_month_b2b) / previous_month_b2b) * 100, 2
                )
            else:
                b2b_change_percentage = 100 if current_month_b2b else 0

            # ================= QUOTE STATUS DISTRIBUTION =================
            ALL_STATUSES = ["pending", "sent", "approved"]

            status_qs = (
                QuotationRequest.objects
                .filter(isDeleted=False)
                .values("quotation_status")
                .annotate(count=Count("uuids"))
            )

            status_dict = {i["quotation_status"]: i["count"] for i in status_qs}
            total_quotes = sum(status_dict.values()) or 1

            quote_status_distribution = {
                "data": [
                    {
                        "label": status.capitalize(),
                        "value": status_dict.get(status, 0),
                        "percentage": round(
                            (status_dict.get(status, 0) / total_quotes) * 100, 2
                        )
                    }
                    for status in ALL_STATUSES
                ]
            }

            # ================= QUOTATION VOLUME =================
            # Weekly
            DAY_MAP = {1: "Sun", 2: "Mon", 3: "Tue", 4: "Wed", 5: "Thu", 6: "Fri", 7: "Sat"}
            weekly_result = {i: 0 for i in range(1, 8)}

            week_qs = (
                QuotationRequest.objects
                .filter(
                    isDeleted=False,
                    created_at__year=today_dt.year,
                    created_at__week=today_dt.isocalendar()[1]
                )
                .annotate(day=ExtractWeekDay("created_at"))
                .values("day")
                .annotate(value=Count("quotation_id"))
            )

            for item in week_qs:
                weekly_result[item["day"]] = item["value"]

            weekly_data = [{"label": DAY_MAP[d], "value": weekly_result[d]} for d in range(1, 8)]

            # Monthly
            monthly_result = {i: 0 for i in range(1, 6)}
            month_qs = (
                QuotationRequest.objects
                .filter(
                    isDeleted=False,
                    created_at__year=today_dt.year,
                    created_at__month=today_dt.month
                )
                .annotate(week=ExtractWeek("created_at"))
                .values("week")
                .annotate(value=Count("quotation_id"))
            )

            for item in month_qs:
                week_no = (item["week"] % 5) or 5
                monthly_result[week_no] += item["value"]

            monthly_data = [{"label": f"Week {w}", "value": monthly_result[w]} for w in range(1, 6)]

            # Yearly
            MONTH_MAP = {1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
                         7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"}

            yearly_result = {m: 0 for m in range(1, 13)}

            year_qs = (
                QuotationRequest.objects
                .filter(isDeleted=False, created_at__year=today_dt.year)
                .annotate(month=ExtractMonth("created_at"))
                .values("month")
                .annotate(value=Count("quotation_id"))
            )

            for item in year_qs:
                yearly_result[item["month"]] = item["value"]

            yearly_data = [
                {"label": f"{MONTH_MAP[m]} {today_dt.year}", "value": yearly_result[m]}
                for m in range(1, 13)
            ]

            quotation_volume = {
                "weekly": weekly_data,
                "monthly": monthly_data,
                "yearly": yearly_data
            }

            # ================= MOST USED FABRICS =================
            fabrics_qs = (
                Fabric.objects
                .filter(parts__isDeleted=False)
                .annotate(total_count=Count("parts"))
                .values("fabricName", "total_count")
                .order_by("-total_count")[:4]
            )
            most_used_fabrics =[{
                 "fabric_name": f["fabricName"],
                 "count": f["total_count"]
            }
            for f in fabrics_qs
            ]

            # ================= RECENT UPDATES =================
            items = []

            for p in Product.objects.values("productName", "updated_at"):
                items.append({"name":p["productName"],"date":p["updated_at"],"type":"product"})

            for c in Colors.objects.values("colorName", "updated_at"):
                items.append({"name":c["colorName"],"date":c["updated_at"],"type": "color"})

            for pt in Parts.objects.values("partName", "updated_at"):
                items.append({"name":pt["partName"],"date":pt["updated_at"],"type": "part"})

            items.sort(key=lambda x: x["date"], reverse=True)
            recent_updates = []
            for item in items[:3]:
                     key_name = ""
                     if item["type"] == "product":
                          key_name = "productname"
                     elif item["type"] == "color":
                          key_name = "colorname"
                     elif item["type"] == "part":
                          key_name = "partcname"
                     recent_updates.append({
                         key_name:item["name"],
                         "type":item["type"],
                         "created_date": item["date"].strftime("%b %d, %Y")
                     }) 

            # ================= RESPONSE =================
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Dashboard data fetched successfully",
                "data": {
                    "Pending_quotes": {"total": pending_today, "change_percentage": pending_change_percentage},
                    "Templates": {"total": total_templates},
                    "B2B_Users": {"total": current_month_b2b, "change_percentage": b2b_change_percentage},
                    "Quote_status_distribution": quote_status_distribution,
                    "Quotation_volume": quotation_volume,
                    "Pending_Sales_Representation_Action": {"amy": 2, "jok": 1, "bob": 2},
                    "most_used_fabrics": most_used_fabrics,
                    "Recently_update_product_color_part": recent_updates,
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to fetch dashboard data",
                "error": str(e),
                "trace": traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
class QuotationStatusUpdateAPIView(APIView):
    authentication_classes = [MultiRoleJWTAuth]  # JWT Multi-Role
    permission_classes = []

    @extend_schema(
    tags=["UniformAdmin · QuotationStatusUpdate"],
    summary="Update quotation status (Admin/Sales/B2B)",
    description=(
        "Update quotation status by **Admin, Sales, or B2B** roles.\n\n"
        "**Supported actions:**\n"
        "- `approve`\n"
        "- `send` (only after approve)\n"
        "- `cancel` (reason required)"
    ),
    request={
        "application/json": {
            "type": "object",
            "required": ["quotation_id", "action"],
            "properties": {
                "quotation_id": {
                    "type": "string",
                    "example": "QT-2024-001"
                },
                "action": {
                    "type": "string",
                    "enum": ["approve", "send", "cancel"],
                    "example": "approve"
                },
                "reason": {
                    "type": "string",
                    "example": "Client declined"
                }
            }
        }
    },
    responses={
        200: OpenApiResponse(description="Quotation status updated successfully"),
        400: OpenApiResponse(description="Invalid action or validation error"),
        403: OpenApiResponse(description="Unauthorized role"),
        401: OpenApiResponse(description="Authentication required"),
    },
    examples=[
        OpenApiExample(
            "Approve Quotation",
            value={
                "quotation_id": "QT-2024-001",
                "action": "approve"
            },
            request_only=True
        ),
        OpenApiExample(
            "Send Quotation",
            value={
                "quotation_id": "QT-2024-001",
                "action": "send"
            },
            request_only=True
        ),
        OpenApiExample(
            "Cancel Quotation",
            value={
                "quotation_id": "QT-2024-001",
                "action": "cancel",
                "reason": "Pricing rejected"
            },
            request_only=True
        )
    ]
)
    def post(self, request):
        quotation_id = request.data.get("quotation_id")
        action = request.data.get("action")

        # Debug logs
        print("Request user:", request.user)
        print("Authenticated:", request.user.is_authenticated)
        print("User role:", getattr(request.user, "role_name", None))

        # Validate role
        user_role = getattr(request.user, "role_name", None)
        if not user_role or user_role.lower() not in ["admin", "sales", "b2b"]:
            return Response({
                "statusCode":403,
                "status":False,
                "error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        # Fetch quotation
        try:
            quotation = QuotationRequest.objects.get(quotation_id=quotation_id)
        except QuotationRequest.DoesNotExist:
            return Response({
                "statusCode":400,
                "status":False,
                "error": "Quotation not found"}, status=status.HTTP_400_BAD_REQUEST)

        # APPROVE
        if action == "approve":
            quotation.quotation_status = "approved"
            quotation.save()
            return Response({
                "statusCode":200,
                "status":True,
                "message": "Approved successfully"
                },status=status.HTTP_200_OK)

        # SEND
        if action == "send":
            if quotation.quotation_status != "approved":
                return Response({"error": "Approve first"}, status=400)
            quotation.quotation_status = "sent"
            quotation.save()
            return Response({
                "statusCode":200,
                "status":True,
                "message": "Sent successfully"
                },status=status.HTTP_200_OK)

        # CANCEL
        if action == "cancel":
            reason = request.data.get("reason")
            if not reason:
                return Response({
                    "statusCode":400,
                    "status":False,
                    "error": "Reason required"
                    }, status=status.HTTP_400_BAD_REQUEST)

            quotation.quotation_status = "cancelled"
            quotation.cancel_reason = reason
            quotation.cancelled_by = user_role  # store role name
            quotation.save()

            return Response({
                "statusCode":200,
                "statu":True,
                "message": "Quotation cancelled",
                "cancelled_by": user_role
            },status=status.HTTP_200_OK)

        return Response({
            "statusCode":400,
            "status":False,
            "error": "Invalid action"
            }, status=status.HTTP_400_BAD_REQUEST)
