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

const AddEditTemplateModal = ({
  isOpen,
  onClose,
  mode = "add",
  initialData,
  onSaveSuccess,
}) => {
  const t = useTranslations("productSpecification.template");
  const tm = useTranslations("productSpecification.template.createTemplateModal");
  const fileRef = useRef(null);
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [partOptions, setPartOptions] = useState([]);
  const [loadingParts, setLoadingParts] = useState(false);

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
    templateName: z.string().trim().min(1, {
      message: tm("validation.nameRequired"),
    }),
    part: z.any().optional(),
    partUsageCount: z.string().optional(),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      templateName: "",
      part: null,
      partUsageCount: "1",
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

    fetchParts();
  }, [isOpen, accessToken]);

  /* ---------- PREFILL ON EDIT ---------- */
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      setIsActive(initialData.isActive ?? true);
      setPreview(initialData.templateImage || null);

      const matchedPart = partOptions.find(
        (p) => p.value === initialData.part,
      );

      reset({
        templateName: initialData.templateName || "",
        part: matchedPart || null,
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
        partUsageCount: "1",
      });
    }

    setError("");
    setImageError("");
  }, [mode, initialData, isOpen, partOptions, reset]);

  /* ---------- FILE HANDLERS ---------- */
  const handleFile = (file) => {
    setImageError("");
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setImageError("Only PNG, JPG, JPEG files are allowed.");
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      if (img.width > 1000 || img.height > 1000) {
        setImageError("Maximum dimension allowed is 1000x1000px.");
        URL.revokeObjectURL(objectUrl);
        return;
      }

      setImageFile(file);
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

      formData.append("partUsageCount", parseInt(values.partUsageCount || "1", 10));
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
      setError(
        err?.response?.data?.message || tm("saveFailed"),
      );
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
                {tm("templateNameLabel")}<span className="text-red-500">*</span>
              </label>
              <FormItem
                invalid={Boolean(errors.templateName)}
                errorMessage={errors.templateName?.message}
              >
                <Controller
                  name="templateName"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder={tm("templateNamePlaceholder")} {...field} />
                  )}
                />
              </FormItem>
            </div>

            {/* Part */}
            <div>
              <label className="text-base font-medium text-[#1C2C56]">
                {tm("partLabel")}
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

            {/* Part Usage Count */}
            <div>
              <label className="text-base font-medium text-[#1C2C56]">
                {tm("partUsageCountLabel")}
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
            <div>
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
