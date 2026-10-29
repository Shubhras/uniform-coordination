"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  const tabParam = searchParams.get("tab");
  const initialTab =
    tabParam === "B2B Accounts" || tabParam === "B2B+Accounts"
      ? "Admin Users"
      : tabParam || "Admin Users";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      if (tab === "B2B Accounts" || tab === "B2B+Accounts") {
        setActiveTab("Admin Users");
      } else {
        setActiveTab(tab);
      }
    }
  }, [searchParams]);

  const renderTab = () => {
    switch (activeTab) {
      case "Admin Users":
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

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="mt-6">{renderTab()}</div>
    </div>
  );
};

export default CustomerPage;
