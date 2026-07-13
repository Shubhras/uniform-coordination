"use client";

import { useState } from "react";
import { FiFileText, FiCheck } from "react-icons/fi";

const templates = [
    {
        id: 1,
        name: "Standard Report A4",
        dimension: "210 × 297 mm",
        tag: "A4",
    },
    {
        id: 2,
        name: "US Letter Brief",
        dimension: "8.5 × 11 in",
        tag: "Letter",
    },
    {
        id: 3,
        name: "Technical Schematic",
        dimension: "420 × 297 mm",
        tag: "A4",
    },
    {
        id: 4,
        name: "Custom Canvas",
        dimension: "1920 × 1080 px",
        tag: "Custom",
    },
];

const PdfTemplates = () => {
    const [selected, setSelected] = useState(1);

    const activeTemplate = templates.find(t => t.id === selected);

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
                            {templates.length} available
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {templates.map((t) => {
                            const isActive = selected === t.id;

                            return (
                                <div
                                    key={t.id}
                                    onClick={() => setSelected(t.id)}
                                    className={`relative rounded-xl border p-4 cursor-pointer transition
                    ${isActive
                                            ? "border-[#1C2C56] bg-[#F8FAFC]"
                                            : "border-[#E2E8F0] hover:bg-[#F9FAFB]"
                                        }`}
                                >
                                    {/* Icon */}
                                    <div className={`w-9 h-9 rounded-md flex items-center justify-center
                    ${isActive ? "bg-[#1C2C56]" : "bg-[#F1F5F9]"}`}>
                                        <FiFileText
                                            size={18}
                                            className={isActive ? "text-white" : "text-[#1C2C56]"}
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
                                    <span className="inline-block mt-2 text-xs bg-[#F1F5F9] text-[#486284] px-2 py-0.5 rounded">
                                        {t.tag}
                                    </span>

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

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button className="border border-[#CBD5E1] text-[#486284] px-4 py-2 rounded-md text-sm">
                            Cancel
                        </button>

                        <button className="bg-[#1C4FA8] text-white px-5 py-2 rounded-md text-sm font-medium">
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* RIGHT SIDE – LIVE PREVIEW */}
                <div className="border border-[#E2E8F0] rounded-xl p-4 bg-[#F8FAFC] flex flex-col min-h-[40vh]">

                    <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-medium text-[#1C2C56]">
                            Live Preview
                        </p>
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">
                            Auto-updating
                        </span>
                    </div>

                    <div className="flex-1 bg-white border rounded-lg flex items-center justify-center relative">
                        <div className="text-xs text-gray-400">
                            Simulation Layer
                        </div>

                        <button className="absolute bg-white border shadow px-3 py-1 rounded text-xs text-[#1C2C56]">
                            Expand Preview
                        </button>
                    </div>

                    <div className="text-xs text-[#64748B] mt-4 space-y-1">
                        <p>
                            <span className="font-medium text-[#1C2C56]">Dimensions:</span>{" "}
                            {activeTemplate.dimension}
                        </p>
                        <p>
                            <span className="font-medium text-[#1C2C56]">File Size Est:</span>{" "}
                            ~2.4 MB
                        </p>
                        <p>
                            <span className="font-medium text-[#1C2C56]">Active Layers:</span>{" "}
                            4
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PdfTemplates;
