"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import { apiCreateColor, apiUpdateColor } from "@/services/ColorsService";

const validationSchema = z.object({
  name: z.string().trim().min(1, {
    message: "Color name is required",
  }),

  hex: z
    .string()
    .trim()
    .min(1, {
      message: "Color code is required",
    })
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: "Enter a valid HEX code",
    }),

  compatibleFabric: z.any().refine((val) => val?.length > 0, {
    message: "Compatible fabric is required",
  }),
});

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
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [name, setName] = useState("");
  const [hex, setHex] = useState("#000000");
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

    // if (mode === "edit" && initialData) {

    // Pre-select compatible fabrics
    // if (initialData.compatibleFabric && Array.isArray(initialData.compatibleFabric)) {
    //     const preSelected = initialData.compatibleFabric.map((f) => {
    //         const match = fabricOptions.find((opt) => opt.value === f.id || opt.label === f.fabricName);
    //         if (match) return match;
    //         return { value: f.id, label: f.fabricName || String(f.id) };
    //     });
    //     setSelectedFabrics(preSelected);
    // } else {
    //     setSelectedFabrics([]);
    // }
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
      setError("Color name is required");
      return;
    }

    if (!values.hex.trim()) {
      setError("Color code is required");
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
        await apiUpdateColor(accessToken, initialData.id, payload);
      } else {
        await apiCreateColor(accessToken, payload);
      }

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err) {
      console.error("Color save error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to save color. Please try again.",
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
              {mode === "edit" ? "Edit Color" : "Add New Color"}
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
                Color Name<span className="text-red-500">*</span>
              </label>
              {/* <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter color name"
                            className="mt-1 w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#1C2C56]"
                        /> */}
              <FormItem
                invalid={Boolean(errors.name)}
                errorMessage={errors.name?.message}
              >
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Enter color name" />
                  )}
                />
              </FormItem>
            </div>

            <div className="flex gap-4 items-end">
              <div className="flex flex-col">
                <label className="text-[#1C2C56] text-sm font-medium">
                  Color<span className="text-red-500">*</span>
                </label>
                {/* <input
                  type="color"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="mt-1 h-10 w-16 p-1 border rounded-md cursor-pointer"
                /> */}
                <Controller
                  name="hex"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="color"
                      {...field}
                      className="mt-1 h-10 w-16 p-1 border rounded-md cursor-pointer"
                    />
                  )}
                />
              </div>

              <div className="flex-1">
                <label className="text-[#1C2C56] text-sm font-medium">
                  HEX Code
                </label>
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="mt-1 w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-sm"
                />

                {/* <FormItem
                  invalid={Boolean(errors.hex)}
                  errorMessage={errors.hex?.message}
                >
                  <Controller
                    name="hex"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="#000000" />
                    )}
                  />
                </FormItem> */}
              </div>
            </div>

            {/* Compatible Fabrics — Static multi-select */}
            <div>
              <label className="text-[#1C2C56] text-sm font-medium">
                Compatible Fabrics
              </label>
              {/* <Select
                            isMulti
                            options={fabricOptions}
                            value={selectedFabrics}
                            onChange={setSelectedFabrics}
                            styles={selectStyles}
                            placeholder="Select compatible fabrics..."
                            noOptionsMessage={() => "No fabrics found"}
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                            menuPosition="fixed"
                            className="mt-1"
                            closeMenuOnSelect={false}
                        /> */}
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
                      placeholder="Select compatible fabrics..."
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
              Cancel
            </Button>
            <Button
              type="submit"
              variant="solid"
              size="sm"
              className="bg-[#1C4FA8] px-6 hover:bg-[#1C2C56] text-white py-2 rounded-md"
              //   onClick={handleSave}
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

export default AddEditColorModal;
