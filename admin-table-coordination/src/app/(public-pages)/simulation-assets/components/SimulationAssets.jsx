"use client";

import { useState } from "react";
import Tabs from "./Tabs";
import SimulationStructure from "./simulationStructure/SimulationStructure";
import ProductVisibility from "./productVisibility/ProductVisibility";
import PreviewSimulation from "./previewSimulation/PreviewSimulation";
import { useTranslations } from "next-intl";

const SimulationAssets = () => {
  const t = useTranslations("simulationAssets.simulationStructure");
  const [activeTab, setActiveTab] = useState("Simulation Structure");

  const renderTab = () => {
    switch (activeTab) {
      case "Simulation Structure":
        return <SimulationStructure />;
      case "Product Visibility":
        return <ProductVisibility />;
      case "Preview Simulation":
        return <PreviewSimulation />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-[28px] font-semibold leading-tight text-[#2A211D]">
        {t("tile")}
      </h1>
      <p className="mt-1 text-[13px] text-[#B29D8C]">
        {t("subtitle")}
      </p>

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {renderTab()}
    </div>
  );
};

export default SimulationAssets;
