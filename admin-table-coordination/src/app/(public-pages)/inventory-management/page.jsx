"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiPlus } from "react-icons/fi";
import InventoryList from "./components/lists/InventoryList";
import InspectionQueueList from "./components/queue/InspectionQueueList";
import DamagedItemsList from "./components/damagedItems/DamagedItemsList";
import CleaningItems from "./components/cleaningItems/CleaningItems";
import Tabs from "./components/Tabs";

const InventoryManagement = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab) {
      setActiveTab(tab);
      router.replace("/inventory-management");
    }
  }, [searchParams, router]);
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
    <div className="px-3 md:px-4 lg:px-8 py-6 bg-white min-h-screen">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-semibold text-[#1A1410]">
            Inventory Management
          </h1>

          <p className="text-[16px] text-[#757575] mt-1">
            Track inventory, stock status, and product availability.
          </p>
        </div>

        {activeTab === "Inventory Lists" && (
          <button
            onClick={() => router.push("/inventory-management/add")}
            className="flex items-center gap-2 bg-[#A85A32] hover:bg-[#8F4D2A] text-white px-3 py-2 rounded-lg font-medium transition"
          >
            <FiPlus size={18} />
            Add Product
          </button>
        )}
      </div>

      {/* Tabs */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-6">{renderTab()}</div>
    </div>
  );
};

export default InventoryManagement;
