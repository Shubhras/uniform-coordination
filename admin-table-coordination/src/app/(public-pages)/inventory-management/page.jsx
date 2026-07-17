"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import InventoryList from "./components/lists/InventoryList";
import InspectionQueueList from "./components/queue/InspectionQueueList";
import DamagedItemsList from "./components/damagedItems/DamagedItemsList";
import CleaningItems from "./components/cleaningItems/CleaningItems";
import Tabs from "./components/Tabs";

const InventoryManagement = () => {
  const searchParams = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [activeTab, setActiveTab] = useState("Inventory Lists");

  const renderTab = () => {
    switch (activeTab) {
      case "Inventory Lists":
        return <InventoryList />;
      case "Inspection Queue":
        return <InspectionQueueList />;
      case "Damaged Items":
        return <DamagedItemsList />;
      case "Cleaning Items":
        return <CleaningItems />;

      default:
        return null;
    }
  };

  return (
    <div className="px-5 md:px-8 lg:px-12 py-8 bg-white min-h-screen">

      <h1 className="text-[28px] font-semibold text-[#1A1410]">
    Inventory Management
      </h1>
      <p className="text-[16px] text-[#757575] mt-3">
       Track inventory, stock status, and product availability.
      </p>

      {/* Tabs */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-6">{renderTab()}</div>
    </div>
  );
};

export default InventoryManagement;
