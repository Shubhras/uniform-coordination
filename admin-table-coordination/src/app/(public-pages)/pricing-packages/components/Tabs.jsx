import { useTranslations } from "next-intl";

const tabs = [
  { key: "Pricing Rules", labelKey: "pricingRules.pricingRule" },
  { key: "Promotions", labelKey: "promotions.promotion" },
];

const Tabs = ({ activeTab, setActiveTab }) => {
  const t = useTranslations("pricingPackages");

  return (
    <div className="mt-5 flex gap-6 overflow-x-auto border-b border-[#E8DDD4]">
      {tabs.map(({ key, labelKey }) => (
        <button
          key={key}
          type="button"
          onClick={() => setActiveTab(key)}
          className={`pb-1 text-base font-medium whitespace-nowrap ${
            activeTab === key
              ? "text-[#000000] text-[16px] border-b-3 border-[#A85A32]"
              : "text-[#525252] text-[16px]"
          }`}
        >
          {t(labelKey)}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
