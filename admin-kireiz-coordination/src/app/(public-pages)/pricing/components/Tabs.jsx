"use client";

import { useTranslations } from "next-intl";
import { FiFileText, FiDollarSign, FiAlertCircle, FiFile } from "react-icons/fi";

// `key` is the stable identity used by the page's switch and by ?tab= links, so
// it must never be translated. Only `labelKey` drives what the admin sees.
const tabs = [
    { key: "Quotation Template", labelKey: "quotationTemplate", icon: FiFileText },
    { key: "Unit Price", labelKey: "unitPrice", icon: FiDollarSign },
    { key: "Special Conditions", labelKey: "specialConditions", icon: FiAlertCircle },
    { key: "PDF Templates", labelKey: "pdfTemplates", icon: FiFile },
];

const Tabs = ({ activeTab, setActiveTab }) => {
    const t = useTranslations("pricingQuotation.tabs");

    return (
        <div className="flex gap-6 border-b border-[#90A3BF9C] mt-6 overflow-x-auto">
            {tabs.map(({ key, labelKey, icon: Icon }) => (
                <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`pb-1 text-base font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === key
                        ? "text-[#1C2C56] border-b-4 border-[#1C2C56]"
                        : "text-[#64748B]"
                        }`}
                >
                    <Icon size={16} />
                    {t(labelKey)}
                </button>
            ))}
        </div>
    );
};

export default Tabs;
