"""
Simulation Assets for the KIREIZ FORM admin.

WHY THIS SCOPE
--------------
Client feedback asked for a "Simulation Assets" menu on KF to match KS. KS's own
screen is an empty placeholder, so there was nothing to port — and the wider asset
question is still open (see doc/md/07-review-findings.md finding #2: is a colour
change a pre-rendered image swap or canvas tinting over a mask? who supplies the
artwork, at what registration spec and DPI?).

Rather than guess, this manages only what **every** layered-canvas approach needs
either way:

  * which part images exist and are usable as layers
  * their stacking order (Parts.zIndex)
  * their registration offset on the canvas (Parts.offsetX / offsetY)

That is real, useful configuration today, and none of it has to be redone once the
image-swap-vs-tinting decision is made. Colour/material mapping is deliberately
left out until that decision lands.

Layers are Parts rows — the images already live there (Parts.partImage), so this is
a view onto existing data, not a new asset store.
"""

import traceback

from django.db import transaction
from django.db.models import Q
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    OpenApiTypes,
    extend_schema,
)
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from uniformAdmin.auth import IsAdminUserJWT
from uniformAdmin.models import Parts, Product

# KF manages uniform parts; 'table' parts belong to KIREIZ SPACE.
UNIFORM_PART_TYPE = "uniform"


def serialize_layer(part, request=None):
    image_url = None
    if part.partImage:
        try:
            image_url = (
                request.build_absolute_uri(part.partImage.url)
                if request
                else part.partImage.url
            )
        except ValueError:
            # FileField set but the underlying file is missing.
            image_url = None

    return {
        "id": part.id,
        "name": part.partName,
        "image": image_url,
        "has_image": bool(image_url),
        "z_index": part.zIndex,
        "offset_x": part.offsetX,
        "offset_y": part.offsetY,
        "fabric": part.fabric.fabricName if part.fabric_id else None,
        "category": part.category.categoryName if part.category_id else None,
        "subcategory": part.subcategory.name if part.subcategory_id else None,
        "is_active": part.isActive,
        "used_in_templates": part.usageTemmpCount,
    }


def layer_queryset():
    return (
        Parts.objects.filter(isDeleted=False, partType=UNIFORM_PART_TYPE)
        .select_related("fabric", "category", "subcategory")
        .order_by("zIndex", "id")
    )


class SimulationAssetListAPIView(APIView):
    """Part images available as simulation layers, in stacking order."""

    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Simulation Assets"],
        summary="List simulation layers (part images)",
        parameters=[
            OpenApiParameter("search", OpenApiTypes.STR, OpenApiParameter.QUERY),
            OpenApiParameter(
                "only_with_image",
                OpenApiTypes.BOOL,
                OpenApiParameter.QUERY,
                description="Hide parts that have no image uploaded yet.",
            ),
        ],
        responses={200: OpenApiResponse(description="Layers fetched")},
    )
    def get(self, request):
        try:
            queryset = layer_queryset()

            search = request.GET.get("search")
            if search:
                queryset = queryset.filter(
                    Q(partName__icontains=search)
                    | Q(fabric__fabricName__icontains=search)
                )

            if str(request.GET.get("only_with_image", "")).lower() in ("1", "true", "yes"):
                queryset = queryset.exclude(Q(partImage="") | Q(partImage__isnull=True))

            layers = [serialize_layer(p, request) for p in queryset]
            missing = [l for l in layers if not l["has_image"]]

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Simulation layers fetched successfully",
                "count": len(layers),
                "data": {
                    "layers": layers,
                    # Surfaced so the UI can warn: a layer with no artwork will
                    # render as a gap in the simulation.
                    "missing_image_count": len(missing),
                },
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to fetch simulation layers",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SimulationAssetUpdateAPIView(APIView):
    """Edit one layer's registration (z-index and offsets)."""

    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Simulation Assets"],
        summary="Update a layer's z-index / offsets",
        responses={
            200: OpenApiResponse(description="Layer updated"),
            400: OpenApiResponse(description="Validation error"),
            404: OpenApiResponse(description="Layer not found"),
        },
    )
    def post(self, request, pk):
        part = layer_queryset().filter(pk=pk).first()
        if not part:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Layer not found",
            }, status=status.HTTP_404_NOT_FOUND)

        for field, attr in (
            ("z_index", "zIndex"),
            ("offset_x", "offsetX"),
            ("offset_y", "offsetY"),
        ):
            if field not in request.data:
                continue
            try:
                setattr(part, attr, int(request.data.get(field)))
            except (TypeError, ValueError):
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": f"{field} must be a whole number",
                }, status=status.HTTP_400_BAD_REQUEST)

        part.save(update_fields=["zIndex", "offsetX", "offsetY", "updated_at"])

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Layer updated successfully",
            "data": serialize_layer(part, request),
        }, status=status.HTTP_200_OK)


class SimulationAssetReorderAPIView(APIView):
    """Persist drag-and-drop stacking order as z-index values."""

    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Simulation Assets"],
        summary="Reorder simulation layers",
        description="Body: {\"order\": [7, 19, 4]} — bottom-most layer first.",
        responses={
            200: OpenApiResponse(description="Order saved"),
            400: OpenApiResponse(description="Validation error"),
        },
    )
    def post(self, request):
        try:
            order = request.data.get("order")
            if not isinstance(order, list) or not order:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "order must be a non-empty list of layer ids",
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                ids = [int(i) for i in order]
            except (TypeError, ValueError):
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "order must contain integer ids",
                }, status=status.HTTP_400_BAD_REQUEST)

            existing = set(
                layer_queryset().filter(id__in=ids).values_list("id", flat=True)
            )
            unknown = [i for i in ids if i not in existing]
            if unknown:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": f"Unknown layer ids: {unknown}",
                }, status=status.HTTP_400_BAD_REQUEST)

            # Client sends the full ordered list, so index is the new z-index.
            # One transaction so a partial failure can't leave a broken stack.
            with transaction.atomic():
                for position, part_id in enumerate(ids):
                    Parts.objects.filter(id=part_id).update(zIndex=position)

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Layer order saved successfully",
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to save layer order",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
