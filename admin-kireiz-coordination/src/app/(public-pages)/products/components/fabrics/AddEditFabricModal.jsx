"use client";

import { useEffect, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";

const colors = [
    "#0F172A", "#7DD3FC", "#000000", "#E5E7EB", "#4ADE80",
    "#EF4444", "#92400E", "#FACC15", "#D1D5DB", "#1D4ED8",
    "#2563EB", "#FFFFFF", "#64748B",
];

const AddEditFabricModal = ({ isOpen, onClose, mode = "add", initialData }) => {
    const materialOptions = [
        { value: "cotton", label: "Cotton" },
        { value: "polyester", label: "Polyester" },
        { value: "wool", label: "Wool" },
    ];
    const categoryOptions = [
        { value: "uniform", label: "Uniform" },
        { value: "fabric", label: "Fabric" },
    ];

    const subCategoryOptions = [
        { value: "school", label: "School" },
        { value: "corporate", label: "Corporate" },
    ];
    const [fabricName, setFabricName] = useState("");
    const [selectedColor, setSelectedColor] = useState("#87CEEB");
    const [materialType, setMaterialType] = useState(null);
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState(null);
    const [subCategory, setSubCategory] = useState(null);
    const [active, setActive] = useState(true);

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

        /* ✅ THIS IS THE IMPORTANT PART */
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
    };

    useEffect(() => {
        if (mode === "edit" && initialData) {
            setFabricName(initialData.name);
            setSelectedColor(initialData.color);
            setPrice(initialData.price);
            setActive(true);
        }
    }, [mode, initialData]);



    const handleSave = () => {
        const payload = {
            fabricName,
            color: selectedColor,
            materialType: materialType?.value,
            price,
            category: category?.value,
            subCategory: subCategory?.value,
            status: active ? "Active" : "Inactive",
        };

        if (mode === "edit") {
            console.log("EDIT FABRIC:", payload);
        } else {
            console.log("ADD FABRIC:", payload);
        }
    };


    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            className="w-full md:min-w-[720px] mx-auto"
        >
            <div className="flex flex-col">

                {/* HEADER */}
                <div className="border-b p-2 flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-[#1C2C56]">
                        {mode === "edit" ? "Edit Fabric" : "Add New Fabric"}
                    </h2>

                </div>

                {/* BODY */}
                <div className=" md:px-5 py-5 space-y-5 overflow-y-auto">

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


                        {/* Color input */}
                        <div className="flex gap-3 mt-1">
                            <div
                                className="flex-1 rounded-md border h-10"
                                style={{ backgroundColor: selectedColor }}
                            />
                            <input
                                value={selectedColor}
                                className="w-28 border rounded-md px-2 text-sm"
                                readOnly
                            />
                        </div>

                        {/* Color palette */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className="w-6 h-6 rounded border-[0.5px]"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>

                        {/* Preview */}
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
                            menuPortalTarget={document.body}
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
                            type="text"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
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
                            menuPortalTarget={document.body}
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
                            menuPortalTarget={document.body}
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
                                className={`w-12 h-6 rounded-full flex items-center px-1 transition ${active ? "bg-[#1C2C56]" : "bg-gray-300"
                                    }`}
                            >
                                <span
                                    className={`bg-white w-4 h-4 rounded-full transition ${active ? "translate-x-6" : ""
                                        }`}
                                />
                            </button>
                            <span className="text-sm text-[#1C2C56]">{active ? "Active" : "Inactive"}</span>
                        </div>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="border-t px-6 py-4 flex justify-end sm:flex-row flex-col gap-3">
                    <Button variant="plain" onClick={onClose} size="sm"
                    >
                        Cancel
                    </Button>

                    <Button variant="plain" size="sm"
                    >
                        Save & Add Another
                    </Button>

                    <Button
                        variant="solid"
                        size="sm"
                        className="bg-[#1C2C56] px-6 hover:bg-[#1C2C56] text-white py-2 rounded-md"
                        onClick={handleSave}
                    >
                        {mode === "edit" ? "Update" : "Save"}
                    </Button>
                </div>

            </div>
        </Dialog>
    );
};

export default AddEditFabricModal;
