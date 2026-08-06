from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from .models import Role, Menu, SubMenu, RoleMenuPermission, RoleSubMenuPermission
from .serializers import RolePermissionAssignSerializer
from .auth import IsAdminUserJWT, MultiRoleJWTAuth

class RolePermissionAssignView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Permissions Management"],
        summary="Assign Permissions to a Role",
        request=RolePermissionAssignSerializer,
        responses={200: OpenApiResponse(description="Permissions assigned successfully")}
    )
    def post(self, request):
        serializer = RolePermissionAssignSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Validation Error",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        role = serializer.validated_data["role"]
        permissions_data = serializer.validated_data["permissions"]

        with transaction.atomic():
            # Clear existing permissions for this role
            RoleMenuPermission.objects.filter(role=role).delete()
            RoleSubMenuPermission.objects.filter(role=role).delete()

            for menu_data in permissions_data:
                menu = menu_data["menu_id"]
                can_view = menu_data["can_view"]
                can_create = menu_data["can_create"]
                can_update = menu_data["can_update"]
                can_delete = menu_data["can_delete"]

                # Create menu permission
                RoleMenuPermission.objects.create(
                    role=role,
                    menu=menu,
                    can_view=can_view,
                    can_create=can_create,
                    can_update=can_update,
                    can_delete=can_delete
                )

                # Process submenus if provided
                submenus_data = menu_data.get("submenus", [])
                for submenu_data in submenus_data:
                    submenu = submenu_data["submenu_id"]
                    sub_can_view = submenu_data["can_view"]
                    sub_can_create = submenu_data["can_create"]
                    sub_can_update = submenu_data["can_update"]
                    sub_can_delete = submenu_data["can_delete"]

                    RoleSubMenuPermission.objects.create(
                        role=role,
                        submenu=submenu,
                        can_view=sub_can_view,
                        can_create=sub_can_create,
                        can_update=sub_can_update,
                        can_delete=sub_can_delete
                    )

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Permissions assigned successfully"
        }, status=status.HTTP_200_OK)


# class RolePermissionListView(APIView):
#     authentication_classes = [IsAdminUserJWT]

#     @extend_schema(
#         tags=["Permissions Management"],
#         summary="Get Permissions for a Role",
#         parameters=[
#             OpenApiParameter(name="role_id", description="Role ID to get permissions for", required=True, type=int)
#         ],
#         responses={200: OpenApiResponse(description="Permissions retrieved successfully")}
#     )
#     def get(self, request):
#         role_id = request.query_params.get("role_id")
#         if not role_id:
#             return Response({
#                 "statusCode": 400,
#                 "status": False,
#                 "message": "role_id query parameter is required."
#             }, status=status.HTTP_400_BAD_REQUEST)

#         role = get_object_or_404(Role, id=role_id)

#         # Get all active menus and submenus to form the full permission structure
#         menus = Menu.objects.filter(isDeleted=False).order_by("order")
        
#         # Fetch current saved permissions
#         menu_perms = {
#             perm.menu_id: perm 
#             for perm in RoleMenuPermission.objects.filter(role=role)
#         }
#         submenu_perms = {
#             perm.submenu_id: perm 
#             for perm in RoleSubMenuPermission.objects.filter(role=role)
#         }

#         result = []
#         for menu in menus:
#             m_perm = menu_perms.get(menu.id)
            
#             # Submenus list
#             submenus_list = []
#             for sub in menu.submenus.filter(isDeleted=False).order_by("order"):
#                 s_perm = submenu_perms.get(sub.id)
#                 submenus_list.append({
#                     "submenu_id": sub.id,
#                     "submenu_name": sub.name,
#                     "can_view": s_perm.can_view if s_perm else False,
#                     "can_create": s_perm.can_create if s_perm else False,
#                     "can_update": s_perm.can_update if s_perm else False,
#                     "can_delete": s_perm.can_delete if s_perm else False,
#                 })

#             result.append({
#                 "menu_id": menu.id,
#                 "menu_name": menu.name,
#                 "can_view": m_perm.can_view if m_perm else False,
#                 "can_create": m_perm.can_create if m_perm else False,
#                 "can_update": m_perm.can_update if m_perm else False,
#                 "can_delete": m_perm.can_delete if m_perm else False,
#                 "submenus": submenus_list
#             })

#         return Response({
#             "statusCode": 200,
#             "status": True,
#             "message": "Permissions retrieved successfully",
#             "data": {
#                 "role_id": role.id,
#                 "role_name": role.role_name,
#                 "permissions": result
#             }
#         }, status=status.HTTP_200_OK)

class RolePermissionListView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Permissions Management"],
        summary="Get Role Permissions",
        parameters=[
            OpenApiParameter(
                name="role_id",
                description="Optional Role ID. If omitted, returns all roles with permissions.",
                required=False,
                type=int,
            )
        ],
        responses={200: OpenApiResponse(description="Permissions retrieved successfully")},
    )
    def get(self, request):
        role_id = request.query_params.get("role_id")

        # Get all active menus
        menus = Menu.objects.filter(isDeleted=False).order_by("order")

        # -----------------------------
        # Helper function
        # -----------------------------
        def build_permissions(role):
            menu_perms = {
                p.menu_id: p
                for p in RoleMenuPermission.objects.filter(role=role)
            }

            submenu_perms = {
                p.submenu_id: p
                for p in RoleSubMenuPermission.objects.filter(role=role)
            }

            permissions = []

            for menu in menus:
                m_perm = menu_perms.get(menu.id)

                submenus = []

                for sub in menu.submenus.filter(isDeleted=False).order_by("order"):
                    s_perm = submenu_perms.get(sub.id)

                    submenus.append({
                        "submenu_id": sub.id,
                        "submenu_name": sub.name,
                        "can_view": s_perm.can_view if s_perm else False,
                        "can_create": s_perm.can_create if s_perm else False,
                        "can_update": s_perm.can_update if s_perm else False,
                        "can_delete": s_perm.can_delete if s_perm else False,
                    })

                permissions.append({
                    "menu_id": menu.id,
                    "menu_name": menu.name,
                    "can_view": m_perm.can_view if m_perm else False,
                    "can_create": m_perm.can_create if m_perm else False,
                    "can_update": m_perm.can_update if m_perm else False,
                    "can_delete": m_perm.can_delete if m_perm else False,
                    "submenus": submenus,
                })

            return permissions

        # =====================================================
        # Single Role
        # =====================================================
        if role_id:
            role = get_object_or_404(Role, id=role_id)

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Permissions retrieved successfully.",
                "data": {
                    "role_id": role.id,
                    "role_name": role.role_name,
                    "permissions": build_permissions(role)
                }
            }, status=status.HTTP_200_OK)

        # =====================================================
        # All Roles
        # =====================================================
        roles = Role.objects.all().order_by("id")

        data = []

        for role in roles:
            data.append({
                "role_id": role.id,
                "role_name": role.role_name,
                "permissions": build_permissions(role)
            })

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Role permissions retrieved successfully.",
            "count": len(data),
            "data": data
        }, status=status.HTTP_200_OK)
   


class SaveUpdateRolePermissionView(APIView):
    authentication_classes = [IsAdminUserJWT]

    @extend_schema(
        tags=["Permissions Management"],
        summary="Create/Update Role Permissions",
        description="Create or update menu and submenu permissions for one or multiple roles in a single request.",
        request={
            "application/json": {
                "example": {
                    "roles": [
                        {
                            "role_id": 1,
                            "permissions": [
                                {
                                    "menu_id": 1,
                                    "can_view": True,
                                    "can_create": True,
                                    "can_update": False,
                                    "can_delete": False,
                                    "submenus": [
                                        {
                                            "submenu_id": 1,
                                            "can_view": True,
                                            "can_create": True,
                                            "can_update": False,
                                            "can_delete": False
                                        },
                                        {
                                            "submenu_id": 2,
                                            "can_view": True,
                                            "can_create": False,
                                            "can_update": False,
                                            "can_delete": False
                                        }
                                    ]
                                },
                                {
                                    "menu_id": 2,
                                    "can_view": True,
                                    "can_create": False,
                                    "can_update": False,
                                    "can_delete": False,
                                    "submenus": []
                                }
                            ]
                        },
                        {
                            "role_id": 2,
                            "permissions": [
                                {
                                    "menu_id": 1,
                                    "can_view": True,
                                    "can_create": False,
                                    "can_update": True,
                                    "can_delete": False,
                                    "submenus": [
                                        {
                                            "submenu_id": 1,
                                            "can_view": True,
                                            "can_create": False,
                                            "can_update": True,
                                            "can_delete": False
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        },
        responses={
            200: OpenApiResponse(description="Permissions saved successfully"),
            400: OpenApiResponse(description="Validation error")
        }
    )
    @transaction.atomic
    def post(self, request):

        roles = request.data.get("roles", [])

        if not roles:
            return Response(
                {
                    "statusCode": 400,
                    "status": False,
                    "message": "roles is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        for role_data in roles:

            role_id = role_data.get("role_id")

            if not role_id:
                continue

            role = get_object_or_404(Role, id=role_id)

            permissions = role_data.get("permissions", [])

            for menu_data in permissions:

                menu = get_object_or_404(
                    Menu,
                    id=menu_data.get("menu_id")
                )

                RoleMenuPermission.objects.update_or_create(
                    role=role,
                    menu=menu,
                    defaults={
                        "can_view": menu_data.get("can_view", False),
                        "can_create": menu_data.get("can_create", False),
                        "can_update": menu_data.get("can_update", False),
                        "can_delete": menu_data.get("can_delete", False),
                    }
                )

                for submenu_data in menu_data.get("submenus", []):

                    submenu = get_object_or_404(
                        SubMenu,
                        id=submenu_data.get("submenu_id"),
                        menu=menu
                    )

                    RoleSubMenuPermission.objects.update_or_create(
                        role=role,
                        submenu=submenu,
                        defaults={
                            "can_view": submenu_data.get("can_view", False),
                            "can_create": submenu_data.get("can_create", False),
                            "can_update": submenu_data.get("can_update", False),
                            "can_delete": submenu_data.get("can_delete", False),
                        }
                    )

        return Response(
            {
                "statusCode": 200,
                "status": True,
                "message": "Role permissions saved successfully."
            },
            status=status.HTTP_200_OK
        )
            
                   
# The admin sidebar has nine sections but only six existed as Menu rows, so
# Reports & Analytics, System Settings and Quotation Requests could never be
# permission-controlled. Seeded here (idempotent) rather than in a data migration
# so a fresh install and an existing one converge on the same set.
ADMIN_MENU_SEED = [
    {"name": "Dashboard", "slug": "dashboard", "route": "/admin-form", "order": 1},
    {"name": "Product & Specification", "slug": "product_specification", "route": "/products", "order": 2},
    {"name": "Content & Media", "slug": "content_media", "route": "/contents", "order": 3},
    {"name": "Pricing & Quotation", "slug": "order_manage", "route": "/pricing", "order": 4},
    {"name": "Customer & Sales Representative", "slug": "customer_sales_representative", "route": "/customer", "order": 5},
    {"name": "PDF & Simulation Configuration", "slug": "pdf_simulation_configuration", "route": "/simulation-configuration", "order": 6},
    {"name": "Reports & Analytics", "slug": "reports_analytics", "route": "/reports-analytics", "order": 7},
    {"name": "System Settings", "slug": "system_settings", "route": "/system-settings", "order": 8},
    {"name": "Quotation Requests", "slug": "quotation_requests", "route": "/quotation-requests", "order": 9},
]


def ensure_admin_menus():
    """
    Make sure every sidebar section exists as a Menu row with a stable slug.

    Menu.save() derives the slug from the name, so slug is set with an update()
    afterwards to keep the exact values the frontend matches on.
    """
    for entry in ADMIN_MENU_SEED:
        menu, created = Menu.objects.get_or_create(
            name=entry["name"],
            defaults={
                "route": entry["route"],
                "order": entry["order"],
                "isActive": True,
            },
        )
        # Force the canonical slug/route/order even for pre-existing rows.
        Menu.objects.filter(pk=menu.pk).update(
            slug=entry["slug"], route=entry["route"], order=entry["order"]
        )


class UserMenuPermissionView(APIView):
    authentication_classes = [MultiRoleJWTAuth]

    @extend_schema(
        tags=["Permissions Management"],
        summary="Get Accessible Menus for Current User",
        responses={200: OpenApiResponse(description="User permissions retrieved successfully")}
    )
    def get(self, request):
        ensure_admin_menus()

        user = request.user
        role = user.role

        if not role:
            # Was HTTP_430_FORBIDDEN, which does not exist in DRF — this branch
            # raised AttributeError instead of returning 403.
            return Response({
                "statusCode": 403,
                "status": False,
                "message": "User has no assigned role."
            }, status=status.HTTP_403_FORBIDDEN)

        # Get menu permissions where can_view is True
        allowed_menu_ids = RoleMenuPermission.objects.filter(
            role=role, can_view=True
        ).values_list("menu_id", flat=True)

        allowed_submenu_ids = RoleSubMenuPermission.objects.filter(
            role=role, can_view=True
        ).values_list("submenu_id", flat=True)

        # Fetch allowed menus and submenus
        menus = Menu.objects.filter(
            id__in=allowed_menu_ids, isDeleted=False, isActive=True
        ).order_by("order")

        result = []
        for menu in menus:
            submenus_list = []
            for sub in menu.submenus.filter(
                id__in=allowed_submenu_ids, isDeleted=False, isActive=True
            ).order_by("order"):
                submenus_list.append({
                    "id": sub.id,
                    "name": sub.name,
                    "slug": sub.slug,
                    "route": sub.route
                })
            
            result.append({
                "id": menu.id,
                "name": menu.name,
                "slug": menu.slug,
                "icon": menu.icon,
                "route": menu.route,
                "submenus": submenus_list
            })

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "User permissions retrieved successfully",
            "data": result
        }, status=status.HTTP_200_OK)
