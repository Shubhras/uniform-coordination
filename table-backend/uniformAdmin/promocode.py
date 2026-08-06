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
    permission_classes = [AllowAny]
    
    @extend_schema(
        tags=["Promocode"],
        summary="List Promocodes",
        description="Get paginated list of promocodes",
        parameters=[
            OpenApiParameter(
                name="search",
                description="Search by promocode name",
                required=False,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
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

            queryset = Promocode.objects.filter(isDeleted=False)

            if search_query:
                queryset = queryset.filter(
                    Q(promocodeName__icontains=search_query)
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



class ValidatePromocodeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        promocode = request.data.get("promocode")

        if not promocode:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Promocode is required."
            }, status=status.HTTP_400_BAD_REQUEST)

        # coupon = Promocode.objects.filter(
        #     promocodeName__iexact=promocode.strip(),
        #     isDeleted=False
        # ).first()
        
        # coupon = Promocode.objects.filter(
        #     promocodeName__exact=promocode.strip(),
        #     isDeleted=False
        # ).first()
        coupon = Promocode.objects.extra(
            where=["BINARY promocodeName = %s"],
            params=[promocode.strip()]
        ).filter(
            isDeleted=False
        ).first()

        if not coupon:
            return Response({
                "status": False,
                "statusCode": 200,
                "message": "Invalid promocode."
            }, status=status.HTTP_200_OK)

        if not coupon.isActive:
            return Response({
                "status": False,
                "statusCode": 200,
                "message": "This promocode is inactive."
            }, status=status.HTTP_200_OK)

        now = timezone.now()

        if coupon.started_at and coupon.started_at > now:
            return Response({
                "status": False,
                "statusCode": 200,
                "message": "This promocode is not active yet."
            }, status=status.HTTP_200_OK)

        if coupon.ended_at and coupon.ended_at < now:
            return Response({
                "status": False,
                "statusCode": 200,
                "message": "This promocode has expired."
            }, status=status.HTTP_200_OK)

        if coupon.limit_uses:
            used_count = Order.objects.filter(
                promocode=coupon
            ).count()

            if coupon.max_uses and used_count >= coupon.max_uses:
                return Response({
                    "status": False,
                    "statusCode": 200,
                    "message": "This promocode has reached its usage limit."
                }, status=status.HTTP_200_OK)

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Promocode is varified succesfully.",
            "data": {
                "id": coupon.id,
                "promocode": coupon.promocodeName,
                "type": coupon.promocodeType,
                "amount": coupon.amount,
                "min_order_value": coupon.min_order_value,
                "started_at": coupon.started_at,
                "ended_at": coupon.ended_at,
                "max_uses": coupon.max_uses,
                "remaining_uses": (
                    coupon.max_uses - used_count
                    if coupon.limit_uses and coupon.max_uses
                    else None
                )
            }
        }, status=status.HTTP_200_OK)
        