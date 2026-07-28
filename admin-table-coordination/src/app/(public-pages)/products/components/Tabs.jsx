import {
  FiLayers,
  FiGrid,
  FiDroplet,
  FiFileText,
  FiPackage,
} from "react-icons/fi";

const tabs = [
  { label: "Fabrics", icon: FiLayers },
  // { label: "Parts", icon: FiGrid },
  { label: "Colors", icon: FiDroplet },
  // { label: "Template", icon: FiFileText },
  // { label: "Products", icon: FiPackage },
];


const Tabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex gap-6 border-b border-[#90A3BF9C] mt-6 overflow-x-auto">
      {tabs.map(({ label, icon: Icon }) => (
        <button
          key={label}
          onClick={() => setActiveTab(label)}
          className={`pb-1 text-base font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === label
            ? "text-[#1C2C56] border-b-3 border-[#1C2C56]"
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
