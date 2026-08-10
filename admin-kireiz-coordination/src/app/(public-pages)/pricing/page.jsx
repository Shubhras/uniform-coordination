"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Tabs from "./components/Tabs";
import QuotationTemplate from "./components/quotation-template/QuotationTemplate";
import UnitPrice from "./components/unit-price/UnitPrice";
import SpecialConditions from "./components/special-conditions/SpecialConditions";
import PdfTemplates from "./components/pdf-templates/PdfTemplates";

const PricingPage = () => {
    const t = useTranslations("pricingQuotation");
    const [activeTab, setActiveTab] = useState("Quotation Template");

    const renderTab = () => {
        switch (activeTab) {
            case "Quotation Template":
                return <QuotationTemplate />;
            case "Unit Price":
                return <UnitPrice />;
            case "Special Conditions":
                return <SpecialConditions />;
            case "PDF Templates":
                return <PdfTemplates />;
            default:
                return null;
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

            <div className="mt-6">
                {renderTab()}
            </div>
        </div>
    );
};

export default PricingPage;
