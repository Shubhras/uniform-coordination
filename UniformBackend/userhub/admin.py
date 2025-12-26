from django.contrib import admin
from .models import*
# from 


@admin.register(Users)
class UsersAdmin(admin.ModelAdmin):
    list_display = ('id', 'userName', 'email', 'firstName', 'lastName', 'isActive', 'isDeleted', 'loginType', 'createdAt')
    list_filter = ('isActive', 'isDeleted', 'loginType', 'createdAt')
    search_fields = ('email', 'userName', 'firstName', 'lastName')
    readonly_fields = ('createdAt', 'updatedAt')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display =('order','payment_id','payment_status','payment_method','amount','currency','paid_at')

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'is_active', 'is_delete', 'is_update', 'created_at')
   

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'cart', 'product', 'quantity', 'price', 'total_price', 'isActive', 'isDeleted', 'created_at', 'updated_at')
    
@admin.register(CustomerDetails)
class CustomerDetailsAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'first_name', 'last_name', 'email', 'phone', 'city', 'country', 'payment_method', 'Rental', 'created_at', 'updated_at')
   

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
