from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated ,BasePermission,AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .serializers import *
from .models import *
from .fabric import IsAdministrator, CustomPagination
from drf_spectacular.utils import extend_schema,OpenApiExample,OpenApiResponse,OpenApiParameter,OpenApiTypes



@extend_schema(
    tags=["Colors"],
    summary="Create a new color",
    request=ColorsSerializer,
    responses={
        200: OpenApiResponse(description="Color created successfully"),
        400: OpenApiResponse(description="Validation error"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
class ColorsCreateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            serializer = ColorsSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "statusCode": 200,
                    "status": True,
                    "message": "Color created successfully",
                    "data": serializer.data
                })

            return Response({
                "statusCode": 400,
                "status": False,
                "message": serializer.errors
            })

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            })


@extend_schema(
    tags=["Colors"],
    summary="Get list of colors",
    responses={
        200: OpenApiResponse(description="Colors fetched successfully"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
class ColorsListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            search = request.query_params.get("search", "").strip()
            colors = Colors.objects.filter(isDeleted=False)

            if search:
                colors = colors.filter(
                    Q(colorName__icontains=search) |
                    Q(colorCode__icontains=search)
                )

            colors = colors.order_by("-id")

            paginator = CustomPagination()
            page = paginator.paginate_queryset(colors, request)
            serializer = ColorsSerializer(page, many=True)

            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Colors fetched successfully",
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
            })



@extend_schema(
    tags=["Colors"],
    summary="Get color details by ID",
    responses={
        200: OpenApiResponse(description="Color fetched successfully"),
        404: OpenApiResponse(description="Color not found"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
class ColorsDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, id):
        try:
            color = Colors.objects.filter(id=id, isDeleted=False).first()

            if not color:
                return Response({
                    "statusCode": 404,
                    "status": False,
                    "message": "Color not found"
                })

            serializer = ColorsSerializer(color)

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Color fetched successfully",
                "data": serializer.data
            })

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            })


@extend_schema(
    tags=["Colors"],
    summary="Update color by ID",
    request=ColorsSerializer,
    responses={
        200: OpenApiResponse(description="Color updated successfully"),
        400: OpenApiResponse(description="Validation error"),
        404: OpenApiResponse(description="Color not found"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
class ColorsUpdateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def put(self, request, id):
        try:
            color = Colors.objects.filter(id=id, isDeleted=False).first()

            if not color:
                return Response({
                    "statusCode": 404,
                    "status": False,
                    "message": "Color not found"
                })

            serializer = ColorsSerializer(color, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()

                return Response({
                    "statusCode": 200,
                    "status": True,
                    "message": "Color updated successfully",
                    "data": serializer.data
                })

            return Response({
                "statusCode": 400,
                "status": False,
                "message": serializer.errors
            })

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            })



@extend_schema(
    tags=["Colors"],
    summary="Delete color by ID",
    responses={
        200: OpenApiResponse(description="Color deleted successfully"),
        404: OpenApiResponse(description="Color not found"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
class ColorsDeleteView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def delete(self, request, id):
        try:
            color = Colors.objects.filter(id=id, isDeleted=False).first()
            if not color:
                return Response({
                    "statusCode": 404,
                    "status": False,
                    "message": "Color not found"
                })

            color.isDeleted = True
            color.save()

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Color deleted successfully"
            })

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal Server Error: {str(e)}"
            })


