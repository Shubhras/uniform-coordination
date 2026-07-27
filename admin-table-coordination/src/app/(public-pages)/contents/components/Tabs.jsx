import {
  FiLayers,
  FiGrid,
  FiDroplet,
  FiFileText,
  FiPackage,
} from "react-icons/fi";

const tabs = [
  { label: "Categories", icon: FiLayers },
  // { label: "Catelog Images", icon: FiGrid },
  { label: "Blog", icon: FiDroplet },
  { label: "FAQ", icon: FiFileText },
  // { label: "PDF Templates", icon: FiPackage },
];

const Tabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex gap-6 border-b border-[#90A3BF9C] mt-6 overflow-x-auto">
      {tabs.map(({ label, icon: Icon }) => (
        <button
          key={label}
          onClick={() => setActiveTab(label)}
          className={`pb-1 text-base font-medium flex items-center gap-2 whitespace-nowrap ${
            activeTab === label
              ? "text-[#000000] text-[16px] border-b-3 border-[#A85A32]"
              : "text-[#525252] text-[16px]"
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
