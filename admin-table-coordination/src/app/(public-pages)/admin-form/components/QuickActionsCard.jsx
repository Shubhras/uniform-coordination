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
  { label: "Add Product", icon: FiBox ,route: "/inventory-management/add" },
  { label: "Total Orders", icon: FiBarChart2 ,route: "/orders" },
  { label: "Manage Pricing", icon: FiUsers ,route: "/pricing-packages" },
  { label: "Themes", icon: FiGrid ,route: "/theme-management" },
  { label: "Reports", icon: FiFileText ,route: "/reports-analytics" },
  { label: "Rental & Usage Report", icon: FiSettings ,route: "/" },
];

const QuickActionsCard = () => {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl shadow-lg p-5">
      <h3 className="text-[#3B3B3B] text-[17px] font-semibold mb-5">
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
