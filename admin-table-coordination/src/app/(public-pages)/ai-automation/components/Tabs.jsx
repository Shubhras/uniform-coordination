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
          className={`pb-1 text-base font-medium whitespace-nowrap ${
            activeTab === tab
              ? "text-[#000000] text-[16px] border-b-3 border-[#A85A32]"
              : "text-[#525252] text-[16px]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
