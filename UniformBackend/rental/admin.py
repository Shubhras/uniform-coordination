from django.contrib import admin

from .models import*

# ------------------ RentalUnit Admin ------------------

# @admin.register(RentalUnit)
# class RentalUnitAdmin(admin.ModelAdmin):
#     list_display = (
#         "id",
#         "product",
#         "rfid_code",
#         "condition",
#         "is_available",
#         "is_active",
#         "created_at",
#     )
#     list_filter = ("condition", "is_active", "isDeleted", "product")
#     search_fields = ("rfid_code", "product__productName")
#     readonly_fields = ("created_at", "updated_at", "last_checked_at")


# ------------------ RentalReservation Admin ------------------

# @admin.register(RentalReservation)
# class RentalReservationAdmin(admin.ModelAdmin):
#     list_display = (
#         "id",
#         "rental_unit",
#         "order_id",
#         "start_date",
#         "end_date",
#         "created_at",
#     )
#     list_filter = ("start_date", "end_date", "rental_unit__product")
#     search_fields = ("order_id", "rental_unit__rfid_code")
#     readonly_fields = ("created_at", "updated_at")


# ------------------ RentalShipment Admin ------------------

# @admin.register(RentalShipment)
# class RentalShipmentAdmin(admin.ModelAdmin):
#     list_display = (
#         "id",
#         "reservation",
#         "tracking_id",
#         "shipped_by",
#         "shipped_at",
#     )
#     search_fields = ("tracking_id", "reservation__order_id")
#     readonly_fields = ("shipped_at",)


# ------------------ RentalRFIDItem Admin ------------------

# @admin.register(RentalRFIDItem)
# class RentalRFIDItemAdmin(admin.ModelAdmin):
#     list_display = (
#         "id",
#         "rfid_code",
#         "rental_unit",
#         "is_active",
#     )
#     search_fields = ("rfid_code",)
#     list_filter = ("is_active",)


# ------------------ ReturnScanLog Admin ------------------

# @admin.register(ReturnScanLog)
# class ReturnScanLogAdmin(admin.ModelAdmin):
#     list_display = (
#         "id",
#         "reservation",
#         "rfid_item",
#         "condition",
#         "scanned_at",
#     )
#     list_filter = ("condition",)
#     readonly_fields = ("scanned_at",)


@admin.register(RentalProduct)
class RentalProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "product",
        "quantity",
        "start_date",
        "end_date",
        "is_returned",
        "is_damaged",
        "extra_charges",
        "lost_charges",
        "created_at",
    )

    list_filter = (
        "is_returned",
        "is_damaged",
        "start_date",
        "end_date",
        "created_at",
    )

    search_fields = (
        "order__order_id",
        "product__productName",
    )

    readonly_fields = (
        "created_at",
        "returned_at",
    )

    fieldsets = (
        ("Order Information", {
            "fields": (
                "order",
                "order_item",
                "product",
                "quantity",
            )
        }),

        ("Rental Duration", {
            "fields": (
                "start_date",
                "end_date",
            )
        }),

        ("Return Status", {
            "fields": (
                "is_returned",
                "returned_at",
                "is_damaged",
            )
        }),

        ("Charges", {
            "fields": (
                "extra_charges",
                "lost_charges",
            )
        }),

        ("Images (AI Damage Check)", {
            "fields": (
                "before_image",
                "after_image",
            )
        }),

        ("Timestamps", {
            "fields": (
                "created_at",
            )
        }),
    )
