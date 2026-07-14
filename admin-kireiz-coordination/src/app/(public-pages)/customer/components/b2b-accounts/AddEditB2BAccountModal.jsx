"use client";

import { useEffect, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormItem } from "@/components/ui/Form";
import { FiEye, FiEyeOff } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiCreateB2BAccount,
  apiUpdateB2BAccount,
} from "@/services/B2BAccountService";

const tierOptions = [
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "bronze", label: "Bronze" },
];

const selectStyles = {
  control: (base) => ({
    ...base,
    borderRadius: "6px",
    borderColor: "#CBD5E1",
    minHeight: "38px",
    boxShadow: "none",
    "&:hover": { borderColor: "#1C2C56" },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const validationSchema = z
  .object({
    name: z.string().min(1, "Name is required"),

    companyName: z.string().optional(),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),

    mobile: z.string().optional(),

    tier: z.any().nullable().optional(),

    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (mode === "add" && !data.password?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required",
      });
    }
  });

const AddEditB2BAccountModal = ({
  isOpen,
  onClose,
  mode = "add",
  initialData,
  onSaveSuccess,
}) => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [tier, setTier] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: "",
      companyName: "",
      email: "",
      mobile: "",
      tier: null,
      password: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && initialData) {
      reset({
        name: initialData.name || "",
        companyName: initialData.company_name || "",
        email: initialData.email || "",
        mobile: initialData.mobile || "",
        tier: tierOptions.find((t) => t.value === initialData.tier) || null,
        password: "",
      });
    } else {
      reset({
        name: "",
        companyName: "",
        email: "",
        mobile: "",
        tier: null,
        password: "",
      });
    }
    setShowPassword(false);
    setError("");
  }, [mode, initialData, isOpen]);

  const onSubmit = async (values) => {
    setSaving(true);

    try {
      const payload = {
        name: values.name.trim(),
        company_name: values.companyName?.trim() || "",
        email: values.email.trim(),
        mobile: values.mobile?.trim() || "",
        tier: values.tier?.value || "",
      };

      if (values.password?.trim()) {
        payload.password = values.password.trim();
      }

      if (mode === "edit" && initialData?.id) {
        await apiUpdateB2BAccount(accessToken, initialData.id, payload);
      } else {
        await apiCreateB2BAccount(accessToken, payload);
      }

      onSaveSuccess?.();
      onClose?.();
    } catch (err) {
      console.error("B2B account save error:", err);
      setError(err?.response?.data?.message || "Failed to save account.");
    } finally {
      setSaving(false);
    }
  };
  // const handleSave = async () => {
  //     if (!name.trim()) {
  //         setError("Name is required");
  //         return;
  //     }
  //     if (!email.trim()) {
  //         setError("Email is required");
  //         return;
  //     }
  //     if (mode === "add" && !password.trim()) {
  //         setError("Password is required for new accounts");
  //         return;
  //     }

  //     setError("");
  //     setSaving(true);

  //     try {
  //         const payload = {
  //             name: name.trim(),
  //             company_name: companyName.trim(),
  //             email: email.trim(),
  //             mobile: mobile.trim(),
  //             tier: tier?.value || "",
  //         };

  //         if (password.trim()) {
  //             payload.password = password.trim();
  //         }

  //         if (mode === "edit" && initialData?.id) {
  //             await apiUpdateB2BAccount(accessToken, initialData.id, payload);
  //         } else {
  //             await apiCreateB2BAccount(accessToken, payload);
  //         }

  //         if (onSaveSuccess) {
  //             onSaveSuccess();
  //         }
  //     } catch (err) {
  //         console.error("B2B account save error:", err);
  //         setError(err?.response?.data?.message || "Failed to save account. Please try again.");
  //     } finally {
  //         setSaving(false);
  //     }
  // };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      className="w-full md:min-w-[520px] mx-auto"
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="border-b p-3 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#1C2C56]">
            {mode === "edit" ? "Edit Account" : "Add New Account"}
          </h2>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        {/* Body */}
        <div className="px-5 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="text-[#1C2C56] text-sm font-medium">
              Name<span className="text-red-500">*</span>
            </label>
            <FormItem
              invalid={Boolean(errors.name)}
              errorMessage={errors.name?.message}
            >
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder="Enter name"
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                  />
                )}
              />
            </FormItem>
          </div>

          {/* Company Name */}
          <div>
            <label className="text-[#1C2C56] text-sm font-medium">
              Company Name
            </label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. HP Pvt Ltd"
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[#1C2C56] text-sm font-medium">
                Email<span className="text-red-500">*</span>
              </label>
              <FormItem
                invalid={Boolean(errors.email)}
                errorMessage={errors.email?.message}
              >
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      placeholder="john@example.com"
                      className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                    />
                  )}
                />
              </FormItem>
            </div>

            <div>
              <label className="text-[#1C2C56] text-sm font-medium">
                Mobile
              </label>
              <FormItem
                invalid={Boolean(errors.mobile)}
                errorMessage={errors.mobile?.message}
              >
                <Controller
                  name="mobile"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      placeholder="9763880909"
                      className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                    />
                  )}
                />
              </FormItem>
            </div>
          </div>

          {/* Tier Select */}
          <div>
            <label className="text-[#1C2C56] text-sm font-medium">Tier</label>
            <Select
              value={tier}
              onChange={setTier}
              options={tierOptions}
              placeholder="Select Tier"
              styles={selectStyles}
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
              }
              className="mt-1"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-[#1C2C56] text-sm font-medium">
              Password
              {mode === "add" && <span className="text-red-500">*</span>}
            </label>
            <div className="relative mt-1">
              {/* <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={mode === "edit" ? "Leave blank to keep current" : "Enter password"}
                                className="w-full border rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                            /> */}
              <FormItem
                invalid={Boolean(errors.password)}
                errorMessage={errors.password?.message}
              >
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder={
                        mode === "edit"
                          ? "Leave blank to keep current"
                          : "Enter password"
                      }
                      className="w-full border rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                    />
                  )}
                />
              </FormItem>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1C2C56]"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {mode === "edit" && (
              <p className="text-xs text-[#94A3B8] mt-1">
                Leave blank to keep the current password
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end sm:flex-row flex-col gap-3">
          <Button variant="plain" onClick={onClose} size="sm" disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="solid"
            size="sm"
            className="bg-[#1C4FA8] px-6 hover:bg-[#1C2C56] text-white py-2 rounded-md"
            // onClick={handleSave}
            onClick={handleSubmit(onSubmit)}
            loading={saving}
          >
            {/* {mode === "edit" ? "Update" : "Save"} */}
            {mode === "edit" ? "Update" : "Create Account"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default AddEditB2BAccountModal;
