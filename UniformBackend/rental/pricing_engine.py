# # rental/pricing_engine.py

# from decimal import Decimal
# from datetime import date

# TAX_PERCENTAGE = Decimal("10.0")  # 10%
# ROUND_TRIP_SHIPPING_FEE = Decimal("500.00")  # change later if needed


# def calculate_rental_days(start_date: date, end_date: date) -> int:
#     days = (end_date - start_date).days
#     return max(days, 1)


# def apply_promocode_discount(amount: Decimal, promocode) -> Decimal:
#     if not promocode:
#         return amount

#     if promocode.discount_type == "percentage":
#         discount = (amount * Decimal(promocode.value)) / Decimal(100)
#     else:
#         discount = Decimal(promocode.value)

#     return max(amount - discount, Decimal("0.00"))


# def calculate_tax(amount: Decimal) -> Decimal:
#     return (amount * TAX_PERCENTAGE) / Decimal(100)


# def calculate_rental_pricing(cart_items, start_date, end_date, promocode=None):
#     """
#     Core rental pricing formula:
#     price_per_day × quantity × rental_days
#     """

#     rental_days = calculate_rental_days(start_date, end_date)

#     subtotal = Decimal("0.00")

#     for item in cart_items:
#         price_per_day = item.product.price
#         quantity = item.quantity

#         item_total = price_per_day * quantity * rental_days
#         subtotal += item_total

#     # Apply promocode
#     discounted_amount = apply_promocode_discount(subtotal, promocode)

#     # Add shipping
#     shipping_fee = ROUND_TRIP_SHIPPING_FEE

#     # Tax
#     tax = calculate_tax(discounted_amount + shipping_fee)

#     final_total = discounted_amount + shipping_fee + tax

#     return {
#         "rental_days": rental_days,
#         "subtotal": subtotal,
#         "discounted_amount": discounted_amount,
#         "shipping_fee": shipping_fee,
#         "tax": tax,
#         "final_total": final_total
#     }

#------------------------------------------------------------------------------------
#rental/pricing_engine.py

# from decimal import Decimal
# from datetime import date

# TAX_PERCENTAGE = Decimal("10.0")
# ROUND_TRIP_SHIPPING_FEE = Decimal("500.00")


# def calculate_rental_days(start_date: date, end_date: date) -> int:
#     days = (end_date - start_date).days
#     return max(days, 1)


# def apply_promocode_discount(amount: Decimal, promocode) -> Decimal:
#     if not promocode:
#         return amount

#     if promocode.discount_type == "percentage":
#         discount = (amount * Decimal(promocode.value)) / Decimal("100")
#     else:
#         discount = Decimal(promocode.value)

#     return max(amount - discount, Decimal("0.00"))


# def calculate_tax(amount: Decimal) -> Decimal:
#     return (amount * TAX_PERCENTAGE) / Decimal("100")


# def calculate_rental_pricing(cart_items, start_date, end_date, promocode=None):
#     rental_days = calculate_rental_days(start_date, end_date)

#     subtotal = Decimal("0.00")

#     for item in cart_items:
#         #  Correct field
#         price_per_day = Decimal(item.product.rental_price_per_day)
#         quantity = Decimal(item.quantity)

#         item_total = price_per_day * quantity * Decimal(rental_days)
#         subtotal += item_total

#     discounted_amount = apply_promocode_discount(subtotal, promocode)

#     shipping_fee = ROUND_TRIP_SHIPPING_FEE

#     tax = calculate_tax(discounted_amount + shipping_fee)

#     final_total = discounted_amount + shipping_fee + tax

#     return {
#         "rental_days": rental_days,
#         "subtotal": subtotal,
#         "discounted_amount": discounted_amount,
#         "shipping_fee": shipping_fee,
#         "tax": tax,
#         "final_total": final_total,
#     }


#---------------------------------------------------------------
# rental/pricing_engine.py

from decimal import Decimal
from datetime import date

TAX_PERCENTAGE = Decimal("10.0")
ROUND_TRIP_SHIPPING_FEE = Decimal("500.00")

# NEW CONSTANTS
RENT_PER_DAY = Decimal("100")
DAMAGE_CHARGE = Decimal("500")


def calculate_rental_days(start_date: date, end_date: date) -> int:
    days = (end_date - start_date).days
    return max(days, 1)


def apply_promocode_discount(amount: Decimal, promocode) -> Decimal:
    if not promocode:
        return amount

    if promocode.discount_type == "percentage":
        discount = (amount * Decimal(promocode.value)) / Decimal("100")
    else:
        discount = Decimal(promocode.value)

    return max(amount - discount, Decimal("0.00"))


def calculate_tax(amount: Decimal) -> Decimal:
    return (amount * TAX_PERCENTAGE) / Decimal("100")


def calculate_rental_pricing(cart_items, start_date, end_date, promocode=None):
    rental_days = calculate_rental_days(start_date, end_date)
    subtotal = Decimal("0.00")

    for item in cart_items:
        quantity = Decimal(item.quantity)
        item_total = RENT_PER_DAY * quantity * Decimal(rental_days)
        subtotal += item_total

    discounted_amount = apply_promocode_discount(subtotal, promocode)
    shipping_fee = ROUND_TRIP_SHIPPING_FEE
    tax = calculate_tax(discounted_amount + shipping_fee)
    final_total = discounted_amount + shipping_fee + tax

    return {
        "rental_days": rental_days,
        "subtotal": subtotal,
        "discounted_amount": discounted_amount,
        "shipping_fee": shipping_fee,
        "tax": tax,
        "final_total": final_total,
    }
