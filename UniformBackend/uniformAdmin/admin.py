from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *

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
    list_display = ("id","name","category","isActive","isDeleted","created_at",)

    list_filter = ("isActive","isDeleted","category",)

    search_fields = ("name",)

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = ("-created_at",)
    
    
    
    