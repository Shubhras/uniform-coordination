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
  { labelKey: "uploadNewFabric", icon: FiBox, route: "/products?tab=Fabrics" },
  { labelKey: "viewQuotations", icon: FiBarChart2,route: "/quotation-requests"  },
  { labelKey: "manageB2bAccount", icon: FiUsers, route: "/customer?tab=B2B Accounts"  },
  { labelKey: "themesAndTemplates", icon: FiGrid ,route: "/products?tab=Template" },
  { labelKey: "generateReport", icon: FiFileText ,route: "/reports-analytics" },
  { labelKey: "systemSetting", icon: FiSettings ,route: "/system-settings" },
];

const QuickActionsCard = () => {
  const router = useRouter();
  const t = useTranslations("dashboard.quickActions");

  return (
    <div className="bg-white rounded-xl shadow-lg p-5">
      <h3 className="text-[#1C2C56] text-lg font-semibold mb-5">
        {t("quickActions")}
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              onClick={() => router.push(item.route)}
              className="border border-[#E2E8F0] rounded-lg py-5 flex flex-col items-center justify-center gap-3 hover:shadow-md transition cursor-pointer"
            >
              <div className="bg-[#1C4FA8] w-11 h-11 rounded-lg flex items-center justify-center">
                <Icon size={18} className="text-white" />
              </div>

              <p className="text-[11px] text-center text-[#475569] px-2">
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
