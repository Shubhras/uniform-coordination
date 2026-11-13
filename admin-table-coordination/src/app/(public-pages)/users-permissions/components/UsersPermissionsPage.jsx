"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import AdminUsers from "./AdminUsers";
import Customers from "./Customers";
import PermissionPage from "./PermissionPage";

const UsersPermissionsPage = () => {
  const t = useTranslations("userPermissions.users");
  const tp = useTranslations("userPermissions.permissions");

  const router = useRouter();
  const searchParams = useSearchParams();

  const resolveTab = useCallback((tabParam) => {
    if (!tabParam) return "AdminUsers";
    const lower = tabParam.toLowerCase();
    if (lower === "users" || lower === "customers" || lower === "customer") {
      return "Users";
    }
    if (lower === "permissions" || lower === "permission") {
      return "Permissions";
    }
    if (
      lower === "adminusers" ||
      lower === "admin-users" ||
      lower === "admins" ||
      lower === "admin"
    ) {
      return "AdminUsers";
    }
    return "AdminUsers";
  }, []);

  // Tabs: 'AdminUsers' | 'Users' | 'Permissions'
  const [activeTab, setActiveTab] = useState(() =>
    resolveTab(searchParams?.get("tab"))
  );

  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam) {
      setActiveTab(resolveTab(tabParam));
    }
  }, [searchParams, resolveTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    const param =
      key === "Users"
        ? "customers"
        : key === "Permissions"
          ? "permissions"
          : "admin-users";
    router.replace(`/users-permissions?tab=${param}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8">
      {/* Title & Description */}
      <h1 className="text-xl xs:text-2xl sm:text-[30px] font-semibold leading-tight text-[#2A211D] tracking-tight">
        {t("title") || "Users & Permissions"}
      </h1>
      <p className="mt-1 text-xs sm:text-[13px] text-[#B29D8C]">
        {t("subtitle") ||
          "Manage administrator and staff accounts, customer profiles, and system role permissions."}
      </p>

      {/* Navigation Tabs */}
      <div className="mt-5 flex gap-6 sm:gap-8 border-b border-[#E8DDD4] overflow-x-auto">
        {[
          { key: "AdminUsers", label: t("adminUsers") || "Admin Users" },
          { key: "Users", label: t("customers") || "Customers" },
          { key: "Permissions", label: tp("permission") || "Permissions" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            className={`pb-1 text-base font-medium whitespace-nowrap ${
              activeTab === tab.key
                ? "text-[#000000] text-[16px] border-b-3 border-[#A85A32]"
                : "text-[#525252] text-[16px]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === "AdminUsers" && <AdminUsers />}
      {activeTab === "Users" && <Customers />}
      {activeTab === "Permissions" && <PermissionPage />}
    </div>
  );
};

export default UsersPermissionsPage;
