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



class TemplateCreateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    @extend_schema(
        tags=["Template"],
        summary="Create Template",
        description="Create a new template (Admin only)",
        request=TemplateSerializer,
        responses={
            200: OpenApiResponse(description="Template created successfully"),
            400: OpenApiResponse(description="Validation failed"),
            401: OpenApiResponse(description="Unauthorized"),
            500: OpenApiResponse(description="Internal server error"),
        },
    )
    def post(self, request):
        try:
            serializer = TemplateSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save()

                return Response({
                    "statusCode": 200,
                    "status": True,
                    "message": "Template created successfully",
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
                "message": f"Internal Server Error: {str(e)}"
            }, status=500)


class TemplateListView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Template"],
        summary="List Templates",
        description="Get paginated list of templates with search and filter support",
        parameters=[
            OpenApiParameter(
                name="search",
                description="Search by template name, part name, or part's category name",
                required=False,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="part_id",
                description="Filter by Part ID",
                required=False,
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="category_id",
                description="Filter by Part's Category ID",
                required=False,
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="subcategory_id",
                description="Filter by Part's Subcategory ID",
                required=False,
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="page",
                description="Page number",
                required=False,
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="page_size",
                description="Items per page",
                required=False,
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
        ],
        responses={
            200: OpenApiResponse(description="Templates fetched successfully"),
            500: OpenApiResponse(description="Internal server error"),
        },
        auth=[],  # public
    )
    def get(self, request):
        try:
            search = request.query_params.get("search", "").strip()
            part_id = request.query_params.get("part_id") or request.query_params.get("part")
            category_id = request.query_params.get("category_id") or request.query_params.get("category")
            subcategory_id = request.query_params.get("subcategory_id") or request.query_params.get("subcategory")

            templates = Template.objects.filter(isDeleted=False)

            if search:
                templates = templates.filter(
                    Q(templateName__icontains=search) |
                    Q(part__partName__icontains=search) |
                    Q(part__category__categoryName__icontains=search)
                )

            if part_id:
                templates = templates.filter(part_id=part_id)
            if category_id:
                templates = templates.filter(part__category_id=category_id)
            if subcategory_id:
                templates = templates.filter(part__subcategory_id=subcategory_id)

            templates = templates.order_by("-id")

            paginator = CustomPagination()
            page = paginator.paginate_queryset(templates, request)
            serializer = TemplateSerializer(page, many=True, context={'request': request})

            return Response({
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Templates fetched successfully",
                "data": serializer.data,
                "pagination": {
                    "page": paginator.page.number,
                    "page_size": paginator.get_page_size(request),
                    "total_pages": paginator.page.paginator.num_pages,
                    "total_items": paginator.page.paginator.count
                }
            })

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal Server Error: {str(e)}"
            })


class TemplateDetailView(APIView):
    permission_classes = [AllowAny]


    @extend_schema(
        tags=["Template"],
        summary="Get Template Detail",
        description="Retrieve template details by ID",
        responses={
            200: OpenApiResponse(description="Template fetched successfully"),
            404: OpenApiResponse(description="Template not found"),
            500: OpenApiResponse(description="Internal server error"),
        },
        auth=[],  # public
    )
    def get(self, request, id):
        try:
            template = Template.objects.filter(id=id, isDeleted=False).first()

            if not template:
                return Response({
                    "statusCode": 404,
                    "status": False,
                    "message": "Template not found"
                })

            serializer = TemplateSerializer(template)

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Template fetched successfully",
                "data": serializer.data
            })

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            })


class TemplateUpdateView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    @extend_schema(
        tags=["Template"],
        summary="Update Template",
        description="Update an existing template (Admin only)",
        request=TemplateSerializer,
        responses={
            200: OpenApiResponse(description="Template updated successfully"),
            400: OpenApiResponse(description="Validation failed"),
            404: OpenApiResponse(description="Template not found"),
            401: OpenApiResponse(description="Unauthorized"),
            500: OpenApiResponse(description="Internal server error"),
        },
    )
    def put(self, request, id):
        try:
            template = Template.objects.filter(pk=id, isDeleted=False).first()
            if not template:
                return Response({
                    "statusCode": 404,
                    "status": False,
                    "message": "Template not found"
                })

            serializer = TemplateSerializer(template, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()

                return Response({
                    "statusCode": 200,
                    "status": True,
                    "message": "Template updated successfully",
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
                "message": f"Internal Server Error: {str(e)}"
            })


class TemplateDeleteView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    @extend_schema(
        tags=["Template"],
        summary="Delete Template",
        description="Soft delete a template (Admin only)",
        responses={
            200: OpenApiResponse(description="Template deleted successfully"),
            404: OpenApiResponse(description="Template not found"),
            401: OpenApiResponse(description="Unauthorized"),
            500: OpenApiResponse(description="Internal server error"),
        },
    )
    def delete(self, request, id):
        try:
            template = Template.objects.filter(pk=id, isDeleted=False).first()
            if not template:
                return Response({
                    "statusCode": 404,
                    "status": False,
                    "message": "Template not found"
                })

            template.isDeleted = True
            template.save()

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Template deleted successfully"
            })

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal Server Error: {str(e)}"
            })
