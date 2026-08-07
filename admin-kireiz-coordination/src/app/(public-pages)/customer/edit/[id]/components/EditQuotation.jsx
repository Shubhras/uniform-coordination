"use client";

import { useEffect, useState } from "react";
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
      newErrors.company_name = "Company name is required*";
    }

    if (!formData.contact_person.trim()) {
      newErrors.contact_person = "Contact person is required*";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required*";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required*";
    }

    if (!formData.item_type.trim()) {
      newErrors.item_type = "Item type is required*";
    }

    if (!formData.material.trim()) {
      newErrors.material = "Material is required*";
    }

    if (!formData.size_quantity.trim()) {
      newErrors.size_quantity = "Size & Quantity is required*";
    }

    if (!formData.delivery_date) {
      newErrors.delivery_date = "Delivery date is required*";
    }

    if (!formData.quotation_status) {
      newErrors.quotation_status = "Quotation status is required*";
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
      toast.error("Failed to fetch quotation details.");
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
        quotation_status: formData.quotation_status,
        // workflow_status: formData.workflow_status,
        isActive: formData.isActive,

        // Send null rather than "" for the optional figures — DRF rejects an
        // empty string on DecimalField/DateField, but accepts null.
        valid_until: formData.valid_until || null,
        subtotal: formData.subtotal === "" ? null : formData.subtotal,
        discount_percent:
          formData.discount_percent === "" ? null : formData.discount_percent,
        total: formData.total === "" ? null : formData.total,
        sales_rep: formData.sales_rep === "" ? null : Number(formData.sales_rep),
      };

      const res = await apiUpdateQuotation(accessToken, id, payload);

      toast.push(
        <Notification title="Success" type="success">
          {res?.message}
        </Notification>,
      );

      if (res?.status) {
        // toast.success(res?.message);
        router.push("/customer");
      } else {
        toast.error(res?.message || "Failed to update quotation.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6">
      {/* ================= Header ================= */}

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
              Edit Quotation
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Update quotation information
            </p>
          </div>
        </div>
      </div>

      {/* ================= Company Information ================= */}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1C2C56] mb-6">
          Company Information
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Company */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
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

          {/* Contact */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Person
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

          {/* Email */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
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

          {/* Phone */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
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

      {/* ================= Quotation Details ================= */}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1C2C56] mb-6">
          Quotation Details
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Item Type */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Type
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

          {/* Material */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material
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

          {/* Size Quantity */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size & Quantity
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

          {/* Delivery Date */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Date
            </label>

            <input
              type="date"
              name="delivery_date"
              value={formData.delivery_date}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1C2C56]"
            />
            {errors.delivery_date && (
              <p className="text-red-500 text-sm mt-1">
                {errors.delivery_date}
              </p>
            )}
          </div>

          {/* Quotation Status */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quotation Status
            </label>

            <select
              name="quotation_status"
              value={formData.quotation_status}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-[#1C2C56]"
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="cancelled">Cancelled</option>
              <option value="accepted">Accepted</option>
              <option value="received">Received</option>
            </select>
            {errors.quotation_status && (
              <p className="text-red-500 text-sm mt-1">
                {errors.quotation_status}
              </p>
            )}
          </div>

          {/* Sales Representative */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sales Representative
            </label>
            <select
              name="sales_rep"
              value={formData.sales_rep}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-[#1C2C56]"
            >
              <option value="">Unassigned</option>
              {salesReps.map((rep) => (
                <option key={rep.id} value={rep.id}>
                  {rep.name} — {rep.designation}
                </option>
              ))}
            </select>
            {salesReps.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                No representatives yet — add them under Customer &amp; Sales
                Representative → Sales Representation.
              </p>
            )}
          </div>

          {/* Valid Until */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valid Until
            </label>
            <input
              type="date"
              name="valid_until"
              value={formData.valid_until}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1C2C56]"
            />
          </div>

          {/* Subtotal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtotal
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

          {/* Discount % */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount (%)
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
              Discount amount is calculated from subtotal &times; this
              percentage.
            </p>
          </div>

          {/* Total */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total
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
              Leave blank to fall back to subtotal minus discount.
            </p>
          </div>

          {/* Workflow Status */}

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workflow Status
            </label>

            <select
              name="workflow_status"
              value={formData.workflow_status}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-[#1C2C56]"
            >
              <option value="">Select Workflow</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div> */}

          {/* Active */}

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
                Active Quotation
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* ================= Additional Note ================= */}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1C2C56] mb-6">
          Additional Note
        </h2>

        <textarea
          rows={5}
          name="additional_note"
          value={formData.additional_note}
          onChange={handleChange}
          placeholder="Enter additional notes..."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-[#1C2C56]"
        />
      </div>

      {/* ================= Action Buttons ================= */}

      <div className="flex items-center justify-end gap-4 pb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={handleSubmit}
          className="px-6 py-3 rounded-xl bg-[#1C2C56] text-white hover:bg-[#162347] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default EditQuotation;
