from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from uniformAdmin.models import AdminUser, Role, Product, CleaningItem, DamagedItem
from userhub.models import Users, Order, OrderItem, Rental, RentalItem, CustomerDetails

class ReportsAnalyticsAPITestCase(APITestCase):

    def setUp(self):
        # Create roles
        self.admin_role = Role.objects.create(role_name="admin")
        self.customer_role = Role.objects.create(role_name="customer")

        # Create admin user
        self.admin_user = AdminUser.objects.create(
            name="Admin User",
            email="admin@example.com",
            role=self.admin_role,
            is_staff=True,
            is_superuser=True
        )
        self.admin_user.set_password("adminpass")
        self.admin_user.save()

        # Create customer user
        self.customer = Users.objects.create(
            email="customer@example.com",
            role=self.customer_role,
            userType="table"
        )
        self.customer.set_password("custpass")
        self.customer.save()

        # Create customer details
        self.customer_details = CustomerDetails.objects.create(
            user=self.customer,
            first_name="Jane",
            last_name="Doe",
            email="customer@example.com",
            phone="123456789"
        )

        # Create products
        self.product_table = Product.objects.create(
            productName="Luxury Table Cloth",
            productType="table",
            price=Decimal("150.00"),
            total_quantity=100,
            available_quantity=80
        )
        self.product_uniform = Product.objects.create(
            productName="Chef Coat",
            productType="uniform",
            price=Decimal("300.00"),
            total_quantity=50,
            available_quantity=45
        )

        # Create order & items
        self.order = Order.objects.create(
            user=self.customer,
            customer=self.customer_details,
            total_amount=Decimal("1200.00"),
            order_type="table",
            status="delivered"
        )
        self.order_item = OrderItem.objects.create(
            order=self.order,
            product=self.product_table,
            quantity=5,
            rental_days=2,
            price_per_day=Decimal("150.00")
        )

        # Create active rentals
        self.rental = Rental.objects.create(
            order=self.order,
            customer=self.customer_details,
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timedelta(days=2),
            status="rented",
            total_amount=Decimal("1200.00")
        )
        self.rental_item = RentalItem.objects.create(
            rental=self.rental,
            product=self.product_table,
            quantity=5,
            price_per_day=Decimal("150.00")
        )

        # Create damaged & cleaning items
        self.cleaning = CleaningItem.objects.create(
            product=self.product_table,
            quantity=2,
            status="cleaning"
        )
        self.damaged = DamagedItem.objects.create(
            product=self.product_uniform,
            quantity=1,
            status="pending"
        )

        self.url = reverse('reports-analytics')

    def test_anonymous_user_denied(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_user_success(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify JSON schema keys
        data = response.data
        self.assertTrue(data["status"])
        self.assertEqual(data["statusCode"], 200)
        self.assertIn("data", data)
        
        inner_data = data["data"]
        self.assertIn("kpi", inner_data)
        self.assertIn("customer_growth", inner_data)
        self.assertIn("customer_segments", inner_data)
        self.assertIn("top_rented_categories", inner_data)
        self.assertIn("inventory_status", inner_data)

        # Verify values
        kpis = inner_data["kpi"]
        self.assertEqual(kpis["total_revenue"], 1200.00)
        self.assertEqual(kpis["total_orders"], 1)
        self.assertEqual(kpis["active_rentals"], 1)
        self.assertEqual(kpis["inventory_items"], 150)
        self.assertEqual(kpis["total_customers"], 1)

    def test_product_type_filtering(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Table filter
        response_table = self.client.get(self.url, {"type": "table"})
        self.assertEqual(response_table.status_code, status.HTTP_200_OK)
        kpi_table = response_table.data["data"]["kpi"]
        self.assertEqual(kpi_table["total_revenue"], 1200.0)
        self.assertEqual(kpi_table["inventory_items"], 100) # Only Luxury Table Cloth
        
        # Uniform filter
        response_uniform = self.client.get(self.url, {"type": "uniform"})
        self.assertEqual(response_uniform.status_code, status.HTTP_200_OK)
        kpi_uniform = response_uniform.data["data"]["kpi"]
        self.assertEqual(kpi_uniform["total_revenue"], 0.0)
        self.assertEqual(kpi_uniform["inventory_items"], 50) # Only Chef Coat

    def test_date_range_filtering(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Filter for a date range when no activity occurred (e.g. 2026-01-01 to 2026-02-28)
        response = self.client.get(self.url, {
            "start_date": "2026-01-01",
            "end_date": "2026-02-28"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        kpis = response.data["data"]["kpi"]
        self.assertEqual(kpis["total_revenue"], 0.0)
        self.assertEqual(kpis["total_orders"], 0)
        self.assertEqual(kpis["total_customers"], 0)
        self.assertEqual(kpis["active_rentals"], 0)
        self.assertEqual(kpis["inventory_items"], 0)
        
        # Customer growth labels should match the date range months (Jan, Feb)
        growth = response.data["data"]["customer_growth"]
        labels = [g["label"] for g in growth]
        self.assertEqual(labels, ["Jan", "Feb"])
        for g in growth:
            self.assertEqual(g["value"], 0)

