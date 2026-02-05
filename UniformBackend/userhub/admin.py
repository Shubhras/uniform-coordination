from django.contrib import admin
from .models import*
# from 


@admin.register(Users)
class UsersAdmin(admin.ModelAdmin):
    list_display = ('id', 'userName', 'email', 'firstName','userType', 'lastName', 'isActive', 'isDeleted', 'loginType', 'createdAt')
    list_filter = ('isActive', 'isDeleted', 'loginType', 'createdAt')
    search_fields = ('email', 'userName', 'firstName', 'lastName')
    readonly_fields = ('createdAt', 'updatedAt')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display =('order',
                   'payment_id',
                   'payment_status',
                   'payment_method',
                   'amount','currency','paid_at')

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user',
                    'is_active',
                    'is_delete', 
                    'is_update', 
                    'created_at')
   
@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
   list_display = [
        'id', 'cart', 
        'product', 
        'quantity', 
        'price', 
        'total_price',
        'is_active', 
        'created_at', 
        'updated_at', 
        'deleted_at'
    ]

@admin.register(CustomerDetails)
class CustomerDetailsAdmin(admin.ModelAdmin):
    list_display = ('id',
                     'user', 
                     'first_name', 
                     'last_name', 
                     'email', 
                     'phone',
                     'city',
                     'country', 
                     'payment_method', 
                     'Rental', 'created_at', 
                     'updated_at')
   

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_id', 
        'user', 
        'customer', 
        'Payment_method', 
        'status', 
        'order_type', 
        'total_amount',
        'promocode',  
        'start_date', 
        'return_date'
    )
    

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



from django.contrib import admin
from .models import OrderItem


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "product",
        "quantity",
        "returned_quantity",
        "is_returned",
        "condition",
        "damage_charge",
        "lost_charge",
        "created_at",
    )

    list_filter = (
        "is_returned",
        "condition",
        "created_at",
    )

    search_fields = (
        "order__order_id",
        "product__productName",
    )

    readonly_fields = (
        "returned_quantity",
        "damage_charge",
        "lost_charge",
        "created_at",
        "updated_at",
        "return_image_preview",
    )

    fieldsets = (
        ("Order Info", {
            "fields": ("order", "product", "quantity", "price", "total_price")
        }),
        ("Return Info", {
            "fields": (
                "returned_quantity",
                "is_returned",
                "condition",
                "return_image",
                "return_image_preview",
            )
        }),
        ("Charges", {
            "fields": ("damage_charge", "lost_charge")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at")
        }),
    )

    def return_image_preview(self, obj):
        if obj.return_image:
            return f'<img src="{obj.return_image.url}" width="150" />'
        return "No Image"

    return_image_preview.allow_tags = True
    return_image_preview.short_description = "Return Image Preview"
