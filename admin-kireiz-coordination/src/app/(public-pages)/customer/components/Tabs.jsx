import { useTranslations } from "next-intl";
import {
  FiUsers,
  FiClock,
  FiBriefcase,
  FiCheckSquare,
  FiUser,
  FiShield,
} from "react-icons/fi";

const tabItems = [
  { id: "B2B Accounts", key: "b2bAccounts", icon: FiUsers },
  { id: "Customers", key: "customers", icon: FiUser },
  { id: "Quotation History", key: "quotationHistory", icon: FiClock },
  { id: "Sales Representation", key: "salesRepresentation", icon: FiBriefcase },
  { id: "Assignments", key: "assignments", icon: FiCheckSquare },
  { id: "Permission", key: "permission", icon: FiShield },
];

const Tabs = ({ activeTab, setActiveTab }) => {
  const t = useTranslations("customerSalesRep.tabs");

  return (
    <div className="flex gap-6 border-b border-[#90A3BF9C] mt-6 overflow-x-auto">
      {tabItems.map(({ id, key, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`pb-3 text-base font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === id
              ? "text-[#1C2C56] border-b-4 border-[#1C2C56]"
              : "text-[#64748B] hover:text-[#1C2C56]"
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
