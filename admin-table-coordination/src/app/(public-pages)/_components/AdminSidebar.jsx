"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  FiGrid,
  FiFileText,
  FiBell,
  FiCpu,
  FiDollarSign,
  FiUsers,
  FiSettings,
  FiBarChart2,
  FiChevronRight,
  FiChevronLeft,
  FiClipboard,
  FiShoppingCart,
  FiBox,
  FiImage,
  FiBookmark,
  FiCreditCard,
  FiLayers,
} from "react-icons/fi";
import { IoColorPaletteOutline } from "react-icons/io5";
import { MdPayment } from "react-icons/md";

const sidebarMenu = [
  {
    label: "dashboard",
    icon: FiGrid,
    path: "/admin-form",
    slug: "dashboard",
  },
  {
    label: "productSpecification",
    icon: FiBox,
    path: "/simulation-assets",
    slug: "simulation_assets",
  },
  {
    label: "contentMedia",
    icon: FiImage,
    path: "/media",
    slug: "media_management",
  },
  {
    label: "themeManagement",
    icon: IoColorPaletteOutline,
    path: "/theme-management",
    slug: "theme_management",
  },

  {
    label: "inventoryManagement",
    icon: FiClipboard,
    path: "/inventory-management",
    slug: "inventory_management",
  },
  {
    label: "orderRentals",
    icon: FiShoppingCart,
    path: "/orders",
    slug: "order_rentals", // Assigned 'order_manage' here based on API
  },
  {
    label: "savedSimulations",
    icon: FiBookmark,
    path: "/saved-simulations",
    slug: "saved_simulations",
  },
  {
    label: "pricingPackages",
    icon: FiDollarSign,
    path: "/pricing-packages",
    slug: "pricing_packages",
  },
  {
    label: "payments",
    icon: MdPayment,
    path: "/payments",
    slug: "payments",
  },
  {
    label: "contractsPolicies",
    icon: FiFileText,
    path: "/contracts-policies",
    slug: "contracts_policies",
  },
  {
    label: "notifications",
    icon: FiBell,
    path: "/notifications",
    slug: "notifications",
  },
  {
    label: "aiAutomation",
    icon: FiCpu,
    path: "/ai-automation",
    slug: "ai_automation",
  },
  {
    label: "usersPermissions",
    icon: FiUsers,
    path: "/users-permissions",
    slug: "user_permission",
  },
  {
    label: "simulationAssets",
    icon: FiLayers,
    path: "/simulation-assets",
    slug: "simulation_assets",
  },
  {
    label: "reportsAnalytics",
    icon: FiBarChart2,
    path: "/reports-analytics",
    slug: "reports_analytics",
  },
  {
    label: "systemSettings",
    icon: FiSettings,
    path: "/system-settings",
    slug: "system_settings",
  },
  //  {
  //   label: "paymentsDashboard",
  //   icon: FiCreditCard,
  //   path: "/payments",
  //   slug: "payments",
  // },
  // {
  //     label: 'Content & Media',
  //     icon: FiFileText,
  //     path: '/contents',
  //     slug: "content_media",
  // },
  // {
  //     label: 'Pricing & Quotation',
  //     icon: FiDollarSign,
  //     path: '/pricing',
  //     slug: "order_manage", // Assigned 'order_manage' here based on API
  // },
  // {
  //     label: 'Customer & Sales Representative',
  //     icon: FiUsers,
  //     path: '/customer',
  //     slug: "customer_sales_representative",
  // },
  // {
  //     label: 'PDF & Simulation Configuration',
  //     icon: FiSettings,
  //     path: '/simulation-configuration',
  //     slug: "pdf_simulation_configuration",
  // },
];

const AdminSidebar = ({ collapsed, onToggle }) => {
  const t = useTranslations("adminSidebar");
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const userPermissions = session?.user?.permissions || [];
  const userRole = session?.user?.authority?.[0]?.toLowerCase();

  const isActive = (path) => {
    if (path === "/admin-form") {
      return pathname === "/admin-form" || pathname === "/kireiz-form";
    }
    return pathname.startsWith(path);
  };

  return (
    <aside
      className={`
                fixed top-0 left-0 z-40 h-screen
                bg-white border-r border-[#E2E8F0]
                flex flex-col
                transition-all duration-300 ease-in-out
                ${collapsed ? "w-[72px]" : "w-[250px]"}
            `}
    >
      {/* Logo + Collapse Toggle */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#E2E8F0]">
        {!collapsed && (
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/admin-form")}
          >
            <Image
              src="/img/logo/sidebar-logo.png"
              width={120}
              height={36}
              alt="Kireiz Logo"
              priority
              className="object-contain"
            />
          </div>
        )}
        {collapsed && (
          <div
            className="flex items-center justify-center w-full cursor-pointer"
            onClick={() => router.push("/admin-form")}
          >
            <Image
              src="/img/others/auth-logo-small.png"
              width={30}
              height={30}
              alt="Kireiz Logo"
              priority
              className="object-contain"
            />
          </div>
        )}
        <button
          onClick={onToggle}
          className={`
                        flex items-center justify-center
                        w-7 h-7 rounded-full
                        bg-[#F1F5F9] hover:bg-[#E2E8F0]
                        text-[#64748B] hover:text-[#3B3B3B]
                        transition-colors duration-200
                        ${collapsed ? "absolute -right-3.5 top-5 bg-white border border-[#E2E8F0] shadow-sm" : ""}
                    `}
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <FiChevronRight size={14} />
          ) : (
            <FiChevronLeft size={14} />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
        <ul className="space-y-1">
          {sidebarMenu.map((item) => {
            // Superadmins ('admin') see all menus; non-admins are filtered by permissions
            if (userRole && userRole !== 'admin') {
              const hasPermission = userPermissions.some((permSlug) => 
                permSlug === item.slug ||
                (item.slug === 'order_rentals' && permSlug === 'order_manage') ||
                (item.slug === 'user_permission' && (permSlug === 'customer_sales_representative' || permSlug === 'users_permissions'))
              );

              if (item.slug && !hasPermission) {
                return null;
              }
            }

            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.path}>
                <button
                  onClick={() => router.push(item.path)}
                  title={collapsed ? t(item.label) : undefined}
                  className={`
                                        group relative flex items-center gap-3 w-full
                                        rounded-lg text-sm font-medium
                                        transition-all duration-200 cursor-pointer
                                        ${collapsed ? "px-3 py-3 justify-center" : "px-3 py-2.5"}
                                        ${
                                          active
                                            ? "bg-[#E1D1C7] text-[#3B3B3B] shadow-none"
                                            : "text-[#3B3B3B] hover:bg-[#E1D1C7] hover:text-[#3B3B3B]"
                                        }
                                    `}
                >
                  <Icon
                    size={20}
                    className={`flex-shrink-0 transition-colors duration-200
                                            ${active ? "text-[#3B3B3B]" : "text-[#3B3B3B] group-hover:text-[#3B3B3B]"}
                                        `}
                  />
                  {!collapsed && (
                    <span className="truncate leading-snug">
                      {t(item.label)}
                    </span>
                  )}

                  {/* Tooltip on collapsed */}
                  {collapsed && (
                    <div
                      className="
                                            absolute left-full ml-3 px-3 py-1.5
                                            bg-[#3B3B3B] text-white text-xs font-medium
                                            rounded-md whitespace-nowrap
                                            opacity-0 invisible
                                            group-hover:opacity-100 group-hover:visible
                                            transition-all duration-200
                                            pointer-events-none z-50
                                            shadow-lg
                                        "
                    >
                      {t(item.label)}
                      <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-[#3B3B3B] rotate-45" />
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      {!collapsed && (
        <div className="p-4 border-t border-[#E2E8F0]">
          <div className="bg-gradient-to-r from-[#EEF2FF] to-[#F0F9FF] rounded-lg p-3">
            <p className="text-xs text-[#64748B] font-medium">KS Admin Panel</p>
            <p className="text-[10px] text-[#94A3B8] mt-0.5">v1.2.1</p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;
