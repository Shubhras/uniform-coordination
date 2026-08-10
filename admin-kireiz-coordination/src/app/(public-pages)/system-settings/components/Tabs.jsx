"use client";

import { useTranslations } from "next-intl";

const Tabs = ({ activeTab, setActiveTab }) => {
  const t = useTranslations("systemSettings.tabs");

  const tabs = [
    { id: "General Settings", label: t("generalSettings") },
    { id: "Payment Settings", label: t("paymentSettings") },
    { id: "Email & Notifications", label: t("emailNotifications") },
  ];

  return (
    <div className="mt-5 flex gap-6 overflow-x-auto border-b border-[#90A3BF9C]">
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => setActiveTab(id)}
          className={`whitespace-nowrap border-b pb-2 text-base ${
            activeTab === id
              ? "border-[#1C2C56] text-[#2B211C]"
              : "border-transparent text-[#7F756E]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
