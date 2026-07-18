"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Tabs from "./Tabs";
import PricingRules from "./pricingRules/PricingRules";
import Promotions from "./promotions/Promotions";

const PricingPackages = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Pricing Rules");

  const renderTab = () => {
    switch (activeTab) {
      case "Pricing Rules":
        return <PricingRules />;
      case "Promotions":
        return <Promotions />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[32px] font-semibold leading-tight text-[#2A211D]">
            Pricing &amp; Packages
          </h1>
          <p className="mt-1 text-[12px] text-[#B29D8C]">
            Manage rental rates, late fees, shipping charges, and promotional discounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push(
              activeTab === "Pricing Rules"
                ? "/pricing-packages/edit-pricing-rules"
                : "/pricing-packages/create-promotion"
            )
          }
          className="inline-flex h-[34px] items-center rounded-[8px] bg-[#B56735] px-4 text-[11px] font-medium text-white"
        >
          {activeTab === "Pricing Rules" ? "Edit Pricing Rules" : "+ Create Promotion"}
        </button>
      </div>

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {renderTab()}
    </div>
  );
};

export default PricingPackages;
