from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated ,AllowAny
from django.db.models import Sum, Count
from decimal import Decimal
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Order,Payment 
from uniformAdmin.models import AdminUser
from .serializers import *
import stripe
import json
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
stripe.api_key = settings.STRIPE_SECRET_KEY


# pagination 
class CustomPagination(PageNumberPagination):
    """Custom Pagination for Professional Users"""
    page_size = 10  # Number of results per page
    page_size_query_param = "page_size"
    max_page_size = 100  # Set a reasonable limit

    def get_paginated_response(self, data):
        return Response({
            "count": self.page.paginator.count,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "data": data  
        })

# class CreatePaymentIntentAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         order_id = request.data.get("order_id")
#         currency = request.data.get("currency")

#         #  order_id missing
#         if not order_id:
#             return Response(
#                 {"error": "order_id is required"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         try:
#             order = Order.objects.get(order_id=order_id, user=request.user)
#         except Order.DoesNotExist:
#             return Response(
#                 {"error": "Order not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         #  already paid (final guard)
#         if Payment.objects.filter(order=order, payment_status="SUCCESS").exists():
#             return Response(
#                 {"error": "Payment already completed"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         #  Stripe allowed payment methods check
#         STRIPE_ALLOWED_METHODS = ["card", "upi", "bank_transfer"]

#         if not order.Payment_method:
#             return Response(
#                 {"error": "Payment method not selected for this order"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         payment_method_type = order.Payment_method.lower()

#         if payment_method_type not in STRIPE_ALLOWED_METHODS:
#             return Response(
#                 {"error": f"Payment method '{order.Payment_method}' is not supported by Stripe"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # prevent duplicate pending payment
#         existing_payment = Payment.objects.filter(
#             order=order,
#             payment_status="PENDING"
#         ).first()

#         if existing_payment:
#             # broken pending payment without client_secret
#             if not existing_payment.client_secret:
#                 existing_payment.delete()
#             else:
#                 return Response({
#                     "order_id": str(order.order_id),
#                     "payment_client_secret": existing_payment.client_secret,
#                     "payment_status": existing_payment.payment_status
#                 }, status=200)

#         #  create new Stripe PaymentIntent
#         try:
#             payment_intent = stripe.PaymentIntent.create(
#                 amount=int(order.total_amount * 100),
#                 currency=currency,
#                 payment_method_types=[payment_method_type],
#                 metadata={
#                     "order_id": str(order.order_id),
#                     "user_id": request.user.id
#                 }
#             )

#             # save payment
#             payment = Payment.objects.create(
#                 order=order,
#                 payment_id=payment_intent.id,
#                 client_secret=payment_intent.client_secret,
#                 payment_status="PENDING",
#                 payment_method=payment_method_type,
#                 amount=order.total_amount,
#                 currency=currency,
#             )

#             #  update order status
#             order.status = "PENDING"
#             order.save()

#         #  Stripe error handling
#         except stripe.error.AuthenticationError:
#             return Response({"error": "Stripe authentication failed"}, status=500)

#         except stripe.error.InvalidRequestError as e:
#             return Response({"error": str(e)}, status=400)

#         except stripe.error.CardError as e:
#             return Response({"error": e.user_message}, status=402)

#         except stripe.error.APIConnectionError:
#             return Response({"error": "Stripe connection error"}, status=503)

#         except stripe.error.StripeError:
#             return Response({"error": "Stripe internal error"}, status=500)

#         #  success response 
#         return Response({
#             "order_id": str(order.order_id),
#             "total_amount": float(order.total_amount),
#             "currency": currency,
#             "payment-id": payment.payment_id,
#             "payment_method": payment.payment_method,
#             "payment_client_secret": payment.client_secret,
#             "payment_status": payment.payment_status
#         }, status=200)


# Currency → Bank Transfer Mapping
CURRENCY_BANK_TRANSFER_MAPPING = {
    "usd": ["us_bank_account"],  # ACH
    "eur": ["sepa_debit"],       # SEPA
    "gbp": ["bacs_debit"],       # BACS
}

# INR supports only card and UPI
INR_SUPPORTED_METHODS = ["card", "upi"]

# Japan user-facing payment methods
JPN_SUPPORTED_METHODS = ["card", "paypay", "np_karobarai"]

# Japan mapping: user-facing → Stripe internal
JPN_METHOD_MAPPING = {
    "card": "card",
    "paypay": "paypay",
    "np_karobarai": "np_billing"
}

# Reverse mapping: Stripe internal → user-facing
JPN_METHOD_REVERSE_MAPPING = {v: k for k, v in JPN_METHOD_MAPPING.items()}


class CreatePaymentIntentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        currency = request.data.get("currency", "").lower()

        if not order_id:
            return Response({"error": "order_id is required"}, status=400)

        try:
            order = Order.objects.get(order_id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)

        # Already paid check
        if Payment.objects.filter(order=order, payment_status="SUCCESS").exists():
            return Response({"error": "Payment already completed"}, status=400)

        # Validate supported currencies
        supported_currencies = ["inr", "jpy"] + list(CURRENCY_BANK_TRANSFER_MAPPING.keys())
        if currency not in supported_currencies:
            return Response({"error": f"Currency '{currency}' not supported"}, status=400)

        # Normalize payment method
        payment_method = order.Payment_method.lower()

        # --- Currency specific handling ---
        if currency == "inr":
            if payment_method not in INR_SUPPORTED_METHODS:
                return Response({
                    "error": f"Payment method '{order.Payment_method}' not supported for INR. Use Card or UPI."
                }, status=400)
            stripe_payment_methods = [payment_method]

        elif currency == "jpy":
            # Normalize Stripe internal value to user-facing
            if payment_method in JPN_METHOD_REVERSE_MAPPING:
                payment_method = JPN_METHOD_REVERSE_MAPPING[payment_method]

            if payment_method not in JPN_SUPPORTED_METHODS:
                return Response({
                    "error": f"Payment method '{order.Payment_method}' not supported for JPY. Use Card, PayPay, or NP Karobarai."
                }, status=400)

            stripe_payment_methods = [JPN_METHOD_MAPPING[payment_method]]

        else:  # USD, EUR, GBP
            if payment_method == "bank transfer":
                if currency in CURRENCY_BANK_TRANSFER_MAPPING:
                    stripe_payment_methods = CURRENCY_BANK_TRANSFER_MAPPING[currency]
                else:
                    return Response({
                        "error": f"Bank Transfer not supported for currency {currency.upper()}"
                    }, status=400)
            else:
                stripe_payment_methods = [payment_method]

        # Prevent duplicate pending payment
        existing_payment = Payment.objects.filter(order=order, payment_status="PENDING").first()
        if existing_payment:
            if not existing_payment.client_secret:
                existing_payment.delete()
            else:
                return Response({
                    "order_id": str(order.order_id),
                    "payment_client_secret": existing_payment.client_secret,
                    "payment_status": existing_payment.payment_status
                }, status=200)

        # Create Stripe PaymentIntent
        try:
            payment_intent = stripe.PaymentIntent.create(
                amount=int(order.total_amount * 100),  # Stripe expects smallest currency unit
                currency=currency,
                payment_method_types=stripe_payment_methods,
                metadata={
                    "order_id": str(order.order_id),
                    "user_id": request.user.id
                }
            )

            # Save payment
            payment = Payment.objects.create(
                order=order,
                payment_id=payment_intent.id,
                client_secret=payment_intent.client_secret,
                payment_status="PENDING",
                payment_method=payment_method,
                amount=order.total_amount,
                currency=currency,
            )

            # Update order status
            order.status = "PENDING"
            order.save()

        except stripe.error.StripeError as e:
            return Response({"error": f"Stripe Error: {str(e)}"}, status=400)
        except Exception as e:
            return Response({"error": f"Server Error: {str(e)}"}, status=500)

        return Response({
            "order_id": str(order.order_id),
            "total_amount": float(order.total_amount),
            "currency": currency,
            "payment_id": payment.payment_id,
            "payment_method": payment.payment_method,
            "payment_client_secret": payment.client_secret,
            "payment_status": payment.payment_status
        }, status=200)



class UserPaymentListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            payments = Payment.objects.filter(order__user=request.user).order_by("-created_at",'-id')
            if not payments.exists():
                return Response({
                    "status": False,
                    "message": "No payment records found"
                }, status=status.HTTP_404_NOT_FOUND)

            paginator = CustomPagination()
            paginated_payments = paginator.paginate_queryset(payments, request)
            serializer = PaymentSerializer(paginated_payments, many=True)
            return paginator.get_paginated_response(serializer.data)

        except Exception as e:
            return Response({
                "status": False,
                "message": "Something went wrong",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




class UserPaymentDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payment_id = request.data.get("payment_id")

        if not payment_id:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "payment_id is required"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(
                payment_id=payment_id,
                order__user=request.user
            )

            serializer = PaymentSerializer(payment)
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Payment fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Payment.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Payment not found or access denied"
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Something went wrong",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class AdminPaymentListAPIView(APIView):
    # permission_classes = [IsAdminUser]
    permission_classes =[IsAuthenticated]

    def get(self, request):
        try:
            payments = Payment.objects.all().order_by('-created_at','-id')

            if not payments.exists():
                return Response({
                    "status": False,
                    "message": "No payment records found",
                    "data": []
                }, status=status.HTTP_404_NOT_FOUND)

            paginator = CustomPagination()
            paginated_payments = paginator.paginate_queryset(payments, request)
            serializer = PaymentSerializer(paginated_payments, many=True)

            return paginator.get_paginated_response(serializer.data)

        except Exception as e:
            return Response({
                "status": False,
                "message": "Something went wrong",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
 
 
class AdminPaymentDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payment_id = request.data.get("payment_id")

        if not payment_id:
            return Response({
                "status": False,
                "message": "payment_id is required"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(payment_id=payment_id)
            serializer = PaymentSerializer(payment)

            return Response({
                "status": True,
                "message": "Payment detail fetched successfully ",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Payment.DoesNotExist:
            return Response({
                "status": False,
                "message": "Payment not found"
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                "status": False,
                "message": "Something went wrong",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    
@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

        # -------------------------------
        # FOR TESTING ONLY: SKIP SIGNATURE VERIFICATION
        try:
            event = json.loads(payload)
        except ValueError:
            return Response({"status": "error", "message": "Invalid payload"}, status=400)
        # -------------------------------
        
        """
        # PRODUCTION: USE THIS
        try:
            event = stripe.Webhook.construct_event(
                payload,
                sig_header,
                settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            return Response({"status": "error", "message": "Invalid payload"}, status=400)
        except stripe.error.SignatureVerificationError:
            return Response({"status": "error", "message": "Invalid signature"}, status=400)
        """

        response_data = {"status": "ignored"}  

        # PAYMENT SUCCESS
        if event.get("type") == "payment_intent.succeeded":
            intent = event["data"]["object"]

            try:
                payment = Payment.objects.get(payment_id=intent["id"])
            except Payment.DoesNotExist:
                response_data = {"status": "error", "message": "Payment not found"}
                return Response(response_data, status=200)

            if payment.payment_status != "SUCCESS":
                payment.payment_status = "SUCCESS"
                payment.save()

                order = payment.order
                order.status = "paid"
                order.save()

            response_data = {
                "status": "success",
                "payment_id": intent["id"],
                "message": "Payment marked as SUCCESS"
            }

        # PAYMENT FAILED
        elif event.get("type") == "payment_intent.payment_failed":
            intent = event["data"]["object"]

            try:
                payment = Payment.objects.get(payment_id=intent["id"])
            except Payment.DoesNotExist:
                response_data = {"status": "error", "message": "Payment not found"}
                return Response(response_data, status=200)

            if payment.payment_status != "FAILED":
                payment.payment_status = "FAILED"
                payment.save()

                order = payment.order
                order.status = "cancelled"
                order.save()
            
            response_data = {
                "status": "failed",
                "payment_id": intent["id"],
                "message": "Payment marked as FAILED"
            }

        return Response(response_data, status=200) 

