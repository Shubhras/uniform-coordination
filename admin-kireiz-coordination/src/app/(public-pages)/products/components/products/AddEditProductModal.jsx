"use client";

import { useEffect, useRef, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";
import { FiUpload } from "react-icons/fi";

/* ───────────── OPTIONS ───────────── */

const partOptions = [
    { value: "collar", label: "Collar" },
    { value: "sleeves", label: "Sleeves" },
    { value: "body", label: "Body" },
];

const typeOptions = [
    { value: "top", label: "Top" },
    { value: "bottom", label: "Bottom" },
    { value: "set", label: "Set" },
];

const categoryOptions = [
    { value: "health", label: "Health Care" },
    { value: "food", label: "Food Service" },
    { value: "retail", label: "Retail" },
];

const subCategoryOptions = [
    { value: "doctor", label: "Doctor Wear" },
    { value: "chef", label: "Chef Wear" },
];

/* ───────────── SELECT STYLES (FROM TEMPLATE MODAL) ───────────── */

const selectStyles = {
    control: (base) => ({
        ...base,
        minHeight: "42px",
        borderRadius: "8px",
        borderColor: "#CBD5E1",
        boxShadow: "none",
        "&:hover": { borderColor: "#1C2C56" },
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? "#1C2C56"
            : state.isFocused
                ? "#EEF2FF"
                : "white",
        color: state.isSelected ? "white" : "#1C2C56",
        fontSize: "14px",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

/* ───────────── COMPONENT ───────────── */

const AddEditProductModal = ({ isOpen, onClose, initialData }) => {
    const fileRef = useRef(null);
    const isEdit = Boolean(initialData);

    const [form, setForm] = useState({
        name: "",
        description: "",
        part: null,
        type: null,
        category: null,
        subCategory: null,
        image: null,
        preview: null,
    });

    /* PREFILL */
    useEffect(() => {
        if (!isOpen) return;

        if (initialData) {
            setForm({
                name: initialData.name || "",
                description: initialData.description || "",
                part: partOptions.find(p => p.value === initialData.part) || null,
                type: typeOptions.find(t => t.value === initialData.type) || null,
                category: categoryOptions.find(c => c.value === initialData.category) || null,
                subCategory:
                    subCategoryOptions.find(s => s.value === initialData.subCategory) || null,
                image: null,
                preview: initialData.image || null,
            });
        } else {
            setForm({
                name: "",
                description: "",
                part: null,
                type: null,
                category: null,
                subCategory: null,
                image: null,
                preview: null,
            });
        }
    }, [isOpen, initialData]);

    const handleFile = (file) => {
        if (!file) return;
        setForm({
            ...form,
            image: file,
            preview: URL.createObjectURL(file),
        });
    };

    const handleSave = () => {
        const payload = {
            ...form,
            part: form.part?.value,
            type: form.type?.value,
            category: form.category?.value,
            subCategory: form.subCategory?.value,
        };

        console.log(isEdit ? "UPDATE PRODUCT" : "CREATE PRODUCT", payload);
        onClose();
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            className="w-full md:min-w-[600px]">
            <div className="flex flex-col">

                {/* HEADER */}
                <div className="border-b px-6 py-4">
                    <h2 className="text-2xl font-semibold text-[#1C2C56]">
                        {isEdit ? "Edit Product" : "Add Product"}
                    </h2>
                </div>

                {/* BODY */}
                <div className="px-6 py-5 space-y-5">

                    {/* IMAGE */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Product Image
                        </label>

                        <button
                            onClick={() => fileRef.current.click()}
                            className="mt-2 w-full bg-[#1C2C56] text-white py-2 rounded-md text-sm flex items-center justify-center gap-2"
                        >
                            <FiUpload size={16} />
                            Upload Image
                        </button>

                        <input
                            type="file"
                            ref={fileRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFile(e.target.files[0])}
                        />
                    </div>

                    {form.preview && (
                        <div className="flex justify-center">
                            <img
                                src={form.preview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg shadow"
                            />
                        </div>
                    )}

                    {/* PRODUCT NAME */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Product Name
                        </label>
                        <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm"
                            placeholder="Eg:- Cotton Canvas"
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                            className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm"
                        />
                    </div>

                    {/* SELECTS */}
                    <Select
                        placeholder="Select Part"
                        value={form.part}
                        options={partOptions}
                        styles={selectStyles}
                        onChange={(v) => setForm({ ...form, part: v })}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />

                    <Select
                        placeholder="Select Type"
                        value={form.type}
                        options={typeOptions}
                        styles={selectStyles}
                        onChange={(v) => setForm({ ...form, type: v })}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />

                    <Select
                        placeholder="Select Category"
                        value={form.category}
                        options={categoryOptions}
                        styles={selectStyles}
                        onChange={(v) => setForm({ ...form, category: v })}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />

                    <Select
                        placeholder="Select Sub Category"
                        value={form.subCategory}
                        options={subCategoryOptions}
                        styles={selectStyles}
                        onChange={(v) => setForm({ ...form, subCategory: v })}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>

                {/* FOOTER */}
                <div className="border-t px-6 py-4 flex justify-end gap-3">
                    <Button variant="plain" size="sm" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        size="sm"
                        className="bg-[#1C2C56] text-white px-6"
                        onClick={handleSave}
                    >
                        {isEdit ? "Update" : "Create"}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default AddEditProductModal;
