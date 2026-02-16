"use client";

import { useEffect, useRef, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";
import { FiUpload } from "react-icons/fi";

const categoryOptions = [
    { value: "chef-wear", label: "Chef Wear" },
    { value: "aprons", label: "Aprons" },
    { value: "medical", label: "Medical Wear" },
];

const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
];

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

const AddEditTemplateModal = ({ isOpen, onClose, mode = "add", initialData }) => {
    const fileRef = useRef(null);

    const [name, setName] = useState("");
    const [category, setCategory] = useState(null);
    const [status, setStatus] = useState(statusOptions[0]);
    const [parts, setParts] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        if (mode === "edit" && initialData) {
            setName(initialData.name);
            setParts(initialData.parts);
            setCategory(
                categoryOptions.find(c => c.label === initialData.category) || null
            );
            setStatus(
                statusOptions.find(s => s.value === initialData.status) || statusOptions[0]
            );
            setPreview(initialData.image);
            setImage(null);
        } else {
            setName("");
            setCategory(null);
            setStatus(statusOptions[0]);
            setParts("");
            setImage(null);
            setPreview(null);
        }
    }, [isOpen, mode, initialData]);

    const handleFile = (file) => {
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSave = () => {
        const payload = {
            name,
            category: category?.label,
            parts: Number(parts),
            status: status?.value,
            image,
        };

        console.log(mode === "edit" ? "UPDATE TEMPLATE" : "CREATE TEMPLATE", payload);
        onClose();
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            className="w-full md:min-w-[600px]"
            contentClassName="!p-0 !h-auto"
        >
            <div className="flex flex-col">

                <div className="border-b px-6 py-4">
                    <h2 className="text-2xl font-semibold text-[#1C2C56]">
                        {mode === "edit" ? "Edit Template" : "Create Template"}
                    </h2>
                </div>

                <div className="px-6 py-5 space-y-5">

                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Template Name
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter template name"
                            className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Category
                        </label>
                        <Select
                            options={categoryOptions}
                            value={category}
                            onChange={setCategory}
                            styles={selectStyles}
                            placeholder="Select category"
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Parts Count
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={parts}
                            onChange={(e) => setParts(e.target.value)}
                            className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm"
                            placeholder="e.g. 4"
                        />
                    </div>

                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Status
                        </label>
                        <Select
                            options={statusOptions}
                            value={status}
                            onChange={setStatus}
                            styles={selectStyles}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Template Image
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

                    {preview && (
                        <div className="flex justify-center">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg shadow"
                            />
                        </div>
                    )}
                </div>

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
                        {mode === "edit" ? "Update" : "Create"}
                    </Button>
                </div>

            </div>
        </Dialog>
    );
};

export default AddEditTemplateModal;
