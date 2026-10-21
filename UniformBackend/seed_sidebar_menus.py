#!/usr/bin/env python3
"""
Seed Sidebar Menus and Admin Permissions (UniformBackend)
=========================================================
Creates or updates all sidebar navigation menus and grants all permissions
(view, create, update, delete) to the 'admin' role.
"""

import os
import sys
import django
from django.db import transaction

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "UniformWeb.settings")
django.setup()

from uniformAdmin.models import Role, Menu, SubMenu, RoleMenuPermission, RoleSubMenuPermission

SIDEBAR_MENUS = [
    {
        "name": "Dashboard",
        "slug": "dashboard",
        "icon": "FiGrid",
        "route": "/admin-form",
        "order": 1,
    },
    {
        "name": "Product & Specification",
        "slug": "product_specification",
        "icon": "FiBox",
        "route": "/products",
        "order": 2,
    },
    {
        "name": "Content & Media",
        "slug": "content_media",
        "icon": "FiImage",
        "route": "/contents",
        "order": 3,
    },
    {
        "name": "Pricing & Quotation",
        "slug": "order_manage",
        "icon": "FiDollarSign",
        "route": "/pricing",
        "order": 4,
    },
    {
        "name": "Customer & Sales Representative",
        "slug": "customer_sales_representative",
        "icon": "FiUsers",
        "route": "/customer",
        "order": 5,
    },
    {
        "name": "PDF & Simulation Configuration",
        "slug": "pdf_simulation_configuration",
        "icon": "FiSettings",
        "route": "/simulation-configuration",
        "order": 6,
    },
    {
        "name": "Saved Simulations",
        "slug": "saved_simulations",
        "icon": "FiBookmark",
        "route": "/saved-simulations",
        "order": 7,
    },
    {
        "name": "Simulation Assets",
        "slug": "simulation_assets",
        "icon": "FiLayers",
        "route": "/simulation-assets",
        "order": 14,
    },
    {
        "name": "Reports & Analytics",
        "slug": "reports_analytics",
        "icon": "FiBarChart2",
        "route": "/reports-analytics",
        "order": 15,
    },
    {
        "name": "System Settings",
        "slug": "system_settings",
        "icon": "FiSettings",
        "route": "/system-settings",
        "order": 16,
    },
    {
        "name": "Quotation Requests",
        "slug": "quotation_requests",
        "icon": "FiFileText",
        "route": "/quotation-requests",
        "order": 17,
    },
]


def seed_menus_and_permissions():
    print("=" * 65)
    print("  SEEDING UNIFORM SIDEBAR MENUS & ADMIN PERMISSIONS")
    print("=" * 65)

    with transaction.atomic():
        admin_roles = Role.objects.filter(role_name__iexact="admin")
        if admin_roles.exists():
            admin_role = admin_roles.first()
            print(f"[Role] Found existing admin role: ID={admin_role.id}, Name='{admin_role.role_name}'")
        else:
            admin_role = Role.objects.create(
                role_name="admin",
                slug="admin",
                description="Administrator with full access"
            )
            print(f"[Role] Created admin role: ID={admin_role.id}, Name='{admin_role.role_name}'")

        other_roles = list(Role.objects.exclude(id=admin_role.id).exclude(role_name__in=['sales_rep', 'sale_per']))

        created_count = 0
        updated_count = 0

        for item in SIDEBAR_MENUS:
            name = item["name"]
            slug = item["slug"]
            icon = item.get("icon", "")
            route = item.get("route", "")
            order = item.get("order", 0)

            menu = Menu.objects.filter(slug=slug).first()
            if not menu:
                menu = Menu.objects.filter(name=name).first()

            if not menu:
                menu = Menu.objects.create(
                    name=name,
                    icon=icon,
                    route=route,
                    order=order,
                    isActive=True,
                    isDeleted=False,
                )
                Menu.objects.filter(pk=menu.pk).update(slug=slug)
                created_count += 1
                status_str = "CREATED"
            else:
                menu.name = name
                menu.icon = icon
                menu.route = route
                menu.order = order
                menu.isActive = True
                menu.isDeleted = False
                menu.save()
                Menu.objects.filter(pk=menu.pk).update(slug=slug)
                updated_count += 1
                status_str = "UPDATED"

            RoleMenuPermission.objects.update_or_create(
                role=admin_role,
                menu=menu,
                defaults={
                    "can_view": True,
                    "can_create": True,
                    "can_update": True,
                    "can_delete": True,
                }
            )

            for role in other_roles:
                RoleMenuPermission.objects.get_or_create(
                    role=role,
                    menu=menu,
                    defaults={
                        "can_view": False,
                        "can_create": False,
                        "can_update": False,
                        "can_delete": False,
                    }
                )

            print(f"  [{status_str}] #{order:02d} {name:<32} (slug: {slug})")

        print("-" * 65)
        print(f"Summary: {created_count} created, {updated_count} updated. Total: {len(SIDEBAR_MENUS)}")
        print(f"Admin Role (ID={admin_role.id}) now has full access to ALL {len(SIDEBAR_MENUS)} menus.")
        print("=" * 65)


if __name__ == "__main__":
    seed_menus_and_permissions()
