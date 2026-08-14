"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { FiCheckCircle } from "react-icons/fi";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiCreatePart, apiUpdatePart } from "@/services/PartsService";
import { apiGetFabricList } from "@/services/FabricService";
import {
  apiGetCategoryList,
  apiGetSubcategoryList,
} from "@/services/CategoryService";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const AddEditPartModal = ({
  isOpen,
  onClose,
  mode = "add",
  initialData,
  onSaveSuccess,
}) => {
  const t = useTranslations("productSpecification.parts");
  const tm = useTranslations("productSpecification.parts.uploadPartModal");
  const fileInputRef = useRef(null);
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // Form fields
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [validated, setValidated] = useState(false);

  // Fabrics
  const [fabricOptions, setFabricOptions] = useState([]);

  // States
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");

  const validationSchema = z.object({
    partName: z
      .string()
      .trim()
      .min(1, {
        message: tm("validation.nameRequired"),
      }),
    category: z.any().refine((val) => val !== null, {
      message: tm("validation.categoryRequired"),
    }),
    fabric: z.any().refine((val) => val !== null, {
      message: "Fabric is required",
    }),
    zIndex: z
      .string()
      .min(1, {
        message: "z-Index is required",
      })
      .refine((val) => Number(val) >= 0, {
        message: "z-Index cannot be negative",
      }),
    subcategory: z.any().optional(),
    image: z.any().refine((val) => mode === "edit" || val instanceof File, {
      message: tm("validation.imageRequired"),
    }),
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      partName: "",
      category: null,
      subcategory: null,
      fabric: null,
      zIndex: "1",
      image: null,
    },
  });

  const selectedCategory = watch("category");

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "42px",
      borderRadius: "8px",
      borderColor: state.isFocused ? "#1C2C56" : "#E2E8F0",
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

  /* ---------- FETCH CATEGORIES ---------- */
  useEffect(() => {
    if (!isOpen) return;

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await apiGetCategoryList();
        if (res?.status && res?.data) {
          const opts = res.data.map((c) => ({
            value: c.id,
            label: c.categoryName,
          }));
          setCategoryOptions(opts);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [isOpen]);

  /* ---------- FETCH SUBCATEGORIES ---------- */
  useEffect(() => {
    if (!isOpen) return;

    if (!selectedCategory?.value) {
      setSubcategoryOptions([]);
      setValue("subcategory", null);
      return;
    }

    const fetchSubcategories = async () => {
      try {
        setLoadingSubcategories(true);
        const res = await apiGetSubcategoryList(accessToken,selectedCategory.value);
        if (res?.status && res?.data) {
          const opts = res.data.map((sc) => ({
            value: sc.id,
            label: sc.name,
          }));
          setSubcategoryOptions(opts);
        }
      } catch (err) {
        console.error("Failed to load subcategories:", err);
      } finally {
        setLoadingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, [selectedCategory, isOpen, setValue]);

  /* ---------- FETCH FABRICS ---------- */
  useEffect(() => {
    if (!isOpen) return;

    const fetchFabrics = async () => {
      try {
        const response = await apiGetFabricList(1, 100);
        if (response?.status && response?.data) {
          const options = response.data.map((f) => ({
            value: f.id,
            label: f.fabricName,
          }));
          setFabricOptions(options);
        }
      } catch (err) {
        console.error("Failed to load fabrics:", err);
      }
    };

    fetchFabrics();
  }, [isOpen]);

  /* ---------- PREFILL ON EDIT ---------- */
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      const catObj = initialData.category
        ? {
            value: initialData.category.id || initialData.category,
            label: initialData.category.categoryName || initialData.category,
          }
        : null;

      const subcatObj = initialData.subcategory
        ? {
            value: initialData.subcategory.id || initialData.subcategory,
            label: initialData.subcategory.name || initialData.subcategory,
          }
        : null;

      const fabricObj = initialData.fabric
        ? {
            value: initialData.fabric.id || initialData.fabric,
            label: initialData.fabric.fabricName || initialData.fabric,
          }
        : null;

      reset({
        partName: initialData.partName || "",
        category: catObj,
        subcategory: subcatObj,
        fabric: fabricObj,
        zIndex: String(initialData.zIndex ?? 1),
      });

      if (initialData.partImage) {
        const imgUrl = initialData.partImage.startsWith("http")
          ? initialData.partImage
          : `${API_BASE}${initialData.partImage}`;
        setPreview(imgUrl);
      } else {
        setPreview(null);
      }

      setImageFile(null);
      setValidated(false);
    } else {
      reset({
        partName: "",
        category: null,
        subcategory: null,
        fabric: null,
        zIndex: "1",
      });
      setImageFile(null);
      setPreview(null);
      setValidated(false);
    }

    setError("");
    setImageError("");
  }, [mode, initialData, isOpen, reset]);

  /* ---------- IMAGE HANDLERS ---------- */
  const processFile = (file) => {
    setImageError("");
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setImageError("Only PNG, JPG, JPEG files are allowed.");
      setValue("image", null, {
        shouldValidate: true,
      });
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      if (img.width > 1000 || img.height > 1000) {
        setImageError("Maximum dimension allowed is 1000x1000px.");
        setValue("image", null, {
          shouldValidate: true,
        });
        URL.revokeObjectURL(objectUrl);
        return;
      }

      setImageFile(file);
      setValue("image", file, {
        shouldValidate: true,
      });
      setPreview(objectUrl);
      setValidated(true);
    };

    img.onerror = () => {
      setImageError("Invalid image file.");
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  };

  const handleBrowse = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  /* ---------- SAVE ---------- */
  const onSubmit = handleSubmit(async (values) => {
    setError("");

    if (mode === "add" && !imageFile) {
      setError(tm("validation.imageRequired"));
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("partName", values.partName.trim());
      formData.append("category_id", values.category?.value || "");

      if (values.subcategory?.value) {
        formData.append("subcategory_id", values.subcategory.value);
      }

      if (values.fabric?.value) {
        formData.append("fabric", values.fabric.value);
      }

      formData.append("zIndex", parseInt(values.zIndex, 10));

      if (imageFile) {
        formData.append("partImage", imageFile);
      }

      let response;
      if (mode === "edit" && initialData?.id) {
        response = await apiUpdatePart(accessToken, initialData.id, formData);
      } else {
        response = await apiCreatePart(accessToken, formData);
      }

      toast.push(
        <Notification title={t("successTitle")} type="success">
          {response?.message || tm("saveSuccess")}
        </Notification>,
      );

      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error("Save failed:", err);
      setError(err?.response?.data?.message || tm("saveFailed"));
    } finally {
      setSaving(false);
    }
  });

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      className="w-full md:min-w-[650px] mx-auto"
      contentClassName="!p-0 !h-auto"
    >
      <Form onSubmit={onSubmit}>
        <div className="flex flex-col">
          {/* Header */}
          <div className="border-b px-6 py-4">
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              {mode === "edit" ? tm("editModalTitle") : tm("modalTitle")}
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
            {/* Part Name */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("partNameLabel")}
                <span className="text-red-500">*</span>
              </label>

              <FormItem
                invalid={Boolean(errors.partName)}
                errorMessage={errors.partName?.message}
              >
                <Controller
                  name="partName"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder={tm("partNamePlaceholder")} {...field} />
                  )}
                />
              </FormItem>
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormItem
                label={tm("categoryLabel")}
                invalid={Boolean(errors.category)}
                errorMessage={errors.category?.message}
              >
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={categoryOptions}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        setValue("subcategory", null);
                      }}
                      styles={selectStyles}
                      placeholder={tm("categoryPlaceholder")}
                      isLoading={loadingCategories}
                      menuPortalTarget={
                        typeof document !== "undefined" ? document.body : null
                      }
                      menuPosition="fixed"
                    />
                  )}
                />
              </FormItem>

              <FormItem label={tm("subcategoryLabel")}>
                <Controller
                  name="subcategory"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={subcategoryOptions}
                      value={field.value}
                      onChange={field.onChange}
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
            </div>

            {/* Fabric */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("fabricLabel")}
              </label>
              <FormItem
                invalid={Boolean(errors.fabric)}
                errorMessage={errors.fabric?.message}
              >
                <Controller
                  name="fabric"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={fabricOptions}
                      styles={selectStyles}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={tm("fabricPlaceholder")}
                      isClearable
                    />
                  )}
                />
              </FormItem>
            </div>

            {/* z-Index */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("zIndexLabel")}
                <span className="text-red-500">*</span>
              </label>
              <FormItem
                invalid={Boolean(errors.zIndex)}
                errorMessage={errors.zIndex?.message}
              >
                <Controller
                  name="zIndex"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min="0"
                      placeholder={tm("zIndexPlaceholder")}
                      {...field}
                    />
                  )}
                />
              </FormItem>
            </div>

            {/* Upload Image */}
            {/* <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("uploadImageLabel")}
              </label>

              <button
                type="button"
                className="w-full bg-[#1C4FA8] text-white py-2 rounded-md text-sm mt-2"
                onClick={() => fileInputRef.current.click()}
              >
                {tm("uploadImageButton")}
              </button>
              {imageError && (
                <p className="text-red-500 text-sm mt-1">{imageError}</p>
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
                accept="image/png,image/jpeg,image/jpg"
                ref={fileInputRef}
                className="hidden"
                onChange={handleBrowse}
              />
            </div> */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("uploadImageLabel")}
                <span className="text-red-500">*</span>
              </label>

              <FormItem
                invalid={Boolean(errors.image)}
                errorMessage={errors.image?.message}
              >
                <button
                  type="button"
                  className="w-full bg-[#1C4FA8] text-white py-2 rounded-md text-sm mt-2"
                  onClick={() => fileInputRef.current.click()}
                >
                  {tm("uploadImageButton")}
                </button>

                {imageError && (
                  <p className="text-red-500 text-sm mt-1">{imageError}</p>
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
                  accept="image/png,image/jpeg,image/jpg"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleBrowse}
                />
              </FormItem>
            </div>
            {validated && (
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <FiCheckCircle className="text-green-600" size={16} />
                <span>{tm("imageValidated")}</span>
              </div>
            )}

            {preview && (
              <div className="flex justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 object-contain rounded-lg shadow"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 flex justify-end sm:flex-row flex-col gap-3">
            <Button
              variant="plain"
              onClick={onClose}
              size="sm"
              disabled={saving}
              className="bg-blue-100 rounded-lg"
            >
              {tm("cancel")}
            </Button>

            <Button
              type="submit"
              variant="solid"
              size="sm"
              className="bg-[#1C4FA8] px-6 hover:bg-[#1C2C56] text-white py-2 rounded-md"
              loading={saving}
            >
              {mode === "edit" ? tm("update") : tm("save")}
            </Button>
          </div>
        </div>
      </Form>
    </Dialog>
  );
};

export default AddEditPartModal;
