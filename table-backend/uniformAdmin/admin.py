from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *
from django.utils.html import format_html


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('role_name', 'slug', 'description')
    search_fields = ('role_name', 'slug')


@admin.register(AdminUser)
class AdminUserAdmin(UserAdmin):
    model = AdminUser

    list_display = ('id','name','email', 'mobile', 'role', 'is_active', 'is_staff','language')
    search_fields = ('email', 'mobile')
    list_filter = ('is_active', 'is_staff', 'role')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('name', 'mobile', 'role','language')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'mobile', 'role', 'password1', 'password2'),
        }),
    )

    filter_horizontal = ('groups', 'user_permissions')


@admin.register(Fabric)
class FabricAdmin(admin.ModelAdmin):
    list_display = ('id','fabricName', 'color', 'materialType', 'pricePerUnit', 'isActive', 'isDeleted', 'created_at', 'updated_at')
    list_filter = ('materialType', 'isActive', 'isDeleted')
    search_fields = ('fabricName', 'color')
    ordering = ('-created_at',)
    list_editable = ('isActive', 'isDeleted', 'pricePerUnit')
    
    
@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "category",
        "isActive",
        "isDeleted",
        "created_at"
    )
    list_filter = ("category", "isActive", "isDeleted")
    search_fields = ("title",)
    readonly_fields = ("created_at", "updated_at")
    
    
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "categoryName",
        "slug",
        "type",
        "categoryImage",   # ADDED
        "description",     # ADDED
        "isActive",
        "isDeleted",
        "created_at",
        "updated_at",
    )

    list_filter = ("isActive", "isDeleted", "created_at")
    search_fields = ("categoryName", "slug")
    ordering = ("-created_at",)

    readonly_fields = ("slug", "created_at", "updated_at")

    fieldsets = (
        ("Category Info", {
            "fields": (
                "categoryName",
                "slug",
                "type",             # ADDED (was missing)
                "categoryImage",    # MOVED here (logical place)
                "description",      # MOVED here
            )
        }),
        ("Status", {
            "fields": ("isActive", "isDeleted")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at")
        }),
    )


@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "slug",
        "icon",
        "route",
        "order",
        "isActive",
        "isDeleted",
        "created_at",
    )
    list_filter = (
        "isActive",
        "isDeleted",
        "created_at",
    )
    search_fields = (
        "name",
        "slug",
        "route",
    )
    ordering = ("order", "name")
    readonly_fields = (
        "slug",
        "created_at",
        "updated_at",
    )


@admin.register(SubMenu)
class SubMenuAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "menu",
        "slug",
        "route",
        "order",
        "isActive",
        "isDeleted",
        "created_at",
    )
    list_filter = (
        "menu",
        "isActive",
        "isDeleted",
        "created_at",
    )
    search_fields = (
        "name",
        "slug",
        "menu__name",
        "route",
    )
    ordering = (
        "menu",
        "order",
        "name",
    )
    readonly_fields = (
        "slug",
        "created_at",
        "updated_at",
    )


@admin.register(RoleMenuPermission)
class RoleMenuPermissionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "role",
        "menu",
        "can_view",
        "can_create",
        "can_update",
        "can_delete",
        "created_at",
    )
    list_filter = (
        "role",
        "menu",
        "can_view",
        "can_create",
        "can_update",
        "can_delete",
    )
    search_fields = (
        "role__role_name",
        "menu__name",
    )
    ordering = (
        "role",
        "menu",
    )
    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(RoleSubMenuPermission)
class RoleSubMenuPermissionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "role",
        "submenu",
        "can_view",
        "can_create",
        "can_update",
        "can_delete",
        "created_at",
    )
    list_filter = (
        "role",
        "submenu",
        "can_view",
        "can_create",
        "can_update",
        "can_delete",
    )
    search_fields = (
        "role__role_name",
        "submenu__name",
        "submenu__menu__name",
    )
    ordering = (
        "role",
        "submenu",
    )
    readonly_fields = (
        "created_at",
        "updated_at",
    )



@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = (
        "company_name",
        "support_email",
        "contact_number",
        "default_language",
        "default_currency",
        "is_active",
        "updated_at",
    )

    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("Company Information", {
            "fields": (
                "company_name",
                "business_address",
                "logo",
            )
        }),
        ("Contact Information", {
            "fields": (
                "support_email",
                "contact_number",
            )
        }),
        ("Regional Settings", {
            "fields": (
                "default_language",
                "default_currency",
                "time_zone",
                "date_format",
            )
        }),
        ("Status", {
            "fields": ("is_active",)
        }),
        ("Timestamps", {
            "fields": (
                "created_at",
                "updated_at",
            )
        }),
    )

    def has_add_permission(self, request):
        # Allow only one SystemSettings object
        return not SystemSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        # Prevent deletion from admin
        return False

@admin.register(Parts)
class PartsAdmin(admin.ModelAdmin):
    list_display = ("id",
        "partName",
        "category",
        "fabric",
        "usageTemmpCount",
        "zIndex",
        "isActive",
        "isDeleted",
        "created_at",
    )

    list_filter = (
        "category",
        "fabric",
        "isActive",
        "isDeleted",
    )

    search_fields = (
        "partName",
        "fabric__name",   # adjust if Fabric has a different field
    )

    readonly_fields = (
        "created_at",
        "updated_at",
        "image_preview",
    )

    ordering = ("zIndex", "partName")

    fieldsets = (
        ("Basic Info", {
            "fields": (
                "partName",
                "category",
                "fabric",
                "partImage",
                "image_preview",
            )
        }),
        ("Display / Usage", {
            "fields": (
                "zIndex",
                "usageTemmpCount",
            )
        }),
        ("Status", {
            "fields": (
                "isActive",
                "isDeleted",
            )
        }),
        ("Timestamps", {
            "fields": (
                "created_at",
                "updated_at",
            )
        }),
    )

    #  Image preview in admin
    def image_preview(self, obj):
        if obj.partImage:
            return format_html(
                '<img src="{}" width="80" height="80" style="object-fit:cover;" />',
                obj.partImage.url
            )
        return "No Image"

    image_preview.short_description = "Image Preview"
    
    
@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "isActive",
        "isDeleted",
        "created_at"
    )
    search_fields = ("title",)
    list_filter = ("isActive", "isDeleted")
   
    
    
@admin.register(FAQDescription)
class FAQDescriptionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "faq",
        "isActive",
        "isDeleted",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "isActive",
        "isDeleted",
        "created_at",
    )

    search_fields = (
        "faq__title",
        "description",
    )

    ordering = ("-created_at",)

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        ("FAQ Information", {
            "fields": ("faq", "description")
        }),
        ("Status", {
            "fields": ("isActive", "isDeleted")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at")
        }),
    )
    
    
    
@admin.register(CatalogImage)
class CatalogImageAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "category", "isActive", "isDeleted", "created_at",)
    list_filter = ("category", "isActive", "isDeleted")
    search_fields = ("name",)
    readonly_fields = ("created_at", "updated_at", "slug",)
    
    
    
@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ("id","name","category","type","isActive","isDeleted","created_at",)
    list_filter = ("isActive","isDeleted","category",)

    search_fields = ("name",)

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = ("-created_at",)
    
    

@admin.register(Colors)
class ColorsAdmin(admin.ModelAdmin):
    list_display = ("colorName", "colorCode", "compatibleFabric", "isActive", "isDeleted", "created_at")
    list_filter = ("isActive", "isDeleted")
    search_fields = ("colorName", "colorCode")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'productName',
        'productType',
        'price',
        'available_quantity',
        'isActive',
        'isPopular',
        'isDeleted',
        'created_at'
    )
 
    list_filter = (
        'productType',
        'isActive',
        'isPopular',
        'isDeleted',
        'category',
       
    )
 
    search_fields = (
        'productName',
        'slug',
    )
 
    prepopulated_fields = {
        'slug': ('productName',)
    }
 
    filter_horizontal = (
        'parts',
    )
 
    readonly_fields = (
        'created_at',
        'updated_at',
    )
 
    ordering = ('-created_at',)


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'templateName',
        'part',
        'partUsageCount',
        'isActive',
        'isDeleted',
        'created_at'
    )

    list_filter = ('isActive', 'isDeleted', 'created_at')

    search_fields = ('templateName',)

    readonly_fields = ('created_at', 'updated_at')


@admin.register(TableTheme)
class TableThemeAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'order',
        'is_active',
        'isDeleted',
        'created_at'
    )

    list_filter = ('is_active', 'isDeleted', 'created_at')

    search_fields = ('title', 'description')

    ordering = ('order',)


@admin.register(Promocode)
class PromocodeAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'promocodeName',
        'promocodeType',
        'amount',
        'started_at',
        'ended_at',
        'isActive',
        'isDeleted',
        'created_at'
    )

    list_filter = ('promocodeType', 'isActive', 'isDeleted', 'started_at')

    search_fields = ('promocodeName', 'slug')

    prepopulated_fields = {"slug": ("promocodeName",)}

    readonly_fields = ('created_at', 'updated_at')


@admin.register(PrivacyPolicy)
class PrivacyPolicyAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'privacyPolicyType',
        'type',
        'language',
        'version',
        'isActive',
        'isDeleted',
        'created_at'
    )

    list_filter = (
        'privacyPolicyType',
        'type',
        'language',
        'isActive',
        'isDeleted'
    )

    search_fields = ('title', 'slug', 'content')

    prepopulated_fields = {"slug": ("title",)}

    readonly_fields = ('created_at', 'updated_at')


@admin.register(SpecialCondition)
class SpecialConditionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'condition_type',
        'discount_percentage',
        'priority_support',
        'net_30_terms',
        'free_samples',
        'is_active',
        'is_deleted',
        'created_at'
    )

    list_filter = (
        'condition_type',
        'is_active',
        'is_deleted',
        'priority_support',
        'net_30_terms',
        'free_samples'
    )

    search_fields = ('title', 'condition_type', 'description')

    readonly_fields = ('created_at', 'updated_at')

    ordering = ('-created_at',)


# @admin.register(QuotationTemplate)
# class QuotationTemplateAdmin(admin.ModelAdmin):
#     list_display = (
#         'id',
#         'title',
#         'slug',
#         'userType',
#         'language',
#         'version',
#         'is_active',
#         'is_deleted',
#         'created_at'
#     )

#     list_filter = (
#         'title',
#         'userType',
#         'language',
#         'is_active',
#         'is_deleted'
#     )

#     search_fields = ('slug', 'content')

#     readonly_fields = ('created_at', 'updated_at')

#     ordering = ('-created_at',)


@admin.register(AdminNotification)
class AdminNotificationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'priority',
        'is_seen',
        'content_type',
        'object_id',
        'created_at'
    )

    list_filter = ('priority', 'is_seen', 'created_at')

    search_fields = ('title', 'message')

    readonly_fields = ('created_at',)

    ordering = ('-created_at',)



@admin.register(InspectionItem)
class InspectionItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "rental_item",
        "returned_qty",
        "good_qty",
        "damaged_qty",
        "missing_qty",
        "result",
        "inspected_by",
        "inspected_at",
    )
    list_filter = ("result", "inspected_at")
    search_fields = (
        "order__order_id",
        "rental_item__id",
        "notes",
        "inspected_by__name",
    )
    readonly_fields = ("inspected_at",)


@admin.register(DamagePhoto)
class DamagePhotoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "inspection",
        "photo",
        "created_at",
    )
    search_fields = (
        "inspection__order__order_id",
        "inspection__rental_item__id",
    )
    readonly_fields = ("created_at",)


@admin.register(DamagedItem)
class DamagedItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "product",
        "quantity",
        "status",
        "reported_at",
        "resolved_at",
    )
    list_filter = ("status", "reported_at")
    search_fields = (
        "product__productName",
        "reason",
        "source_inspection__order__order_id",
    )
    readonly_fields = ("reported_at",)


@admin.register(CleaningItem)
class CleaningItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "product",
        "quantity",
        "status",
        "entered_at",
        "expected_done_at",
        "resolved_at",
    )
    list_filter = ("status", "entered_at")
    search_fields = (
        "product__productName",
        "source_rental_item__id",
    )
    readonly_fields = ("entered_at",)


class CompensationInvoiceItemInline(admin.TabularInline):
    model = CompensationInvoiceItem
    extra = 0


@admin.register(CompensationInvoice)
class CompensationInvoiceAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "grand_total",
        "status",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = (
        "order__order_id",
    )
    readonly_fields = ("created_at", "updated_at")
    inlines = [CompensationInvoiceItemInline]


@admin.register(CompensationInvoiceItem)
class CompensationInvoiceItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "invoice",
        "product",
        "issue_type",
        "quantity",
        "replacement_cost",
        "penalty_cost",
        "total_cost",
    )
    list_filter = ("issue_type",)
    search_fields = (
        "invoice__order__order_id",
        "product__productName",
    )