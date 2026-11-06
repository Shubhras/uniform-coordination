"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { z } from "zod";
import { Form, FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Select from "react-select";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { FiX, FiUpload, FiCheckCircle } from "react-icons/fi";
import {
  apiCreateFabric,
  apiUpdateFabric,
  apiFabricCategoryList,
  apiFabricSubCategoryList,
} from "@/services/FabricService";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const getApiErrorMessage = (
  errorData,
  defaultMsg = "Failed to save fabric",
) => {
  if (!errorData) return defaultMsg;
  if (typeof errorData === "string") return errorData;

  const msg = errorData?.message || errorData?.error || errorData?.errors;
  if (typeof msg === "string" && msg.trim()) return msg;

  const target = msg && typeof msg === "object" ? msg : errorData;
  if (target && typeof target === "object") {
    const list = [];
    for (const [k, v] of Object.entries(target)) {
      if (k === "statusCode" || k === "status") continue;
      const text = Array.isArray(v)
        ? v.join(", ")
        : typeof v === "object"
          ? JSON.stringify(v)
          : String(v);
      list.push(`${k}: ${text}`);
    }
    if (list.length > 0) return list.join(" | ");
  }

  return defaultMsg;
};

const colors = [
  "#0F172A",
  "#7DD3FC",
  "#000000",
  "#E5E7EB",
  "#4ADE80",
  "#EF4444",
  "#92400E",
  "#FACC15",
  "#D1D5DB",
  "#1D4ED8",
  "#2563EB",
  "#FFFFFF",
  "#64748B",
];

const AddEditFabricModal = ({
  isOpen,
  onClose,
  mode = "add",
  initialData,
  onSaveSuccess,
}) => {
  const t = useTranslations("productSpecification.fabrics");
  const tm = useTranslations("productSpecification.fabrics.addFabricModal");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const materialOptions = [
    { value: "cotton", label: tm("materialTypeOptions.cotton") },
    { value: "polyester", label: tm("materialTypeOptions.polyester") },
    { value: "silk", label: tm("materialTypeOptions.silk") },
    { value: "linen", label: tm("materialTypeOptions.linen") },
  ];

  const functionalTypeOptions = [
    {
      value: "antibacterial",
      label: tm("functionalTypeOptions.antibacterial") || "Antibacterial",
    },
    {
      value: "stain-resistant",
      label: tm("functionalTypeOptions.stainResistant") || "Stain-resistant",
    },
    {
      value: "moisture-wicking",
      label: tm("functionalTypeOptions.moistureWicking") || "Moisture-wicking",
    },
    {
      value: "breathable",
      label: tm("functionalTypeOptions.breathable") || "Breathable",
    },
  ];

  const [selectedColor, setSelectedColor] = useState("#87CEEB");
  const [category, setCategory] = useState(null);
  const [subCategory, setSubCategory] = useState(null);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);

  // Texture Image states
  const fileInputRef = useRef(null);
  const [textureImageFile, setTextureImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [imageValidated, setImageValidated] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const MAX_WIDTH = 1000;
  const MAX_HEIGHT = 1000;

  const processFile = (file) => {
    setImageError("");
    setImageValidated(false);
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setImageError("Only PNG, JPG, JPEG files are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImageError("Image file size must be less than 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        setImageError(
          `Image dimensions must not exceed ${MAX_WIDTH}×${MAX_HEIGHT}px (Current: ${width}×${height}px).`,
        );
        URL.revokeObjectURL(objectUrl);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setTextureImageFile(file);
      setPreview(objectUrl);
      setImageValidated(true);
    };

    img.onerror = () => {
      setImageError("Invalid image file.");
      setImageValidated(false);
      URL.revokeObjectURL(objectUrl);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  const handleRemoveImage = () => {
    setTextureImageFile(null);
    setPreview(null);
    setImageError("");
    setImageValidated(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (!accessToken) return;

    const getCategories = async () => {
      try {
        const res = await apiFabricCategoryList(accessToken);

        const options =
          res?.data
            ?.filter((item) => item.isActive !== false)
            ?.map((item) => ({
              value: item.id,
              label: item.categoryName,
              type: item.type,
            })) || [];

        setCategoryOptions(options);
      } catch (err) {
        console.error("Category list error", err);
      }
    };

    getCategories();
  }, [isOpen, accessToken]);

  useEffect(() => {
    if (!category || !accessToken) {
      setSubCategoryOptions([]);
      setSubCategory(null);
      return;
    }

    const getSubCategories = async () => {
      try {
        const res = await apiFabricSubCategoryList(accessToken, category.value);

        const options =
          res?.data
            ?.filter((item) => item.isActive !== false)
            ?.map((item) => ({
              value: item.id,
              label: item.name,
              type: item.type,
            })) || [];

        setSubCategoryOptions(options);
      } catch (err) {
        console.error("Subcategory Error", err);
        setSubCategoryOptions([]);
      }
    };

    getSubCategories();
  }, [category, accessToken]);

  const validationSchema = z.object({
    fabricName: z
      .string()
      .trim()
      .min(1, {
        message: tm("validation.nameRequired"),
      }),

    materialType: z.any().refine((val) => val !== null, {
      message: tm("validation.materialRequired"),
    }),

    price: z
      .string()
      .trim()
      .min(1, {
        message: tm("validation.priceRequired"),
      })
      .refine((val) => !isNaN(Number(val)), {
        message: tm("validation.priceInvalid"),
      })
      .refine((val) => Number(val) >= 0, {
        message: "Price per unit cannot be negative",
      })
      .refine((val) => val.replace(".", "").length <= 10, {
        message:
          tm("validation.priceMaxDigits") ||
          "Ensure that there are no more than 10 digits in total.",
      }),

    category: z.any().refine((val) => val !== null, {
      message: tm("validation.categoryRequired"),
    }),

    functionalType: z
      .any()
      .refine((val) => val !== null && val !== undefined && val !== "", {
        message: tm("validation.functionalTypeRequired"),
      }),

    weave: z
      .string()
      .trim()
      .min(1, {
        message: tm("validation.weaveRequired"),
      }),

    weight: z
      .string()
      .trim()
      .min(1, {
        message: tm("validation.weightRequired"),
      })
      .regex(/^[0-9]+$/, {
        message: tm("validation.weightNumbersOnly"),
      }),

    composition: z
      .string()
      .trim()
      .min(1, {
        message: tm("validation.compositionRequired"),
      })
      .refine(
        (val) =>
          /^\s*\d{1,3}(\.\d+)?%\s+[^\d/%]+(\s*\/\s*\d{1,3}(\.\d+)?%\s+[^\d/%]+)*\s*$/.test(
            val,
          ),
        {
          message: tm("validation.compositionInvalid"),
        },
      ),

    careInstructions: z
      .string()
      .trim()
      .min(1, {
        message: tm("validation.careInstructionsRequired"),
      }),
  });

  const {
    control,
    handleSubmit,
    reset,
    setError: setFieldError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      fabricName: "",
      materialType: null,
      price: "",
      category: null,
      functionalType: null,
      weave: "",
      composition: "",
      weight: "",
      careInstructions: "",
    },
  });

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
      const mat = materialOptions.find(
        (o) => o.value === initialData.materialType,
      );

      const cat = categoryOptions.find(
        (o) => o.value === initialData?.category?.id,
      );
      setCategory(cat || null);

      const funcType = functionalTypeOptions.find(
        (o) =>
          o.value ===
          (initialData.functional_type || initialData.functionalType),
      );

      reset({
        fabricName: initialData.fabricName || "",
        materialType: mat || null,
        price: String(initialData.pricePerUnit || ""),
        category: cat || null,
        functionalType: funcType || null,
        weave: initialData.weave || "",
        composition: initialData.composition || "",
        weight: initialData.weight || "",
        careInstructions:
          initialData.care_instructions || initialData.careInstructions || "",
      });

      setSelectedColor(initialData.color || "#87CEEB");
      setSubCategory(null);
      setActive(initialData.isActive ?? true);

      const initialTexture =
        initialData.texture_image || initialData.textureImage || null;
      if (initialTexture) {
        const fullUrl = initialTexture.startsWith("http")
          ? initialTexture
          : `${API_BASE}${initialTexture}`;
        setPreview(fullUrl);
      } else {
        setPreview(null);
      }
      setTextureImageFile(null);
      setImageError("");
      setImageValidated(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      reset({
        fabricName: "",
        materialType: null,
        price: "",
        category: null,
        functionalType: null,
        weave: "",
        composition: "",
        weight: "",
        careInstructions: "",
      });

      setSelectedColor("#87CEEB");
      setCategory(null);
      setSubCategory(null);
      setActive(true);
      setPreview(null);
      setTextureImageFile(null);
      setImageError("");
      setImageValidated(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setError("");
  }, [isOpen, mode, initialData]);

  useEffect(() => {
    if (
      mode !== "edit" ||
      !initialData?.subcategory ||
      subCategoryOptions.length === 0
    ) {
      return;
    }

    const sub = subCategoryOptions.find(
      (item) => item.value === initialData.subcategory.id,
    );

    setSubCategory(sub || null);
  }, [subCategoryOptions, mode, initialData]);

  const buildPayload = (values) => {
    if (textureImageFile) {
      const formData = new FormData();
      formData.append("fabricName", values.fabricName.trim());
      formData.append("color", selectedColor);
      formData.append("materialType", values.materialType.value);
      formData.append("pricePerUnit", values.price);
      formData.append("isActive", active);

      if (category) {
        formData.append("category_id", category.value);
        if (category.type) formData.append("fabricType", category.type);
      }

      if (subCategory) {
        formData.append("subcategory_id", subCategory.value);
      }

      if (values.functionalType?.value) {
        formData.append("functional_type", values.functionalType.value);
      }
      if (values.weave?.trim()) {
        formData.append("weave", values.weave.trim());
      }
      if (values.composition?.trim()) {
        formData.append("composition", values.composition.trim());
      }
      if (values.weight?.trim()) {
        formData.append("weight", values.weight.trim());
      }
      if (values.careInstructions?.trim()) {
        formData.append("care_instructions", values.careInstructions.trim());
      }

      formData.append("texture_image", textureImageFile);
      return formData;
    }

    const payload = {
      fabricName: values.fabricName.trim(),
      color: selectedColor,
      materialType: values.materialType.value,
      pricePerUnit: Number(values.price),
      isActive: active,
      functional_type: values.functionalType?.value || null,
      weave: values.weave?.trim() || null,
      composition: values.composition?.trim() || null,
      weight: values.weight?.trim() || null,
      care_instructions: values.careInstructions?.trim() || null,
    };

    if (category) {
      payload.category_id = category.value;
      payload.fabricType = category.type;
    }

    if (subCategory) {
      payload.subcategory_id = subCategory.value;
    }

    if (!preview) {
      payload.texture_image = null;
    }

    return payload;
  };

  const handleSave = async (values) => {
    setError("");
    setSaving(true);

    const payload = buildPayload(values);

    try {
      if (mode === "edit" && initialData?.id) {
        const response = await apiUpdateFabric(
          accessToken,
          initialData.id,
          payload,
        );

        toast.push(
          <Notification title={t("successTitle")} type="success">
            {response?.message || tm("updateSuccess")}
          </Notification>,
        );
      } else {
        const response = await apiCreateFabric(accessToken, payload);

        toast.push(
          <Notification title={t("successTitle")} type="success">
            {response?.message || tm("createSuccess")}
          </Notification>,
        );
      }

      if (onSaveSuccess) {
        onSaveSuccess(false);
      }
    } catch (err) {
      console.error("Fabric save error:", err);
      const data = err?.response?.data || err;
      const errorMsg = getApiErrorMessage(data, tm("saveFailed"));

      const fieldErrors =
        data?.message && typeof data.message === "object"
          ? data.message
          : data?.errors || data?.error;
      if (fieldErrors && typeof fieldErrors === "object") {
        if (fieldErrors.fabricName) {
          const fnMsg = Array.isArray(fieldErrors.fabricName)
            ? fieldErrors.fabricName[0]
            : String(fieldErrors.fabricName);
          setFieldError("fabricName", { type: "server", message: fnMsg });
        }
        if (fieldErrors.price || fieldErrors.pricePerUnit) {
          const pMsg = Array.isArray(
            fieldErrors.price || fieldErrors.pricePerUnit,
          )
            ? (fieldErrors.price || fieldErrors.pricePerUnit)[0]
            : String(fieldErrors.price || fieldErrors.pricePerUnit);
          setFieldError("price", { type: "server", message: pMsg });
        }
        if (fieldErrors.functional_type || fieldErrors.functionalType) {
          const msg = Array.isArray(
            fieldErrors.functional_type || fieldErrors.functionalType,
          )
            ? (fieldErrors.functional_type || fieldErrors.functionalType)[0]
            : String(fieldErrors.functional_type || fieldErrors.functionalType);
          setFieldError("functionalType", { type: "server", message: msg });
        }
        if (fieldErrors.weave) {
          const msg = Array.isArray(fieldErrors.weave)
            ? fieldErrors.weave[0]
            : String(fieldErrors.weave);
          setFieldError("weave", { type: "server", message: msg });
        }
        if (fieldErrors.composition) {
          const msg = Array.isArray(fieldErrors.composition)
            ? fieldErrors.composition[0]
            : String(fieldErrors.composition);
          setFieldError("composition", { type: "server", message: msg });
        }
        if (fieldErrors.weight) {
          const msg = Array.isArray(fieldErrors.weight)
            ? fieldErrors.weight[0]
            : String(fieldErrors.weight);
          setFieldError("weight", { type: "server", message: msg });
        }
        if (fieldErrors.care_instructions || fieldErrors.careInstructions) {
          const msg = Array.isArray(
            fieldErrors.care_instructions || fieldErrors.careInstructions,
          )
            ? (fieldErrors.care_instructions || fieldErrors.careInstructions)[0]
            : String(
              fieldErrors.care_instructions || fieldErrors.careInstructions,
            );
          setFieldError("careInstructions", { type: "server", message: msg });
        }
      }

      setError(errorMsg);
      toast.push(
        <Notification title={tm("errorTitle")} type="danger">
          {errorMsg}
        </Notification>,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndAdd = async (values) => {
    setError("");
    setSaving(true);

    const payload = buildPayload(values);

    try {
      await apiCreateFabric(accessToken, payload);

      reset({
        fabricName: "",
        materialType: null,
        price: "",
        category: null,
        functionalType: null,
        weave: "",
        composition: "",
        weight: "",
        careInstructions: "",
      });

      setSelectedColor("#87CEEB");
      setCategory(null);
      setSubCategory(null);
      setActive(true);
      setPreview(null);
      setTextureImageFile(null);
      setImageError("");
      setImageValidated(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (onSaveSuccess) {
        onSaveSuccess(true);
      }
    } catch (err) {
      console.error("Fabric save and add error:", err);
      const data = err?.response?.data || err;
      const errorMsg = getApiErrorMessage(data, tm("saveFailed"));

      const fieldErrors =
        data?.message && typeof data.message === "object"
          ? data.message
          : data?.errors || data?.error;
      if (fieldErrors && typeof fieldErrors === "object") {
        if (fieldErrors.fabricName) {
          const fnMsg = Array.isArray(fieldErrors.fabricName)
            ? fieldErrors.fabricName[0]
            : String(fieldErrors.fabricName);
          setFieldError("fabricName", { type: "server", message: fnMsg });
        }
        if (fieldErrors.price || fieldErrors.pricePerUnit) {
          const pMsg = Array.isArray(
            fieldErrors.price || fieldErrors.pricePerUnit,
          )
            ? (fieldErrors.price || fieldErrors.pricePerUnit)[0]
            : String(fieldErrors.price || fieldErrors.pricePerUnit);
          setFieldError("price", { type: "server", message: pMsg });
        }
        if (fieldErrors.functional_type || fieldErrors.functionalType) {
          const msg = Array.isArray(
            fieldErrors.functional_type || fieldErrors.functionalType,
          )
            ? (fieldErrors.functional_type || fieldErrors.functionalType)[0]
            : String(fieldErrors.functional_type || fieldErrors.functionalType);
          setFieldError("functionalType", { type: "server", message: msg });
        }
        if (fieldErrors.weave) {
          const msg = Array.isArray(fieldErrors.weave)
            ? fieldErrors.weave[0]
            : String(fieldErrors.weave);
          setFieldError("weave", { type: "server", message: msg });
        }
        if (fieldErrors.composition) {
          const msg = Array.isArray(fieldErrors.composition)
            ? fieldErrors.composition[0]
            : String(fieldErrors.composition);
          setFieldError("composition", { type: "server", message: msg });
        }
        if (fieldErrors.weight) {
          const msg = Array.isArray(fieldErrors.weight)
            ? fieldErrors.weight[0]
            : String(fieldErrors.weight);
          setFieldError("weight", { type: "server", message: msg });
        }
        if (fieldErrors.care_instructions || fieldErrors.careInstructions) {
          const msg = Array.isArray(
            fieldErrors.care_instructions || fieldErrors.careInstructions,
          )
            ? (fieldErrors.care_instructions || fieldErrors.careInstructions)[0]
            : String(
              fieldErrors.care_instructions || fieldErrors.careInstructions,
            );
          setFieldError("careInstructions", { type: "server", message: msg });
        }
      }

      setError(errorMsg);
      toast.push(
        <Notification title={tm("errorTitle")} type="danger">
          {errorMsg}
        </Notification>,
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
      className="w-full md:min-w-[720px] mx-auto"
    >
      <Form onSubmit={handleSubmit(handleSave)}>
        <div className="flex flex-col">
          {/* HEADER */}
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              {mode === "edit" ? tm("editModalTitle") : tm("modalTitle")}
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md flex items-center justify-between">
              <span>
                {typeof error === "string" ? error : JSON.stringify(error)}
              </span>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-400 hover:text-red-600 ml-2"
              >
                <FiX size={16} />
              </button>
            </div>
          )}

          {/* BODY */}
          <div className="md:px-5 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Fabric Name */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("fabricNameLabel")}
                <span className="text-red-500">*</span>
              </label>
              <FormItem
                className="mt-1"
                invalid={Boolean(errors.fabricName)}
                errorMessage={errors.fabricName?.message}
              >
                <Controller
                  name="fabricName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder={tm("fabricNamePlaceholder")}
                      {...field}
                    />
                  )}
                />
              </FormItem>
            </div>

            {/* Color */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("colorLabel")}
                <span className="text-red-500">*</span>
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
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded border-[0.5px] ${selectedColor === color ? "ring-2 ring-[#1C2C56] ring-offset-1" : ""}`}
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
                  <p className="text-sm font-medium">{tm("previewLabel")}</p>
                  <p className="text-xs text-gray-500">{selectedColor}</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-1">
                {tm("colorHelperText")}
              </p>
            </div>

            {/* Material Type */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("materialTypeLabel")}
                <span className="text-red-500">*</span>
              </label>

              <FormItem
                invalid={Boolean(errors.materialType)}
                errorMessage={errors.materialType?.message}
                className="mt-1"
              >
                <Controller
                  name="materialType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={materialOptions}
                      styles={selectStyles}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={tm("materialTypePlaceholder")}
                    />
                  )}
                />
              </FormItem>
            </div>

            {/* Price */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("pricePerUnitLabel")}
                <span className="text-red-500">*</span>
              </label>

              <FormItem
                invalid={Boolean(errors.price)}
                errorMessage={errors.price?.message}
                className="mt-1"
              >
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") e.preventDefault();
                      }}
                      placeholder={tm("pricePerUnitPlaceholder")}
                      {...field}
                    />
                  )}
                />
              </FormItem>
            </div>

            {/* Category */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("categoryLabel")}
                <span className="text-red-500">*</span>
              </label>

              <FormItem
                invalid={Boolean(errors.category)}
                errorMessage={errors.category?.message}
                className="mt-1"
              >
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={categoryOptions}
                      styles={selectStyles}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        setCategory(value);

                        // Clear selected subcategory when category changes
                        setSubCategory(null);
                        setSubCategoryOptions([]);
                      }}
                      placeholder={tm("categoryPlaceholder")}
                      menuPortalTarget={
                        typeof document !== "undefined" ? document.body : null
                      }
                      menuPosition="fixed"
                    />
                  )}
                />
              </FormItem>
            </div>

            {/* Sub Category */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("subCategoryLabel")}
              </label>
              <Select
                options={subCategoryOptions}
                styles={selectStyles}
                value={subCategory}
                onChange={setSubCategory}
                placeholder={tm("subCategoryPlaceholder")}
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
                menuPosition="fixed"
                className="mt-1"
              />
            </div>

            {/* Functional Type */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("functionalTypeLabel")}
                <span className="text-red-500">*</span>
              </label>
              <FormItem
                className="mt-1"
                invalid={Boolean(errors.functionalType)}
                errorMessage={errors.functionalType?.message}
              >
                <Controller
                  name="functionalType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      isClearable
                      options={functionalTypeOptions}
                      styles={selectStyles}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={tm("functionalTypePlaceholder")}
                      menuPortalTarget={
                        typeof document !== "undefined" ? document.body : null
                      }
                      menuPosition="fixed"
                    />
                  )}
                />
              </FormItem>
            </div>

            {/* Weave & Weight - Same Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[#1C2C56] text-base font-medium">
                  {tm("weaveLabel")}
                  <span className="text-red-500">*</span>
                </label>
                <FormItem
                  className="mt-1"
                  invalid={Boolean(errors.weave)}
                  errorMessage={errors.weave?.message}
                >
                  <Controller
                    name="weave"
                    control={control}
                    render={({ field }) => (
                      <Input placeholder={tm("weavePlaceholder")} {...field} />
                    )}
                  />
                </FormItem>
              </div>

              <div>
                <label className="text-[#1C2C56] text-base font-medium">
                  {tm("weightLabel")}
                  <span className="text-red-500">*</span>
                </label>
                <FormItem
                  className="mt-1"
                  invalid={Boolean(errors.weight)}
                  errorMessage={errors.weight?.message}
                >
                  <Controller
                    name="weight"
                    control={control}
                    render={({ field }) => (
                      <Input
                        placeholder={tm("weightPlaceholder")}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const onlyNums = e.target.value.replace(
                            /[^0-9]/g,
                            "",
                          );
                          field.onChange(onlyNums);
                        }}
                        onKeyDown={(e) => {
                          if (
                            !/[0-9]/.test(e.key) &&
                            ![
                              "Backspace",
                              "Delete",
                              "Tab",
                              "ArrowLeft",
                              "ArrowRight",
                              "ArrowUp",
                              "ArrowDown",
                              "Enter",
                            ].includes(e.key) &&
                            !e.ctrlKey &&
                            !e.metaKey
                          ) {
                            e.preventDefault();
                          }
                        }}
                      />
                    )}
                  />
                </FormItem>
              </div>
            </div>

            {/* Composition - Full Width */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("compositionLabel")}
                <span className="text-red-500">*</span>
              </label>
              <FormItem
                className="mt-1"
                invalid={Boolean(errors.composition)}
                errorMessage={errors.composition?.message}
              >
                <Controller
                  name="composition"
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder={tm("compositionPlaceholder")}
                      {...field}
                    />
                  )}
                />
              </FormItem>
            </div>

            {/* Care Instructions */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("careInstructionsLabel")}
                <span className="text-red-500">*</span>
              </label>
              <FormItem
                className="mt-1"
                invalid={Boolean(errors.careInstructions)}
                errorMessage={errors.careInstructions?.message}
              >
                <Controller
                  name="careInstructions"
                  control={control}
                  render={({ field }) => (
                    <Input
                      textArea
                      rows={2}
                      placeholder={tm("careInstructionsPlaceholder")}
                      {...field}
                    />
                  )}
                />
              </FormItem>
            </div>

            {/* Texture Image */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("textureImageLabel")}
              </label>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full bg-[#1C4FA8] hover:bg-[#163F86] text-white py-2 rounded-md text-sm flex items-center justify-center gap-2 transition"
              >
                <FiUpload size={16} />
                {tm("uploadImageButton")}
              </button>

              {imageError && (
                <p className="text-red-500 text-sm mt-1">{imageError}</p>
              )}

              {imageValidated && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600 font-medium">
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
                  className="text-[#1C2C56] underline cursor-pointer font-medium"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {tm("clickToBrowse")}
                </span>
                <p className="text-xs mt-2 text-[#64748B]">
                  {tm("allowedFormats")}
                </p>
                <p className="text-xs mt-1 text-[#64748B]">
                  {tm("maxDimension")}
                </p>
                <p className="text-xs mt-1 text-[#64748B]">
                  {tm("maxFileSize")}
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleBrowse}
              />
            </div>

            {preview && (
              <div className="flex justify-center relative w-32 h-32 mx-auto">
                <img
                  src={preview}
                  alt={tm("textureImageLabel")}
                  className="w-32 h-32 object-cover rounded-lg shadow border"
                />
              </div>
            )}

            {/* Status */}
            {mode === "edit" && (
              <div>
                <label className="text-[#1C2C56] text-base font-medium">
                  {tm("statusLabel")}
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setActive(!active)}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition ${active ? "bg-[#1C2C56]" : "bg-gray-300"}`}
                  >
                    <span
                      className={`bg-white w-4 h-4 rounded-full transition ${active ? "translate-x-6" : ""}`}
                    />
                  </button>
                  <span className="text-sm text-[#1C2C56]">
                    {active ? tm("statusActive") : tm("statusInactive")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
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

            {mode === "add" && (
              <Button
                variant="plain"
                size="sm"
                type="button"
                onClick={handleSubmit(handleSaveAndAdd)}
                disabled={saving}
                className="disabled:text-gray-400 disabled:cursor-not-allowed bg-blue-100 rounded-lg"
              >
                {tm("saveAndAddAnother")}
              </Button>
            )}

            <Button
              type="submit"
              variant="solid"
              size="sm"
              className="bg-[#1C4FA8] px-6 hover:bg-[#163F86] text-white py-2 rounded-md"
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

export default AddEditFabricModal;
