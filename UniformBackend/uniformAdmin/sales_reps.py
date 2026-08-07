"""
Sales Representation + Territory/Account Assignment for the admin Customer tab.

Sales reps and B2B accounts are both AdminUser rows, told apart by their role:
  role.role_name == "sales"          -> a sales representative
  role.role_name in ("b2b","b2b_user") -> a B2B account that can be assigned to a rep

Per-rep stats are computed from QuotationRequest.sales_rep rather than stored, so
they can never go stale.
"""

import traceback
from decimal import Decimal

from django.db import transaction
from django.db.models import Count, Q, Sum
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
from uniformAdmin.models import AdminUser, Role
from userhub.models import QuotationRequest

SALES_ROLE_NAME = "sales"
B2B_ROLE_NAMES = ("b2b", "b2b_user")

# A quotation counts as "won" for win-rate purposes when the customer agreed.
WON_STATUSES = ("approved", "accepted")


def get_sales_role():
    """The `sales` role isn't in the seed data, so create it on first use."""
    role, _ = Role.objects.get_or_create(role_name=SALES_ROLE_NAME)
    return role


def initials_of(name, email):
    source = (name or "").strip()
    if source:
        parts = [p for p in source.split() if p]
        if len(parts) >= 2:
            return (parts[0][0] + parts[-1][0]).upper()
        return parts[0][:2].upper()
    return (email or "?")[:2].upper()


def sales_rep_queryset():
    return AdminUser.objects.filter(
        role__role_name=SALES_ROLE_NAME
    ).select_related("role").order_by("name", "id")


def b2b_account_queryset():
    return AdminUser.objects.filter(
        role__role_name__in=B2B_ROLE_NAMES
    ).select_related("role", "assigned_sales_rep").order_by("company_name", "name", "id")


def build_rep_stats():
    """
    One aggregate query for every rep, keyed by rep id:
      clients   - distinct companies quoted
      revenue   - sum of totals on won quotations
      win_rate  - won / assigned, as a percentage
    """
    rows = (
        QuotationRequest.objects
        .filter(isDeleted=False, sales_rep__isnull=False)
        .values("sales_rep")
        .annotate(
            clients=Count("company_name", distinct=True),
            assigned=Count("uuids"),
            won=Count("uuids", filter=Q(quotation_status__in=WON_STATUSES)),
            revenue=Sum("total", filter=Q(quotation_status__in=WON_STATUSES)),
        )
    )

    stats = {}
    for row in rows:
        assigned = row["assigned"] or 0
        won = row["won"] or 0
        revenue = row["revenue"] or Decimal("0")
        stats[row["sales_rep"]] = {
            "clients": row["clients"] or 0,
            "assigned": assigned,
            "won": won,
            "revenue": float(revenue),
            "win_rate": round((won / assigned) * 100, 1) if assigned else 0.0,
        }
    return stats


def serialize_rep(rep, stats):
    s = stats.get(rep.id) or {
        "clients": 0,
        "assigned": 0,
        "won": 0,
        "revenue": 0.0,
        "win_rate": 0.0,
    }
    return {
        "id": rep.id,
        "name": rep.name or rep.email,
        "email": rep.email,
        "mobile": rep.mobile,
        "designation": rep.designation or "Sales Representative",
        "initials": initials_of(rep.name, rep.email),
        "is_active": rep.is_active,
        "clients": s["clients"],
        "assigned_quotations": s["assigned"],
        "won_quotations": s["won"],
        "revenue": s["revenue"],
        "win_rate": s["win_rate"],
        "created_at": rep.created_at,
        "last_login": rep.last_login,
    }


def serialize_account(account):
    return {
        "id": account.id,
        "name": account.company_name or account.name or account.email,
        "email": account.email,
        "tier": (account.tier or "silver").capitalize(),
        "assigned_sales_rep": account.assigned_sales_rep_id,
    }


class SalesRepListAPIView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Sales Representation"],
        summary="List sales reps with performance stats",
        parameters=[
            OpenApiParameter("search", OpenApiTypes.STR, OpenApiParameter.QUERY),
        ],
        responses={200: OpenApiResponse(description="Sales reps fetched")},
    )
    def get(self, request):
        try:
            queryset = sales_rep_queryset()

            search = request.GET.get("search")
            if search:
                queryset = queryset.filter(
                    Q(name__icontains=search)
                    | Q(email__icontains=search)
                    | Q(designation__icontains=search)
                )

            stats = build_rep_stats()

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Sales representatives fetched successfully",
                "count": queryset.count(),
                "data": [serialize_rep(rep, stats) for rep in queryset],
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to fetch sales representatives",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        tags=["Sales Representation"],
        summary="Create a sales rep",
        responses={
            201: OpenApiResponse(description="Sales rep created"),
            400: OpenApiResponse(description="Validation error"),
        },
    )
    def post(self, request):
        try:
            name = (request.data.get("name") or "").strip()
            email = (request.data.get("email") or "").strip().lower()
            password = request.data.get("password") or ""

            if not name or not email or not password:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "name, email and password are required",
                }, status=status.HTTP_400_BAD_REQUEST)

            if AdminUser.objects.filter(email__iexact=email).exists():
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "An account with this email already exists",
                }, status=status.HTTP_400_BAD_REQUEST)

            mobile = (request.data.get("mobile") or "").strip() or None
            if mobile and AdminUser.objects.filter(mobile=mobile).exists():
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "An account with this mobile already exists",
                }, status=status.HTTP_400_BAD_REQUEST)

            designation = (request.data.get("designation") or "").strip() \
                or "Sales Representative"

            # Check lengths before hitting the DB: MySQL raises DataError (a 500)
            # on overflow, so validate here to return a usable 400 instead.
            for label, value, limit in (
                ("name", name, 255),
                ("email", email, 254),
                ("mobile", mobile or "", 15),
                ("designation", designation, 100),
            ):
                if len(value) > limit:
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": f"{label} is too long (max {limit} characters)",
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Not reusing AdminUserSerializer: its create() hardcodes the b2b role.
            rep = AdminUser.objects.create_user(
                email=email,
                password=password,
                name=name,
                mobile=mobile,
                designation=designation,
                role=get_sales_role(),
                is_staff=True,
            )

            return Response({
                "status": True,
                "statusCode": 201,
                "message": "Sales representative created successfully",
                "data": serialize_rep(rep, build_rep_stats()),
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to create sales representative",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SalesRepDetailAPIView(APIView):
    """Backs the View Profile modal."""

    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Sales Representation"],
        summary="Sales rep profile with assigned accounts",
        responses={
            200: OpenApiResponse(description="Profile fetched"),
            404: OpenApiResponse(description="Sales rep not found"),
        },
    )
    def get(self, request, pk):
        rep = sales_rep_queryset().filter(pk=pk).first()
        if not rep:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Sales representative not found",
            }, status=status.HTTP_404_NOT_FOUND)

        data = serialize_rep(rep, build_rep_stats())
        data["accounts"] = [
            serialize_account(a) for a in rep.assigned_accounts.all()
        ]

        recent = (
            QuotationRequest.objects
            .filter(isDeleted=False, sales_rep=rep)
            .order_by("-created_at")[:5]
        )
        data["recent_quotations"] = [
            {
                "quotation_id": q.quotation_id,
                "company": q.company_name,
                "status": q.quotation_status,
                "total": float(q.total) if q.total is not None else None,
                "date": q.created_at.date().isoformat() if q.created_at else None,
            }
            for q in recent
        ]

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Sales representative profile fetched successfully",
            "data": data,
        }, status=status.HTTP_200_OK)


class SalesRepAssignmentBoardAPIView(APIView):
    """Kanban data for Territory & Account Assignment."""

    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Sales Representation"],
        summary="Assignment board (unassigned + per-rep columns)",
        parameters=[
            OpenApiParameter("search", OpenApiTypes.STR, OpenApiParameter.QUERY),
        ],
        responses={200: OpenApiResponse(description="Board fetched")},
    )
    def get(self, request):
        try:
            accounts = b2b_account_queryset()

            search = request.GET.get("search")
            if search:
                accounts = accounts.filter(
                    Q(company_name__icontains=search)
                    | Q(name__icontains=search)
                    | Q(email__icontains=search)
                )

            reps = list(sales_rep_queryset())

            # Bucket in Python — one pass over an already-fetched queryset beats
            # a query per column.
            buckets = {rep.id: [] for rep in reps}
            unassigned = []
            for account in accounts:
                rep_id = account.assigned_sales_rep_id
                if rep_id in buckets:
                    buckets[rep_id].append(serialize_account(account))
                else:
                    # Also catches accounts pointing at a deleted/non-sales rep.
                    unassigned.append(serialize_account(account))

            columns = [{
                "id": "unassigned",
                "title": "Unassigned Accounts",
                "sales_rep_id": None,
                "accounts": unassigned,
            }]
            for rep in reps:
                columns.append({
                    "id": f"rep-{rep.id}",
                    "title": rep.name or rep.email,
                    "sales_rep_id": rep.id,
                    "accounts": buckets[rep.id],
                })

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Assignment board fetched successfully",
                "data": {"columns": columns},
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to fetch assignment board",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        tags=["Sales Representation"],
        summary="Assign / unassign an account",
        description="Body: {\"account_id\": 12, \"sales_rep_id\": 5} — null rep unassigns.",
        responses={
            200: OpenApiResponse(description="Assignment saved"),
            400: OpenApiResponse(description="Validation error"),
            404: OpenApiResponse(description="Account or rep not found"),
        },
    )
    def post(self, request):
        try:
            account_id = request.data.get("account_id")
            sales_rep_id = request.data.get("sales_rep_id")

            if account_id is None:
                return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "account_id is required",
                }, status=status.HTTP_400_BAD_REQUEST)

            account = b2b_account_queryset().filter(pk=account_id).first()
            if not account:
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "B2B account not found",
                }, status=status.HTTP_404_NOT_FOUND)

            rep = None
            if sales_rep_id not in (None, "", "unassigned"):
                rep = sales_rep_queryset().filter(pk=sales_rep_id).first()
                if not rep:
                    return Response({
                        "status": False,
                        "statusCode": 404,
                        "message": "Sales representative not found",
                    }, status=status.HTTP_404_NOT_FOUND)

            with transaction.atomic():
                account.assigned_sales_rep = rep
                account.save(update_fields=["assigned_sales_rep", "updated_at"])

            return Response({
                "status": True,
                "statusCode": 200,
                "message": (
                    f"Assigned to {rep.name or rep.email}" if rep
                    else "Account unassigned"
                ),
                "data": serialize_account(account),
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Failed to save assignment",
                "error": str(e),
                "trace": traceback.format_exc(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
