from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
import calendar
from datetime import datetime

from .fabric import IsAdministrator
from .models import Product, CleaningItem, DamagedItem
from userhub.models import Order, OrderItem, Rental, RentalItem, Users

def get_months_ago_range(base_date, months_ago):
    year = base_date.year
    month = base_date.month - months_ago
    while month <= 0:
        month += 12
        year -= 1
    last_day = calendar.monthrange(year, month)[1]
    # We return the end of that month to count cumulative customers up to that point
    last_datetime = timezone.make_aware(datetime(year, month, last_day, 23, 59, 59, 999999))
    return last_datetime

class ReportsAnalyticsAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            # Query parameters
            product_type = request.query_params.get('type')  # 'uniform' or 'table'
            start_date_str = request.query_params.get('start_date')
            end_date_str = request.query_params.get('end_date')

            # ---------------------------------------------------------
            # 1. Base Querysets & Filters
            # ---------------------------------------------------------
            orders_qs = Order.objects.filter(is_deleted=False).exclude(status='cancelled')
            rentals_qs = Rental.objects.filter(isDeleted=False)
            products_qs = Product.objects.filter(isDeleted=False, isActive=True)
            users_qs = Users.objects.filter(isDeleted=False).exclude(role__role_name__in=['admin', 'sales_rep'])
            order_items_qs = OrderItem.objects.filter(order__is_deleted=False).exclude(order__status='cancelled')
            
            rented_items_qs = RentalItem.objects.filter(
                rental__status__in=['rented', 'late', 'partial_return'],
                rental__isDeleted=False,
                isDeleted=False
            )
            maintenance_qs = CleaningItem.objects.filter(status='cleaning')
            damaged_qs = DamagedItem.objects.filter(status__in=['pending', 'repair'])

            # Product Type Filter ('uniform' or 'table')
            if product_type in ['uniform', 'table']:
                orders_qs = orders_qs.filter(order_type=product_type)
                rentals_qs = rentals_qs.filter(order__order_type=product_type)
                products_qs = products_qs.filter(productType=product_type)
                users_qs = users_qs.filter(userType=product_type)
                order_items_qs = order_items_qs.filter(product__productType=product_type)
                rented_items_qs = rented_items_qs.filter(product__productType=product_type)
                maintenance_qs = maintenance_qs.filter(product__productType=product_type)
                damaged_qs = damaged_qs.filter(product__productType=product_type)

            # Date Range Filters (Only apply to date-based historical metrics)
            is_date_filtered = False
            if start_date_str and end_date_str:
                try:
                    start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                    end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                    orders_qs = orders_qs.filter(created_at__date__range=[start_date, end_date])
                    order_items_qs = order_items_qs.filter(order__created_at__date__range=[start_date, end_date])
                    users_qs = users_qs.filter(createdAt__date__range=[start_date, end_date])
                    rentals_qs = rentals_qs.filter(start_date__lte=end_date, end_date__gte=start_date)
                    is_date_filtered = True
                except ValueError:
                    return Response({
                        "status": False,
                        "statusCode": 400,
                        "message": "Invalid date format. Use YYYY-MM-DD."
                    }, status=status.HTTP_400_BAD_REQUEST)

            # ---------------------------------------------------------
            # 2. KPI Metrics Calculations
            # ---------------------------------------------------------
            total_revenue = orders_qs.aggregate(total=Sum('total_amount'))['total'] or 0.0
            total_orders = orders_qs.count()
            active_rentals = rentals_qs.filter(status__in=['rented', 'late', 'partial_return']).count()
            inventory_items = products_qs.aggregate(total=Sum('total_quantity'))['total'] or 0

            # Late Returns count
            today_date = timezone.now().date()
            late_returns = rentals_qs.filter(
                Q(status='late') | Q(status='rented', end_date__lt=today_date)
            ).count()

            total_customers = users_qs.count()

            # ---------------------------------------------------------
            # 3. Chart Datasets
            # ---------------------------------------------------------

            # A. Customer Growth - Cumulative
            customer_growth = []
            if is_date_filtered:
                months_list = []
                current_date = start_date.replace(day=1)
                while current_date <= end_date:
                    months_list.append(current_date)
                    if current_date.month == 12:
                        current_date = current_date.replace(year=current_date.year + 1, month=1)
                    else:
                        current_date = current_date.replace(month=current_date.month + 1)
                
                if len(months_list) > 12:
                    months_list = months_list[-12:]
                
                for m in months_list:
                    last_day = calendar.monthrange(m.year, m.month)[1]
                    month_end_dt = timezone.make_aware(datetime(m.year, m.month, last_day, 23, 59, 59, 999999))
                    base_users = Users.objects.filter(isDeleted=False).exclude(role__role_name__in=['admin', 'sales_rep'])
                    if product_type in ['uniform', 'table']:
                        base_users = base_users.filter(userType=product_type)
                    
                    growth_count = base_users.filter(createdAt__lte=month_end_dt).count()
                    customer_growth.append({
                        "label": month_end_dt.strftime("%b"),
                        "value": growth_count
                    })
            else:
                base_now = timezone.now()
                for i in range(5, -1, -1):
                    month_end_dt = get_months_ago_range(base_now, i)
                    base_users = Users.objects.filter(isDeleted=False).exclude(role__role_name__in=['admin', 'sales_rep'])
                    if product_type in ['uniform', 'table']:
                        base_users = base_users.filter(userType=product_type)
                    
                    growth_count = base_users.filter(createdAt__lte=month_end_dt).count()
                    customer_growth.append({
                        "label": month_end_dt.strftime("%b"),
                        "value": growth_count
                    })

            # B. Customer Segments
            b2b_cust = users_qs.filter(role__role_name='b2b_user').count()
            b2c_cust = total_customers - b2b_cust

            b2b_pct = round((b2b_cust / total_customers * 100), 1) if total_customers > 0 else 0.0
            b2c_pct = round((b2c_cust / total_customers * 100), 1) if total_customers > 0 else 0.0

            customer_segments = [
                {"label": "B2B", "count": b2b_cust, "percentage": b2b_pct},
                {"label": "B2C", "count": b2c_cust, "percentage": b2c_pct}
            ]

            # C. Top Rented Categories
            top_cats = (
                order_items_qs.values('product__category__categoryName')
                .annotate(total_rented=Sum('quantity'))
                .order_by('-total_rented')[:5]
            )
            top_rented_categories = [
                {
                    "category": cat['product__category__categoryName'] or "Uncategorized",
                    "count": cat['total_rented'] or 0
                }
                for cat in top_cats
            ]

            # D. Inventory Status Donut Chart
            available_qty = products_qs.aggregate(total=Sum('available_quantity'))['total'] or 0
            rented_qty = rented_items_qs.annotate(outstanding=F('quantity') - F('returned_quantity')).aggregate(total=Sum('outstanding'))['total'] or 0
            maintenance_qty = maintenance_qs.aggregate(total=Sum('quantity'))['total'] or 0
            damaged_qty = damaged_qs.aggregate(total=Sum('quantity'))['total'] or 0

            total_inv_status = available_qty + rented_qty + maintenance_qty + damaged_qty
            def get_pct(val):
                return round((val / total_inv_status * 100), 1) if total_inv_status > 0 else 0.0

            inventory_status = [
                {"label": "Available", "count": available_qty, "percentage": get_pct(available_qty)},
                {"label": "Rented", "count": rented_qty, "percentage": get_pct(rented_qty)},
                {"label": "Maintenance", "count": maintenance_qty, "percentage": get_pct(maintenance_qty)},
                {"label": "Damaged", "count": damaged_qty, "percentage": get_pct(damaged_qty)}
            ]

            # ---------------------------------------------------------
            # 4. Return Response
            # ---------------------------------------------------------
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Reports and analytics fetched successfully.",
                "data": {
                    "kpi": {
                        "total_revenue": float(total_revenue),
                        "total_orders": total_orders,
                        "active_rentals": active_rentals,
                        "inventory_items": inventory_items,
                        "late_returns": late_returns,
                        "total_customers": total_customers
                    },
                    "customer_growth": customer_growth,
                    "customer_segments": customer_segments,
                    "top_rented_categories": top_rented_categories,
                    "inventory_status": inventory_status
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Something went wrong on the server.",
                "error": str(e),
                "trace": traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
