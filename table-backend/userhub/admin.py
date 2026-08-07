from django.contrib import admin
from .models import*

# @admin.register(Users)
# class UsersAdmin(admin.ModelAdmin):
#     list_display = ('id', 'userName', 'email', 'firstName','userType', 'lastName', 'isActive', 'isDeleted', 'loginType', 'createdAt')
#     list_filter = ('isActive', 'isDeleted', 'loginType', 'createdAt')
#     search_fields = ('email', 'userName', 'firstName', 'lastName')
#     readonly_fields = ('createdAt', 'updatedAt')

from django import forms

class UsersAdminForm(forms.ModelForm):
    new_password = forms.CharField(
        label="New Password",
        required=False,
        widget=forms.PasswordInput(render_value=True),
        help_text="Leave blank to keep the current password."
    )

    class Meta:
        model = Users
        fields = "__all__"

    def save(self, commit=True):
        user = super().save(commit=False)

        password = self.cleaned_data.get("new_password")
        if password:
            user.set_password(password)

        if commit:
            user.save()

        return user


class ContractAuditLogInline(admin.TabularInline):
    model = ContractAuditLog
    extra = 0
    can_delete = False
    readonly_fields = (
        "action",
        "description",
        "created_at",
    )
    ordering = ("-created_at",)


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = (
        "contract_id",
        "company_name",
        "contact_person",
        "email",
        "workflow_status",
        "contract_status",
        "is_signed",
        "delivery_date",
        "created_at",
    )

    list_filter = (
        "workflow_status",
        "contract_status",
        "is_signed",
        "isActive",
        "isDeleted",
        "created_at",
    )

    search_fields = (
        "contract_id",
        "company_name",
        "contact_person",
        "email",
        "phone_number",
    )

    readonly_fields = (
        "id",
        "contract_id",
        "created_at",
        "updated_at",
        "signed_at",
    )

    inlines = [ContractAuditLogInline]
    ordering = ("-created_at",)


@admin.register(ContractAuditLog)
class ContractAuditLogAdmin(admin.ModelAdmin):
    list_display = (
        "contract",
        "action",
        "created_at",
    )

    list_filter = (
        "action",
        "created_at",
    )

    search_fields = (
        "contract__contract_id",
        "contract__company_name",
        "contract__contact_person",
        "action",
        "description",
    )

    readonly_fields = (
        "contract",
        "action",
        "description",
        "created_at",
    )

    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
    
@admin.register(Users)
class UsersAdmin(admin.ModelAdmin):
    form = UsersAdminForm

    list_display = (
        'id',
        'userName',
        'email',
        'firstName',
        'userType',
        'lastName',
        'isActive',
        'isDeleted',
        'loginType',
        'createdAt'
    )

    list_filter = (
        'isActive',
        'isDeleted',
        'loginType',
        'createdAt'
    )

    search_fields = (
        'email',
        'userName',
        'firstName',
        'lastName'
    )

    readonly_fields = (
        'createdAt',
        'updatedAt'
    )

    # Hide the hashed password field
    exclude = ("password",)
    
@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'cart',
        'product',
        'quantity',
        'price',
        'discount',
        'final_price',
        'total_price',
        'is_active'
    ]


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'is_active', 'created_at']
 


@admin.register(CustomerDetails)
class CustomerDetailsAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'first_name',
        'last_name',
        'email',
        'phone',
        'city',
        'country',
        'payment_method',
        'isActive',
        'created_at',
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_id',
        'user',
        'customer',
        # 'order_type',
        'payment_method',
        'status',
        'total_amount',
        'created_at',
        'is_active',
    )
    list_filter = ('status', 'order_type', 'is_active')
    search_fields = ('order_id', 'customer__userName')


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        'order',
        'product',
        'quantity',
        # 'rental_days',
        'price_per_day',
        'subtotal',
        'created_at'
    )
    # search_fields = ('order__order_id', 'product__productName')


@admin.register(Rental)
class RentalAdmin(admin.ModelAdmin):
    list_display = (
        'rental_id',
        'order',
        'customer',
        'start_date',
        'end_date',
        'status',
        'total_amount',
        'late_fee',
        'damage_fee',
        'lost_fee',
        'created_at'
    )
    # list_filter = ('status', 'isActive')
    # search_fields = ('rental_id', 'customer__userName')


@admin.register(RentalItem)
class RentalItemAdmin(admin.ModelAdmin):
    list_display = (
        'rental',
        'product',
        'quantity',
        'returned_quantity',
        'lost_quantity',
        'is_returned',
        'is_damaged',
        'is_lost',
        'subtotal',
        'created_at'
    )
    # search_fields = ('rental__rental_id', 'product__productName')


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        'payment_id',
        'order',
        'payment_status',
        'payment_method',
        'amount',
        'currency',
        'paid_at',
        'created_at',
        'is_active'
    )
    list_filter = ('payment_status', 'payment_method')
    search_fields = ('payment_id', 'order__order_id')


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'order',
        'user',
        'refund_amount',
        'refund_method',
        'status',
        'created_at',
        'processed_at'
    )
    list_filter = ('status', 'refund_method')
    search_fields = ('order__order_id', 'user__username')

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

