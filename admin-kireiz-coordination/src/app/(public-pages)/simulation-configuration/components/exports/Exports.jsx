"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Select from "react-select";
import { FiFileText, FiImage, FiDownload, FiSave } from "react-icons/fi";
import LivePreview from "../LivePreview";

const FORMAT_ICONS = {
    pdf: <FiFileText />,
    png: <FiImage />,
    jpg: <FiImage />,
};

const Exports = ({ config, loading, saving, onSave, onReset }) => {
    const t = useTranslations("pdfSimulationConfig.exports");
    const exportConfig = config?.export;

    // Local draft — nothing is written until Save, so Cancel can discard it.
    const [format, setFormat] = useState("pdf");
    const [quality, setQuality] = useState(50);
    const [dpi, setDpi] = useState(72);

    useEffect(() => {
        if (!exportConfig) return;
        setFormat(exportConfig.output_format);
        setQuality(exportConfig.compression_quality);
        setDpi(exportConfig.dpi);
    }, [exportConfig]);

    const formatOptions = (
        exportConfig?.format_options || [
            { value: "pdf", label: "pdf" },
            { value: "png", label: "png" },
            { value: "jpg", label: "jpg" },
        ]
    ).map((item) => ({
        ...item,
        label:
            item.value === "pdf"
                ? t("formatPdf")
                : item.value === "png"
                ? t("formatPng")
                : item.value === "jpg"
                ? t("formatJpg")
                : item.label,
    }));

    const dpiOptions = exportConfig?.dpi_options || [];
    const selectedDpiOption =
        dpiOptions.find((o) => o.value === dpi) || null;

    const isDirty =
        !!exportConfig &&
        (format !== exportConfig.output_format ||
            Number(quality) !== Number(exportConfig.compression_quality) ||
            Number(dpi) !== Number(exportConfig.dpi));

    const payload = () => ({
        output_format: format,
        compression_quality: Number(quality),
        dpi: Number(dpi),
    });

    const handleCancel = () => {
        if (exportConfig) {
            setFormat(exportConfig.output_format);
            setQuality(exportConfig.compression_quality);
            setDpi(exportConfig.dpi);
        }
        onReset?.();
    };

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            {/* Header */}
            <h1 className="text-2xl font-semibold text-[#1C2C56]">
                {t("title")}
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
                {t("subtitle")}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* LEFT SIDE */}
                <div className="lg:col-span-2 bg-[#F8FAFC] rounded-2xl border p-6">
                    {/* Output Format */}
                    <div>
                        <p className="text-sm font-medium text-[#1C2C56] mb-4">
                            {t("outputFormat")}
                        </p>

                        <div className="flex gap-4">
                            {formatOptions.map((item) => {
                                const isActive = format === item.value;
                                return (
                                    <button
                                        key={item.value}
                                        type="button"
                                        disabled={loading}
                                        onClick={() => setFormat(item.value)}
                                        className={`capitalize flex items-center gap-2 px-6 py-2 rounded-lg border transition text-sm font-medium disabled:opacity-50
                      ${
                          isActive
                              ? "border-green-500 bg-green-50 text-green-600"
                              : "border-gray-300 bg-white text-[#1C2C56] hover:bg-gray-50"
                      }`}
                                    >
                                        {FORMAT_ICONS[item.value]}
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Compression Quality */}
                    <div className="mt-8">
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-[#1C2C56]">
                                {t("compressionQuality")}
                            </p>
                            <span className="text-green-600 text-sm font-medium">
                                {quality} %
                            </span>
                        </div>

                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={quality}
                            disabled={loading}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            className="w-full mt-4 accent-green-600 cursor-pointer disabled:opacity-50"
                        />

                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>{t("smallerFile")}</span>
                            <span>{t("betterQuality")}</span>
                        </div>
                    </div>

                    {/* DPI SELECT */}
                    <div className="mt-8">
                        <p className="text-sm font-medium text-[#1C2C56] mb-3">
                            {t("targetResolution")}
                        </p>

                        <Select
                            value={selectedDpiOption}
                            onChange={(option) => setDpi(option?.value)}
                            options={dpiOptions}
                            isDisabled={loading}
                            instanceId="export-dpi"
                            placeholder={t("selectPlaceholder")}
                            className="text-sm"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderRadius: "12px",
                                    borderColor: "#E2E8F0",
                                    padding: "4px",
                                    boxShadow: "none",
                                }),
                            }}
                        />
                    </div>

                    {/* Save Preset Button */}
                    <button
                        type="button"
                        disabled={loading || saving}
                        onClick={() =>
                            onSave(payload(), "Export preset saved")
                        }
                        className="mt-8 w-full flex items-center justify-center gap-2 bg-[#1C4FA8] text-white py-3 rounded-xl text-sm font-medium transition disabled:opacity-50"
                    >
                        <FiDownload />
                        {saving ? t("saving") : t("saveExportPreset")}
                    </button>

                    {/* Bottom Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading || saving}
                            className="border border-[#CBD5E1] px-4 py-2 rounded-lg text-sm text-[#486284] hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            {t("cancel")}
                        </button>

                        <button
                            type="button"
                            onClick={() => onSave(payload())}
                            disabled={loading || saving || !isDirty}
                            className="flex items-center gap-2 bg-[#1C4FA8] text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                        >
                            <FiSave />
                            {saving ? t("saving") : t("saveChanges")}
                        </button>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <LivePreview preview={config?.preview} loading={loading} />
            </div>
        </div>
    );
};

export default Exports;
