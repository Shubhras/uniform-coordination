from django.contrib import admin
from .models import*
# from 


@admin.register(Users)
class UsersAdmin(admin.ModelAdmin):
    list_display = ('id', 'userName', 'email', 'firstName', 'lastName', 'isActive', 'isDeleted', 'loginType', 'createdAt')
    list_filter = ('isActive', 'isDeleted', 'loginType', 'createdAt')
    search_fields = ('email', 'userName', 'firstName', 'lastName')
    readonly_fields = ('createdAt', 'updatedAt')




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

@admin.register(CustomUpdateModel)
class CustomUpdateModelAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'user',
        'model_info',
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
        'user__username',
        'user__email',
        'model_info__id',
    )

    readonly_fields = (
        'created_at',
        'updated_at',
    )

    ordering = ('-created_at',)

    fieldsets = (
        ("User & Model Info", {
            'fields': ('user', 'model_info')
        }),
        ("Customization JSON Data", {
            'fields': ('json_data',),
            'description': "3D model ke user customization changes yahan JSON format me store hote hain"
        }),
        ("Status", {
            'fields': ('isActive', 'isDeleted')
        }),
        ("Timestamps", {
            'fields': ('created_at', 'updated_at')
        }),
    )
