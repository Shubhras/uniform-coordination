from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .authentication import StaffJWTAuthentication
from django.db import transaction
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes, OpenApiExample, OpenApiResponse

from .models import TableTheme, ThemeCoverImage, ThemeItem, Product
from .serializers import TableThemeSerializer
from uniformAdmin.fabric import CustomPagination
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
#<--------------------TableTheme------------------
class CustomPagination(PageNumberPagination):
    """Custom Pagination for Professional Users"""
    page_size = 10  # Number of results per page
    page_size_query_param = "page_size"
    max_page_size = 100  # Set a reasonable limit


class TableThemeCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [StaffJWTAuthentication]
    
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
        import json
        try:
            with transaction.atomic():
                serializer = TableThemeSerializer(data=request.data,context={"request": request})
                if serializer.is_valid():
                    theme = serializer.save()
                    
                    # Handle cover images
                    cover_images = request.FILES.getlist('cover_images')
                    for img in cover_images:
                        ThemeCoverImage.objects.create(theme=theme, image=img)
                        
                    # Handle theme items builder
                    theme_items_raw = request.data.get('theme_items')
                    if theme_items_raw:
                        try:
                            if isinstance(theme_items_raw, str):
                                items_data = json.loads(theme_items_raw)
                            elif isinstance(theme_items_raw, list):
                                items_data = theme_items_raw
                            else:
                                items_data = []

                            for item in items_data:
                                if not isinstance(item, dict):
                                    continue
                                product_id = item.get('product_id') or item.get('product')
                                section = item.get('section')
                                if not product_id or not section:
                                    continue
                                if not Product.objects.filter(id=product_id, isDeleted=False).exists():
                                    continue
                                ThemeItem.objects.get_or_create(
                                    theme=theme,
                                    product_id=product_id,
                                    section=section
                                )
                        except Exception as e:
                            pass

                    # Re-serialize to include newly created nested objects
                    response_serializer = TableThemeSerializer(theme, context={"request": request})
                    return Response({
                        "statusCode":201,
                        "status":True,
                        "message":"Table Theme create successfully.",
                        "data":response_serializer.data
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
    # permission_classes = [IsAuthenticated]
    # authentication_classes = [JWTAuthentication]

    @extend_schema(
        tags=["Table Theme"],
        summary="List Table Themes",
        description="Fetch paginated table themes with search and category filter.",
        parameters=[
            OpenApiParameter(
                name="search",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Search by theme title",
                required=False,
            ),
            OpenApiParameter(
                name="category_id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="Filter by category ID",
                required=False,
            ),
            OpenApiParameter(
                name="ordering",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="newest | oldest",
                required=False,
            ),
            OpenApiParameter(
                name="page",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                required=False,
            ),
            OpenApiParameter(
                name="page_size",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                required=False,
            ),
        ],
        responses={
            200: OpenApiResponse(description="Table themes fetched successfully"),
            500: OpenApiResponse(description="Server error"),
        },
    )
    def get(self, request):
        try:
            search = request.query_params.get("search")
            category_id = request.query_params.get("category_id")
            ordering = request.query_params.get("ordering", "newest")

            queryset = TableTheme.objects.filter(isDeleted=False)

            # Search
            if search:
                queryset = queryset.filter(
                    Q(title__icontains=search)
                )

            # Category Filter
            if category_id:
                queryset = queryset.filter(category_id=category_id)

            # Ordering
            if ordering == "oldest":
                queryset = queryset.order_by("created_at")
            else:
                queryset = queryset.order_by("-created_at")

            # Pagination
            paginator = CustomPagination()
            paginated_queryset = paginator.paginate_queryset(queryset, request)

            serializer = TableThemeSerializer(
                paginated_queryset,
                many=True,
                context={"request": request}
            )

            page_number = paginator.page.number if paginator.page else 1
            page_size = paginator.get_page_size(request) or 10
            total_items = paginator.page.paginator.count if paginator.page else queryset.count()
            total_pages = paginator.page.paginator.num_pages if paginator.page else 1

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Table Themes fetched successfully.",
                "count": total_items,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "page": page_number,
                "page_size": page_size,
                "total_pages": total_pages,
                "total_items": total_items,
                "pagination": {
                    "page": page_number,
                    "page_size": page_size,
                    "total_pages": total_pages,
                    "total_items": total_items,
                },
                "data": serializer.data,
                "results": {
                    "statusCode": 200,
                    "status": True,
                    "message": "Table Themes fetched successfully.",
                    "data": serializer.data
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": "Server error while fetching table themes.",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
  

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
    authentication_classes = [StaffJWTAuthentication]
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
        import json
        try:
            with transaction.atomic():
                theme = TableTheme.objects.get(id=id, isDeleted=False)

                serializer = TableThemeSerializer(
                    theme,
                    data=request.data,
                    partial=True,  # KEY FIX
                    context={"request": request}
                )

                if serializer.is_valid():
                    theme = serializer.save()
                    
                    # Handle cover images append/replace
                    cover_images = request.FILES.getlist('cover_images')
                    if cover_images:
                        for img in cover_images:
                            ThemeCoverImage.objects.create(theme=theme, image=img)
                            
                    # Handle theme items builder updates
                    theme_items_raw = request.data.get('theme_items')
                    if theme_items_raw is not None:
                        try:
                            if isinstance(theme_items_raw, str):
                                items_data = json.loads(theme_items_raw)
                            elif isinstance(theme_items_raw, list):
                                items_data = theme_items_raw
                            else:
                                items_data = []

                            if isinstance(items_data, list):
                                ThemeItem.objects.filter(theme=theme).delete() # clear existing
                                for item in items_data:
                                    if not isinstance(item, dict):
                                        continue
                                    product_id = item.get('product_id') or item.get('product')
                                    section = item.get('section')
                                    if not product_id or not section:
                                        continue
                                    if not Product.objects.filter(id=product_id, isDeleted=False).exists():
                                        continue
                                    ThemeItem.objects.get_or_create(
                                        theme=theme,
                                        product_id=product_id,
                                        section=section
                                    )
                        except Exception as e:
                            pass
                            
                    # Re-serialize to include newly updated nested objects
                    response_serializer = TableThemeSerializer(theme, context={"request": request})
                    return Response({
                        "status": True,
                        "statusCode": 200,
                        "message": "Table theme updated successfully",
                        "data": response_serializer.data
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
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": f"Server error while updating table theme: {str(e)}",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class TableThemeDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [StaffJWTAuthentication]

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
        try:
            ids = request.data.get("ids")

            if pk:
                try:
                    theme = TableTheme.objects.get(pk=pk, isDeleted=False)
                except TableTheme.DoesNotExist:
                    return Response({
                        "statusCode": 404,
                        "status": False,
                        "message": "Table theme not found.",
                        "data": None
                    }, status=status.HTTP_404_NOT_FOUND)

                theme.isDeleted = True
                theme.save()

                return Response({
                    "statusCode": 200,
                    "status": True,
                    "message": "Table theme deleted successfully.",
                    "data": None
                }, status=status.HTTP_200_OK)

            if ids == "all":
                queryset = TableTheme.objects.filter(isDeleted=False)
                count = queryset.count()
                queryset.update(isDeleted=True)

                return Response({
                    "statusCode": 200,
                    "status": True,
                    "message": f"All {count} table themes deleted successfully.",
                    "data": None
                })

            if not isinstance(ids, list):
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
            })

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": "Something went wrong.",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)