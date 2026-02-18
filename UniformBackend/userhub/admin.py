from django.contrib import admin
from .models import*

@admin.register(Users)
class UsersAdmin(admin.ModelAdmin):
    list_display = ('id', 'userName', 'email', 'firstName','userType', 'lastName', 'isActive', 'isDeleted', 'loginType', 'createdAt')
    list_filter = ('isActive', 'isDeleted', 'loginType', 'createdAt')
    search_fields = ('email', 'userName', 'firstName', 'lastName')
    readonly_fields = ('createdAt', 'updatedAt')


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 1
    readonly_fields = ('price', 'final_price', 'total_price')
    fields = ('product', 'quantity', 'price', 'discount', 'final_price', 'total_price')

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'is_active', 'created_at')
    search_fields = ('user__username',)
    inlines = [CartItemInline]
    list_filter = ('is_active',)


@admin.register(CustomerDetails)
class CustomerDetailsAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'first_name', 'last_name', 'email', 'phone', 'isActive')
    search_fields = ('user__username', 'email', 'phone')
    list_filter = ('isActive', 'isDeleted', 'country', 'city')


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1
    readonly_fields = ('subtotal', 'price_per_day')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'customer', 'status', 'order_type', 'total_amount', 'created_at')
    search_fields = ('order_id', 'customer__user__username')
    list_filter = ('status', 'order_type')
    inlines = [OrderItemInline]

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'price_per_day', 'subtotal')
    readonly_fields = ('subtotal',)


class RentalItemInline(admin.TabularInline):
    model = RentalItem
    extra = 1
    readonly_fields = ('subtotal',)

@admin.register(Rental)
class RentalAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'status', 'rental_date', 'start_date', 'end_date', 'total_amount')
    search_fields = ('customer__user__username',)
    list_filter = ('status',)
    inlines = [RentalItemInline]

@admin.register(RentalItem)
class RentalItemAdmin(admin.ModelAdmin):
    list_display = ('rental', 'product', 'quantity', 'returned_quantity', 'lost_quantity', 'subtotal', 'is_returned', 'is_damaged', 'is_lost')
    readonly_fields = ('subtotal',)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'payment_id', 'payment_status', 'payment_method', 'amount', 'currency', 'paid_at')
    search_fields = ('payment_id', 'order__order_id', 'customer_id')
    list_filter = ('payment_status', 'payment_method')


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'user', 'refund_amount', 'status', 'refund_method', 'created_at', 'processed_at')
    search_fields = ('order__order_id', 'user__username', 'payment__payment_id')
    list_filter = ('status', 'refund_method')


# @admin.register(Notifications)
# class NotificationsAdmin(admin.ModelAdmin):
#     list_display = (
#         "id",
#         "user",
#         "type",
#         "is_enabled",
#         "isActive",
#         "isDeleted",
#         "created_at",
#         "updated_at",
#     )

#     list_filter = (
#         "type",
#         "is_enabled",
#         "isActive",
#         "isDeleted",
#         "created_at",
#     )

#     search_fields = (
#         "user__email",
#         "type",
#     )

#     readonly_fields = (
#         "created_at",
#         "updated_at",
#     )

#     ordering = ("-created_at",)

#     fieldsets = (
#         ("User Info", {
#             "fields": ("user", "type")
#         }),
#         ("Notification Status", {
#             "fields": ("is_enabled", "isActive", "isDeleted")
#         }),
#         ("Timestamps", {
#             "fields": ("created_at", "updated_at")
#         }),
#     )




# @admin.register(UserDevice)
# class UserDeviceAdmin(admin.ModelAdmin):
#     list_display = (
#         "id",
#         "user",
#         "onesignal_player_id",
#         "device_type",
#         "is_active",
#     )

#     list_filter = (
#         "device_type",
#         "is_active",
#     )

#     search_fields = (
#         "user__email",
#         "onesignal_player_id",
#     )

#     ordering = ("-id",)

@admin.register(ModelInfo)
class ModelInfoAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'product',
        'isActive',
        'isDeleted',
        'created_at',
        'updated_at',
    )

    list_filter = (
        'isActive',
        'isDeleted',
        'created_at',
    )

    search_fields = (
        'product__name',
        'description',
    )

    readonly_fields = (
        'created_at',
        'updated_at',
    )

    ordering = ('-created_at',)

    fieldsets = (
        ("Basic Information", {
            'fields': ('product', 'model_file', 'description')
        }),
        ("Status", {
            'fields': ('isActive', 'isDeleted')
        }),
        ("Timestamps", {
            'fields': ('created_at', 'updated_at')
        }),
    )

@admin.register(CustomUpdateModels)
class CustomUpdateModelsAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'model_info',
        'isActive',
        'isDeleted',
        'created_at',
        'json_file_path',
    )

    list_filter = (
        'isActive',
        'isDeleted',
        'created_at',
        'model_info',
    )

    search_fields = (
        'user__username',
        'user__email',
        'model_info__id',
        'json_file_path',
    )

    readonly_fields = (
        'created_at',
    )

    ordering = ('-created_at',)

    fieldsets = (
        ("User & Model Info", {
            'fields': ('user', 'model_info')
        }),
        ("Customization JSON Data", {
            'fields': ('config_json', 'design_specifications'),
            'description': "3D model ke user customization changes yahan JSON format me store hote hain"
        }),
        ("JSON File Path", {
            'fields': ('json_file_path',),
            'description': "Stored JSON file ka path yahan dikhaye ga"
        }),
        ("Status", {
            'fields': ('isActive', 'isDeleted')
        }),
        ("Timestamps", {
            'fields': ('created_at',)
        }),
    )
@admin.register(QuotationRequest)
class QuotationRequestAdmin(admin.ModelAdmin):
    # List page columns
    list_display = (
        'uuids',
        'company_name',
        'contact_person',
        'email',
        'phone_number',
        'item_type',
        'delivery_date',
        'quotation_status',
        'isActive',
        'isDeleted',
        'created_at',
    )

    # Filters on right side
    list_filter = (
          'quotation_status',
        'isActive',
        'isDeleted',
        'delivery_date',
        'created_at',
    )

    # Search box
    search_fields = (
        'company_name',
        'contact_person',
        'email',
        'phone_number',
        'item_type',
           'quotation_status',
    )

    # Ordering (latest first)
    ordering = ('-created_at',)

    # Read-only fields
    readonly_fields = (
        'uuids',
        'created_at',
        'updated_at',
    )

    # Field layout in detail page
    fieldsets = (
        ('Company & Contact Info', {
            'fields': (
                'uuids',
                'company_name',
                'contact_person',
                'email',
                'phone_number',
            )
        }),
        ('Customization Reference', {
            'fields': ('customupdatemodel',)
        }),
        ('Uniform Request Details', {
            'fields': (
                'item_type',
                'material',
                'size_quantity',
                'delivery_date',
                'additional_note',
            )
        }),
        ('Agreement', {
            'fields': ('agreed_to_terms',)
        }),
          ('Quotation Status', {     

            'fields': (

                'quotation_status',)

          }),
        ('Status', {
            'fields': (
                'isActive',
                'isDeleted',
            )
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )

    #  Pagination
    list_per_page = 25

