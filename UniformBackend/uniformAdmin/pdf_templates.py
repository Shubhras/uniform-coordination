"""
CRUD for the admin PDF Template Library (Content & Media -> PDF Templates).

Note this is deliberately separate from the existing `quotationrequesttamplate/*`
endpoints. Those *apply* a template to a quotation and return rendered content —
they are not a template CRUD. These endpoints manage the library itself.

Backed by the QuotationTemplate model.
"""

import re
import traceback

from django.db import transaction
from django.utils.text import slugify
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from uniformAdmin.auth import IsAdminUserJWT
from uniformAdmin.models import QuotationTemplate

# Matches {CLIENT_NAME}-style placeholders so the "customizable fields" count is
# derived from the template body rather than stored and left to drift.
PLACEHOLDER_RE = re.compile(r"\{([A-Za-z0-9_]+)\}")

# The canonical quotation layout. Lives here (not in the frontend) so "Reset
# Default" and auto-provisioning both restore the same thing.
DEFAULT_QUOTATION_HTML = """<h2>QUOTATION #{QUOTATION_ID}</h2>

<p><strong>Date:</strong> {DATE}</p>
<p><strong>Valid until:</strong> {VALID_DATE}</p>

<p>Dear {CLIENT_NAME},</p>

<p>Thank you for your interest in our products. Based on your requirements,
we are pleased to offer the following quotation:</p>

<p>Item: {FABRIC}<br/>
Quantity: {QUANTITY}<br/>
Unit Price: {PRICE}</p>

<hr/>

<p>Subtotal: {SUBTOTAL}<br/>
Discount: {DISCOUNT}</p>

<hr/>

<p><strong>TOTAL: {TOTAL}</strong></p>

<p><strong>Terms &amp; Conditions:</strong></p>

<ol>
<li>50% advance payment required.</li>
<li>Delivery within 14 days of confirmation.</li>
</ol>

<p>Sincerely,</p>
<p>Sales Team</p>
"""


def count_placeholders(content):
    """Number of distinct {PLACEHOLDER} tokens in a template body."""
    if not content:
        return 0
    return len(set(PLACEHOLDER_RE.findall(content)))


def serialize_template(template, include_content=False):
    field_count = count_placeholders(template.content)

    data = {
        "id": template.id,
        "name": template.name or template.slug,
        "slug": template.slug,
        "title": template.title,
        "page_size": template.page_size,
        "field_count": field_count,
        # Pre-built so the list UI doesn't have to reassemble this string.
        "description": f"{template.page_size} • {field_count} customizable fields",
        "language": template.language,
        "version": template.version,
        "sort_order": template.sort_order,
        "is_active": template.is_active,
        "created_at": template.created_at,
        "updated_at": template.updated_at,
    }

    if include_content:
        data["content"] = template.content

    return data


def unique_slug(base, exclude_pk=None):
    """Slugify `base` and suffix it until it no longer collides."""
    root = slugify(base) or "pdf-template"
    candidate = root
    counter = 2

    while True:
        qs = QuotationTemplate.objects.filter(slug=candidate)
        if exclude_pk:
            qs = qs.exclude(pk=exclude_pk)
        if not qs.exists():
            return candidate
        candidate = f"{root}-{counter}"
        counter += 1


class PdfTemplateListAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["PDF Template Library"],
        summary="List PDF templates",
        responses={200: OpenApiResponse(description="Templates fetched")},
    )
    def get(self, request):
        try:
            templates = QuotationTemplate.objects.filter(is_deleted=False).order_by(
                "sort_order", "id"
            )
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "PDF templates fetched successfully",
                "count": templates.count(),
                "data": [serialize_template(t) for t in templates],
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to fetch PDF templates",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PdfTemplateDetailAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["PDF Template Library"],
        summary="Get one PDF template (with content)",
        responses={
            200: OpenApiResponse(description="Template fetched"),
            404: OpenApiResponse(description="Template not found"),
        },
    )
    def get(self, request, pk):
        template = QuotationTemplate.objects.filter(pk=pk, is_deleted=False).first()
        if not template:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Template not found",
            }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Template fetched successfully",
            "data": serialize_template(template, include_content=True),
        }, status=status.HTTP_200_OK)


class PdfTemplateCreateAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["PDF Template Library"],
        summary="Create a PDF template",
        responses={
            201: OpenApiResponse(description="Template created"),
            400: OpenApiResponse(description="Validation error"),
        },
    )
    def post(self, request):
        try:
            name = (request.data.get("name") or "").strip()
            content = request.data.get("content") or ""

            if not name:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "name is required",
                }, status=status.HTTP_400_BAD_REQUEST)

            if not content.strip():
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "content is required",
                }, status=status.HTTP_400_BAD_REQUEST)

            page_size = request.data.get("page_size") or "A4"
            valid_sizes = dict(QuotationTemplate.PAGE_SIZE_CHOICES)
            if page_size not in valid_sizes:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": f"page_size must be one of: {', '.join(valid_sizes)}",
                }, status=status.HTTP_400_BAD_REQUEST)

            title = request.data.get("title") or "quotation"
            if title not in dict(QuotationTemplate.TITLE_CHOICES):
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Invalid title",
                }, status=status.HTTP_400_BAD_REQUEST)

            # New templates go to the end of the list.
            last = QuotationTemplate.objects.filter(is_deleted=False).order_by(
                "-sort_order"
            ).first()
            next_order = (last.sort_order + 1) if last else 0

            template = QuotationTemplate.objects.create(
                name=name,
                slug=unique_slug(request.data.get("slug") or name),
                title=title,
                page_size=page_size,
                content=content,
                language=request.data.get("language") or "en",
                version=request.data.get("version"),
                sort_order=next_order,
            )

            return Response({
                "status": True,
                "statusCode": 201,
                "message": "Template created successfully",
                "data": serialize_template(template, include_content=True),
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to create template",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PdfTemplateUpdateAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["PDF Template Library"],
        summary="Update a PDF template",
        responses={
            200: OpenApiResponse(description="Template updated"),
            404: OpenApiResponse(description="Template not found"),
        },
    )
    def post(self, request, pk):
        try:
            template = QuotationTemplate.objects.filter(pk=pk, is_deleted=False).first()
            if not template:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "Template not found",
                }, status=status.HTTP_404_NOT_FOUND)

            if "name" in request.data:
                name = (request.data.get("name") or "").strip()
                if not name:
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": "name cannot be empty",
                    }, status=status.HTTP_400_BAD_REQUEST)
                template.name = name

            if "page_size" in request.data:
                page_size = request.data.get("page_size")
                if page_size not in dict(QuotationTemplate.PAGE_SIZE_CHOICES):
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": "Invalid page_size",
                    }, status=status.HTTP_400_BAD_REQUEST)
                template.page_size = page_size

            if "content" in request.data:
                template.content = request.data.get("content") or ""

            if "language" in request.data:
                template.language = request.data.get("language") or "en"

            if "version" in request.data:
                template.version = request.data.get("version")

            if "is_active" in request.data:
                template.is_active = bool(request.data.get("is_active"))

            template.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Template updated successfully",
                "data": serialize_template(template, include_content=True),
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to update template",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PdfTemplateDeleteAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["PDF Template Library"],
        summary="Soft-delete a PDF template",
        responses={
            200: OpenApiResponse(description="Template deleted"),
            404: OpenApiResponse(description="Template not found"),
        },
    )
    def delete(self, request, pk):
        template = QuotationTemplate.objects.filter(pk=pk, is_deleted=False).first()
        if not template:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Template not found",
            }, status=status.HTTP_404_NOT_FOUND)

        # Soft delete, matching the rest of this codebase.
        template.is_deleted = True
        template.save(update_fields=["is_deleted", "updated_at"])

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Template deleted successfully",
        }, status=status.HTTP_200_OK)


def get_or_create_active_quotation_template():
    """
    The single template the Pricing -> Quotation Template tab edits.

    Auto-provisions from DEFAULT_QUOTATION_HTML on a fresh install so the tab is
    never staring at an empty editor with nothing to save against.
    """
    template = QuotationTemplate.objects.filter(
        title="quotation", is_active=True, is_deleted=False
    ).order_by("sort_order", "id").first()

    if template:
        return template

    return QuotationTemplate.objects.create(
        name="Standard quotation",
        slug=unique_slug("quotation-default"),
        title="quotation",
        page_size="A4",
        content=DEFAULT_QUOTATION_HTML,
        language="en",
        sort_order=0,
    )


class ActiveQuotationTemplateAPIView(APIView):
    """Read / save / reset the active quotation template."""

    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["PDF Template Library"],
        summary="Get the active quotation template",
        responses={200: OpenApiResponse(description="Template fetched")},
    )
    def get(self, request):
        try:
            template = get_or_create_active_quotation_template()
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Active quotation template fetched successfully",
                "data": serialize_template(template, include_content=True),
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to fetch active quotation template",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        tags=["PDF Template Library"],
        summary="Save the active quotation template",
        description="Pass {\"reset\": true} to restore the built-in default layout.",
        responses={200: OpenApiResponse(description="Template saved")},
    )
    def post(self, request):
        try:
            template = get_or_create_active_quotation_template()

            if request.data.get("reset"):
                template.content = DEFAULT_QUOTATION_HTML
            else:
                content = request.data.get("content")
                if content is None or not str(content).strip():
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": "content is required",
                    }, status=status.HTTP_400_BAD_REQUEST)
                template.content = content

            template.save()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": (
                    "Template reset to default"
                    if request.data.get("reset")
                    else "Template saved successfully"
                ),
                "data": serialize_template(template, include_content=True),
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to save quotation template",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PdfTemplateReorderAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["PDF Template Library"],
        summary="Persist drag-and-drop order",
        description="Accepts the full ordered list of template ids: {\"order\": [3, 1, 2]}",
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
                    "message": "order must be a non-empty list of template ids",
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
                QuotationTemplate.objects.filter(
                    id__in=ids, is_deleted=False
                ).values_list("id", flat=True)
            )
            unknown = [i for i in ids if i not in existing]
            if unknown:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": f"Unknown template ids: {unknown}",
                }, status=status.HTTP_400_BAD_REQUEST)

            # The client sends the whole list, so assigning by index is enough —
            # no neighbour shuffling needed. One transaction so a partial failure
            # can't leave the library half-reordered.
            with transaction.atomic():
                for position, template_id in enumerate(ids):
                    QuotationTemplate.objects.filter(id=template_id).update(
                        sort_order=position
                    )

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Template order saved successfully",
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to save template order",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
