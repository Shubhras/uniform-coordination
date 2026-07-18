const tabs = [
  "FAQ / Terms Assistant",
  "Order & Delivery",
  "Product Search",
  "Draft Generator",
];

const Tabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="mt-5 flex gap-6 overflow-x-auto border-b border-[#E8DDD4]">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActiveTab(tab)}
          className={`whitespace-nowrap border-b pb-3 text-[12px] ${
            activeTab === tab
              ? "border-[#B56735] text-[#2B211C]"
              : "border-transparent text-[#7F756E]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
