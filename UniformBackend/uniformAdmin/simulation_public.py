"""
Customer-facing read endpoints for the uniform simulation (KIREIZ FORM).

Everything the customer simulation needs is configured by the admin:
  * which products may be simulated  -> Product.show_in_simulation
  * which part images make up a look  -> Product.parts
  * how those parts stack and align   -> Parts.zIndex / offsetX / offsetY
    (managed under Admin -> Simulation Assets)

Without these endpoints the admin configuration had no route to the customer site,
so the two sides could disagree. These are the single source the customer reads —
mirroring how KIREIZ SPACE exposes `simulation/options/` and `simulation/categories/`.

Read-only and public (AllowAny): a shopper is not signed in while browsing. Only
active, non-deleted, admin-enabled records are ever returned, so nothing hidden by
an admin can leak through.
"""

import re
import traceback

from django.db.models import Count, Q
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    OpenApiTypes,
    extend_schema,
)
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from uniformAdmin.models import AttributeOption, Category, Colors, Fabric, Parts, Product
from uniformAdmin.simulation_assets import category_attributes

UNIFORM_TYPE = "uniform"

HEX_COLOR = re.compile(r"#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\Z")


def _hex_or_none(value):
    """A CSS-paintable hex code, or None when the field holds something else."""
    v = (value or "").strip()
    return v if HEX_COLOR.match(v) else None


def _order_key(value):
    """
    Sort key for an attribute's `order`, which is admin-entered free text stored as a
    string. Non-numeric values sort last instead of raising.
    """
    try:
        return (0, int(str(value).strip()))
    except (TypeError, ValueError):
        return (1, 0)


def _absolute(request, file_field):
    """Absolute media URL, tolerant of a FileField whose file is missing."""
    if not file_field:
        return None
    try:
        url = file_field.url
    except ValueError:
        return None
    return request.build_absolute_uri(url) if request else url


def simulatable_products():
    """Products the admin has enabled for simulation."""
    return (
        Product.objects.filter(
            isActive=True,
            isDeleted=False,
            show_in_simulation=True,
            productType=UNIFORM_TYPE,
        )
        .select_related("category", "subcategory")
        .prefetch_related("parts")
    )


def serialize_layer(part, request=None):
    """
    One canvas layer. z_index and offsets come straight from what the admin set
    under Simulation Assets, so the customer render matches the admin preview.
    """
    return {
        "id": part.id,
        "name": part.partName,
        "image": _absolute(request, part.partImage),
        "z_index": part.zIndex,
        "offset_x": part.offsetX,
        "offset_y": part.offsetY,
        "fabric_id": part.fabric_id,
        "fabric": part.fabric.fabricName if part.fabric_id else None,
    }


class SimulationCategoryListAPIView(APIView):
    """Industries/categories that have at least one simulatable product."""

    # Empty on purpose. Without this, DRF applies the project default,
    # CustomUserJWTAuthentication, which raises AuthenticationFailed on any token it
    # cannot resolve to a customer -- so an admin Bearer token turns these open
    # endpoints into a 403. Authentication runs before permissions, so AllowAny
    # alone does not save it. Nothing here reads request.user.
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Simulation (Public)"],
        summary="Categories available in the simulation",
        responses={200: OpenApiResponse(description="Categories fetched")},
    )
    def get(self, request):
        try:
            rows = (
                # type='uniform' — the Category table also holds KIREIZ SPACE rows.
                Category.objects.filter(isDeleted=False, type=UNIFORM_TYPE)
                .annotate(
                    product_count=Count(
                        "product_category",
                        filter=Q(
                            product_category__isActive=True,
                            product_category__isDeleted=False,
                            product_category__show_in_simulation=True,
                            product_category__productType=UNIFORM_TYPE,
                        ),
                    )
                )
                .filter(product_count__gt=0)
                .order_by("order", "id")
            )

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Simulation categories fetched successfully",
                "count": rows.count(),
                "data": [
                    {
                        "id": c.id,
                        "name": c.categoryName,
                        "slug": c.slug,
                        "image": _absolute(request, c.categoryImage),
                        "product_count": c.product_count,
                    }
                    for c in rows
                ],
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to fetch simulation categories",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SimulationOptionsAPIView(APIView):
    """
    Products available to simulate, plus the colour and fabric choices that apply.

    Optionally filtered by category so the customer only sees what belongs to the
    industry they picked.
    """

    # Empty on purpose. Without this, DRF applies the project default,
    # CustomUserJWTAuthentication, which raises AuthenticationFailed on any token it
    # cannot resolve to a customer -- so an admin Bearer token turns these open
    # endpoints into a 403. Authentication runs before permissions, so AllowAny
    # alone does not save it. Nothing here reads request.user.
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Simulation (Public)"],
        summary="Simulation options (products, colours, fabrics)",
        parameters=[
            OpenApiParameter(
                "category_id", OpenApiTypes.INT, OpenApiParameter.QUERY,
                description="Restrict to one category",
            ),
            OpenApiParameter(
                "category_name", OpenApiTypes.STR, OpenApiParameter.QUERY,
                description="Alternative to category_id",
            ),
        ],
        responses={200: OpenApiResponse(description="Options fetched")},
    )
    def get(self, request):
        try:
            products = simulatable_products()

            category_id = request.query_params.get("category_id")
            category_name = (request.query_params.get("category_name") or "").strip()

            # Resolve the category itself, not just filter by it: the attribute list
            # and the fabric palette both hang off the category.
            category = None
            if category_id:
                category = Category.objects.filter(
                    id=category_id, isDeleted=False, type=UNIFORM_TYPE
                ).first()
            elif category_name:
                category = Category.objects.filter(
                    categoryName__iexact=category_name,
                    isDeleted=False,
                    type=UNIFORM_TYPE,
                ).first()

            if category:
                products = products.filter(category_id=category.id)
            elif category_id or category_name:
                # Asked for a category that does not exist as a uniform category —
                # answer with nothing rather than silently ignoring the filter.
                products = products.none()

            product_rows = []
            fabric_ids = set()
            for p in products:
                # Only parts with artwork can be drawn; a missing image would leave
                # a hole in the composite, so they are excluded here rather than
                # silently failing on the canvas.
                layers = [
                    serialize_layer(part, request)
                    for part in sorted(p.parts.all(), key=lambda x: (x.zIndex, x.id))
                    if not part.isDeleted and part.partImage
                ]
                fabric_ids.update(l["fabric_id"] for l in layers if l["fabric_id"])

                product_rows.append({
                    "id": p.id,
                    "name": p.productName,
                    "category_id": p.category_id,
                    "category": p.category.categoryName if p.category_id else None,
                    "subcategory": p.subcategory.name if p.subcategory_id else None,
                    # Catalogue image and garment half — the customer product picker needs
                    # both, and it has nothing else to read them from.
                    "image": _absolute(request, p.ProductImage),
                    "type": p.type,
                    "layer_count": len(layers),
                    "layers": layers,
                })

            # The fabric palette a shopper may choose from — deliberately NOT limited to
            # the fabrics already assigned to this product's parts. That set is often a
            # single fabric, which would leave the customiser with one option. Fabrics
            # with no category are the global palette and always apply.
            fabrics = Fabric.objects.filter(
                isDeleted=False, isActive=True, fabricType=UNIFORM_TYPE
            )
            if category:
                fabrics = fabrics.filter(
                    Q(category_id=category.id) | Q(category__isnull=True)
                )
            fabrics = fabrics.order_by("fabricName")

            colours = Colors.objects.filter(isDeleted=False, isActive=True)

            # Which attributes the customiser shows, and in what order — straight from
            # Admin -> Simulation Assets -> Simulation Structure.
            attributes = []
            if category:
                attributes = [
                    a
                    for a in category_attributes(category)
                    if a.get("enabled")
                ]
                attributes.sort(key=lambda a: _order_key(a.get("order")))

            # The choices per attribute (collar styles, cuffs, the size run) from
            # Product & Specification -> Options. Grouped by attribute so the customiser
            # can look up the tool it is rendering. Options with no category are global,
            # the same rule the fabric palette follows.
            option_qs = AttributeOption.objects.filter(isDeleted=False, isActive=True)
            if category:
                option_qs = option_qs.filter(
                    Q(category_id=category.id) | Q(category__isnull=True)
                )

            attribute_options = {}
            for opt in option_qs.order_by("attribute", "order", "id"):
                attribute_options.setdefault(opt.attribute, []).append({
                    "id": opt.id,
                    "name": opt.name,
                    "image": _absolute(request, opt.image),
                })

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Simulation options fetched successfully",
                "data": {
                    "products": product_rows,
                    "attributes": attributes,
                    "attribute_options": attribute_options,
                    "fabrics": [
                        {
                            "id": f.id,
                            "name": f.fabricName,
                            "material_type": f.materialType,
                            "color": f.color,
                            # Fabric.color is free text — some rows hold a hex code,
                            # others a colour name. Only a hex can be painted, so the
                            # UI gets a separate field it can trust.
                            "swatch": _hex_or_none(f.color),
                        }
                        for f in fabrics
                    ],
                    "colors": [
                        {
                            "id": c.id,
                            "name": c.colorName,
                            "code": c.colorCode,
                            "compatible_fabrics": c.compatibleFabric,
                        }
                        for c in colours
                    ],
                },
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to fetch simulation options",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SimulationProductLayersAPIView(APIView):
    """
    The ordered layer stack for one product — what a canvas renderer draws.

    Returns 404 when the admin has disabled the product for simulation, so the
    customer side cannot render something the admin has hidden.
    """

    # Empty on purpose. Without this, DRF applies the project default,
    # CustomUserJWTAuthentication, which raises AuthenticationFailed on any token it
    # cannot resolve to a customer -- so an admin Bearer token turns these open
    # endpoints into a 403. Authentication runs before permissions, so AllowAny
    # alone does not save it. Nothing here reads request.user.
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Simulation (Public)"],
        summary="Ordered layer stack for a product",
        responses={
            200: OpenApiResponse(description="Layers fetched"),
            404: OpenApiResponse(description="Product not available for simulation"),
        },
    )
    def get(self, request, pk):
        product = simulatable_products().filter(pk=pk).first()
        if not product:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Product is not available for simulation",
            }, status=status.HTTP_404_NOT_FOUND)

        parts = sorted(
            (p for p in product.parts.all() if not p.isDeleted),
            key=lambda x: (x.zIndex, x.id),
        )
        layers = [serialize_layer(p, request) for p in parts if p.partImage]
        missing = [p.partName for p in parts if not p.partImage]

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Product layers fetched successfully",
            "data": {
                "product_id": product.id,
                "product_name": product.productName,
                "category": product.category.categoryName if product.category_id else None,
                "layers": layers,
                # Surfaced rather than hidden: a part without artwork is a
                # configuration gap the admin needs to fix.
                "parts_without_image": missing,
            },
        }, status=status.HTTP_200_OK)
