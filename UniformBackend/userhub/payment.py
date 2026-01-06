from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated ,AllowAny
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from django.http import HttpResponse
from .serializers import *
import stripe
import requests
from django.http import JsonResponse
from uniformAdmin.auth import *
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
#         try:
#             order_id = request.data.get("order_id")
#             currency = request.data.get("currency", "").lower()
#             method = request.data.get("payment_method", "").lower()

#             if not all([order_id, currency, method]):
#                 return Response(
#                     {"error": "order_id, currency and payment_method are required"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             order = Order.objects.get(order_id=order_id, user=request.user)

#             if order.currency.lower() != currency:
#                 return Response(
#                     {"error": "Currency mismatch with order"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             if Payment.objects.filter(order=order, payment_status="SUCCESS").exists():
#                 return Response(
#                     {"error": "Payment already completed"},
#                     status=status.HTTP_409_CONFLICT
#                 )

#             existing_payment = Payment.objects.filter(
#                 order=order,
#                 payment_status="PENDING"
#             ).first()

#             if existing_payment and existing_payment.client_secret:
#                 return Response({
#                     "status": True,
#                     "client_secret": existing_payment.client_secret,
#                     "payment_id": existing_payment.payment_id
#                 }, status=status.HTTP_200_OK)

#             payment_methods = self.get_stripe_methods(currency, method)
#             if not payment_methods:
#                 return Response(
#                     {"error": "Payment method not supported"},
#                     status=status.HTTP_422_UNPROCESSABLE_ENTITY
#                 )

#             intent = stripe.PaymentIntent.create(
#                 amount=int(order.total_amount * 100),
#                 currency=currency,
#                 payment_method_types=payment_methods,
#                 metadata={
#                     "order_id": str(order.order_id),
#                     "user_id": request.user.id
#                 },
#                 idempotency_key=f"{order.order_id}-{method}"
#             )

#             Payment.objects.create(
#                 order=order,
#                 payment_id=intent.id,
#                 client_secret=intent.client_secret,
#                 payment_method=method,
#                 amount=order.total_amount,
#                 currency=currency,
#                 payment_status="PENDING"
#             )

#             return Response({
#                 "status": True,
#                 "client_secret": intent.client_secret,
#                 "payment_id": intent.id,
#                 "note": (
#                     "Bank transfer may take 2 , 5 days"
#                     if method == "bank_transfer"
#                     else None
#                 )
#             }, status=status.HTTP_201_CREATED)

#         except Order.DoesNotExist:
#             return Response(
#                 {"error": "Order not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         except stripe.error.StripeError as e:
#             return Response(
#                 {"stripe_error": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         except Exception as e:
#             return Response(
#                 {"error": "Server error", "details": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def get_stripe_methods(self, currency, method):
#         if method in ["card", "apple_pay", "google_pay"]:
#             return ["card"]

#         if method == "paypay" and currency == "jpy":
#             return ["paypay"]

#         if method == "bank_transfer":
#             return {
#                 "usd": ["us_bank_account"],
#                 "eur": ["sepa_debit"],
#                 "gbp": ["bacs_debit"],
#             }.get(currency)

#         return None


# @method_decorator(csrf_exempt, name='dispatch')
# class StripeWebhookAPIView(APIView):
 
#     authentication_classes = [] 
#     permission_classes = []

#     def post(self, request, *args, **kwargs):
#         payload = request.body
#         sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

#         if not sig_header:
#             return HttpResponse(status=400)

#         try:
#             event = stripe.Webhook.construct_event(
#                 payload=payload,
#                 sig_header=sig_header,
#                 secret=settings.STRIPE_WEBHOOK_SECRET
#             )
#         except ValueError:
#             return HttpResponse("Invalid payload", status=400)
#         except stripe.error.SignatureVerificationError:
#             return HttpResponse("Invalid signature", status=400)

#         intent = event["data"]["object"]
#         payment_id = intent.get("id")

#         if event["type"] == "payment_intent.succeeded":
#             Payment.objects.filter(payment_id=payment_id).update(payment_status="SUCCESS")
#         elif event["type"] in ["payment_intent.payment_failed", "payment_intent.canceled"]:
#             Payment.objects.filter(payment_id=payment_id).update(payment_status="FAILED")

#         return HttpResponse(status=200)

# class NPKakebaraiAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         try:
#             order = Order.objects.get(
#                 order_id=request.data["order_id"],
#                 user=request.user
#             )

#             payload = {
#                 "merchant_id": settings.NP_MERCHANT_ID,
#                 "order_id": str(order.order_id),
#                 "amount": int(order.total_amount),
#                 "buyer": {
#                     "name": request.data["name"],
#                     "phone": request.data["phone"],
#                     "email": request.data["email"],
#                     "address": request.data["address"]
#                 }
#             }

#             response = requests.post(
#                 settings.NP_API_URL,
#                 json=payload,
#                 headers={
#                     "Authorization": f"Bearer {settings.NP_API_KEY}"
#                 },
#                 timeout=30
#             )

#             if response.status_code != 200:
#                 return Response(
#                     {"error": "NP service unavailable"},
#                     status=status.HTTP_503_SERVICE_UNAVAILABLE
#                 )

#             data = response.json()

#             if data.get("result") != "approved":
#                 return Response(
#                     {"error": "NP rejected payment"},
#                     status=status.HTTP_402_PAYMENT_REQUIRED
#                 )

#             Payment.objects.create(
#                 order=order,
#                 payment_method="np_kakebarai",
#                 payment_id=data["transaction_id"],
#                 payment_status="PENDING",
#                 amount=order.total_amount,
#                 currency="jpy"
#             )

#             return Response({
#                 "status": True,
#                 "message": "NP approved"
#             }, status=status.HTTP_201_CREATED)

#         except KeyError:
#             return Response(
#                 {"error": "Missing required fields"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         except Exception as e:
#             return Response(
#                 {"error": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# @method_decorator(csrf_exempt, name='dispatch')
# class NPWebhookAPIView(APIView):
#     """
#     NP Kakebarai Webhook
#     Expects JSON:
#     {
#         "transaction_id": "np_tx_123",
#         "status": "approved"  # or failed, canceled
#     }
#     """

#     authentication_classes = []  # Webhook doesn't need auth
#     permission_classes = []

#     def post(self, request, *args, **kwargs):
#         try:
#             data = json.loads(request.body)
#             transaction_id = data.get("transaction_id")
#             status = data.get("status")

#             if not transaction_id or not status:
#                 return JsonResponse({"error": "transaction_id and status required"}, status=400)

#             Payment.objects.filter(payment_id=transaction_id).update(payment_status=status.upper())

#             return JsonResponse({"ok": True}, status=200)

#         except json.JSONDecodeError:
#             return JsonResponse({"error": "Invalid JSON"}, status=400)
#         except Exception as e:
#             return JsonResponse({"error": str(e)}, status=500)

CURRENCY_BANK_TRANSFER_MAPPING = {
    "usd": ["us_bank_account"],  
    "eur": ["sepa_debit"],       
    "gbp": ["bacs_debit"],       
}
INR_SUPPORTED_METHODS = ["card", "upi"]
JPN_SUPPORTED_METHODS = ["card", "paypay", "np_karobarai"]
JPN_METHOD_MAPPING = {
    "card": "card",
    "paypay": "paypay",
    "np_karobarai": "np_billing"
}

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

       
        if Payment.objects.filter(order=order, payment_status="SUCCESS").exists():
            return Response({
                "status":False,
                "statusCode":400,
                "error": "Payment already completed"
                }, status=status.HTTP_400_BAD_REQUEST)

        
        supported_currencies = ["inr", "jpy"] + list(CURRENCY_BANK_TRANSFER_MAPPING.keys())
        if currency not in supported_currencies:
            return Response({
                "status":False,
                "statusCode":400,
                "error": f"Currency '{currency}' not supported"
                }, status=status.HTTP_400_BAD_REQUEST)

      
        payment_method = order.Payment_method.lower()
        if currency == "inr":
            if payment_method not in INR_SUPPORTED_METHODS:
                return Response({
                    "status":False,
                    "statusCode":400,
                    "error": f"Payment method '{order.Payment_method}' not supported for INR. Use Card or UPI."
                }, status=status.HTTP_400_BAD_REQUEST)
            
            stripe_payment_methods = [payment_method]
        elif currency == "jpy":
            
            if payment_method in JPN_METHOD_REVERSE_MAPPING:
                payment_method = JPN_METHOD_REVERSE_MAPPING[payment_method]

            if payment_method not in JPN_SUPPORTED_METHODS:
                return Response({
                    "status":False,
                    "statusCode":400,
                    "error": f"Payment method '{order.Payment_method}' not supported for JPY. Use Card, PayPay, or NP Karobarai."
                }, status=status.HTTP_400_BAD_REQUEST)

            stripe_payment_methods = [JPN_METHOD_MAPPING[payment_method]]

        else:  
            if payment_method == "bank transfer":
                if currency in CURRENCY_BANK_TRANSFER_MAPPING:
                    stripe_payment_methods = CURRENCY_BANK_TRANSFER_MAPPING[currency]
                else:
                    return Response({
                        "status":False,
                        "statusCode":400,
                        "error": f"Bank Transfer not supported for currency {currency.upper()}"
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                stripe_payment_methods = [payment_method]

       
        existing_payment = Payment.objects.filter(order=order, payment_status="PENDING").first()
        if existing_payment:
            if not existing_payment.client_secret:
                existing_payment.delete()
            else:
                return Response({
                    "status":True,
                    "statuCode":200,
                    "order_id": str(order.order_id),
                    "payment_client_secret": existing_payment.client_secret,
                    "payment_status": existing_payment.payment_status
                }, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment_intent = stripe.PaymentIntent.create(
                amount=int(order.total_amount * 100), 
                currency=currency,
                payment_method_types=stripe_payment_methods,
                metadata={
                    "order_id": str(order.order_id),
                    "user_id": request.user.id
                }
            )

            payment = Payment.objects.create(
                order=order,
                payment_id=payment_intent.id,
                client_secret=payment_intent.client_secret,
                payment_status="PENDING",
                payment_method=payment_method,
                amount=order.total_amount,
                currency=currency,
            )

            order.status = "PENDING"
            order.save()

        except stripe.error.StripeError as e:
            return Response({
                "status":False,
                "statusCode":400,
                "error": f"Stripe Error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                "status":False,
                "statusCode":500,
                "error": f"Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "status":True,
            "statusCode":200,
            "order_id": str(order.order_id),
            "total_amount": float(order.total_amount),
            "currency": currency,
            "payment_id": payment.payment_id,
            "payment_method": payment.payment_method,
            "payment_client_secret": payment.client_secret,
            "payment_status": payment.payment_status
        }, status=status.HTTP_200_OK)


class UserPaymentListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            payments = Payment.objects.filter(order__user=request.user).order_by("-created_at",'-id')
            if not payments.exists():
                return Response({
                    "status": False,
                    "statusCode":404,
                    "message": "No payment records found"
                }, status=status.HTTP_404_NOT_FOUND)

            paginator = CustomPagination()
            paginated_payments = paginator.paginate_queryset(payments, request)
            serializer = PaymentSerializer(paginated_payments, many=True)
            return paginator.get_paginated_response(serializer.data)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode":500,
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
    parser_classes =[IsAdminUserJWT]
    def get(self, request):
        try:
            payments = Payment.objects.all().order_by('-created_at','-id')

            if not payments.exists():
                return Response({
                    "status": False,
                    "statusCode":404,
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
                "statusCode":500,
                "message": "Something went wrong",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
class AdminPaymentDetailAPIView(APIView):
    permission_classes =[IsAdminUserJWT]

    def post(self, request):
        payment_id = request.data.get("payment_id")

        if not payment_id:
            return Response({
                "status": False,
                "statusCode":400,
                "message": "payment_id is required"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(payment_id=payment_id)
            serializer = PaymentSerializer(payment)
            return Response({
                "status": True,
                "statusCode":200,
                "message": "Payment detail fetched successfully ",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Payment.DoesNotExist:
            return Response({
                "status": False,
                "statusCode":404,
                "message": "Payment not found"
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode":500,
                "message": "Something went wrong",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.body.decode("utf-8")
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

        if not sig_header:
            return Response(
                {"status":False,
                 "statusCode":400,
                 "message": "Missing Stripe signature"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            event = stripe.Webhook.construct_event(
                payload=payload,
                sig_header=sig_header,
                secret=settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            return Response(
                {
                    "status":False,
                    "statusCode":400,
                    "message": "Invalid payload"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except stripe.error.SignatureVerificationError:
            return Response(
                {"status": False,
                 "statusCode":400,
                 "message": "Invalid signature"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if event["type"] == "payment_intent.succeeded":
            intent = event["data"]["object"]

            try:
                payment = Payment.objects.get(payment_id=intent["id"])
            except Payment.DoesNotExist:
                return Response(
                    {"status": "error",
                     "statusCode":200,
                     "message": "Payment not found"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if payment.payment_status != "SUCCESS":
                payment.payment_status = "SUCCESS"
                payment.save()

                order = payment.order
                order.status = "paid"
                order.save()

            return Response(
                {
                    "status": "success",
                    "statusCode":200,
                    "payment_id": intent["id"],
                    "message": "Payment marked as SUCCESS"
                },
                status=status.HTTP_200_OK
            )

        elif event["type"] == "payment_intent.payment_failed":
            intent = event["data"]["object"]

            try:
                payment = Payment.objects.get(payment_id=intent["id"])
            except Payment.DoesNotExist:
                return Response(
                    {"status": "error",
                     "statusCode":200, 
                     "message": "Payment not found"},
                    status=status.HTTP_200_OK
                )

            if payment.payment_status != "FAILED":
                payment.payment_status = "FAILED"
                payment.save()

                order = payment.order
                order.status = "cancelled"
                order.save()

            return Response(
                {
                    "status": "failed",
                    "statusCode":200,
                    "payment_id": intent["id"],
                    "message": "Payment marked as FAILED"
                },
                status=status.HTTP_200_OK
            )

        return Response({
            "status": "ignored",
            "statusCode":200,
            }, status=status.HTTP_200_OK)


# @method_decorator(csrf_exempt, name="dispatch")
# class StripeWebhookAPIView(APIView):
#     permission_classes = [AllowAny]
#     authentication_classes = []

#     def post(self, request):
#         payload = request.body
#         sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

#         try:
#             event = stripe.Webhook.construct_event(
#                 payload=payload,
#                 sig_header=sig_header,
#                 secret=settings.STRIPE_WEBHOOK_SECRET
#             )
#         except Exception:
#             return HttpResponse(status=400)

#         event_type = event["type"]
#         intent = event["data"]["object"]

 
#         if event_type == "payment_intent.succeeded":
#             try:
#                 payment = Payment.objects.select_related("order").get(
#                     payment_id=intent["id"]
#                 )
#             except Payment.DoesNotExist:
#                 return HttpResponse(status=200)

            
#             if int(intent.amount) != int(payment.amount * 100):
#                 return HttpResponse(status=400)

#             if payment.payment_status != "SUCCESS":
#                 payment.payment_status = "SUCCESS"
#                 payment.save(update_fields=["payment_status"])

#                 order = payment.order
#                 order.status = "PAID"
#                 order.save(update_fields=["status"])

   
#         elif event_type == "payment_intent.processing":
#             Payment.objects.filter(
#                 payment_id=intent["id"]
#             ).update(payment_status="PROCESSING")

        
#         elif event_type == "payment_intent.payment_failed":
#             Payment.objects.filter(
#                 payment_id=intent["id"]
#             ).update(payment_status="FAILED")

#             Payment.objects.filter(
#                 payment_id=intent["id"]
#             ).update(order__status="CANCELLED")

#         return HttpResponse(status=200)
