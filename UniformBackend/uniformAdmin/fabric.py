from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated ,BasePermission,AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from rest_framework import status

from .serializers import FabricSerializer
from .models import Fabric
from drf_spectacular.utils import extend_schema,OpenApiExample,OpenApiResponse,OpenApiParameter,OpenApiTypes

import logging  
from uniformAdmin.currency import get_currency
logger = logging.getLogger(__name__)

class IsAdministrator(BasePermission):
    """
    Allow AdminUser with role 'admin', superuser, or staff status.
    """
    def has_permission(self, request, view):
        try:
            user = request.user
            if not user or not user.is_authenticated:
                return False
            if getattr(user, "is_superuser", False) or getattr(user, "is_staff", False):
                return True
            role = getattr(user, "role", None)
            if role:
                rname = str(getattr(role, "role_name", "") or getattr(role, "slug", "")).lower()
                if rname in ["admin", "superadmin", "administrator"]:
                    return True
            return False
        except Exception:
            return False
        
class CustomPagination(PageNumberPagination):
    """Custom Pagination for Professional Users"""
    page_size = 10  # Number of results per page
    page_size_query_param = "page_size"
    max_page_size = 100  # Set a reasonable limit

        
#permission_classes = [IsAuthenticated, IsAdministrator]

@extend_schema(
    tags=["Fabric"],
    summary="Create a new fabric",
    request=FabricSerializer,
    responses={
        200: OpenApiResponse(description="Fabric created successfully"),
        400: OpenApiResponse(description="Validation error"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
class FabricCreateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]  # <-- ensures request.user is AdminUser

    def post(self, request):
        try:
            serializer = FabricSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save()
                response = {
                    "statusCode": 200,
                    "status": True,
                    "message": "Fabric created successfully",
                    "data": serializer.data
                }
                logger.info(f"FabricCreateView POST - 200 - {response}")
                return Response(response)


            # ONLY ADDITION STARTS HERE
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
            # ONLY ADDITION ENDS HERE

            first_err = ""
            if isinstance(serializer.errors, dict):
                for k, v in serializer.errors.items():
                    val = v[0] if isinstance(v, list) and v else str(v)
                    first_err = f"{k}: {val}" if k != "non_field_errors" else str(val)
                    break

            response = {
                "statusCode": 400,
                "status": False,
                "message": first_err or "Validation Error",
                "errors": serializer.errors,
                "error": serializer.errors
            }
            logger.warning(f"FabricCreateView POST - 400 - {response}")
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            response = {
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }
            logger.error(f"FabricCreateView POST - 500 - {response}")
            return Response(response)


@extend_schema(
    tags=["Fabric"],
    summary="Get list of fabrics",
    responses={
        200: OpenApiResponse(description="Fabric list fetched successfully"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
class FabricListView(APIView):
    

    def get(self, request):
        try:
            search_query = request.query_params.get("search", "").strip()
            category_id = (
                request.query_params.get("category_id")
                or request.query_params.get("category")
                or request.query_params.get("categoryId")
            )
            subcategory_id = (
                request.query_params.get("subcategory_id")
                or request.query_params.get("subcategory")
                or request.query_params.get("subcategoryId")
            )
            fabric_type = (
                request.query_params.get("fabric_type")
                or request.query_params.get("fabricType")
            )
            is_active = (
                request.query_params.get("isActive")
                or request.query_params.get("is_active")
            )

            fabrics = Fabric.objects.filter(isDeleted=False)

            if category_id and str(category_id).strip() and str(category_id).strip().lower() not in ["all", "null", "undefined"]:
                fabrics = fabrics.filter(category_id=str(category_id).strip())

            if subcategory_id and str(subcategory_id).strip() and str(subcategory_id).strip().lower() not in ["all", "null", "undefined"]:
                fabrics = fabrics.filter(subcategory_id=str(subcategory_id).strip())

            if fabric_type and str(fabric_type).strip() and str(fabric_type).strip().lower() not in ["all", "null", "undefined"]:
                fabrics = fabrics.filter(fabricType=str(fabric_type).strip())

            if is_active is not None and is_active != "":
                if str(is_active).lower() in ["true", "1"]:
                    fabrics = fabrics.filter(isActive=True)
                elif str(is_active).lower() in ["false", "0"]:
                    fabrics = fabrics.filter(isActive=False)

            if search_query:
                fabrics = fabrics.filter(
                    Q(fabricName__icontains=search_query)
                    | Q(color__icontains=search_query)
                    | Q(materialType__icontains=search_query)
                    | Q(category__categoryName__icontains=search_query)
                    | Q(subcategory__name__icontains=search_query)
                )

            fabrics = fabrics.select_related("category", "subcategory", "theme").order_by("-id")

            paginator = CustomPagination()
            page = paginator.paginate_queryset(fabrics, request)
            serializer = FabricSerializer(page, many=True)

            # Build your required response manually
            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Fabric list fetched successfully",
                # Display currency travels with the prices, the same way Reports and
                # Quotation History do it, so the page never has to assume a symbol.
                # This list was printing a hardcoded ₹ while the system currency is USD.
                "currency": get_currency(),
                "data": serializer.data,
                "pagination": {
                    "page": paginator.page.number,
                    "page_size": paginator.get_page_size(request),
                    "total_pages": paginator.page.paginator.num_pages,
                    "total_items": paginator.page.paginator.count
                }
            }

            return Response(response)

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }, status=500)


@extend_schema(
    tags=["Fabric"],
    summary="Get fabric details by ID",
    responses={
        200: OpenApiResponse(description="Fabric fetched successfully"),
        404: OpenApiResponse(description="Fabric not found"),
        500: OpenApiResponse(description="Internal server error"),
    },
)        
class FabricDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            try:
                fabric = Fabric.objects.get(id=pk, isDeleted=False)
            except Fabric.DoesNotExist:
                response = {
                    "statusCode": 404,
                    "status": False,
                    "message": "Fabric not found"
                }
                logger.warning(f"FabricDetailView GET - {response}")
                return Response(response)

            serializer = FabricSerializer(fabric)
            response = {
                "statusCode": 200,
                "status": True,
                "message": "Fabric fetched successfully",
                "data": serializer.data
            }
            logger.info(f"FabricDetailView GET - {response}")
            return Response(response)

        except Exception as e:
            response = {
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }
            logger.error(f"FabricDetailView GET - {response}")
            return Response(response)
    


@extend_schema(
    tags=["Fabric"],
    summary="Update fabric by ID",
    request=FabricSerializer,
    responses={
        200: OpenApiResponse(description="Fabric updated successfully"),
        400: OpenApiResponse(description="Validation error"),
        404: OpenApiResponse(description="Fabric not found"),
        500: OpenApiResponse(description="Internal server error"),
    },
)    
class FabricUpdateView(APIView):
    permission_classes = [IsAdministrator]
    # authentication_classes = [JWTAuthentication]
    authentication_classes = [JWTAuthentication] 


    def put(self, request, pk):
        try:
            try:
                fabric = Fabric.objects.get(id=pk, isDeleted=False)
            except Fabric.DoesNotExist:
                response = {
                    "statusCode": 404,
                    "status": False,
                    "message": "Fabric not found"
                }
                logger.warning(f"FabricUpdateView PUT - {response}")
                return Response(response)

            serializer = FabricSerializer(fabric, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()

                response = {
                    "statusCode": 200,
                    "status": True,
                    "message": "Fabric updated successfully",
                    "data": serializer.data
                }
                logger.info(f"FabricUpdateView PUT - {response}")
                return Response(response)

            first_err = ""
            if isinstance(serializer.errors, dict):
                for k, v in serializer.errors.items():
                    val = v[0] if isinstance(v, list) and v else str(v)
                    first_err = f"{k}: {val}" if k != "non_field_errors" else str(val)
                    break

            response = {
                "statusCode": 400,
                "status": False,
                "message": first_err or "Validation Error",
                "errors": serializer.errors,
                "error": serializer.errors
            }
            logger.warning(f"FabricUpdateView PUT - {response}")
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            response = {
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }
            logger.error(f"FabricUpdateView PUT - {response}")
            return Response(response)


@extend_schema(
    tags=["Fabric"],
    summary="Delete fabric by ID",
    responses={
        200: OpenApiResponse(description="Fabric deleted successfully"),
        404: OpenApiResponse(description="Fabric not found"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
class FabricDeleteView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def delete(self, request, pk):
        try:
            try:
                fabric = Fabric.objects.get(id=pk, isDeleted=False)
            except Fabric.DoesNotExist:
                response = {
                    "statusCode": 404,
                    "status": False,
                    "message": "Fabric not found"
                }
                logger.warning(f"FabricDeleteView DELETE - {response}")
                return Response(response)

            fabric.isDeleted = True
            fabric.isActive = False
            fabric.save()

            response = {
                "statusCode": 200,
                "status": True,
                "message": "Fabric soft-deleted successfully"
            }
            logger.info(f"FabricDeleteView DELETE - {response}")
            return Response(response)

        except Exception as e:
            response = {
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }
            logger.error(f"FabricDeleteView DELETE - {response}")
            return Response(response)



