"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import Tabs from "./Tabs";
import GeneralSettings from "./generalSettings/GeneralSettings";
import PaymentSettings from "./paymentSettings/PaymentSettings";
import EmailNotifications from "./emailNotifications/EmailNotifications";

const SystemSettings = () => {
  const t = useTranslations("systemSettings");
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(() => {
    if (tabFromUrl === "payment") return "Payment Settings";
    if (tabFromUrl === "notifications") return "Email & Notifications";
    return "General Settings";
  });

  useEffect(() => {
    if (tabFromUrl === "payment") {
      setActiveTab("Payment Settings");
    } else if (tabFromUrl === "notifications") {
      setActiveTab("Email & Notifications");
    } else if (tabFromUrl === "general") {
      setActiveTab("General Settings");
    }
  }, [tabFromUrl]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    let slug = "general";
    if (tabName === "Payment Settings") slug = "payment";
    if (tabName === "Email & Notifications") slug = "notifications";
    router.push(`/system-settings?tab=${slug}`, { scroll: false });
  };

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
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-5">
      <h1 className="text-[28px] font-semibold leading-tight text-[#2A211D]">
        {t("pageTitle")}
      </h1>
      <p className="mt-1 text-[13px] text-[#B29D8C]">
        {t("pageSubtitle")}
      </p>

      <Tabs activeTab={activeTab} setActiveTab={handleTabChange} />

      {renderTab()}
    </div>
  );
};

export default SystemSettings;
