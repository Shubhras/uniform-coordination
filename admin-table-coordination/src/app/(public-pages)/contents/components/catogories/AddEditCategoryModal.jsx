"use client";

import { useEffect, useState, useRef } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { FiUpload, FiCheckCircle } from "react-icons/fi";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "@/components/ui/toast";
import { useTranslations } from "next-intl";
import Notification from "@/components/ui/Notification";
import { Controller, useForm } from "react-hook-form";
import { Form, FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiCreateCategory,
  apiUpdateCategory,
} from "@/services/CategoryService";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

const AddEditCategoryModal = ({
  isOpen,
  onClose,
  mode = "add",
  initialData,
  onSaveSuccess,
  ss,
}) => {
  const fileInputRef = useRef(null);
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const t = useTranslations("contentMedia.categories");
  const ts = useTranslations("successTitle");
  const te = useTranslations("errorTitle");

  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [validated, setValidated] = useState(false);
  const categorySchema = (mode) =>
    z.object({
      categoryName: z
        .string()
        .trim()
        .min(1, t("categoryValidation.categoryNameRequired")),

      description: z
        .string()
        .trim()
        .min(1, t("categoryValidation.descriptionRequired")),

      image:
        mode === "add"
          ? z
            .any()
            .refine((file) => Boolean(file), {
              message: t("categoryValidation.imageRequired"),
            })
            .refine(
              (file) =>
                !file ||
                !(file instanceof File) ||
                file.size <= MAX_IMAGE_SIZE,
              {
                message: t("categoryValidation.imageSizeLimit"),
              },
            )
          : z
            .any()
            .refine(
              (file) =>
                !file ||
                !(file instanceof File) ||
                file.size <= MAX_IMAGE_SIZE,
              {
                message: t("categoryValidation.imageSizeLimit"),
              },
            )
            .optional(),
    });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError: setFormError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema(mode)),
    defaultValues: {
      categoryName: "",
      description: "",
      image: null,
    },
  });

  // Save state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");


  /* ---------- RESET / PREFILL ---------- */
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      // setCategoryName(initialData.categoryName || initialData.name || "");
      // setDescription(initialData.description || "");
      setPreview(initialData.categoryImage || initialData.image || null);
      setImageFile(null);
      setValidated(Boolean(initialData.categoryImage || initialData.image));
      reset({
        categoryName: initialData.categoryName || initialData.name || "",
        description: initialData.description || "",
        image: null,
      });
    } else {
      // setCategoryName("");
      // setDescription("");
      setImageFile(null);
      setPreview(null);
      setValidated(false);
      reset({
        categoryName: "",
        description: "",
        image: null,
      });
    }
    setError("");
  }, [mode, initialData, isOpen]);

  /* ---------- FILE HANDLERS ---------- */
  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    if (file.size > MAX_IMAGE_SIZE) {
      const errorMsg = t("categoryValidation.imageSizeLimit");
      setImageFile(null);
      setPreview(null);
      setValidated(false);
      setValue("image", null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFormError("image", {
        type: "manual",
        message: errorMsg,
      });
      return;
    }

    clearErrors("image");
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

  /* ---------- RESET ---------- */
  const resetForm = () => {
    // setCategoryName("");
    // setDescription("");
    setImageFile(null);
    setPreview(null);
    setValidated(false);
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

      if (mode === "edit" && initialData?.id) {
        const response = await apiUpdateCategory(
          accessToken,
          initialData.id,
          formData,
        );

        toast.push(
          <Notification title={ts("success")} type="success">
            {response.message}
          </Notification>,
        );
      } else {
        const response = await apiCreateCategory(accessToken, formData);

        toast.push(
          <Notification title={ts("success")} type="success">
            {response.message}
          </Notification>,
        );
      }

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
      setError(
        err?.response?.data?.message ||
        "Failed to save category. Please try again.",
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
      className="w-full md:min-w-[620px] mx-auto"
    >
      <Form onSubmit={handleSubmit(handleSave)}>
        <div className="flex flex-col">
          <div className="border-b p-2 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              {mode === "edit" ? t("editCategory") : t("createCategory")}
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
                {t("name")}
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
                    <Input placeholder={t("categoryNamePlaceholder")} {...field} />
                  )}
                />
              </FormItem>
            </div>

            {/* Image */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {t("image")}
                <span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                className="w-full bg-[#A0522D] text-white py-2 rounded-md text-sm mt-2 flex items-center justify-center gap-2"
                onClick={() => fileInputRef.current.click()}
              >
                <FiUpload size={16} />
                {t("uploadImage")}
              </button>

              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="mt-3 border-2 border-dashed rounded-md p-6 text-center text-sm text-[#486284] bg-[#D9D9D933]"
              >
                {t("drapDrop")}
                <br />
                {/* or{" "} */}
                <span
                  className="text-[#A0522D] underline cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  {t("clickHere")}
                </span>
                <p className="text-xs mt-2 text-[#64748B]">{t("jpgFile")}</p>
                <p className="text-xs mt-2 text-[#64748B]">
                  {t("maxDimension")}
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
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleBrowse}
                />
              </FormItem>
            </div>

            {validated && (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-600 font-medium">
                <FiCheckCircle className="text-green-600" size={16} />
                <span>{t("imageValidation")}</span>
              </div>
            )}
            {preview && (
              <div className="flex justify-center">
                <img
                  src={preview}
                  alt={t("preview")}
                  className="w-32 h-32 object-contain rounded-lg shadow"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                {t("description")}
                <span className="text-red-500">*</span>
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
                      placeholder={t("descriptionPlaceholder")}
                      className="mt-1 w-full border rounded-md px-3 py-2 text-sm h-[90px] resize-none focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                    />
                  )}
                />
              </FormItem>
            </div>
          </div>

          <div className="border-t px-6 py-4 flex justify-end sm:flex-row flex-col gap-3">
            <button
              onClick={onClose}
              size="sm"
              disabled={saving}
              className="h-10 px-5 rounded-md border border-[#E9DDD3] bg-white text-[#6E6258] font-medium hover:bg-[#F8F3EF] transition"
            >
              {t("cancel")}
            </button>

            <button
              size="sm"
              // onClick={() => handleSave({ keepOpen: true })}
              onClick={handleSubmit((values) =>
                handleSave(values, { keepOpen: true }),
              )}
              disabled={saving}
              className="h-10 px-5 rounded-md border border-[#E9DDD3] bg-white text-[#6E6258] font-medium hover:bg-[#F8F3EF] transition"
            >
              {t("addAnother")}
            </button>

            <Button
              variant="solid"
              size="sm"
              className="bg-[#A0522D] px-6 hover:bg-[#A0522D] text-white py-2 rounded-md"
              // onClick={() => handleSave({ keepOpen: false })}
              onClick={handleSubmit((values) =>
                handleSave(values, { keepOpen: false }),
              )}
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

export default AddEditCategoryModal;
