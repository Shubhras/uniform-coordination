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
