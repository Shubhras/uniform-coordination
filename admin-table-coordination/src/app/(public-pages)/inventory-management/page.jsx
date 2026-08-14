"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiPlus } from "react-icons/fi";
import InventoryList from "./components/lists/InventoryList";
import InspectionQueueList from "./components/queue/InspectionQueueList";
import DamagedItemsList from "./components/damagedItems/DamagedItemsList";
import CleaningItems from "./components/cleaningItems/CleaningItems";
import Tabs from "./components/Tabs";
import { useTranslations } from "next-intl";

const InventoryManagement = () => {
  const t = useTranslations("inventoryManagement");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("inventory");
  const [isDetailMode, setIsDetailMode] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const lower = tabParam.toLowerCase();
      if (lower.includes("inspect")) {
        setActiveTab("inspection");
      } else if (lower.includes("damage")) {
        setActiveTab("damaged");
      } else if (lower.includes("clean")) {
        setActiveTab("cleaning");
      } else if (lower.includes("inventory")) {
        setActiveTab("inventory");
      } else {
        setActiveTab(tabParam);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    setIsDetailMode(false);
  }, [activeTab]);

  const renderTab = () => {
    switch (activeTab) {
      case "inventory":
        return <InventoryList />;
      case "inspection":
        return <InspectionQueueList onDetailModeChange={setIsDetailMode} />;
      case "damaged":
        return <DamagedItemsList />;
      case "cleaning":
        return <CleaningItems />;

      default:
        return null;
    }
  };

  return (
    <div className="px-3 md:px-4 lg:px-8 py-6 bg-white min-h-screen">
      {!isDetailMode && (
        <>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[28px] font-semibold text-[#1A1410]">
                {t("invenotyrTitle")}
              </h1>

              <p className="text-[16px] text-[#757575] mt-1">
                {t("inventoryContent")}
              </p>
            </div>

            {activeTab === "inventory" && (
              <button
                onClick={() => router.push("/inventory-management/add")}
                className="flex items-center gap-2 bg-[#A85A32] hover:bg-[#8F4D2A] text-white px-3 py-2 rounded-lg font-medium transition"
              >
                <FiPlus size={18} />
                {t("add")}
              </button>
            )}
          </div>

          {/* Tabs */}
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
      )}

      {/* Tab Content */}
      <div className="mt-6">{renderTab()}</div>
    </div>
  );
};

export default InventoryManagement;
