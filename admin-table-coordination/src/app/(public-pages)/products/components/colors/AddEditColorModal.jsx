"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { apiCreateColor, apiUpdateColor } from "@/services/ColorsService";

const AddEditColorModal = ({
  isOpen,
  onClose,
  mode = "add",
  initialData,
  onSaveSuccess,
}) => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const t = useTranslations("productSpecification.color");
  const tm = useTranslations("productSpecification.materials");
  const ts = useTranslations("successTitle");
  const te = useTranslations("errorTitle");

  const fabricOptions = [
    { value: "cotton", label: tm("cotton") },
    { value: "polyester", label: tm("polyester") },
    { value: "silk", label: tm("silk") },
    { value: "linen", label: tm("linen") },
  ];

  const validationSchema = z.object({
    name: z
      .string()
      .trim()
      .min(1, {
        message: t("validation.colorNameRequired"),
      }),

    hex: z
      .string()
      .trim()
      .min(1, {
        message: t("validation.colorCodeRequired"),
      })
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
        message: t("validation.validHexCode"),
      }),

    compatibleFabric: z.any().refine((val) => val?.length > 0, {
      message: t("validation.compatibleFabricRequired"),
    }),
  });

  const [name, setName] = useState("");
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
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
      minHeight: "40px",
      borderRadius: "6px",
      borderColor: state.isFocused ? "#1C2C56" : "#E2E8F0",
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
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#EEF2FF",
      borderRadius: "6px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#1C2C56",
      fontSize: "13px",
      fontWeight: 500,
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#1C2C56",
      "&:hover": {
        backgroundColor: "#1C2C56",
        color: "white",
      },
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  // Reset / prefill form on open
  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && initialData) {
      const preSelected =
        initialData.compatibleFabric?.map((fabric) => {
          const match = fabricOptions.find((opt) => opt.value === fabric);

          return (
            match || {
              value: fabric,
              label: fabric.charAt(0).toUpperCase() + fabric.slice(1),
            }
          );
        }) || [];

      reset({
        name: initialData.colorName || "",
        hex: initialData.colorCode || "#000000",
        compatibleFabric: preSelected,
      });
    } else {
      reset({
        name: "",
        hex: "#000000",
        compatibleFabric: [],
      });
    }
    setError("");
  }, [mode, initialData, isOpen]);

  const handleSave = async (values) => {
    if (!values.name.trim()) {
      setError(t("validation.colorNameRequired"));
      return;
    }

    if (!values.hex.trim()) {
      setError(t("validation.colorCodeRequired"));
      return;
    }

    setError("");
    setSaving(true);

    const payload = {
      colorName: values.name.trim(),
      colorCode: values.hex,
      compatibleFabric: values.compatibleFabric.map((f) => f.value),
    };

    try {
      if (mode === "edit" && initialData?.id) {
        const response = await apiUpdateColor(
          accessToken,
          initialData.id,
          payload,
        );

        if (!response.status) {
          const errorMessage = Object.values(response.message || {}).flat()[0];

          toast.push(
            <Notification title={te("error")} type="danger">
              {errorMessage}
            </Notification>,
          );

          return;
        }

        toast.push(
          <Notification title={ts("success")} type="success">
            {response.message}
          </Notification>,
        );
      } else {
        const response = await apiCreateColor(accessToken, payload);

        if (!response.status) {
          const errorMessage = Object.values(response.message || {}).flat()[0];

          toast.push(
            <Notification title={te("error")} type="danger">
              {errorMessage}
            </Notification>,
          );

          return;
        }

        toast.push(
          <Notification title={ts("success")} type="success">
            {response.message}
          </Notification>,
        );
      }

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err) {
      console.error("Color save error:", err);
      setError(
        err?.response?.data?.message ||
          t("saveFailed"),
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
      className="w-full md:min-w-[520px] mx-auto"
    >
      <Form onSubmit={handleSubmit(handleSave)}>
        <div className="flex flex-col">
          <div className="border-b px-6 py-4">
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              {mode === "edit" ? t("editColor") : t("addNewColor")}
            </h2>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          <div className="px-5 py-5 space-y-5">
            <div>
              <label className="text-[#1C2C56] text-sm font-medium">
                {t("colorName")}
                <span className="text-red-500">*</span>
              </label>
              <FormItem
                invalid={Boolean(errors.name)}
                errorMessage={errors.name?.message}
              >
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder={t("enterColorname")} />
                  )}
                />
              </FormItem>
            </div>

            <div className="flex gap-4 items-end">
              <Controller
                name="hex"
                control={control}
                render={({ field }) => (
                  <>
                    <div className="flex flex-col">
                      <label className="text-[#1C2C56] text-sm font-medium">
                        {t("color")}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="color"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="mt-1 h-10 w-16 p-1 border rounded-md cursor-pointer"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="text-[#1C2C56] text-sm font-medium">
                        {t("hexCode")}
                      </label>

                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                        className="mt-1 w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                  </>
                )}
              />
            </div>

            <div>
              <label className="text-[#1C2C56] text-sm font-medium">
                {t("compatibleFabric")}
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
                      placeholder={t("selectFabric")}
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
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              variant="solid"
              size="sm"
              className="bg-[#A0522D] px-6 hover:bg-[#A0522D] text-white py-2 rounded-md"
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

export default AddEditColorModal;
