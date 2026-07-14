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


@admin.register(Parts)
class PartsAdmin(admin.ModelAdmin):
    list_display = ("id",
        "partName",
        "category",
        "subcategory",
        "fabric",
        "usageTemmpCount",
        "zIndex",
        "isActive",
        "isDeleted",
        "created_at",
    )

    list_filter = (
        "category",
        "subcategory",
        "fabric",
        "isActive",
        "isDeleted",
    )

    search_fields = (
        "partName",
        "fabric__fabricName",
        "category__categoryName",
        "subcategory__name",
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
                "subcategory",
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
        'category',
        'subcategory',
        'productType',
        'type',
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
        'subcategory'
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
