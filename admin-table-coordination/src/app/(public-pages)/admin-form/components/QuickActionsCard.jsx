"use client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  FiBox,
  FiBarChart2,
  FiUsers,
  FiGrid,
  FiFileText,
  FiSettings,
} from "react-icons/fi";

const actions = [
  { labelKey: "addProduct", icon: FiBox, route: "/inventory-management/add" },
  { labelKey: "totalOrders", icon: FiBarChart2, route: "/orders" },
  { labelKey: "managePricing", icon: FiUsers, route: "/pricing-packages" },
  { labelKey: "themes", icon: FiGrid, route: "/theme-management" },
  { labelKey: "reports", icon: FiFileText, route: "/reports-analytics" },
  // { labelKey: "rentalUsageReport", icon: FiSettings ,route: "/" },
];

const QuickActionsCard = () => {
  const router = useRouter();
  const t = useTranslations("dashboard.quickActions");

  return (
    <div className="bg-white rounded-xl shadow-lg p-5">
      <h3 className="text-[#3B3B3B] text-[17px] font-semibold mb-5">
        {t("title")}
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {actions.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="border border-[#E2E8F0] rounded-lg py-5 flex flex-col items-center justify-center gap-3 hover:shadow-md transition cursor-pointer"
              onClick={() => router.push(item.route)}
            >
              <div className="bg-[#FEF3C7] w-11 h-11 rounded-lg flex items-center justify-center">
                <Icon size={18} className="text-[#A0522D]" />
              </div>

              <p className="text-[11px] text-center text-[#374151] px-2">
                {t(item.labelKey)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsCard;
