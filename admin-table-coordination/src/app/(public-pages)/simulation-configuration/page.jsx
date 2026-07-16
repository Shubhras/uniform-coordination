"use client";

import { useState } from "react";
import Tabs from "./components/Tabs";
import PdfTemplates from "./components/pdf-templates/PdfTemplates";
import Exports from "./components/exports/Exports";

const SimulationConfigurationPage = () => {
    const [activeTab, setActiveTab] = useState("PDF Template");

    const renderTab = () => {
        switch (activeTab) {
            case "PDF Template":
                return <PdfTemplates />;
            case "Exports":
                return <Exports />;
            default:
                return null;
        }
    };

    return (
        <div className="px-5 md:px-8 lg:px-12 py-8 bg-white min-h-screen">
            <p className="text-sm text-[#486284] mb-2">
                Admin Dashboard / <span className="text-[#1C2C56]">Simulation Configuration</span>
            </p>
            <h1 className="text-2xl font-semibold text-[#1C2C56]">
                Simulation Configuration
            </h1>
            <p className="text-base font-medium text-[#64748B]">
                Configure simulation settings and exports
            </p>

            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="mt-6">
                {renderTab()}
            </div>
        </div>
    );
};

export default SimulationConfigurationPage;
