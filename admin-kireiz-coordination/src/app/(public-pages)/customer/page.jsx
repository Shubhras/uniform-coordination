"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Tabs from "./components/Tabs";
import B2BAccounts from "./components/b2b-accounts/B2BAccounts";
import CustomersList from "./components/customers/CustomersList";
import QuotationHistory from "./components/quotation-history/QuotationHistory";
import SalesRepresentation from "./components/sales-representation/SalesRepresentation";
import Assignments from "./components/assignments/Assignments";
import Permission from "./components/permission/Permission";

const CustomerPage = () => {
  const t = useTranslations("customerSalesRep");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("B2B Accounts");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`/customer?${params.toString()}`, { scroll: false });
  };

  const renderTab = () => {
    switch (activeTab) {
      case "B2B Accounts":
        return <B2BAccounts />;
      case "Customers":
        return <CustomersList />;
      case "Quotation History":
        return <QuotationHistory />;
      case "Sales Representation":
        return <SalesRepresentation />;
      case "Assignments":
        return <Assignments />;
      case "Permission":
        return <Permission />;
      default:
        return <B2BAccounts />;
    }
  };

  return (
    <div className="px-5 md:px-8 lg:px-12 py-8 bg-white min-h-screen">
      <p className="text-sm text-[#486284] mb-2">
        {t("breadcrumbDashboard")} /{" "}
        <span className="text-[#1C2C56]">{t("breadcrumbCurrent")}</span>
      </p>
      <h1 className="text-2xl font-semibold text-[#1C2C56]">
        {t("pageTitle")}
      </h1>
      <p className="text-base font-medium text-[#64748B]">
        {t("pageSubtitle")}
      </p>

      <Tabs activeTab={activeTab} setActiveTab={handleTabChange} />

      <div className="mt-6">{renderTab()}</div>
    </div>
  );
};

export default CustomerPage;
