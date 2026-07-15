"use client";

import { useEffect, useRef, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";
import { FiUpload } from "react-icons/fi";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiCreateCatalogImage,
  apiUpdateCatalogImage,
} from "@/services/CatalogService";
import { apiGetCategoryList } from "@/services/CategoryService";

const catalogSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),

  category: z
    .object({
      value: z.any(),
      label: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, {
      message: "Category is required",
    }),

  image: z.any().refine((file) => file instanceof File, {
    message: "Image is required",
  }),
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
    color: state.isSelected ? "white" : "#1E293B",
    fontSize: "14px",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const AddEditCatalogModal = ({
  isOpen,
  onClose,
  mode = "add",
  initialData,
  onSaveSuccess,
}) => {
  const fileRef = useRef(null);
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  // Form fields
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Category options from API
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      name: "",
      category: null,
      image: null,
    },
  });
  /* ---------- FETCH CATEGORIES ---------- */
  useEffect(() => {
    if (!isOpen || !accessToken) return;

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

    fetchCategories();
  }, [isOpen, accessToken]);

  /* ---------- RESET / PREFILL ---------- */
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      setImageFile(null);
      setPreview(initialData.image || null);

      reset({
        name: initialData.name || "",
        category: null,
        image: null,
      });
    } else {
      // setName("");
      // setCategory(null);
      setImageFile(null);
      setPreview(null);
      reset({
        name: "",
        category: null,
        image: null,
      });
    }
    setError("");
  }, [mode, initialData, isOpen]);

  // Resolve category label once options load (edit mode)
  useEffect(() => {
    if (
      mode === "edit" &&
      initialData?.category &&
      categoryOptions.length > 0
    ) {
      const match = categoryOptions.find(
        (c) =>
          c.label === initialData.category || c.value === initialData.category,
      );
      if (match) {
        setValue("category", match);
      }
    }
  }, [categoryOptions, mode, initialData]);

  /* ---------- FILE HANDLER ---------- */
  const handleFile = (file) => {
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));

    setValue("image", file, {
      shouldValidate: true,
    });
    trigger("image");
  };

  /* ---------- SAVE ---------- */
  const handleSave = async (values) => {
    setError("");
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", values.name.trim());

      if (values.category) {
        formData.append("category", values.category.value);
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (mode === "edit" && initialData?.id) {
        await apiUpdateCatalogImage(accessToken, initialData.id, formData);
      } else {
        await apiCreateCatalogImage(accessToken, formData);
      }

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err) {
      console.error("Catalog save error:", err);
      setError(
        err?.response?.data?.message || "Failed to save. Please try again.",
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
      className="w-full md:min-w-[600px] mx-auto"
      contentClassName="!p-0 !h-auto"
    >
      <Form onSubmit={handleSubmit(handleSave)}>
        <div className="flex flex-col">
          <div className="border-b px-6 py-4">
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              {mode === "edit" ? "Edit Catalog Image" : "Add Catalog Image"}
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
                Name<span className="text-red-500">*</span>
              </label>
              {/* <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter catalog name"
                            className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                        /> */}
              <FormItem
                invalid={Boolean(errors.name)}
                errorMessage={errors.name?.message}
              >
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="Enter catalog name" {...field} />
                  )}
                />
              </FormItem>
            </div>

            {/* Category (React Select from API) */}
            <div>
              <label className="text-base font-medium text-[#1C2C56]">
                Category
              </label>
              {/* <Select
                            options={categoryOptions}
                            value={category}
                            onChange={setCategory}
                            styles={selectStyles}
                            placeholder="Select category..."
                            isLoading={loadingCategories}
                            loadingMessage={() => "Loading categories..."}
                            noOptionsMessage={() => "No categories found"}
                            isClearable
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                            menuPosition="fixed"
                            className="mt-1"
                        /> */}
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
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select category..."
                      isLoading={loadingCategories}
                      loadingMessage={() => "Loading categories..."}
                      noOptionsMessage={() => "No categories found"}
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

            {/* Image Upload */}
            <div>
              <label className="text-base font-medium text-[#1C2C56]">
                Image<span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="mt-2 w-full bg-[#1C4FA8] text-white py-2 rounded-md text-sm flex items-center justify-center gap-2"
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
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.image.message}
                </p>
              )}
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
              Cancel
            </Button>
            <Button
              variant="solid"
              size="sm"
              className="bg-[#1C4FA8] px-6 hover:bg-[#1C2C56] text-white py-2 rounded-md"
              //   onClick={handleSave}
              onClick={handleSubmit(handleSave)}
              loading={saving}
            >
              {mode === "edit" ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </Form>
    </Dialog>
  );
};

export default AddEditCatalogModal;
