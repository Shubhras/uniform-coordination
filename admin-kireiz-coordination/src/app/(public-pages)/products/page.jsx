"use client";

import { useState } from "react";
import FabricsTab from "./components/fabrics/FabricsTab";
import PartsTab from "./components/parts/PartsTab";
import TemplatesTab from "./components/templates/TemplatesTab";
import ColorsTab from "./components/colors/ColorsTab";
import ProductsTab from "./components/products/ProductsTab";
import Tabs from "./components/Tabs";

const ProductSpecificationPage = () => {
  const [activeTab, setActiveTab] = useState("Fabrics");

  const renderTab = () => {
    switch (activeTab) {
      case "Fabrics":
        return <FabricsTab />;
      case "Parts":
        return <PartsTab />;
      case "Colors":
        return <ColorsTab />;
      case "Template":
        return <TemplatesTab />;
      case "Products":
        return <ProductsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="px-5 md:px-8 lg:px-12 py-8 bg-[#F8FAFF] min-h-screen">
      {/* Page Header */}
      <p className="text-sm text-[#486284] mb-2">
        Admin Dashboard / <span className="text-[#1C2C56]">Product & Specification</span>
      </p>

      <h1 className="text-2xl font-semibold text-[#1C2C56]">
        Product & Specification Management
      </h1>
      <p className="text-base font-medium text-[#64748B]">
        Manage fabrics, parts, colors, options, and templates
      </p>

      {/* Tabs */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-6">
        {renderTab()}
      </div>
    </div>
  );
};

export default ProductSpecificationPage;
