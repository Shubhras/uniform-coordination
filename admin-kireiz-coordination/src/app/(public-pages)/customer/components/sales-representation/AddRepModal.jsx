"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FiEye, FiEyeOff, FiX } from "react-icons/fi";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { apiCreateSalesRep, apiUpdateSalesRep } from "@/services/SalesRepService";

// Shared by the Sales Representation and Assignments tabs — both have an
// "Add Representative" button in the design.
// Note: no Figma design exists for this modal, so it follows the surrounding
// admin form styling.

// maxLength mirrors the DB column widths — MySQL errors on overflow rather than
// truncating, so it's better to stop it at the input.
const FIELDS = [
  { name: "name", labelKey: "fullNameLabel", type: "text", maxLength: 255, required: true },
  { name: "email", labelKey: "emailLabel", type: "email", maxLength: 254, required: true },
  {
    name: "mobile",
    labelKey: "mobileLabel",
    type: "tel",
    maxLength: 10,
    inputMode: "numeric",
    autoComplete: "off",
    required: false,
  },
  {
    name: "designation",
    labelKey: "designationLabel",
    type: "text",
    maxLength: 100,
    required: true,
  },
  { name: "password", labelKey: "passwordLabel", type: "password", required: true },
];

const notify = (title, type, message) =>
  toast.push(
    <Notification title={title} type={type}>
      {message}
    </Notification>,
  );

const AddRepModal = ({ accessToken, onClose, onCreated, initialData = null }) => {
  const isEdit = Boolean(initialData?.id);
  const t = useTranslations("customerSalesRep.salesRepresentation.addRepModal");
  const [form, setForm] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    mobile: initialData?.mobile
      ? String(initialData.mobile).replace(/\D/g, "").slice(0, 10)
      : "",
    designation: initialData?.designation || "Sales Representative",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const change = (e) => {
    const { name, value } = e.target;
    const finalValue =
      name === "mobile" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setForm((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleKeyDown = (e, fieldName) => {
    if (fieldName === "mobile") {
      if (
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key === "Tab" ||
        e.key === "Escape" ||
        e.key === "Enter" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "Home" ||
        e.key === "End" ||
        e.ctrlKey ||
        e.metaKey
      ) {
        return;
      }
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
      }
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = t("validation.nameRequired") || "Full Name is required";
    }
    if (!form.email.trim()) {
      errs.email = t("validation.emailRequired") || "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        errs.email = t("validation.emailInvalid") || "Please enter a valid email address";
      }
    }
    if (form.mobile && form.mobile.trim().length > 0 && form.mobile.trim().length !== 10) {
      errs.mobile = t("validation.invalidMobile") || "Enter a valid 10-digit mobile number";
    }
    if (!form.designation.trim()) {
      errs.designation = t("validation.designationRequired") || "Designation is required";
    }
    if (!isEdit && !form.password) {
      errs.password = t("validation.passwordRequired") || "Password is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      const payload = { ...form };
      if (isEdit && !payload.password) {
        delete payload.password;
      }
      const res = isEdit
        ? await apiUpdateSalesRep(accessToken, initialData.id, payload)
        : await apiCreateSalesRep(accessToken, payload);

      if (res?.status) {
        notify(
          t("successTitle"),
          "success",
          isEdit ? "Sales representative updated successfully." : t("addSuccess"),
        );
        onCreated?.();
      } else {
        notify(
          t("errorTitle"),
          "danger",
          res?.message || (isEdit ? "Failed to update representative." : t("addFailed")),
        );
      }
    } catch (error) {
      console.error("Failed to save rep:", error);
      const serverErrors = error?.response?.data?.errors;
      if (serverErrors && typeof serverErrors === "object") {
        const formatted = {};
        Object.entries(serverErrors).forEach(([k, v]) => {
          formatted[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setErrors((prev) => ({ ...prev, ...formatted }));
      }
      notify(
        t("errorTitle"),
        "danger",
        error?.response?.data?.message || (isEdit ? "Failed to update representative." : t("addFailed")),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-5">
          <h3 className="text-lg font-semibold text-[#1C2C56]">
            {isEdit ? "Edit Sales Representative" : t("modalTitle")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {FIELDS.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-[#1C2C56] mb-1">
                {field.name === "password" && isEdit
                  ? "Password (Leave blank to keep current)"
                  : t(field.labelKey)}
                {field.required && (field.name !== "password" || !isEdit) && (
                  <span className="text-red-500 ml-0.5">*</span>
                )}
              </label>
              <div className="relative">
                <input
                  type={
                    field.name === "password" && showPassword
                      ? "text"
                      : field.type
                  }
                  name={field.name}
                  value={form[field.name]}
                  onChange={change}
                  onKeyDown={(e) => handleKeyDown(e, field.name)}
                  maxLength={field.maxLength}
                  inputMode={field.inputMode}
                  autoComplete={field.autoComplete}
                  placeholder={
                    field.name === "password" && isEdit
                      ? "Leave blank to keep unchanged"
                      : ""
                  }
                  className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm outline-none transition-colors ${errors[field.name]
                      ? "border-red-500 focus:ring-2 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                    }`}
                />
                {field.name === "password" && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1C2C56]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff size={16} />
                    ) : (
                      <FiEye size={16} />
                    )}
                  </button>
                )}
              </div>
              {errors[field.name] && (
                <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-600"
          >
            {t("cancel")}
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm bg-[#1C4FA8] text-white disabled:opacity-50"
          >
            {saving ? t("saving") : isEdit ? "Update" : t("submit")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRepModal;
