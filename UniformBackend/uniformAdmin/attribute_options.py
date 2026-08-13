"""
Admin CRUD for the choices a shopper sees per simulation attribute.

One screen covers every attribute — collar styles, cuffs, caps, the size run — because
AttributeOption is one table keyed by `attribute`. Adding an attribute needs a row, not a
migration and a new admin page.

GET is public so the storefront can read the options; writes are admin-only, matching how
the rest of Product & Specification is protected.
"""

import traceback

from django.db.models import Q
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, OpenApiTypes, extend_schema
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from uniformAdmin.models import AttributeOption
from uniformAdmin.serializers import AttributeOptionSerializer
# IsAdministrator lives in fabric.py — the whole Product & Specification area shares it.
from uniformAdmin.fabric import IsAdministrator


class OptionPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 200


def option_queryset(request):
    """Live options, narrowed by the query parameters the admin list and storefront use."""
    qs = AttributeOption.objects.filter(isDeleted=False)

    attribute = (request.query_params.get("attribute") or "").strip()
    if attribute:
        qs = qs.filter(attribute=attribute)

    search = (request.query_params.get("search") or "").strip()
    if search:
        qs = qs.filter(name__icontains=search)

    if request.query_params.get("active_only") in ("1", "true", "True"):
        qs = qs.filter(isActive=True)

    category_id = request.query_params.get("category_id")
    if category_id:
        # Options with no category are the global set and apply everywhere, the same rule
        # fabrics follow.
        qs = qs.filter(Q(category_id=category_id) | Q(category__isnull=True))

    return qs.select_related("category")


class AttributeOptionListAPIView(APIView):
    """Options for one attribute, or all of them."""

    def get_authenticators(self):
        return []

    def get_permissions(self):
        return []

    @extend_schema(
        tags=["Attribute Options"],
        summary="List attribute options",
        parameters=[
            OpenApiParameter("attribute", OpenApiTypes.STR, description="collar, cuff, size, ..."),
            OpenApiParameter("category_id", OpenApiTypes.INT, description="Category, plus global options"),
            OpenApiParameter("active_only", OpenApiTypes.BOOL),
            OpenApiParameter("search", OpenApiTypes.STR),
        ],
        responses={200: OpenApiResponse(description="Options fetched")},
    )
    def get(self, request):
        try:
            options = option_queryset(request)

            paginator = OptionPagination()
            page = paginator.paginate_queryset(options, request)
            serializer = AttributeOptionSerializer(
                page, many=True, context={"request": request}
            )

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Attribute options fetched successfully",
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "attributes": [
                    {"value": v, "label": l} for v, l in AttributeOption.ATTRIBUTE_CHOICES
                ],
                "data": serializer.data,
                "pagination": {
                    "page": paginator.page.number,
                    "page_size": paginator.get_page_size(request),
                    "total_pages": paginator.page.paginator.num_pages,
                    "total_items": paginator.page.paginator.count,
                },
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to fetch attribute options",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AttributeOptionCreateAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    @extend_schema(
        tags=["Attribute Options"],
        summary="Create an attribute option",
        request=AttributeOptionSerializer,
        responses={
            201: OpenApiResponse(description="Option created"),
            400: OpenApiResponse(description="Validation error"),
        },
    )
    def post(self, request):
        try:
            serializer = AttributeOptionSerializer(
                data=request.data, context={"request": request}
            )
            if not serializer.is_valid():
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation failed",
                    "error": serializer.errors,
                }, status=status.HTTP_400_BAD_REQUEST)

            serializer.save()
            return Response({
                "status": True,
                "statusCode": 201,
                "message": "Option created successfully",
                "data": serializer.data,
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to create the option",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AttributeOptionUpdateAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    @extend_schema(
        tags=["Attribute Options"],
        summary="Update an attribute option",
        request=AttributeOptionSerializer,
        responses={
            200: OpenApiResponse(description="Option updated"),
            404: OpenApiResponse(description="Option not found"),
        },
    )
    def put(self, request, pk):
        try:
            option = AttributeOption.objects.filter(id=pk, isDeleted=False).first()
            if not option:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "Option not found",
                }, status=status.HTTP_404_NOT_FOUND)

            serializer = AttributeOptionSerializer(
                option, data=request.data, partial=True, context={"request": request}
            )
            if not serializer.is_valid():
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Validation failed",
                    "error": serializer.errors,
                }, status=status.HTTP_400_BAD_REQUEST)

            serializer.save()
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Option updated successfully",
                "data": serializer.data,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to update the option",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AttributeOptionDeleteAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    @extend_schema(
        tags=["Attribute Options"],
        summary="Delete an attribute option",
        responses={
            200: OpenApiResponse(description="Option deleted"),
            404: OpenApiResponse(description="Option not found"),
        },
    )
    def delete(self, request, pk):
        try:
            option = AttributeOption.objects.filter(id=pk, isDeleted=False).first()
            if not option:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "Option not found",
                }, status=status.HTTP_404_NOT_FOUND)

            # Soft delete, like the rest of this app, so a design that recorded this
            # option keeps resolving instead of pointing at a missing row.
            option.isDeleted = True
            option.save(update_fields=["isDeleted", "updated_at"])

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Option deleted successfully",
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to delete the option",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
