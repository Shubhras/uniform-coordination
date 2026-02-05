# rentals/serializers.py
from rest_framework import serializers
from rental.models import OrderItem
# from .models import RentalUnit, RentalReservation
# class CreateRentalUnitsSerializer(serializers.Serializer):
#     product_id = serializers.IntegerField()
#     quantity = serializers.IntegerField(min_value=1)


# class RentalUnitSerializer(serializers.ModelSerializer):
#     product_name = serializers.CharField(source="product.productName", read_only=True)

#     class Meta:
#         model = RentalUnit
#         fields = "__all__"


# class RentalReservationSerializer(serializers.ModelSerializer):
#     product_name = serializers.CharField(source="rental_unit.product.productName", read_only=True)
#     rfid_code = serializers.CharField(source="rental_unit.rfid_code", read_only=True)

#     class Meta:
#         model = RentalReservation
#         fields = "__all__"


# class AvailabilityResponseSerializer(serializers.Serializer):
#     available_units = serializers.IntegerField()
#     requested_quantity = serializers.IntegerField()
#     is_available = serializers.BooleanField()


# from rest_framework import serializers
# class CreateReservationSerializer(serializers.Serializer):
#     product_id = serializers.IntegerField()
#     start_date = serializers.DateField()
#     end_date = serializers.DateField()
#     quantity = serializers.IntegerField(min_value=1)
#     order_id = serializers.CharField(max_length=120)


# from rest_framework import serializers
# from rental.models import RentalProduct


# class RentalReturnSerializer(serializers.Serializer):
#     rental_id = serializers.IntegerField(required=True)
#     condition_ok = serializers.BooleanField(default=True)

#     def validate_rental_id(self, value):
#         if not RentalProduct.objects.filter(id=value).exists():
#             raise serializers.ValidationError("RentalProduct with this ID does not exist.")
#         return value

# from rest_framework import serializers




#-------------------------------------------------------------------------------
#working serilizer
 
# class OrderItemReturnSerializer(serializers.Serializer):
#     order_item_id = serializers.IntegerField(required=True)
#     returned_quantity = serializers.IntegerField(required=True, min_value=1)
#     return_image = serializers.ImageField(required=False, allow_null=True)

#     def validate_order_item_id(self, value):
#         if not OrderItem.objects.filter(id=value).exists():
#             raise serializers.ValidationError("OrderItem with this ID does not exist.")
#         return value

#     def validate(self, attrs):
#         item = OrderItem.objects.get(id=attrs["order_item_id"])
#         returned_qty = attrs["returned_quantity"]

#         #Prevent over return
#         if item.returned_quantity + returned_qty > item.quantity:
#             raise serializers.ValidationError(
#                 "Returned quantity exceeds ordered quantity."
#             )

#         #Prevent return if already fully returned
#         if item.is_returned:
#             raise serializers.ValidationError(
#                 "This item is already fully returned."
#             )

#         return attrs



from rest_framework import serializers
from rental.models import OrderItem


# class OrderItemReturnSerializer(serializers.Serializer):
#     order_item_id = serializers.IntegerField(required=True)
#     returned_quantity = serializers.IntegerField(required=True, min_value=1)
#     return_image = serializers.ImageField(required=False, allow_null=True)

#     def validate_order_item_id(self, value):
#         if not OrderItem.objects.filter(id=value).exists():
#             raise serializers.ValidationError(
#                 "OrderItem with this ID does not exist."
#             )
#         return value

#     def validate(self, attrs):
#         item = OrderItem.objects.get(id=attrs["order_item_id"])
#         returned_qty = attrs["returned_quantity"]

#         # 1️⃣ Already fully returned
#         if item.is_returned:
#             raise serializers.ValidationError(
#                 "This item is already fully returned."
#             )

#         # 2️⃣ Remaining quantity check (PERMANENT FIX)
#         remaining_qty = item.quantity - item.returned_quantity

#         if returned_qty > remaining_qty:
#             raise serializers.ValidationError(
#                 f"Returned quantity exceeds remaining quantity ({remaining_qty})."
#             )

#         return attrs


# rental/serializers.py

from rest_framework import serializers
from rental.models import OrderItem


# class OrderItemReturnSerializer(serializers.Serializer):
#     order_item_id = serializers.IntegerField()
#     returned_quantity = serializers.IntegerField(min_value=1)
#     return_image = serializers.ImageField(required=False)

#     def validate(self, data):
#         item_id = data.get("order_item_id")

#         try:
#             OrderItem.objects.get(id=item_id)
#         except OrderItem.DoesNotExist:
#             raise serializers.ValidationError("Invalid order_item_id")

#         # ❌ NO QUANTITY CHECK HERE
#         # ❌ NO REMAINING CHECK HERE
#         # ❌ NO RETURNED CHECK HERE

#         return data


from rest_framework import serializers
from rental.models import OrderItem

class OrderItemReturnSerializer(serializers.Serializer):
    order_item_id = serializers.IntegerField(required=True)
    returned_quantity = serializers.IntegerField(required=True, min_value=1)
    return_image = serializers.ImageField(required=False, allow_null=True)

    def validate_order_item_id(self, value):
        if not OrderItem.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid order_item_id")
        return value
