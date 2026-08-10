"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useMenuPermissions } from "@/components/shared/MenuPermissionProvider";
import Image from "next/image";
import {
  FiGrid,
  FiPackage,
  FiFileText,
  FiDollarSign,
  FiUsers,
  FiSettings,
  FiChevronRight,
  FiChevronLeft,
  FiBarChart2,
  FiSliders,
  FiClipboard,
  FiImage,
} from "react-icons/fi";

// labelKey resolves against the "adminSidebar" namespace in messages/<locale>.json
// so the menu follows the language picked in the top header.
const sidebarMenu = [
  {
    labelKey: "dashboard",
    icon: FiGrid,
    path: "/admin-form",
    slug: "dashboard",
  },
  {
    labelKey: "productSpecification",
    icon: FiPackage,
    path: "/products",
    slug: "product_specification", // Changed back to products so it hides properly
  },
  {
    labelKey: "contentMedia",
    icon: FiImage,
    path: "/contents",
    slug: "content_media",
  },
  {
    labelKey: "pricingQuotation",
    icon: FiDollarSign,
    path: "/pricing",
    slug: "order_manage",
  },
  {
    labelKey: "customerSalesRepresentative",
    icon: FiUsers,
    path: "/customer",
    slug: "customer_sales_representative",
  },
  {
    labelKey: "pdfSimulationConfiguration",
    icon: FiSettings,
    path: "/simulation-configuration",
    slug: "pdf_simulation_configuration",
  },
  {
    labelKey: "simulationAssets",
    icon: FiImage,
    path: "/simulation-assets",
    slug: "simulation_assets",
  },
  {
    labelKey: "reportsAnalytics",
    icon: FiBarChart2,
    path: "/reports-analytics",
    slug: "reports_analytics",
  },
  {
    labelKey: "systemSettings",
    icon: FiSliders,
    path: "/system-settings",
    slug: "system_settings",
  },
  {
    labelKey: "quotationRequests",
    icon: FiFileText,
    path: "/quotation-requests",
    slug: "quotation_requests",
  },
];

const AdminSidebar = ({ collapsed, onToggle }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const t = useTranslations("adminSidebar");
  // Provider seeds from the JWT then refreshes from my-permissions/, so an admin
  // editing permissions no longer has to log out for the sidebar to update.
  const { canView } = useMenuPermissions();

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
              src="/img/others/auth-logo.png"
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
                        text-[#64748B] hover:text-[#1C2C56]
                        transition-colors duration-200
                        ${collapsed ? "absolute -right-3.5 top-5 bg-white border border-[#E2E8F0] shadow-sm" : ""}
                    `}
          aria-label={t("toggleSidebar")}
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
            // Hide sections this role cannot view. MenuRouteGuard enforces the
            // same rule for direct URL access.
            if (!canView(item.slug)) {
              return null;
            }

            const Icon = item.icon;
            const active = isActive(item.path);
            const label = t(item.labelKey);

            return (
              <li key={item.path}>
                <button
                  onClick={() => router.push(item.path)}
                  title={collapsed ? label : undefined}
                  className={`
                                        group relative flex items-center gap-3 w-full
                                        rounded-lg text-sm font-medium
                                        transition-all duration-200 cursor-pointer
                                        ${collapsed ? "px-3 py-3 justify-center" : "px-3 py-2.5"}
                                        ${
                                          active
                                            ? "bg-[#D1D9E9] text-[#1C2C56] shadow-none"
                                            : "text-[#1C2C56] hover:bg-[#F1F5F9] hover:text-[#1C2C56]"
                                        }
                                    `}
                >
                  <Icon
                    size={20}
                    className={`flex-shrink-0 transition-colors duration-200
                                            ${active ? "text-[#1C2C56]" : "text-[#1C2C56] group-hover:text-[#1C2C56]"}
                                        `}
                  />
                  {!collapsed && (
                    <span className="truncate leading-snug">{label}</span>
                  )}

                  {/* Tooltip on collapsed */}
                  {collapsed && (
                    <div
                      className="
                                            absolute left-full ml-3 px-3 py-1.5
                                            bg-[#1C2C56] text-white text-xs font-medium
                                            rounded-md whitespace-nowrap
                                            opacity-0 invisible
                                            group-hover:opacity-100 group-hover:visible
                                            transition-all duration-200
                                            pointer-events-none z-50
                                            shadow-lg
                                        "
                    >
                      {label}
                      <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-[#1C2C56] rotate-45" />
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
            <p className="text-xs text-[#64748B] font-medium">{t("kfAdminPanel")}</p>
            <p className="text-[10px] text-[#94A3B8] mt-0.5">v1.2.1</p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;
