"use client";

import { useEffect, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
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
  const t = useTranslations("productSpecification.fabric");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const materialOptions = [
    { value: "cotton", label: "Cotton" },
    { value: "polyester", label: "Polyester" },
    { value: "silk", label: "Silk" },
    { value: "linen", label: "Linen" },
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

        console.log("asdasdads", options);
        setCategoryOptions(options);

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
    fabricName: z
      .string()
      .trim()
      .min(1, {
        message: t("validation.fabricNameRequired"),
      }),

    materialType: z.any().refine((val) => val !== null, {
      message: t("validation.materialTypeRequired"),
    }),

    price: z
      .string()
      .trim()
      .min(1, {
        message: t("validation.priceRequired"),
      })
      .refine((val) => !isNaN(Number(val)), {
        message: t("validation.validPrice"),
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
      //   setFabricName(initialData.fabricName || "");
      //   setSelectedColor(initialData.color || "#87CEEB");
      //   setPrice(initialData.pricePerUnit || "");
      //   setActive(initialData.isActive ?? true);

      //   const mat = materialOptions.find(
      //     (o) => o.value === initialData.materialType,
      //   );
      //   setMaterialType(mat || null);

      //   const cat = categoryOptions.find(
      //     (o) => o.value === initialData.fabricType,
      //   );
      //   setCategory(cat || null);
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

      setSubCategory(null);
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
    console.log("Save clicked");
    console.log(values);
    // Validation

    // if (!fabricName.trim()) {
    //   setError("Fabric name is required");
    //   return;
    // }
    // if (!materialType) {
    //   setError("Material type is required");
    //   return;
    // }
    // if (!price || isNaN(Number(price))) {
    //   setError("Valid price is required");
    //   return;
    // }

    setError("");
    setSaving(true);

    const payload = {
      fabricName: values.fabricName.trim(),
      color: selectedColor,
      materialType: values.materialType.value,
      //   pricePerUnit: values.Number(price),
      pricePerUnit: Number(values.price),
      isActive: active,
    };

    // if (category) {
    //   payload.fabricType = category.value;
    // }

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
          <Notification title="Success" type="success">
            {response.message}
          </Notification>,
        );
      } else {
        const response = await apiCreateFabric(accessToken, payload);

        if (!response.status) {
          const errorMessage = Object.values(response.message || {}).flat()[0];

          toast.push(
            <Notification title="Error" type="danger">
              {errorMessage}
            </Notification>,
          );

          return;
        }

        toast.push(
          <Notification title="Success" type="success">
            {response.message}
          </Notification>,
        );
      }

      // if (onSaveSuccess) {
      //   onSaveSuccess();
      // }
      onSaveSuccess?.();
      onClose();
    } catch (err) {
      console.error("Fabric save error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to save fabric. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndAdd = async () => {
    // Same save logic but keep model open and reset form
    if (!fabricName.trim() || !materialType || !price || isNaN(Number(price))) {
      setError("Fabric name, material type, and valid price are required");
      return;
    }

    setError("");
    setSaving(true);

    const payload = {
      fabricName: fabricName.trim(),
      color: selectedColor,
      materialType: materialType.value,
      pricePerUnit: Number(price),
      isActive: active,
    };

    if (category) {
      payload.category_id = category.value;
      payload.fabricType = category.type;
    }

    if (subCategory) {
      payload.subcategory_id = subCategory.value;
    }

    // if (category) {
    //   payload.fabricType = category.value;
    // }

    try {
      await apiCreateFabric(accessToken, payload);

      // Reset form for next entry
      setFabricName("");
      setSelectedColor("#87CEEB");
      setMaterialType(null);
      setPrice("");
      setCategory(null);
      setSubCategory(null);
      setActive(true);

      // Notify parent to refresh list
      if (onSaveSuccess) {
        // Don't close modal — so we call fetchFabrics but keep modal open
        // We'll just trigger a custom event or pass a refresh function
      }
    } catch (err) {
      console.error("Fabric save error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to save fabric. Please try again.",
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
      // contentClassName="!p-0 !h-auto"
    >
      <Form onSubmit={handleSubmit(handleSave)}>
        <div className="flex flex-col">
          {/* HEADER */}
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              {mode === "edit" ? t("editFabric") : t("addFabric")}
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
                {t("fabricName")}
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
                    <Input placeholder="Eg:- Cotton Canvas" {...field} />
                  )}
                />
              </FormItem>
            </div>

            {/* Color */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {t("color")}
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
                  <p className="text-sm font-medium">Preview</p>
                  <p className="text-xs text-gray-500">{selectedColor}</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-1">{t("colorCodeHelp")}</p>
            </div>

            {/* Material Type */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {t("materialType")}
                <span className="text-red-500">*</span>
              </label>
              {/* <Select
                            options={materialOptions}
                            styles={selectStyles}
                            value={materialType}
                            onChange={setMaterialType}
                            placeholder="Select Material Type"
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                            menuPosition="fixed"
                            className="mt-1"
                        /> */}
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
                    />
                  )}
                />
              </FormItem>
            </div>

            {/* Category */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                Category
              </label>
              <Select
                options={categoryOptions}
                styles={selectStyles}
                value={category}
                onChange={(selected) => setCategory(selected)}
                placeholder="Select Category"
                isClearable
                className="mt-1"
              />
            </div>

            {/* Price */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {t("pricePer")}
                <span className="text-red-500">*</span>
              </label>
              {/* <input
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Eg:- 250.50"
                            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                        /> */}
              <FormItem
                invalid={Boolean(errors.price)}
                errorMessage={errors.price?.message}
                className="mt-1"
              >
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <Input type="number" placeholder="Eg:- 250.50" {...field} />
                  )}
                />
              </FormItem>
            </div>

            {/* Status */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {t("status")}
              </label>
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setActive(!active)}
                  className={`w-12 h-6 rounded-full flex items-center px-1 transition ${active ? "bg-[#A0522D]" : "bg-gray-300"}`}
                >
                  <span
                    className={`bg-white w-4 h-4 rounded-full transition ${active ? "translate-x-6" : ""}`}
                  />
                </button>
                <span className="text-sm text-[#1C2C56]">
                  {active ? t("active") : t("inactive")}
                </span>
              </div>
            </div>
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
              {t("cancel")}
            </Button>

            {mode === "add" && (
              <Button
                variant="plain"
                size="sm"
                onClick={handleSaveAndAdd}
                disabled={saving}
                // className="bg-blue-100 rounded-lg text-[#F2F5FA]"
                className="disabled:text-gray-400 disabled:cursor-not-allowed bg-blue-100 rounded-lg"
              >
                {saving ? "Saving..." : t("addAnother")}
              </Button>
            )}

            <Button
              type="submit"
              variant="solid"
              size="sm"
              className="bg-[#A0522D] px-6 hover:bg-[#A0522D] text-white py-2 rounded-md"
              // onClick={handleSave}
              loading={saving}
            >
              {mode === "edit" ? t("update") : t("save")}
            </Button>
          </div>
        </div>
      </Form>
    </Dialog>
  );
};

export default AddEditFabricModal;
