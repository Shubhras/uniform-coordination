"use client";

import { useState } from "react";
import Tabs from "./components/Tabs";
import CategoriesTab from "./components/catogories/CategoriesTab";
import CatelogImagesTab from "./components/catelog-images/CatelogImagesTab";
import BlogTab from "./components/blog/BlogTab";
import FaqTab from "./components/faq/FaqTab";
import PdfTemplatesTab from "./components/pdf-templates/PdfTemplatesTab";

const ContentMediaPage = () => {
    const [activeTab, setActiveTab] = useState("Categories");

    const renderTab = () => {
        switch (activeTab) {
            case "Categories":
                return <CategoriesTab />;
            case "Catelog Images":
                return <CatelogImagesTab />;
            case "Blog":
                return <BlogTab />;
            case "FAQ":
                return <FaqTab />;
            case "PDF Templates":
                return <PdfTemplatesTab />;
            default:
                return null;
        }
    };

    return (
        <div className="px-5 md:px-8 lg:px-8 py-6 bg-white min-h-screen">
            {/* Page Header */}
            {/* <p className="text-sm text-[#486284] mb-2">
                Admin Dashboard / <span className="text-[#1C2C56]">Content & Media </span>
            </p> */}
            <h1 className="text-2xl font-semibold text-[#1C2C56]">
                Content & Media
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

export default ContentMediaPage;
