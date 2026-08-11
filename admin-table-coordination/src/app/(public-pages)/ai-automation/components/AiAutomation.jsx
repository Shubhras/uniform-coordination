"use client";

import { useState } from "react";
import Tabs from "./Tabs";
import TermsAssistant from "./termsAssistant/TermsAssistant";
import OrderDelivery from "./orderDelivery/OrderDelivery";
import ProductSearch from "./productSearch/ProductSearch";
import DraftGenerator from "./draftGenerator/DraftGenerator";
import { useTranslations } from "next-intl";

const AiAutomation = () => {
  const t = useTranslations("aiAutomation.termAssistant");
  const [activeTab, setActiveTab] = useState("FAQ / Terms Assistant");

  const renderTab = () => {
    switch (activeTab) {
      case "FAQ / Terms Assistant":
        return <TermsAssistant />;
      case "Order & Delivery":
        return <OrderDelivery />;
      case "Product Search":
        return <ProductSearch />;
      case "Draft Generator":
        return <DraftGenerator />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-[28px] font-semibold leading-tight text-[#2A211D]">
        {t("aiAutomatin")}
      </h1>
      <p className="mt-1 text-[13px] text-[#B29D8C]">
        {t("setUp")}
      </p>

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {renderTab()}
    </div>
  );
};

export default AiAutomation;
