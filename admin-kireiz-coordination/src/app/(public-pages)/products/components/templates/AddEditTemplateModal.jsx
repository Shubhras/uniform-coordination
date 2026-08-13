"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";
import { FiUpload, FiCheckCircle } from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiCreateTemplate,
  apiUpdateTemplate,
} from "@/services/TemplateService";
import { apiGetPartsList } from "@/services/PartsService";
import {
  apiFabricCategoryList,
  apiGetFabricList,
} from "@/services/FabricService";
import { apiGetColorsList } from "@/services/ColorsService";

const AddEditTemplateModal = ({
  isOpen,
  onClose,
  mode = "add",
  initialData,
  onSaveSuccess,
}) => {
  const t = useTranslations("productSpecification.template");
  const tm = useTranslations(
    "productSpecification.template.createTemplateModal",
  );
  const fileRef = useRef(null);
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [partOptions, setPartOptions] = useState([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [fabricOptions, setFabricOptions] = useState([]);

  // Form states
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isActive, setIsActive] = useState(true);

  // Save states
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [validated, setValidated] = useState(false);

  const validationSchema = z.object({
    templateName: z
      .string()
      .trim()
      .min(1, {
        message: tm("validation.nameRequired"),
      }),
    part: z.any().refine((val) => val?.value, {
      message: "Part is required",
    }),

    // Which storefront industry page this template appears on.
    category: z.any().refine((val) => val?.value, {
      message: "Category is required",
    }),

    // Pre-selected style, applied when a shopper opens a product with this template.
    // Optional: a template can be published before its colour or fabric is decided.
    presetColor: z.any().optional(),
    presetFabric: z.any().optional(),

    // One bullet per line, shown on the customer template card.
    specifications: z.string().optional(),

    partUsageCount: z
      .string()
      .min(1, {
        message: "Part usage count is required",
      })
      .refine((val) => Number(val) > 0, {
        message: "Part usage count must be greater than 0",
      }),

    image: z.any().refine((val) => mode === "edit" || val instanceof File, {
      message: "Image is required",
    }),
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      templateName: "",
      part: null,
      category: null,
      presetColor: null,
      presetFabric: null,
      specifications: "",
      partUsageCount: "1",
      image: null,
    },
  });

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

  /* ---------- FETCH PARTS ---------- */
  useEffect(() => {
    if (!isOpen) return;

    const fetchParts = async () => {
      try {
        setLoadingParts(true);
        const res = await apiGetPartsList(accessToken, 1, 100);
        if (res?.status && res?.data) {
          const opts = res.data.map((p) => ({
            value: p.id,
            label: p.partName,
          }));
          setPartOptions(opts);
        }
      } catch (err) {
        console.error("Failed to load parts:", err);
      } finally {
        setLoadingParts(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await apiFabricCategoryList(accessToken);
        if (res?.status && res?.data) {
          setCategoryOptions(
            res.data.map((c) => ({ value: c.id, label: c.categoryName })),
          );
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    const fetchPresetSources = async () => {
      try {
        const [colors, fabrics] = await Promise.all([
          apiGetColorsList(accessToken, 1, 200),
          apiGetFabricList(1, 200),
        ]);

        if (colors?.status && colors?.data) {
          setColorOptions(
            colors.data.map((c) => ({
              value: c.id,
              // Several colour rows can share a code, so the code is part of the label —
              // otherwise two entries look identical in this dropdown.
              label: `${c.colorName} (${c.colorCode})`,
            })),
          );
        }

        if (fabrics?.status && fabrics?.data) {
          setFabricOptions(
            fabrics.data.map((f) => ({
              value: f.id,
              label: f.fabricName,
            })),
          );
        }
      } catch (err) {
        console.error("Failed to load preset sources:", err);
      }
    };

    fetchParts();
    fetchCategories();
    fetchPresetSources();
  }, [isOpen, accessToken]);

  /* ---------- PREFILL ON EDIT ---------- */
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      setIsActive(initialData.isActive ?? true);
      setPreview(initialData.templateImage || null);

      const matchedPart = partOptions.find((p) => p.value === initialData.part);
      const matchedCategory = categoryOptions.find(
        (c) => c.value === initialData.category,
      );
      const matchedColor = colorOptions.find(
        (c) => c.value === initialData.preset_color,
      );
      const matchedFabric = fabricOptions.find(
        (f) => f.value === initialData.preset_fabric,
      );

      reset({
        templateName: initialData.templateName || "",
        part: matchedPart || null,
        category: matchedCategory || null,
        presetColor: matchedColor || null,
        presetFabric: matchedFabric || null,
        // Stored as a list; edited here as one bullet per line.
        specifications: (initialData.specifications || []).join("\n"),
        partUsageCount: String(initialData.partUsageCount ?? 1),
      });
      setImageFile(null);
      setValidated(!!initialData.templateImage);
    } else {
      setIsActive(true);
      setPreview(null);
      setImageFile(null);
      setValidated(false);

      reset({
        templateName: "",
        part: null,
        category: null,
        presetColor: null,
        presetFabric: null,
        specifications: "",
        partUsageCount: "1",
      });
    }

    setError("");
    setImageError("");
  }, [mode, initialData, isOpen, partOptions, categoryOptions, colorOptions, fabricOptions, reset]);

  /* ---------- FILE HANDLERS ---------- */
  const handleFile = (file) => {
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

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  /* ---------- SAVE ---------- */
  const onSubmit = handleSubmit(async (values) => {
    setError("");

    if (mode === "add" && !imageFile) {
      setError("Template image is required");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("templateName", values.templateName.trim());

      if (values.part?.value) {
        formData.append("part", values.part.value);
      }

      if (values.category?.value) {
        formData.append("category", values.category.value);
      }

      // Presets are clearable, so send an empty value to detach rather than omitting
      // the key — omitting it would leave the previous preset in place on edit.
      formData.append("preset_color", values.presetColor?.value ?? "");
      formData.append("preset_fabric", values.presetFabric?.value ?? "");

      // One bullet per line in the textarea; sent as a JSON array because the request is
      // multipart and the backend expects a list.
      const specLines = (values.specifications || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      formData.append("specifications", JSON.stringify(specLines));

      formData.append(
        "partUsageCount",
        parseInt(values.partUsageCount || "1", 10),
      );
      formData.append("isActive", isActive);

      if (imageFile) {
        formData.append("templateImage", imageFile);
      }

      let response;
      if (mode === "edit" && initialData?.id) {
        response = await apiUpdateTemplate(
          accessToken,
          initialData.id,
          formData,
        );
      } else {
        response = await apiCreateTemplate(accessToken, formData);
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
            {/* Template Name */}
            <div>
              <label className="text-base font-medium text-[#1C2C56]">
                {tm("templateNameLabel")}
                <span className="text-red-500">*</span>
              </label>
              <FormItem
                invalid={Boolean(errors.templateName)}
                errorMessage={errors.templateName?.message}
              >
                <Controller
                  name="templateName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder={tm("templateNamePlaceholder")}
                      {...field}
                    />
                  )}
                />
              </FormItem>
            </div>

            {/* Part */}
            <div>
              <label className="text-base font-medium text-[#1C2C56]">
                {tm("partLabel")}
                <span className="text-red-500">*</span>
              </label>
              <FormItem
                invalid={Boolean(errors.part)}
                errorMessage={errors.part?.message}
              >
                <Controller
                  name="part"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={partOptions}
                      styles={selectStyles}
                      placeholder={tm("partPlaceholder")}
                      isLoading={loadingParts}
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

            {/* Category — which storefront industry page this template appears on */}
            <div>
              <label className="text-base font-medium text-[#1C2C56]">
                {tm("categoryLabel")}
                <span className="text-red-500">*</span>
              </label>
              <FormItem
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
                      styles={selectStyles}
                      placeholder={tm("categoryPlaceholder")}
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

            {/* Preset style — pre-selected when a shopper applies this template */}
            <div>
              <label className="text-base font-medium text-[#1C2C56]">
                {tm("presetColorLabel")}
              </label>
              <p className="text-xs text-[#64748B] mt-0.5 mb-1">
                {tm("presetHint")}
              </p>
              <FormItem>
                <Controller
                  name="presetColor"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={colorOptions}
                      styles={selectStyles}
                      placeholder={tm("presetColorPlaceholder")}
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

            <div>
              <label className="text-base font-medium text-[#1C2C56]">
                {tm("presetFabricLabel")}
              </label>
              <FormItem>
                <Controller
                  name="presetFabric"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={fabricOptions}
                      styles={selectStyles}
                      placeholder={tm("presetFabricPlaceholder")}
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

            {/* Specifications — the bullet list on the customer template card */}
            <div>
              <label className="text-base font-medium text-[#1C2C56]">
                {tm("specificationsLabel")}
              </label>
              <p className="text-xs text-[#64748B] mt-0.5 mb-1">
                {tm("specificationsHint")}
              </p>
              <FormItem
                invalid={Boolean(errors.specifications)}
                errorMessage={errors.specifications?.message}
              >
                <Controller
                  name="specifications"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={4}
                      placeholder={tm("specificationsPlaceholder")}
                      className="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1C2C56] resize-y"
                    />
                  )}
                />
              </FormItem>
            </div>

            {/* Part Usage Count */}
            <div>
              <label className="text-base font-medium text-[#1C2C56]">
                {tm("partUsageCountLabel")}
                <span className="text-red-500">*</span>
              </label>
              <FormItem
                invalid={Boolean(errors.partUsageCount)}
                errorMessage={errors.partUsageCount?.message}
              >
                <Controller
                  name="partUsageCount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min="1"
                      placeholder={tm("partUsageCountPlaceholder")}
                      {...field}
                    />
                  )}
                />
              </FormItem>
            </div>

            {/* Status */}
            <div>
              <label className="text-base font-medium text-[#1C2C56]">
                {tm("statusLabel")}
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
                <span className="text-sm text-[#1C2C56]">
                  {isActive ? tm("statusActive") : tm("statusInactive")}
                </span>
              </div>
            </div>

            {/* Template Image */}
            {/* <div>
              <label className="text-base font-medium text-[#1C2C56]">
                {tm("templateImageLabel")}
              </label>

              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="mt-2 w-full bg-[#1C4FA8] text-white py-2 rounded-md text-sm flex items-center justify-center gap-2"
              >
                <FiUpload size={16} />
                {tm("uploadImageButton")}
              </button>
              {imageError && (
                <p className="text-red-500 text-sm mt-1">{imageError}</p>
              )}
              {validated && (
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
                  onClick={() => fileRef.current.click()}
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
                ref={fileRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div> */}
            <div>
              <label className="text-base font-medium text-[#1C2C56]">
                {tm("templateImageLabel")}
                <span className="text-red-500">*</span>
              </label>

              <FormItem
                invalid={Boolean(errors.image || imageError)}
                errorMessage={errors.image?.message || imageError}
              >
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 w-full bg-[#1C4FA8] text-white py-2 rounded-md text-sm flex items-center justify-center gap-2"
                >
                  <FiUpload size={16} />
                  {tm("uploadImageButton")}
                </button>

                {validated && (
                  <div className="mb-2 mt-2 flex items-center gap-2 text-sm text-green-600 font-medium">
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
                    onClick={() => fileRef.current?.click()}
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
                  ref={fileRef}
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => {
                    handleFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </FormItem>
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
              variant="solid"
              type="submit"
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

export default AddEditTemplateModal;
