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
import stripe
from decimal import Decimal
from django.db.models import Sum
from django.utils.timezone import now
# from .fabric import  IsAdministrator 
from .auth import IsAdminUserJWT
from django.conf import settings
from django.db.models import Count
from django.db.models.functions import ExtractMonth, ExtractWeek, ExtractWeekDay
stripe.api_key = settings.STRIPE_SECRET_KEY
from .utils import render_quotation_template , generate_quotation_template_pdf
from .auth import IsAdminUserJWT,MultiRoleJWTAuth
from drf_spectacular.utils import extend_schema,OpenApiExample,OpenApiResponse,OpenApiParameter,OpenApiTypes
from userhub.views import get_docusign_token
from docusign_esign import ApiClient, EnvelopesApi


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
            # if "theme" in serializer.errors:
            #     error_msg = serializer.errors["theme"][0]

            #     if "not allowed" in error_msg:
            #         return Response({
            #             "status": False,
            #             "statusCode": 400,
            #             "message": "Theme is not allowed for Uniform"
            #         }, status=status.HTTP_200_OK)

            #     return Response({
            #         "status": False,
            #         "statusCode": 400,
            #         "message": "Validation failed;Please Select Themes"
            #     }, status=status.HTTP_200_OK)

            
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

            serializer = ProductSerializer(product, data=request.data, partial=True,context={'request':request})
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

            serializer = ProductSerializer(product,context={'request':request})
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
    authentication_classes = []
    permission_classes = []


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
            products = Product.objects.filter(isDeleted=False).order_by("-created_at")
            serializer = ProductSerializer(products, many=True,context={'request':request})
            # -------------------------
            # Query params
            # -------------------------
            category_id = request.query_params.get("category_id")
            subcategory_id = request.query_params.get("subcategory_id")
            product_type = request.query_params.get("productType")  # REQUIRED
            type_filter = request.query_params.get("type")
            ordering = request.query_params.get("ordering", "newest")
            search = request.query_params.get("search", "").strip()

            # -------------------------
            # productType is required
            # -------------------------
            if not product_type:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "productType is required either 'uniform' or 'table'."
                }, status=status.HTTP_200_OK)

            # -------------------------
            # Base queryset
            # -------------------------
            products = Product.objects.filter(
                isDeleted=False,
                productType=product_type
            )

            # -------------------------
            # Optional filters
            # -------------------------
            if category_id:
                products = products.filter(category_id=category_id)

            if subcategory_id:
                products = products.filter(subcategory_id=subcategory_id)

            if type_filter:
                products = products.filter(type=type_filter)

            # -------------------------
            # Ordering
            # -------------------------
            if ordering == "oldest":
                products = products.order_by("created_at")
            else:  # newest (default)
                products = products.order_by("-created_at")
                
            if search:
                products = products.filter(productName__icontains=search)    

            # if search:
            #     products = products.filter(
            #         Q(productName__icontains=search) |
            #         Q(category__categoryName__icontains=search) |
            #         Q(subcategory__name__icontains=search) |
            #         Q(theme__themeName__icontains=search)  # replace themeName with your actual field if different
            #     )    

            serializer = ProductSerializer(products, many=True, context={'request': request})

            # Fetch subcategory details and category details if subcategory_id is provided
            subcategory_data = None
            if subcategory_id:
                try:
                    subcat = SubCategory.objects.get(id=subcategory_id, isDeleted=False)
                    have_product = Product.objects.filter(subcategory=subcat, isDeleted=False).exists()
                    category_info = CategorySerializer(subcat.category, context={'request': request}).data if subcat.category else None
                    if category_info and subcat.category:
                        category_info["haveSubCategory"] = SubCategory.objects.filter(category=subcat.category, isDeleted=False).exists()
                    subcategory_data = {
                        "id": subcat.id,
                        "name": subcat.name,
                        "slug": subcat.slug,
                        "description": subcat.description,
                        "haveProduct": have_product,
                        "category": category_info
                    }
                except SubCategory.DoesNotExist:
                    pass

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Products fetched successfully.",
                "subcategory": subcategory_data,
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
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            serializer = SpecialConditionSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response({
                "statusCode": 201,
                "status": True,
                "message": "Special Condition created successfully.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Validation Error",
                "errors": e.detail
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": "Something went wrong on server.",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class  SpecialConditionListAPIView(APIView):
    # permission_classes = [IsAdminUserJWT]
    authentication_classes = [JWTAuthentication] 

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
    authentication_classes = [JWTAuthentication] 

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
    
    authentication_classes = [JWTAuthentication] 

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
    authentication_classes = [JWTAuthentication] 

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
    authentication_classes = [IsAdminUserJWT]
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
            "statusCode": 200,
            "status": True,
            "message": "Quotation Request fetch data successfully.",

            "page": int(request.query_params.get("page", 1)),
            "page_size": int(request.query_params.get("page_size", paginator.page_size)),

            "count": queryset.count(),
            "data": serializer.data
        }, status=status.HTTP_200_OK)

        # return Response({
        #     'statusCode':200,
        #     "status": True,
        #     'message':'Quotation Request fetch data successfully.',
        #     "count": queryset.count(),
        #     "data": serializer.data
        # },status=status.HTTP_200_OK)
    
    
class QuotationRequestDetailAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Quotation Request"],
        summary="Quotation Request Details",
        description="Fetch complete details of a quotation request by UUID.",
        parameters=[
            OpenApiParameter(
                name="uuid",
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.PATH,
                required=True,
                description="Quotation Request UUID",
            )
        ],
        responses={
            200: OpenApiResponse(
                description="Quotation request fetched successfully"
            ),
            404: OpenApiResponse(
                description="Quotation request not found"
            ),
            500: OpenApiResponse(
                description="Server error"
            ),
        },
    )
    def get(self, request, uuid):
        try:
            quotation = QuotationRequest.objects.get(
                uuids=uuid,
                isDeleted=False
            )

            serializer = QuotationRequestSerializer(
                quotation,
                context={"request": request}
            )

            return Response(
                {
                    "statusCode": 200,
                    "status": True,
                    "message": "Quotation request fetched successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        except QuotationRequest.DoesNotExist:
            return Response(
                {
                    "statusCode": 404,
                    "status": False,
                    "message": "Quotation request not found.",
                    "data": None,
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
      
class QuotationRequestUpdateAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Quotation Request"],
        summary="Update quotation request",
        description=(
            "Admin can update quotation details and quotation/workflow status."
        ),
        request=QuotationRequestUpdateSerializer,
        parameters=[
            OpenApiParameter(
                name="uuid",
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.PATH,
                required=True,
                description="Quotation Request UUID",
            )
        ],
        responses={
            200: OpenApiResponse(description="Quotation updated successfully"),
            400: OpenApiResponse(description="Validation error"),
            404: OpenApiResponse(description="Quotation not found"),
            500: OpenApiResponse(description="Server error"),
        },
    )
    def put(self, request, uuid):
        try:
            quotation = QuotationRequest.objects.get(
                uuids=uuid,
                isDeleted=False
            )

            serializer = QuotationRequestUpdateSerializer(
                quotation,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():
                instance = serializer.save()
                
                if instance.quotation_status == "cancelled":
                    instance.cancelled_by = "admin"
                    instance.save(update_fields=["cancelled_by"])

                return Response(
                    {
                        "statusCode": 200,
                        "status": True,
                        "message": "Quotation updated successfully.",
                        "data": QuotationRequestSerializer(
                            quotation,
                            context={"request": request}
                        ).data,
                    },
                    status=status.HTTP_200_OK,
                )

            return Response(
                {
                    "statusCode": 400,
                    "status": False,
                    "message": "Validation error.",
                    "error": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except QuotationRequest.DoesNotExist:
            return Response(
                {
                    "statusCode": 404,
                    "status": False,
                    "message": "Quotation request not found.",
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
                        
                
#<---------------------QuotationTemplate--------------------->
class QuotationTemplateCreateAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        quotation_id = request.data.get("quotation_id")

        if not quotation_id:
            return Response({
                "statusCode":400,
                "status":False,
                "message": "quotation_id is required"
                },status=400)
        quotation = QuotationRequest.objects.filter(
            quotation_id=quotation_id,
            isDeleted=False
        ).first()

        if not quotation:
            return Response({
                "statusCode":404,
                "status":False,
                "message": "Quotation not found"
                }, status=404)

        template = QuotationTemplate.objects.filter(
            is_active=True,
            is_deleted=False
        ).order_by("-created_at").first()

        if not template:
            return Response({
                "stautsCode":404,
                "status":False,
                "message": "No active template found"
                }, status=404)

        rendered_text = render_quotation_template(
            template.content,
            quotation
        )

        return Response({
            "statusCode":200,
            "status":True,
            "quotation_id": quotation.quotation_id,
            "template_used": template.slug,
            "rendered_content": rendered_text
        },status=200)

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
    authentication_classes = [IsAdminUserJWT]
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


class QuotationTemplateDetailAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]
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
    authentication_classes = [IsAdminUserJWT]
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
    authentication_classes = [IsAdminUserJWT]
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
    
class QuotationTamplateExportAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]
    permission_classes = [IsAuthenticated]

    def get(self, request, quotation_id):

        try:
            quotation = QuotationRequest.objects.get(
                quotation_id=quotation_id,
                isActive=True,
                isDeleted=False
            )
        except QuotationRequest.DoesNotExist:
            return Response({
                "status": False,
                "message": "Quotation not found"
            }, status=404)

        # TEMPLATE FETCH
        template = QuotationTemplate.objects.filter(title="quotation").first()

        if not template:
            return Response({
                "status": False,
                "message": "Template not found"
            }, status=404)

        # ✅ Generate PDF (this returns MEDIA_URL path)
        pdf_path = generate_quotation_template_pdf(quotation, template.content)

        # ✅ Convert to full absolute URL
        pdf_url = request.build_absolute_uri(pdf_path)

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "PDF generated successfully",
            "pdf_url": pdf_url
        })
#<------------------AdminNotification------------------>

class AdminNotificationListAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]
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

# ---------------- Dashboard Active Alerts ----------------
def compute_active_alerts():
    """
    Build the dashboard Active Alerts from live quotation data.

    Which alert types are enabled, and their SLA (days), come from
    Admin -> System Settings -> System Alerts (SystemSettings.load()).

    Each alert carries a `fingerprint` of its own counts. That is what read-state is
    stored against (see DashboardAlertRead) — so marking an alert read hides exactly
    the state that was seen, and any change in the numbers brings it back.

    Only alerts with a non-zero count are returned, so an empty pipeline yields an
    empty list rather than zeroed-out placeholders.
    """
    settings_row = SystemSettings.load()
    now_dt = now()
    alerts = []

    if settings_row.alert_pending_review_enabled:
        review_cutoff = now_dt - timedelta(days=settings_row.alert_pending_review_sla_days)

        pending_review_total = QuotationRequest.objects.filter(
            isDeleted=False, quotation_status="pending"
        ).count()

        overdue_review = QuotationRequest.objects.filter(
            isDeleted=False,
            quotation_status="pending",
            created_at__lt=review_cutoff,
        ).count()

        if pending_review_total:
            message = f"{pending_review_total} quotes pending review"
            if overdue_review:
                message += f" - {overdue_review} overdue"
            alerts.append({
                "type": "pending_review",
                "level": "HIGH" if overdue_review else "MEDIUM",
                "message": message,
                "action": "Review Now",
                "icon": "alert" if overdue_review else "clock",
                "color": "text-red-500" if overdue_review else "text-orange-500",
                "count": pending_review_total,
                "overdue_count": overdue_review,
                "fingerprint": f"{pending_review_total}:{overdue_review}",
            })

    if settings_row.alert_awaiting_customer_enabled:
        followup_cutoff = now_dt - timedelta(days=settings_row.alert_awaiting_customer_sla_days)

        # updated_at, not created_at: it tracks when the quote was last actioned
        # (i.e. when it was sent), which is what a follow-up is timed from.
        awaiting_customer = QuotationRequest.objects.filter(
            isDeleted=False,
            quotation_status="sent",
            updated_at__lt=followup_cutoff,
        ).count()

        if awaiting_customer:
            alerts.append({
                "type": "awaiting_customer",
                "level": "MEDIUM",
                "message": f"{awaiting_customer} Quotation request - Contact customers required",
                "action": "View Details",
                "icon": "clock",
                "color": "text-orange-500",
                "count": awaiting_customer,
                "overdue_count": 0,
                "fingerprint": f"{awaiting_customer}:0",
            })

    return alerts


def filter_read_alerts(alerts, admin_user):
    """Drop alerts this admin has already marked read at their current fingerprint."""
    if not alerts or admin_user is None:
        return alerts

    read_map = dict(
        DashboardAlertRead.objects
        .filter(admin=admin_user, alert_type__in=[a["type"] for a in alerts])
        .values_list("alert_type", "fingerprint")
    )
    return [a for a in alerts if read_map.get(a["type"]) != a["fingerprint"]]


class AdminDashAPIView(APIView):
    # permission_classes = [IsAdministrator]
    # permission_classes  =[IsAuthenticated]   #need to remove after take clone

    authentication_classes = [IsAdminUserJWT]


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
                            "active_alerts": {"type": "array"},
                            "alert_count": {"type": "integer"},
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

            today_dt = now()
            current_month_start = today_dt.replace(day=1)

            previous_month_end = current_month_start - timedelta(days=1)
            previous_month_start = previous_month_end.replace(day=1)

            current_month_b2b = AdminUser.objects.filter(
                role__role_name="b2b_user",
                created_at__gte=current_month_start
            ).count()

            previous_month_b2b = AdminUser.objects.filter(
                role__role_name="b2b_user",
                created_at__gte=previous_month_start,
                created_at__lte=previous_month_end
            ).count()

            if previous_month_b2b:
                b2b_change_percentage = round(
                    ((current_month_b2b - previous_month_b2b) / previous_month_b2b) * 100, 2
                )
            else:
                b2b_change_percentage = 100 if current_month_b2b else 0
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
                        )} for status in ALL_STATUSES
                ] }
            # Weekly
            DAY_MAP = {1: "Sun", 2: "Mon", 3: "Tue", 4: "Wed", 5: "Thu", 6: "Fri", 7: "Sat"}
            weekly_result = {i: 0 for i in range(1, 8)}

            start_of_week = today_dt - timedelta(days=today_dt.weekday())
            end_of_week = start_of_week + timedelta(days=6)

            week_qs = (
                QuotationRequest.objects
                .filter(
                    isDeleted=False,
                    created_at__date__gte=start_of_week.date(),
                    created_at__date__lte=end_of_week.date()
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
            fabrics_qs = (
                Fabric.objects
                .filter(parts__isDeleted=False)
                .annotate(total_count=Count("parts"))
                .values("fabricName", "total_count")
                .order_by("-total_count")[:4]
            )
       
            most_used_categories_qs = (
                Product.objects
                .filter(isDeleted=False, isActive=True)
                .values("category__categoryName","category__slug")
                .annotate(count=Count("id"))
                .order_by("-count")
            )

            # most_used_industries = [
            #     {
            #         "category_name": item["category__categoryName"] or "Uncategorized",
            #         "category_slug": item["category__slug"] or "",
            #         "count": item["count"]
            #     }
            #     for item in most_used_categories_qs
            # ]
            most_used_fabrics =[{
                 "fabric_name": f["fabricName"],
                 "count": f["total_count"]
            }
            for f in fabrics_qs
            ]
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
                     
                     
            category_usage_qs = (
                QuotationRequest.objects
                .filter(
                    isDeleted=False,
                    customupdatemodel__isnull=False,
                    customupdatemodel__model_info__isnull=False,
                    customupdatemodel__model_info__product__isnull=False,
                    customupdatemodel__model_info__product__isDeleted=False,
                )
                .values(
                    "customupdatemodel__model_info__product__category__categoryName",
                    "customupdatemodel__model_info__product__category__slug",
                )
                .annotate(count=Count("uuids"))
                .order_by("-count")
            )

            most_used_industries = [
                {
                    "category_name": item["customupdatemodel__model_info__product__category__categoryName"] or "Uncategorized",
                    "category_slug": item["customupdatemodel__model_info__product__category__slug"] or "",
                    "count": item["count"],
                }
                for item in category_usage_qs
            ]

            # Active Alerts — computed live, then filtered by this admin's read-state
            active_alerts = filter_read_alerts(compute_active_alerts(), request.user)

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
                    "most_used_industries": most_used_industries,
                    # "Pending_Sales_Representation_Action": pending_sales_rep_action,
                    "most_used_fabrics": most_used_fabrics,
                    "Recently_update_product_color_part": recent_updates,
                    # snake_case here deliberately: ActiveAlerts.jsx reads
                    # data.active_alerts / data.alert_count
                    "active_alerts": active_alerts,
                    "alert_count": len(active_alerts),
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


class DashboardAlertMarkReadAPIView(APIView):
    """Mark the current dashboard Active Alerts as read for the logged-in admin."""

    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Admin Dashboard"],
        summary="Mark dashboard Active Alerts as read",
        description=(
            "Marks every currently-raised Active Alert as read for the authenticated "
            "admin. Read-state is stored per admin against the alert's current counts, "
            "so an alert reappears once those counts change."
        ),
        request=None,
        responses={200: OpenApiResponse(description="Alerts marked as read")},
    )
    def post(self, request):
        try:
            # Recompute server-side rather than trusting counts from the client.
            alerts = compute_active_alerts()

            for alert in alerts:
                DashboardAlertRead.objects.update_or_create(
                    admin=request.user,
                    alert_type=alert["type"],
                    defaults={"fingerprint": alert["fingerprint"]},
                )

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Alerts marked as read",
                "data": {"marked": len(alerts)},
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to mark alerts as read",
                "error": str(e),
                "trace": traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminRefundProcessAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def patch(self, request, refund_id):
        refund = get_object_or_404(Refund, id=refund_id)

        if refund.status == 'processed':
            return Response({"status": False, "message": "Refund already processed"}, status=400)

        serializer = AdminRefundSerializer(instance=refund, data=request.data, partial=True)
        if serializer.is_valid():
            refund_type = request.data.get('refund_type')
            payment = refund.payment
            refund_amount = Decimal('0')

            # ----- Calculate refund amount -----
            if refund_type == 'full':
                refund_amount = payment.amount
            elif refund_type == 'partial':
                refund_amount = Decimal(str(request.data.get('refund_amount', '0')))
                if refund_amount < 1:
                    return Response({"status": False, "message": "Refund amount must be at least 1"}, status=400)
            elif refund_type == 'percentage':
                percentage = Decimal(str(request.data.get('refund_percentage', '0')))
                if percentage < 1:
                    return Response({"status": False, "message": "Refund percentage must be at least 1"}, status=400)
                refund_amount = (payment.amount * percentage) / Decimal('100')
            else:
                return Response({"status": False, "message": "Invalid refund_type"}, status=400)

            # Check total refunded for this order
            total_refunded = refund.order.refunds.filter(status='processed').aggregate(
                Sum('refund_amount')
            )['refund_amount__sum'] or 0
            if total_refunded + refund_amount > payment.amount:
                return Response({"status": False, "message": "Total refunds exceed paid amount"}, status=400)

            # Create Stripe refund
            try:
                stripe_refund = stripe.Refund.create(
                    payment_intent=payment.payment_id,
                    amount=int(refund_amount * 100)
                )
            except stripe.error.StripeError as e:
                return Response({"status": False, "message": f"Stripe Error: {str(e)}"}, status=400)

            # Save via serializer
            serializer.save(
                refund_amount=refund_amount,
                status='processed',
                payment_gateway_id=stripe_refund['id'],
                admin_note=request.data.get('admin_note', ''),
                processed_at=timezone.now()
            )

            # Update order status
            if refund_amount == payment.amount:
                refund.order.status = 'cancelled'
            else:
                refund.order.status = 'partially_refunded'
            refund.order.save()

            return Response({
                "status": True,
                "message": "Refund processed successfully",
                "refund_amount": float(refund_amount)
            })

        return Response({"status": False, "message": serializer.errors}, status=400)

class AdminOrderRefundAPI(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        data = request.data
        order_id = data.get('order_id')
        refund_type = data.get('refund_type')
        admin_note = data.get('admin_note', '')

        if not order_id or not refund_type:
            return Response(
                {"status": False, "message": "order_id and refund_type are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = Order.objects.get(order_id=order_id, is_active=True)
        except Order.DoesNotExist:
            return Response(
                {"status": False,
                 "statusCode":404, 
                 "message": "Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
        with transaction.atomic():
            payment = (
                Payment.objects
                .select_for_update()
                .filter(
                    order=order,
                    payment_status='success',
                    is_active=True
                ).order_by('-created_at').first()
            )

            if not payment:
                return Response({
                        "status": False,
                        "statusCode":404,
                        "message": "No successful payment found for this order"
                    }, status=status.HTTP_404_NOT_FOUND
                )

            refunded_total = Refund.objects.filter(
                payment=payment,
                status='processed'
            ).aggregate(
                total=models.Sum('refund_amount')
            )['total'] or Decimal('0')

            if refund_type == 'full':
                if refunded_total >= payment.amount:
                    return Response(
                        {"status": False,
                         "statusCode":400,
                          "message": "Payment already fully refunded"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                refund_amount = payment.amount - refunded_total

            elif refund_type == 'partial':
                refund_amount = Decimal(str(data.get('refund_amount', '0')))
                if refund_amount <= 0:
                    return Response(
                        {"status": False,
                         "statusCode":400,
                          "message": "Refund amount must be greater than 0"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if refunded_total + refund_amount > payment.amount:
                    return Response(
                        {"status": False,
                         "statuseCode":400,
                          "message": "Refund amount exceeds payment amount"},
                          status=status.HTTP_400_BAD_REQUEST
                    )
            elif refund_type == 'percentage':
                percentage = Decimal(str(data.get('refund_percentage', '0')))
                if percentage <= 0 or percentage > 100:
                    return Response(
                        {"status": False, 
                         "statusCode":400,
                         "message": "Invalid refund percentage"},
                          status=status.HTTP_400_BAD_REQUEST
                    )
                refund_amount = (payment.amount * percentage) / Decimal('100')
                if refunded_total + refund_amount > payment.amount:
                    refund_amount = payment.amount - refunded_total

            else:
                return Response(
                    {"status": False,
                     "statusCode":400, 
                     "message": "Invalid refund_type"},
                      status=status.HTTP_400_BAD_REQUEST
                )

            try:
                stripe_refund = stripe.Refund.create(
                    payment_intent=payment.payment_id,
                    amount=int((refund_amount * Decimal('100')).quantize(Decimal('1')))
                )
            except stripe.error.StripeError as e:
                return Response(
                    {"status": False, "message": f"Stripe Error: {str(e)}"},
                      status=status.HTTP_400_BAD_REQUEST
                )
            Refund.objects.create(
                order=order,
                payment=payment,
                user=order.user,
                refund_amount=refund_amount,
                admin_note=f"{admin_note} | Refund type: {refund_type}",
                status='processed',
                payment_gateway_id=stripe_refund.id,
                currency=payment.currency
            )

            return Response({
                "status": True,
                "statuseCode":200,
                "message": "Refund initiated successfully",
                "stripe_refund_id": stripe_refund.id,
                "refunded_amount": str(refund_amount),
            },status=status.HTTP_200_OK)


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
            quotation.cancelled_by = user_role
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


class UserDetailAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    def get(self, request):
        try:
            users = Users.objects.all()
            if not users.exists():
                return Response(
                    {
                        "status":False,
                        "statusCode":404,
                        "message": "No users found."},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = UserListSerializer(users, many=True, context={'request': request})
            return Response({
                    "status":True,
                    "statusCode":200,
                    "data":serializer.data},status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {
                    "status":False,
                    "statusCode":500,
                    "error": "Something went wrong.", 
                 "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

#<-------------orderUpdate----------->
class AdminOderUpdateAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def put(self,request,order_id,format=None):
        try:
            order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist as e:
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Order not found",
            }, status=status.HTTP_404_NOT_FOUND)
 
        serializer = OrderUpdateSerializer(
            order,
            data=request.data,
            partial=True,
            context={"request": request}
        )
 
        if serializer.is_valid():
            serializer.save()
            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Order Update Successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
 
        return Response({
            "statusCode": 400,
            "status": False,
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

#<---------------OrderUpdateList--------------->
class AdminOrderListAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            orders = Order.objects.select_related("user").all().order_by("-created_at")

            search = request.query_params.get("search")
            status_param = request.query_params.get("status")
            order_id = request.query_params.get("order_id")
            user_id = request.query_params.get("user")

            if search:
                orders = orders.filter(
                    Q(order_id__icontains=search) |
                    Q(status__icontains=search)
                )

            if status_param:
                orders = orders.filter(status=status_param)

            if order_id:
                orders = orders.filter(order_id__icontains=order_id)

            if user_id:
                orders = orders.filter(user__id=user_id)

            paginator = CustomPagination()
            paginated_orders = paginator.paginate_queryset(orders, request)

            serializer = OrderUpdateSerializer(paginated_orders, many=True)
            response = paginator.get_paginated_response(serializer.data)

            response = {
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                    "statusCode": 200,
                    "status": True,
                    "message": "Order list fetched successfully.",
                    "data": serializer.data,
                    "pagination": {
                        "page": paginator.page.number,
                        "page_size": paginator.get_page_size(request),
                        "total_pages": paginator.page.paginator.num_pages,
                        "total_items": paginator.page.paginator.count
                    }
                }

            return Response(response, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while fetching order.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
       

class AdminOrderDetailAPIView(APIView):
    authentication_classes=[JWTAuthentication]
 
    def get(self,request,order_id):
        try:
            order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist as de:
            return Response({
                "statusCode":404,
                "status":False,
                "message":"order does not found",
                "error":str(de)
            },status=status.HTTP_404_NOT_FOUND)
        
        serializer = OrderUpdateSerializer(order)
        return Response({
            "statusCOde":200,
            "status":True,
            "message":"Order fetch successfully",
            "data":serializer.data
        },status=status.HTTP_200_OK)

#<-------------------Docusing fetch data by sign pdf id-------------------> 
class QuotationDetailByEnvelopeAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]  # Only admin can access

    def get(self, request, external_document_id):
        envelope_id = external_document_id

        try:
            quotation = QuotationRequest.objects.get(external_document_id=envelope_id)
        except QuotationRequest.DoesNotExist:
            return Response(
                {
                    "statusCode":404,
                    "status": False, 
                    "message": "Quotation not found"},
                status=404
            )

        db_data = {
            "quotation_id": quotation.quotation_id,
            "company_name": quotation.company_name,
            "contact_person": quotation.contact_person,
            "email": quotation.email,
            "phone_number": quotation.phone_number,
            "workflow_status": quotation.workflow_status,
            "is_signed": quotation.is_signed,
            "signed_at": quotation.signed_at,
            "signed_pdf_url": request.build_absolute_uri(quotation.signed_pdf.url)
                              if quotation.signed_pdf else None
        }

        # ------------------ Fetch DocuSign envelope ------------------
        try:
            access_token = get_docusign_token()
            api_client = ApiClient()
            api_client.host = "https://demo.docusign.net/restapi"
            api_client.set_default_header("Authorization", f"Bearer {access_token}")

            envelopes_api = EnvelopesApi(api_client)
            envelope = envelopes_api.get_envelope(
                account_id=settings.DOCUSIGN_ACCOUNT_ID,
                envelope_id=envelope_id
            )

            docusign_data = {
                "status": envelope.status,
                "email_subject": envelope.email_subject,
                "completed_date_time": envelope.completed_date_time,
                "recipients": [r.to_dict() for r in envelope.recipients.signers] 
                               if envelope.recipients else []
            }

        except Exception as e:
            docusign_data = {"error": str(e)}

        # ------------------ Return combined response ------------------
        return Response({
            "statusCode":201,
            "status": True,
            "db_data": db_data,
            "docusign_data": docusign_data
        },status=201)


#<------------------OrderCancelledAdminAPI------------------->
class AdminOrderCancelAPIView(APIView):
    authentication_classes=[IsAdminUserJWT]
    
    def post(self,request,order_id):
        try:
           order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist as e:
            return Response({
                "statusCode":404,
                "status":False,
                "message":"Order Does not found",
                "error":str(e)
            },status=status.HTTP_404_NOT_FOUND)
        
        if order.status=='cancelled':
            return Response({
                "statusCode":409,
                "status":False,
                "message":"Order already cancelled"
            },status=status.HTTP_409_CONFLICT)
        if order.status in ["delivered", "paid"]:
            return Response({
                "StatusCode":409,
                "status":False,
                "message":"Cannot cancel completed order",
            },status=status.HTTP_409_CONFLICT)
        
        reason = request.data.get("reason", "")
        with transaction.atomic():
            for item in order.items.all():
                product = item.product
                product.available_quantity += item.quantity
                product.save()
            
            order.status = "cancelled"
            order.cancelled_by = request.user.name
            order.admin_cancel_reason = reason
            order.save()
            return Response({
                "statusCode":200,
                "status":True,
                "message":"Order cancelled successfully & stock restored"
            },status=status.HTTP_200_OK)
