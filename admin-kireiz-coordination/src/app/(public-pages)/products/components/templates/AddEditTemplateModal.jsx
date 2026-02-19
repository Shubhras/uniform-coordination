"use client";

import { useEffect, useRef, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";
import { FiUpload } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiCreateTemplate, apiUpdateTemplate } from "@/services/TemplateService";
import { apiGetPartsList } from "@/services/PartsService";

const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: "42px",
        borderRadius: "8px",
        borderColor: state.isFocused ? "#1C2C56" : "#CBD5E1",
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

const AddEditTemplateModal = ({ isOpen, onClose, mode = "add", initialData, onSaveSuccess }) => {
    const fileRef = useRef(null);
    const { session } = useCurrentSession();
    const accessToken = session?.user?.accessToken;

    // Form fields
    const [templateName, setTemplateName] = useState("");
    const [part, setPart] = useState(null);
    const [partUsageCount, setPartUsageCount] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    // Part options from API
    const [partOptions, setPartOptions] = useState([]);
    const [loadingParts, setLoadingParts] = useState(false);

    // Save state
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    /* ---------- FETCH PARTS ---------- */
    useEffect(() => {
        if (!isOpen || !accessToken) return;

        const fetchParts = async () => {
            setLoadingParts(true);
            try {
                const response = await apiGetPartsList(accessToken, 1, 100);
                if (response?.status && response?.data) {
                    const options = response.data
                        .filter((p) => !p.isDeleted)
                        .map((p) => ({
                            value: p.id,
                            label: p.partName,
                        }));
                    setPartOptions(options);
                }
            } catch (err) {
                console.error("Failed to load parts:", err);
            } finally {
                setLoadingParts(false);
            }
        };

        fetchParts();
    }, [isOpen, accessToken]);

    /* ---------- RESET / PREFILL ---------- */
    useEffect(() => {
        if (!isOpen) return;

        if (mode === "edit" && initialData) {
            setTemplateName(initialData.templateName || "");
            setPartUsageCount(initialData.partUsageCount?.toString() || "");
            setIsActive(initialData.isActive ?? true);
            setImageFile(null);
            setPreview(initialData.templateImage || null);

            // Pre-select part
            if (initialData.part) {
                setPart({ value: initialData.part, label: initialData.partName || `Part #${initialData.part}` });
            } else {
                setPart(null);
            }
        } else {
            setTemplateName("");
            setPart(null);
            setPartUsageCount("");
            setIsActive(true);
            setImageFile(null);
            setPreview(null);
        }
        setError("");
    }, [isOpen, mode, initialData]);

    // Update part label once partOptions load (edit mode)
    useEffect(() => {
        if (mode === "edit" && initialData?.part && partOptions.length > 0) {
            const match = partOptions.find((p) => p.value === initialData.part);
            if (match) {
                setPart(match);
            }
        }
    }, [partOptions, mode, initialData]);

    /* ---------- FILE HANDLER ---------- */
    const handleFile = (file) => {
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    /* ---------- SAVE ---------- */
    const handleSave = async () => {
        if (!templateName.trim()) {
            setError("Template name is required");
            return;
        }

        setError("");
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("templateName", templateName.trim());

            if (part) {
                formData.append("part", part.value);
            }
            if (partUsageCount) {
                formData.append("partUsageCount", partUsageCount);
            }
            formData.append("isActive", isActive);

            if (imageFile) {
                formData.append("templateImage", imageFile);
            }

            if (mode === "edit" && initialData?.id) {
                await apiUpdateTemplate(accessToken, initialData.id, formData);
            } else {
                await apiCreateTemplate(accessToken, formData);
            }

            if (onSaveSuccess) {
                onSaveSuccess();
            }
        } catch (err) {
            console.error("Template save error:", err);
            setError(err?.response?.data?.message || "Failed to save template. Please try again.");
        } finally {
            setSaving(false);
        }
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

                {/* Error */}
                {error && (
                    <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
                        {error}
                    </div>
                )}

                <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

                    {/* Template Name */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Template Name<span className="text-red-500">*</span>
                        </label>
                        <input
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="Enter template name"
                            className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                        />
                    </div>

                    {/* Part (from API) */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Part
                        </label>
                        <Select
                            options={partOptions}
                            value={part}
                            onChange={setPart}
                            styles={selectStyles}
                            placeholder="Select Part"
                            isLoading={loadingParts}
                            loadingMessage={() => "Loading parts..."}
                            noOptionsMessage={() => "No parts found"}
                            isClearable
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                            menuPosition="fixed"
                            className="mt-1"
                        />
                    </div>

                    {/* Part Usage Count */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Part Usage Count
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={partUsageCount}
                            onChange={(e) => setPartUsageCount(e.target.value)}
                            className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                            placeholder="e.g. 5"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Status
                        </label>
                        <div className="flex items-center gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setIsActive(!isActive)}
                                className={`w-12 h-6 rounded-full flex items-center px-1 transition ${isActive ? "bg-[#1C2C56]" : "bg-gray-300"}`}
                            >
                                <span
                                    className={`bg-white w-4 h-4 rounded-full transition ${isActive ? "translate-x-6" : ""}`}
                                />
                            </button>
                            <span className="text-sm text-[#1C2C56]">{isActive ? "Active" : "Inactive"}</span>
                        </div>
                    </div>

                    {/* Template Image */}
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
                    <Button variant="plain" size="sm" onClick={onClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        size="sm"
                        className="bg-[#1C2C56] text-white px-6"
                        onClick={handleSave}
                        loading={saving}
                    >
                        {mode === "edit" ? "Update" : "Create"}
                    </Button>
                </div>

            </div>
        </Dialog>
    );
};

export default AddEditTemplateModal;
