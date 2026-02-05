# Create your models here.
# rental/models.py
from django.db import models
from django.utils import timezone
from userhub.models import *
from django.db import models
from userhub.models import Order, CartItem
from uniformAdmin.models import Product



# class RentalUnit(models.Model):
#     """
#     ONE physical rentable unit tracked by RFID.
#     This is an operational model, not a catalog model.
#     """

#     product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="rental_units")

#     rfid_code = models.CharField(max_length=120, unique=True)

#     # Availability is DERIVED, not manually set (important for Step 2)
#     is_available = models.BooleanField(default=True)

#     CONDITION_CHOICES = [
#         ("clean", "Clean & Ready"),
#         ("in_use", "Currently Rented"),
#         ("returned_dirty", "Returned - Needs Cleaning"),
#         ("inspection", "Under Inspection"),
#         ("damaged", "Damaged"),
#         ("discarded", "Discarded"),
#     ]
#     condition = models.CharField(max_length=30, choices=CONDITION_CHOICES, default="clean")

#     last_checked_at = models.DateTimeField(null=True, blank=True)

#     # Your project standard fields
#     is_active = models.BooleanField(default=True)
#     isDeleted = models.BooleanField(default=False)

#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def mark_checked(self):
#         self.last_checked_at = timezone.now()
#         self.save()

#     def __str__(self):
#         return f"{self.product.productName} | RFID: {self.rfid_code}"


# class RentalReservation(models.Model):
#     """
#     Blocks a RentalUnit for a specific date range.
#     This is the real availability engine for rental.
#     """

#     rental_unit = models.ForeignKey(
#         RentalUnit,
#         on_delete=models.CASCADE,
#         related_name="reservations"
#     )

#     start_date = models.DateField()
#     end_date = models.DateField()

#     # will connect later with Order model
#     order_id = models.CharField(max_length=120)

#     # project standard fields
#     is_active = models.BooleanField(default=True)
#     isDeleted = models.BooleanField(default=False)

#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.rental_unit.rfid_code} | {self.start_date} → {self.end_date}"


# class RentalShipment(models.Model):
#     reservation = models.ForeignKey("RentalReservation", on_delete=models.CASCADE)
#     shipped_at = models.DateTimeField(auto_now_add=True)
#     tracking_id = models.CharField(max_length=200)
#     shipped_by = models.ForeignKey(Users, on_delete=models.SET_NULL, null=True)

#     def __str__(self):
#         return f"Shipment for {self.reservation.id}"


# class RentalRFIDItem(models.Model):
#     rental_unit = models.ForeignKey(RentalUnit, on_delete=models.CASCADE)
#     rfid_code = models.CharField(max_length=200, unique=True)
#     is_active = models.BooleanField(default=True)  # removed if damaged badly

#     def __str__(self):
#         return self.rfid_code


# class ReturnScanLog(models.Model):
#     reservation = models.ForeignKey("RentalReservation", on_delete=models.CASCADE)
#     rfid_item = models.ForeignKey(RentalRFIDItem, on_delete=models.CASCADE)
#     scanned_at = models.DateTimeField(auto_now_add=True)
#     condition = models.CharField(
#         max_length=50,
#         choices=(
#             ("good", "Good"),
#             ("damaged", "Damaged"),
#             ("lost", "Lost"),
#         ),
#     )


class RentalProduct(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    start_date = models.DateField()
    end_date = models.DateField()

    quantity = models.IntegerField()

    is_returned = models.BooleanField(default=False)
    returned_at = models.DateTimeField(null=True, blank=True)

    # Future AI damage check
    before_image = models.ImageField(upload_to="rental/before/", null=True, blank=True)
    after_image = models.ImageField(upload_to="rental/after/", null=True, blank=True)
    is_damaged = models.BooleanField(default=False)

    extra_charges = models.FloatField(default=0)
    lost_charges = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return (
            f"RentalProduct {self.id} | "
            f"Order {self.order.order_id} | "
            f"{self.product} | Qty {self.quantity}"
        )
        