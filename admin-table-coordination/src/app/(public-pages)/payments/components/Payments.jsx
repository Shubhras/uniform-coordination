"use client";

import { useState } from "react";
import PaymentDashboard from "./PaymentDashboard";
import PaymentTransactions from "./PaymentTransactions";
import RefundManagement from "./RefundManagement";
import CouponManagement from "./CouponManagement";
import PromotionalCampaigns from "./PromotionalCampaigns";

const tabs = [
  {
    key: "dashboard",
    label: "Payment Dashboard",
    component: PaymentDashboard,
  },
  {
    key: "transactions",
    label: "Payment Transactions",
    component: PaymentTransactions,
  },
  {
    key: "refunds",
    label: "Refund Management",
    component: RefundManagement,
  },
  {
    key: "coupons",
    label: "Coupon Management",
    component: CouponManagement,
  },
  {
    key: "campaigns",
    label: "Promotional Campaigns",
    component: PromotionalCampaigns,
  },
];

const Payments = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const ActiveComponent = tabs.find((tab) => tab.key === activeTab)?.component;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white px-5 pb-4 pt-4">
        <h1 className="text-[28px] font-bold text-[#252525]">
          Payment Management
        </h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#e8e2dd] bg-white px-5">
        <div className="flex min-w-max items-center gap-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative whitespace-nowrap py-2 text-[14px] font-medium transition-colors ${
                  isActive
                    ? "text-[#92572F]"
                    : "text-[#444] hover:text-[#92572F]"
                }`}
              >
                {tab.label}

                {isActive && (
                  <span className="absolute bottom-[-1px] left-0 h-[3px] w-full rounded-t-full bg-[#92572F]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-5">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default Payments;
