#!/usr/bin/env python3
"""
Seed Sidebar Menus and Admin Permissions
========================================
Creates or updates all 16 sidebar navigation menus for the Admin Panel,
and grants all permissions (view, create, update, delete) to the 'admin' role.
Also initializes default (safe) permissions for other roles like 'b2c'.

Usage:
  Directly:
    python seed_sidebar_menus.py
  Inside Docker container:
    docker exec -it table-backend python seed_sidebar_menus.py
  Via Django manage command:
    python manage.py seed_sidebar_menus
"""

import os
import sys
import django
from django.db import transaction

# Setup Django environment
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
        "name": "Theme Management",
        "slug": "theme_management",
        "icon": "IoColorPaletteOutline",
        "route": "/theme-management",
        "order": 4,
    },
    {
        "name": "Inventory Management",
        "slug": "inventory_management",
        "icon": "FiClipboard",
        "route": "/inventory-management",
        "order": 5,
    },
    {
        "name": "Orders & Rentals",
        "slug": "order_rentals",
        "icon": "FiShoppingCart",
        "route": "/orders",
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
        "name": "Pricing & Packages",
        "slug": "pricing_packages",
        "icon": "FiDollarSign",
        "route": "/pricing-packages",
        "order": 8,
    },
    {
        "name": "Payment Management",
        "alt_names": ["Payments"],
        "slug": "payments",
        "icon": "MdPayment",
        "route": "/payments",
        "order": 9,
    },
    {
        "name": "Contracts & Policies",
        "slug": "contracts_policies",
        "icon": "FiFileText",
        "route": "/contracts-policies",
        "order": 10,
    },
    {
        "name": "Notifications",
        "slug": "notifications",
        "icon": "FiBell",
        "route": "/notifications",
        "order": 11,
    },
    {
        "name": "AI & Automation",
        "slug": "ai_automation",
        "icon": "FiCpu",
        "route": "/ai-automation",
        "order": 12,
    },
    {
        "name": "Users & Permissions",
        "slug": "user_permission",
        "icon": "FiUsers",
        "route": "/users-permissions",
        "order": 13,
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
]


def seed_menus_and_permissions():
    print("=" * 65)
    print("  SEEDING SIDEBAR MENUS & ADMIN PERMISSIONS")
    print("=" * 65)

    with transaction.atomic():
        # 1. Resolve or create Admin role
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

        # Get all other active roles (e.g. b2c)
        other_roles = list(Role.objects.exclude(id=admin_role.id).exclude(role_name__in=['sales_rep', 'sale_per']))
        if other_roles:
            role_names = ", ".join([f"{r.role_name} (ID={r.id})" for r in other_roles])
            print(f"[Role] Other roles to initialize: {role_names}")

        print("\n[Menus & Permissions]")
        print("-" * 65)

        created_count = 0
        updated_count = 0

        for item in SIDEBAR_MENUS:
            name = item["name"]
            slug = item["slug"]
            icon = item.get("icon", "")
            route = item.get("route", "")
            order = item.get("order", 0)
            alt_names = item.get("alt_names", [])

            # Check if menu exists by slug or name or alternate names
            menu = Menu.objects.filter(slug=slug).first()
            if not menu:
                menu = Menu.objects.filter(name=name).first()
            if not menu and alt_names:
                menu = Menu.objects.filter(name__in=alt_names).first()

            if not menu:
                menu = Menu.objects.create(
                    name=name,
                    icon=icon,
                    route=route,
                    order=order,
                    isActive=True,
                    isDeleted=False,
                )
                # Override slug to match exact frontend key (Menu.save auto-slugifies)
                Menu.objects.filter(pk=menu.pk).update(slug=slug)
                created_count += 1
                status_str = "CREATED"
            else:
                # Update existing menu fields
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

            # 2. Grant FULL permissions to Admin role
            perm_obj, perm_created = RoleMenuPermission.objects.update_or_create(
                role=admin_role,
                menu=menu,
                defaults={
                    "can_view": True,
                    "can_create": True,
                    "can_update": True,
                    "can_delete": True,
                }
            )

            # Also grant admin permissions on submenus if any exist
            for sub in menu.submenus.filter(isDeleted=False):
                RoleSubMenuPermission.objects.update_or_create(
                    role=admin_role,
                    submenu=sub,
                    defaults={
                        "can_view": True,
                        "can_create": True,
                        "can_update": True,
                        "can_delete": True,
                    }
                )

            # 3. For other roles (e.g. b2c), initialize permissions if not existing (safe default: False)
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

            print(f"  [{status_str}] #{order:02d} {name:<26} (slug: {slug:<22}) -> Admin: ALL PERMISSIONS (View/Create/Update/Delete)")

        print("-" * 65)
        print(f"Summary: {created_count} created, {updated_count} updated. Total menus: {len(SIDEBAR_MENUS)}")
        print(f"Admin Role (ID={admin_role.id}) now has full access to ALL {len(SIDEBAR_MENUS)} sidebar menus.")
        print("=" * 65)


if __name__ == "__main__":
    seed_menus_and_permissions()
