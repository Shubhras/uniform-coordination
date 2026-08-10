"""
Quotation History for the admin Pricing tab — list sent/pending proposals with
their figures, plus a resend action.

Deliberately a lean, purpose-built endpoint rather than reusing the large
QuotationRequestSerializer: this view only needs what the history timeline renders.
"""

import re
import traceback
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.timezone import now
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
from uniformAdmin.currency import get_currency
from uniformAdmin.models import QuotationTemplate
from userhub.models import QuotationRequest

# "M-10, L-20" -> 30. size_quantity is free text, so this stays defensive and
# simply sums every integer it finds.
QUANTITY_RE = re.compile(r"\d+")


def derive_item_count(size_quantity):
    if not size_quantity:
        return 0
    try:
        return sum(int(n) for n in QUANTITY_RE.findall(str(size_quantity)))
    except (TypeError, ValueError):
        return 0


def to_float(value):
    """Decimals aren't JSON-serialisable by default; None stays None."""
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError, InvalidOperation):
        return None


def discount_amount(subtotal, discount_percent):
    """Derived, not stored, so it can never contradict subtotal x percent."""
    if subtotal is None or not discount_percent:
        return 0.0
    try:
        return float(
            (Decimal(str(subtotal)) * Decimal(str(discount_percent)) / Decimal("100"))
            .quantize(Decimal("0.01"))
        )
    except (InvalidOperation, TypeError, ValueError):
        return 0.0


def serialize_history_row(q):
    subtotal = to_float(q.subtotal)
    percent = to_float(q.discount_percent) or 0.0
    discount = discount_amount(q.subtotal, q.discount_percent)

    # Fall back to subtotal - discount when the admin hasn't typed a total yet,
    # so the row still shows a sensible figure instead of a blank.
    total = to_float(q.total)
    if total is None and subtotal is not None:
        total = round(subtotal - discount, 2)

    sales_rep = None
    if q.sales_rep_id and q.sales_rep:
        sales_rep = (
            getattr(q.sales_rep, "full_name", None)
            or getattr(q.sales_rep, "name", None)
            or q.sales_rep.email
        )

    return {
        "id": str(q.uuids),
        "quotation_id": q.quotation_id,
        "quote_number": f"#{q.quotation_id}" if q.quotation_id else None,
        "company": q.company_name or q.contact_person or q.email,
        "email": q.email,
        "date": q.created_at.date().isoformat() if q.created_at else None,
        "status": q.quotation_status,
        "workflow_status": q.workflow_status,
        "items": derive_item_count(q.size_quantity),
        "amount": total,
        "last_sent_at": q.last_sent_at.isoformat() if q.last_sent_at else None,
        "details": {
            "created": q.created_at.date().isoformat() if q.created_at else None,
            "valid_until": q.valid_until.isoformat() if q.valid_until else None,
            "delivery_date": q.delivery_date.isoformat() if q.delivery_date else None,
            "sales_rep": sales_rep,
            "subtotal": subtotal,
            "discount_percent": percent,
            "discount_amount": discount,
            "total": total,
        },
    }


class QuotationHistoryListAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Quotation History"],
        summary="List quotations for the admin history timeline",
        parameters=[
            OpenApiParameter("page", OpenApiTypes.INT, OpenApiParameter.QUERY),
            OpenApiParameter("page_size", OpenApiTypes.INT, OpenApiParameter.QUERY),
            OpenApiParameter(
                "status",
                OpenApiTypes.STR,
                OpenApiParameter.QUERY,
                description="Filter by quotation_status (pending, sent, approved, cancelled...)",
            ),
            OpenApiParameter("search", OpenApiTypes.STR, OpenApiParameter.QUERY),
        ],
        responses={200: OpenApiResponse(description="Quotation history fetched")},
    )
    def get(self, request):
        try:
            queryset = (
                QuotationRequest.objects
                .filter(isDeleted=False)
                .select_related("sales_rep")
                .order_by("-created_at")
            )

            status_param = request.GET.get("status")
            if status_param:
                queryset = queryset.filter(quotation_status=status_param)

            search = request.GET.get("search")
            if search:
                from django.db.models import Q
                queryset = queryset.filter(
                    Q(company_name__icontains=search)
                    | Q(quotation_id__icontains=search)
                    | Q(email__icontains=search)
                    | Q(contact_person__icontains=search)
                )

            total_count = queryset.count()

            try:
                page = max(1, int(request.GET.get("page", 1)))
                page_size = min(100, max(1, int(request.GET.get("page_size", 10))))
            except (TypeError, ValueError):
                page, page_size = 1, 10

            start = (page - 1) * page_size
            rows = queryset[start:start + page_size]

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Quotation history fetched successfully",
                "count": total_count,
                "currency": get_currency(),
                "page": page,
                "page_size": page_size,
                "data": [serialize_history_row(q) for q in rows],
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to fetch quotation history",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class QuotationResendAPIView(APIView):
    """Email the quotation to the customer again."""

    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Quotation History"],
        summary="Resend a quotation to the customer",
        request=None,
        responses={
            200: OpenApiResponse(description="Quotation resent"),
            404: OpenApiResponse(description="Quotation not found"),
            502: OpenApiResponse(description="Email delivery failed"),
        },
    )
    def post(self, request, quotation_id):
        quotation = QuotationRequest.objects.filter(
            quotation_id=quotation_id, isDeleted=False
        ).first()

        if not quotation:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Quotation not found",
            }, status=status.HTTP_404_NOT_FOUND)

        if not quotation.email:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "This quotation has no customer email address",
            }, status=status.HTTP_400_BAD_REQUEST)

        # Render the active quotation template so the email matches the PDF layout
        # the admin designed under Pricing -> Quotation Template.
        from uniformAdmin.pdf_templates import DEFAULT_QUOTATION_HTML

        template = QuotationTemplate.objects.filter(
            title="quotation", is_active=True, is_deleted=False
        ).first()
        body_html = template.content if template else DEFAULT_QUOTATION_HTML

        row = serialize_history_row(quotation)
        replacements = {
            "{QUOTATION_ID}": quotation.quotation_id or "",
            "{CLIENT_NAME}": quotation.contact_person or quotation.company_name or "",
            "{COMPANY_NAME}": quotation.company_name or "",
            "{COMPANY_ADDRESS}": "",
            "{DATE}": row["details"]["created"] or "",
            "{VALID_DATE}": row["details"]["valid_until"] or "",
            "{ITEM_TYPE}": quotation.item_type or "",
            "{FABRIC}": quotation.material or "",
            "{QUANTITY}": quotation.size_quantity or "",
            "{PRICE}": "",
            "{SUBTOTAL}": f"{row['details']['subtotal']:.2f}" if row["details"]["subtotal"] is not None else "",
            "{DISCOUNT}": f"-{row['details']['discount_amount']:.2f}" if row["details"]["discount_amount"] else "",
            "{TOTAL}": f"{row['details']['total']:.2f}" if row["details"]["total"] is not None else "",
        }
        for token, value in replacements.items():
            body_html = body_html.replace(token, str(value))

        subject = f"Quotation {quotation.quotation_id}"
        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None) or settings.EMAIL_HOST_USER

        try:
            message = EmailMultiAlternatives(
                subject=subject,
                body="Please view this email in an HTML-capable client.",
                from_email=from_email,
                to=[quotation.email],
            )
            message.attach_alternative(body_html, "text/html")
            message.send(fail_silently=False)
        except Exception as e:
            # Surface a distinct code so the UI can say "email failed", not "save failed".
            return Response({
                "status": False,
                "statusCode": 502,
                "message": "Could not send the quotation email",
                "error": str(e),
            }, status=status.HTTP_502_BAD_GATEWAY)

        # Only stamp/promote after the send actually succeeded.
        quotation.last_sent_at = now()
        update_fields = ["last_sent_at", "updated_at"]
        if quotation.quotation_status == "pending":
            quotation.quotation_status = "sent"
            update_fields.append("quotation_status")
        quotation.save(update_fields=update_fields)

        return Response({
            "status": True,
            "statusCode": 200,
            "message": f"Quotation resent to {quotation.email}",
            "data": serialize_history_row(quotation),
        }, status=status.HTTP_200_OK)
