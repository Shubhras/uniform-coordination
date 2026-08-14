"use client";

import { useEffect, useState } from "react";
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
import {
  apiCreateFabric,
  apiUpdateFabric,
  apiFabricCategoryList,
  apiFabricSubCategoryList,
} from "@/services/FabricService";

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

  const [fabricName, setFabricName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#87CEEB");
  const [materialType, setMaterialType] = useState(null);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(null);
  const [subCategory, setSubCategory] = useState(null);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);

  useEffect(() => {
    if (!accessToken) return;

    const getCategories = async () => {
      try {
        const res = await apiFabricCategoryList(accessToken);

        const options =
          res?.data?.map((item) => ({
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
          res?.data?.map((item) => ({
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
    fabricName: z.string().trim().min(1, {
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
      }),
    category: z.any().refine((val) => val !== null, {
      message: tm("validation.categoryRequired"),
    }),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      fabricName: "",
      materialType: null,
      price: "",
      category: null,
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

      reset({
        fabricName: initialData.fabricName || "",
        materialType: mat || null,
        price: String(initialData.pricePerUnit || ""),
        category: cat || null,
      });

      setSelectedColor(initialData.color || "#87CEEB");
      setSubCategory(null);
      setActive(initialData.isActive ?? true);
    } else {
      reset({
        fabricName: "",
        materialType: null,
        price: "",
        category: null,
      });

      // Reset for add mode
      setFabricName("");
      setSelectedColor("#87CEEB");
      setMaterialType(null);
      setPrice("");
      setCategory(null);
      setSubCategory(null);
      setActive(true);
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

  const handleSave = async (values) => {
    setError("");
    setSaving(true);

    const payload = {
      fabricName: values.fabricName.trim(),
      color: selectedColor,
      materialType: values.materialType.value,
      pricePerUnit: Number(values.price),
      isActive: active,
    };

    if (category) {
      payload.category_id = category.value;
      payload.fabricType = category.type;
    }

    if (subCategory) {
      payload.subcategory_id = subCategory.value;
    }

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
        onSaveSuccess();
      }
    } catch (err) {
      toast.push(
        <Notification title={tm("errorTitle")} type="danger">
          {err?.response?.data?.message || tm("saveFailed")}
        </Notification>,
      );
      setError(
        err?.response?.data?.message || tm("saveFailed"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndAdd = async (values) => {
    setError("");
    setSaving(true);

    const payload = {
      fabricName: values.fabricName.trim(),
      color: selectedColor,
      materialType: values.materialType.value,
      pricePerUnit: Number(values.price),
      isActive: active,
    };

    if (category) {
      payload.category_id = category.value;
      payload.fabricType = category.type;
    }

    if (subCategory) {
      payload.subcategory_id = subCategory.value;
    }

    try {
      await apiCreateFabric(accessToken, payload);

      reset({
        fabricName: "",
        materialType: null,
        price: "",
        category: null,
      });

      setFabricName("");
      setSelectedColor("#87CEEB");
      setMaterialType(null);
      setPrice("");
      setCategory(null);
      setSubCategory(null);
      setActive(true);

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err) {
      console.error("Fabric save error:", err);
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
            <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          {/* BODY */}
          <div className="md:px-5 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Fabric Name */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("fabricNameLabel")}<span className="text-red-500">*</span>
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
                    <Input placeholder={tm("fabricNamePlaceholder")} {...field} />
                  )}
                />
              </FormItem>
            </div>

            {/* Color */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("colorLabel")}<span className="text-red-500">*</span>
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
                {tm("materialTypeLabel")}<span className="text-red-500">*</span>
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
                {tm("pricePerUnitLabel")}<span className="text-red-500">*</span>
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
                    <Input type="number" placeholder={tm("pricePerUnitPlaceholder")} {...field} />
                  )}
                />
              </FormItem>
            </div>

            {/* Category */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("categoryLabel")}
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
