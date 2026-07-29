"use client";
import { useRouter } from "next/navigation";
import {
  FiBox,
  FiBarChart2,
  FiUsers,
  FiGrid,
  FiFileText,
  FiSettings,
} from "react-icons/fi";

const actions = [
  { label: "Upload New Fabric", icon: FiBox, route: "/products?tab=Fabrics" },
  { label: "View Quotations", icon: FiBarChart2,route: "/quotation-requests"  },
  { label: "Manage B2B account", icon: FiUsers, route: "/customer?tab=B2B Accounts"  },
  { label: "Themes & Templates", icon: FiGrid ,route: "/products?tab=Template" },
  { label: "Generate Report", icon: FiFileText ,route: "/reports-analytics" },
  { label: "System setting", icon: FiSettings ,route: "/system-settings" },
];

const QuickActionsCard = () => {
  const router = useRouter();
  return (
    <div className="bg-white rounded-xl shadow-lg p-5">
      <h3 className="text-[#1C2C56] text-lg font-semibold mb-5">
        Quick Actions
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
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsCard;
