import {
  FiLayers,
  FiGrid,
  FiDroplet,
  FiFileText,
  FiPackage,
} from "react-icons/fi";

const tabs = [
  { label: "Inventory Lists" },
  { label: "Inspection Queue" },
  { label: "Damaged Items" },
  { label: "Cleaning Items" },
];

const Tabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex gap-6 border-b border-[#90A3BF9C] mt-6 overflow-x-auto">
      {tabs.map(({ label }) => (
        <button
          key={label}
          onClick={() => setActiveTab(label)}
          className={`pb-1 text-base font-medium whitespace-nowrap ${
            activeTab === label
              ? "text-[#000000] text-[16px] border-b-3 border-[#A85A32]"
              : "text-[#525252] text-[16px]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
