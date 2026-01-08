"use client";

import {
  FiBox,
  FiBarChart2,
  FiUsers,
  FiGrid,
  FiMessageSquare,
  FiFileText,
} from "react-icons/fi";

const actions = [
  { label: "Add Product", icon: FiBox },
  { label: "View Orders", icon: FiBarChart2 },
  { label: "Manage Users", icon: FiUsers },
  { label: "Themes & Templates", icon: FiGrid },
  { label: "Inquiries", icon: FiMessageSquare, badge: "12" },
  { label: "Generate Report", icon: FiFileText },
];

const QuickActionsCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5">
      <h3 className="text-[#1C2C56] font-semibold mb-6">
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className=" flex flex-col items-center justify-center gap-2 border border-[#E2E8F0] rounded-lg py-6 cursor-pointer hover:shadow-md transition"
            >
              <div className="relative">
                {item.badge && (
                  <span className="absolute -top-1 left-2 bg-[#E0E7FF] text-[#1C2C56] text-xs font-medium p-2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>

              <div className="bg-[#1C2C56] text-white p-3 rounded-md">
                <Icon size={18} />
              </div>

              <p className="text-sm text-[#475569] text-center">
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
