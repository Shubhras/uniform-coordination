"use client";

import { useState } from "react";
import Select from "react-select";
import {
    FiFileText,
    FiImage,
    FiDownload,
    FiSave,
} from "react-icons/fi";

const formatOptions = [
    { value: "pdf", label: "pdf", icon: <FiFileText /> },
    { value: "png", label: "png", icon: <FiImage /> },
    { value: "jpg", label: "jpg", icon: <FiImage /> },
];

const dpiOptions = [
    { value: "72", label: "72 DPI (Screen)" },
    { value: "150", label: "150 DPI (Web High Quality)" },
    { value: "300", label: "300 DPI (Print)" },
];

const Exports = () => {
    const [selectedFormat, setSelectedFormat] = useState("pdf");
    const [quality, setQuality] = useState(50);
    const [dpi, setDpi] = useState(dpiOptions[0]);

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            {/* Header */}
            <h1 className="text-2xl font-semibold text-[#1C2C56]">
                Export Configuration
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
                Configure output settings for generated documents.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* LEFT SIDE */}
                <div className="lg:col-span-2 bg-[#F8FAFC] rounded-2xl border p-6">
                    {/* Output Format */}
                    <div>
                        <p className="text-sm font-medium text-[#1C2C56] mb-4">
                            Output Format
                        </p>

                        <div className="flex gap-4">
                            {formatOptions.map((item) => {
                                const isActive = selectedFormat === item.value;
                                return (
                                    <button
                                        key={item.value}
                                        onClick={() => setSelectedFormat(item.value)}
                                        className={`capitalize flex items-center gap-2 px-6 py-2 rounded-lg border transition text-sm font-medium
                      ${isActive
                                                ? "border-green-500 bg-green-50 text-green-600"
                                                : "border-gray-300 bg-white text-[#1C2C56] hover:bg-gray-50"
                                            }`}
                                    >
                                        {item.icon}
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
                                Compression Quality
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
                            onChange={(e) => setQuality(e.target.value)}
                            className="w-full mt-4 accent-green-600 cursor-pointer"
                        />

                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>Smaller File</span>
                            <span>Better Quality</span>
                        </div>
                    </div>

                    {/* DPI SELECT (react-select) */}
                    <div className="mt-8">
                        <p className="text-sm font-medium text-[#1C2C56] mb-3">
                            Target Resolution (DPI)
                        </p>

                        <Select
                            value={dpi}
                            onChange={setDpi}
                            options={dpiOptions}
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
                    <button className="mt-8 w-full flex items-center justify-center gap-2 bg-[#1C2C56] text-white py-3 rounded-xl text-sm font-medium hover:opacity-90 transition">
                        <FiDownload />
                        Save Export Preset
                    </button>

                    {/* Bottom Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button className="border border-[#CBD5E1] px-4 py-2 rounded-lg text-sm text-[#486284] hover:bg-gray-50 transition">
                            Cancel
                        </button>

                        <button className="flex items-center gap-2 bg-[#1C2C56] text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
                            <FiSave />
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="border rounded-2xl p-5 bg-[#F8FAFC] flex flex-col min-h-[420px]">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-[#1C2C56]">
                            Live Preview
                        </p>
                        <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">
                            Auto-updating
                        </span>
                    </div>

                    {/* Preview Box */}
                    <div className="flex-1 bg-white rounded-xl border mt-4 flex items-center justify-center relative">
                        <span className="text-sm text-gray-300">
                            Simulation Layer
                        </span>

                        <button className="absolute bg-white border shadow px-4 py-1.5 rounded-lg text-xs text-[#1C2C56]">
                            Expand Preview
                        </button>
                    </div>

                    {/* Info Section */}
                    <div className="text-xs text-[#64748B] mt-4 space-y-2">
                        <p>
                            <span className="font-medium text-[#1C2C56]">
                                Dimensions:
                            </span>{" "}
                            210 × 297 mm
                        </p>
                        <p>
                            <span className="font-medium text-[#1C2C56]">
                                File Size Est:
                            </span>{" "}
                            ~2.4 MB
                        </p>
                        <p>
                            <span className="font-medium text-[#1C2C56]">
                                Active Layers:
                            </span>{" "}
                            4
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Exports;