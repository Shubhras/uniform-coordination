"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Select from "react-select";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormItem } from "@/components/ui/Form";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import Input from "@/components/ui/Input";
import { apiCreateColor, apiUpdateColor } from "@/services/ColorsService";

const fabricOptions = [
  { value: "cotton", label: "Cotton" },
  { value: "polyester", label: "Polyester" },
  { value: "silk", label: "Silk" },
  { value: "linen", label: "Linen" },
];

const AddEditColorModal = ({
  isOpen,
  onClose,
  mode = "add",
  initialData,
  onSaveSuccess,
}) => {
  const t = useTranslations("productSpecification.colors");
  const tm = useTranslations("productSpecification.colors.addColorModal");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [hex, setHex] = useState("#000000");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const validationSchema = z.object({
    name: z.string().trim().min(1, {
      message: tm("validation.nameRequired"),
    }),
    hex: z
      .string()
      .trim()
      .min(1, {
        message: tm("validation.hexRequired"),
      }),
    compatibleFabric: z.any().optional(),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: "",
      hex: "#000000",
      compatibleFabric: [],
    },
  });

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

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      const hexVal = initialData.colorCode || "#000000";
      setHex(hexVal);

      const fabricObjs = (initialData.compatibleFabric || []).map((f) => {
        const matched = fabricOptions.find(
          (opt) => opt.value === f.toLowerCase(),
        );
        return matched || { value: f.toLowerCase(), label: f };
      });

      reset({
        name: initialData.colorName || "",
        hex: hexVal,
        compatibleFabric: fabricObjs,
      });
    } else {
      setHex("#000000");
      reset({
        name: "",
        hex: "#000000",
        compatibleFabric: [],
      });
    }
    setError("");
  }, [mode, initialData, isOpen, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setError("");
    setSaving(true);

    try {
      const payload = {
        colorName: values.name.trim(),
        colorCode: hex || values.hex,
        compatibleFabric: (values.compatibleFabric || []).map((f) => f.label),
      };

      let response;
      if (mode === "edit" && initialData?.id) {
        response = await apiUpdateColor(accessToken, initialData.id, payload);
      } else {
        response = await apiCreateColor(accessToken, payload);
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
          <div className="border-b px-6 py-4">
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              {mode === "edit" ? tm("editModalTitle") : tm("modalTitle")}
            </h2>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="text-[#1C2C56] text-sm font-medium">
                {tm("colorNameLabel")}<span className="text-red-500">*</span>
              </label>

              <FormItem
                invalid={Boolean(errors.name)}
                errorMessage={errors.name?.message}
              >
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder={tm("colorNamePlaceholder")} {...field} />
                  )}
                />
              </FormItem>
            </div>

            <div className="flex gap-4 items-center">
              <div>
                <label className="text-[#1C2C56] text-sm font-medium block">
                  {tm("colorLabel")}
                </label>
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="mt-1 h-10 w-16 p-1 border rounded-md cursor-pointer"
                />
              </div>

              <div className="flex-1">
                <label className="text-[#1C2C56] text-sm font-medium">
                  {tm("hexCodeLabel")}
                </label>
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="mt-1 w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[#1C2C56] text-sm font-medium">
                {tm("compatibleFabricsLabel")}
              </label>
              <FormItem
                invalid={Boolean(errors.compatibleFabric)}
                errorMessage={errors.compatibleFabric?.message}
              >
                <Controller
                  name="compatibleFabric"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      isMulti
                      options={fabricOptions}
                      value={field.value}
                      onChange={field.onChange}
                      styles={selectStyles}
                      placeholder={tm("compatibleFabricsPlaceholder")}
                      noOptionsMessage={() => "No fabrics found"}
                      menuPortalTarget={
                        typeof document !== "undefined" ? document.body : null
                      }
                      menuPosition="fixed"
                      closeMenuOnSelect={false}
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
              type="submit"
              variant="solid"
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

export default AddEditColorModal;
