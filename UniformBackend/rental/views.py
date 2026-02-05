# rental/views.py

from datetime import datetime, date
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db import transaction
from .models import *
from contracts.models import DocuSignEnvelope
from uniformAdmin.models import Product
from .serializers import *
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import RentalProduct
from .services import process_rental_return
from rest_framework import status
from rest_framework.response import Response
from django.db import transaction
from datetime import datetime, date, timedelta
from django.utils import timezone




from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from drf_spectacular.utils import extend_schema
from decimal import Decimal



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from django.db import transaction
from .models import RentalProduct
# from .serializers import RentalReturnSerializer
from .services import process_rental_return

# from uniformAdmin.permissions import IsAdministrator
from uniformAdmin.fabric import CustomPagination,IsAdministrator
from rest_framework_simplejwt.authentication import JWTAuthentication




#currently working
from decimal import Decimal
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from rental.models import OrderItem
from rental.serializers import OrderItemReturnSerializer
from rental.pricing_engine import RENT_PER_DAY, DAMAGE_CHARGE
from rental.docusign import update_docusign_charges
from uniformAdmin.fabric import IsAdministrator
from rest_framework_simplejwt.authentication import JWTAuthentication



# class MarkOrderItemReturnAPIView(APIView):
#     permission_classes = [IsAdministrator]
#     authentication_classes = [JWTAuthentication]

#     @extend_schema(
#         tags=["Rental Return"],
#         summary="Mark order item as returned with AI ready condition check",
#         request=OrderItemReturnSerializer,
#     )
#     @transaction.atomic
#     def post(self, request):
#         try:
#             serializer = OrderItemReturnSerializer(data=request.data)
#             serializer.is_valid(raise_exception=True)

#             item_id = serializer.validated_data["order_item_id"]
#             returned_qty = serializer.validated_data["returned_quantity"]
#             image = serializer.validated_data.get("return_image")

#             item = OrderItem.objects.select_for_update().get(id=item_id)

#             # ------------------ RETURN LOGIC ------------------

#             item.returned_quantity += returned_qty

#             if not image:
#                 item.condition = "lost"
#                 item.lost_charge += item.product.price * Decimal(returned_qty)
#             else:
#                 item.condition = "good"
#                 item.return_image = image

#             if item.returned_quantity >= item.quantity:
#                 item.is_returned = True

#             item.save()

#             # ------------------ ORDER UPDATE ------------------

#             order = item.order
#             order.returned_items = sum(i.returned_quantity for i in order.items.all())
#             order.pending_items = sum(i.quantity - i.returned_quantity for i in order.items.all())
#             order.is_return = order.pending_items == 0
#             order.lost_charges = sum(i.lost_charge for i in order.items.all())
#             order.damage_charges = sum(i.damage_charge for i in order.items.all())
#             order.save()

#             update_docusign_charges(order)

#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Item return processed successfully",
#                 "data": {
#                     "order_id": str(order.order_id),
#                     "item_id": item.id,
#                     "condition": item.condition,
#                     "returned_quantity": item.returned_quantity,
#                     "pending_items_in_order": order.pending_items,
#                     "order_is_return": order.is_return,
#                     "lost_charge": float(item.lost_charge),
#                     "damage_charge": float(item.damage_charge),
#                 }
#             }, status=status.HTTP_200_OK)

#         except OrderItem.DoesNotExist:
#             return Response({
#                 "status": False,
#                 "statusCode": 404,
#                 "message": "Order item not found"
#             }, status=status.HTTP_404_NOT_FOUND)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": "Return processing failed",
#                 "error": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



#-------------------------------------------------------------------------------

from decimal import Decimal
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from rental.models import OrderItem
from rental.serializers import OrderItemReturnSerializer
from rental.docusign import update_docusign_charges
from uniformAdmin.fabric import IsAdministrator
from rest_framework_simplejwt.authentication import JWTAuthentication
from .ai_condition_checker import ai_check_product_condition
#2nd corking without ai integration

# class MarkOrderItemReturnAPIView(APIView):
#     permission_classes = [IsAdministrator]
#     authentication_classes = [JWTAuthentication]

#     @extend_schema(
#         tags=["Rental Return"],
#         summary="Mark order item as returned with AI ready condition check",
#         request=OrderItemReturnSerializer,
#     )
#     @transaction.atomic
#     def post(self, request):
#         try:
#             serializer = OrderItemReturnSerializer(data=request.data)
#             serializer.is_valid(raise_exception=True)

#             item_id = serializer.validated_data["order_item_id"]
#             returned_qty = serializer.validated_data["returned_quantity"]
#             image = serializer.validated_data.get("return_image")

#             item = OrderItem.objects.select_for_update().get(id=item_id)

#             # ------------------ REMAINING QTY PROTECTION (CRITICAL FIX) ------------------
#             remaining = item.quantity - item.returned_quantity

#             if returned_qty > remaining:
#                 return Response({
#                     "status": False,
#                     "statusCode": 400,
#                     "message": f"Returned quantity exceeds remaining quantity ({remaining})."
#                 }, status=200)

#             # ------------------ RETURN LOGIC ------------------
#             item.returned_quantity += returned_qty

#             if not image:
#                 item.condition = "lost"
#                 item.lost_charge += item.product.price * Decimal(returned_qty)
#             else:
#                 item.condition = "good"  # AI will override later
#                 item.return_image = image

#             if item.returned_quantity >= item.quantity:
#                 item.is_returned = True

#             item.save()

#             # ------------------ ORDER UPDATE ------------------
#             order = item.order
#             order.returned_items = sum(i.returned_quantity for i in order.items.all())
#             order.pending_items = sum(i.quantity - i.returned_quantity for i in order.items.all())
#             order.is_return = order.pending_items == 0
#             order.lost_charges = sum(i.lost_charge for i in order.items.all())
#             order.damage_charges = sum(i.damage_charge for i in order.items.all())
#             order.save()

#             # ------------------ DOCUSIGN UPDATE ------------------
#             update_docusign_charges(order)

#             # ------------------ CLEAN & CLEAR RESPONSE ------------------
#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Item return processed successfully",
#                 "data": {
#                     "order_id": str(order.order_id),
#                     "item_id": item.id,
#                     "product_price": float(item.product.price),
#                     "item_quantity": item.quantity,
#                     "returned_quantity": item.returned_quantity,
#                     "remaining_quantity": item.quantity - item.returned_quantity,
#                     "total_items_in_order": sum(i.quantity for i in order.items.all()),
#                     "pending_items_in_order": order.pending_items,
#                     "condition": item.condition,
#                     "lost_charge": float(item.lost_charge),
#                     "damage_charge": float(item.damage_charge),
#                 }
#             }, status=status.HTTP_200_OK)

#         except OrderItem.DoesNotExist:
#             return Response({
#                 "status": False,
#                 "statusCode": 404,
#                 "message": "Order item not found"
#             }, status=status.HTTP_404_NOT_FOUND)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": "Return processing failed",
#                 "error": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#-----------------------------------------

#third working with AI integration



# class MarkOrderItemReturnAPIView(APIView):
#     permission_classes = [IsAdministrator]
#     authentication_classes = [JWTAuthentication]

#     @extend_schema(
#         tags=["Rental Return"],
#         summary="Mark order item as returned with AI ready condition check",
#         request=OrderItemReturnSerializer,
#     )
#     @transaction.atomic
#     def post(self, request):
#         try:
#             serializer = OrderItemReturnSerializer(data=request.data)
#             serializer.is_valid(raise_exception=True)

#             item_id = serializer.validated_data["order_item_id"]
#             returned_qty = serializer.validated_data["returned_quantity"]
#             image = serializer.validated_data.get("return_image")

#             item = OrderItem.objects.select_for_update().get(id=item_id)

#             # ------------------ REMAINING QTY PROTECTION (CRITICAL FIX) ------------------
#             remaining = item.quantity - item.returned_quantity

#             if returned_qty > remaining:
#                 return Response({
#                     "status": False,
#                     "statusCode": 400,
#                     "message": f"Returned quantity exceeds remaining quantity ({remaining})."
#                 }, status=200)

#             # ------------------ RETURN LOGIC ------------------
#             item.returned_quantity += returned_qty

#             # if not image:
#             #     item.condition = "lost"
#             #     item.lost_charge += item.product.price * Decimal(returned_qty)
#             # else:
#             #     item.condition = "good"  # AI will override later
#             #     item.return_image = image

#             if not image:
#                 item.condition = "lost"
#                 item.lost_charge += item.product.price * Decimal(returned_qty)
#             else:
#                 item.return_image = image

#                 ai_result = ai_check_product_condition(item.return_image.path)

#                 if ai_result == "damage":
#                     item.condition = "damage"
#                     item.damage_charge += 500 * Decimal(returned_qty)  # your rule
#                 else:
#                     item.condition = "good"    

#             #-----------------
#             if item.returned_quantity >= item.quantity:
#                 item.is_returned = True

#             item.save()

#             # ------------------ ORDER UPDATE ------------------
#             order = item.order
#             order.returned_items = sum(i.returned_quantity for i in order.items.all())
#             order.pending_items = sum(i.quantity - i.returned_quantity for i in order.items.all())
#             order.is_return = order.pending_items == 0
#             order.lost_charges = sum(i.lost_charge for i in order.items.all())
#             order.damage_charges = sum(i.damage_charge for i in order.items.all())
#             order.save()

#             # ------------------ DOCUSIGN UPDATE ------------------
#             update_docusign_charges(order)

#             # ------------------ CLEAN & CLEAR RESPONSE ------------------
#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Item return processed successfully",
#                 "data": {
#                     "order_id": str(order.order_id),
#                     "item_id": item.id,
#                     "product_price": float(item.product.price),
#                     "item_quantity": item.quantity,
#                     "returned_quantity": item.returned_quantity,
#                     "remaining_quantity": item.quantity - item.returned_quantity,
#                     "total_items_in_order": sum(i.quantity for i in order.items.all()),
#                     "pending_items_in_order": order.pending_items,
#                     "condition": item.condition,
#                     "lost_charge": float(item.lost_charge),
#                     "damage_charge": float(item.damage_charge),
#                 }
#             }, status=status.HTTP_200_OK)

#         except OrderItem.DoesNotExist:
#             return Response({
#                 "status": False,
#                 "statusCode": 404,
#                 "message": "Order item not found"
#             }, status=status.HTTP_404_NOT_FOUND)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": "Return processing failed",
#                 "error": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#----------------------
#final working API




# class MarkOrderItemReturnAPIView(APIView):
#     permission_classes = [IsAdministrator]
#     authentication_classes = [JWTAuthentication]

#     @extend_schema(
#         tags=["Rental Return"],
#         summary="Mark order item as returned with AI ready condition check",
#         request=OrderItemReturnSerializer,
#     )
#     @transaction.atomic
#     def post(self, request):
#         try:
#             serializer = OrderItemReturnSerializer(data=request.data)
#             serializer.is_valid(raise_exception=True)

#             item_id = serializer.validated_data["order_item_id"]
#             returned_qty = serializer.validated_data["returned_quantity"]
#             image = serializer.validated_data.get("return_image")

#             item = OrderItem.objects.select_for_update().get(id=item_id)

#             # ------------------ REMAINING QTY PROTECTION (CRITICAL FIX) ------------------
#             remaining = item.quantity - item.returned_quantity

#             if returned_qty > remaining:
#                 return Response({
#                     "status": False,
#                     "statusCode": 400,
#                     "message": f"Returned quantity exceeds remaining quantity ({remaining})."
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # ------------------ RETURN LOGIC ------------------
#             item.returned_quantity += returned_qty

#             if not image:
#                 item.condition = "lost"
#                 item.lost_charge += item.product.price * Decimal(returned_qty)

#             else:
#                 item.return_image = image

#                 #  FIX 1: Correct AI call (original vs return image)
#                 ai_result = ai_check_product_condition(
#                     item.product.image.path,
#                     item.return_image.path
#                 )

#                 if ai_result == "damage":
#                     item.condition = "damage"

#                     #  FIX 3: Charge ONLY for current returned qty
#                     item.damage_charge += 500 * Decimal(returned_qty)
#                 else:
#                     item.condition = "good"

#             #  FIX 4: Strict equality only
#             if item.returned_quantity == item.quantity:
#                 item.is_returned = True

#             item.save()

#             # ------------------ ORDER UPDATE ------------------
#             order = item.order
#             order.returned_items = sum(i.returned_quantity for i in order.items.all())
#             order.pending_items = sum(i.quantity - i.returned_quantity for i in order.items.all())
#             order.is_return = order.pending_items == 0
#             order.lost_charges = sum(i.lost_charge for i in order.items.all())
#             order.damage_charges = sum(i.damage_charge for i in order.items.all())
#             order.save()

#             # ------------------ DOCUSIGN UPDATE ------------------
#             update_docusign_charges(order)

#             # ------------------ CLEAN & CLEAR RESPONSE ------------------
#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Item return processed successfully",
#                 "data": {
#                     "order_id": str(order.order_id),
#                     "item_id": item.id,
#                     "product_price": float(item.product.price),
#                     "item_quantity": item.quantity,
#                     "returned_quantity": item.returned_quantity,
#                     "remaining_quantity": item.quantity - item.returned_quantity,
#                     "total_items_in_order": sum(i.quantity for i in order.items.all()),
#                     "pending_items_in_order": order.pending_items,
#                     "condition": item.condition,
#                     "lost_charge": float(item.lost_charge),
#                     "damage_charge": float(item.damage_charge),
#                 }
#             }, status=status.HTTP_200_OK)

#         except OrderItem.DoesNotExist:
#             return Response({
#                 "status": False,
#                 "statusCode": 404,
#                 "message": "Order item not found"
#             }, status=status.HTTP_404_NOT_FOUND)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": "Return processing failed",
#                 "error": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
from uniformAdmin.models import*

# class MarkOrderItemReturnAPIView(APIView):
#     permission_classes = [IsAdministrator]
#     authentication_classes = [JWTAuthentication]

#     @extend_schema(
#         tags=["Rental Return"],
#         summary="Mark order item as returned with AI ready condition check",
#         request=OrderItemReturnSerializer,
#     )
#     @transaction.atomic
#     def post(self, request):
#         try:
#             serializer = OrderItemReturnSerializer(data=request.data)
#             serializer.is_valid(raise_exception=True)

#             item_id = serializer.validated_data["order_item_id"]
#             returned_qty = serializer.validated_data["returned_quantity"]
#             image = serializer.validated_data.get("return_image")

#             item = OrderItem.objects.select_for_update().get(id=item_id)

#             # ------------------ REMAINING QTY PROTECTION ------------------
#             remaining = item.quantity - item.returned_quantity

#             if returned_qty > remaining:
#                 return Response({
#                     "status": False,
#                     "statusCode": 400,
#                     "message": f"Returned quantity exceeds remaining quantity ({remaining})."
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # ------------------ RETURN LOGIC ------------------
#             item.returned_quantity += returned_qty

#             if not image:
#                 item.condition = "lost"
#                 item.lost_charge += item.product.price * Decimal(returned_qty)

#             else:
#                 item.return_image = image

#                 # FIXED AI IMAGE COMPARISON (PERMANENT)
#                 if not item.product.ProductImage:
#                     raise Exception("Original product image not found for AI comparison.")

#                 ai_result = ai_check_product_condition(
#                     item.product.ProductImage.path,
#                     item.return_image.path
#                 )

#                 if ai_result == "damage":
#                     item.condition = "damage"
#                     item.damage_charge += 500 * Decimal(returned_qty)
#                 else:
#                     item.condition = "good"

#             if item.returned_quantity == item.quantity:
#                 item.is_returned = True

#             item.save()

#             # ------------------ ORDER UPDATE ------------------
#             order = item.order
#             order.returned_items = sum(i.returned_quantity for i in order.items.all())
#             order.pending_items = sum(i.quantity - i.returned_quantity for i in order.items.all())
#             order.is_return = order.pending_items == 0
#             order.lost_charges = sum(i.lost_charge for i in order.items.all())
#             order.damage_charges = sum(i.damage_charge for i in order.items.all())
#             order.save()

#             # ------------------ DOCUSIGN UPDATE ------------------
#             update_docusign_charges(order)

#             # ------------------ RESPONSE ------------------
#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Item return processed successfully",
#                 "data": {
#                     "order_id": str(order.order_id),
#                     "item_id": item.id,
#                     "product_price": float(item.product.price),
#                     "item_quantity": item.quantity,
#                     "returned_quantity": item.returned_quantity,
#                     "remaining_quantity": item.quantity - item.returned_quantity,
#                     "total_items_in_order": sum(i.quantity for i in order.items.all()),
#                     "pending_items_in_order": order.pending_items,
#                     "condition": item.condition,
#                     "lost_charge": float(item.lost_charge),
#                     "damage_charge": float(item.damage_charge),
#                 }
#             }, status=status.HTTP_200_OK)

#         except OrderItem.DoesNotExist:
#             return Response({
#                 "status": False,
#                 "statusCode": 404,
#                 "message": "Order item not found"
#             }, status=status.HTTP_404_NOT_FOUND)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": "Return processing failed",
#                 "error": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# class MarkOrderItemReturnAPIView(APIView):
#     permission_classes = [IsAdministrator]
#     authentication_classes = [JWTAuthentication]

#     @extend_schema(
#         tags=["Rental Return"],
#         summary="Mark order item as returned with AI ready condition check",
#         request=OrderItemReturnSerializer,
#     )
#     @transaction.atomic
#     def post(self, request):
#         try:
#             serializer = OrderItemReturnSerializer(data=request.data)
#             serializer.is_valid(raise_exception=True)

#             item_id = serializer.validated_data["order_item_id"]
#             returned_qty = serializer.validated_data["returned_quantity"]
#             image = serializer.validated_data.get("return_image")

#             item = OrderItem.objects.select_for_update().get(id=item_id)

#             # ------------------ REMAINING QTY PROTECTION ------------------
#             remaining = item.quantity - item.returned_quantity
#             if returned_qty > remaining:
#                 return Response({
#                     "status": False,
#                     "statusCode": 400,
#                     "message": f"Returned quantity exceeds remaining quantity ({remaining})."
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # ------------------ RETURN LOGIC ------------------
#             item.returned_quantity += returned_qty

#             if not image:
#                 # LOST CASE
#                 item.condition = "lost"
#                 item.lost_charge += item.product.price * Decimal(returned_qty)

#             else:
#                 # IMAGE PROVIDED → AI CHECK
#                 item.return_image = image

#                 product_image = item.product.ProductImage
#                 if not product_image or not product_image.name:
#                     return Response({
#                         "status": False,
#                         "statusCode": 400,
#                         "message": "Original product image is missing. Upload product image before return."
#                     }, status=status.HTTP_400_BAD_REQUEST)

#                 ai_result = ai_check_product_condition(
#                     product_image.path,
#                     item.return_image.path
#                 )

#                 if ai_result == "damage":
#                     item.condition = "damage"
#                     item.damage_charge += Decimal(500) * Decimal(returned_qty)
#                 else:
#                     item.condition = "good"

#             # ------------------ FINAL RETURN STATUS ------------------
#             if item.returned_quantity == item.quantity:
#                 item.is_returned = True

#             item.save()

#             # ------------------ ORDER UPDATE ------------------
#             order = item.order
#             order.returned_items = sum(i.returned_quantity for i in order.items.all())
#             order.pending_items = sum(i.quantity - i.returned_quantity for i in order.items.all())
#             order.is_return = order.pending_items == 0
#             order.lost_charges = sum(i.lost_charge for i in order.items.all())
#             order.damage_charges = sum(i.damage_charge for i in order.items.all())
#             order.save()

#             # ------------------ DOCUSIGN UPDATE ------------------
#             update_docusign_charges(order)

#             # ------------------ SUCCESS RESPONSE ------------------
#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Item return processed successfully",
#                 "data": {
#                     "order_id": str(order.order_id),
#                     "item_id": item.id,
#                     "product_price": float(item.product.price),
#                     "item_quantity": item.quantity,
#                     "returned_quantity": item.returned_quantity,
#                     "remaining_quantity": item.quantity - item.returned_quantity,
#                     "total_items_in_order": sum(i.quantity for i in order.items.all()),
#                     "pending_items_in_order": order.pending_items,
#                     "condition": item.condition,
#                     "lost_charge": float(item.lost_charge),
#                     "damage_charge": float(item.damage_charge),
#                 }
#             }, status=status.HTTP_200_OK)

#         except OrderItem.DoesNotExist:
#             return Response({
#                 "status": False,
#                 "statusCode": 404,
#                 "message": "Order item not found"
#             }, status=status.HTTP_404_NOT_FOUND)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": "Return processing failed",
#                 "error": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


import os
# from decimal import Decimal
# from django.db import transaction
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
from rest_framework.exceptions import ValidationError
# from drf_spectacular.utils import extend_schema

# from rental.models import OrderItem
# from rental.serializers import OrderItemReturnSerializer
# from rental.docusign import update_docusign_charges
# from uniformAdmin.fabric import IsAdministrator
# from rest_framework_simplejwt.authentication import JWTAuthentication
# # from uniformAdmin.ai_integration import ai_check_product_condition  # your AI function


# class MarkOrderItemReturnAPIView(APIView):
#     permission_classes = [IsAdministrator]
#     authentication_classes = [JWTAuthentication]

#     @extend_schema(
#         tags=["Rental Return"],
#         summary="Mark order item as returned with AI ready condition check",
#         request=OrderItemReturnSerializer,
#     )
#     @transaction.atomic
#     def post(self, request):
#         try:
#             serializer = OrderItemReturnSerializer(data=request.data)

#             # ------------------ VALIDATION ------------------
#             if not serializer.is_valid():
#                 if "order_item_id" in serializer.errors:
#                     return Response({
#                         "status": False,
#                         "statusCode": 400,
#                         "message": "Invalid Order Id"
#                     }, status=status.HTTP_400_BAD_REQUEST)

#                 return Response({
#                     "status": False,
#                     "statusCode": 400,
#                     "message": "Invalid request data",
#                     "error": serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # ------------------ FETCH DATA ------------------
#             item_id = serializer.validated_data["order_item_id"]
#             returned_qty = serializer.validated_data["returned_quantity"]
#             image = serializer.validated_data.get("return_image")

#             try:
#                 item = OrderItem.objects.select_for_update().get(id=item_id)
#             except OrderItem.DoesNotExist:
#                 return Response({
#                     "status": False,
#                     "statusCode": 404,
#                     "message": "Order item not found"
#                 }, status=status.HTTP_404_NOT_FOUND)

#             # ------------------ REMAINING QTY PROTECTION ------------------
#             remaining = item.quantity - item.returned_quantity
#             if returned_qty > remaining:
#                 return Response({
#                     "status": False,
#                     "statusCode": 400,
#                     "message": f"Returned quantity exceeds remaining quantity ({remaining})."
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # ------------------ RETURN LOGIC ------------------
#             item.returned_quantity += returned_qty

#             if not image:
#                 # LOST CASE
#                 item.condition = "lost"
#                 item.lost_charge += item.product.price * Decimal(returned_qty)
#             else:
#                 # IMAGE PROVIDED → AI CHECK
#                 item.return_image = image

#                 product_image = item.product.ProductImage

#                 if not product_image or not product_image.name or not hasattr(product_image, "path") or not os.path.exists(product_image.path):
#                     return Response({
#                         "status": False,
#                         "statusCode": 400,
#                         "message": "Original product image is missing. Upload product image before return."
#                     }, status=status.HTTP_400_BAD_REQUEST)

#                 # AI COMPARISON
#                 ai_result = ai_check_product_condition(
#                     product_image.path,
#                     item.return_image.path
#                 )

#                 if ai_result == "damage":
#                     item.condition = "damage"
#                     # Charge ONLY for current returned_qty
#                     item.damage_charge += Decimal(500) * Decimal(returned_qty)
#                 else:
#                     item.condition = "good"

#             # FINAL RETURN CHECK
#             if item.returned_quantity == item.quantity:
#                 item.is_returned = True

#             item.save()

#             # ------------------ ORDER UPDATE ------------------
#             order = item.order
#             order.returned_items = sum(i.returned_quantity for i in order.items.all())
#             order.pending_items = sum(i.quantity - i.returned_quantity for i in order.items.all())
#             order.is_return = order.pending_items == 0
#             order.lost_charges = sum(i.lost_charge for i in order.items.all())
#             order.damage_charges = sum(i.damage_charge for i in order.items.all())
#             order.save()

#             # ------------------ DOCUSIGN UPDATE ------------------
#             update_docusign_charges(order)

#             # ------------------ SUCCESS RESPONSE ------------------
#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Item return processed successfully",
#                 "data": {
#                     "order_id": str(order.order_id),
#                     "item_id": item.id,
#                     "product_price": float(item.product.price),
#                     "item_quantity": item.quantity,
#                     "returned_quantity": item.returned_quantity,
#                     "remaining_quantity": item.quantity - item.returned_quantity,
#                     "total_items_in_order": sum(i.quantity for i in order.items.all()),
#                     "pending_items_in_order": order.pending_items,
#                     "condition": item.condition,
#                     "lost_charge": float(item.lost_charge),
#                     "damage_charge": float(item.damage_charge),
#                 }
#             }, status=status.HTTP_200_OK)

#         # ------------------ EXCEPTIONS ------------------
#         except ValidationError as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 400,
#                 "message": "Invalid request data",
#                 "error": e.detail
#             }, status=status.HTTP_400_BAD_REQUEST)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": "Return processing failed",
#                 "error": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



import os
from decimal import Decimal
from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from rest_framework.exceptions import ValidationError

from rental.models import OrderItem
from rental.serializers import OrderItemReturnSerializer
from rental.docusign import update_docusign_charges
from uniformAdmin.fabric import IsAdministrator
from rest_framework_simplejwt.authentication import JWTAuthentication
from rental.pricing_engine import RENT_PER_DAY, DAMAGE_CHARGE
from rental.ai_condition_checker import ai_check_product_condition  # assuming your AI helper


# class MarkOrderItemReturnAPIView(APIView):
#     permission_classes = [IsAdministrator]
#     authentication_classes = [JWTAuthentication]

#     @extend_schema(
#         tags=["Rental Return"],
#         summary="Mark order item as returned with AI ready condition check",
#         request=OrderItemReturnSerializer,
#     )
#     @transaction.atomic
#     def post(self, request):
#         try:
#             serializer = OrderItemReturnSerializer(data=request.data)

#             # ------------------ VALIDATION ------------------
#             if not serializer.is_valid():
#                 if "order_item_id" in serializer.errors:
#                     return Response({
#                         "status": False,
#                         "statusCode": 400,
#                         "message": "Invalid Order Id"
#                     }, status=status.HTTP_400_BAD_REQUEST)

#                 return Response({
#                     "status": False,
#                     "statusCode": 400,
#                     "message": "Invalid request data",
#                     "error": serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # ------------------ FETCH DATA ------------------
#             item_id = serializer.validated_data["order_item_id"]
#             returned_qty = serializer.validated_data["returned_quantity"]
#             image = serializer.validated_data.get("return_image")

#             try:
#                 item = OrderItem.objects.select_for_update().get(id=item_id)
#             except OrderItem.DoesNotExist:
#                 return Response({
#                     "status": False,
#                     "statusCode": 404,
#                     "message": "Order item not found"
#                 }, status=status.HTTP_404_NOT_FOUND)

#             # ------------------ REMAINING QTY PROTECTION ------------------
#             remaining = item.quantity - item.returned_quantity
#             if returned_qty > remaining:
#                 return Response({
#                     "status": False,
#                     "statusCode": 400,
#                     "message": f"Returned quantity exceeds remaining quantity ({remaining})."
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # ------------------ RETURN LOGIC ------------------
#             item.returned_quantity += returned_qty

#             if not image:
#                 # LOST CASE
#                 item.condition = "lost"
#                 item.lost_charge += item.product.price * Decimal(returned_qty)
#             else:
#                 # IMAGE PROVIDED → AI CHECK
#                 item.return_image = image
#                 item.save()  # Save first to ensure return_image.path exists

#                 product_image = item.product.ProductImage

#                 # ------------------ SAFE IMAGE CHECK ------------------
#                 if not product_image or not product_image.name or not hasattr(product_image, "path") or not os.path.exists(product_image.path):
#                     return Response({
#                         "status": False,
#                         "statusCode": 400,
#                         "message": "Original product image is missing. Upload product image before return."
#                     }, status=status.HTTP_400_BAD_REQUEST)

#                 if not os.path.exists(item.return_image.path):
#                     return Response({
#                         "status": False,
#                         "statusCode": 400,
#                         "message": "Uploaded return image is invalid or missing."
#                     }, status=status.HTTP_400_BAD_REQUEST)

#                 # ------------------ AI COMPARISON ------------------
#                 ai_result = ai_check_product_condition(
#                     product_image.path,
#                     item.return_image.path
#                 )

#                 if ai_result == "damage":
#                     item.condition = "damage"
#                     item.damage_charge += Decimal(500) * Decimal(returned_qty)
#                 else:
#                     item.condition = "good"

#             # ------------------ FINAL RETURN CHECK ------------------
#             if item.returned_quantity == item.quantity:
#                 item.is_returned = True

#             item.save()

#             # ------------------ ORDER UPDATE ------------------
#             order = item.order
#             order.returned_items = sum(i.returned_quantity for i in order.items.all())
#             order.pending_items = sum(i.quantity - i.returned_quantity for i in order.items.all())
#             order.is_return = order.pending_items == 0
#             order.lost_charges = sum(i.lost_charge for i in order.items.all())
#             order.damage_charges = sum(i.damage_charge for i in order.items.all())
#             order.save()

#             # ------------------ DOCUSIGN UPDATE ------------------
#             update_docusign_charges(order)

#             # ------------------ SUCCESS RESPONSE ------------------
#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Item return processed successfully",
#                 "data": {
#                     "order_id": str(order.order_id),
#                     "item_id": item.id,
#                     "product_price": float(item.product.price),
#                     "item_quantity": item.quantity,
#                     "returned_quantity": item.returned_quantity,
#                     "remaining_quantity": item.quantity - item.returned_quantity,
#                     "total_items_in_order": sum(i.quantity for i in order.items.all()),
#                     "pending_items_in_order": order.pending_items,
#                     "condition": item.condition,
#                     "lost_charge": float(item.lost_charge),
#                     "damage_charge": float(item.damage_charge),
#                 }
#             }, status=status.HTTP_200_OK)

#         # ------------------ EXCEPTIONS ------------------
#         except ValidationError as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 400,
#                 "message": "Invalid request data",
#                 "error": e.detail
#             }, status=status.HTTP_400_BAD_REQUEST)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": "Return processing failed",
#                 "error": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# class MarkOrderItemReturnAPIView(APIView):
#     permission_classes = [IsAdministrator]
#     authentication_classes = [JWTAuthentication]

#     @extend_schema(
#         tags=["Rental Return"],
#         summary="Mark order item as returned with AI ready condition check",
#         request=OrderItemReturnSerializer,
#     )
#     @transaction.atomic
#     def post(self, request):
#         try:
#             serializer = OrderItemReturnSerializer(data=request.data)

#             # ------------------ VALIDATION ------------------
#             if not serializer.is_valid():
#                 if "order_item_id" in serializer.errors:
#                     return Response({
#                         "status": False,
#                         "statusCode": 400,
#                         "message": "Invalid Order Id"
#                     }, status=status.HTTP_400_BAD_REQUEST)

#                 return Response({
#                     "status": False,
#                     "statusCode": 400,
#                     "message": "Invalid request data",
#                     "error": serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # ------------------ FETCH DATA ------------------
#             item_id = serializer.validated_data["order_item_id"]
#             returned_qty = serializer.validated_data["returned_quantity"]
#             image = serializer.validated_data.get("return_image")

#             try:
#                 item = OrderItem.objects.select_for_update().get(id=item_id)
#             except OrderItem.DoesNotExist:
#                 return Response({
#                     "status": False,
#                     "statusCode": 404,
#                     "message": "Order item not found"
#                 }, status=status.HTTP_404_NOT_FOUND)

#             remaining = item.quantity - item.returned_quantity
#             if remaining <= 0:
#                 return Response({
#                     "status": False,
#                     "statusCode": 400,
#                     "message": "No remaining quantity left to return."
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             if returned_qty > remaining:
#                 return Response({
#                     "status": False,
#                     "statusCode": 400,
#                     "message": f"Returned quantity exceeds remaining quantity ({remaining})."
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # ------------------ RETURN LOGIC ------------------
#             item.returned_quantity += returned_qty

#             if not image:
#                 # LOST CASE
#                 item.condition = "lost"
#                 item.lost_charge += item.product.price * Decimal(returned_qty)
#             else:
#                 # IMAGE PROVIDED → AI CHECK
#                 item.return_image = image
#                 item.save()  # save to ensure return_image.path exists

#                 product_image = item.product.ProductImage
#                 if not product_image or not product_image.name or not hasattr(product_image, "path") or not os.path.exists(product_image.path):
#                     return Response({
#                         "status": False,
#                         "statusCode": 400,
#                         "message": "Original product image is missing. Upload product image before return."
#                     }, status=status.HTTP_400_BAD_REQUEST)

#                 if not os.path.exists(item.return_image.path):
#                     return Response({
#                         "status": False,
#                         "statusCode": 400,
#                         "message": "Uploaded return image is invalid or missing."
#                     }, status=status.HTTP_400_BAD_REQUEST)

#                 # AI COMPARISON
#                 ai_result = ai_check_product_condition(
#                     product_image.path,
#                     item.return_image.path
#                 )

#                 if ai_result == "damage":
#                     item.condition = "damage"
#                     item.damage_charge += Decimal(500) * Decimal(returned_qty)
#                 else:
#                     item.condition = "good"

#             # FINAL RETURN CHECK
#             if item.returned_quantity == item.quantity:
#                 item.is_returned = True

#             item.save()

#             # ------------------ ORDER UPDATE ------------------
#             order = item.order
#             order.returned_items = sum(i.returned_quantity for i in order.items.all())
#             order.pending_items = sum(i.quantity - i.returned_quantity for i in order.items.all())
#             order.is_return = order.pending_items == 0
#             order.lost_charges = sum(i.lost_charge for i in order.items.all())
#             order.damage_charges = sum(i.damage_charge for i in order.items.all())
#             order.save()

#             # ------------------ DOCUSIGN UPDATE ------------------
#             update_docusign_charges(order)

#             # ------------------ SUCCESS RESPONSE ------------------
#             return Response({
#                 "status": True,
#                 "statusCode": 200,
#                 "message": "Item return processed successfully",
#                 "data": {
#                     "order_id": str(order.order_id),
#                     "item_id": item.id,
#                     "product_price": float(item.product.price),
#                     "item_quantity": item.quantity,
#                     "returned_quantity": item.returned_quantity,
#                     "remaining_quantity": item.quantity - item.returned_quantity,
#                     "total_items_in_order": sum(i.quantity for i in order.items.all()),
#                     "pending_items_in_order": order.pending_items,
#                     "condition": item.condition,
#                     "lost_charge": float(item.lost_charge),
#                     "damage_charge": float(item.damage_charge),
#                 }
#             }, status=status.HTTP_200_OK)

#         except ValidationError as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 400,
#                 "message": "Invalid request data",
#                 "error": e.detail
#             }, status=status.HTTP_400_BAD_REQUEST)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "statusCode": 500,
#                 "message": "Return processing failed",
#                 "error": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# rental/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db import transaction

from rental.serializers import OrderItemReturnSerializer
from rental.models import OrderItem
from rental.services import process_rental_return
# from uniformAdmin.permissions import IsAdministrator


# class MarkOrderItemReturnAPIView(APIView):
#     permission_classes = [IsAdministrator]
#     authentication_classes = [JWTAuthentication]

#     @transaction.atomic
#     def post(self, request):
#         serializer = OrderItemReturnSerializer(data=request.data)

#         if not serializer.is_valid():
#             return Response({
#                 "status": False,
#                 "statusCode": 400,
#                 "message": "Invalid request",
#                 "error": serializer.errors
#             }, status=status.HTTP_400_BAD_REQUEST)

#         item_id = serializer.validated_data["order_item_id"]
#         returned_qty = serializer.validated_data["returned_quantity"]
#         return_image = serializer.validated_data.get("return_image")

#         try:
#             item = OrderItem.objects.select_for_update().get(id=item_id)
#         except OrderItem.DoesNotExist:
#             return Response({
#                 "status": False,
#                 "statusCode": 404,
#                 "message": "Order item not found"
#             }, status=status.HTTP_404_NOT_FOUND)

#         remaining = item.quantity - item.returned_quantity
#         if returned_qty > remaining:
#             return Response({
#                 "status": False,
#                 "statusCode": 400,
#                 "message": f"Returned quantity exceeds remaining quantity ({remaining})"
#             }, status=status.HTTP_400_BAD_REQUEST)

#         # 🔥 SINGLE SOURCE OF TRUTH
#         process_rental_return(
#             order_item=item,
#             returned_qty=returned_qty,
#             return_image=return_image
#         )

#         order = item.order

#         return Response({
#             "status": True,
#             "statusCode": 200,
#             "message": "Item return processed successfully",
#             "data": {
#                 "order_id": str(order.order_id),
#                 "item_id": item.id,
#                 "returned_quantity": item.returned_quantity,
#                 "remaining_quantity": item.quantity - item.returned_quantity,
#                 "pending_items_in_order": order.pending_items,
#                 "is_return": order.is_return
#             }
#         }, status=status.HTTP_200_OK)


#------------------------------------------
# rental/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from rental.serializers import OrderItemReturnSerializer
from rental.services import process_rental_return
from userhub.models import OrderItem
# from authentication.permissions import IsAdministrator
# from authentication.jwt import JWTAuthentication


class MarkOrderItemReturnAPIView(APIView):
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    @transaction.atomic
    def post(self, request):
        serializer = OrderItemReturnSerializer(data=request.data)

        if not serializer.is_valid():
            return Response({
                "status": False,
                "statusCode": 400,
                "message": "Invalid request",
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        item_id = serializer.validated_data["order_item_id"]
        returned_qty = serializer.validated_data["returned_quantity"]
        return_image = serializer.validated_data.get("return_image")

        try:
            item = OrderItem.objects.select_for_update().get(id=item_id)
        except OrderItem.DoesNotExist:
            return Response({
                "status": False,
                "statusCode": 404,
                "message": "Order item not found"
            }, status=status.HTTP_404_NOT_FOUND)

        remaining = item.quantity - item.returned_quantity
        if returned_qty > remaining:
            return Response({
                "status": False,
                "statusCode": 400,
                "message": f"Returned quantity exceeds remaining quantity ({remaining})"
            }, status=status.HTTP_400_BAD_REQUEST)

        process_rental_return(
            order_item=item,
            returned_qty=returned_qty,
            return_image=return_image
        )

        order = item.order

        return Response({
            "status": True,
            "statusCode": 200,
            "message": "Item return processed successfully",
            "data": {
                "order_id": str(order.order_id),
                "item_id": item.id,
                "product_name": item.product.productName,
                "product_image": item.product.ProductImage.url if item.product.ProductImage else None,
                "product_price": float(item.price),
                "item_quantity": item.quantity,
                "returned_quantity": item.returned_quantity,
                "remaining_quantity": item.quantity - item.returned_quantity,
                "total_items": sum(i.quantity for i in order.items.all()),
                "total_items_after_return": order.pending_items,
                "condition": item.condition,
                "lost_charge": float(item.lost_charge),
                "damage_charge": float(item.damage_charge),
                "is_return": order.is_return
            }
        }, status=status.HTTP_200_OK)
