from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated 
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
from uniformAdmin.fabric import IsAdministrator
import stripe
from uniformAdmin.auth import *
from .utils import generate_payment_pdf

stripe.api_key = settings.STRIPE_SECRET_KEY


# pagination 
class CustomPagination(PageNumberPagination):
    """Custom Pagination for Professional Users"""
    page_size = 10  
    page_size_query_param = "page_size"
    max_page_size = 100  

    def get_paginated_response(self, data):
        return Response({
            "count": self.page.paginator.count,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "data": data  
        })

# CURRENCY_BANK_TRANSFER_MAPPING = {
#     "usd": ["us_bank_account"],  
#     "eur": ["sepa_debit"],       
#     "gbp": ["bacs_debit"],       
# }
# INR_SUPPORTED_METHODS = ["card", "upi"]
# JPN_SUPPORTED_METHODS = ["card", "paypay"]
# JPN_METHOD_MAPPING = {
#     "card": "card",
#     "paypay": "paypay",
# }
# JPN_METHOD_REVERSE_MAPPING = {v: k for k, v in JPN_METHOD_MAPPING.items()}
# class CreatePaymentIntentAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         try:    
#             order_id = request.data.get("order_id")
#             currency = request.data.get("currency", "").lower()

#             if not order_id:
#                 return Response({
#                     "status":False,
#                     "statusCode":400,
#                     "error": "order_id is required"}, status=400)

#             try:
#                 order = Order.objects.get(order_id=order_id, user=request.user)
#             except Order.DoesNotExist:
#                 return Response({
#                     "status":False,
#                     "statusCode":404,
#                     "error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        
#             if Payment.objects.filter(order=order, payment_status="SUCCESS").exists():
#                 return Response({
#                     "status":False,
#                     "statusCode":400,
#                     "error": "Payment already completed"
#                     }, status=status.HTTP_400_BAD_REQUEST)

            
#             supported_currencies = ["inr", "jpy"] + list(CURRENCY_BANK_TRANSFER_MAPPING.keys())
#             if currency not in supported_currencies:
#                 return Response({
#                     "status":False,
#                     "statusCode":400,
#                     "error": f"Currency '{currency}' not supported"
#                     }, status=status.HTTP_400_BAD_REQUEST)

        
#             payment_method = order.payment_method.lower()
#             if currency == "inr":
#                 if payment_method not in INR_SUPPORTED_METHODS:
#                     return Response({
#                         "status":False,
#                         "statusCode":400,
#                         "error": f"Payment method '{order.payment_method}' not supported for INR. Use Card or UPI."
#                     }, status=status.HTTP_400_BAD_REQUEST)
                
#                 stripe_payment_methods = [payment_method]
#             elif currency == "jpy":
                
#                 if payment_method in JPN_METHOD_REVERSE_MAPPING:
#                     payment_method = JPN_METHOD_REVERSE_MAPPING[payment_method]

#                 if payment_method not in JPN_SUPPORTED_METHODS:
#                     return Response({
#                         "status":False,
#                         "statusCode":400,
#                         "error": f"Payment method '{order.payment_method}' not supported for JPY. Use Card, PayPay."
#                     }, status=status.HTTP_400_BAD_REQUEST)

#                 stripe_payment_methods = [JPN_METHOD_MAPPING[payment_method]]

#             else:  
#                 if payment_method == "bank transfer":
#                     if currency in CURRENCY_BANK_TRANSFER_MAPPING:
#                         stripe_payment_methods = CURRENCY_BANK_TRANSFER_MAPPING[currency]
#                     else:
#                         return Response({
#                             "status":False,
#                             "statusCode":400,
#                             "error": f"Bank Transfer not supported for currency {currency.upper()}"
#                         }, status=status.HTTP_400_BAD_REQUEST)
#                 else:
#                     stripe_payment_methods = [payment_method]

        
#             existing_payment = Payment.objects.filter(order=order, payment_status="PENDING").first()
#             if existing_payment:
#                 if not existing_payment.client_secret:
#                     existing_payment.delete()
#                 else:
#                     return Response({
#                         "status":True,
#                         "statusCode":200,
#                         "message": "A payment is already pending for this order. Use the existing client_secret to complete it",
#                         "order_id": str(order.order_id),
#                         "payment_client_secret": existing_payment.client_secret,
#                         "payment_status": existing_payment.payment_status
#                     }, status=status.HTTP_200_OK)

#             try:
#                 payment_intent = stripe.PaymentIntent.create(
#                     amount=int(order.total_amount * 100), 
#                     currency=currency,
#                     payment_method_types=stripe_payment_methods,
#                     metadata={
#                         "order_id": str(order.order_id),
#                         "user_id": request.user.id
#                     }
#                 )
             
#                 payment = Payment.objects.create(
#                     order=order,
#                     payment_id=payment_intent.id,
#                     client_secret=payment_intent.client_secret,
#                     payment_status="PENDING",
#                     payment_method=payment_method,
#                     amount=order.total_amount,
#                     currency=currency,
#                 )

#                 order.status = "PENDING"
#                 order.save()

#             except stripe.error.StripeError as e:
#                 return Response({
#                     "status":False,
#                     "statusCode":400,
#                     "error": f"Stripe Error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
#             except Exception as e:
#                 return Response({
#                     "status":False,
#                     "statusCode":500,
#                     "error": f"Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#             return Response({
#                 "status":True,
#                 "statusCode":200,
#                 "order_id": str(order.order_id),
#                 "total_amount": float(order.total_amount),
#                 "currency": currency,
#                 "payment_id": payment.payment_id,
#                 "payment_method": payment.payment_method,
#                 "payment_client_secret": payment.client_secret,
#                 "payment_status": payment.payment_status,
#                 # "stripe_intent_status": payment_intent.status,
#             }, status=status.HTTP_200_OK)
        
#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode":500,
#                 "message": "Something went wrong",
#                 "error": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreatePaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        order_code = request.data.get("order_id")
        payment_method_id = request.data.get("payment_method_id")
        currency = request.data.get("currency")
        if not order_code or not payment_method_id or not currency:
            return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "order_id, payment_method_id, currency required"
                },
                status=status.HTTP_400_BAD_REQUEST)

        currency = currency.lower().strip()
        try:
            order = Order.objects.select_for_update().get(
                    order_id=order_code,
                    customer__user=request.user   
                )

        except Order.DoesNotExist:
            return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "Order not found"
                }, status=status.HTTP_404_NOT_FOUND  )

        if order.status == "paid":
            return Response({
                    "status": False,
                    "statusCode": 400,
                    "message": "Order already paid"
                },status=status.HTTP_400_BAD_REQUEST )

        if currency in ["jpy", "krw"]:
            amount = int(order.total_amount)
        else:
            amount = int(order.total_amount * 100)
        try:
            if not request.user.stripeOrderCustomerId:
                customer = stripe.Customer.create(
                    email=request.user.email,
                    name=request.user.userName
                )
                request.user.stripeOrderCustomerId = customer.id
                request.user.save(update_fields=["stripeOrderCustomerId"])
            else:
                customer = request.user.stripeOrderCustomerId

            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                customer=customer,
                payment_method=payment_method_id,
                confirm=True,

                automatic_payment_methods={
                    "enabled": True,
                    "allow_redirects": "never"  },

                setup_future_usage="off_session", 
                metadata={
                    "order_id": order.order_id,
                    "order_db_id": order.id,
                    "user_id": request.user.id, })

            payment = Payment.objects.create(
                order=order,
                payment_id=intent.id,
                customer_id=customer,
                payment_method_id=payment_method_id,
                # payment_method="card",
                amount=order.total_amount,
                currency=currency.upper(),
                payment_status="pending",
                client_secret=intent.client_secret,
            )

            if intent.status == "succeeded":
                payment.payment_status = "success"
                payment.paid_at = timezone.now()
                payment.save(update_fields=["payment_status", "paid_at"])

                order.status = "paid"
                order.currency = currency.upper()
                order.payment_method = "card"
                order.save(update_fields=["status", "currency", "payment_method"])

                return Response(
                    {
                        "status": True,
                        "statusCode": 200,
                        "payment_status": "success",
                        "payment_intent_id": intent.id
                    },
                    status=status.HTTP_200_OK )

            if intent.status == "requires_action":
                return Response({
                        "status": True,
                        "statusCode": 200,
                        "payment_status": "action_required",
                        "client_secret": intent.client_secret
                    }, status=status.HTTP_200_OK )

            payment.payment_status = "failed"
            payment.save(update_fields=["payment_status"])

            return Response({
                    "status": False,
                    "statusCode": 400,
                    "payment_status": "failed",
                    "stripe_status": intent.status
                }, status=status.HTTP_400_BAD_REQUEST )

        except stripe.error.CardError as e:
            return Response( {
                    "status": False,
                    "statusCode": 402,
                    "message": e.user_message
                },  status=status.HTTP_402_PAYMENT_REQUIRED  )

        except stripe.error.StripeError as e:
            return Response({
                    "status": False,
                    "statusCode": 500,
                    "message": str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR )

        except Exception as e:
            return Response({
                    "status": False,
                    "statusCode": 500,
                    "message": str(e)
                },status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserPaymentListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            payments = Payment.objects.filter(
                order__user=request.user
            ).order_by("-created_at", "-id")

            paginator = CustomPagination()
            page = paginator.paginate_queryset(payments, request)
            serializer = PaymentSerializer(page, many=True)

            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Payment list fetched successfully.",
                "data": serializer.data,
                "pagination": {
                    "page": paginator.page.number,
                    "page_size": paginator.get_page_size(request),
                    "total_pages": paginator.page.paginator.num_pages,
                    "total_items": paginator.page.paginator.count
                }
            }

            return Response(response, status=status.HTTP_200_OK)

        except Exception as exc:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Server error while fetching payments.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserPaymentDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
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
                    order__user=request.user )

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
                    "message": "Something went wrong while fetching payment",
                    "error": str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Internal server error",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminPaymentListAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            payments = Payment.objects.all().order_by('-created_at', '-id')

            paginator = CustomPagination()
            page = paginator.paginate_queryset(payments, request)
            serializer = PaymentSerializer(page, many=True)

            response = {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "statusCode": 200,
                "status": True,
                "message": "Payment list fetched successfully.",
                "data": serializer.data,
                "pagination": {
                    "page": paginator.page.number,
                    "page_size": paginator.get_page_size(request),
                    "total_pages": paginator.page.paginator.num_pages,
                    "total_items": paginator.page.paginator.count
                }
            }

            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": "Something went wrong",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

 
class AdminPaymentDetailAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]
   
    def post(self, request):
        try:
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
        except Exception as e:
                return Response({
                    "status": False,
                    "statusCode":500,
                    "message": "Something went wrong",
                    "error": str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PaymentPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return Response({
                    "status": False,
                    "statusCode": 404,
                    "error": f"Payment with id {payment_id} not found."
                }, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            return Response({
                    "status": False,
                    "statusCode": 500,
                    "error": f"Error fetching payment: {str(e)}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        try:
            if not payment.order:
                return Response({
                        "status": False,
                        "statusCode": 400,
                        "error": "Payment is not linked to any order."
                    },status=status.HTTP_400_BAD_REQUEST)
            
            user = getattr(payment.order, 'user', None)
            if not user:
                return Response({
                        "status": False,
                        "statusCode": 400,
                        "error": "Order does not have a user associated."
                    },status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                    "status": False,
                    "statusCode": 500,
                    "error": f"Error fetching user: {str(e)}"
                },status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        try:
            pdf_url = generate_payment_pdf(payment, user, request=request)
        except Exception as e:
            return Response({
                    "status": False,
                    "statusCode": 500,
                    "error": f"Error generating PDF: {str(e)}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
                "status": True,
                "statusCode": 200,
                "message": "Payment PDF generated successfully",
                "pdf_url": pdf_url
            },status=status.HTTP_200_OK)

