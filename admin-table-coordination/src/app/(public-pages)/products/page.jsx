"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import FabricsTab from "./components/fabrics/FabricsTab";
import PartsTab from "./components/parts/PartsTab";
import TemplatesTab from "./components/templates/TemplatesTab";
import ColorsTab from "./components/colors/ColorsTab";
import ProductsTab from "./components/products/ProductsTab";
import AttributeTab from "./components/attributes/AttributeTab";
import {
  TableShapesService,
  ClosuresService,
  StylesService,
  SizesService,
  PatternsService,
} from "@/services/AttributeService";
import Tabs from "./components/Tabs";
import { useTranslations } from "next-intl";

const ProductSpecificationPage = () => {
  const t = useTranslations("productSpecification.fabric");
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("Fabrics");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const renderTab = () => {
    switch (activeTab) {
      case "Fabrics":
        return <FabricsTab />;
      case "Parts":
        return <PartsTab />;
      case "Colors":
        return <ColorsTab />;
      case "TableShape":
        return (
          <AttributeTab
            attributeTitle={t("tableShape")}
            service={TableShapesService}
          />
        );
      case "Closure":
        return (
          <AttributeTab
            attributeTitle={t("tableShape")}
            service={ClosuresService}
          />
        );
      case "Style":
        return (
          <AttributeTab attributeTitle={t("style")} service={StylesService} />
        );
      case "Size":
        return (
          <AttributeTab attributeTitle={t("size")} service={SizesService} />
        );
      case "Pattern":
        return (
          <AttributeTab
            attributeTitle={t("pattern")}
            service={PatternsService}
          />
        );
      case "Template":
        return <TemplatesTab />;
      case "Products":
        return <ProductsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="px-5 md:px-8 lg:px-8 py-6 bg-white min-h-screen">
      <h1 className="text-2xl font-semibold text-[#1C2C56]">
        {t("productManagement")}
      </h1>
      <p className="text-base font-medium text-[#64748B]">
        {t("productSubtitle")}
      </p>

      {/* Tabs */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-6">{renderTab()}</div>
    </div>
  );
};

export default ProductSpecificationPage;
