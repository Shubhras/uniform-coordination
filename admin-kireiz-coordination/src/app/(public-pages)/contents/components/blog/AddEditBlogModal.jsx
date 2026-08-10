"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";
import { FiUpload, FiCheckCircle } from "react-icons/fi";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { Form, FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiCreateBlog,
  apiUpdateBlog,
  apiGetBlogCategoryList,
} from "@/services/BlogService";

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

const getValidationSchema = (mode, tm) =>
  z
    .object({
      title: z.string().trim().min(1, tm("validation.titleRequired")),

      category: z
        .object({
          value: z.any(),
          label: z.string(),
        })
        .nullable()
        .refine((val) => val !== null, {
          message: tm("validation.categoryRequired"),
        }),

      description: z
        .string()
        .trim()
        .min(1, tm("validation.descriptionRequired")),

      image: z.any().optional(),
    })
    .superRefine((data, ctx) => {
      if (mode === "add" && !data.image) {
        // Image required check in add mode if passed via form
      }
    });

const AddEditBlogModal = ({
  isOpen,
  onClose,
  mode = "add",
  initialData,
  onSaveSuccess,
}) => {
  const t = useTranslations("contentMedia.blog");
  const tm = useTranslations("contentMedia.blog.createBlogModal");
  const fileInputRef = useRef(null);
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [validated, setValidated] = useState(false);
  const [imageError, setImageError] = useState("");
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

  const validationSchema = useMemo(
    () => getValidationSchema(mode, tm),
    [mode, tm],
  );

  // Category options from API
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      title: "",
      category: null,
      description: "",
      image: null,
    },
  });

  // Save state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ---------- FETCH CATEGORIES ---------- */
  useEffect(() => {
    if (!isOpen || !accessToken) return;

    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await apiGetBlogCategoryList(accessToken);
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
      setPreview(initialData.image_url || null);
      setValidated(Boolean(initialData.image_url));
      setImageError("");
      setImageFile(null);

      reset({
        title: initialData.title || "",
        category: null,
        description: initialData.description || "",
        image: null,
      });
    } else {
      setImageFile(null);
      setImageError("");
      setPreview(null);
      setValidated(false);

      reset({
        title: "",
        category: null,
        description: "",
        image: null,
      });
    }

    setError("");
  }, [mode, initialData, isOpen, reset]);

  // Resolve category label once options load (edit mode)
  useEffect(() => {
    if (
      mode === "edit" &&
      initialData?.categoryName &&
      categoryOptions.length > 0
    ) {
      const match = categoryOptions.find(
        (c) => c.label === initialData.categoryName,
      );
      if (match) {
        setValue("category", match);
      }
    }
  }, [categoryOptions, mode, initialData, setValue]);

  /* ---------- FILE HANDLERS ---------- */
  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Only image files are allowed");
      setValidated(false);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImageError(tm("validation.maxSize"));
      setImageFile(null);
      setPreview(null);
      setValidated(false);

      setValue("image", null, {
        shouldValidate: true,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setImageError("");
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setValidated(true);

    setValue("image", file, {
      shouldValidate: true,
    });

    trigger("image");
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files[0]);
  };

  const handleBrowse = (event) => {
    handleFile(event.target.files[0]);
  };

  /* ---------- RESET FORM ---------- */
  const resetForm = () => {
    reset({
      title: "",
      category: null,
      description: "",
      image: null,
    });
    setImageFile(null);
    setPreview(null);
    setValidated(false);
    setError("");
    setImageError("");
  };

  /* ---------- SAVE ---------- */
  const handleSave = async (values, { keepOpen = false } = {}) => {
    if (!imageFile && !preview) {
      setImageError(tm("validation.imageRequired"));
      return;
    }

    setImageError("");
    setError("");
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", values.title.trim());

      if (values.category) {
        formData.append("category", values.category.value);
      }
      if (values.description.trim()) {
        formData.append("description", values.description.trim());
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response =
        mode === "edit" && initialData?.id
          ? await apiUpdateBlog(accessToken, initialData.id, formData)
          : await apiCreateBlog(accessToken, formData);

      toast.push(
        <Notification title={t("successTitle")} type="success">
          {response?.message}
        </Notification>,
      );

      if (keepOpen && mode !== "edit") {
        resetForm();
        if (onSaveSuccess) onSaveSuccess();
        return;
      }

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err) {
      console.error("Blog save error:", err);
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
      <div className="flex flex-col">
        <div className="border-b p-2 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-[#1C2C56]">
            {mode === "edit" ? tm("editModalTitle") : tm("modalTitle")}
          </h2>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        <div className="md:px-5 py-5 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Title */}
          <div>
            <FormItem
              label={tm("titleLabel")}
              invalid={!!errors.title}
              errorMessage={errors.title?.message}
            >
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input placeholder={tm("titlePlaceholder")} {...field} />
                )}
              />{" "}
            </FormItem>
          </div>

          {/* Category (React Select from API) */}
          <div>
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
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={tm("categoryPlaceholder")}
                    isLoading={loadingCategories}
                    isClearable
                  />
                )}
              />
            </FormItem>
          </div>

          {/* Image */}
          <div>
            <label className="text-[#1C2C56] text-base font-medium">
              {tm("imageLabel")}<span className="text-red-500">*</span>
            </label>

            <button
              type="button"
              className="w-full bg-[#1C4FA8] text-white py-2 rounded-md text-sm mt-2 flex items-center justify-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <FiUpload size={16} />
              {tm("uploadImageButton")}
            </button>

            <div
              onDrop={handleDrop}
              onDragOver={(event) => event.preventDefault()}
              className="mt-3 border-2 border-dashed rounded-md p-6 text-center text-sm text-[#486284] bg-[#D9D9D933]"
            >
              {tm("dragDropText")}
              <br />
              {tm("orText")}{" "}
              <span
                className="text-[#1C2C56] underline cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {tm("clickToBrowse")}
              </span>
              <p className="text-xs mt-2 text-[#64748B]">
                {tm("allowedFormats")}
              </p>
              <p className="text-xs mt-2 text-[#64748B]">
                {tm("recommendedSize")}
              </p>
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleBrowse}
            />
          </div>

          {validated && (
            <div className="mb-2 flex items-center gap-2 text-sm text-green-600 font-medium">
              <FiCheckCircle className="text-green-600" size={16} />
              <span>Image validated successfully</span>
            </div>
          )}
          {imageError && (
            <p className="text-red-500 text-sm mt-1">{imageError}</p>
          )}

          {preview && (
            <div className="flex justify-center">
              <img
                src={preview}
                alt="Preview"
                className="w-40 h-28 object-cover rounded-lg shadow"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <FormItem
              label={tm("descriptionLabel")}
              invalid={!!errors.description}
              errorMessage={errors.description?.message}
            >
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    className="mt-1 w-full border rounded-md px-3 py-2 h-[150px]"
                    placeholder={tm("descriptionPlaceholder")}
                  />
                )}
              />
            </FormItem>
          </div>
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

          {mode !== "edit" && (
            <Button
              variant="plain"
              size="sm"
              onClick={handleSubmit((values) => handleSave(values, { keepOpen: true }))}
              disabled={saving}
              className="bg-blue-100 rounded-lg"
            >
              {tm("saveAndAddAnother")}
            </Button>
          )}

          <Button
            variant="solid"
            size="sm"
            className="bg-[#1C4FA8] px-6 hover:bg-[#1C4FA8] text-white py-2 rounded-md"
            onClick={handleSubmit((values) => handleSave(values, { keepOpen: false }))}
            loading={saving}
          >
            {mode === "edit" ? tm("update") : tm("save")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default AddEditBlogModal;
