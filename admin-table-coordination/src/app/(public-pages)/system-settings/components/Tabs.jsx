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
    <div className="mt-5 flex gap-6 overflow-x-auto border-b border-[#E8DDD4]">
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => setActiveTab(id)}
          className={`pb-1 text-base font-medium whitespace-nowrap ${
            activeTab === id
              ? "text-[#000000] text-[16px] border-b-3 border-[#A85A32]"
              : "text-[#525252] text-[16px]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
