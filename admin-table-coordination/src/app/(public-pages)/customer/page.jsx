"use client";

import { useState } from "react";
import Tabs from "./components/Tabs";
import B2BAccounts from "./components/b2b-accounts/B2BAccounts";
import QuotationHistory from "./components/quotation-history/QuotationHistory";
import SalesRepresentation from "./components/sales-representation/SalesRepresentation";
import Assignments from "./components/assignments/Assignments";
import Permission from "./components/permission/Permission";

const CustomerPage = () => {
    const [activeTab, setActiveTab] = useState("B2B Accounts");

    const renderTab = () => {
        switch (activeTab) {
            case "B2B Accounts":
                return <B2BAccounts />;
            case "Quotation History":
                return <QuotationHistory />;
            case "Sales Representation":
                return <SalesRepresentation />;
            case "Assignments":
                return <Assignments />;
            case "Permission":
                return <Permission />;
            default:
                return null;
        }
    };

    return (
        <div className="px-5 md:px-8 lg:px-12 py-8 bg-white min-h-screen">
            <p className="text-sm text-[#486284] mb-2">
                Admin Dashboard / <span className="text-[#1C2C56]">Customer</span>
            </p>
            <h1 className="text-2xl font-semibold text-[#1C2C56]">
                Customer
            </h1>
            <p className="text-base font-medium text-[#64748B]">
                Manage customer accounts and relationships
            </p>

            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="mt-6">
                {renderTab()}
            </div>
        </div>
    );
};

export default CustomerPage;
