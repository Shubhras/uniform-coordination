"use client";

import { useEffect, useRef, useState } from "react";
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

const validationSchema = z.object({
  templateName: z.string().trim().min(1, {
    message: "Template name is required",
  }),

  part: z.any().refine((val) => val !== null, {
    message: "Part is required",
  }),

  partUsageCount: z.string().trim().min(1, {
    message: "Part usage count is required",
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
    color: state.isSelected ? "white" : "#1C2C56",
    fontSize: "14px",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const AddEditTemplateModal = ({
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
  const [templateName, setTemplateName] = useState("");
  const [part, setPart] = useState(null);
  const [partUsageCount, setPartUsageCount] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Part options from API
  const [partOptions, setPartOptions] = useState([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [validated, setValidated] = useState(false);
  const [imageError, setImageError] = useState("");
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

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
      partUsageCount: "",
    },
  });

  // Save state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ---------- FETCH PARTS ---------- */
  useEffect(() => {
    if (!isOpen || !accessToken) return;

    const fetchParts = async () => {
      setLoadingParts(true);
      try {
        const response = await apiGetPartsList(accessToken, 1, 100);
        if (response?.status && response?.data) {
          const options = response.data
            .filter((p) => !p.isDeleted)
            .map((p) => ({
              value: p.id,
              label: p.partName,
            }));
          setPartOptions(options);
        }
      } catch (err) {
        console.error("Failed to load parts:", err);
      } finally {
        setLoadingParts(false);
      }
    };

    fetchParts();
  }, [isOpen, accessToken]);

  /* ---------- RESET / PREFILL ---------- */
  useEffect(() => {
    if (!isOpen) return;

    // if (mode === "edit" && initialData) {
    //   setTemplateName(initialData.templateName || "");
    //   setPartUsageCount(initialData.partUsageCount?.toString() || "");
    //   setIsActive(initialData.isActive ?? true);
    //   setImageFile(null);
    //   setPreview(initialData.templateImage || null);

    //   if (initialData.part) {
    //     setPart({
    //       value: initialData.part,
    //       label: initialData.partName || `Part #${initialData.part}`,
    //     });
    //   } else {
    //     setPart(null);
    //   }
    // }
    if (mode === "edit" && initialData) {
      reset({
        templateName: initialData.templateName || "",
        part: null,
        partUsageCount: initialData.partUsageCount?.toString() || "",
      });

      setIsActive(initialData.isActive ?? true);
      setImageFile(null);
      setPreview(initialData.templateImage || null);
      setValidated(!!initialData.templateImage);
    } else {
      // setTemplateName("");
      // setPart(null);
      // setPartUsageCount("");

      reset({
        templateName: "",
        part: null,
        partUsageCount: "",
      });

      setIsActive(true);
      setImageFile(null);
      setPreview(null);
      setValidated(false);
    }
    setError("");
  }, [isOpen, mode, initialData, reset, setValue]);

  // Update part label once partOptions load (edit mode)
  useEffect(() => {
    if (mode === "edit" && initialData?.part && partOptions.length > 0) {
      const match = partOptions.find((p) => p.value === initialData.part);
      if (match) {
        // setPart(match);
        setValue("part", match);
      }
    }
  }, [partOptions, mode, initialData]);

  /* ---------- FILE HANDLER ---------- */
  const handleFile = (file) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setImageError("Image size should not exceed 2 MB");
      setImageFile(null);
      setPreview(null);
      setValidated(false);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
      return;
    }
    setImageError("");
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setValidated(true);
  };

  /* ---------- SAVE ---------- */
  const handleSave = async (values) => {
    // if (!templateName.trim()) {
    //   setError("Template name is required");
    //   return;
    // }

    setError("");
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("templateName", values.templateName);

      if (values.part) {
        formData.append("part", values.part.value);
      }

      if (values.partUsageCount) {
        formData.append("partUsageCount", values.partUsageCount);
      }
      formData.append("isActive", isActive);

      if (imageFile) {
        formData.append("templateImage", imageFile);
      }

      // if (mode === "edit" && initialData?.id) {
      //   await apiUpdateTemplate(accessToken, initialData.id, formData);
      // } else {
      //   await apiCreateTemplate(accessToken, formData);
      // }

      const response =
        mode === "edit" && initialData?.id
          ? await apiUpdateTemplate(accessToken, initialData.id, formData)
          : await apiCreateTemplate(accessToken, formData);

      toast.push(
        <Notification title="Success" type="success">
          {response?.message}
        </Notification>,
      );

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err) {
      console.error("Template save error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to save template. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      className="w-full md:min-w-[600px]"
      contentClassName="!p-0 !h-auto"
    >
      <Form onSubmit={handleSubmit(handleSave)}>
        <div className="flex flex-col">
          <div className="border-b px-6 py-4">
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              {mode === "edit" ? "Edit Template" : "Create Template"}
            </h2>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Template Name */}
            <div>
              <label className="text-base font-medium text-[#1C2C56]">
                Template Name<span className="text-red-500">*</span>
              </label>
              {/* <input
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="Enter template name"
                            className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                        /> */}
              <FormItem
                invalid={Boolean(errors.templateName)}
                errorMessage={errors.templateName?.message}
              >
                <Controller
                  name="templateName"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="Enter template name" {...field} />
                  )}
                />
              </FormItem>
            </div>

            {/* Part (from API) */}
            <div>
              <label className="text-base font-medium text-[#1C2C56]">
                Part
              </label>
              {/* <Select
              options={partOptions}
              value={part}
              onChange={setPart}
              styles={selectStyles}
              placeholder="Select Part"
              isLoading={loadingParts}
              loadingMessage={() => "Loading parts..."}
              noOptionsMessage={() => "No parts found"}
              isClearable
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
              }
              menuPosition="fixed"
              className="mt-1"
            /> */}
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
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Part"
                      isLoading={loadingParts}
                      isClearable
                    />
                  )}
                />
              </FormItem>
            </div>

            {/* Part Usage Count */}
            <div>
              <label className="text-base font-medium text-[#1C2C56]">
                Part Usage Count
              </label>
              {/* <input
              type="number"
              min="0"
              value={partUsageCount}
              onChange={(e) => setPartUsageCount(e.target.value)}
              className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
              placeholder="e.g. 5"
            /> */}

              {/* <Controller
                name="partUsageCount"
                control={control}
                render={({ field }) => (
                  <Input type="number" placeholder="e.g. 5" {...field} />
                )}
              /> */}

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
                      min={0}
                      placeholder="e.g. 5"
                      {...field}
                    />
                  )}
                />
              </FormItem>
            </div>

            {/* Status */}
            <div>
              <label className="text-base font-medium text-[#1C2C56]">
                Status
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
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Template Image */}
            <div>
              <label className="text-base font-medium text-[#1C2C56]">
                Template Image
              </label>

              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="mt-2 w-full bg-[#1C4FA8] text-white py-2 rounded-md text-sm flex items-center justify-center gap-2"
              >
                <FiUpload size={16} />
                Upload Image
              </button>
              {imageError && (
                <p className="text-red-500 text-sm mt-1">{imageError}</p>
              )}
              {validated && (
                <div className="mb-2 flex items-center gap-2 text-sm text-green-600 font-medium">
                  <FiCheckCircle className="text-green-600" size={16} />
                  <span>Image validated successfully</span>
                </div>
              )}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="mt-3 border-2 border-dashed rounded-md p-6 text-center text-sm text-[#486284] bg-[#D9D9D933]"
              >
                Drag & Drop your image file here
                <br />
                or{" "}
                <span
                  className="text-[#1C2C56] underline cursor-pointer"
                  onClick={() => fileRef.current.click()}
                >
                  click to browse here
                </span>
                <p className="text-xs mt-2 text-[#64748B]">
                  PNG, JPG, JPEG files
                </p>
                <p className="text-xs mt-2 text-[#64748B]">
                  Maximum dimension 1000×1000px
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
              Cancel
            </Button>
            <Button
              variant="solid"
              type="submit"
              size="sm"
              className="bg-[#1C4FA8] px-6 hover:bg-[#1C2C56] text-white py-2 rounded-md"
              // onClick={handleSave}
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

export default AddEditTemplateModal;
