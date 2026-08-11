import {
  FiLayers,
  FiGrid,
  FiDroplet,
  FiFileText,
  FiPackage,
} from "react-icons/fi";
import { useTranslations } from "next-intl";


const tabs = [
  // { label: "Fabrics", icon: FiLayers },
  // { label: "Parts", icon: FiGrid },
  // { label: "Colors", icon: FiDroplet },
  // { label: "Template", icon: FiFileText },
  // { label: "Products", icon: FiPackage },
   { key: "Fabrics", label: "fabrics", icon: FiLayers },
  // { key: "Parts", label: "parts", icon: FiGrid },
  { key: "Colors", label: "colors", icon: FiDroplet },
];


const Tabs = ({ activeTab, setActiveTab }) => {
    const t = useTranslations("productSpecification.fabric");

  return (
    <div className="flex gap-6 border-b border-[#90A3BF9C] mt-6 overflow-x-auto">
      {tabs.map(({ key,label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`pb-1 text-base font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === key
            ? "text-[#1C2C56] border-b-3 border-[#1C2C56]"
            : "text-[#64748B]"
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
