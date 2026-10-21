#!/usr/bin/env python3
"""
Seed Menus & Permissions via REST API
=====================================
Uses the UniformAdmin REST API to seed all 16 sidebar menus and assign
full permissions to the 'admin' role.

Usage:
  1. With credentials (auto-login):
     python seed_menus_api.py --email admin@example.com --password YourPassword

  2. With existing JWT access token:
     python seed_menus_api.py --token <YOUR_JWT_ACCESS_TOKEN>

  3. Custom Base URL (default is http://admintable.172.237.71.124.sslip.io/api/v1/space/uniformAdmin):
     python seed_menus_api.py --base-url http://127.0.0.1:8006/api/v1/space/uniformAdmin --token <TOKEN>
"""

import sys
import argparse
import requests

DEFAULT_BASE_URL = "http://admintable.172.237.71.124.sslip.io/api/v1/space/uniformAdmin"

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


def login(base_url, email, password):
    url = f"{base_url.rstrip('/')}/login/"
    print(f"Logging in as {email} at {url}...")
    resp = requests.post(url, json={"email": email, "password": password}, timeout=15)
    if resp.status_code != 200:
        print(f"Login failed: HTTP {resp.status_code} - {resp.text}")
        sys.exit(1)
    data = resp.json()
    token = data.get("data", {}).get("access_token")
    if not token:
        print(f"Could not extract access_token from response: {data}")
        sys.exit(1)
    print("Login successful!")
    return token


def run_api_seeder(base_url, token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    print("=" * 65)
    print(f"  SEEDING MENUS & PERMISSIONS VIA API: {base_url}")
    print("=" * 65)

    # 1. Fetch existing menus
    menu_list_url = f"{base_url.rstrip('/')}/menu/list/"
    print(f"Fetching existing menus from {menu_list_url}...")
    resp = requests.get(menu_list_url, headers=headers, timeout=15)
    if resp.status_code != 200:
        print(f"Failed to fetch menu list: HTTP {resp.status_code} - {resp.text}")
        sys.exit(1)

    existing_menus = resp.json().get("data", [])
    existing_by_name = {m.get("name", "").lower(): m for m in existing_menus}
    existing_by_slug = {m.get("slug", "").lower(): m for m in existing_menus}

    menu_create_url = f"{base_url.rstrip('/')}/menu/create/"
    final_menus = []

    for item in SIDEBAR_MENUS:
        name = item["name"]
        slug = item["slug"]
        order = item["order"]

        # Check if already exists
        match = existing_by_name.get(name.lower()) or existing_by_slug.get(slug.lower())
        # Handle 'Payments' vs 'Payment Management'
        if not match and slug == "payments":
            match = existing_by_name.get("payments")

        if match:
            print(f"  [EXISTS]  #{order:02d} {name} (ID: {match['id']})")
            final_menus.append({"id": match["id"], "name": name, "submenus": match.get("submenus", [])})
        else:
            payload = {
                "name": name,
                "icon": item["icon"],
                "route": item["route"],
                "order": order,
            }
            create_resp = requests.post(menu_create_url, json=payload, headers=headers, timeout=15)
            if create_resp.status_code in [200, 201]:
                created_data = create_resp.json().get("data", {})
                menu_id = created_data.get("id")
                print(f"  [CREATED] #{order:02d} {name} (ID: {menu_id})")
                final_menus.append({"id": menu_id, "name": name, "submenus": []})
            else:
                print(f"  [ERROR]   Failed creating {name}: {create_resp.status_code} - {create_resp.text}")

    # 2. Get role-permissions list to find role_ids
    role_perms_url = f"{base_url.rstrip('/')}/role-permissions/list/"
    print(f"\nFetching roles from {role_perms_url}...")
    role_resp = requests.get(role_perms_url, headers=headers, timeout=15)
    if role_resp.status_code != 200:
        print(f"Failed to fetch role-permissions list: HTTP {role_resp.status_code} - {role_resp.text}")
        sys.exit(1)

    roles_data = role_resp.json().get("data", [])
    admin_role = next((r for r in roles_data if r.get("role_name", "").lower() == "admin"), None)

    if not admin_role:
        print("Error: Could not find 'admin' role in role-permissions response!")
        print(f"Available roles: {[r.get('role_name') for r in roles_data]}")
        sys.exit(1)

    admin_role_id = admin_role["role_id"]
    print(f"Found Admin role: ID={admin_role_id}")

    # 3. Assign full permissions to Admin
    admin_permissions = []
    for m in final_menus:
        submenus_payload = []
        for s in m.get("submenus", []):
            submenus_payload.append({
                "submenu_id": s["id"],
                "can_view": True,
                "can_create": True,
                "can_update": True,
                "can_delete": True,
            })
        admin_permissions.append({
            "menu_id": m["id"],
            "can_view": True,
            "can_create": True,
            "can_update": True,
            "can_delete": True,
            "submenus": submenus_payload,
        })

    update_payload = {
        "roles": [
            {
                "role_id": admin_role_id,
                "permissions": admin_permissions
            }
        ]
    }

    update_url = f"{base_url.rstrip('/')}/role-permissions/update/"
    print(f"\nUpdating permissions at {update_url}...")
    update_resp = requests.post(update_url, json=update_payload, headers=headers, timeout=15)

    if update_resp.status_code == 200:
        print("\n" + "=" * 65)
        print("SUCCESS! All 16 sidebar menus created & full permissions granted to Admin.")
        print(f"Total Menus: {len(final_menus)}")
        print("=" * 65)
    else:
        print(f"Failed updating role permissions: HTTP {update_resp.status_code} - {update_resp.text}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed sidebar menus and admin permissions via API")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="Base API URL")
    parser.add_argument("--token", help="JWT access token")
    parser.add_argument("--email", help="Admin user email for login")
    parser.add_argument("--password", help="Admin user password for login")

    args = parser.parse_args()

    token = args.token
    if not token:
        if args.email and args.password:
            token = login(args.base_url, args.email, args.password)
        else:
            print("Error: Either --token or both --email and --password must be provided.")
            print("Example: python seed_menus_api.py --token <JWT_TOKEN>")
            print("     or: python seed_menus_api.py --email admin@example.com --password mypass")
            sys.exit(1)

    run_api_seeder(args.base_url, token)
