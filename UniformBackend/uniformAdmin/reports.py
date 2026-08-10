"""
Reports & Analytics for the KIREIZ FORM admin.

DESIGN NOTE — why these metrics and not the ones the current UI shows
--------------------------------------------------------------------
The existing screen renders Active Rentals / Inventory Items / Late Returns /
Top Rented Categories / Inventory Status / B2B-vs-B2C segments. None of those
belong to KIREIZ FORM:

  * FORM has no rentals and no orders — the customer journey ends at a quotation
    request (spec: "concluding its described flow with the quotation request").
  * FORM has no inventory — spec: "No full SKU generation. Inventory/SKU
    management is not included."
  * FORM is B2B only, so a B2C segment has nothing behind it.

Those tiles came from the KIREIZ SPACE (rental) fork. The `userhub_order` and
`userhub_rental` tables do hold rows, but reporting on them here would present
another platform's data as this one's.

So this module reports the funnel FORM actually has: quotation requests, their
status, who they came from, and what was quoted. Every number below traces to a
real column — nothing is invented. Where a figure cannot be derived it is
returned as null so the UI can show "—" rather than a fake value.

No Figma exists for this screen, so the metric set is chosen here and the
frontend follows it.
"""

import csv
import traceback
from datetime import timedelta
from decimal import Decimal

from django.db.models import (
    Avg,
    Count,
    DurationField,
    ExpressionWrapper,
    F,
    Q,
    Sum,
)
from django.db.models.functions import TruncMonth
from django.http import HttpResponse
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
from uniformAdmin.models import AdminUser, Category, Fabric, Parts, Product, Template
from userhub.models import QuotationRequest, Users

# A quotation is "won" once the customer has agreed.
WON_STATUSES = ("approved", "accepted")
OPEN_STATUSES = ("pending", "received")

# FORM-side customers only. userType distinguishes platform, not B2B/B2C.
UNIFORM_USER_TYPE = "uniform"

DEFAULT_MONTHS = 6


def month_series(months):
    """Ordered [(date, 'Mon YYYY'), ...] covering the trailing `months` window."""
    today = now().date().replace(day=1)
    series = []
    cursor = today
    for _ in range(months):
        series.append(cursor)
        # Step back one month without dateutil.
        cursor = (cursor - timedelta(days=1)).replace(day=1)
    return list(reversed(series))


def bucket_by_month(queryset, date_field, months):
    """Count rows per calendar month, zero-filled across the whole window."""
    series = month_series(months)
    start = series[0]

    rows = (
        queryset
        .filter(**{f"{date_field}__date__gte": start})
        .annotate(bucket=TruncMonth(date_field))
        .values("bucket")
        .annotate(value=Count("pk"))
    )

    counts = {}
    for row in rows:
        bucket = row["bucket"]
        if bucket:
            key = (bucket.year, bucket.month)
            counts[key] = counts.get(key, 0) + row["value"]

    return [
        {
            "label": d.strftime("%b %Y"),
            "value": counts.get((d.year, d.month), 0),
        }
        for d in series
    ]


def build_analytics(months=DEFAULT_MONTHS):
    quotations = QuotationRequest.objects.filter(isDeleted=False)

    total_requests = quotations.count()
    pending_review = quotations.filter(quotation_status__in=OPEN_STATUSES).count()
    sent_count = quotations.filter(quotation_status="sent").count()
    won_count = quotations.filter(quotation_status__in=WON_STATUSES).count()
    cancelled_count = quotations.filter(quotation_status="cancelled").count()

    # Quoted value comes from the figures an admin typed on the quotation —
    # the platform does no price calculation, so this is null until they do.
    quoted_value = quotations.filter(
        quotation_status__in=WON_STATUSES
    ).aggregate(total=Sum("total"))["total"]

    pipeline_value = quotations.filter(
        quotation_status__in=OPEN_STATUSES + ("sent",)
    ).aggregate(total=Sum("total"))["total"]

    win_rate = round((won_count / total_requests) * 100, 1) if total_requests else 0.0

    # Average turnaround: request created -> quote emailed. Only rows that were
    # actually sent can contribute, so this is honest about its sample.
    responded = quotations.filter(last_sent_at__isnull=False)
    avg_response = responded.aggregate(
        avg=Avg(
            ExpressionWrapper(
                F("last_sent_at") - F("created_at"),
                output_field=DurationField(),
            )
        )
    )["avg"]
    avg_response_days = round(avg_response.total_seconds() / 86400, 1) if avg_response else None

    customers = Users.objects.filter(isDeleted=False, userType=UNIFORM_USER_TYPE)
    b2b_accounts = AdminUser.objects.filter(
        role__role_name__in=("b2b", "b2b_user")
    ).count()

    # --- Status distribution (replaces the B2B/B2C donut) ---
    status_rows = (
        quotations.values("quotation_status")
        .annotate(value=Count("uuids"))
        .order_by("-value")
    )
    status_total = sum(r["value"] for r in status_rows) or 1
    status_distribution = [
        {
            "label": (r["quotation_status"] or "unknown").capitalize(),
            "value": r["value"],
            "percentage": round((r["value"] / status_total) * 100, 1),
        }
        for r in status_rows
    ]

    # --- Top industries by quotation volume (replaces Top Rented Categories) ---
    industry_rows = (
        quotations.filter(
            customupdatemodel__model_info__product__isDeleted=False,
        )
        .values(
            "customupdatemodel__model_info__product__category__categoryName",
        )
        .annotate(value=Count("uuids"))
        .order_by("-value")[:6]
    )
    top_industries = [
        {
            "label": r["customupdatemodel__model_info__product__category__categoryName"]
            or "Uncategorized",
            "value": r["value"],
        }
        for r in industry_rows
    ]

    # --- Top customers by request volume (plan: "Customer Reports") ---
    # Grouped on company_name because a request can arrive without a linked
    # account; the company is what the admin actually recognises.
    customer_rows = (
        quotations.exclude(company_name__isnull=True)
        .exclude(company_name="")
        .values("company_name")
        .annotate(
            value=Count("uuids"),
            won=Count("uuids", filter=Q(quotation_status__in=WON_STATUSES)),
            amount=Sum("total", filter=Q(quotation_status__in=WON_STATUSES)),
        )
        .order_by("-value")[:6]
    )
    top_customers = [
        {
            "label": r["company_name"],
            "value": r["value"],
            "won": r["won"],
            "amount": float(r["amount"]) if r["amount"] is not None else None,
        }
        for r in customer_rows
    ]

    # --- Top products by request volume (plan: "Product Reports") ---
    product_rows = (
        quotations.filter(
            customupdatemodel__model_info__product__isDeleted=False,
        )
        .values("customupdatemodel__model_info__product__productName")
        .annotate(value=Count("uuids"))
        .order_by("-value")[:6]
    )
    top_products = [
        {
            "label": r["customupdatemodel__model_info__product__productName"]
            or "Unnamed product",
            "value": r["value"],
        }
        for r in product_rows
    ]

    # --- Top fabrics by part usage (replaces Inventory Status) ---
    fabric_rows = (
        Fabric.objects.filter(isDeleted=False, parts__isDeleted=False)
        .values("fabricName")
        .annotate(value=Count("parts"))
        .order_by("-value")[:6]
    )
    top_fabrics = [
        {"label": r["fabricName"], "value": r["value"]} for r in fabric_rows
    ]

    # --- Sales rep leaderboard ---
    rep_rows = (
        quotations.filter(sales_rep__isnull=False)
        .values("sales_rep", "sales_rep__name", "sales_rep__email")
        .annotate(
            assigned=Count("uuids"),
            won=Count("uuids", filter=Q(quotation_status__in=WON_STATUSES)),
            value=Sum("total", filter=Q(quotation_status__in=WON_STATUSES)),
        )
        .order_by("-assigned")[:6]
    )
    sales_leaderboard = [
        {
            "id": r["sales_rep"],
            "label": r["sales_rep__name"] or r["sales_rep__email"],
            "assigned": r["assigned"],
            "won": r["won"],
            "value": float(r["value"]) if r["value"] is not None else None,
            "win_rate": round((r["won"] / r["assigned"]) * 100, 1) if r["assigned"] else 0.0,
        }
        for r in rep_rows
    ]

    return {
        "range_months": months,
        # Single source for the symbol so the UI never hardcodes one.
        "currency": get_currency(),
        "stats": {
            "total_requests": total_requests,
            "pending_review": pending_review,
            "sent": sent_count,
            "won": won_count,
            "cancelled": cancelled_count,
            "win_rate": win_rate,
            "quoted_value": float(quoted_value) if quoted_value is not None else None,
            "pipeline_value": float(pipeline_value) if pipeline_value is not None else None,
            "avg_response_days": avg_response_days,
            "responded_sample": responded.count(),
            "customers": customers.count(),
            "b2b_accounts": b2b_accounts,
        },
        "catalog": {
            "products": Product.objects.filter(isDeleted=False).count(),
            "categories": Category.objects.filter(isDeleted=False).count(),
            "fabrics": Fabric.objects.filter(isDeleted=False).count(),
            "parts": Parts.objects.filter(isDeleted=False).count(),
            "templates": Template.objects.count(),
        },
        "charts": {
            "quotation_trend": bucket_by_month(quotations, "created_at", months),
            "customer_growth": bucket_by_month(customers, "createdAt", months),
            "status_distribution": status_distribution,
            "top_industries": top_industries,
            "top_products": top_products,
            "top_customers": top_customers,
            "top_fabrics": top_fabrics,
            "sales_leaderboard": sales_leaderboard,
        },
        "generated_at": now(),
    }


class ReportsAnalyticsAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Reports & Analytics"],
        summary="KIREIZ FORM quotation analytics",
        parameters=[
            OpenApiParameter(
                "months",
                OpenApiTypes.INT,
                OpenApiParameter.QUERY,
                description="Trailing window for the trend charts (1-24, default 6)",
            )
        ],
        responses={200: OpenApiResponse(description="Analytics fetched")},
    )
    def get(self, request):
        try:
            try:
                months = int(request.GET.get("months", DEFAULT_MONTHS))
            except (TypeError, ValueError):
                months = DEFAULT_MONTHS
            months = max(1, min(24, months))

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Analytics fetched successfully",
                "data": build_analytics(months),
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to fetch analytics",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReportsExportAPIView(APIView):
    """
    Backs the 'Export Data' buttons.

    ?type=quotations (default) streams the full quotation register. The aggregate
    types reuse build_analytics() rather than re-querying, so an exported CSV can
    never disagree with the panel it was exported from.
    """

    authentication_classes = [IsAdminUserJWT]

    EXPORT_TYPES = ("quotations", "customers", "products", "sales", "fabrics")

    @extend_schema(
        tags=["Reports & Analytics"],
        summary="Export report data as CSV",
        parameters=[
            OpenApiParameter(
                "type",
                OpenApiTypes.STR,
                OpenApiParameter.QUERY,
                description="quotations (default) | customers | products | sales | fabrics",
            )
        ],
        responses={200: OpenApiResponse(description="CSV file")},
    )
    def get(self, request):
        export_type = (request.GET.get("type") or "quotations").lower()
        if export_type not in self.EXPORT_TYPES:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": f"type must be one of: {', '.join(self.EXPORT_TYPES)}",
            }, status=status.HTTP_400_BAD_REQUEST)

        if export_type != "quotations":
            return self.export_aggregate(export_type)

        return self.export_quotations()

    def csv_response(self, name):
        stamp = now().strftime("%Y%m%d_%H%M%S")
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = (
            f'attachment; filename="{name}_{stamp}.csv"'
        )
        return response

    def export_aggregate(self, export_type):
        charts = build_analytics()["charts"]

        specs = {
            "customers": (
                "customer_report",
                charts["top_customers"],
                ["Company", "Requests", "Won", "Won Value"],
                lambda r: [r["label"], r["value"], r["won"],
                           r["amount"] if r["amount"] is not None else ""],
            ),
            "products": (
                "product_report",
                charts["top_products"],
                ["Product", "Requests"],
                lambda r: [r["label"], r["value"]],
            ),
            "sales": (
                "sales_report",
                charts["sales_leaderboard"],
                ["Sales Rep", "Assigned", "Won", "Win Rate %", "Won Value"],
                lambda r: [r["label"], r["assigned"], r["won"], r["win_rate"],
                           r["value"] if r["value"] is not None else ""],
            ),
            "fabrics": (
                "fabric_report",
                charts["top_fabrics"],
                ["Fabric", "Parts Using It"],
                lambda r: [r["label"], r["value"]],
            ),
        }

        filename, rows, header, row_fn = specs[export_type]
        response = self.csv_response(filename)
        writer = csv.writer(response)
        writer.writerow(header)
        for row in rows:
            writer.writerow(row_fn(row))
        return response

    def export_quotations(self):
        quotations = (
            QuotationRequest.objects
            .filter(isDeleted=False)
            .select_related("sales_rep")
            .order_by("-created_at")
        )

        response = self.csv_response("quotation_report")

        writer = csv.writer(response)
        writer.writerow([
            "Quotation ID", "Company", "Contact", "Email", "Status",
            "Created", "Valid Until", "Delivery Date", "Sales Rep",
            "Item Type", "Material", "Size/Quantity",
            "Subtotal", "Discount %", "Total", "Last Sent",
        ])

        for q in quotations.iterator():
            writer.writerow([
                q.quotation_id or "",
                q.company_name or "",
                q.contact_person or "",
                q.email or "",
                q.quotation_status or "",
                q.created_at.strftime("%Y-%m-%d") if q.created_at else "",
                q.valid_until.isoformat() if q.valid_until else "",
                q.delivery_date.isoformat() if q.delivery_date else "",
                (q.sales_rep.name or q.sales_rep.email) if q.sales_rep else "",
                q.item_type or "",
                q.material or "",
                (q.size_quantity or "").replace("\n", " "),
                q.subtotal if q.subtotal is not None else "",
                q.discount_percent if q.discount_percent is not None else "",
                q.total if q.total is not None else "",
                q.last_sent_at.strftime("%Y-%m-%d %H:%M") if q.last_sent_at else "",
            ])

        return response
