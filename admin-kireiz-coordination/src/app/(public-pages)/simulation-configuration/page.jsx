"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
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
    const t = useTranslations("pdfSimulationConfig");
    const router = useRouter();
    const searchParams = useSearchParams();
    const { session } = useCurrentSession();
    const accessToken = session?.user?.accessToken;

    const tabFromUrl = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState(
        tabFromUrl === "exports" ? "Exports" : "PDF Template",
    );
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (tabFromUrl === "exports") {
            setActiveTab("Exports");
        } else if (tabFromUrl === "pdf-template") {
            setActiveTab("PDF Template");
        }
    }, [tabFromUrl]);

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        const slug = tabName === "Exports" ? "exports" : "pdf-template";
        router.push(`/simulation-configuration?tab=${slug}`, { scroll: false });
    };

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
                {t("breadcrumbDashboard")} /{" "}
                <span className="text-[#1C2C56]">{t("breadcrumbCurrent")}</span>
            </p>
            <h1 className="text-2xl font-semibold text-[#1C2C56]">
                {t("pageTitle")}
            </h1>
            <p className="text-base font-medium text-[#64748B]">
                {t("pageSubtitle")}
            </p>

            <Tabs activeTab={activeTab} setActiveTab={handleTabChange} />

            <div className="mt-6">{renderTab()}</div>
        </div>
    );
};

export default SimulationConfigurationPage;
