"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import FabricsTab from "./components/fabrics/FabricsTab";
import PartsTab from "./components/parts/PartsTab";
import TemplatesTab from "./components/templates/TemplatesTab";
import ColorsTab from "./components/colors/ColorsTab";
import SizeTab from "./components/options/SizeTab";
import ProductsTab from "./components/products/ProductsTab";
import Tabs from "./components/Tabs";

const ProductSpecificationPage = () => {
  const t = useTranslations("productSpecification");
  const searchParams = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [activeTab, setActiveTab] = useState("Fabrics");

  const renderTab = () => {
    switch (activeTab) {
      case "Fabrics":
        return <FabricsTab />;
      case "Parts":
        return <PartsTab />;
      case "Colors":
        return <ColorsTab />;
      case "Size":
        return <SizeTab />;
      case "Template":
        return <TemplatesTab />;
      case "Products":
        return <ProductsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="px-5 md:px-8 lg:px-12 py-8 bg-white min-h-screen">
      {/* Page Header */}
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

      {/* Tabs */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-6">{renderTab()}</div>
    </div>
  );
};

export default ProductSpecificationPage;
