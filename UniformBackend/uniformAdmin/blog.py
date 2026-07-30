from .models import *
from uniformAdmin.serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated ,BasePermission,AllowAny
from rest_framework import status
from uniformAdmin.fabric import CustomPagination,IsAdministrator
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser #--------------do not use
from rest_framework_simplejwt.authentication import JWTAuthentication
from drf_spectacular.utils import extend_schema,OpenApiExample,OpenApiResponse,OpenApiParameter,OpenApiTypes



#---------------Blog APIs-------------------


@extend_schema(
    tags=["Blog (Admin)"],
    summary="Create Blog API",
    request=BlogSerializer,
    responses={
        201: OpenApiResponse(description="Blog created successfully"),
        400: OpenApiResponse(description="Validation failed"),
        500: OpenApiResponse(description="Server error"),
    },
)
class BlogCreateAPIView(APIView):
    """Admin: Create Blog"""
    
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        try:
            serializer = BlogSerializer(
                data=request.data,
                context={"request": request}
            )

            if serializer.is_valid():
                blog = serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Blog created successfully.",
                    "data": BlogSerializer(blog, context={"request": request}).data
                }, status=status.HTTP_201_CREATED)

            # CUSTOM CATEGORY ERROR
            if "category" in serializer.errors:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation failed; Invalid Selected Category",
                }, status=status.HTTP_400_BAD_REQUEST)

            # CUSTOM DUPLICATE TITLE ERROR
            if "title" in serializer.errors:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": f"Validation failed; {serializer.errors['title'][0]}"
                }, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Validation failed.",
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while creating blog.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    tags=["Blog (Admin)"],
    summary="Blogs List API",
    parameters=[
        OpenApiParameter(
            name="search",
            description="Search blogs by title or special keywords (uniform, table)",
            required=False,
            type=str,
        ),
        OpenApiParameter(
            name="category",
            description="Filter blogs by category ID",
            required=False,
            type=int,
        ),
        OpenApiParameter(
            name="type",
            description="Filter blogs by type",
            required=False,
            type=str,
        ),
    ],
    responses={
        200: OpenApiResponse(description="Blog list fetched successfully"),
        500: OpenApiResponse(description="Server error"),
    },
)
class BlogListAPIView(APIView):
    """List all blogs"""
    # permission_classes = [AllowAny]
    authentication_classes = []
    permission_classes = []


    def get(self, request):
        try:
            search = (request.query_params.get("search") or "").strip()
            category_id = request.query_params.get("category")
            blog_type = (request.query_params.get("type") or "").strip().lower()

            blogs = Blog.objects.filter(isDeleted=False)

            #  SEARCH FILTER
            if search:
                search_lower = search.lower()

                # Match special keys
                if search_lower in ["uniform", "table"]:
                    blogs = blogs.filter(slug=search_lower)

                # Otherwise search in title
                else:
                    blogs = blogs.filter(title__icontains=search)

            # CATEGORY FILTER
            if category_id:
                blogs = blogs.filter(category_id=category_id)

            #  TYPE FILTER
            if blog_type:
                blogs = blogs.filter(type=blog_type)

            blogs = blogs.order_by("-created_at")

            paginator = CustomPagination()
            page = paginator.paginate_queryset(blogs, request)

            serializer = BlogSerializer(
                page,
                many=True,
                context={"request": request}
            )

            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "page": paginator.page.number,
                "page_size": paginator.get_page_size(request),
                "total_pages": paginator.page.paginator.num_pages,
                "total_items": paginator.page.paginator.count,
                "statusCode": 200,
                "status": True,
                "message": "Blog list fetched successfully.",
                "data": serializer.data,                
            }

            return Response(response, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while fetching blogs.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    tags=["Blog (Admin)"],
    summary="Blog Details By ID API",
    responses={
        200: OpenApiResponse(description="Blog details fetched successfully"),
        500: OpenApiResponse(description="Server error"),
    },
)
class BlogDetailAPIView(APIView):
    """Public: Get single Blog details by ID"""
    permission_classes = [AllowAny]

    def get(self, request, blog_id):
        try:
            blog = Blog.objects.filter(
                id=blog_id,
                isDeleted=False
            ).select_related("category").first()

            if not blog:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Blog not found."
                }, status=status.HTTP_200_OK)

            serializer = BlogSerializer(blog,context={"request": request})

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Blog details fetched successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while fetching blog details.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@extend_schema(
    tags=["Blog (Admin)"],
    summary="Update Blog by ID",
    request=BlogSerializer,
    responses={
        200: OpenApiResponse(description="Blog updated successfully"),
        400: OpenApiResponse(description="Validation failed"),
        500: OpenApiResponse(description="Server error"),
    },
)
class BlogUpdateAPIView(APIView):
    """Admin: Update Blog by ID"""

    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]
    parser_classes = (MultiPartParser, FormParser)

    def put(self, request, blog_id):
        try:
            try:
                blog = Blog.objects.get(id=blog_id, isDeleted=False)
            except Blog.DoesNotExist:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Blog not found."
                }, status=status.HTTP_200_OK)

            serializer = BlogSerializer(
                blog,
                data=request.data,
                context={"request": request},
                partial=True
            )

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Blog updated successfully.",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            # CUSTOM TITLE DUPLICATE ERROR (ONLY CHANGE)
            if "title" in serializer.errors:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "Validation failed;blog with this title already exists"
                }, status=status.HTTP_200_OK)

            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Validation failed.",
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while updating blog.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    tags=["Blog (Admin)"],
    summary="Delete blog(s) (Admin)",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "ids": {
                    "type": "array",
                    "items": {"type": "integer"},
                }
            },
        }
    },
    responses={
        200: OpenApiResponse(description="Blog(s) deleted successfully"),
        400: OpenApiResponse(description="Invalid request"),
        404: OpenApiResponse(description="Blog not found"),
        500: OpenApiResponse(description="Server error"),
    },
)
class BlogDeleteAPIView(APIView):
    """
    Admin: Delete Blog
    - Single delete → /blogs/delete/<id>/
    - Multiple delete → { "ids": [1,2,3] }
    """

    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]
    
    def delete(self, request, blog_id=None):
        try:
            # SINGLE DELETE
            if blog_id:
                try:
                    blog = Blog.objects.get(id=blog_id, isDeleted=False)
                except Blog.DoesNotExist:
                    return Response({
                        "status": False,
                        "statusCode": 404,
                        "message": "Blog not found."
                    }, status=status.HTTP_404_NOT_FOUND)

                blog.isDeleted = True
                blog.save()

                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Blog deleted successfully."
                }, status=status.HTTP_200_OK)

            # MULTIPLE DELETE
            blog_ids = request.data.get("ids")
            if not blog_ids or not isinstance(blog_ids, list):
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Blog IDs list is required."
                }, status=status.HTTP_400_BAD_REQUEST)

            blogs = Blog.objects.filter(id__in=blog_ids, isDeleted=False)
            if not blogs.exists():
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "No blogs found to delete."
                }, status=status.HTTP_404_NOT_FOUND)

            blogs.update(isDeleted=True)

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Blogs deleted successfully."
            }, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while deleting blog(s).",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
