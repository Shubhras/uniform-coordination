"""
PDF & Simulation Configuration — page-format presets plus export settings.

Both tabs (PDF Template / Exports) share one config object, so a single GET/POST
pair backs the whole screen.
"""

import traceback
from decimal import Decimal

from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from uniformAdmin.auth import IsAdminUserJWT
from uniformAdmin.models import PdfPageTemplate, SimulationExportSetting

# Seeded on first load so the screen isn't empty on a fresh install.
DEFAULT_TEMPLATES = [
    {"name": "Standard Report A4", "width": "210", "height": "297", "unit": "mm", "tag": "A4", "sort_order": 0},
    {"name": "US Letter Brief", "width": "8.5", "height": "11", "unit": "in", "tag": "Letter", "sort_order": 1},
    {"name": "Technical Schematic", "width": "420", "height": "297", "unit": "mm", "tag": "A4", "sort_order": 2},
    {"name": "Custom Canvas", "width": "1920", "height": "1080", "unit": "px", "tag": "Custom", "sort_order": 3},
]

# Rough bytes-per-pixel by format, used only for the "File Size Est." readout.
BYTES_PER_PIXEL = {"pdf": 0.35, "png": 1.1, "jpg": 0.18}

MM_PER_INCH = Decimal("25.4")


def ensure_seed_templates():
    if PdfPageTemplate.objects.exists():
        return
    PdfPageTemplate.objects.bulk_create(
        [PdfPageTemplate(**row) for row in DEFAULT_TEMPLATES]
    )


def get_settings():
    """Load the singleton, seeding templates and a default selection first."""
    ensure_seed_templates()
    settings_obj, created = SimulationExportSetting.objects.get_or_create(pk=1)
    if created or settings_obj.selected_template_id is None:
        settings_obj.selected_template = PdfPageTemplate.objects.filter(
            is_active=True
        ).first()
        settings_obj.save()
    return settings_obj


def pixel_dimensions(template, dpi):
    """Convert a page size to pixels at the given DPI."""
    if not template:
        return None, None

    width, height, unit = template.width, template.height, template.unit

    if unit == "px":
        return int(width), int(height)

    if unit == "mm":
        width_in = width / MM_PER_INCH
        height_in = height / MM_PER_INCH
    else:  # inches
        width_in, height_in = width, height

    return int(width_in * dpi), int(height_in * dpi)


def estimate_file_size(template, dpi, output_format, quality):
    """
    Honest-ish estimate: pixel count x per-format bytes, scaled by quality.
    Returned in bytes plus a human label; the UI shows the label.
    """
    px_w, px_h = pixel_dimensions(template, dpi)
    if not px_w or not px_h:
        return None, None

    per_pixel = BYTES_PER_PIXEL.get(output_format, 0.35)
    # Quality 0-100 maps to a 0.4x - 1.4x multiplier.
    quality_factor = 0.4 + (max(0, min(100, quality)) / 100)
    size_bytes = int(px_w * px_h * per_pixel * quality_factor)

    if size_bytes >= 1024 * 1024:
        label = f"~{size_bytes / (1024 * 1024):.1f} MB"
    elif size_bytes >= 1024:
        label = f"~{size_bytes / 1024:.0f} KB"
    else:
        label = f"~{size_bytes} B"

    return size_bytes, label


def serialize_template(template):
    return {
        "id": template.id,
        "name": template.name,
        "width": float(template.width),
        "height": float(template.height),
        "unit": template.unit,
        "dimension": template.dimension_label,
        "tag": template.tag,
        "sort_order": template.sort_order,
        "is_active": template.is_active,
    }


def serialize_config(settings_obj):
    templates = PdfPageTemplate.objects.filter(is_active=True)
    selected = settings_obj.selected_template

    px_w, px_h = pixel_dimensions(selected, settings_obj.dpi)
    size_bytes, size_label = estimate_file_size(
        selected,
        settings_obj.dpi,
        settings_obj.output_format,
        settings_obj.compression_quality,
    )

    return {
        "templates": [serialize_template(t) for t in templates],
        "selected_template_id": settings_obj.selected_template_id,
        "export": {
            "output_format": settings_obj.output_format,
            "compression_quality": settings_obj.compression_quality,
            "dpi": settings_obj.dpi,
            "format_options": [
                {"value": v, "label": l}
                for v, l in SimulationExportSetting.FORMAT_CHOICES
            ],
            "dpi_options": [
                {"value": v, "label": l}
                for v, l in SimulationExportSetting.DPI_CHOICES
            ],
        },
        "preview": {
            "dimensions": selected.dimension_label if selected else None,
            "pixel_width": px_w,
            "pixel_height": px_h,
            "file_size_bytes": size_bytes,
            "file_size_label": size_label,
            # No data source yet — the Canvas simulation engine that would own
            # layer data does not exist. Kept in the contract so the UI can fill
            # it in once it does, rather than inventing a number now.
            "active_layers": None,
        },
        "updated_at": settings_obj.updated_at,
    }


class SimulationConfigAPIView(APIView):
    """GET the whole config; POST to save template selection and/or export settings."""

    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Simulation Configuration"],
        summary="Get PDF templates + export settings",
        responses={200: OpenApiResponse(description="Configuration fetched")},
    )
    def get(self, request):
        try:
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Simulation configuration fetched successfully",
                "data": serialize_config(get_settings()),
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to fetch simulation configuration",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        tags=["Simulation Configuration"],
        summary="Save PDF template selection and export settings",
        description=(
            "Send any subset of: selected_template_id, output_format, "
            "compression_quality (0-100), dpi."
        ),
        responses={
            200: OpenApiResponse(description="Configuration saved"),
            400: OpenApiResponse(description="Validation error"),
        },
    )
    def post(self, request):
        try:
            settings_obj = get_settings()

            if "selected_template_id" in request.data:
                template_id = request.data.get("selected_template_id")
                template = PdfPageTemplate.objects.filter(
                    pk=template_id, is_active=True
                ).first()
                if not template:
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": "Selected template not found",
                    }, status=status.HTTP_400_BAD_REQUEST)
                settings_obj.selected_template = template

            if "output_format" in request.data:
                output_format = request.data.get("output_format")
                if output_format not in dict(SimulationExportSetting.FORMAT_CHOICES):
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": "output_format must be pdf, png or jpg",
                    }, status=status.HTTP_400_BAD_REQUEST)
                settings_obj.output_format = output_format

            if "compression_quality" in request.data:
                try:
                    quality = int(request.data.get("compression_quality"))
                except (TypeError, ValueError):
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": "compression_quality must be a number",
                    }, status=status.HTTP_400_BAD_REQUEST)
                if not 0 <= quality <= 100:
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": "compression_quality must be between 0 and 100",
                    }, status=status.HTTP_400_BAD_REQUEST)
                settings_obj.compression_quality = quality

            if "dpi" in request.data:
                try:
                    dpi = int(request.data.get("dpi"))
                except (TypeError, ValueError):
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": "dpi must be a number",
                    }, status=status.HTTP_400_BAD_REQUEST)
                if dpi not in dict(SimulationExportSetting.DPI_CHOICES):
                    allowed = ", ".join(
                        str(v) for v, _ in SimulationExportSetting.DPI_CHOICES
                    )
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": f"dpi must be one of: {allowed}",
                    }, status=status.HTTP_400_BAD_REQUEST)
                settings_obj.dpi = dpi

            settings_obj.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Simulation configuration saved successfully",
                "data": serialize_config(settings_obj),
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to save simulation configuration",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
