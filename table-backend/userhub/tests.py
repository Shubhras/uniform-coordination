from datetime import date, timedelta
from decimal import Decimal
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from userhub.models import Users, Cart, CartItem, Order, Rental, RentalItem, CustomerDetails
from uniformAdmin.models import Product, Role, SpecialCondition, Category
from django.conf import settings

class KireizSpaceBusinessLogicTestCase(APITestCase):

    def setUp(self):
        # Create categories and roles
        self.category = Category.objects.create(categoryName="Tablecloths", type="table")
        self.napkin_category = Category.objects.create(categoryName="Napkins", type="table")
        
        self.corporate_role = Role.objects.create(role_name="corporate")
        self.customer_role = Role.objects.create(role_name="customer")

        # Create B2B special condition
        self.special_condition = SpecialCondition.objects.create(
            title="Corporate Discount",
            condition_type="corporate",
            discount_percentage=15.00,
            is_active=True,
            is_deleted=False
        )

        # Create B2C and B2B users
        self.b2c_user = Users(
            email="b2c@example.com",
            userType="table",
            role=self.customer_role
        )
        self.b2c_user.set_password("password123")
        self.b2c_user.is_verify = True
        self.b2c_user.save()

        self.b2b_user = Users(
            email="b2b@example.com",
            userType="table",
            role=self.corporate_role
        )
        self.b2b_user.set_password("password123")
        self.b2b_user.is_verify = True
        self.b2b_user.save()

        # Create Products
        self.tablecloth = Product.objects.create(
            productName="Luxury Tablecloth",
            productType="table",
            type="tablecloth",
            category=self.category,
            price=Decimal("100.00"),
            available_quantity=50
        )
        self.napkin = Product.objects.create(
            productName="Silk Napkin",
            productType="table",
            type="napkin",
            category=self.napkin_category,
            price=Decimal("10.00"),
            available_quantity=200
        )

    def test_b2c_order_checkout_pricing_and_tax(self):
        """
        Verify B2C order checkout:
        - Subtotal: 1 tablecloth * 100 * 2 days = 200
        - Promo / B2B discount: 0
        - Shipping: 1500
        - Taxable amount: 200 - 0 + 1500 = 1700
        - Tax (10%): 170
        - Total: 1700 + 170 = 1870
        """
        self.client.force_authenticate(user=self.b2c_user)
        cart = Cart.objects.create(user=self.b2c_user)
        CartItem.objects.create(cart=cart, product=self.tablecloth, quantity=1, price=Decimal("100.00"), total_price=Decimal("100.00"))

        today = timezone.now().date()
        payload = {
            "cart_id": cart.id,
            "rental_start_date": today.strftime("%Y-%m-%d"),
            "rental_end_date": (today + timedelta(days=1)).strftime("%Y-%m-%d"),
            "customer": {
                "email": "b2c_customer@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "phone": "09012345678"
            },
            "delivery_address": {
                "address_line_1": "1-2-3 Roppongi",
                "city": "Minato-ku",
                "postal_code": "106-0032",
                "country": "Japan"
            }
        }

        response = self.client.post("/api/v1/space/userhub/create/order/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        order = Order.objects.get(order_id=response.data["data"]["order_id"])
        self.assertEqual(order.subtotal, Decimal("200.00"))
        self.assertEqual(order.shipping_charge, Decimal("1500.00"))
        self.assertEqual(order.tax, Decimal("170.00"))
        self.assertEqual(order.total_amount, Decimal("1870.00"))

    def test_b2b_order_checkout_with_corporate_discount(self):
        """
        Verify B2B corporate order checkout:
        - Subtotal: 1 tablecloth * 100 * 2 days = 200
        - B2B Discount (15%): 30
        - Shipping: 1500
        - Taxable amount: 200 - 30 + 1500 = 1670
        - Tax (10%): 167
        - Total: 1670 + 167 = 1837
        """
        self.client.force_authenticate(user=self.b2b_user)
        cart = Cart.objects.create(user=self.b2b_user)
        CartItem.objects.create(cart=cart, product=self.tablecloth, quantity=1, price=Decimal("100.00"), total_price=Decimal("100.00"))

        today = timezone.now().date()
        payload = {
            "cart_id": cart.id,
            "rental_start_date": today.strftime("%Y-%m-%d"),
            "rental_end_date": (today + timedelta(days=1)).strftime("%Y-%m-%d"),
            "customer": {
                "email": "b2b_corp@example.com",
                "first_name": "Corp",
                "last_name": "Client",
                "phone": "0312345678"
            },
            "delivery_address": {
                "address_line_1": "4-5-6 Shibuya",
                "city": "Shibuya-ku",
                "postal_code": "150-0002",
                "country": "Japan"
            }
        }

        response = self.client.post("/api/v1/space/userhub/create/order/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        order = Order.objects.get(order_id=response.data["data"]["order_id"])
        self.assertEqual(order.subtotal, Decimal("200.00"))
        self.assertEqual(order.shipping_charge, Decimal("1500.00"))
        self.assertEqual(order.tax, Decimal("167.00"))
        self.assertEqual(order.total_amount, Decimal("1837.00"))

    def test_cancellation_cutoff_rule(self):
        """
        Verify order cancellation cutoff:
        - Cancellation is blocked if rental start date is less than 5 days away.
        - Cancellation is permitted if start date is 5 or more days away.
        """
        self.client.force_authenticate(user=self.b2c_user)
        customer = CustomerDetails.objects.create(user=self.b2c_user, email="test@example.com")
        
        # Scenario 1: Block cancellation (rental starts in 4 days)
        order_near = Order.objects.create(
            user=self.b2c_user,
            customer=customer,
            rental_start_date=timezone.now().date() + timedelta(days=4),
            rental_end_date=timezone.now().date() + timedelta(days=6),
            subtotal=Decimal("100.00"),
            total_amount=Decimal("120.00")
        )
        cancel_url_near = f"/api/v1/space/userhub/order/{order_near.order_id}/cancel/"
        response = self.client.post(cancel_url_near, {"reason": "Change of plans"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Cancellations are only permitted up to 5 days", response.data["message"])

        # Scenario 2: Allow cancellation (rental starts in 5 days)
        order_far = Order.objects.create(
            user=self.b2c_user,
            customer=customer,
            rental_start_date=timezone.now().date() + timedelta(days=5),
            rental_end_date=timezone.now().date() + timedelta(days=7),
            subtotal=Decimal("100.00"),
            total_amount=Decimal("120.00")
        )
        cancel_url_far = f"/api/v1/space/userhub/order/{order_far.order_id}/cancel/"
        response = self.client.post(cancel_url_far, {"reason": "Change of plans"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        order_far.refresh_from_db()
        self.assertEqual(order_far.status, "cancelled")

    def test_grace_period_and_late_fee_calculation(self):
        """
        Verify late returns under grace period rules:
        - 3 days or less: no late fee.
        - 4 days: 4 - 3 = 1 late day fee.
        """
        self.client.force_authenticate(user=self.b2c_user)
        customer = CustomerDetails.objects.create(user=self.b2c_user, email="test@example.com")
        order = Order.objects.create(
            user=self.b2c_user,
            customer=customer,
            rental_start_date=timezone.now().date() - timedelta(days=10),
            rental_end_date=timezone.now().date() - timedelta(days=4), # 4 days overdue
            subtotal=Decimal("200.00"),
            total_amount=Decimal("250.00")
        )
        
        rental = Rental.objects.create(
            order=order,
            customer=customer,
            start_date=order.rental_start_date,
            end_date=order.rental_end_date,
            total_amount=order.total_amount,
            status="rented"
        )
        rental_item = RentalItem.objects.create(
            rental=rental,
            product=self.tablecloth,
            quantity=2,
            price_per_day=Decimal("10.00"),
            subtotal=Decimal("20.00")
        )

        # We return 2 tablecloths on day 4 overdue.
        # Since 4 days overdue, late_days = 4 - 3 = 1.
        # Late fee = 10.00 (price_per_day) * 1 (late day) * 2 (quantity) = 20.00.
        payload = {
            "order_id": order.order_id,
            "items": [
                {
                    "product_id": self.tablecloth.id,
                    "quantity": 2,
                    "rfid_tag": "RFID-12345"
                }
            ]
        }
        
        response = self.client.post("/api/v1/space/userhub/order/return/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["late_fee"], 20.00)
        self.assertEqual(response.data["lost_fee"], 0.0)
        self.assertEqual(response.data["final_total_amount"], 270.00)
