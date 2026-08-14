"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { FiUpload } from "react-icons/fi";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { Form, FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiCreateCategory,
  apiUpdateCategory,
} from "@/services/CategoryService";

const AddEditCategoryModal = ({
  isOpen,
  onClose,
  mode = "add",
  initialData,
  onSaveSuccess,
}) => {
  const t = useTranslations("contentMedia.categories");
  const tm = useTranslations("contentMedia.categories.createCategoryModal");
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [validated, setValidated] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerValidated, setBannerValidated] = useState(false);
  const [active, setActive] = useState(true);

   const categorySchema = z.object({
    categoryName: z.string().trim().min(1, tm("validation.nameRequired")),

    description: z.string().trim().min(1, tm("validation.descriptionRequired")),

    // image: z.any().refine((file) => file instanceof File, {
    //   message: "Image is required",
    // }),
    image:
      mode === "edit"
        ? z.any().optional()
        : z.any().refine((file) => file instanceof File, {
            message: tm("validation.imageRequired"),
          }),

    bannerImage:
      mode === "edit"
        ? z.any().optional()
        : z.any().refine((file) => file instanceof File, {
            message: tm("validation.bannerImageRequired"),
          }),
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryName: "",
      description: "",
      image: null,
      bannerImage: null,
    },
  });

 
  // Save state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [bannerError, setBannerError] = useState("");
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

  /* ---------- RESET / PREFILL ---------- */
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      // setCategoryName(initialData.categoryName || initialData.name || "");
      // setDescription(initialData.description || "");
      setPreview(initialData.categoryImage || initialData.image || null);
      setImageFile(null);
      setValidated(Boolean(initialData.categoryImage || initialData.image));
      setBannerPreview(initialData.bannerImage || null);
      setBannerFile(null);
      setBannerValidated(Boolean(initialData.bannerImage));
      setActive(initialData.isActive ?? true);
      reset({
        categoryName: initialData.categoryName || initialData.name || "",
        description: initialData.description || "",
        image: null,
        bannerImage: null,
      });
    } else {
      // setCategoryName("");
      // setDescription("");
      setImageFile(null);
      setPreview(null);
      setValidated(false);
      setImageError("");
      setBannerFile(null);
      setBannerPreview(null);
      setBannerValidated(false);
      setBannerError("");
      setActive(true);
      reset({
        categoryName: "",
        description: "",
        image: null,
        bannerImage: null,
      });
    }
    setError("");
  }, [mode, initialData, isOpen]);

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError(tm("validation.onlyImages"));
      setValidated(false);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
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
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleBrowse = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleBannerFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setBannerError(tm("validation.onlyImages"));
      setBannerValidated(false);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setBannerError(tm("validation.maxSize"));
      setBannerFile(null);
      setBannerPreview(null);
      setBannerValidated(false);

      setValue("bannerImage", null, {
        shouldValidate: true,
      });

      if (bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }

      return;
    }

    setBannerError("");
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setBannerValidated(true);

    setValue("bannerImage", file, {
      shouldValidate: true,
    });
  };

  const handleBannerDrop = (e) => {
    e.preventDefault();
    handleBannerFile(e.dataTransfer.files[0]);
  };

  const handleBannerBrowse = (e) => {
    handleBannerFile(e.target.files[0]);
  };

  /* ---------- RESET ---------- */
  const resetForm = () => {
    // setCategoryName("");
    // setDescription("");
    setImageFile(null);
    setPreview(null);
    setValidated(false);
    setImageError("");
    setBannerFile(null);
    setBannerPreview(null);
    setBannerValidated(false);
    setBannerError("");
    setActive(true);
    setError("");
    reset({
      categoryName: "",
      description: "",
      image: null,
    });
  };

  /* ---------- SAVE ---------- */
  const handleSave = async (values, { keepOpen = false } = {}) => {
    setError("");
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("categoryName", values.categoryName.trim());

      if (values.description.trim()) {
        formData.append("description", values.description.trim());
      }
      if (imageFile) {
        formData.append("categoryImage", imageFile);
      }
      if (bannerFile) {
        formData.append("bannerImage", bannerFile);
      }
      formData.append("isActive", active ? "true" : "false");

      // if (mode === "edit" && initialData?.id) {
      //   await apiUpdateCategory(accessToken, initialData.id, formData);
      // } else {
      //   await apiCreateCategory(accessToken, formData);
      // }

      const response =
        mode === "edit" && initialData?.id
          ? await apiUpdateCategory(accessToken, initialData.id, formData)
          : await apiCreateCategory(accessToken, formData);

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
      console.error("Category save error:", err);
      setError(err?.response?.data?.message || tm("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      className="w-full md:min-w-[620px] mx-auto"
    >
      <Form onSubmit={handleSubmit(handleSave)}>
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
            {/* Category Name */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("nameLabel")}
                <span className="text-red-500">*</span>
              </label>
              {/* <input
              type="text"
              placeholder="Eg:- Medical Surgeon"
              {...register("categoryName")}
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
            /> */}
              <FormItem
                invalid={Boolean(errors.categoryName)}
                errorMessage={errors.categoryName?.message}
              >
                <Controller
                  name="categoryName"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder={tm("namePlaceholder")} {...field} />
                  )}
                />
              </FormItem>
            </div>

            {/* Image */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("imageLabel")}
                <span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                className="w-full bg-[#1C4FA8] text-white py-2 rounded-md text-sm mt-2 flex items-center justify-center gap-2"
                onClick={() => fileInputRef.current.click()}
              >
                <FiUpload size={16} />
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

              {/* <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleBrowse}
              /> */}
              <FormItem
                invalid={Boolean(errors.image)}
                errorMessage={errors.image?.message}
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleBrowse}
                />
              </FormItem>
            </div>

            {validated && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                ✔ {tm("imageValidated")}
              </p>
            )}
            {preview && (
              <div className="flex justify-center">
                <img
                  src={preview}
                  alt={tm("previewAlt")}
                  className="w-32 h-32 object-contain rounded-lg shadow"
                />
              </div>
            )}

            {/* Banner Image */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("bannerImageLabel")}
                <span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                className="w-full bg-[#1C4FA8] text-white py-2 rounded-md text-sm mt-2 flex items-center justify-center gap-2"
                onClick={() => bannerInputRef.current.click()}
              >
                <FiUpload size={16} />
                {tm("uploadBannerImageButton")}
              </button>
              {bannerError && (
                <p className="text-red-500 text-sm mt-1">{bannerError}</p>
              )}

              <div
                onDrop={handleBannerDrop}
                onDragOver={(e) => e.preventDefault()}
                className="mt-3 border-2 border-dashed rounded-md p-6 text-center text-sm text-[#486284] bg-[#D9D9D933]"
              >
                {tm("dragDropText")}
                <br />
                {tm("orText")}{" "}
                <span
                  className="text-[#1C2C56] underline cursor-pointer"
                  onClick={() => bannerInputRef.current.click()}
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

              <FormItem
                invalid={Boolean(errors.bannerImage)}
                errorMessage={errors.bannerImage?.message}
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={bannerInputRef}
                  className="hidden"
                  onChange={handleBannerBrowse}
                />
              </FormItem>
            </div>

            {bannerValidated && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                ✔ {tm("imageValidated")}
              </p>
            )}
            {bannerPreview && (
              <div className="flex justify-center">
                <img
                  src={bannerPreview}
                  alt={tm("previewAlt")}
                  className="w-32 h-32 object-contain rounded-lg shadow"
                />
              </div>
            )}

            {/* Status */}
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

            {/* Description */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {tm("descriptionLabel")}
              </label>
              {/* <textarea
              placeholder="type....."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm h-[90px] resize-none focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
            /> */}

              <FormItem
                invalid={Boolean(errors.description)}
                errorMessage={errors.description?.message}
              >
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      placeholder={tm("descriptionPlaceholder")}
                      className="mt-1 w-full border rounded-md px-3 py-2 text-sm h-[90px] resize-none focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
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

            <Button
              variant="plain"
              size="sm"
              // onClick={() => handleSave({ keepOpen: true })}
              onClick={handleSubmit((values) =>
                handleSave(values, { keepOpen: true }),
              )}
              disabled={saving}
              className="bg-blue-100 rounded-lg"
            >
              {tm("saveAndAddAnother")}
            </Button>

            <Button
              variant="solid"
              size="sm"
              className="bg-[#1C4FA8] px-6 hover:bg-[#1C4FA8] text-white py-2 rounded-md"
              // onClick={() => handleSave({ keepOpen: false })}
              onClick={handleSubmit((values) =>
                handleSave(values, { keepOpen: false }),
              )}
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

export default AddEditCategoryModal;
