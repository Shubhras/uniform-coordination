
"use client";

import { useTranslations } from "next-intl";
import { FiFile, FiDownload } from "react-icons/fi";

const Tabs = ({ activeTab, setActiveTab }) => {
    const t = useTranslations("pdfSimulationConfig.tabs");

    const tabs = [
        { id: "PDF Template", label: t("pdfTemplate"), icon: FiFile },
        { id: "Exports", label: t("exports"), icon: FiDownload },
    ];

    return (
        <div className="flex gap-6 border-b border-[#90A3BF9C] mt-6 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`pb-3 text-base font-medium flex items-center gap-2 whitespace-nowrap ${
                        activeTab === id
                            ? "text-[#1C2C56] border-b-4 border-[#1C2C56]"
                            : "text-[#64748B]"
                    }`}
                >
                    <Icon size={16} />
                    {label}
                </button>
            ))}
        </div>
    );
};

export default Tabs;
