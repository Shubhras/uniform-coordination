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
    list_display = ("id","categoryName","slug","isActive","isDeleted", "created_at","updated_at")
    list_filter = ("isActive", "isDeleted", "created_at")
    search_fields = ("categoryName", "slug")
    ordering = ("-created_at",)

    readonly_fields = ("slug", "created_at", "updated_at")

    fieldsets = (
        ("Category Info", {
            "fields": ("categoryName", "slug")
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
    list_display = ("id","title","isActive","isDeleted","created_at")
    search_fields = ("title",)
    list_filter = ("isActive", "isDeleted")
   
    
    
@admin.register(FAQDescription)
class FAQDescriptionAdmin(admin.ModelAdmin):
    list_display = ("id","faq","isActive","isDeleted","created_at","updated_at",)
    list_filter = ("isActive","isDeleted","created_at",)
    search_fields = ("faq__title","description",)
    ordering = ("-created_at",)
    readonly_fields = ("created_at","updated_at",)
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
    list_display = ("id","name","category","isActive","isDeleted","created_at",)
    list_filter = ("isActive","isDeleted","category",)
    search_fields = ("name",)
    readonly_fields = ("created_at","updated_at",)
    ordering = ("-created_at",)
    
    
@admin.register(Promocode)
class PromocodeAdmin(admin.ModelAdmin):
    list_display = ("promocodeName","promocodeType","isActive","started_at","ended_at",)
    search_fields = ("promocodeName",)
    list_filter = ("promocodeType", "isActive")
    readonly_fields = ("created_at", "updated_at")
    
    
@admin.register(PrivacyPolicy)
class PrivacyPolicyAdmin(admin.ModelAdmin):
    list_display = ("title","privacyPolicyType","type","language","version","isActive","created_at",)
    search_fields = ("title",)
    list_filter = ("privacyPolicyType", "type", "language", "isActive")
    
    
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
    


@admin.register(QuotationTemplate)
class QuotationTemplateAdmin(admin.ModelAdmin):

    # Admin list page me kya dikhe
    list_display = (
        "slug",
        "title",
        "language",
        "version",
        "userType",
        "is_active",
        "is_deleted",
        "created_at",
    )

    # Right side filters
    list_filter = (
        "title",
        "language",
        "is_active",
        "is_deleted",
    )

    # Search bar
    search_fields = (
        "slug",
        "content",
    )

    # Auto slug fill (agar manually na diya ho)
    prepopulated_fields = {
        "slug": ("title",)
    }

    # Fields grouping (detail page)
    fieldsets = (
        ("Template Info", {
            "fields": (
                "title",
                "slug",
                "language",
                "version",
            )
        }),
        ("Template Content", {
            "fields": (
                "content",
            )
        }),
        ("Settings", {
            "fields": (
                "userType",
                "is_active",
                "is_deleted",
            )
        }),
        ("Timestamps", {
            "fields": (
                "created_at",
                "updated_at",
            )
        }),
    )

    # Read-only fields
    readonly_fields = (
        "userType",
        "created_at",
        "updated_at",
    )

    # Default ordering
    ordering = ("-created_at",)


@admin.register(AdminNotification)
class AdminNotificationAdmin(admin.ModelAdmin):

    # Admin list page columns
    list_display = (
        "id",
        "title",
        "priority",
        "is_seen",
        "content_type",
        "object_id",
        "created_at",
    )

    # Right-side filters
    list_filter = (
        "priority",
        "is_seen",
        "content_type",
        "created_at",
    )

    # Search bar
    search_fields = (
        "title",
        "message",
        "object_id",
    )

    # Detail page field grouping
    fieldsets = (
        ("Notification Info", {
            "fields": (
                "title",
                "message",
                "priority",
            )
        }),
        ("Related Object", {
            "fields": (
                "content_type",
                "object_id",
            )
        }),
        ("Status", {
            "fields": (
                "is_seen",
            )
        }),
        ("Timestamps", {
            "fields": (
                "created_at",
            )
        }),
    )

    # Read-only fields
    readonly_fields = (
        "content_type",
        "object_id",
        "created_at",
    )

    # Default ordering
    ordering = ("-created_at",)

    # Optional: Quick actions
    actions = ["mark_as_seen"]

    def mark_as_seen(self, request, queryset):
        queryset.update(is_seen=True)

    mark_as_seen.short_description = "Mark selected notifications as seen"
