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

const EditQuotation = () => {
  const router = useRouter();
  const { id } = useParams();

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSubmit = async () => {
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
            </select>
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
