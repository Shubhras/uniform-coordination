import { useTranslations } from "next-intl";
import {
  FiLayers,
  FiGrid,
  FiDroplet,
  FiFileText,
  FiPackage,
} from "react-icons/fi";

const tabItems = [
  { id: "Fabrics", key: "fabrics", icon: FiLayers },
  { id: "Parts", key: "parts", icon: FiGrid },
  { id: "Colors", key: "colors", icon: FiDroplet },
  { id: "Template", key: "template", icon: FiFileText },
  { id: "Products", key: "products", icon: FiPackage },
];

const Tabs = ({ activeTab, setActiveTab }) => {
  const t = useTranslations("productSpecification.tabs");

  return (
    <div className="flex gap-6 border-b border-[#90A3BF9C] mt-6 overflow-x-auto">
      {tabItems.map(({ id, key, icon: Icon }) => (
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
          {t(key)}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
