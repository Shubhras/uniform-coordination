"use client";

import { useEffect, useState } from "react";
import { FiFileText, FiCheck } from "react-icons/fi";
import LivePreview from "../LivePreview";

const PdfTemplates = ({ config, loading, saving, onSave, onReset }) => {
    const templates = config?.templates || [];

    // Local draft so the selection can be changed and then cancelled without
    // writing to the server on every click.
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        setSelected(config?.selected_template_id ?? null);
    }, [config?.selected_template_id]);

    const isDirty =
        selected !== null && selected !== config?.selected_template_id;

    const handleSave = () => {
        if (!isDirty) return;
        onSave({ selected_template_id: selected }, "Template selection saved");
    };

    const handleCancel = () => {
        setSelected(config?.selected_template_id ?? null);
        onReset?.();
    };

    return (
        <div className="bg-white rounded-xl shadow md:p-6 p-3">
            {/* Header */}
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
                PDF Templates
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* LEFT SIDE */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm font-medium text-[#1C2C56]">
                            Select Template
                        </p>
                        <span className="text-xs text-[#64748B]">
                            {loading ? "…" : `${templates.length} available`}
                        </span>
                    </div>

                    {loading && (
                        <div className="grid grid-cols-2 gap-4">
                            {[0, 1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="rounded-xl border border-[#E2E8F0] p-4 animate-pulse"
                                >
                                    <div className="w-9 h-9 rounded-md bg-gray-200" />
                                    <div className="h-4 w-32 bg-gray-200 rounded mt-3" />
                                    <div className="h-3 w-24 bg-gray-100 rounded mt-2" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && templates.length === 0 && (
                        <div className="border border-dashed border-[#CBD5E1] rounded-xl py-12 text-center">
                            <p className="text-base font-medium text-[#1C2C56]">
                                No page templates configured
                            </p>
                        </div>
                    )}

                    {!loading && templates.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                            {templates.map((t) => {
                                const isActive = selected === t.id;

                                return (
                                    <div
                                        key={t.id}
                                        onClick={() => setSelected(t.id)}
                                        className={`relative rounded-xl border p-4 cursor-pointer transition
                    ${
                        isActive
                            ? "border-[#1C2C56] bg-[#F8FAFC]"
                            : "border-[#E2E8F0] hover:bg-[#F9FAFB]"
                    }`}
                                    >
                                        {/* Icon */}
                                        <div
                                            className={`w-9 h-9 rounded-md flex items-center justify-center
                    ${isActive ? "bg-[#1C2C56]" : "bg-[#F1F5F9]"}`}
                                        >
                                            <FiFileText
                                                size={18}
                                                className={
                                                    isActive
                                                        ? "text-white"
                                                        : "text-[#1C2C56]"
                                                }
                                            />
                                        </div>

                                        {/* Title */}
                                        <h4 className="mt-3 text-sm font-semibold text-[#1C2C56]">
                                            {t.name}
                                        </h4>

                                        {/* Dimension */}
                                        <p className="text-xs text-[#486284] mt-1">
                                            {t.dimension}
                                        </p>

                                        {/* Tag */}
                                        {t.tag && (
                                            <span className="inline-block mt-2 text-xs bg-[#F1F5F9] text-[#486284] px-2 py-0.5 rounded">
                                                {t.tag}
                                            </span>
                                        )}

                                        {/* Selected Check */}
                                        {isActive && (
                                            <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1">
                                                <FiCheck size={12} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading || saving}
                            className="border border-[#CBD5E1] text-[#486284] px-4 py-2 rounded-md text-sm disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={loading || saving || !isDirty}
                            className="bg-[#1C4FA8] text-white px-5 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>

                {/* RIGHT SIDE – LIVE PREVIEW */}
                <LivePreview preview={config?.preview} loading={loading} />
            </div>
        </div>
    );
};

export default PdfTemplates;
