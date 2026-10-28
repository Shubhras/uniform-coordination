"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Tabs from "./Tabs";
import PricingRules from "./pricingRules/PricingRules";
import Promotions from "./promotions/Promotions";
import { useTranslations } from "next-intl";
import {
  FiPlus
} from "react-icons/fi";

const PricingPackages = () => {
  const t = useTranslations("pricingPackages.pricingRules");
  const tp = useTranslations("pricingPackages.promotions");
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const initialTab =
    tabParam && tabParam.toLowerCase().includes("promo")
      ? "Promotions"
      : "Pricing Rules";

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab) {
      if (currentTab.toLowerCase().includes("promo")) {
        setActiveTab("Promotions");
      } else if (
        currentTab.toLowerCase().includes("pricing") ||
        currentTab.toLowerCase().includes("rule")
      ) {
        setActiveTab("Pricing Rules");
      }
    }
  }, [searchParams]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    const param = key === "Promotions" ? "promotions" : "pricing-rules";
    router.replace(`/pricing-packages?tab=${param}`, { scroll: false });
  };

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
            {t("pricePackage")}
          </h1>
          <p className="mt-1 text-[13px] text-[#B29D8C]">
            {t("ppContent")}
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
          className="inline-flex h-[34px] items-center gap-2 rounded-[8px] bg-[#B56735] px-4 text-[14px] font-medium text-white"
        >
          {activeTab === "Pricing Rules" ? (
            t("editPrice")
          ) : (
            <>
              <FiPlus size={16} />
              {tp("createPromotions")}
            </>
          )}
        </button>
      </div>

      <Tabs activeTab={activeTab} setActiveTab={handleTabChange} />

      {renderTab()}
    </div>
  );
};

export default PricingPackages;
