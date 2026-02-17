"use client";

import { useEffect, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiCreateFabric, apiUpdateFabric } from "@/services/FabricService";

const colors = [
    "#0F172A", "#7DD3FC", "#000000", "#E5E7EB", "#4ADE80",
    "#EF4444", "#92400E", "#FACC15", "#D1D5DB", "#1D4ED8",
    "#2563EB", "#FFFFFF", "#64748B",
];

const AddEditFabricModal = ({ isOpen, onClose, mode = "add", initialData, onSaveSuccess }) => {
    const { session } = useCurrentSession();
    const accessToken = session?.user?.accessToken;

    const materialOptions = [
        { value: "cotton", label: "Cotton" },
        { value: "polyester", label: "Polyester" },
        { value: "silk", label: "Silk" },
        { value: "linen", label: "Linen" },
    ];
    const categoryOptions = [
        { value: "uniform", label: "Uniform" },
        { value: "fabric", label: "Fabric" },
    ];

    const subCategoryOptions = [
        { value: "x`school", label: "School" },
        { value: "corporate", label: "Corporate" },
    ];

    const [fabricName, setFabricName] = useState("");
    const [selectedColor, setSelectedColor] = useState("#87CEEB");
    const [materialType, setMaterialType] = useState(null);
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState(null);
    const [subCategory, setSubCategory] = useState(null);
    const [active, setActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const selectStyles = {
        control: (base) => ({
            ...base,
            minHeight: "40px",
            borderRadius: "6px",
            borderColor: "#E2E8F0",
            boxShadow: "none",
            "&:hover": {
                borderColor: "#1C2C56",
            },
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? "#1C2C56"
                : state.isFocused
                    ? "#EEF2FF"
                    : "white",
            color: state.isSelected ? "white" : "#1E293B",
            fontSize: "14px",
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
    };

    // Reset form when modal opens
    useEffect(() => {
        if (!isOpen) return;

        if (mode === "edit" && initialData) {
            setFabricName(initialData.fabricName || "");
            setSelectedColor(initialData.color || "#87CEEB");
            setPrice(initialData.pricePerUnit || "");
            setActive(initialData.isActive ?? true);

            // Set material type from value
            const mat = materialOptions.find(
                (o) => o.value === initialData.materialType
            );
            setMaterialType(mat || null);

            // Set category from value
            const cat = categoryOptions.find(
                (o) => o.value === initialData.fabricType
            );
            setCategory(cat || null);

            setSubCategory(null);
        } else {
            // Reset for add mode
            setFabricName("");
            setSelectedColor("#87CEEB");
            setMaterialType(null);
            setPrice("");
            setCategory(null);
            setSubCategory(null);
            setActive(true);
        }
        setError("");
    }, [isOpen, mode, initialData]);

    const handleSave = async () => {
        // Validation
        if (!fabricName.trim()) {
            setError("Fabric name is required");
            return;
        }
        if (!materialType) {
            setError("Material type is required");
            return;
        }
        if (!price || isNaN(Number(price))) {
            setError("Valid price is required");
            return;
        }

        setError("");
        setSaving(true);

        const payload = {
            fabricName: fabricName.trim(),
            color: selectedColor,
            materialType: materialType.value,
            pricePerUnit: Number(price),
            isActive: active,
        };

        // Optional fields
        if (category) {
            payload.fabricType = category.value;
        }

        try {
            if (mode === "edit" && initialData?.id) {
                await apiUpdateFabric(accessToken, initialData.id, payload);
            } else {
                await apiCreateFabric(accessToken, payload);
            }

            if (onSaveSuccess) {
                onSaveSuccess();
            }
        } catch (err) {
            console.error("Fabric save error:", err);
            setError(err?.response?.data?.message || "Failed to save fabric. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAndAdd = async () => {
        // Same save logic but keep model open and reset form
        if (!fabricName.trim() || !materialType || !price || isNaN(Number(price))) {
            setError("Fabric name, material type, and valid price are required");
            return;
        }

        setError("");
        setSaving(true);

        const payload = {
            fabricName: fabricName.trim(),
            color: selectedColor,
            materialType: materialType.value,
            pricePerUnit: Number(price),
            isActive: active,
        };

        if (category) {
            payload.fabricType = category.value;
        }

        try {
            await apiCreateFabric(accessToken, payload);

            // Reset form for next entry
            setFabricName("");
            setSelectedColor("#87CEEB");
            setMaterialType(null);
            setPrice("");
            setCategory(null);
            setSubCategory(null);
            setActive(true);

            // Notify parent to refresh list
            if (onSaveSuccess) {
                // Don't close modal — so we call fetchFabrics but keep modal open
                // We'll just trigger a custom event or pass a refresh function
            }
        } catch (err) {
            console.error("Fabric save error:", err);
            setError(err?.response?.data?.message || "Failed to save fabric. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            className="w-full md:min-w-[720px] mx-auto"
        // contentClassName="!p-0 !h-auto"
        >
            <div className="flex flex-col">

                {/* HEADER */}
                <div className="border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-[#1C2C56]">
                        {mode === "edit" ? "Edit Fabric" : "Add New Fabric"}
                    </h2>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
                        {error}
                    </div>
                )}

                {/* BODY */}
                <div className="md:px-5 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

                    {/* Fabric Name */}
                    <div>
                        <label className="text-[#1C2C56] text-base font-medium">
                            Fabric Name<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Eg:- Cotton Canvas"
                            value={fabricName}
                            onChange={(e) => setFabricName(e.target.value)}
                            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                        />
                    </div>

                    {/* Color */}
                    <div>
                        <label className="text-[#1C2C56] text-base font-medium">
                            Color<span className="text-red-500">*</span>
                        </label>

                        <div className="flex gap-3 mt-1">
                            <div
                                className="flex-1 rounded-md border h-10"
                                style={{ backgroundColor: selectedColor }}
                            />
                            <input
                                value={selectedColor}
                                onChange={(e) => setSelectedColor(e.target.value)}
                                className="w-28 border rounded-md px-2 text-sm"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-6 h-6 rounded border-[0.5px] ${selectedColor === color ? 'ring-2 ring-[#1C2C56] ring-offset-1' : ''}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>

                        <div className="mt-4 bg-[#F1F5F9] rounded-md p-3 flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded"
                                style={{ backgroundColor: selectedColor }}
                            />
                            <div>
                                <p className="text-sm font-medium">Preview</p>
                                <p className="text-xs text-gray-500">{selectedColor}</p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                            Choose a color or enter a HEX code
                        </p>
                    </div>

                    {/* Material Type */}
                    <div>
                        <label className="text-[#1C2C56] text-base font-medium">
                            Material Type<span className="text-red-500">*</span>
                        </label>
                        <Select
                            options={materialOptions}
                            styles={selectStyles}
                            value={materialType}
                            onChange={setMaterialType}
                            placeholder="Select Material Type"
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                            menuPosition="fixed"
                            className="mt-1"
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="text-[#1C2C56] text-base font-medium">
                            Price Per Unit<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Eg:- 250.50"
                            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-[#1C2C56] text-base font-medium">
                            Category
                        </label>
                        <Select
                            options={categoryOptions}
                            styles={selectStyles}
                            value={category}
                            onChange={setCategory}
                            placeholder="Select Category"
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                            menuPosition="fixed"
                            className="mt-1"
                        />
                    </div>

                    {/* Sub Category */}
                    <div>
                        <label className="text-[#1C2C56] text-base font-medium">
                            Sub Category
                        </label>
                        <Select
                            options={subCategoryOptions}
                            styles={selectStyles}
                            value={subCategory}
                            onChange={setSubCategory}
                            placeholder="Select Sub Category"
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                            menuPosition="fixed"
                            className="mt-1"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="text-[#1C2C56] text-base font-medium">
                            Status
                        </label>
                        <div className="flex items-center gap-3 mt-2">
                            <button
                                onClick={() => setActive(!active)}
                                className={`w-12 h-6 rounded-full flex items-center px-1 transition ${active ? "bg-[#1C2C56]" : "bg-gray-300"}`}
                            >
                                <span
                                    className={`bg-white w-4 h-4 rounded-full transition ${active ? "translate-x-6" : ""}`}
                                />
                            </button>
                            <span className="text-sm text-[#1C2C56]">{active ? "Active" : "Inactive"}</span>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="border-t px-6 py-4 flex justify-end sm:flex-row flex-col gap-3">
                    <Button variant="plain" onClick={onClose} size="sm" disabled={saving}>
                        Cancel
                    </Button>

                    {mode === "add" && (
                        <Button
                            variant="plain"
                            size="sm"
                            onClick={handleSaveAndAdd}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save & Add Another"}
                        </Button>
                    )}

                    <Button
                        variant="solid"
                        size="sm"
                        className="bg-[#1C2C56] px-6 hover:bg-[#1C2C56] text-white py-2 rounded-md"
                        onClick={handleSave}
                        loading={saving}
                    >
                        {mode === "edit" ? "Update" : "Save"}
                    </Button>
                </div>

            </div>
        </Dialog>
    );
};

export default AddEditFabricModal;
