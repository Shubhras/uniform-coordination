"use client";

import { useEffect, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";

const FABRICS = ["Cotton", "Polyester", "Silk"];

const AddEditColorModal = ({ isOpen, onClose, mode = "add", initialData }) => {
    const [name, setName] = useState("");
    const [hex, setHex] = useState("#000000");
    const [fabrics, setFabrics] = useState([]);

    const hexToRgb = (hex) => {
        const cleanHex = hex.replace("#", "");
        const bigint = parseInt(cleanHex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgb(${r}, ${g}, ${b})`;
    };

    useEffect(() => {
        if (!isOpen) return;

        if (mode === "edit" && initialData) {
            setName(initialData.name || "");
            setHex(initialData.hex || "#000000");
            setFabrics(initialData.fabrics || []);
        } else {
            setName("");
            setHex("#000000");
            setFabrics([]);
        }
    }, [mode, initialData, isOpen]);

    const toggleFabric = (fabric) => {
        setFabrics((prev) =>
            prev.includes(fabric)
                ? prev.filter((f) => f !== fabric)
                : [...prev, fabric]
        );
    };

    const handleSave = () => {
        const payload = {
            name,
            hex,
            rgb: hexToRgb(hex),
            swatch: hex,
            fabrics,
        };

        if (mode === "edit") {
            console.log("UPDATE COLOR:", payload);
        } else {
            console.log("ADD COLOR:", payload);
        }

        onClose();
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            className="w-full md:min-w-[520px] mx-auto"
        >
            <div className="flex flex-col">

                <div className="border-b p-4">
                    <h2 className="text-2xl font-semibold text-[#1C2C56]">
                        {mode === "edit" ? "Edit Color" : "Add New Color"}
                    </h2>
                </div>

                <div className="px-5 py-5 space-y-5">

                    <div>
                        <label className="text-[#1C2C56] text-sm font-medium">
                            Color Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter color name"
                            className="mt-1 w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#1C2C56]"
                        />
                    </div>

                    <div className="flex gap-4 items-end">
                        <div className="flex flex-col">
                            <label className="text-[#1C2C56] text-sm font-medium">
                                Color
                            </label>
                            <input
                                type="color"
                                value={hex}
                                onChange={(e) => setHex(e.target.value)}
                                className="mt-1 h-10 w-16 p-1 border rounded-md cursor-pointer"
                            />
                        </div>

                        <div className="flex-1">
                            <label className="text-[#1C2C56] text-sm font-medium">
                                HEX Code
                            </label>
                            <input
                                type="text"
                                value={hex}
                                onChange={(e) => setHex(e.target.value)}
                                className="mt-1 w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[#1C2C56] text-sm font-medium">
                            RGB Value
                        </label>
                        <input
                            type="text"
                            value={hexToRgb(hex)}
                            disabled
                            className="mt-1 w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-3 py-2 text-sm text-[#64748B]"
                        />
                    </div>

                    <div>
                        <p className="text-[#1C2C56] text-sm font-medium mb-2">
                            Compatible Fabrics
                        </p>

                        <div className="flex gap-2 flex-wrap">
                            {FABRICS.map((fabric) => (
                                <button
                                    key={fabric}
                                    type="button"
                                    onClick={() => toggleFabric(fabric)}
                                    className={`text-xs px-3 py-1 rounded-full border transition
                    ${fabrics.includes(fabric)
                                            ? "bg-[#1C2C56] text-white border-[#1C2C56]"
                                            : "bg-[#EEF2FF] text-[#1C2C56] border-transparent"
                                        }
                  `}
                                >
                                    {fabric}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                <div className="border-t px-6 py-4 flex justify-end gap-3">
                    <Button variant="plain" size="sm" onClick={onClose}>
                        Cancel
                    </Button>

                    <Button
                        variant="solid"
                        size="sm"
                        className="bg-[#1C2C56] hover:bg-[#1C2C56] text-white px-6"
                        onClick={handleSave}
                    >
                        {mode === "edit" ? "Update Color" : "Save Color"}
                    </Button>
                </div>

            </div>
        </Dialog>
    );
};

export default AddEditColorModal;
