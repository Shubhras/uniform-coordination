
import { FiFileText, FiDollarSign, FiAlertCircle, FiFile } from "react-icons/fi";

const tabs = [
    { label: "Quotation Template", icon: FiFileText },
    { label: "Unit Price", icon: FiDollarSign },
    { label: "Special Conditions", icon: FiAlertCircle },
    { label: "PDF Templates", icon: FiFile },
];

const Tabs = ({ activeTab, setActiveTab }) => {
    return (
        <div className="flex gap-6 border-b border-[#90A3BF9C] mt-6 overflow-x-auto">
            {tabs.map(({ label, icon: Icon }) => (
                <button
                    key={label}
                    onClick={() => setActiveTab(label)}
                    className={`pb-1 text-base font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === label
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
