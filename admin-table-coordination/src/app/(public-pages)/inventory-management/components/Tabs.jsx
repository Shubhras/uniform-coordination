import {
  FiLayers,
  FiGrid,
  FiDroplet,
  FiFileText,
  FiPackage,
} from "react-icons/fi";
import { useTranslations } from "next-intl";

const tabs = [
  { key: "inventory" },
  { key: "inspection" },
  { key: "damaged" },
  { key: "cleaning" },
];

const Tabs = ({ activeTab, setActiveTab }) => {
  const t = useTranslations("inventoryManagement.tabs");

  return (
    <div className="flex gap-6 border-b border-[#90A3BF9C] mt-6 overflow-x-auto">
      {tabs.map(({ key }) => {
        const label = t(key);
        return (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`pb-1 text-base font-medium whitespace-nowrap ${
              activeTab === key
                ? "text-[#000000] text-[16px] border-b-3 border-[#A85A32]"
                : "text-[#525252] text-[16px]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
