"use client";

import { useEffect, useState, useRef } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { FiUpload } from "react-icons/fi";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { Controller, useForm } from "react-hook-form";
import { Form, FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiCreateCategory,
  apiUpdateCategory,
} from "@/services/CategoryService";

const categorySchema = (mode) =>
  z.object({
    categoryName: z.string().trim().min(1, "Category name is required"),

    description: z.string().trim().min(1, "Description is required"),

    image:
      mode === "add"
        ? z.any().refine((file) => file instanceof File, {
            message: "Image is required",
          })
        : z.any().optional(),
  });

const AddEditCategoryModal = ({
  isOpen,
  onClose,
  mode = "add",
  initialData,
  onSaveSuccess,
}) => {
  const fileInputRef = useRef(null);
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [validated, setValidated] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
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
          <Notification title="Success" type="success">
            {response.message}
          </Notification>,
        );
      } else {
        const response = await apiCreateCategory(accessToken, formData);

        toast.push(
          <Notification title="Success" type="success">
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
              {mode === "edit" ? "Edit Category" : "Create Category"}
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
                Name<span className="text-red-500">*</span>
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
                    <Input placeholder="Eg:- Medical Surgeon" {...field} />
                  )}
                />
              </FormItem>
            </div>

            {/* Image */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                Image<span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                className="w-full bg-[#A0522D] text-white py-2 rounded-md text-sm mt-2 flex items-center justify-center gap-2"
                onClick={() => fileInputRef.current.click()}
              >
                <FiUpload size={16} />
                Upload image
              </button>

              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="mt-3 border-2 border-dashed rounded-md p-6 text-center text-sm text-[#486284] bg-[#D9D9D933]"
              >
                Drag & Drop your image file here
                <br />
                or{" "}
                <span
                  className="text-[#A0522D] underline cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  click to browse here
                </span>
                <p className="text-xs mt-2 text-[#64748B]">
                  JPG, PNG, or WEBP files
                </p>
                <p className="text-xs mt-2 text-[#64748B]">
                  Maximum dimension 1000×1000px
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
                ✔ Image validated successfully
              </p>
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

            {/* Description */}
            <div>
              <label className="text-[#1C2C56] text-base font-medium">
                Description
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
                      placeholder="Type..."
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
              Cancel
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
              Save & Add Another
            </Button>

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
              {mode === "edit" ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </Form>
    </Dialog>
  );
};

export default AddEditCategoryModal;
