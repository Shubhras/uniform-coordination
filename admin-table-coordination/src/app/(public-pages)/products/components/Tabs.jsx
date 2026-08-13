import {
  FiLayers,
  FiDroplet,
  FiMaximize2,
  FiSliders,
  FiBookmark,
  FiGrid,
  FiBox
} from "react-icons/fi";

const tabs = [
  { key: "Fabrics", label: "Fabrics", icon: FiLayers },
  { key: "Colors", label: "Colors", icon: FiDroplet },
  { key: "TableShape", label: "Table Shape", icon: FiGrid },
  { key: "Closure", label: "Closure", icon: FiSliders },
  { key: "Style", label: "Style", icon: FiBookmark },
  { key: "Size", label: "Size", icon: FiMaximize2 },
  { key: "Pattern", label: "Pattern", icon: FiBox },
];

const Tabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex gap-6 border-b border-[#90A3BF9C] mt-6 overflow-x-auto">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`pb-2 text-base font-medium flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
            activeTab === key
              ? "text-[#1C2C56] border-[#1C2C56]"
              : "text-[#64748B] border-transparent hover:text-[#1C2C56]"
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
