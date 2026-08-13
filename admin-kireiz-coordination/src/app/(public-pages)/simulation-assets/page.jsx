"use client";

import { useState } from "react";
import { FiSliders, FiEye } from "react-icons/fi";
import { useTranslations } from "next-intl";
import SimulationStructure from "./components/SimulationStructure";
import ProductVisibility from "./components/ProductVisibility";

/*
 * Two tabs, matching how the KIREIZ SPACE admin is configured:
 *   Simulation Structure — which attributes the customer simulation shows, in order
 *   Product Visibility   — which products the simulation offers at all
 *
 * Both feed the customer-facing simulation endpoints.
 *
 * Preview Simulation and Layer Order were dropped from this screen on request.
 * Their components (./components/PreviewSimulation.jsx and ./components/SimulationAssets.jsx)
 * are still on disk if either is wanted back — nothing else imports them.
 */
const TABS = [
  { key: "structure", labelKey: "tabStructure", icon: FiSliders },
  { key: "visibility", labelKey: "tabVisibility", icon: FiEye },
];

export default function Page() {
  const t = useTranslations("simulationAssets");
  const [activeTab, setActiveTab] = useState("structure");

  return (
    <div>
      <div className="px-5 md:px-8 lg:px-12 pt-8 bg-white">
        <div className="flex gap-6 border-b border-[#E2E8F0] overflow-x-auto">
          {TABS.map(({ key, labelKey, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`pb-3 text-base font-medium flex items-center gap-2 whitespace-nowrap ${
                activeTab === key
                  ? "text-[#1C2C56] border-b-4 border-[#1C2C56]"
                  : "text-[#64748B]"
              }`}
            >
              <Icon size={16} />
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 md:px-8 lg:px-12 pb-8 bg-white min-h-screen">
        {activeTab === "structure" && <SimulationStructure />}
        {activeTab === "visibility" && <ProductVisibility />}
      </div>
    </div>
  );
}
