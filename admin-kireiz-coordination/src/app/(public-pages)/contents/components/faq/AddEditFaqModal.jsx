"use client";

import { useEffect, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiCreateFaq, apiUpdateFaq } from "@/services/FaqService";

const faqSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  descriptions: z
    .array(
      z.object({
        description: z.string().trim().min(1, "Description is required"),
      }),
    )
    .min(1, "At least one description is required"),
});

const AddEditFaqModal = ({
  isOpen,
  onClose,
  mode = "add",
  initialData,
  onSaveSuccess,
}) => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [title, setTitle] = useState("");
  const [descriptions, setDescriptions] = useState([{ description: "" }]);

  // Save state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      title: "",
      descriptions: [{ description: "" }],
    },
  });

  const watchedDescriptions = watch("descriptions");

  /* ---------- RESET / PREFILL ---------- */
  useEffect(() => {
    if (!isOpen) return;

    // if (mode === "edit" && initialData) {
    //   setTitle(initialData.title || "");
    //   if (initialData.descriptions?.length > 0) {
    //     setDescriptions(
    //       initialData.descriptions.map((d) => ({ description: d.description || "" }))
    //     );
    //   } else {
    //     setDescriptions([{ description: "" }]);
    //   }
    // } else {
    //   setTitle("");
    //   setDescriptions([{ description: "" }]);
    // }

    if (mode === "edit" && initialData) {
      reset({
        title: initialData.title || "",
        descriptions:
          initialData.descriptions?.length > 0
            ? initialData.descriptions.map((d) => ({
                description: d.description || "",
              }))
            : [{ description: "" }],
      });
    } else {
      reset({
        title: "",
        descriptions: [{ description: "" }],
      });
    }

    setError("");
  }, [mode, initialData, isOpen, reset]);

  /* ---------- DESCRIPTIONS HANDLERS ---------- */
  const handleDescriptionChange = (index, value) => {
    setDescriptions((prev) => {
      const updated = [...prev];
      updated[index] = { description: value };
      return updated;
    });
  };
  const addDescription = () => {
    setValue("descriptions", [...watchedDescriptions, { description: "" }]);
  };

  const removeDescription = (index) => {
    if (watchedDescriptions.length <= 1) return;

    setValue(
      "descriptions",
      watchedDescriptions.filter((_, i) => i !== index),
    );
  };
  /* ---------- RESET FORM ---------- */
  const resetForm = () => {
    reset({
      title: "",
      descriptions: [{ description: "" }],
    });
    setError("");
  };
  /* ---------- SAVE ---------- */
  const handleSave = async (values, { keepOpen = false } = {}) => {
    setError("");
    setSaving(true);

    const payload = {
      title: values.title.trim(),
      // descriptions: values.validDescriptions.map((d) => ({
      //   description: d.description.trim(),
      // })),
      descriptions: values.descriptions.map((d) => ({
        description: d.description.trim(),
      })),
    };

    try {
      // if (mode === "edit" && initialData?.id) {
      //   await apiUpdateFaq(accessToken, initialData.id, payload);
      // } else {
      //   await apiCreateFaq(accessToken, payload);
      // }

      const response =
        mode === "edit" && initialData?.id
          ? await apiUpdateFaq(accessToken, initialData.id, payload)
          : await apiCreateFaq(accessToken, payload);

      toast.push(
        <Notification title="Success" type="success">
          {response?.message}
        </Notification>,
      );

      if (keepOpen && mode !== "edit") {
        resetForm();
        onSaveSuccess?.();
        return;
      }

      onSaveSuccess?.();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to save FAQ. Please try again.",
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
      <div className="flex flex-col">
        <div className="border-b p-2 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-[#1C2C56]">
            {mode === "edit" ? "Edit FAQ" : "Create FAQ"}
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
            <label className="text-[#1C2C56] text-base font-medium">
              Title<span className="text-red-500">*</span>
            </label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Type your question"
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                />
              )}
            />

            {errors.title && (
              <p className="text-red-500 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Descriptions (dynamic list) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[#1C2C56] text-base font-medium">
                Descriptions<span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addDescription}
                className="text-[#1C2C56] text-sm font-medium flex items-center gap-1 hover:text-[#0F172A]"
              >
                <FiPlus size={14} />
                Add More
              </button>
            </div>

            <div className="space-y-3">
              {watchedDescriptions.map((_, index) => (
                <div key={index}>
                  <div className="flex gap-2">
                    <Controller
                      name={`descriptions.${index}.description`}
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          placeholder="Type Description"
                          className="flex-1 border rounded-md px-3 py-2 text-sm h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                        />
                      )}
                    />

                    {watchedDescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDescription(index)}
                        className="text-red-500 hover:text-red-700 p-2 self-start rounded hover:bg-red-50"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>

                  {errors.descriptions?.[index]?.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.descriptions[index].description.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
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
            className="bg-[#1C4FA8] px-6 hover:bg-[#1C4FA8] text-white py-2 rounded-md"
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
    </Dialog>
  );
};

export default AddEditFaqModal;
