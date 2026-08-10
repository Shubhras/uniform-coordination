"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiQuotationDetails,
  apiUpdateQuotation,
} from "@/services/B2BAccountService";
import { apiGetSalesReps } from "@/services/SalesRepService";

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = t("validation.companyNameRequired");
    }

    if (!formData.contact_person.trim()) {
      newErrors.contact_person = t("validation.contactPersonRequired");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("validation.emailRequired");
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = t("validation.phoneRequired");
    }

    if (!formData.item_type.trim()) {
      newErrors.item_type = t("validation.itemTypeRequired");
    }

    if (!formData.material.trim()) {
      newErrors.material = t("validation.materialRequired");
    }

    if (!formData.size_quantity.trim()) {
      newErrors.size_quantity = t("validation.sizeQuantityRequired");
    }

    if (!formData.delivery_date) {
      newErrors.delivery_date = t("validation.deliveryDateRequired");
    }

    if (!formData.quotation_status) {
      newErrors.quotation_status = t("validation.quotationStatusRequired");
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
  });

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
          quotation_status: data.quotation_status || "",
          workflow_status: data.workflow_status || "",
          isActive: data.isActive ?? true,
          valid_until: data.valid_until || "",
          subtotal: data.subtotal ?? "",
          discount_percent: data.discount_percent ?? "",
          total: data.total ?? "",
          sales_rep: data.sales_rep ?? "",
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

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };
  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);

      const payload = {
        company_name: formData.company_name,
        contact_person: formData.contact_person,
        email: formData.email,
        phone_number: formData.phone_number,
        item_type: formData.item_type,
        material: formData.material,
        size_quantity: formData.size_quantity,
        delivery_date: formData.delivery_date,
        additional_note: formData.additional_note,
        ...formData,
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
        router.push("/customer");
      } else {
        toast.error(res?.message || t("updateFailed"));
      }
    } catch (error) {
      console.log(error);
      toast.error(t("genericError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
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

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1C2C56] mb-6">
          {t("companyInfoSection")}
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("companyNameLabel")}
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
              {t("contactPersonLabel")}
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
              {t("emailLabel")}
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1C2C56]"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("phoneNumberLabel")}
            </label>

            <input
              type="text"
              name="phone_number"
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
              {t("itemTypeLabel")}
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
              {t("materialLabel")}
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
              {t("sizeQuantityLabel")}
            </label>

            <input
              type="text"
              name="size_quantity"
              value={formData.size_quantity}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1C2C56]"
            />
            {errors.size_quantity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.size_quantity}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("deliveryDateLabel")}
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
              {t("quotationStatusLabel")}
            </label>

            <select
              name="quotation_status"
              value={formData.quotation_status}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-[#1C2C56]"
            >
              <option value="">{t("selectStatus")}</option>
              <option value="pending">{t("statusPending")}</option>
              <option value="sent">{t("statusSent")}</option>
              <option value="approved">{t("statusApproved")}</option>
              <option value="cancelled">{t("statusCancelled")}</option>
              <option value="accepted">{t("statusAccepted")}</option>
              <option value="received">{t("statusReceived")}</option>
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
            <input
              type="number"
              step="0.01"
              min="0"
              name="subtotal"
              value={formData.subtotal}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1C2C56]"
            />
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
            <input
              type="number"
              step="0.01"
              min="0"
              name="total"
              value={formData.total}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1C2C56]"
            />
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

      <div className="flex items-center justify-end gap-4 pb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
        >
          {t("cancel")}
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={handleSubmit}
          className="px-6 py-3 rounded-xl bg-[#1C2C56] text-white hover:bg-[#162347] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? t("saving") : t("saveChanges")}
        </button>
      </div>
    </div>
  );
};

export default EditQuotation;
