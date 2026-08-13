"use client";

import { useEffect, useRef, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";
import { FiUpload } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiCreateSubcategory, apiUpdateSubcategory } from "@/services/SubcategoryService";
import { apiGetCategoryList } from "@/services/CategoryService";
import { useTranslations } from "next-intl";

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
        color: state.isSelected ? "white" : "#1E293B",
        fontSize: "14px",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const AddEditSubcategoryModal = ({
    isOpen,
    onClose,
    mode = "add",
    initialData,
    onSaveSuccess,
    defaultCategoryId,
}) => {
    const t = useTranslations("contentMedia.categories.subcategory");
    const fileRef = useRef(null);
    const { session } = useCurrentSession();
    const accessToken = session?.user?.accessToken;

    // Form fields
    const [name, setName] = useState("");
    const [category, setCategory] = useState(null);
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    // Category options from API
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    // Save state
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    /* ---------- FETCH CATEGORIES ---------- */
    useEffect(() => {
        if (!isOpen || !accessToken) return;

        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const response = await apiGetCategoryList(accessToken, 1, 100);
                if (response?.status && response?.data) {
                    const options = response.data.map((c) => ({
                        value: c.id,
                        label: c.categoryName,
                    }));
                    setCategoryOptions(options);
                }
            } catch (err) {
                console.error("Failed to load categories:", err);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, [isOpen, accessToken]);

    /* ---------- RESET / PREFILL ---------- */
    useEffect(() => {
        if (!isOpen) return;

        if (mode === "edit" && initialData) {
            setName(initialData.name || "");
            setDescription(initialData.description || "");
            setImageFile(null);
            setPreview(initialData.subcategoryImage || null);

            if (initialData.category) {
                setCategory({ value: initialData.category, label: t("categoryFallback", { id: initialData.category }) });
            } else {
                setCategory(null);
            }
        } else {
            setName("");
            setDescription("");
            setImageFile(null);
            setPreview(null);

            // Pre-select category if defaultCategoryId is provided (adding from within a category dropdown)
            if (defaultCategoryId) {
                setCategory({ value: defaultCategoryId, label: t("categoryFallback", { id: defaultCategoryId }) });
            } else {
                setCategory(null);
            }
        }
        setError("");
    }, [mode, initialData, isOpen, defaultCategoryId]);

    // Resolve category label once options load
    useEffect(() => {
        if (categoryOptions.length === 0) return;

        if (mode === "edit" && initialData?.category) {
            const match = categoryOptions.find((c) => c.value === initialData.category);
            if (match) setCategory(match);
        } else if (defaultCategoryId) {
            const match = categoryOptions.find((c) => c.value === defaultCategoryId);
            if (match) setCategory(match);
        }
    }, [categoryOptions, mode, initialData, defaultCategoryId]);

    /* ---------- FILE HANDLER ---------- */
    const handleFile = (file) => {
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    /* ---------- SAVE ---------- */
    const handleSave = async () => {
        if (!name.trim()) {
            setError(t("nameRequired"));
            return;
        }

        setError("");
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("name", name.trim());

            if (category) {
                formData.append("category", category.value);
            }
            if (description.trim()) {
                formData.append("description", description.trim());
            }
            if (imageFile) {
                formData.append("subcategoryImage", imageFile);
            }

            if (mode === "edit" && initialData?.id) {
                await apiUpdateSubcategory(accessToken, initialData.id, formData);
            } else {
                await apiCreateSubcategory(accessToken, formData);
            }

            if (onSaveSuccess) {
                onSaveSuccess();
            }
        } catch (err) {
            console.error("Subcategory save error:", err);
            setError(err?.response?.data?.message || t("saveFailed"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            className="w-full md:min-w-[600px] mx-auto"
            contentClassName="!p-0 !h-auto"
        >
            <div className="flex flex-col">

                <div className="border-b px-6 py-4">
                    <h2 className="text-2xl font-semibold text-[#1C2C56]">
                        {mode === "edit" ? t("editSubcategory") : t("addSubcategory")}
                    </h2>
                </div>

                {/* Error */}
                {error && (
                    <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
                        {error}
                    </div>
                )}

                <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

                    {/* Name */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            {t("name")}<span className="text-red-500">*</span>
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("namePlaceholder")}
                            className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                        />
                    </div>

                    {/* Category (React Select from API) */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            {t("category")}<span className="text-red-500">*</span>
                        </label>
                        <Select
                            options={categoryOptions}
                            value={category}
                            onChange={setCategory}
                            styles={selectStyles}
                            placeholder={t("selectCategory")}
                            isLoading={loadingCategories}
                            loadingMessage={() => t("loadingCategories")}
                            noOptionsMessage={() => t("noCategoriesFound")}
                            isClearable
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                            menuPosition="fixed"
                            className="mt-1"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            {t("image")}
                        </label>

                        <button
                            onClick={() => fileRef.current.click()}
                            className="mt-2 w-full bg-[#1C2C56] text-white py-2 rounded-md text-sm flex items-center justify-center gap-2"
                        >
                            <FiUpload size={16} />
                            {t("uploadImage")}
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
                                alt={t("preview")}
                                className="w-32 h-32 object-cover rounded-lg shadow"
                            />
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            {t("description")}
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t("descriptionPlaceholder")}
                            className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                        />
                    </div>
                </div>

                <div className="border-t px-6 py-4 flex justify-end sm:flex-row flex-col gap-3">
                    <Button variant="plain" onClick={onClose} size="sm" disabled={saving}>
                        {t("cancel")}
                    </Button>
                    <Button
                        variant="solid"
                        size="sm"
                        className="bg-[#1C2C56] px-6 hover:bg-[#1C2C56] text-white py-2 rounded-md"
                        onClick={handleSave}
                        loading={saving}
                    >
                        {mode === "edit" ? t("update") : t("save")}
                    </Button>
                </div>

            </div>
        </Dialog>
    );
};

export default AddEditSubcategoryModal;
