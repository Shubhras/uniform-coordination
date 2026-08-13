"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Tabs from "./Tabs";
import GeneralSettings from "./generalSettings/GeneralSettings";
import PaymentSettings from "./paymentSettings/PaymentSettings";
import EmailNotifications from "./emailNotifications/EmailNotifications";

const SystemSettings = () => {
  const t = useTranslations("systemSettings");
  const [activeTab, setActiveTab] = useState("General Settings");

  const renderTab = () => {
    switch (activeTab) {
      case "General Settings":
        return <GeneralSettings />;
      case "Payment Settings":
        return <PaymentSettings />;
      case "Email & Notifications":
        return <EmailNotifications />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-6">
      <h1 className="text-[28px] font-semibold leading-tight text-[#2A211D]">
        {t("pageTitle")}
      </h1>
      <p className="mt-1 text-[13px] text-[#B29D8C]">
        {t("pageSubtitle")}
      </p>

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {renderTab()}
    </div>
  );
};

export default SystemSettings;
