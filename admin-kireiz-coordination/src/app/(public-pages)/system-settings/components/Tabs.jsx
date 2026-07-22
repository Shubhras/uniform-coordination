const tabs = [
  "General Settings",
  "Payment Settings",
  "Email & Notifications",
];

const Tabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="mt-5 flex gap-6 overflow-x-auto border-b border-[#90A3BF9C]">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActiveTab(tab)}
          className={`whitespace-nowrap border-b pb-2 text-base ${
            activeTab === tab
              ? "border-[#1C2C56] text-[#2B211C]"
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
