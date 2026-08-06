"use client";

import { useCallback, useEffect, useState } from "react";
import Tabs from "./components/Tabs";
import PdfTemplates from "./components/pdf-templates/PdfTemplates";
import Exports from "./components/exports/Exports";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
    apiGetSimulationConfig,
    apiSaveSimulationConfig,
} from "@/services/SimulationConfigService";

const notify = (title, type, message) =>
    toast.push(
        <Notification title={title} type={type}>
            {message}
        </Notification>,
    );

const SimulationConfigurationPage = () => {
    const { session } = useCurrentSession();
    const accessToken = session?.user?.accessToken;

    const [activeTab, setActiveTab] = useState("PDF Template");
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchConfig = useCallback(async () => {
        if (!accessToken) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await apiGetSimulationConfig(accessToken);
            if (res?.status) setConfig(res.data);
        } catch (error) {
            console.error("Failed to load simulation config:", error);
            notify("Error", "danger", "Could not load the configuration");
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    // Both tabs save through here. The response carries the recomputed preview,
    // so one round trip keeps everything (including the size estimate) in sync.
    const saveConfig = async (payload, successMessage) => {
        if (saving) return false;

        try {
            setSaving(true);
            const res = await apiSaveSimulationConfig(accessToken, payload);
            if (res?.status) {
                setConfig(res.data);
                notify("Success", "success", successMessage || res.message);
                return true;
            }
            notify("Error", "danger", res?.message || "Could not save changes");
            return false;
        } catch (error) {
            console.error("Failed to save simulation config:", error);
            notify(
                "Error",
                "danger",
                error?.response?.data?.message || "Could not save changes",
            );
            return false;
        } finally {
            setSaving(false);
        }
    };

    const sharedProps = {
        config,
        loading,
        saving,
        onSave: saveConfig,
        onReset: fetchConfig,
    };

    const renderTab = () => {
        switch (activeTab) {
            case "PDF Template":
                return <PdfTemplates {...sharedProps} />;
            case "Exports":
                return <Exports {...sharedProps} />;
            default:
                return null;
        }
    };

    return (
        <div className="px-5 md:px-8 lg:px-12 py-8 bg-white min-h-screen">
            <p className="text-sm text-[#486284] mb-2">
                Admin Dashboard /{" "}
                <span className="text-[#1C2C56]">Simulation Configuration</span>
            </p>
            <h1 className="text-2xl font-semibold text-[#1C2C56]">
                Simulation Configuration
            </h1>
            <p className="text-base font-medium text-[#64748B]">
                Configure simulation settings and exports
            </p>

            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="mt-6">{renderTab()}</div>
        </div>
    );
};

export default SimulationConfigurationPage;
