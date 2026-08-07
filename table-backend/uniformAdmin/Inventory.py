from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils.timezone import now
from drf_spectacular.utils import extend_schema
from .models import InspectionItem, DamagedItem, CleaningItem, DamagePhoto, Product
from .serializers import InspectionItemSerializer, DamagedItemSerializer, CleaningItemSerializer,RentalItemSerializer,RentalListSerializer
from drf_spectacular.utils import extend_schema,OpenApiExample,OpenApiResponse,OpenApiParameter,OpenApiTypes
from userhub.models import Rental,RentalItem
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
class CustomPagination(PageNumberPagination):
    """Custom Pagination for Professional Users"""
    page_size = 10  # Number of results per page
    page_size_query_param = "page_size"
    max_page_size = 100  # Set a reasonable limit

# ==========================================
# INVENTORY WORKFLOW APIS
# ==========================================

# class AdminInspectionQueueListAPIView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     @extend_schema(tags=["Inventory Management"], summary="List Inspection Queue")
#     def get(self, request):
#         inspections = InspectionItem.objects.filter(result="pending").order_by("-inspected_at")
#         serializer = InspectionItemSerializer(inspections, many=True)
#         return Response({
#             "status": True,
#             "statusCode": 200,
#             "message": "Fetched inspection queue",
#             "data": serializer.data
#         })

from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter


class AdminInspectionQueueListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Inventory Management"],
        summary="List Inspection Queue",
        parameters=[
            OpenApiParameter(name="search", description="Search by item/product name", required=False, type=str),
            OpenApiParameter(name="page", description="Page number", required=False, type=int),
            OpenApiParameter(name="page_size", description="Items per page", required=False, type=int),
        ]
    )
    def get(self, request):
        inspections = (
            InspectionItem.objects
            .filter(result="pending")
            .select_related("rental_item__product__category", "order")
            .order_by("-inspected_at")
        )

        search = request.query_params.get("search")
        if search:
            inspections = inspections.filter(
                Q(rental_item__product__productName__icontains=search) |
                Q(rental_item__product__category__categoryName__icontains=search)
            )

        try:
            page_number = int(request.query_params.get("page", 1))
            page_size = int(request.query_params.get("page_size", 10))
        except ValueError:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Invalid page or page_size",
                "data": []
            }, status=400)

        paginator = Paginator(inspections, page_size)

        try:
            page_obj = paginator.page(page_number)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages) if paginator.num_pages else []

        serializer = InspectionItemSerializer(page_obj, many=True)

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Fetched inspection queue",
            "data": serializer.data,
            "pagination": {
                "count": paginator.count,
                "total_pages": paginator.num_pages,
                "current_page": page_number,
                "page_size": page_size,
                "has_next": getattr(page_obj, "has_next", lambda: False)(),
                "has_previous": getattr(page_obj, "has_previous", lambda: False)(),
            }
        })
        
class AdminProcessInspectionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Inventory Management"], summary="Process Inspection")
    def post(self, request, pk):
        try:
            inspection = InspectionItem.objects.get(pk=pk, result="pending")
        except InspectionItem.DoesNotExist:
            return Response({"status": False, "message": "Pending inspection not found"}, status=404)
            
        good_qty = int(request.data.get("good_qty", 0))
        damaged_qty = int(request.data.get("damaged_qty", 0))
        notes = request.data.get("notes", "")
        
        if good_qty + damaged_qty != inspection.returned_qty:
            return Response({"status": False, "message": "Good + Damaged quantity must equal Returned quantity"}, status=400)
            
        with transaction.atomic():
            inspection.good_qty = good_qty
            inspection.damaged_qty = damaged_qty
            inspection.notes = notes
            inspection.inspected_by = request.user if hasattr(request.user, 'role') else None
            
            # Find the product. Assume rental_item or order has it.
            # For simplicity, assuming rental_item links to product directly
            product = None
            if inspection.rental_item:
                product = inspection.rental_item.product
                
            if damaged_qty == 0:
                inspection.result = "pass"
            else:
                inspection.result = "fail"
                if product:
                    DamagedItem.objects.create(
                        product=product,
                        source_inspection=inspection,
                        quantity=damaged_qty,
                        reason=notes,
                        status="pending"
                    )
            
            inspection.save()
            
            # Return good items to available stock
            if good_qty > 0 and product:
                product.available_quantity += good_qty
                product.save()
                
            # Handle photo uploads (assuming multipart/form-data with 'photos' field)
            photos = request.FILES.getlist('photos')
            for photo in photos:
                DamagePhoto.objects.create(inspection=inspection, photo=photo)

        return Response({"status": True, "message": f"Inspection marked as {inspection.result}"})


class AdminDamagedItemListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Inventory Management"], summary="List Damaged Items")
    def get(self, request):
        items = DamagedItem.objects.exclude(status="moved").order_by("-reported_at")
        serializer = DamagedItemSerializer(items, many=True)
        return Response({"status": True, "data": serializer.data})

class AdminUpdateDamagedItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Inventory Management"], summary="Update Damaged Item Status")
    def patch(self, request, pk):
        try:
            item = DamagedItem.objects.get(pk=pk)
        except DamagedItem.DoesNotExist:
            return Response({"status": False, "message": "Not found"}, status=404)
            
        new_status = request.data.get("status")
        if new_status not in dict(DamagedItem.STATUS_CHOICES):
            return Response({"status": False, "message": "Invalid status"}, status=400)
            
        with transaction.atomic():
            if new_status == "moved" and item.status != "moved":
                item.resolved_at = now()
                # Return to available stock
                product = item.product
                product.available_quantity += item.quantity
                product.save()
                
            item.status = new_status
            item.save()
            
        return Response({"status": True, "message": "Damaged item updated"})


class AdminCleaningItemListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Inventory Management"], summary="List Cleaning Items")
    def get(self, request):
        items = CleaningItem.objects.exclude(status="moved").order_by("-entered_at")
        serializer = CleaningItemSerializer(items, many=True)
        return Response({"status": True, "data": serializer.data})

class AdminCreateCleaningItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Inventory Management"], summary="Send Items to Cleaning")
    def post(self, request):
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 0))
        
        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({"status": False, "message": "Product not found"}, status=404)
            
        if quantity <= 0 or product.available_quantity < quantity:
            return Response({"status": False, "message": "Invalid quantity or insufficient stock"}, status=400)
            
        with transaction.atomic():
            product.available_quantity -= quantity
            product.save()
            
            CleaningItem.objects.create(
                product=product,
                quantity=quantity,
                status="cleaning"
            )
            
        return Response({"status": True, "message": f"Sent {quantity} items to cleaning"})


class AdminUpdateCleaningItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Inventory Management"], summary="Update Cleaning Item Status")
    def patch(self, request, pk):
        try:
            item = CleaningItem.objects.get(pk=pk)
        except CleaningItem.DoesNotExist:
            return Response({"status": False, "message": "Not found"}, status=404)
            
        new_status = request.data.get("status")
        if new_status not in dict(CleaningItem.STATUS_CHOICES):
            return Response({"status": False, "message": "Invalid status"}, status=400)
            
        with transaction.atomic():
            if new_status == "moved" and item.status != "moved":
                item.resolved_at = now()
                # Return to available stock
                product = item.product
                product.available_quantity += item.quantity
                product.save()
                
            item.status = new_status
            item.save()
            
        return Response({"status": True, "message": "Cleaning item updated"})



class RentalListAPIView(APIView):
    apermission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Rental"],
        summary="Rental List",
        description="""
        Get Rental List with Rental Items.

        Supports:

        • Search
        • Pagination
        • Rental Status filter
        • Order Status filter
        • Order ID filter
        • Rental ID filter
        """,
        parameters=[
            OpenApiParameter(
                name="search",
                type=OpenApiTypes.STR,
                description="Search by Rental ID, Order ID or Customer Name",
                required=False,
            ),
            OpenApiParameter(
                name="status",
                type=OpenApiTypes.STR,
                description="Rental Status",
                required=False,
            ),
            OpenApiParameter(
                name="order_status",
                type=OpenApiTypes.STR,
                description="Order Status",
                required=False,
            ),
            OpenApiParameter(
                name="order_id",
                type=OpenApiTypes.STR,
                description="Filter by Order ID",
                required=False,
            ),
            OpenApiParameter(
                name="rental_id",
                type=OpenApiTypes.STR,
                description="Filter by Rental ID",
                required=False,
            ),
            OpenApiParameter(
                name="page",
                type=OpenApiTypes.INT,
            ),
            OpenApiParameter(
                name="page_size",
                type=OpenApiTypes.INT,
            ),
        ],
    )
    def get(self, request):
        try:

            queryset = Rental.objects.filter(
                isDeleted=False
            ).select_related(
                "order",
                "customer"
            ).prefetch_related(
                "items__product"
            ).order_by("-created_at")

            search = request.GET.get("search")
            status_filter = request.GET.get("status")
            order_status = request.GET.get("order_status")
            order_id = request.GET.get("order_id")
            rental_id = request.GET.get("rental_id")

            if search:
                queryset = queryset.filter(
                    Q(rental_id__icontains=search) |
                    Q(order__order_id__icontains=search) 
                    # Q(customer__first_name__icontains=search) 
                    
                )

            if status_filter:
                queryset = queryset.filter(status=status_filter)

            if order_status:
                queryset = queryset.filter(
                    order__status=order_status
                )

            if order_id:
                queryset = queryset.filter(
                    order__order_id__icontains=order_id
                )

            if rental_id:
                queryset = queryset.filter(
                    rental_id__icontains=rental_id
                )

            paginator = CustomPagination()
            page = paginator.paginate_queryset(
                queryset,
                request
            )

            serializer = RentalListSerializer(
                page,
                many=True,
                context={"request": request}
            )

            return paginator.get_paginated_response(
                serializer.data
            )

        except Exception as e:
            return Response(
                {
                    "statusCode": 500,
                    "status": False,
                    "message": "Something went wrong.",
                    "error": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
            
            