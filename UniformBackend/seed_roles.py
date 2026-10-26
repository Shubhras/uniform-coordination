#!/usr/bin/env python3
"""
Seed Administrative & System Roles (UniformBackend)
===================================================
Seeds the required system roles:
  Admin / Staff roles: admin, manager, editor, operations, accountant, staff
  Sales role: sales
  Customer roles: b2b, b2b_user, b2c, customer

Also initializes RoleMenuPermission records for each role across all active menus.
"""

import os
import sys
import django
from django.db import transaction

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "UniformWeb.settings")
django.setup()

from django.utils.text import slugify
from uniformAdmin.models import Role, Menu, SubMenu, RoleMenuPermission, RoleSubMenuPermission

ROLES_DATA = [
    {
        "role_name": "admin",
        "description": "Administrator with full system access",
        "is_admin_full_access": True,
    },
    {
        "role_name": "manager",
        "description": "General Manager with operational oversight",
        "is_admin_full_access": False,
    },
    {
        "role_name": "editor",
        "description": "Content, catalog, and product editor",
        "is_admin_full_access": False,
    },
    {
        "role_name": "operations",
        "description": "Operations and order management",
        "is_admin_full_access": False,
    },
    {
        "role_name": "accountant",
        "description": "Accounting and financial reports management",
        "is_admin_full_access": False,
    },
    {
        "role_name": "staff",
        "description": "Internal staff with limited access",
        "is_admin_full_access": False,
    },
    {
        "role_name": "sales",
        "description": "Sales Representative",
        "is_admin_full_access": False,
    },
    {
        "role_name": "b2b_user",
        "description": "Uniform B2B Customer Account",
        "is_admin_full_access": False,
    },
    {
        "role_name": "b2b",
        "description": "Uniform B2B Customer Account",
        "is_admin_full_access": False,
    },
    {
        "role_name": "b2c",
        "description": "Table B2C Customer Account",
        "is_admin_full_access": False,
    },
    {
        "role_name": "customer",
        "description": "Standard Customer",
        "is_admin_full_access": False,
    },
]


def seed_roles():
    print("=" * 65)
    print("SEEDING UNIFORM SYSTEM ROLES & PERMISSIONS")
    print("=" * 65)

    menus = Menu.objects.filter(isDeleted=False)

    with transaction.atomic():
        for role_info in ROLES_DATA:
            role_name = role_info["role_name"]
            description = role_info["description"]
            is_full = role_info["is_admin_full_access"]
            slug = slugify(role_name)

            role, created = Role.objects.get_or_create(
                role_name=role_name,
                defaults={
                    "slug": slug,
                    "description": description,
                }
            )

            status_str = "CREATED" if created else "EXISTS "
            print(f"[{status_str}] Role: {role_name:<15} (id={role.id}, slug={slug})")

            # Initialize menu permissions if not present
            for menu in menus:
                if is_full:
                    RoleMenuPermission.objects.update_or_create(
                        role=role,
                        menu=menu,
                        defaults={
                            "can_view": True,
                            "can_create": True,
                            "can_update": True,
                            "can_delete": True,
                        }
                    )
                else:
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

    print("=" * 65)
    print("Roles & permissions seeded successfully.")
    print("=" * 65)


if __name__ == "__main__":
    seed_roles()
