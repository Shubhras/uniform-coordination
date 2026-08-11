"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormItem } from "@/components/ui/Form";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import Input from "@/components/ui/Input";
import { FiUpload, FiCheckCircle } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiCreateProduct, apiUpdateProduct } from "@/services/ProductService";
import {
  apiGetCategoryList,
  apiGetSubcategoryList,
} from "@/services/CategoryService";

import { apiGetPartsList } from "@/services/PartsService";

const TypeOptions = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "set", label: "Set" },
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
      ? "#1C4FA8"
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

const getValidationSchema = (tm) =>
  z.object({
    productName: z.string().trim().min(1, tm("validation.nameRequired")),

    description: z.string().trim().min(1, tm("validation.descriptionRequired")),

    category: z
      .object({
        value: z.any(),
        label: z.string(),
      })
      .nullable()
      .refine((val) => val !== null, {
        message: tm("validation.categoryRequired"),
      }),

    subcategory: z.any().optional(),
    type: z
      .object({
        value: z.string(),
        label: z.string(),
      })
      .nullable()
      .refine((val) => val !== null, {
        message: tm("validation.typeRequired"),
      }),

    price: z
      .string()
      .min(1, tm("validation.priceRequired"))
      .refine((val) => !isNaN(Number(val)), {
        message: tm("validation.priceInvalid"),
      }),

    selectedParts: z.array(z.any()).min(1, tm("validation.partsRequired")),

    image: z.any().optional(),
  });

const EMPTY_PRODUCT_FORM_VALUES = {
  productName: "",
  description: "",
  category: null,
  subcategory: null,
  price: "",
  selectedParts: [],
  type: null,
  image: null,
};

const AddEditProductModal = ({
  isOpen,
  onClose,
  initialData,
  onSaveSuccess,
}) => {
  const t = useTranslations("productSpecification.products");
  const tm = useTranslations("productSpecification.products.addProductModal");
  const fileInputRef = useRef(null);
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const isEdit = Boolean(initialData);

  // Form fields
  // const [productName, setProductName] = useState("");
  // const [description, setDescription] = useState("");
  // const [price, setPrice] = useState("");
  // const [category, setCategory] = useState(null);
  // const [subcategory, setSubcategory] = useState(null);
  // const [selectedParts, setSelectedParts] = useState([]);
  // const [productType, setProductType] = useState(productTypeOptions[0]);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageValidated, setImageValidated] = useState(false);

  // Dynamic options from API
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [partOptions, setPartOptions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [loadingParts, setLoadingParts] = useState(false);
  const [imageError, setImageError] = useState("");
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

  const validationSchema = useMemo(() => getValidationSchema(tm), [tm]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: EMPTY_PRODUCT_FORM_VALUES,
  });
  const selectedCategory = watch("category");

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
    fetchParts();
  }, [isOpen, accessToken]);

  useEffect(() => {
    if (!selectedCategory?.value || !accessToken) {
      setSubcategoryOptions([]);
      setValue("subcategory", null);
      return;
    }

    const fetchSubcategories = async () => {
      setLoadingSubcategories(true);

      try {
        const response = await apiGetSubcategoryList(
          accessToken,
          selectedCategory.value,
        );

        if (response?.status && response?.data) {
          const options = response.data.map((item) => ({
            value: item.id,
            label: item.name,
          }));

          setSubcategoryOptions(options);
        }
      } catch (err) {
        console.error("Failed to load subcategories:", err);
      } finally {
        setLoadingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, [selectedCategory, accessToken, setValue]);

  /* ---------- RESET / PREFILL ---------- */
  // useEffect(() => {
  //   if (!isOpen) return;

  //   if (isEdit && initialData) {
  //     setProductName(initialData.productName || "");
  //     setDescription(initialData.description || "");
  //     setPrice(initialData.price?.toString() || "");
  //     setImageFile(null);
  //     setPreview(initialData.ProductImage || null);
  //     setImageValidated(false);

  //     const typeMatch = productTypeOptions.find(
  //       (t) => t.value === initialData.productType,
  //     );
  //     setProductType(typeMatch || productTypeOptions[0]);

  //     if (initialData.category) {
  //       setCategory({
  //         value: initialData.category,
  //         label: `Category #${initialData.category}`,
  //       });
  //     } else {
  //       setCategory(null);
  //     }

  //     if (initialData.subcategory) {
  //       setSubcategory({
  //         value: initialData.subcategory,
  //         label: `Subcategory #${initialData.subcategory}`,
  //       });
  //     } else {
  //       setSubcategory(null);
  //     }

  //     if (initialData.parts && Array.isArray(initialData.parts)) {
  //       const preSelected = initialData.parts.map((pId) => ({
  //         value: pId,
  //         label: `Part #${pId}`,
  //       }));
  //       setSelectedParts(preSelected);
  //     } else {
  //       setSelectedParts([]);
  //     }
  //   } else {
  //     setProductName("");
  //     setDescription("");
  //     setPrice("");
  //     setCategory(null);
  //     setSubcategory(null);
  //     setSelectedParts([]);
  //     setProductType(productTypeOptions[0]);
  //     setImageFile(null);
  //     setPreview(null);
  //     setImageValidated(false);
  //   }
  //   setError("");
  // }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && initialData) {
      reset({
        productName: initialData.productName || "",

        description: initialData.description || "",
        price: initialData.price?.toString() || "",

        category: initialData.category
          ? {
              value: initialData.category.id,
              label: initialData.category.categoryName,
            }
          : null,

        type: initialData?.type
          ? TypeOptions.find((item) => item.value === initialData.type) || null
          : null,

        subcategory: initialData.subcategory
          ? {
              value: initialData.subcategory.id,
              label: initialData.subcategory.name,
            }
          : null,

        selectedParts:
          initialData.parts?.map((part) => ({
            value: part.id,
            label: part.partName,
          })) || [],
      });

      setPreview(initialData.ProductImage || null);
      setImageFile(null);
      setImageValidated(false);
    } else {
      reset(EMPTY_PRODUCT_FORM_VALUES);
      setPreview(null);
      setImageFile(null);
      setImageError("");
      setImageValidated(false);
      setError("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen, initialData, isEdit, reset]);

  /* ---------- FILE HANDLERS ---------- */
  const handleFile = (file) => {
    setImageError("");
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setImageError(tm("validation.onlyAllowedFormats"));
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      if (img.width > 1000 || img.height > 1000) {
        setImageError(tm("validation.maxDimensionAllowed"));
        URL.revokeObjectURL(objectUrl);
        return;
      }

      setImageFile(file);
      setPreview(objectUrl);
      setImageValidated(true);
    };

    img.onerror = () => {
      setImageError(tm("validation.invalidImageFile"));
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  /* ---------- SAVE ---------- */
  const handleSave = async (values) => {
    setError("");

    if (!isEdit && !imageFile) {
      setError(tm("validation.imageRequired"));
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("productName", values.productName.trim());
      formData.append("description", values.description || "");

      if (values.category?.value) {
        formData.append("category", values.category.value);
      }

      if (values.subcategory?.value) {
        formData.append("subcategory", values.subcategory.value);
      }

      if (values.price) {
        formData.append("price", parseFloat(values.price));
      }

      if (values.type?.value) {
        formData.append("type", values.type.value);
      }

      if (imageFile) {
        formData.append("ProductImage", imageFile);
      }

      let response;
      if (isEdit && initialData?.id) {
        response = await apiUpdateProduct(accessToken, initialData.id, formData);
      } else {
        response = await apiCreateProduct(accessToken, formData);
      }

      toast.push(
        <Notification title={t("successTitle")} type="success">
          {response?.message || tm("saveSuccess")}
        </Notification>,
      );

      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error("Save failed:", err);
      setError(
        err?.response?.data?.message || tm("saveFailed"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      className="w-full md:min-w-[650px] mx-auto"
      contentClassName="!p-0 !h-auto"
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <h2 className="text-2xl font-semibold text-[#1C2C56]">
            {isEdit ? tm("editModalTitle") : tm("modalTitle")}
          </h2>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Upload Image */}
          <div>
            <label className="text-base font-medium text-[#1C2C56]">
              {tm("productImageLabel")}
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="mt-2 w-full bg-[#1C4FA8] text-white py-2 rounded-md text-sm flex items-center justify-center gap-2"
            >
              <FiUpload size={16} />
              {tm("uploadImageButton")}
            </button>
            {imageError && (
              <p className="text-red-500 text-sm mt-1">{imageError}</p>
            )}
            {imageValidated && (
              <div className="mb-2 flex items-center gap-2 text-sm text-green-600 font-medium">
                <FiCheckCircle className="text-green-600" size={16} />
                <span>{tm("imageValidated")}</span>
              </div>
            )}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="mt-3 border-2 border-dashed rounded-md p-6 text-center text-sm text-[#486284] bg-[#D9D9D933]"
            >
              {tm("dragDropText")}
              <br />
              {tm("orText")}{" "}
              <span
                className="text-[#1C2C56] underline cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                {tm("clickToBrowse")}
              </span>
              <p className="text-xs mt-2 text-[#64748B]">
                {tm("allowedFormats")}
              </p>
              <p className="text-xs mt-2 text-[#64748B]">
                {tm("maxDimension")}
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
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
            <FormItem
              label={tm("productNameLabel")}
              invalid={!!errors.productName}
              errorMessage={errors.productName?.message}
            >
              <Controller
                name="productName"
                control={control}
                render={({ field }) => (
                  <Input placeholder={tm("productNamePlaceholder")} {...field} />
                )}
              />
            </FormItem>
          </div>

          {/* Description */}
          <div>
            <FormItem label={tm("descriptionLabel")}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    placeholder={tm("descriptionPlaceholder")}
                    className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                  />
                )}
              />
            </FormItem>
          </div>

          {/* Category */}
          <FormItem
            label={tm("categoryLabel")}
            invalid={!!errors.category}
            errorMessage={errors.category?.message}
          >
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={categoryOptions}
                  styles={selectStyles}
                  placeholder={tm("categoryPlaceholder")}
                  onChange={field.onChange}
                />
              )}
            />
          </FormItem>

          {/* Subcategory */}
          <FormItem
            label={tm("subcategoryLabel")}
            invalid={!!errors.subcategory}
            errorMessage={errors.subcategory?.message}
          >
            <Controller
              name="subcategory"
              control={control}
              render={({ field }) => (
                <Select
                  options={subcategoryOptions}
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  styles={selectStyles}
                  placeholder={tm("subcategoryPlaceholder")}
                  isLoading={loadingSubcategories}
                  isClearable
                  menuPortalTarget={
                    typeof document !== "undefined" ? document.body : null
                  }
                  menuPosition="fixed"
                />
              )}
            />
          </FormItem>

          {/* Parts */}
          <div>
            <FormItem
              label={tm("partsLabel")}
              invalid={!!errors.selectedParts}
              errorMessage={errors.selectedParts?.message}
            >
              <Controller
                name="selectedParts"
                control={control}
                render={({ field }) => (
                  <Select
                    isMulti
                    {...field}
                    options={partOptions}
                    styles={selectStyles}
                    onChange={field.onChange}
                    placeholder={tm("partsPlaceholder")}
                  />
                )}
              />
            </FormItem>
          </div>

          {/* Price */}
          <FormItem
            label={tm("priceLabel")}
            invalid={!!errors.price}
            errorMessage={errors.price?.message}
          >
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min={0}
                  placeholder={tm("pricePlaceholder")}
                />
              )}
            />
          </FormItem>

          {/* Type */}
          <FormItem
            label={tm("typeLabel")}
            invalid={!!errors.type}
            errorMessage={errors.type?.message}
          >
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value}
                  options={TypeOptions}
                  styles={selectStyles}
                  placeholder={tm("typePlaceholder")}
                  onChange={field.onChange}
                />
              )}
            />
          </FormItem>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end sm:flex-row flex-col gap-3">
          <Button
            variant="plain"
            onClick={onClose}
            size="sm"
            disabled={saving}
            className="bg-blue-100 rounded-md"
          >
            {tm("cancel")}
          </Button>
          {!isEdit && (
            <Button
              variant="plain"
              size="sm"
              onClick={handleSubmit(handleSave)}
              className="bg-blue-100 rounded-lg"
            >
              {tm("saveAndAddAnother")}
            </Button>
          )}
          <Button
            variant="solid"
            size="sm"
            className="bg-[#1C4FA8] px-6 hover:bg-[#163F86] text-white py-2 rounded-md"
            onClick={handleSubmit(handleSave)}
            loading={saving}
          >
            {isEdit ? tm("update") : tm("save")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default AddEditProductModal;
