"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";
import { useForm, Controller, get } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormItem } from "@/components/ui/Form";
import { FiEye, FiEyeOff } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiCreateB2BAccount,
  apiUpdateB2BAccount,
} from "@/services/B2BAccountService";
import { apiGetRoleList } from "@/services/PermissionService";



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

const getValidationSchema = (mode, t) =>
  z
    .object({
      name: z.string().min(1, t("validation.nameRequired")),

      companyName: z.string().trim().min(1, t("validation.companyNameRequired")),

      email: z
        .string()
        .min(1, t("validation.emailRequired"))
        .email(t("validation.invalidEmail")),

      mobile: z
        .string()
        .trim()
        .min(1, t("validation.mobileRequired"))
        .regex(/^[6-9]\d{9}$/, t("validation.invalidMobile")),

      tier: z.any().nullable().optional(),

      password: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (mode === "add" && !data.password?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: t("validation.passwordRequired"),
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
  const t = useTranslations("customerSalesRep.b2bAccounts.addAccountModal");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [tier, setTier] = useState(null);
  const [roleOptions, setRoleOptions] = useState([
    { value: 1, label: "Admin", slug: "admin" },
    { value: 2, label: "Sales Representative", slug: "sales" },
  ]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !accessToken) return;
    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const res = await apiGetRoleList(accessToken);
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          // Only administrative roles (admin, manager, editor, operations, accountant, staff, etc.)
          // Exclude sales and customer roles (sales, b2b, b2c, customer)
          const nonAdminRoles = [
            "sales",
            "sales_rep",
            "b2b",
            "b2b_user",
            "b2c",
            "customer",
            "user",
            "corporate",
          ];
          const opts = res.data
            .filter((r) => {
              const roleKey = (r.slug || r.role_name || r.name || "")
                .toLowerCase()
                .trim();
              return !nonAdminRoles.includes(roleKey);
            })
            .map((r) => {
              const rawName = r.role_name || r.name || "";
              const label =
                rawName.length > 0
                  ? rawName.charAt(0).toUpperCase() + rawName.slice(1)
                  : rawName;
              return {
                value: r.id,
                label: label,
                slug: r.slug,
              };
            });
          setRoleOptions(opts);
        }
      } catch (err) {
        console.error("Failed to fetch roles:", err);
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, [isOpen, accessToken]);

  const tierOptions = useMemo(
    () => [
      { value: "corporate", label: "Corporate Standard (Special Pricing)" },
      { value: "wholesale", label: "Wholesale Partner (Special Pricing)" },
      { value: "enterprise", label: "Global Enterprise (Special Pricing)" },
      { value: "gold", label: t("tierOptions.gold") },
      { value: "silver", label: t("tierOptions.silver") },
      { value: "bronze", label: t("tierOptions.bronze") },
    ],
    [t],
  );

  const validationSchema = useMemo(
    () => getValidationSchema(mode, t),
    [mode, t],
  );

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
      const matchRole = roleOptions.find(
        (r) =>
          r.value === initialData.role ||
          (r.label || "").toLowerCase() === (initialData.role_name || "").toLowerCase()
      );
      setSelectedRole(matchRole || (initialData.role_name ? { value: initialData.role, label: initialData.role_name } : roleOptions[0]));
    } else {
      reset({
        name: "",
        companyName: "",
        email: "",
        mobile: "",
        tier: null,
        password: "",
      });
      const defaultRole = roleOptions.find(
        (r) => (r.label || "").toLowerCase() === "admin"
      );
      setSelectedRole(defaultRole || roleOptions[0]);
    }
    setShowPassword(false);
    setError("");
  }, [mode, initialData, isOpen, roleOptions]);

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

      if (selectedRole?.value) {
        payload.role = selectedRole.value;
      }

      if (values.password?.trim()) {
        payload.password = values.password.trim();
      }

      const response =
        mode === "edit" && initialData?.id
          ? await apiUpdateB2BAccount(accessToken, initialData.id, payload)
          : await apiCreateB2BAccount(accessToken, payload);

      toast.push(
        <Notification title="Success" type="success">
          {response?.message}
        </Notification>,
      );

      onSaveSuccess?.();
      onClose?.();
    } catch (err) {
      console.error("B2B account save error:", err);

      const fieldErrors = err?.response?.data?.errors;
      const fieldErrorMessage =
        fieldErrors && typeof fieldErrors === "object"
          ? Object.values(fieldErrors).flat().join(" ")
          : "";

      setError(
        fieldErrorMessage ||
        err?.response?.data?.message ||
        "Failed to save account.",
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
      <div className="flex flex-col">
        {/* Header */}
        <div className="border-b p-3 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#1C2C56]">
            {mode === "edit" ? t("editModalTitle") : t("modalTitle")}
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
              {t("nameLabel")}<span className="text-red-500">*</span>
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
                    placeholder={t("namePlaceholder")}
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                  />
                )}
              />
            </FormItem>
          </div>

          {/* Company Name */}
          <div>
            <label className="text-[#1C2C56] text-sm font-medium">
              {t("companyNameLabel")}<span className="text-red-500">*</span>
            </label>
            <FormItem
              invalid={Boolean(errors.companyName)}
              errorMessage={errors.companyName?.message}
            >
              <Controller
                name="companyName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder={t("companyNamePlaceholder")}
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                  />
                )}
              />
            </FormItem>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[#1C2C56] text-sm font-medium">
                {t("emailLabel")}<span className="text-red-500">*</span>
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
                      placeholder={t("emailPlaceholder")}
                      className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                    />
                  )}
                />
              </FormItem>
            </div>

            <div>
              <label className="text-[#1C2C56] text-sm font-medium">
                {t("mobileLabel")}<span className="text-red-500">*</span>
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
                      type="tel"
                      inputMode="numeric"
                      placeholder="9763880909"
                      maxLength={10}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        field.onChange(value);
                      }}
                      className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                    />
                  )}
                />
              </FormItem>
            </div>
          </div>

          {/* Role Select */}
          <div>
            <label className="text-[#1C2C56] text-sm font-medium">
              Role<span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedRole}
              onChange={setSelectedRole}
              options={roleOptions}
              placeholder="Select Role"
              isLoading={loadingRoles}
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
              {t("passwordLabel")}
              {mode === "add" && <span className="text-red-500">*</span>}
            </label>
            <div className="relative mt-1">
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
                          ? t("leaveBlankPassword")
                          : t("passwordPlaceholder")
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
                {t("leaveBlankPassword")}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end sm:flex-row flex-col gap-3">
          <Button variant="plain" onClick={onClose} size="sm" disabled={saving}>
            {t("cancel")}
          </Button>
          <Button
            variant="solid"
            size="sm"
            className="bg-[#1C4FA8] px-6 hover:bg-[#1C2C56] text-white py-2 rounded-md"
            onClick={handleSubmit(onSubmit)}
            loading={saving}
          >
            {mode === "edit" ? t("updateAccount") : t("createAccount")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default AddEditB2BAccountModal;
