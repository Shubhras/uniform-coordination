import {
  FiLayers,
  FiGrid,
  FiDroplet,
  FiFileText,
  FiPackage,
} from "react-icons/fi";
import { useTranslations } from "next-intl";

const tabs = [
  // { label: "Categories", icon: FiLayers },
  // { label: "Catelog Images", icon: FiGrid },
  // { label: "Blog", icon: FiDroplet },
  // { label: "FAQ", icon: FiFileText },
  // { label: "PDF Templates", icon: FiPackage },
  { key: "Categories", label: "categories", icon: FiLayers },
  { key: "Blog", label: "blog", icon: FiDroplet },
  { key: "FAQ", label: "faq", icon: FiFileText },
];

const Tabs = ({ activeTab, setActiveTab }) => {
  const t = useTranslations("contentMedia.tabs");
  return (
    <div className="flex gap-6 border-b border-[#90A3BF9C] mt-6 overflow-x-auto">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`pb-1 text-base font-medium flex items-center gap-2 whitespace-nowrap ${
            activeTab === key
              ? "text-[#000000] text-[16px] border-b-3 border-[#A85A32]"
              : "text-[#525252] text-[16px]"
          }`}
        >
          <Icon size={16} />
          {t(label)}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
