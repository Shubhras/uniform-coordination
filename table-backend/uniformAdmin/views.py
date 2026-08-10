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
from userhub.serializers import QuotationRequestSerializer,userOrderSerializer
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
from userhub.utils import send_return_received_email
from .auth import IsAdminUserJWT,MultiRoleJWTAuth
from drf_spectacular.utils import extend_schema,OpenApiExample,OpenApiResponse,OpenApiParameter,OpenApiTypes
from userhub.views import get_docusign_token
from docusign_esign import ApiClient, EnvelopesApi



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
            fabric_id = request.query_params.get("fabric_id")
            color_id = request.query_params.get("color_id")
            style = request.query_params.get("style")
            table_shape = request.query_params.get("table_shape")
            size = request.query_params.get("size")
            search = request.query_params.get("search")
            is_active = request.query_params.get("isActive")
            rfid_tracking = request.query_params.get("rfid_tracking_enabled")

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

            if fabric_id:
                products = products.filter(fabric_id=fabric_id)

            if color_id:
                products = products.filter(color_id=color_id)

            if style:
                products = products.filter(style__iexact=style)

            if table_shape:
                products = products.filter(table_shape__iexact=table_shape)

            if size:
                products = products.filter(size__iexact=size)

            if search:
                products = products.filter(productName__icontains=search)

            if is_active is not None:
                products = products.filter(
                    isActive=is_active.lower() == "true"
                )

            if rfid_tracking is not None:
                products = products.filter(
                    rfid_tracking_enabled=rfid_tracking.lower() == "true"
                )
            # -------------------------
            # Ordering
            # -------------------------
            if ordering == "oldest":
                products = products.order_by("created_at")

            elif ordering == "price_low":
                products = products.order_by("price")

            elif ordering == "price_high":
                products = products.order_by("-price")

            else:
                products = products.order_by("-created_at")

            # serializer = ProductSerializer(products, many=True)
            pagination = CustomPagination()
            paginated_products = pagination.paginate_queryset(products, request)

            serializer = ProductSerializer(
                paginated_products,
                many=True,
                context={"request": request}
            )

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Products fetched successfully.",
                "count": pagination.page.paginator.count,
                "next": pagination.get_next_link(),
                "previous": pagination.get_previous_link(),
                "data": serializer.data
            }, status=status.HTTP_200_OK)
            # serializer = ProductSerializer(
            #     products,
            #     many=True,
            #     context={"request": request}
            # )

            # return Response({
            #     "status": True,
            #     "statusCode": 200,
            #     "message": "Products fetched successfully.",
            #     "data": serializer.data
            # }, status=status.HTTP_200_OK)

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


# class QuotationTemplateCreateAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     @extend_schema(
#     tags=["Quotation Template"],
#     summary="Create Quotation Template API",
#     description="Render a quotation using a selected quotation template.",
#     request={
#         "application/json": {
#             "type": "object",
#             "required": ["quotation_id", "template_slug"],
#             "properties": {
#                 "quotation_id": {
#                     "type": "string",
#                     "example": "QTN-1001"
#                 },
#                 "template_slug": {
#                     "type": "string",
#                     "example": "default-quotation-template"
#                 }
#             }
#         }
#     },
#     responses={
#         200: OpenApiResponse(description="Quotation rendered successfully"),
#         400: OpenApiResponse(description="Missing required fields"),
#         404: OpenApiResponse(description="Quotation or Template not found"),
#     },
#     )
#     def post(self, request):
#         quotation_id = request.data.get("quotation_id")
#         template_slug = request.data.get("template_slug")

#         if not quotation_id or not template_slug:
#             return Response(
#                 {"message": "quotation_id and template_slug are required"},
#                 status=400
#             )

#         quotation = QuotationRequest.objects.filter(
#             quotation_id=quotation_id,
#             isDeleted=False
#         ).first()

#         template = QuotationTemplate.objects.filter(
#             slug=template_slug,
#             is_active=True,
#             is_deleted=False
#         ).first()

#         if not quotation:
#             return Response({"message": "Quotation not found"}, status=404)

#         if not template:
#             return Response({"message": "Template not found"}, status=404)

#         rendered_text = render_quotation_template(
#             template.content,
#             quotation
#         )

#         return Response({
#             "quotation_id": quotation.quotation_id,
#             "rendered_content": rendered_text
#         })

class QuotationTemplateCreateAPIView(APIView):
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
    
class QuotationTamplateExportAPIView(APIView):
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
            
class AdminNotificationDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Admin Notification"],
        summary="Get Admin Notification Details",
        description="Fetch a single admin notification by ID and mark it as seen.",
        parameters=[
            OpenApiParameter(
                name="pk",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                required=True,
                description="Admin Notification ID",
            )
        ],
        responses={
            200: OpenApiResponse(description="Notification fetched successfully"),
            404: OpenApiResponse(description="Notification not found"),
            500: OpenApiResponse(description="Server error"),
        },
    )
    def get(self, request, pk):
        try:
            notification = AdminNotification.objects.get(pk=pk)

            # Mark as seen
            if not notification.is_seen:
                notification.is_seen = True
                notification.save(update_fields=["is_seen"])

            serializer = AdminNotificationSerializer(notification)

            return Response(
                {
                    "statusCode": 200,
                    "status": True,
                    "message": "Notification fetched successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        except AdminNotification.DoesNotExist:
            return Response(
                {
                    "statusCode": 404,
                    "status": False,
                    "message": "Notification not found.",
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
                }, status=status.HTTP_200_OK)

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

class MarkAlertsReviewedAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Admin Dashboard"],
        summary="Mark all active alerts as reviewed",
        description="Mark all pending inspections and late rentals as reviewed, so they are not shown on the dashboard.",
        responses={
            200: OpenApiResponse(description="All alerts marked as reviewed"),
            500: OpenApiResponse(description="Failed to mark alerts as reviewed"),
        }
    )
    def post(self, request):
        try:
            from userhub.models import Rental
            InspectionItem.objects.filter(result='pending').update(is_reviewed=True)
            Rental.objects.filter(status='late', isDeleted=False, isActive=True).update(is_reviewed=True)
            
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "All alerts marked as reviewed"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to mark alerts as reviewed",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminDashAPIView(APIView):
    # permission_classes = [IsAdministrator]
    permission_classes  =[IsAuthenticated]    #need to remove after take clone 
    
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
                            "Available_Inventory": {"type": "integer"},
                            "Active_Rentals": {"type": "integer"},
                            "Pending_Orders": {"type": "integer"},
                            "Most_Rented_Theme": {"type": "array"},
                            "Requests_This_Week": {"type": "array"},
                            "Active_Alerts": {"type": "object"},
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
                role__role_name__in=["b2b", "b2b_user"],
                created_at__gte=current_month_start
            ).count()

            previous_month_b2b = AdminUser.objects.filter(
                role__role_name__in=["b2b", "b2b_user"],
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

            # Orders Weekly
            from userhub.models import Order
            orders_weekly_result = {i: 0 for i in range(1, 8)}
            orders_week_qs = (
                Order.objects
                .filter(
                    is_deleted=False,
                    created_at__date__gte=start_of_week.date(),
                    created_at__date__lte=end_of_week.date()
                )
                .annotate(day=ExtractWeekDay("created_at"))
                .values("day")
                .annotate(value=Count("id"))
            )
            for item in orders_week_qs:
                orders_weekly_result[item["day"]] = item["value"]

            orders_weekly_data = [{"label": DAY_MAP[d], "value": orders_weekly_result[d]} for d in range(1, 8)]

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

            most_used_industries = [
                {
                    "category_name": item["category__categoryName"] or "Uncategorized",
                    "category_slug": item["category__slug"] or "",
                    "count": item["count"]
                }
                for item in most_used_categories_qs
            ]
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
                     
            # New Dashboard Metrics
            available_inventory = Product.objects.filter(isDeleted=False, isActive=True).aggregate(Sum('available_quantity'))['available_quantity__sum'] or 0
            
            active_rentals = Rental.objects.filter(status__in=['rented', 'late'], isActive=True, isDeleted=False).count()
            
            pending_orders = Order.objects.filter(status='pending', is_deleted=False).count()
            
            most_rented_themes_qs = (
                RentalItem.objects
                .filter(isDeleted=False, isActive=True, product__theme_associations__theme__isnull=False)
                .values("product__theme_associations__theme__title")
                .annotate(count=Count("id"))
                .order_by("-count")[:6]
            )
            most_rented_themes = [
                {
                    "theme_name": item["product__theme_associations__theme__title"],
                    "count": item["count"]
                }
                for item in most_rented_themes_qs
            ]
            
            items_waiting_inspection = InspectionItem.objects.filter(result='pending', is_reviewed=False).count()
            late_returns = Rental.objects.filter(status='late', isDeleted=False, isActive=True, is_reviewed=False).count()
            
            active_alerts = {
                "high": {
                    "label": f"{items_waiting_inspection} Items Waiting Inspection",
                    "count": items_waiting_inspection
                },
                "medium": {
                    "label": f"{late_returns} Late Returns",
                    "count": late_returns
                }
            }

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
                    "Available_Inventory": available_inventory,
                    "Active_Rentals": active_rentals,
                    "Pending_Orders": pending_orders,
                    "Most_Rented_Theme": most_rented_themes,
                    "Requests_This_Week": yearly_data,
                    "Orders_This_Week": orders_weekly_data,
                    "Active_Alerts": active_alerts,
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



# normaluser 
class UserDetailAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            users = Users.objects.select_related("role").all().order_by("-createdAt")

            # -------------------------
            # Query Parameters
            # -------------------------
            search = request.query_params.get("search", "").strip()
            role_id = request.query_params.get("role")
            user_type = request.query_params.get("userType")
            is_active = request.query_params.get("status")

            # -------------------------
            # Search
            # -------------------------
            if search:
                users = users.filter(
                    Q(userName__icontains=search) |
                    Q(firstName__icontains=search) |
                    Q(lastName__icontains=search) |
                    Q(email__icontains=search) |
                    Q(phone__icontains=search)
                )

            # -------------------------
            # Filter by Role
            # -------------------------
            if role_id:
                users = users.filter(role_id=role_id)

            # -------------------------
            # Filter by User Type
            # -------------------------
            if user_type:
                users = users.filter(userType__iexact=user_type)

            # -------------------------
            # Filter by Status
            # status=true / false
            # -------------------------
            if is_active is not None:
                if str(is_active).lower() == "true":
                    users = users.filter(isActive=True)
                elif str(is_active).lower() == "false":
                    users = users.filter(isActive=False)

            # -------------------------
            # No Data
            # -------------------------
            if not users.exists():
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "No users found."
                }, status=status.HTTP_200_OK)

            # -------------------------
            # Pagination
            # -------------------------
            paginator = CustomPagination()
            page = paginator.paginate_queryset(users, request)

            serializer = UserListSerializer(
                page,
                many=True,
                context={"request": request}
            )

            return Response({
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "page": paginator.page.number,
                "page_size": paginator.get_page_size(request),
                "total_pages": paginator.page.paginator.num_pages,
                "total_items": paginator.page.paginator.count,
                "status": True,
                "statusCode": 200,
                "message": "Users fetched successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Something went wrong.",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
class UserByIdAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    @extend_schema(
        tags=["Users"],
        summary="Get User Details",
        description="Retrieve details of a specific user by ID.",
        parameters=[
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description="User ID",
                required=True,
            )
        ],
        responses={
            200: OpenApiResponse(description="User details fetched successfully"),
            404: OpenApiResponse(description="User not found"),
            500: OpenApiResponse(description="Server error"),
        },
    )
    def get(self, request, id):
        try:
            user = Users.objects.select_related("role").filter(id=id).first()

            if not user:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "User not found."
                }, status=status.HTTP_404_NOT_FOUND)

            serializer = UserListSerializer(
                user,
                context={"request": request}
            )

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "User details fetched successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Something went wrong.",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
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
            orders = Order.objects.select_related("user", "user__role").all().order_by("-created_at")

            search = request.query_params.get("search")
            status_param = request.query_params.get("status")
            order_id = request.query_params.get("order_id")
            user_id = request.query_params.get("user")
            customer_type = request.query_params.get("customer_type")  # 'b2b' or 'b2c'

            # Aggregate Counts BEFORE filtering by status/search/etc so the tabs always show total numbers
            b2b_orders = orders.filter(user__role__role_name__in=["b2b", "b2b_user"])
            b2c_orders = orders.exclude(user__role__role_name__in=["b2b", "b2b_user"])
            
            b2b_counts = {
                "pending": b2b_orders.filter(status="pending").count(),
                "delivered": b2b_orders.filter(status="delivered").count(),
                "shipped": b2b_orders.filter(status="out_for_delivery").count(),
                "returned": b2b_orders.filter(status="returned").count(),
                "total": b2b_orders.count()
            }
            
            b2c_counts = {
                "pending": b2c_orders.filter(status="pending").count(),
                "delivered": b2c_orders.filter(status="delivered").count(),
                "shipped": b2c_orders.filter(status="out_for_delivery").count(),
                "returned": b2c_orders.filter(status="returned").count(),
                "total": b2c_orders.count()
            }

            # Apply customer_type filter for the list
            if customer_type == "b2b":
                orders = orders.filter(user__role__role_name__in=["b2b", "b2b_user"])
            elif customer_type == "b2c":
                orders = orders.exclude(user__role__role_name__in=["b2b", "b2b_user"])

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

            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Order list fetched successfully.",
                "data": serializer.data,
                "counts": {
                    "b2b": b2b_counts,
                    "b2c": b2c_counts
                },
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
       


class AdminOrderUpdateAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    
    def patch(self, request, order_id):
        try:
            order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist:
            return Response({"status": False, "statusCode": 404, "message": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if not new_status:
            return Response({"status": False, "statusCode": 400, "message": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)

        valid_statuses = [choice[0] for choice in Order.STATUS_CHOICE]
        if new_status not in valid_statuses:
            return Response({"status": False, "statusCode": 400, "message": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}, status=status.HTTP_400_BAD_REQUEST)

        order.status = new_status
        if new_status == 'cancelled':
            order.admin_cancel_reason = request.data.get('admin_cancel_reason', '')
            order.cancelled_by = 'admin'

        order.save()

        # Handle Inspection Queue for returned items
        if new_status == 'returned':
            rental = getattr(order, 'rental', None)
            if not rental:
                # Ensure start_date and end_date are valid dates
                from django.utils import timezone
                today = timezone.now().date()
                rental = Rental.objects.create(
                    order=order,
                    customer=order.customer,
                    start_date=order.rental_start_date if order.rental_start_date else today,
                    end_date=order.rental_end_date if order.rental_end_date else today,
                    shipping_address=getattr(order.customer, "address_line_1", "") if order.customer else "",
                    shipping_fee=order.shipping_charge or 0,
                    tax=order.tax or 0,
                    total_amount=order.total_amount or 0,
                    status='rented'
                )
                for item in order.items.all():
                    RentalItem.objects.create(
                        rental=rental,
                        product=item.product,
                        quantity=item.quantity,
                        price_per_day=item.price_per_day or 0,
                        subtotal=item.subtotal or 0
                    )
            
            # Generate InspectionItems for the admin warehouse queue
            for r_item in rental.items.all():
                InspectionItem.objects.get_or_create(
                    rental_item=r_item,
                    order=order,
                    defaults={
                        'returned_qty': r_item.quantity,
                        'result': 'pending'
                    }
                )

        # Send Return Received Email
        if new_status == 'returned' and hasattr(order, 'customer') and hasattr(order.customer, 'user'):
            send_return_received_email(order.customer.user, order)
        elif new_status == 'returned' and hasattr(order, 'user'):
            send_return_received_email(order.user, order)
            
        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Order updated successfully",
            "data": {
                "order_id": order.order_id,
                "status": order.status,
                "user_cancel_reason": order.cancel_reason,
                "admin_cancel_reason": order.admin_cancel_reason,
                "cancelled_by": order.cancelled_by
            }
        }, status=status.HTTP_200_OK)


    # def patch(self, request, order_id):
    #     try:
    #         order = Order.objects.get(order_id=order_id)
    #     except Order.DoesNotExist:
    #         return Response({"status": False, "statusCode": 404, "message": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    #     new_status = request.data.get('status')
    #     if not new_status:
    #         return Response({"status": False, "statusCode": 400, "message": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)

    #     valid_statuses = [choice[0] for choice in Order.STATUS_CHOICE]
    #     if new_status not in valid_statuses:
    #         return Response({"status": False, "statusCode": 400, "message": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}, status=status.HTTP_400_BAD_REQUEST)

    #     order.status = new_status
    #     if new_status == 'cancelled':
    #         order.admin_cancel_reason = request.data.get('admin_cancel_reason', '')
    #         order.cancelled_by = 'admin'

    #     order.save()

    #     # Send Return Received Email
    #     if new_status == 'returned' and hasattr(order, 'customer') and hasattr(order.customer, 'user'):
    #         send_return_received_email(order.customer.user, order)
    #     elif new_status == 'returned' and hasattr(order, 'user'):
    #         send_return_received_email(order.user, order)
            
    #     return Response({
    #         "status": True,
    #         "statusCode": 200,
    #         "message": "Order updated successfully",
    #         "data": {
    #             "order_id": order.order_id,
    #             "status": order.status,
    #             "user_cancel_reason": order.cancel_reason,
    #             "admin_cancel_reason": order.admin_cancel_reason,
    #             "cancelled_by": order.cancelled_by
    #         }
    #     }, status=status.HTTP_200_OK)


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
        
        # serializer = OrderUpdateSerializer(order)
        serializer = userOrderSerializer(
                order,
                context={"request": request}
            )
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



class CompensationInvoicePreviewAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist:
            return Response({"status": False, "statusCode": 404, "message": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        # Gather all inspection items for this order
        inspections = InspectionItem.objects.filter(order=order)
        
        items_preview = []
        total_replacement = Decimal('0.00')
        total_penalty = Decimal('0.00')
        grand_total = Decimal('0.00')

        # We will assume replacement cost is product price * qty, penalty is 0 by default.
        # If the user wants specific penalty, they can send it in Generate payload.
        for inspection in inspections:
            if inspection.damaged_qty > 0 or inspection.missing_qty > 0:
                product = inspection.rental_item.product if inspection.rental_item else None
                if not product:
                    continue
                
                # Damaged
                if inspection.damaged_qty > 0:
                    qty = inspection.damaged_qty
                    rep_cost = (product.price or 0) * qty
                    total_replacement += rep_cost
                    items_preview.append({
                        "product_id": product.id,
                        "product_name": product.productName,
                        "issue_type": "damaged",
                        "quantity": qty,
                        "replacement_cost": str(rep_cost),
                        "penalty_cost": "0.00",
                        "total_cost": str(rep_cost)
                    })
                
                # Missing
                if inspection.missing_qty > 0:
                    qty = inspection.missing_qty
                    rep_cost = (product.price or 0) * qty
                    total_replacement += rep_cost
                    items_preview.append({
                        "product_id": product.id,
                        "product_name": product.productName,
                        "issue_type": "missing",
                        "quantity": qty,
                        "replacement_cost": str(rep_cost),
                        "penalty_cost": "0.00",
                        "total_cost": str(rep_cost)
                    })

        grand_total = total_replacement + total_penalty

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Compensation Invoice preview generated",
            "data": {
                "order_id": order.order_id,
                "items": items_preview,
                "summary": {
                    "total_replacement_cost": str(total_replacement),
                    "total_penalty_cost": str(total_penalty),
                    "grand_total": str(grand_total)
                }
            }
        }, status=status.HTTP_200_OK)


class CompensationInvoiceGenerateAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist:
            return Response({"status": False, "statusCode": 404, "message": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        # Expecting payload: 
        # { "items": [{"product_id": 1, "issue_type": "damaged", "quantity": 1, "replacement_cost": "100.00", "penalty_cost": "20.00"}...] }
        items_data = request.data.get('items', [])
        if not items_data:
            return Response({"status": False, "statusCode": 400, "message": "Items are required to generate invoice"}, status=status.HTTP_400_BAD_REQUEST)

        total_replacement = Decimal('0.00')
        total_penalty = Decimal('0.00')
        grand_total = Decimal('0.00')

        with transaction.atomic():
            invoice = CompensationInvoice.objects.create(
                order=order,
                status="sent" # Since they click generate and send
            )

            for item in items_data:
                product = Product.objects.get(id=item['product_id'])
                rep_cost = Decimal(str(item.get('replacement_cost', '0.00')))
                pen_cost = Decimal(str(item.get('penalty_cost', '0.00')))
                tot_cost = rep_cost + pen_cost

                CompensationInvoiceItem.objects.create(
                    invoice=invoice,
                    product=product,
                    issue_type=item.get('issue_type', 'damaged'),
                    quantity=item.get('quantity', 1),
                    replacement_cost=rep_cost,
                    penalty_cost=pen_cost,
                    total_cost=tot_cost
                )

                total_replacement += rep_cost
                total_penalty += pen_cost
                grand_total += tot_cost
            
            invoice.total_replacement_cost = total_replacement
            invoice.total_penalty_cost = total_penalty
            invoice.grand_total = grand_total
            invoice.save()

        return Response({
            "status": True,
            "statusCode": 201,
            "message": "Compensation Invoice generated and sent successfully",
            "data": {
                "invoice_id": invoice.id,
                "order_id": order.order_id,
                "grand_total": str(invoice.grand_total)
            }
        }, status=status.HTTP_201_CREATED)


class AdminContractsListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        from userhub.models import Contract
        
        # Get query parameters
        search_query = request.query_params.get("search", "")
        status_filter = request.query_params.get("status", "")
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 10))

        contracts = Contract.objects.all().order_by("-created_at")

        if search_query:
            contracts = contracts.filter(
                Q(contract_id__icontains=search_query) |
                Q(company_name__icontains=search_query) |
                Q(contact_person__icontains=search_query) |
                Q(email__icontains=search_query) |
                Q(order__order_id__icontains=search_query)
            )

        if status_filter:
            contracts = contracts.filter(contract_status__iexact=status_filter)

        total_count = contracts.count()

        # Paginate
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_contracts = contracts[start_idx:end_idx]

        data_list = []
        for contract in paginated_contracts:
            data_list.append({
                "id": contract.id,
                "contract_id": contract.contract_id,
                "order_id": contract.order.order_id if contract.order else None,
                "company_name": contract.company_name,
                "contact_person": contract.contact_person,
                "email": contract.email,
                "phone_number": contract.phone_number,
                "delivery_date": str(contract.delivery_date) if contract.delivery_date else None,
                "workflow_status": contract.workflow_status,
                "contract_status": contract.contract_status,
                "is_signed": contract.is_signed,
                "signed_at": contract.signed_at.strftime("%Y-%m-%d %H:%M:%S") if contract.signed_at else None,
                "created_at": contract.created_at.strftime("%Y-%m-%d %H:%M:%S") if contract.created_at else None,
            })

        return Response({
            "status": True,
            "statusCode": 200,
            "data": data_list,
            "pagination": {
                "count": total_count,
                "page": page,
                "page_size": page_size
            }
        }, status=200)


class AdminContractDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request, contract_id):
        from userhub.models import Contract, ContractAuditLog
        
        contract = Contract.objects.filter(contract_id=contract_id).first()
        if not contract:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Contract not found"
            }, status=404)

        # Get items from the associated order
        items_data = []
        summary_data = {
            "items": "0 line items",
            "rental_days": "0 days",
            "subtotal": "¥0.00",
            "discount": "¥0.00",
            "delivery": "¥0.00",
            "total": "¥0.00"
        }

        if contract.order:
            order = contract.order
            for item in order.items.all():
                items_data.append({
                    "item": item.product.productName,
                    "category": item.product.subcategory.category.categoryName if (item.product.subcategory and item.product.subcategory.category) else "Uniform",
                    "requested": item.quantity,
                    "availability": f"Available ({item.quantity})",
                    "unitRate": f"¥{item.price_per_day}"
                })

            rental_days = 0
            if order.rental_start_date and order.rental_end_date:
                rental_days = (order.rental_end_date - order.rental_start_date).days + 1

            discount_amount = (order.subtotal or 0) + (order.shipping_charge or 0) + (order.tax or 0) - (order.total_amount or 0)
            if discount_amount < 0:
                discount_amount = 0

            summary_data = {
                "items": f"{order.items.count()} line items",
                "rental_days": f"{rental_days} days",
                "subtotal": f"¥{order.subtotal}",
                "discount": f"¥{discount_amount}",
                "delivery": f"¥{order.shipping_charge}",
                "total": f"¥{order.total_amount}"
            }

        # Format audit logs
        audit_logs = []
        logs = ContractAuditLog.objects.filter(contract=contract).order_by("-created_at")
        for log in logs:
            audit_logs.append({
                "action": log.action,
                "description": log.description,
                "timestamp": log.created_at.strftime("%Y-%m-%d %H:%M:%S")
            })

        # Set default downloads and documents structure
        import os
        from django.conf import settings
        
        pdf_filename = f"contract_{contract.contract_id}.pdf"
        pdf_path = os.path.join(settings.MEDIA_ROOT, "exports", pdf_filename)
        if not os.path.exists(pdf_path):
            from userhub.utils import generate_contract_pdf
            try:
                generate_contract_pdf(contract, request)
            except Exception:
                pass
                
        contract_pdf_url = request.build_absolute_uri(f"{settings.MEDIA_URL}exports/{pdf_filename}")

        signed_pdf_url = None
        if contract.is_signed and contract.signed_pdf:
            url = contract.signed_pdf.url
            if url.startswith("http"):
                signed_pdf_url = url
            else:
                signed_pdf_url = request.build_absolute_uri(url)

        downloads = ["Download Contract PDF"]
        documents = [
            {"label": "Contract PDF", "enabled": True, "url": contract_pdf_url},
            {"label": "Signed PDF", "enabled": contract.is_signed, "url": signed_pdf_url}
        ]
        if contract.is_signed:
            downloads.append("Download Signed PDF")

        data = {
            "id": contract.id,
            "contract_id": contract.contract_id,
            "contractId": contract.contract_id,
            "contractIdShort": contract.contract_id,
            "status": "Signed" if contract.is_signed else "Sent",
            "company_name": contract.company_name,
            "companyName": contract.company_name,
            "contact_person": contract.contact_person,
            "contactPerson": contract.contact_person,
            "business_email": contract.email,
            "businessEmail": contract.email,
            "phone_number": contract.phone_number,
            "phoneNumber": contract.phone_number,
            "company_address": contract.order.customer.address_line_1 if (contract.order and contract.order.customer) else "N/A",
            "companyAddress": contract.order.customer.address_line_1 if (contract.order and contract.order.customer) else "N/A",
            # "user_type": "B2B" if (contract.order and contract.order.user and contract.order.user.userType == "B2B") else "B2C",
            # "userType": "B2B" if (contract.order and contract.order.user and contract.order.user.userType == "B2B") else "B2C",
            "user_type": (
                contract.order.user.role.get_role_name_display()
                if (
                    contract.order
                    and contract.order.user
                    and contract.order.user.role
                )
                else "N/A"
            ),
            "userType": (
                contract.order.user.role.get_role_name_display()
                if (
                    contract.order
                    and contract.order.user
                    and contract.order.user.role
                )
                else "N/A"
            ),
            "signed_on_label": "Signed Date" if contract.is_signed else "Awaiting Signature",
            "signed_on_value": contract.signed_at.strftime("%d %b %Y") if contract.signed_at else "Awaiting Signature",
            "signedOnLabel": "Signed Date" if contract.is_signed else "Awaiting Signature",
            "signedOnValue": contract.signed_at.strftime("%d %b %Y") if contract.signed_at else "Awaiting Signature",
            "contract_status_label": "Contract Status",
            "contract_status_value": "Completed" if contract.is_signed else "Awaiting Signature",
            "contractStatusLabel": "Contract Status",
            "contractStatusValue": "Completed" if contract.is_signed else "Awaiting Signature",
            "venue_type": "Event" if contract.order else "N/A",
            "venueType": "Event" if contract.order else "N/A",
            "venue_name": contract.order.customer.city if (contract.order and contract.order.customer) else "N/A",
            "venueName": contract.order.customer.city if (contract.order and contract.order.customer) else "N/A",
            "requested_items_note": f"{len(items_data)} items for {summary_data['rental_days']} rental period",
            "requestedItemsNote": f"{len(items_data)} items for {summary_data['rental_days']} rental period",
            "downloads": downloads,
            "documents": documents,
            "rental_start": contract.order.rental_start_date.strftime("%d %b %Y") if (contract.order and contract.order.rental_start_date) else "N/A",
            "rentalStart": contract.order.rental_start_date.strftime("%d %b %Y") if (contract.order and contract.order.rental_start_date) else "N/A",
            "rental_end": contract.order.rental_end_date.strftime("%d %b %Y") if (contract.order and contract.order.rental_end_date) else "N/A",
            "rentalEnd": contract.order.rental_end_date.strftime("%d %b %Y") if (contract.order and contract.order.rental_end_date) else "N/A",
            "customer_notes": contract.additional_note or "None",
            "customerNotes": contract.additional_note or "None",
            "quotationNo": contract.order.order_id if contract.order else "N/A",
            "quotationDate": contract.order.created_at.strftime("%d %b %Y") if contract.order else "N/A",
            "is_signed": contract.is_signed,
            "isSigned": contract.is_signed,
            "signed_at": contract.signed_at.isoformat() if contract.signed_at else None,
            "signedAt": contract.signed_at.isoformat() if contract.signed_at else None,
            "created_at": contract.created_at.isoformat(),
            "createdAt": contract.created_at.isoformat(),
            "items": items_data,
            "summary": summary_data,
            "audit_logs": audit_logs
        }

        return Response({
            "status": True,
            "statusCode": 200,
            "data": data
        }, status=200)
