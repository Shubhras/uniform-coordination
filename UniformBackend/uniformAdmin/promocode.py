from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated ,BasePermission,AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from django.db.models import Q
from rest_framework import status

from rest_framework.permissions import AllowAny
from .models import Promocode
from rest_framework.views import APIView

from .serializers import PromocodeSerializer
from .fabric import IsAdministrator, CustomPagination
from rest_framework.exceptions import ValidationError
from .utils import *
from drf_spectacular.utils import extend_schema,OpenApiExample,OpenApiResponse,OpenApiParameter,OpenApiTypes



class PromocodeCreateAPIView(BaseAPIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication] 
    
    @extend_schema(
        tags=["Promocode"],
        summary="Create Promocode",
        description="Create a new promocode (Admin only)",
        request=PromocodeSerializer,
        responses={
            200: OpenApiResponse(description="Promocode created successfully"),
            400: OpenApiResponse(description="Validation error"),
            401: OpenApiResponse(description="Unauthorized"),
            500: OpenApiResponse(description="Internal server error"),
        },
    )

    def post(self, request):
        try:
            serializer = PromocodeSerializer(
                data=request.data,
                context={"request": request}
            )

            if serializer.is_valid():
                promocode = serializer.save()
                data = serializer.data

                # FIX IMAGE ABSOLUTE URL
                if data.get("promocodeImage"):
                    data["promocodeImage"] = request.build_absolute_uri(
                        data["promocodeImage"]
                    )

                return self.success_response(
                    "Promocode created successfully",
                    data
                )

            return self.error_response(serializer.errors)

        except ValidationError as e:
            # Handles serializer / DRF validation errors
            return self.error_response(e.detail)

        except Exception as e:
            # Handles any unexpected runtime error
            return self.error_response(
                f"Internal server error: {str(e)}",
                status_code=500
            )

    # ADD THIS METHOD (FIX)
    def error_response(self, error, status_code=400):
        return Response({
            "status": False,
            "statusCode": status_code,
            "message": "Validation failed.",
            "error": error
        }, status=status_code)





class PromocodeListAPIView(BaseAPIView):
    # permission_classes = [AllowAny]
    authentication_classes = []
    permission_classes = []

    
    @extend_schema(
        tags=["Promocode"],
        summary="List Promocodes",
        description="Get paginated list of promocodes with search and filters",
        parameters=[
            OpenApiParameter(
                name="search",
                description="Search by promocode name, description, or slug",
                required=False,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="status",
                description="Filter by status: active, inactive, expired",
                required=False,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                enum=["active", "inactive", "expired"],
            ),
            OpenApiParameter(
                name="type",
                description="Filter by promocode type: discount/percentage, fix_price/fixed",
                required=False,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                enum=["discount", "fix_price", "percentage", "fixed"],
            ),
            OpenApiParameter(
                name="customertype",
                description="Filter by customer eligibility: all, first_purchase, repeat_customer",
                required=False,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                enum=["all", "first_purchase", "repeat_customer"],
            ),
            OpenApiParameter(
                name="customer_eligibility",
                description="Alias for customertype filter",
                required=False,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                enum=["all", "first_purchase", "repeat_customer"],
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
            200: OpenApiResponse(description="Promocode list fetched"),
            500: OpenApiResponse(description="Internal server error"),
        },
        auth=[],  # public
    )

    def get(self, request):
        try:
            search_query = request.query_params.get("search", "").strip()
            status_filter = request.query_params.get("status", "").strip().lower()
            type_filter = request.query_params.get("type", "").strip().lower()
            customer_type_filter = (
                request.query_params.get("customertype")
                or request.query_params.get("customer_type")
                or request.query_params.get("customer_eligibility")
                or request.query_params.get("eligibility")
                or ""
            ).strip().lower()

            queryset = Promocode.objects.filter(isDeleted=False)

            # -------------------------
            # Search
            # -------------------------
            if search_query:
                queryset = queryset.filter(
                    Q(promocodeName__icontains=search_query)
                    | Q(description__icontains=search_query)
                    | Q(slug__icontains=search_query)
                )

            # -------------------------
            # Status Filter
            # -------------------------
            now = timezone.now()

            if status_filter in ["active", "true", "1"]:
                queryset = queryset.filter(
                    isActive=True
                ).filter(
                    Q(started_at__isnull=True) | Q(started_at__lte=now)
                ).filter(
                    Q(ended_at__isnull=True) | Q(ended_at__gte=now)
                )

            elif status_filter in ["inactive", "false", "0"]:
                queryset = queryset.filter(
                    isActive=False
                ).filter(
                    Q(ended_at__isnull=True) | Q(ended_at__gte=now)
                )

            elif status_filter == "expired":
                queryset = queryset.filter(
                    ended_at__isnull=False,
                    ended_at__lt=now,
                )

            # -------------------------
            # Promocode Type Filter
            # -------------------------
            if type_filter in ["percentage", "discount"]:
                queryset = queryset.filter(promocodeType="discount")

            elif type_filter in ["fixed", "fix_price", "fixed_price", "fixprice"]:
                queryset = queryset.filter(promocodeType="fix_price")

            # -------------------------
            # Customer Type / Eligibility Filter
            # -------------------------
            if customer_type_filter in [
                "first_purchase",
                "first-purchase",
                "firstpurchase",
                "new",
            ]:
                queryset = queryset.filter(
                    Q(customer_eligibility="first_purchase")
                    | Q(description__icontains="[Eligibility: first_purchase]")
                )

            elif customer_type_filter in [
                "repeat_customer",
                "repeat-customer",
                "repeatcustomer",
                "repeat",
                "returning",
            ]:
                queryset = queryset.filter(
                    Q(customer_eligibility="repeat_customer")
                    | Q(description__icontains="[Eligibility: repeat_customer]")
                )

            elif customer_type_filter in [
                "all",
                "all_customers",
                "all-customers",
                "general",
            ]:
                queryset = queryset.filter(
                    Q(customer_eligibility="all")
                    | (
                        (
                            Q(customer_eligibility__isnull=True)
                            | Q(customer_eligibility="")
                        )
                        & ~Q(description__icontains="[Eligibility: first_purchase]")
                        & ~Q(description__icontains="[Eligibility: repeat_customer]")
                    )
                )

            queryset = queryset.order_by("-id")

            paginator = CustomPagination()
            page = paginator.paginate_queryset(queryset, request)

            serializer = PromocodeSerializer(
                page,
                many=True,
                context={"request": request}
            )

            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Promocode list fetched",
                "data": serializer.data,
                "pagination": {
                    "page": paginator.page.number,
                    "page_size": paginator.get_page_size(request),
                    "total_pages": paginator.page.paginator.num_pages,
                    "total_items": paginator.page.paginator.count,
                },
            }

            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            return self.error_response(f"Internal server error: {str(e)}")






class PromocodeDetailAPIView(BaseAPIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Promocode"],
        summary="Get Promocode Detail",
        description="Retrieve promocode details by ID",
        responses={
            200: OpenApiResponse(description="Promocode detail fetched"),
            404: OpenApiResponse(description="Promocode not found"),
            500: OpenApiResponse(description="Internal server error"),
        },
        auth=[],  # public
    )

    def get(self, request, pk):
        try:
            promocode = Promocode.objects.get(
                pk=pk,
                isDeleted=False
            )

            serializer = PromocodeSerializer(
                promocode,
                context={"request": request}
            )

            return self.success_response(
                "Promocode detail fetched",
                serializer.data
            )

        except Promocode.DoesNotExist:
            return self.error_response(
                "Promocode not found."
            )

        except Exception as e:
            return self.error_response(f"Internal server error: {str(e)}")




class PromocodeUpdateAPIView(BaseAPIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]
    
    
    @extend_schema(
        tags=["Promocode"],
        summary="Update Promocode",
        description="Update promocode details (Admin only)",
        request=PromocodeSerializer,
        responses={
            200: OpenApiResponse(description="Promocode updated successfully"),
            400: OpenApiResponse(description="Validation error"),
            404: OpenApiResponse(description="Promocode not found"),
            401: OpenApiResponse(description="Unauthorized"),
            500: OpenApiResponse(description="Internal server error"),
        },
    )

    def put(self, request, pk):
        try:
            promocode = Promocode.objects.get(
                pk=pk,
                isDeleted=False
            )

            serializer = PromocodeSerializer(
                promocode,
                data=request.data,
                partial=True,
                context={"request": request}
            )

            if serializer.is_valid():
                serializer.save()
                return self.success_response(
                    "Promocode updated successfully",
                    serializer.data
                )

            return self.error_response(serializer.errors)

        except Promocode.DoesNotExist:
            return self.error_response(
                "Promocode not found."
            )

        except Exception as e:
            return self.error_response(f"Internal server error: {str(e)}")



class PromocodeDeleteAPIView(BaseAPIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]


    @extend_schema(
        tags=["Promocode"],
        summary="Delete Promocode",
        description="Soft delete promocode (Admin only)",
        responses={
            200: OpenApiResponse(description="Promocode deleted successfully"),
            404: OpenApiResponse(description="Promocode not found"),
            401: OpenApiResponse(description="Unauthorized"),
            500: OpenApiResponse(description="Internal server error"),
        },
    )
    def delete(self, request, pk):
        try:
            promocode = Promocode.objects.get(
                pk=pk,
                isDeleted=False
            )

            promocode.isDeleted = True
            promocode.isActive = False
            promocode.save()

            return self.success_response(
                "Promocode deleted successfully"
            )

        except Promocode.DoesNotExist:
            return self.error_response(
                "Promocode not found."
            )

        except Exception as e:
            return self.error_response(f"Internal server error: {str(e)}")
