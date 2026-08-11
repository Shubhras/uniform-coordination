from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated 
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
from uniformAdmin.fabric import IsAdministrator
import stripe
from rest_framework_simplejwt.authentication import JWTAuthentication
from .utils import generate_payment_pdf,generate_payment_pdf, send_payment_success_email, send_payment_failed_email
import json
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from drf_spectacular.utils import extend_schema,OpenApiExample,OpenApiResponse,OpenApiParameter,OpenApiTypes
stripe.api_key = settings.STRIPE_SECRET_KEY
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

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


# class CreatePaymentAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     @transaction.atomic
#     def post(self, request):
#         order_code = request.data.get("order_id")
#         payment_method_id = request.data.get("payment_method_id")
#         currency = request.data.get("currency")

#         if not order_code or not payment_method_id or not currency:
#             return Response({
#                 "status": False,
#                 "statusCode": 400,
#                 "message": "order_id, payment_method_id, currency required"
#             }, status=status.HTTP_400_BAD_REQUEST)

#         currency = currency.lower().strip()

#         try:
#             order = Order.objects.select_for_update().get(
#                 order_id=order_code,
#                 customer__user=request.user
#             )
#         except Order.DoesNotExist:
#             return Response({
#                 "status": False,
#                 "statusCode": 404,
#                 "message": "Order not found"
#             }, status=status.HTTP_404_NOT_FOUND)
       
#         if order.status == "confirmed":
#             return Response({
#                 "status": False,
#                 "statusCode": 400,
#                 "message": "Order already paid"
#             }, status=status.HTTP_400_BAD_REQUEST)


#         existing_payment = Payment.objects.filter(
#             order=order,
#             payment_status__in=["pending", "processing"]
#         ).first()

#         if existing_payment:
#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Payment already in processing",
#                 "order_id": str(order.order_id),
#                 "payment_id": existing_payment.payment_id,
#                 "payment_status": existing_payment.payment_status,
#                 "client_secret": existing_payment.client_secret
#             }, status=status.HTTP_200_OK)

#         amount = int(order.total_amount) if currency in ["jpy", "krw"] else int(order.total_amount * 100)
#         try:
#             customer_id = request.user.stripeOrderCustomerId

#             if customer_id:
#                 try:
#                     stripe.Customer.retrieve(customer_id)
#                 except stripe.error.InvalidRequestError:
#                     stripe_customer = stripe.Customer.create(
#                         email=request.user.email,
#                         name=request.user.userName
#                     )
#                     request.user.stripeOrderCustomerId = stripe_customer.id
#                     request.user.save(update_fields=["stripeOrderCustomerId"])
#                     customer_id = stripe_customer.id
#             else:
#                 stripe_customer = stripe.Customer.create(
#                     email=request.user.email,
#                     name=request.user.userName
#                 )
#                 request.user.stripeOrderCustomerId = stripe_customer.id
#                 request.user.save(update_fields=["stripeOrderCustomerId"])
#                 customer_id = stripe_customer.id

#             intent = stripe.PaymentIntent.create(
#                 amount=amount,
#                 currency=currency,
#                 customer=customer_id,
#                 payment_method=payment_method_id,
#                 confirm=True,
#                 automatic_payment_methods={
#                     "enabled": True,
#                     "allow_redirects": "never"
#                 },
#                 setup_future_usage="off_session",
#                 metadata={
#                     "order_id": str(order.order_id),
#                     "order_db_id": str(order.id),
#                     "user_id": str(request.user.id),
#                 }
#             )

#             payment_method_obj = stripe.PaymentMethod.retrieve(intent.payment_method)
#             method_name = payment_method_obj.type

#             payment = Payment.objects.create(
#                 order=order,
#                 payment_id=intent.id,
#                 customer_id=customer_id,
#                 payment_method_id=payment_method_id,
#                 payment_method=method_name,
#                 amount=order.total_amount,
#                 currency=currency.upper(),
#                 payment_status="pending",
#                 client_secret=intent.client_secret,
#             )

#             if intent.status == "succeeded":
#                 payment.payment_status = "success"
#                 payment.paid_at = timezone.now()
#                 payment.save(update_fields=["payment_status", "paid_at"])

#                 return Response({
#                     "status": True,
#                     "statusCode": 200,
#                     "message": "Payment processing. Waiting for confirmation.",
#                     "order_id": str(order.order_id),
#                     "payment_id": payment.payment_id,
#                     "payment_method": method_name,
#                     "client_secret": payment.client_secret,
#                     "payment_status": payment.payment_status
#                 }, status=status.HTTP_200_OK)

#             elif intent.status == "requires_action":
#                 return Response({
#                     "status": True,
#                     "statusCode": 200,
#                     "payment_status": "action_required",
#                     "client_secret": intent.client_secret
#                 }, status=status.HTTP_200_OK)

#             else:
#                 payment.payment_status = "failed"
#                 payment.save(update_fields=["payment_status"])

#                 return Response({
#                     "status": False,
#                     "statusCode": 400,
#                     "payment_status": "payment failed",
#                     "stripe_status": intent.status
#                 }, status=status.HTTP_400_BAD_REQUEST)

#         except stripe.error.CardError as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 402,
#                 "message": e.user_message
#             }, status=status.HTTP_402_PAYMENT_REQUIRED)

#         except stripe.error.StripeError as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


class CreatePaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        order_code = request.data.get("order_id")
        payment_method_id = request.data.get("payment_method_id")
        currency = request.data.get("currency")

        if not order_code or not currency:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "order_id and currency are required"
            }, status=status.HTTP_400_BAD_REQUEST)

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
            }, status=status.HTTP_404_NOT_FOUND)
       
        successful_payment = Payment.objects.filter(order=order, payment_status="success").exists()
        if successful_payment or order.status in ["confirmed", "paid"] or order.is_paid:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Order already paid"
            }, status=status.HTTP_400_BAD_REQUEST)


        existing_payment = Payment.objects.filter(
            order=order,
            payment_status__in=["pending", "processing"]
        ).first()

        if existing_payment:
            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Payment already in processing",
                "order_id": str(order.order_id),
                "payment_id": existing_payment.payment_id,
                "payment_status": existing_payment.payment_status,
                "client_secret": existing_payment.client_secret
            }, status=status.HTTP_200_OK)

        payment_method = getattr(order, "payment_method", "stripe")

        if payment_method == "bank_transfer":
            payment = Payment.objects.create(
                order=order,
                custom_theme=order.custom_theme,
                payment_id=f"BT-{order.order_id}",
                customer_id="",
                payment_method_id="",
                payment_method="bank_transfer",
                amount=order.total_amount,
                currency=currency.upper(),
                payment_status="pending",
                client_secret="",
            )
            
            cart = Cart.objects.filter(user=request.user, is_active=True).first()
            if cart:
                cart.items.all().delete()
                cart.delete()
                
            send_payment_success_email(order.customer.user, payment)    

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Please transfer the amount to our bank account.",
                "bank_details": {
                    "bank_name": "Sample Bank",
                    "account_name": "Kireiz Space",
                    "account_number": "123-456-789"
                },
                "order_id": str(order.order_id),
                "payment_id": payment.payment_id,
                "payment_status": payment.payment_status
            }, status=status.HTTP_200_OK)

        elif payment_method == "paypay":
            payment = Payment.objects.create(
                order=order,
                custom_theme=order.custom_theme,
                payment_id=f"PP-{order.order_id}",
                customer_id="",
                payment_method_id="",
                payment_method="paypay",
                amount=order.total_amount,
                currency=currency.upper(),
                payment_status="pending",
                client_secret="",
            )

            cart = Cart.objects.filter(user=request.user, is_active=True).first()
            if cart:
                cart.items.all().delete()
                cart.delete()
                
            send_payment_success_email(order.customer.user, payment)    

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "Redirect to PayPay.",
                "checkout_url": "https://api.paypay.ne.jp/checkout/sample",
                "order_id": str(order.order_id),
                "payment_id": payment.payment_id,
            }, status=status.HTTP_200_OK)

        elif payment_method == "np_kakebarai":
            payment = Payment.objects.create(
                order=order,
                custom_theme=order.custom_theme,
                payment_id=f"NP-{order.order_id}",
                customer_id="",
                payment_method_id="",
                payment_method="np_kakebarai",
                amount=order.total_amount,
                currency=currency.upper(),
                payment_status="pending",
                client_secret="",
            )

            cart = Cart.objects.filter(user=request.user, is_active=True).first()
            if cart:
                cart.items.all().delete()
                cart.delete()
                
            send_payment_success_email(order.customer.user, payment)    

            return Response({
                "status": True,
                "statusCode": 200,
                "message": "NP Kakebarai transaction pending.",
                "order_id": str(order.order_id),
                "payment_id": payment.payment_id,
            }, status=status.HTTP_200_OK)

        # Default Stripe processing
        if not payment_method_id:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "payment_method_id is required for Stripe payments."
            }, status=status.HTTP_400_BAD_REQUEST)

        amount = int(order.total_amount) if currency in ["jpy", "krw"] else int(order.total_amount * 100)
        try:
            customer_id = request.user.stripeOrderCustomerId

            if customer_id:
                try:
                    stripe.Customer.retrieve(customer_id)
                except stripe.error.InvalidRequestError:
                    stripe_customer = stripe.Customer.create(
                        email=request.user.email,
                        name=request.user.userName
                    )
                    request.user.stripeOrderCustomerId = stripe_customer.id
                    request.user.save(update_fields=["stripeOrderCustomerId"])
                    customer_id = stripe_customer.id
            else:
                stripe_customer = stripe.Customer.create(
                    email=request.user.email,
                    name=request.user.userName
                )
                request.user.stripeOrderCustomerId = stripe_customer.id
                request.user.save(update_fields=["stripeOrderCustomerId"])
                customer_id = stripe_customer.id

            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                customer=customer_id,
                payment_method=payment_method_id,
                confirm=True,
                automatic_payment_methods={
                    "enabled": True,
                    "allow_redirects": "never"
                },
                setup_future_usage="off_session",
                metadata={
                    "order_id": str(order.order_id),
                    "order_db_id": str(order.id),
                    "user_id": str(request.user.id),
                }
            )

            payment_method_obj = stripe.PaymentMethod.retrieve(intent.payment_method)
            method_name = payment_method_obj.type

            payment = Payment.objects.create(
                order=order,
                custom_theme=order.custom_theme,
                payment_id=intent.id,
                customer_id=customer_id,
                payment_method_id=payment_method_id,
                payment_method=method_name,
                amount=order.total_amount,
                currency=currency.upper(),
                payment_status="pending",
                client_secret=intent.client_secret,
            )

            if intent.status == "succeeded":
                payment.payment_status = "success"
                payment.paid_at = timezone.now()
                payment.save(update_fields=["payment_status", "paid_at"])

                order.status = "confirmed"
                order.is_paid = True
                order.save(update_fields=["status", "is_paid"])

                cart = Cart.objects.filter(user=request.user, is_active=True).first()
                if cart:
                    cart.items.all().delete()
                    cart.delete()
                    
                send_payment_success_email(order.customer.user, payment)    

                return Response({
                    "status": True,
                    "statusCode": 200,
                    "message": "Payment processing. Waiting for confirmation.",
                    "order_id": str(order.order_id),
                    "payment_id": payment.payment_id,
                    "payment_method": method_name,
                    "client_secret": payment.client_secret,
                    "payment_status": payment.payment_status
                }, status=status.HTTP_200_OK)

            elif intent.status == "requires_action":
                return Response({
                    "status": True,
                    "statusCode": 200,
                    "payment_status": "action_required",
                    "client_secret": intent.client_secret
                }, status=status.HTTP_200_OK)

            else:
                payment.payment_status = "failed"
                payment.save(update_fields=["payment_status"])
                send_payment_failed_email(request.user, payment)

                return Response({
                    "status": False,
                    "statusCode": 400,
                    "payment_status": "payment failed",
                    "stripe_status": intent.status
                }, status=status.HTTP_400_BAD_REQUEST)

        except stripe.error.CardError as e:
            return Response({
                "status": False,
                "statusCode": 402,
                "message": e.user_message
            }, status=status.HTTP_402_PAYMENT_REQUIRED)

        except stripe.error.StripeError as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response({
                "status": False,
                "statusCode": 500,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
  
        
@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)

    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        order_db_id = intent["metadata"].get("order_db_id")
        if not order_db_id:
            print("Metadata missing!")
            return HttpResponse(status=200)

        order_db_id = int(order_db_id)
        with transaction.atomic():
            try:
                order = Order.objects.select_for_update().get(id=int(order_db_id))
                payment = Payment.objects.get(payment_id=intent["id"])

                if payment.payment_status != "success":

                    payment.payment_status = "success"
                    payment.paid_at = timezone.now()
                    payment.save(update_fields=["payment_status", "paid_at"])

                    order.status = "confirmed"
                    order.is_paid = True
                    order.save(update_fields=["status", "is_paid"])

                    # CART DELETE HERE (FINAL SUCCESS ONLY)
                    cart = Cart.objects.filter(user=order.customer.user, is_active=True).first()
                    if cart:
                        cart.items.all().delete()
                        cart.delete()
                        
                    # Send Payment Success Email
                    send_payment_success_email(order.customer.user, payment)

            except Order.DoesNotExist:
                print("Order not found in webhook")

    elif event["type"] == "payment_intent.payment_failed":
        intent = event["data"]["object"]

        try:
            payment = Payment.objects.get(payment_id=intent["id"])
            payment.payment_status = "failed"
            payment.save(update_fields=["payment_status"])
            
            # Send Payment Failed Email
            if hasattr(payment, 'order') and payment.order and hasattr(payment.order, 'customer') and payment.order.customer:
                send_payment_failed_email(payment.order.customer.user, payment)

        except Payment.DoesNotExist:
            print("Payment not found")

    return HttpResponse(status=200)        

@csrf_exempt
def paypay_webhook(request):
    # Placeholder for PayPay webhook logic
    # TODO: Verify signature and update Order/Payment status to 'success'
    return HttpResponse(status=200)

@csrf_exempt
def np_kakebarai_webhook(request):
    # Placeholder for NP Kakebarai webhook logic
    # TODO: Verify signature and update Order/Payment status to 'success'
    return HttpResponse(status=200)

class UserPaymentListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    @extend_schema(
    tags=["Payments · User"],
    summary="List user payments",
    description="Returns paginated list of payments for logged-in user",
    responses={
        200: OpenApiResponse(description="Payments fetched successfully"),
        404: OpenApiResponse(description="No payment records found"),
        401: OpenApiResponse(description="Authentication required"),
    }
    )
    def get(self, request):
        try:
            # Corrected filter
            payments = Payment.objects.filter(
                order__customer__user=request.user
            ).order_by("-created_at", "-id")

            if not payments.exists():
                return Response({
                    "status": False,
                    "statusCode": 404,
                    "message": "No payment records found"
                }, status=status.HTTP_404_NOT_FOUND)

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

    @extend_schema(
        tags=["Payments · User"],
        summary="Get payment detail (User)",
        parameters=[OpenApiParameter(name="payment_id", type=str, location=OpenApiParameter.PATH)],
        responses={
            200: OpenApiResponse(description="Payment fetched successfully"),
            400: OpenApiResponse(description="payment_id required"),
            404: OpenApiResponse(description="Payment not found"),
            401: OpenApiResponse(description="Authentication required"),
        }
    )
    def get(self, request, payment_id):
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
                "message": "Something went wrong while fetching payment",
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
   
    def get(self, request,payment_id):
        try:
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

