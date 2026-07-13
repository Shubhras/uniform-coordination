import jwt
from django.conf import settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from uniformAdmin.models import Role, AdminUser, Menu, SubMenu, RoleMenuPermission, RoleSubMenuPermission

class MenuAndPermissionsTestCase(APITestCase):
    def setUp(self):
        # Create roles
        self.admin_role = Role.objects.create(role_name="admin", slug="admin", description="Admin role")
        self.sales_role = Role.objects.create(role_name="sales_rep", slug="sales_rep", description="Sales rep role")

        # Create admin user
        self.admin_user = AdminUser.objects.create_user(
            email="admin@example.com",
            password="AdminPassword123!",
            name="Admin User",
            role=self.admin_role,
            is_staff=True,
            is_active=True
        )

        # Create sales user
        self.sales_user = AdminUser.objects.create_user(
            email="sales@example.com",
            password="SalesPassword123!",
            name="Sales User",
            role=self.sales_role,
            is_staff=False,
            is_active=True
        )

        # Generate JWT headers
        self.admin_headers = self._get_auth_headers(self.admin_user)
        self.sales_headers = self._get_auth_headers(self.sales_user)

    def _get_auth_headers(self, user):
        payload = {
            "user_id": user.id,
            "role": user.role.role_name
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
        return {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def test_menu_crud(self):
        # Create Menu
        url = reverse("menu-create")
        data = {
            "name": "Dashboard",
            "icon": "dashboard-icon",
            "route": "/dashboard",
            "order": 1
        }
        response = self.client.post(url, data, format="json", **self.admin_headers)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["name"], "Dashboard")
        menu_id = response.data["data"]["id"]

        # List Menus
        url = reverse("menu-list")
        response = self.client.get(url, **self.admin_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 1)

        # Get Menu Detail
        url = reverse("menu-detail", kwargs={"pk": menu_id})
        response = self.client.get(url, **self.admin_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["name"], "Dashboard")

        # Update Menu
        url = reverse("menu-update", kwargs={"pk": menu_id})
        data = {"name": "Admin Dashboard"}
        response = self.client.put(url, data, format="json", **self.admin_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["name"], "Admin Dashboard")

        # Soft Delete Menu
        url = reverse("menu-delete", kwargs={"pk": menu_id})
        response = self.client.delete(url, **self.admin_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Menu.objects.get(id=menu_id).isDeleted)

    def test_submenu_crud(self):
        # Setup parent menu
        menu = Menu.objects.create(name="Settings", slug="settings", order=2)

        # Create SubMenu
        url = reverse("submenu-create")
        data = {
            "menu": menu.id,
            "name": "Profile Settings",
            "route": "/settings/profile",
            "order": 1
        }
        response = self.client.post(url, data, format="json", **self.admin_headers)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["name"], "Profile Settings")
        submenu_id = response.data["data"]["id"]

        # List SubMenus
        url = reverse("submenu-list")
        response = self.client.get(url, **self.admin_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 1)

        # Get SubMenu Detail
        url = reverse("submenu-detail", kwargs={"pk": submenu_id})
        response = self.client.get(url, **self.admin_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["name"], "Profile Settings")

        # Update SubMenu
        url = reverse("submenu-update", kwargs={"pk": submenu_id})
        data = {"name": "User Profile Settings"}
        response = self.client.put(url, data, format="json", **self.admin_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["name"], "User Profile Settings")

        # Soft Delete SubMenu
        url = reverse("submenu-delete", kwargs={"pk": submenu_id})
        response = self.client.delete(url, **self.admin_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(SubMenu.objects.get(id=submenu_id).isDeleted)

    def test_permissions_assignment_and_retrieval(self):
        # Setup menu and submenu
        menu = Menu.objects.create(name="Orders", slug="orders", order=1)
        submenu = SubMenu.objects.create(menu=menu, name="Active Orders", slug="active_orders", order=1)

        # Assign Permissions
        url = reverse("role-permissions-assign")
        data = {
            "role_id": self.sales_role.id,
            "permissions": [
                {
                    "menu_id": menu.id,
                    "can_view": True,
                    "can_create": True,
                    "can_update": False,
                    "can_delete": False,
                    "submenus": [
                        {
                            "submenu_id": submenu.id,
                            "can_view": True,
                            "can_create": False,
                            "can_update": False,
                            "can_delete": False
                        }
                    ]
                }
            ]
        }
        response = self.client.post(url, data, format="json", **self.admin_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Retrieve Permissions
        url = reverse("role-permissions-list")
        response = self.client.get(f"{url}?role_id={self.sales_role.id}", **self.admin_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        permissions = response.data["data"]["permissions"]
        self.assertEqual(len(permissions), 1)
        self.assertEqual(permissions[0]["menu_name"], "Orders")
        self.assertTrue(permissions[0]["can_view"])
        self.assertTrue(permissions[0]["can_create"])
        self.assertFalse(permissions[0]["can_update"])
        self.assertEqual(len(permissions[0]["submenus"]), 1)
        self.assertEqual(permissions[0]["submenus"][0]["submenu_name"], "Active Orders")
        self.assertTrue(permissions[0]["submenus"][0]["can_view"])

    def test_dynamic_sidebar_permissions(self):
        # Setup menus
        menu1 = Menu.objects.create(name="Orders", slug="orders", order=1)
        submenu1 = SubMenu.objects.create(menu=menu1, name="Active Orders", slug="active_orders", order=1)

        menu2 = Menu.objects.create(name="Settings", slug="settings", order=2)
        submenu2 = SubMenu.objects.create(menu=menu2, name="System Settings", slug="system_settings", order=1)

        # Assign permissions (sales user can see Orders but not Settings)
        RoleMenuPermission.objects.create(
            role=self.sales_role,
            menu=menu1,
            can_view=True,
            can_create=True
        )
        RoleSubMenuPermission.objects.create(
            role=self.sales_role,
            submenu=submenu1,
            can_view=True
        )
        # Settings is explicitly can_view=False
        RoleMenuPermission.objects.create(
            role=self.sales_role,
            menu=menu2,
            can_view=False
        )

        # Get sidebar menus for sales rep user
        url = reverse("my-permissions")
        response = self.client.get(url, **self.sales_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data["data"]
        # Should only contain Orders, not Settings
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["name"], "Orders")
        self.assertEqual(len(data[0]["submenus"]), 1)
        self.assertEqual(data[0]["submenus"][0]["name"], "Active Orders")

    def test_menu_list_filtering(self):
        # Create multiple menus
        menu1 = Menu.objects.create(name="Menu One", slug="menu_one", order=1)
        menu2 = Menu.objects.create(name="Menu Two", slug="menu_two", order=2)
        SubMenu.objects.create(menu=menu1, name="SubMenu One", slug="submenu_one", order=1)
        SubMenu.objects.create(menu=menu2, name="SubMenu Two", slug="submenu_two", order=1)

        url = reverse("menu-list")
        
        # Test without filtering (should return both)
        response = self.client.get(url, **self.admin_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 2)

        # Test with menu_id filter for menu1
        response = self.client.get(f"{url}?menu_id={menu1.id}", **self.admin_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 1)
        self.assertEqual(response.data["data"][0]["id"], menu1.id)
        self.assertEqual(response.data["data"][0]["name"], "Menu One")
        self.assertEqual(len(response.data["data"][0]["submenus"]), 1)
        self.assertEqual(response.data["data"][0]["submenus"][0]["name"], "SubMenu One")

    def test_login_response_includes_permissions(self):
        # Create menu/submenu
        menu = Menu.objects.create(name="Analytics", slug="analytics", order=3)
        submenu = SubMenu.objects.create(menu=menu, name="Reports", slug="reports", order=1)

        # Assign permission to sales role
        RoleMenuPermission.objects.create(
            role=self.sales_role,
            menu=menu,
            can_view=True
        )
        RoleSubMenuPermission.objects.create(
            role=self.sales_role,
            submenu=submenu,
            can_view=True
        )

        url = reverse("admin-login")
        data = {
            "email": "sales@example.com",
            "password": "SalesPassword123!"
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check permissions in user object
        user_data = response.data["data"]["user"]
        self.assertIn("permissions", user_data)
        self.assertEqual(len(user_data["permissions"]), 1)
        self.assertEqual(user_data["permissions"][0]["name"], "Analytics")
        self.assertEqual(user_data["permissions"][0]["submenus"][0]["name"], "Reports")
        
        # Check permissions in data object
        self.assertIn("permissions", response.data["data"])
        self.assertEqual(len(response.data["data"]["permissions"]), 1)
        self.assertEqual(response.data["data"]["permissions"][0]["name"], "Analytics")
