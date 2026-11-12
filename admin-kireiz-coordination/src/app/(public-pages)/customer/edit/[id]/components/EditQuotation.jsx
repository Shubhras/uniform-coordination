"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiQuotationDetails,
  apiUpdateQuotation,
} from "@/services/B2BAccountService";
import { apiGetSalesReps } from "@/services/SalesRepService";
import { apiResendQuotation } from "@/services/QuotationHistoryService";
import Dialog from "@/components/ui/Dialog";
import QuotationWorkflowProgression from "./QuotationWorkflowProgression";

const calculateTotal = (subtotalVal, discountPercentVal) => {
  if (
    subtotalVal === "" ||
    subtotalVal === null ||
    subtotalVal === undefined
  ) {
    return "";
  }
  const sub = parseFloat(subtotalVal);
  if (isNaN(sub) || sub < 0) {
    return "";
  }
  const disc = parseFloat(discountPercentVal);
  const validDisc = isNaN(disc) || disc < 0 ? 0 : disc;
  const computedTotal = sub - (sub * validDisc) / 100;
  const clampedTotal = Math.max(0, computedTotal);
  return clampedTotal.toFixed(2);
};

const EditQuotation = () => {
  const t = useTranslations(
    "customerSalesRep.quotationHistory.editQuotationPage",
  );
  const router = useRouter();
  const { id } = useParams();

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  // Options for the Sales Rep dropdown. Without this the sales_rep FK could never
  // be set from the UI, so Sales Team Performance would always read zero.
  const [salesReps, setSalesReps] = useState([]);

  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReasonInput, setCancelReasonInput] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = t("validation.companyNameRequired");
    }

    if (!formData.contact_person.trim()) {
      newErrors.contact_person = t("validation.contactPersonRequired");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = t("validation.emailRequired");
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = t("validation.invalidEmail") || "Invalid email address";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = t("validation.phoneRequired");
    } else if (
      formData.phone_number.trim().length < 8 ||
      formData.phone_number.trim().length > 15 ||
      !/^\d+$/.test(formData.phone_number.trim())
    ) {
      newErrors.phone_number = t("validation.invalidPhone");
    }

    if (!formData.item_type.trim()) {
      newErrors.item_type = t("validation.itemTypeRequired");
    }

    if (!formData.material.trim()) {
      newErrors.material = t("validation.materialRequired");
    }

    const sizeQuantityRegex =
      /^[A-Za-z0-9]+\s*-\s*\d+(\s*,\s*[A-Za-z0-9]+\s*-\s*\d+)*$/;
    if (!formData.size_quantity.trim()) {
      newErrors.size_quantity = t("validation.sizeQuantityRequired");
    } else if (!sizeQuantityRegex.test(formData.size_quantity.trim())) {
      newErrors.size_quantity =
        t("validation.invalidSizeQuantity") ||
        "Enter valid format like M-10, L-20";
    }

    if (!formData.delivery_date) {
      newErrors.delivery_date = t("validation.deliveryDateRequired");
    }

    if (!formData.quotation_status) {
      newErrors.quotation_status = t("validation.quotationStatusRequired");
    }

    if (
      formData.subtotal !== "" &&
      formData.subtotal !== null &&
      Number(formData.subtotal) < 0
    ) {
      newErrors.subtotal = t("validation.subtotalNegative");
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const [formData, setFormData] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone_number: "",
    item_type: "",
    material: "",
    size_quantity: "",
    delivery_date: "",
    additional_note: "",
    quotation_status: "",
    workflow_status: "",
    isActive: true,
    // Admin-entered quotation figures — no auto-calculation per spec
    valid_until: "",
    subtotal: "",
    discount_percent: "",
    total: "",
    sales_rep: "",
    cancel_reason: "",
  });

  const currentStatusRaw = String(formData?.quotation_status || "")
    .toLowerCase()
    .trim();
  const isAgreed =
    currentStatusRaw === "approved" || currentStatusRaw === "sent";
  const canCancel =
    !isAgreed &&
    currentStatusRaw !== "cancelled" &&
    currentStatusRaw !== "declined";

  const getQuotationDetails = async () => {
    try {
      setLoading(true);

      const res = await apiQuotationDetails(accessToken, id);

      if (res?.status) {
        const data = res.data;

        setFormData({
          company_name: data.company_name || "",
          contact_person: data.contact_person || "",
          email: data.email || "",
          phone_number: data.phone_number || "",
          item_type: data.item_type || "",
          material: data.material || "",
          size_quantity: data.size_quantity || "",
          delivery_date: data.delivery_date || "",
          additional_note: data.additional_note || "",
          cancel_reason: data.cancel_reason || "",
          quotation_status: data.quotation_status || "",
          workflow_status: data.workflow_status || "",
          isActive: data.isActive ?? true,
          valid_until: data.valid_until || "",
          subtotal: data.subtotal ?? "",
          discount_percent: data.discount_percent ?? "",
          total:
            data.total !== null && data.total !== undefined && data.total !== ""
              ? data.total
              : calculateTotal(data.subtotal, data.discount_percent),
          sales_rep: data.sales_rep ?? "",
          quotation_id: data.quotation_id || "",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(t("fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && id) {
      getQuotationDetails();
    }
  }, [accessToken, id]);

  // Load the rep list separately — a failure here shouldn't block editing the
  // quotation, it just leaves the dropdown empty.
  useEffect(() => {
    if (!accessToken) return;

    const loadSalesReps = async () => {
      try {
        const res = await apiGetSalesReps(accessToken);
        if (res?.status) setSalesReps(res.data || []);
      } catch (error) {
        console.error("Failed to load sales reps:", error);
      }
    };

    loadSalesReps();
  }, [accessToken]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    if (name === "email") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let emailError = "";
      if (!value.trim()) {
        emailError = t("validation.emailRequired");
      } else if (!emailRegex.test(value.trim())) {
        emailError = t("validation.invalidEmail") || "Invalid email address";
      }

      setErrors((prev) => ({
        ...prev,
        email: emailError,
      }));
      return;
    }

    if (name === "size_quantity") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      const sizeQuantityRegex =
        /^[A-Za-z0-9]+\s*-\s*\d+(\s*,\s*[A-Za-z0-9]+\s*-\s*\d+)*$/;
      let sizeError = "";
      if (!value.trim()) {
        sizeError = t("validation.sizeQuantityRequired");
      } else if (!sizeQuantityRegex.test(value.trim())) {
        sizeError =
          t("validation.invalidSizeQuantity") ||
          "Enter valid format like M-10, L-20";
      }

      setErrors((prev) => ({
        ...prev,
        size_quantity: sizeError,
      }));
      return;
    }

    if (name === "phone_number") {
      const numericValue = value.replace(/\D/g, "").slice(0, 15);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
      return;
    }

    if (name === "subtotal") {
      const isNegative =
        (value !== "" && Number(value) < 0) ||
        (value !== "" && String(value).includes("-")) ||
        Boolean(e.target.validity?.badInput);

      const computedTotal = isNegative
        ? ""
        : calculateTotal(value, formData.discount_percent);

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        total: computedTotal,
      }));

      setErrors((prev) => ({
        ...prev,
        subtotal: isNegative ? t("validation.subtotalNegative") : "",
      }));
      return;
    }

    if (name === "discount_percent") {
      const isNegative =
        (value !== "" && Number(value) < 0) ||
        (value !== "" && String(value).includes("-")) ||
        Boolean(e.target.validity?.badInput);

      const sanitizedValue = isNegative ? "" : value;
      const computedTotal = calculateTotal(formData.subtotal, sanitizedValue);

      setFormData((prev) => ({
        ...prev,
        [name]: sanitizedValue,
        total: computedTotal,
      }));

      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubtotalKeyDown = (e) => {
    if (e.key === "-" || e.key === "Subtract") {
      e.preventDefault();
      setErrors((prev) => ({
        ...prev,
        subtotal: t("validation.subtotalNegative"),
      }));
    }
  };

  const handleSubtotalPaste = (e) => {
    const text = e.clipboardData?.getData("text");
    if (text && (text.includes("-") || Number(text) < 0)) {
      e.preventDefault();
      setErrors((prev) => ({
        ...prev,
        subtotal: t("validation.subtotalNegative"),
      }));
    }
  };

  const handleNonNegativeKeyDown = (e) => {
    if (e.key === "-" || e.key === "Subtract") {
      e.preventDefault();
    }
  };
  const formatDateToISO = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return null;
    const trimmed = dateStr.trim();
    if (!trimmed) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const partsSlash = trimmed.split("/");
    if (partsSlash.length === 3) {
      const [d, m, y] = partsSlash;
      if (y.length === 4) {
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }
    }
    const partsDash = trimmed.split("-");
    if (partsDash.length === 3 && partsDash[0].length <= 2 && partsDash[2].length === 4) {
      const [d, m, y] = partsDash;
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    return trimmed;
  };

  const handleSubmit = async (shouldSend = false) => {
    if (
      !validateForm() ||
      errors.subtotal ||
      errors.email ||
      errors.size_quantity
    )
      return;
    try {
      setSaving(true);

      const payload = {
        ...formData,
        company_name: formData.company_name,
        contact_person: formData.contact_person,
        email: formData.email,
        phone_number: formData.phone_number,
        item_type: formData.item_type,
        material: formData.material,
        size_quantity: formData.size_quantity,
        delivery_date: formatDateToISO(formData.delivery_date) || formData.delivery_date,
        additional_note: formData.additional_note,
        cancel_reason: formData.cancel_reason || formData.additional_note || "",
        valid_until: formatDateToISO(formData.valid_until),
        quotation_status: shouldSend ? "sent" : (formData.quotation_status || "pending"),
        sales_rep: formData.sales_rep ? Number(formData.sales_rep) : null,
        subtotal: formData.subtotal === "" ? null : Number(formData.subtotal),
        discount_percent:
          formData.discount_percent === ""
            ? 0
            : Number(formData.discount_percent),
        total: formData.total === "" ? null : Number(formData.total),
      };

      const res = await apiUpdateQuotation(accessToken, id, payload);

      if (shouldSend) {
        try {
          await apiResendQuotation(accessToken, formData.quotation_id || id);
        } catch (sendErr) {
          console.error("Failed to send quotation email:", sendErr);
        }
      }

      toast.push(
        <Notification title={t("successTitle")} type="success">
          {shouldSend
            ? t("sendSuccess")
            : (res?.message || t("updateSuccess"))}
        </Notification>,
      );

      if (res?.status) {
        router.push("/customer?tab=Quotation+History");
      } else {
        toast.error(res?.message || t("updateFailed"));
      }
    } catch (error) {
      console.error("Quotation update error:", error);
      const serverErr = error?.response?.data?.error;
      let errorMsg = error?.response?.data?.message || t("genericError");
      if (serverErr && typeof serverErr === "object") {
        const details = Object.entries(serverErr)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
        if (details) errorMsg = `${errorMsg} (${details})`;
      }
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDirectStatusUpdate = async (newStatus, extraFields = {}) => {
    try {
      setSaving(true);
      const payload = {
        ...formData,
        ...extraFields,
        company_name: formData.company_name,
        contact_person: formData.contact_person,
        email: formData.email,
        phone_number: formData.phone_number,
        item_type: formData.item_type,
        material: formData.material,
        size_quantity: formData.size_quantity,
        delivery_date:
          formatDateToISO(formData.delivery_date) || formData.delivery_date,
        additional_note: formData.additional_note,
        cancel_reason:
          extraFields.cancel_reason ||
          formData.cancel_reason ||
          formData.additional_note ||
          "",
        valid_until: formatDateToISO(formData.valid_until),
        quotation_status: newStatus,
        sales_rep: formData.sales_rep ? Number(formData.sales_rep) : null,
        subtotal: formData.subtotal === "" ? null : Number(formData.subtotal),
        discount_percent:
          formData.discount_percent === ""
            ? 0
            : Number(formData.discount_percent),
        total: formData.total === "" ? null : Number(formData.total),
      };

      const res = await apiUpdateQuotation(accessToken, id, payload);

      toast.push(
        <Notification title={t("successTitle")} type="success">
          {res?.message || t("updateSuccess")}
        </Notification>,
      );

      if (res?.status) {
        setFormData((prev) => ({
          ...prev,
          quotation_status: newStatus,
          ...extraFields,
        }));
        if (errors.quotation_status) {
          setErrors((prev) => ({ ...prev, quotation_status: "" }));
        }
        setSubmitModalOpen(false);
        setCancelModalOpen(false);
        setCancelReasonInput("");
      } else {
        toast.error(res?.message || t("updateFailed"));
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(error?.response?.data?.message || t("genericError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/customer?tab=Quotation+History")}
            className="h-10 w-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50"
          >
            <FiArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-[#1C2C56]">
              {t("pageTitle")}
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              {t("pageSubtitle")}
            </p>
          </div>
        </div>
      </div>

      <QuotationWorkflowProgression
        status={formData.quotation_status}
        onStatusChange={(newStatus) => {
          handleDirectStatusUpdate(newStatus);
        }}
        onRequestSubmit={() => setSubmitModalOpen(true)}
        onRequestCancel={() => setCancelModalOpen(true)}
        saving={saving}
      />

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1C2C56] mb-6">
          {t("companyInfoSection")}
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("companyNameLabel")} <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1C2C56]"
            />
            {errors.company_name && (
              <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("contactPersonLabel")} <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1C2C56]"
            />
            {errors.contact_person && (
              <p className="text-red-500 text-sm mt-1">
                {errors.contact_person}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("emailLabel")} <span className="text-red-500">*</span>
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@domain.com"
              className={`w-full rounded-xl border ${errors.email ? "border-red-500" : "border-gray-300"
                } px-4 py-3 outline-none focus:ring-2 ${errors.email ? "focus:ring-red-500" : "focus:ring-[#1C2C56]"
                }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("phoneNumberLabel")} <span className="text-red-500">*</span>
            </label>

            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              name="phone_number"
              maxLength={15}
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1C2C56]"
            />
            {errors.phone_number && (
              <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1C2C56] mb-6">
          {t("quotationDetailsSection")}
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("itemTypeLabel")} <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="item_type"
              value={formData.item_type}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1C2C56]"
            />
            {errors.item_type && (
              <p className="text-red-500 text-sm mt-1">{errors.item_type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("materialLabel")} <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1C2C56]"
            />
            {errors.material && (
              <p className="text-red-500 text-sm mt-1">{errors.material}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("sizeQuantityLabel")} <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="size_quantity"
              value={formData.size_quantity}
              onChange={handleChange}
              placeholder="e.g. M-10, L-20"
              className={`w-full rounded-xl border ${errors.size_quantity ? "border-red-500" : "border-gray-300"
                } px-4 py-3 outline-none focus:ring-2 ${errors.size_quantity
                  ? "focus:ring-red-500"
                  : "focus:ring-[#1C2C56]"
                }`}
            />
            {errors.size_quantity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.size_quantity}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("deliveryDateLabel")} <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              name="delivery_date"
              value={formData.delivery_date}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1C4FA8]"
            />
            {errors.delivery_date && (
              <p className="text-red-500 text-sm mt-1">
                {errors.delivery_date}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("quotationStatusLabel")} <span className="text-red-500">*</span>
            </label>

            <select
              name="quotation_status"
              value={formData.quotation_status}
              disabled={saving}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                if (val === "cancelled") {
                  setCancelModalOpen(true);
                  return;
                }
                if (val === "accepted") {
                  setSubmitModalOpen(true);
                  return;
                }
                handleDirectStatusUpdate(val);
              }}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-[#1C2C56] disabled:bg-gray-100 disabled:opacity-60"
            >
              <option value="">{t("selectStatus")}</option>
              <option value="pending">{t("statusPending")}</option>
              <option value="received">{t("statusReceived")}</option>
              <option value="accepted">
                {t.has?.("statusSubmitted") ? t("statusSubmitted") : t("statusAccepted")}
              </option>
              {(currentStatusRaw === "approved" || currentStatusRaw === "sent") && (
                <option value="approved">{t("statusApproved")}</option>
              )}
              {currentStatusRaw === "sent" && (
                <option value="sent">{t("statusSent")}</option>
              )}
              {canCancel && (
                <option value="cancelled">{t("statusCancelled")}</option>
              )}
            </select>
            {errors.quotation_status && (
              <p className="text-red-500 text-sm mt-1">
                {errors.quotation_status}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("salesRepresentativeLabel")}
            </label>
            <select
              name="sales_rep"
              value={formData.sales_rep}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-[#1C2C56]"
            >
              <option value="">{t("unassigned")}</option>
              {salesReps.map((rep) => (
                <option key={rep.id} value={rep.id}>
                  {rep.name} — {rep.designation}
                </option>
              ))}
            </select>
            {salesReps.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {t("noRepresentativesHint")}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("validUntilLabel")}
            </label>
            <input
              type="date"
              name="valid_until"
              value={formData.valid_until}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1C2C56]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("subtotalLabel")}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none select-none">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                name="subtotal"
                value={formData.subtotal}
                onChange={handleChange}
                onKeyDown={handleSubtotalKeyDown}
                onPaste={handleSubtotalPaste}
                placeholder="0.00"
                className={`w-full rounded-xl border ${errors.subtotal ? "border-red-500" : "border-gray-300"
                  } pl-8 pr-4 py-3 outline-none focus:ring-2 ${errors.subtotal ? "focus:ring-red-500" : "focus:ring-[#1C2C56]"
                  }`}
              />
            </div>
            {errors.subtotal && (
              <p className="text-red-500 text-sm mt-1">{errors.subtotal}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("discountPercentLabel")}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              name="discount_percent"
              value={formData.discount_percent}
              onChange={handleChange}
              onKeyDown={handleNonNegativeKeyDown}
              placeholder="0"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1C2C56]"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("discountHint")}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("totalLabel")}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none select-none">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                name="total"
                value={formData.total}
                readOnly
                placeholder="0.00"
                className="w-full rounded-xl border border-gray-300 bg-gray-100 text-gray-600 pl-8 pr-4 py-3 outline-none cursor-not-allowed select-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t("totalHint")}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-5 w-5 accent-[#1C2C56]"
              />

              <span className="text-sm font-medium text-gray-700">
                {t("activeQuotationLabel")}
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1C2C56] mb-6">
          {t("additionalNoteSection")}
        </h2>

        <textarea
          rows={5}
          name="additional_note"
          value={formData.additional_note}
          onChange={handleChange}
          placeholder={t("additionalNotePlaceholder")}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-[#1C2C56]"
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-4 pb-6">
        <button
          type="button"
          onClick={() => router.push("/customer?tab=Quotation+History")}
          className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
        >
          {t.has?.("backToQuotations") ? t("backToQuotations") : t("cancel")}
        </button>

        {/* Cancel button: ONLY shown before Agreed (approved / sent) */}
        {canCancel && (
          <button
            type="button"
            disabled={saving}
            onClick={() => setCancelModalOpen(true)}
            className="px-6 py-3 rounded-xl border border-red-300 bg-white text-red-600 hover:bg-red-50 transition font-medium disabled:opacity-50"
          >
            {t.has?.("cancelQuotation")
              ? t("cancelQuotation")
              : "Cancel Quotation"}
          </button>
        )}

        {(currentStatusRaw === "received" || currentStatusRaw === "quoting") && (
          <button
            type="button"
            disabled={saving}
            onClick={() => setSubmitModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-[#1C2C56] text-white hover:bg-[#2a407a] transition font-medium disabled:opacity-50"
          >
            {t.has?.("changeToSubmitted")
              ? t("changeToSubmitted")
              : "Change to Submitted"}
          </button>
        )}


        <button
          type="button"
          disabled={saving}
          onClick={() => handleSubmit(false)}
          className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed font-medium"
        >
          {saving ? t("saving") : t("saveChanges")}
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={() => handleSubmit(true)}
          className="px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-2 font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <FiSend className="w-4 h-4" />
          {saving ? t("sending") : t("sendQuotationResponse")}
        </button>
      </div>

      {/* Modal 1: Change Status to Submitted */}
      <Dialog
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onRequestClose={() => setSubmitModalOpen(false)}
        width={440}
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-[#1C2C56] mb-2">
            {t.has?.("confirmSubmitTitle")
              ? t("confirmSubmitTitle")
              : "Change Status to Submitted"}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {t.has?.("confirmSubmitMessage")
              ? t("confirmSubmitMessage")
              : "Are you sure you want to change the status to Submitted? The status will be updated to accepted in the backend."}
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => setSubmitModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleDirectStatusUpdate("accepted")}
              className="px-4 py-2 rounded-lg bg-[#1C2C56] text-white hover:bg-[#283d73] transition text-sm font-medium disabled:opacity-50"
            >
              {saving
                ? t("saving")
                : t.has?.("confirm")
                  ? t("confirm")
                  : "Confirm & Submit"}
            </button>
          </div>
        </div>
      </Dialog>


      {/* Modal 3: Cancel Quotation */}
      <Dialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onRequestClose={() => setCancelModalOpen(false)}
        width={460}
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-red-600 mb-2">
            {t.has?.("confirmCancelTitle")
              ? t("confirmCancelTitle")
              : "Cancel Quotation"}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {t.has?.("confirmCancelMessage")
              ? t("confirmCancelMessage")
              : "Are you sure you want to cancel this quotation? This action cannot be undone."}
          </p>
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t.has?.("cancelReasonLabel")
                ? t("cancelReasonLabel")
                : "Cancellation Reason (Optional)"}
            </label>
            <textarea
              rows={3}
              value={cancelReasonInput}
              onChange={(e) => setCancelReasonInput(e.target.value)}
              placeholder={
                t.has?.("cancelReasonPlaceholder")
                  ? t("cancelReasonPlaceholder")
                  : "Enter reason for cancellation..."
              }
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
            >
              {t.has?.("keepQuotation") ? t("keepQuotation") : "Keep Quotation"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                handleDirectStatusUpdate("cancelled", {
                  cancel_reason: cancelReasonInput,
                })
              }
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
            >
              {saving
                ? t("saving")
                : t.has?.("confirmCancellation")
                  ? t("confirmCancellation")
                  : "Confirm Cancellation"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default EditQuotation;
