"use client";

import { useEffect, useRef, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";
import { FiUpload } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiCreateProduct, apiUpdateProduct } from "@/services/ProductService";
import { apiGetCategoryList, apiGetSubcategoryList } from "@/services/CategoryService";
import { apiGetPartsList } from "@/services/PartsService";

const productTypeOptions = [
    { value: "uniform", label: "Uniform" },
    { value: "table", label: "Table" },
];

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
    multiValue: (base) => ({
        ...base,
        backgroundColor: "#EEF2FF",
        borderRadius: "6px",
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: "#1C2C56",
        fontSize: "13px",
        fontWeight: 500,
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: "#1C2C56",
        "&:hover": {
            backgroundColor: "#1C2C56",
            color: "white",
        },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const AddEditProductModal = ({ isOpen, onClose, initialData, onSaveSuccess }) => {
    const fileRef = useRef(null);
    const { session } = useCurrentSession();
    const accessToken = session?.user?.accessToken;
    const isEdit = Boolean(initialData);

    // Form fields
    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState(null);
    const [subcategory, setSubcategory] = useState(null);
    const [selectedParts, setSelectedParts] = useState([]);
    const [productType, setProductType] = useState(productTypeOptions[0]);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    // Dynamic options from API
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [subcategoryOptions, setSubcategoryOptions] = useState([]);
    const [partOptions, setPartOptions] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);
    const [loadingParts, setLoadingParts] = useState(false);

    // Save state
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    /* ---------- FETCH OPTIONS ---------- */
    useEffect(() => {
        if (!isOpen || !accessToken) return;

        // Fetch categories
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const response = await apiGetCategoryList(accessToken);
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

        // Fetch subcategories
        const fetchSubcategories = async () => {
            setLoadingSubcategories(true);
            try {
                const response = await apiGetSubcategoryList(accessToken);
                if (response?.status && response?.data) {
                    const options = response.data.map((s) => ({
                        value: s.id,
                        label: s.name,
                    }));
                    setSubcategoryOptions(options);
                }
            } catch (err) {
                console.error("Failed to load subcategories:", err);
            } finally {
                setLoadingSubcategories(false);
            }
        };

        // Fetch parts
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

        fetchCategories();
        fetchSubcategories();
        fetchParts();
    }, [isOpen, accessToken]);

    /* ---------- RESET / PREFILL ---------- */
    useEffect(() => {
        if (!isOpen) return;

        if (isEdit && initialData) {
            setProductName(initialData.productName || "");
            setDescription(initialData.description || "");
            setPrice(initialData.price?.toString() || "");
            setImageFile(null);
            setPreview(initialData.ProductImage || null);

            // Product type
            const typeMatch = productTypeOptions.find((t) => t.value === initialData.productType);
            setProductType(typeMatch || productTypeOptions[0]);

            // Category
            if (initialData.category) {
                setCategory({ value: initialData.category, label: `Category #${initialData.category}` });
            } else {
                setCategory(null);
            }

            // Subcategory
            if (initialData.subcategory) {
                setSubcategory({ value: initialData.subcategory, label: `Subcategory #${initialData.subcategory}` });
            } else {
                setSubcategory(null);
            }

            // Parts (array of IDs)
            if (initialData.parts && Array.isArray(initialData.parts)) {
                const preSelected = initialData.parts.map((pId) => ({
                    value: pId,
                    label: `Part #${pId}`,
                }));
                setSelectedParts(preSelected);
            } else {
                setSelectedParts([]);
            }
        } else {
            setProductName("");
            setDescription("");
            setPrice("");
            setCategory(null);
            setSubcategory(null);
            setSelectedParts([]);
            setProductType(productTypeOptions[0]);
            setImageFile(null);
            setPreview(null);
        }
        setError("");
    }, [isOpen, initialData]);

    // Resolve labels once options load (edit mode)
    useEffect(() => {
        if (!isEdit || !initialData) return;

        if (initialData.category && categoryOptions.length > 0) {
            const match = categoryOptions.find((c) => c.value === initialData.category);
            if (match) setCategory(match);
        }
        if (initialData.subcategory && subcategoryOptions.length > 0) {
            const match = subcategoryOptions.find((s) => s.value === initialData.subcategory);
            if (match) setSubcategory(match);
        }
        if (initialData.parts?.length > 0 && partOptions.length > 0) {
            const resolved = initialData.parts.map((pId) => {
                const match = partOptions.find((p) => p.value === pId);
                return match || { value: pId, label: `Part #${pId}` };
            });
            setSelectedParts(resolved);
        }
    }, [categoryOptions, subcategoryOptions, partOptions, isEdit, initialData]);

    /* ---------- FILE HANDLER ---------- */
    const handleFile = (file) => {
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    /* ---------- SAVE ---------- */
    const handleSave = async () => {
        if (!productName.trim()) {
            setError("Product name is required");
            return;
        }

        setError("");
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("productName", productName.trim());
            formData.append("productType", productType.value);

            if (description.trim()) {
                formData.append("description", description.trim());
            }
            if (price) {
                formData.append("price", price);
            }
            if (category) {
                formData.append("category", category.value);
            }
            if (subcategory) {
                formData.append("subcategory", subcategory.value);
            }
            if (selectedParts.length > 0) {
                selectedParts.forEach((p) => {
                    formData.append("parts", p.value);
                });
            }
            if (imageFile) {
                formData.append("productImage", imageFile);
            }

            if (isEdit && initialData?.id) {
                await apiUpdateProduct(accessToken, initialData.id, formData, productType.value);
            } else {
                await apiCreateProduct(accessToken, formData);
            }

            if (onSaveSuccess) {
                onSaveSuccess();
            }
        } catch (err) {
            console.error("Product save error:", err);
            setError(err?.response?.data?.message || "Failed to save product. Please try again.");
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
                        {isEdit ? "Edit Product" : "Add Product"}
                    </h2>
                </div>

                {/* Error */}
                {error && (
                    <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
                        {error}
                    </div>
                )}

                <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

                    {/* Product Image */}
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

                    {preview && (
                        <div className="flex justify-center">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg shadow"
                            />
                        </div>
                    )}

                    {/* Product Name */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Product Name<span className="text-red-500">*</span>
                        </label>
                        <input
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                            placeholder="Eg:- School Uniform Set"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                            placeholder="Product description..."
                        />
                    </div>

                    {/* Category (from API) */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Category
                        </label>
                        <Select
                            options={categoryOptions}
                            value={category}
                            onChange={setCategory}
                            styles={selectStyles}
                            placeholder="Select Category"
                            isLoading={loadingCategories}
                            loadingMessage={() => "Loading categories..."}
                            noOptionsMessage={() => "No categories found"}
                            isClearable
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                            menuPosition="fixed"
                            className="mt-1"
                        />
                    </div>

                    {/* Subcategory (from API) */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Subcategory
                        </label>
                        <Select
                            options={subcategoryOptions}
                            value={subcategory}
                            onChange={setSubcategory}
                            styles={selectStyles}
                            placeholder="Select Subcategory"
                            isLoading={loadingSubcategories}
                            loadingMessage={() => "Loading subcategories..."}
                            noOptionsMessage={() => "No subcategories found"}
                            isClearable
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                            menuPosition="fixed"
                            className="mt-1"
                        />
                    </div>

                    {/* Parts (multi-select from API) */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Parts
                        </label>
                        <Select
                            isMulti
                            options={partOptions}
                            value={selectedParts}
                            onChange={setSelectedParts}
                            styles={selectStyles}
                            placeholder="Select Parts..."
                            isLoading={loadingParts}
                            loadingMessage={() => "Loading parts..."}
                            noOptionsMessage={() => "No parts found"}
                            closeMenuOnSelect={false}
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                            menuPosition="fixed"
                            className="mt-1"
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Price
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                            placeholder="e.g. 100"
                        />
                    </div>

                    {/* Product Type */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Product Type
                        </label>
                        <Select
                            options={productTypeOptions}
                            value={productType}
                            onChange={setProductType}
                            styles={selectStyles}
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                            menuPosition="fixed"
                            className="mt-1"
                        />
                    </div>
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
                        {isEdit ? "Update" : "Create"}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default AddEditProductModal;
