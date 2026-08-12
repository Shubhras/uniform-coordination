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
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from uniformAdmin.auth import IsAdminUserJWT
from uniformAdmin.models import Category, Parts, Product, SimulationStructure

# Sensible starting point per uniform industry, used until an admin saves their own.
# Attributes are free text, so an admin can add or remove rows per category.
DEFAULT_STRUCTURES = {
    "Food Service & Dining": [
        {"attribute": "Fabric", "enabled": True, "order": "1"},
        {"attribute": "Style", "enabled": True, "order": "2"},
        {"attribute": "Color", "enabled": False, "order": "3"},
        {"attribute": "Size", "enabled": False, "order": "4"},
        {"attribute": "Apron Type", "enabled": False, "order": "5"},
    ],
    "Medical & Nursing Care": [
        {"attribute": "Fabric", "enabled": True, "order": "1"},
        {"attribute": "Collar", "enabled": True, "order": "2"},
        {"attribute": "Color", "enabled": False, "order": "3"},
        {"attribute": "Sleeve", "enabled": False, "order": "4"},
        {"attribute": "Pocket", "enabled": False, "order": "5"},
    ],
    "Food Production & Sanitation": [
        {"attribute": "Fabric", "enabled": True, "order": "1"},
        {"attribute": "Closure", "enabled": True, "order": "2"},
        {"attribute": "Color", "enabled": False, "order": "3"},
        {"attribute": "Cap Type", "enabled": False, "order": "4"},
        {"attribute": "Inner Mesh", "enabled": False, "order": "5"},
    ],
    "Retail & Customer Service": [
        {"attribute": "Fabric", "enabled": True, "order": "1"},
        {"attribute": "Style", "enabled": True, "order": "2"},
        {"attribute": "Color", "enabled": False, "order": "3"},
        {"attribute": "Collar", "enabled": False, "order": "4"},
        {"attribute": "Cuff", "enabled": False, "order": "5"},
    ],
    "Office & Back-End Operations": [
        {"attribute": "Fabric", "enabled": True, "order": "1"},
        {"attribute": "Fit", "enabled": True, "order": "2"},
        {"attribute": "Color", "enabled": False, "order": "3"},
        {"attribute": "Waist", "enabled": False, "order": "4"},
        {"attribute": "Hem", "enabled": False, "order": "5"},
    ],
}

# Fallback for any category with no entry above.
GENERIC_STRUCTURE = [
    {"attribute": "Fabric", "enabled": True, "order": "1"},
    {"attribute": "Style", "enabled": False, "order": "2"},
    {"attribute": "Color", "enabled": False, "order": "3"},
]

# KF manages uniform parts; 'table' parts belong to KIREIZ SPACE.
UNIFORM_PART_TYPE = "uniform"


def category_attributes(category):
    """
    A category's simulation attributes, in the order the admin set.

    Falls back to the per-industry default when the admin has not saved a structure
    yet, so the customer simulation is never left with nothing to offer.

    Shared with the customer-facing endpoints (simulation_public) so both sides read
    the same source — the admin screen and the shopper cannot drift apart.
    """
    saved = getattr(category, "simulation_structure", None)
    attributes = (saved.structure_data or {}).get("attributes") if saved else None

    # `is None`, not a falsy check: an admin who deleted every attribute and saved has
    # stored [], and that is a decision to keep. Treating [] as "nothing saved" brought
    # the seeded defaults straight back, so deletions looked like they never happened.
    if attributes is None:
        attributes = DEFAULT_STRUCTURES.get(category.categoryName, GENERIC_STRUCTURE)
    return attributes


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


class SimulationStructureAPIView(APIView):
    """
    Which attributes the customer simulation shows per category, and their order.

    GET returns every category with its saved structure, falling back to a default
    so a category is never presented as empty. POST saves one category's attributes.

    Read is public: the customer simulation needs the same structure to know which
    filters/accordions to render. Writing requires an admin token.
    """

    permission_classes = [AllowAny]

    def get_authenticators(self):
        # Only the write path needs a token; keep GET open for the customer site.
        if self.request and self.request.method == "POST":
            return [IsAdminUserJWT()]
        return []

    def get_permissions(self):
        if self.request and self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]

    @extend_schema(
        tags=["Simulation Assets"],
        summary="Get simulation structure for every category",
        responses={200: OpenApiResponse(description="Structures fetched")},
    )
    def get(self, request):
        try:
            # type='uniform' matters: the Category table also holds KIREIZ SPACE
            # rows (Classy Corporate, Olive Chic, Warm Elegance), which must not
            # appear in the uniform admin.
            categories = Category.objects.filter(
                isDeleted=False, type=UNIFORM_PART_TYPE
            ).order_by("order", "id")

            data = {}
            for category in categories:
                data[category.categoryName] = category_attributes(category)

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Simulation structures fetched successfully",
                "data": data,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to fetch simulation structures",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        tags=["Simulation Assets"],
        summary="Save one category's simulation structure",
        description=(
            'Body: {"categoryName": "Medical & Nursing Care", "attributes": '
            '[{"attribute": "Fabric", "enabled": true, "order": "1"}]}'
        ),
        responses={
            200: OpenApiResponse(description="Structure saved"),
            400: OpenApiResponse(description="Validation error"),
            404: OpenApiResponse(description="Category not found"),
        },
    )
    def post(self, request):
        try:
            category_name = (request.data.get("categoryName") or "").strip()
            attributes = request.data.get("attributes")

            if not category_name or attributes is None:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "categoryName and attributes are required",
                }, status=status.HTTP_400_BAD_REQUEST)

            if not isinstance(attributes, list):
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "attributes must be a list",
                }, status=status.HTTP_400_BAD_REQUEST)

            cleaned = []
            for row in attributes:
                if not isinstance(row, dict):
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": "each attribute must be an object",
                    }, status=status.HTTP_400_BAD_REQUEST)
                name = (row.get("attribute") or "").strip()
                if not name:
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": "each attribute needs a name",
                    }, status=status.HTTP_400_BAD_REQUEST)
                cleaned.append({
                    "attribute": name,
                    "enabled": bool(row.get("enabled")),
                    # Kept as a string to match the KIREIZ SPACE payload shape.
                    "order": str(row.get("order") or len(cleaned) + 1),
                })

            # Unlike the SPACE implementation this does not create a missing
            # category — silently inventing catalogue records from a settings save
            # is how duplicates appear.
            category = Category.objects.filter(
                categoryName=category_name, isDeleted=False, type=UNIFORM_PART_TYPE
            ).first()
            if not category:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": f"Category '{category_name}' not found",
                }, status=status.HTTP_404_NOT_FOUND)

            structure, _ = SimulationStructure.objects.get_or_create(category=category)
            structure.structure_data = {"attributes": cleaned}
            structure.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": f"Simulation structure for {category_name} saved successfully",
                "data": cleaned,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to save simulation structure",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProductSimulationVisibilityAPIView(APIView):
    """
    Admin toggle for which products appear in the customer simulation.

    The customer endpoints in simulation_public.py filter on the same flag, so
    turning a product off here removes it from the customer side immediately —
    that is the whole point of keeping one source for it.
    """

    authentication_classes = [IsAdminUserJWT]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Simulation Assets"],
        summary="List products with their simulation visibility",
        parameters=[
            OpenApiParameter("search", OpenApiTypes.STR, OpenApiParameter.QUERY),
            OpenApiParameter(
                "category_id", OpenApiTypes.INT, OpenApiParameter.QUERY,
                description="Restrict to one category",
            ),
            OpenApiParameter("page", OpenApiTypes.INT, OpenApiParameter.QUERY),
            OpenApiParameter("page_size", OpenApiTypes.INT, OpenApiParameter.QUERY),
        ],
        responses={200: OpenApiResponse(description="Products fetched")},
    )
    def get(self, request):
        try:
            products = (
                Product.objects.filter(isDeleted=False, productType=UNIFORM_PART_TYPE)
                .select_related("category", "subcategory")
                .prefetch_related("parts", "parts__fabric")
                .order_by("productName", "id")
            )

            search = request.GET.get("search")
            if search:
                products = products.filter(
                    Q(productName__icontains=search)
                    | Q(category__categoryName__icontains=search)
                )

            category_id = request.GET.get("category_id")
            if category_id:
                products = products.filter(category_id=category_id)

            total = products.count()

            try:
                page = max(1, int(request.GET.get("page", 1)))
                page_size = min(100, max(1, int(request.GET.get("page_size", 10))))
            except (TypeError, ValueError):
                page, page_size = 1, 10

            start = (page - 1) * page_size
            page_products = products[start:start + page_size]

            rows = []
            for p in page_products:
                parts = [part for part in p.parts.all() if not part.isDeleted]
                usable = [part for part in parts if part.partImage]

                # Product has no fabric column of its own; the fabrics come from
                # the parts it is built from, de-duplicated for display.
                fabrics = sorted({
                    part.fabric.fabricName
                    for part in parts
                    if part.fabric_id and part.fabric
                })

                rows.append({
                    "id": p.id,
                    "name": p.productName,
                    "category": p.category.categoryName if p.category_id else None,
                    "category_id": p.category_id,
                    "subcategory": p.subcategory.name if p.subcategory_id else None,
                    "fabrics": fabrics,
                    "show_in_simulation": p.show_in_simulation,
                    "is_active": p.isActive,
                    "layer_count": len(usable),
                    # A product with no usable layers cannot render, so the UI can
                    # warn instead of letting an admin enable an empty simulation.
                    "simulatable": len(usable) > 0,
                })

            # Filter options are derived from the categories actually used by uniform
            # products — not from Category.type. Some uniform products are assigned to
            # a category typed 'table' (a data issue), and filtering on type would
            # list a category in a row that the dropdown could not then filter by.
            category_rows = (
                Category.objects.filter(
                    isDeleted=False,
                    product_category__isDeleted=False,
                    product_category__productType=UNIFORM_PART_TYPE,
                )
                .values("id", "categoryName")
                .distinct()
                .order_by("categoryName")
            )

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Products fetched successfully",
                "count": total,
                "page": page,
                "page_size": page_size,
                # Counted across the whole filtered set, not just this page.
                "enabled_count": products.filter(show_in_simulation=True).count(),
                "categories": [
                    {"id": c["id"], "name": c["categoryName"]} for c in category_rows
                ],
                "data": rows,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to fetch products",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        tags=["Simulation Assets"],
        summary="Toggle a product's simulation visibility",
        description="Body: {\"product_id\": 12, \"show_in_simulation\": true}",
        responses={
            200: OpenApiResponse(description="Visibility updated"),
            400: OpenApiResponse(description="Validation error"),
            404: OpenApiResponse(description="Product not found"),
        },
    )
    def post(self, request):
        product_id = request.data.get("product_id")
        if product_id is None:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "product_id is required",
            }, status=status.HTTP_400_BAD_REQUEST)

        if "show_in_simulation" not in request.data:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "show_in_simulation is required",
            }, status=status.HTTP_400_BAD_REQUEST)

        product = Product.objects.filter(
            pk=product_id, isDeleted=False, productType=UNIFORM_PART_TYPE
        ).first()
        if not product:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Product not found",
            }, status=status.HTTP_404_NOT_FOUND)

        product.show_in_simulation = bool(request.data.get("show_in_simulation"))
        product.save(update_fields=["show_in_simulation", "updated_at"])

        return Response({
            "status": True,
            "statusCode": 200,
            "message": (
                f"'{product.productName}' is now "
                f"{'visible in' if product.show_in_simulation else 'hidden from'} the simulation"
            ),
            "data": {
                "id": product.id,
                "name": product.productName,
                "show_in_simulation": product.show_in_simulation,
            },
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
