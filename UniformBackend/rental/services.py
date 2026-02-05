# rental/services.py
# from django.utils import timezone
# from datetime import date
# from .models import RentalProduct
# # from products.models import Product
# from rental.docusign import (send_rental_docusign_envelope,send_rental_return_docusign,)


# def create_rental_entries(order):
#     """
#     Call this just after order.save()

#     Rental applies ONLY if start_date & return_date exist
#     Otherwise → permanent purchase
#     """

#     if not order.start_date or not order.return_date:
#         return  # ❌ Not a rental order

#     for item in order.items.all():
#         # 🔻 Reduce product quantity immediately
#         product = item.product
#         product.quantity -= item.quantity
#         product.save()

#         # ✅ Track rental product
#         RentalProduct.objects.create(
#             order=order,
#             order_item=item,
#             product=product,
#             start_date=order.start_date,
#             end_date=order.return_date,
#             quantity=item.quantity,
#             is_returned=False,
#         )

#     # ✅ Send RENTAL AGREEMENT via DocuSign (REAL one)
#     send_rental_docusign_envelope(order)


# def process_rental_return(rental_product, condition_ok=True):
#     """
#     Called when admin marks product as returned
#     Handles:
#     - Late fee
#     - Damage/Lost
#     - Quantity add back
#     - Final DocuSign agreement
#     """

#     today = timezone.now().date()
#     product = rental_product.product

#     rental_product.is_returned = True
#     rental_product.returned_at = timezone.now()

#     # 🔺 Add quantity back ONLY if returned
#     product.quantity += rental_product.quantity
#     product.save()

#     # ⏱ Late return calculation
#     late_days = (today - rental_product.end_date).days
#     extra_charges = 0

#     if late_days > 0:
#         extra_charges = late_days * product.rental_price_per_day

#     rental_product.extra_charges = extra_charges

#     # ❌ Damage / Lost (AI later)
#     if not condition_ok:
#         rental_product.is_damaged = True
#         rental_product.lost_charges = product.lost_price

#     rental_product.save()

#     # 📩 Send FINAL RETURN / CHARGES agreement
#     send_rental_return_docusign(rental_product)




# from django.utils import timezone
# from .models import RentalProduct
# from rental.docusign import (send_rental_docusign_envelope,send_rental_return_docusign,)

# def create_rental_entries(order):
#     if not order.start_date or not order.return_date:
#         return

#     for item in order.items.all():
#         product = item.product

#         # reduce quantity
#         product.quantity -= item.quantity
#         product.save()

#         RentalProduct.objects.create(
#             order=order,
#             order_item=item,
#             product=product,
#             start_date=order.start_date,
#             end_date=order.return_date,
#             quantity=item.quantity,
#             is_returned=False,
#         )

#     send_rental_docusign_envelope(order)


# def process_rental_return(rental_product, condition_ok=True):
#     # SAFETY CHECK (very important)
#     if rental_product.is_returned:
#         return

#     today = timezone.now().date()
#     product = rental_product.product

#     rental_product.is_returned = True
#     rental_product.returned_at = timezone.now()

#     # add quantity back
#     product.quantity += rental_product.quantity
#     product.save()

#     # late calculation
#     late_days = (today - rental_product.end_date).days
#     extra_charges = 0

#     if late_days > 3:  # grace period
#         late_days -= 3
#         extra_charges = late_days * product.rental_price_per_day

#     rental_product.extra_charges = extra_charges

#     if not condition_ok:
#         rental_product.is_damaged = True
#         rental_product.lost_charges = product.security_deposit

#     rental_product.save()

#     send_rental_return_docusign(rental_product)
#------------------------------------------------------
# rental/services.py

from django.utils import timezone
from .models import RentalProduct
from userhub.models import *
from rental.docusign import (send_rental_docusign_envelope,update_docusign_charges,)
from django.utils import timezone
from decimal import Decimal
from rental.models import OrderItem
from rental.pricing_engine import DAMAGE_CHARGE, RENT_PER_DAY
from rental.docusign import update_docusign_charges


# def create_rental_entries(order):
#     """
#     Create rental entries for an order and reduce product stock.
#     """
#     if not order.start_date or not order.return_date:
#         return

#     for item in order.items.all():
#         product = item.product

#         # ------------------- FIXED -------------------
#         # Reduce available quantity (permanent fix)
#         if product.available_quantity is None:
#             product.available_quantity = 0

#         product.available_quantity -= item.quantity
#         if product.available_quantity < 0:
#             product.available_quantity = 0  # safety check
#         product.save()
#         # ---------------------------------------------

#         # Create RentalProduct entry
#         RentalProduct.objects.create(
#             order=order,
#             order_item=item,
#             product=product,
#             start_date=order.start_date,
#             end_date=order.return_date,
#             quantity=item.quantity,
#             is_returned=False,
#         )

#     # Send DocuSign envelope for rental
#     send_rental_docusign_envelope(order)


# def process_rental_return(order_item: OrderItem, returned_qty: int, return_image=None):
#     """
#     Single source of truth for rental return logic.
#     """

#     today = timezone.now().date()
#     product = order_item.product
#     order = order_item.order

#     # ---------------- LATE CHARGE ----------------
#     late_days = (today - order.end_date).days
#     late_charge = Decimal("0.00")

#     if late_days > 3:
#         late_days -= 3
#         late_charge = Decimal(late_days) * Decimal(RENT_PER_DAY)

#     # ---------------- CONDITION LOGIC ----------------
#     if not return_image:
#         # LOST ITEM
#         order_item.condition = "lost"
#         order_item.lost_charge += product.price * Decimal(returned_qty)

#         # ❗ DO NOT increase returned_quantity
#     else:
#         # RETURNED ITEM
#         order_item.returned_quantity += returned_qty
#         order_item.return_image = return_image
#         order_item.condition = "good"

#         # Stock back only for returned items
#         if product.available_quantity is None:
#             product.available_quantity = 0
#         product.available_quantity += returned_qty
#         product.save()

#     # ---------------- COMMON UPDATES ----------------
#     order_item.late_charge += late_charge

#     if order_item.returned_quantity >= order_item.quantity:
#         order_item.is_returned = True

#     order_item.save()

#     # ---------------- ORDER UPDATE ----------------
#     order.returned_items = sum(i.returned_quantity for i in order.items.all())
#     order.pending_items = sum(i.quantity - i.returned_quantity for i in order.items.all())
#     order.lost_charges = sum(i.lost_charge for i in order.items.all())
#     order.damage_charges = sum(i.damage_charge for i in order.items.all())

#     if order.pending_items == 0:
#         order.is_return = True

#     order.save()

#     # ---------------- DOCUSIGN ----------------
#     update_docusign_charges(order)
#-----------------------------
# rental/services.py




#---------------------------------------------------------------
from decimal import Decimal
from django.utils import timezone
from rental.models import OrderItem
from rental.docusign import update_docusign_charges

# def create_rental_entries(order):
#     """
#     Create rental entries for an order and reduce product stock.
#     """
#     if not order.start_date or not order.return_date:
#         return

#     for item in order.items.all():
#         product = item.product

#         # ------------------- FIXED -------------------
#         # Reduce available quantity (permanent fix)
#         if product.available_quantity is None:
#             product.available_quantity = 0

#         product.available_quantity -= item.quantity
#         if product.available_quantity < 0:
#             product.available_quantity = 0  # safety check
#         product.save()
#         # ---------------------------------------------

#         # Create RentalProduct entry
#         RentalProduct.objects.create(
#             order=order,
#             order_item=item,
#             product=product,
#             start_date=order.start_date,
#             end_date=order.return_date,
#             quantity=item.quantity,
#             is_returned=False,
#         )

#     # Send DocuSign envelope for rental
#     send_rental_docusign_envelope(order)


# def process_rental_return(order_item: OrderItem, returned_qty: int, return_image=None):
#     order = order_item.order
#     product = order_item.product

#     # ---------------- LOST CASE ----------------
#     if not return_image:
#         # LOST ITEMS → DO NOT INCREASE returned_quantity
#         order_item.condition = "lost"
#         order_item.lost_charge += product.price * Decimal(returned_qty)

#     # ---------------- RETURNED CASE ----------------
#     else:
#         order_item.returned_quantity += returned_qty
#         order_item.condition = "good"
#         order_item.return_image = return_image

#         # Stock back
#         if product.available_quantity is None:
#             product.available_quantity = 0
#         product.available_quantity += returned_qty
#         product.save()

#     # ---------------- FINAL ITEM STATUS ----------------
#     if order_item.returned_quantity >= order_item.quantity:
#         order_item.is_returned = True

#     order_item.save()

#     # ---------------- ORDER UPDATE ----------------
#     order.returned_items = sum(i.returned_quantity for i in order.items.all())
#     order.pending_items = sum(i.quantity - i.returned_quantity for i in order.items.all())
#     order.lost_charges = sum(i.lost_charge for i in order.items.all())
#     order.damage_charges = sum(i.damage_charge for i in order.items.all())

#     # ❗ FINAL FLAG ONLY WHEN ALL ITEMS RETURNED
#     order.is_return = order.pending_items == 0
#     order.save()

#     # ---------------- DOCUSIGN (🔥 ALWAYS SEND) ----------------
#     update_docusign_charges(order)

#---------------------------------------------------------------




# rental/services.py

# from decimal import Decimal
# from django.utils import timezone
# from rental.models import RentalProduct
# from userhub.models import OrderItem
# from rental.docusign import update_docusign_charges
# from rental.ai_condition_checker import ai_check_product_condition


# def create_rental_entries(order):
#     """
#     Create rental entries for an order and reduce product stock.
#     """
#     if not order.start_date or not order.return_date:
#         return

#     for item in order.items.all():
#         product = item.product

#         if product.available_quantity is None:
#             product.available_quantity = 0

#         product.available_quantity -= item.quantity
#         if product.available_quantity < 0:
#             product.available_quantity = 0

#         product.save()

#         RentalProduct.objects.create(
#             order=order,
#             order_item=item,
#             product=product,
#             start_date=order.start_date,
#             end_date=order.return_date,
#             quantity=item.quantity,
#             is_returned=False,
#         )

#     update_docusign_charges(order)


# def process_rental_return(order_item: OrderItem, returned_qty: int, return_image=None):
#     """
#     SINGLE SOURCE OF TRUTH
#     """

#     order = order_item.order
#     product = order_item.product

#     # ---------------- LOST CASE ----------------
#     if not return_image:
#         order_item.condition = "lost"
#         order_item.returned_quantity += returned_qty
#         order_item.lost_charge += product.price * Decimal(returned_qty)

#     # ---------------- IMAGE PROVIDED ----------------
#     else:
#         order_item.return_image = return_image
#         order_item.returned_quantity += returned_qty

#         ai_result = ai_check_product_condition(
#             product.ProductImage.path,
#             return_image.path
#         )

#         if ai_result == "damage":
#             order_item.condition = "damage"
#             order_item.damage_charge += Decimal("500") * Decimal(returned_qty)
#         else:
#             order_item.condition = "good"

#         if product.available_quantity is None:
#             product.available_quantity = 0

#         product.available_quantity += returned_qty
#         product.save()

#     # ---------------- FINAL ITEM STATUS ----------------
#     if order_item.returned_quantity >= order_item.quantity:
#         order_item.is_returned = True

#     order_item.save()

#     # ---------------- UPDATE RENTAL PRODUCT ----------------
#     RentalProduct.objects.filter(order_item=order_item).update(
#         is_returned=order_item.is_returned,
#         returned_at=timezone.now()
#     )

#     # ---------------- ORDER UPDATE ----------------
#     order.returned_items = sum(i.returned_quantity for i in order.items.all())
#     order.pending_items = sum(i.quantity - i.returned_quantity for i in order.items.all())
#     order.lost_charges = sum(i.lost_charge for i in order.items.all())
#     order.damage_charges = sum(i.damage_charge for i in order.items.all())

#     order.is_return = order.pending_items == 0
#     order.save()

#     # ---------------- DOCUSIGN (ALWAYS SEND) ----------------
#     update_docusign_charges(order)

#-------------------------------------------------------------------------------

# rental/services.py

from decimal import Decimal
from django.utils import timezone
from rental.models import RentalProduct
from userhub.models import OrderItem
from rental.docusign import update_docusign_charges
from rental.ai_condition_checker import ai_check_product_condition


# def create_rental_entries(order):
#     """
#     Create rental entries for an order and reduce product stock.
#     """
#     if not order.start_date or not order.return_date:
#         return

#     for item in order.items.all():
#         product = item.product

#         if product.available_quantity is None:
#             product.available_quantity = 0

#         product.available_quantity -= item.quantity
#         if product.available_quantity < 0:
#             product.available_quantity = 0

#         product.save()

#         RentalProduct.objects.create(
#             order=order,
#             order_item=item,
#             product=product,
#             start_date=order.start_date,
#             end_date=order.return_date,
#             quantity=item.quantity,
#             is_returned=False,
#         )

#     update_docusign_charges(order)


# def process_rental_return(order_item: OrderItem, returned_qty: int, return_image=None):
    # """
    # SINGLE SOURCE OF TRUTH
    # """

    # order = order_item.order
    # product = order_item.product

    # # ---------------- LOST CASE ----------------
    # if not return_image:
    #     order_item.condition = "lost"
    #     order_item.returned_quantity += returned_qty

    #     # ORIGINAL PRODUCT PRICE × QTY (AS YOU DEFINED)
    #     order_item.lost_charge += Decimal(product.price) * Decimal(returned_qty)

    # # ---------------- IMAGE PROVIDED ----------------
    # else:
    #     order_item.return_image = return_image
    #     order_item.returned_quantity += returned_qty

    #     ai_result = ai_check_product_condition(
    #         product.ProductImage.path,
    #         return_image.path
    #     )

    #     if ai_result == "damage":
    #         order_item.condition = "damage"
    #         order_item.damage_charge += Decimal("500") * Decimal(returned_qty)
    #     else:
    #         order_item.condition = "good"

    #     if product.available_quantity is None:
    #         product.available_quantity = 0

    #     product.available_quantity += returned_qty
    #     product.save()

    # # ---------------- FINAL ITEM STATUS ----------------
    # if order_item.returned_quantity >= order_item.quantity:
    #     order_item.is_returned = True

    # order_item.save()

    # # ---------------- UPDATE RENTAL PRODUCT ----------------
    # RentalProduct.objects.filter(order_item=order_item).update(
    #     is_returned=order_item.is_returned,
    #     returned_at=timezone.now()
    # )

    # # ---------------- ORDER UPDATE ----------------
    # order.returned_items = sum(i.returned_quantity for i in order.items.all())
    # order.pending_items = sum(i.quantity - i.returned_quantity for i in order.items.all())

    # # ✅ FIXED: singular field
    # order.lost_charge = sum(i.lost_charge for i in order.items.all())
    # order.damage_charges = sum(i.damage_charge for i in order.items.all())

    # order.is_return = order.pending_items == 0
    # order.save()

    # # ---------------- DOCUSIGN (ALWAYS SEND) ----------------
    # update_docusign_charges(order)


from decimal import Decimal
from django.utils import timezone
from rental.models import RentalProduct
from userhub.models import OrderItem
from rental.docusign import update_docusign_charges
from rental.ai_condition_checker import ai_check_product_condition


def create_rental_entries(order):
    if not order.start_date or not order.return_date:
        return

    for item in order.items.all():
        product = item.product

        if product.available_quantity is None:
            product.available_quantity = 0

        product.available_quantity -= item.quantity
        if product.available_quantity < 0:
            product.available_quantity = 0

        product.save()

        RentalProduct.objects.create(
            order=order,
            order_item=item,
            product=product,
            start_date=order.start_date,
            end_date=order.return_date,
            quantity=item.quantity,
            is_returned=False,
        )

    update_docusign_charges(order)


def process_rental_return(order_item: OrderItem, returned_qty: int, return_image=None):
    order = order_item.order
    product = order_item.product

    # ---------------- LOST CASE ----------------
    if not return_image:
        order_item.condition = "lost"
        order_item.returned_quantity += returned_qty
        order_item.lost_charge += product.price * Decimal(returned_qty)

    # ---------------- IMAGE PROVIDED ----------------
    else:
        order_item.return_image = return_image
        order_item.returned_quantity += returned_qty

        ai_result = ai_check_product_condition(
            product.ProductImage.path,
            return_image.path
        )

        if ai_result == "damage":
            order_item.condition = "damage"
            order_item.damage_charge += Decimal("500") * Decimal(returned_qty)
        else:
            order_item.condition = "good"

        if product.available_quantity is None:
            product.available_quantity = 0

        product.available_quantity += returned_qty
        product.save()

    # ---------------- FINAL ITEM STATUS ----------------
    if order_item.returned_quantity >= order_item.quantity:
        order_item.is_returned = True

    order_item.save()

    # ---------------- UPDATE RENTAL PRODUCT ----------------
    RentalProduct.objects.filter(order_item=order_item).update(
        is_returned=order_item.is_returned,
        returned_at=timezone.now()
    )

    # ---------------- ORDER UPDATE (IMPORTANT FIX) ----------------
    order.returned_items = sum(i.returned_quantity for i in order.items.all())
    order.pending_items = sum(i.quantity - i.returned_quantity for i in order.items.all())

    order.lost_charge = sum(i.lost_charge for i in order.items.all())
    order.damage_charge = sum(i.damage_charge for i in order.items.all())  # ✅ FIX

    order.is_return = order.pending_items == 0
    order.save()

    update_docusign_charges(order)



