"use client";

import { useCallback, useEffect, useState } from "react";
import { FiSave, FiInfo } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
  apiGeneralSettingList,
  apiUpdateSystemSettings,
} from "@/services/SystemSettings";

/*
 * DESIGN NOTE — no Figma for this tab, and it deliberately does NOT configure a
 * payment gateway. KIREIZ FORM does not process payments: the spec states the
 * platform "does not directly handle payment processing, concluding its described
 * flow with the quotation request", and quotations are priced manually by an admin.
 *
 * What an admin does need is the billing wording that appears ON a quotation —
 * payment terms, tax treatment, validity, and bank transfer details. That is what
 * this tab manages. Gateway credentials belong to KIREIZ SPACE, not here.
 */

const FIELDS = [
  {
    name: "quotation_validity_days",
    label: "Quotation Validity (days)",
    type: "number",
    min: 1,
    max: 365,
    hint: "Default validity period suggested when quoting.",
  },
  {
    name: "tax_rate",
    label: "Consumption Tax (%)",
    type: "number",
    step: "0.01",
    min: 0,
    max: 100,
  },
  { name: "bank_name", label: "Bank Name", type: "text", maxLength: 150 },
  { name: "bank_branch", label: "Branch", type: "text", maxLength: 150 },
  {
    name: "bank_account_name",
    label: "Account Holder",
    type: "text",
    maxLength: 150,
  },
  {
    name: "bank_account_number",
    label: "Account Number",
    type: "text",
    maxLength: 50,
  },
];

const notify = (title, type, message) =>
  toast.push(
    <Notification title={title} type={type}>
      {message}
    </Notification>,
  );

const PaymentSettings = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiGeneralSettingList(accessToken);
      const d = res?.data;
      if (d) {
        setForm({
          payment_terms: d.payment_terms || "",
          quotation_validity_days: d.quotation_validity_days ?? 30,
          tax_rate: d.tax_rate ?? 10,
          tax_inclusive: !!d.tax_inclusive,
          bank_name: d.bank_name || "",
          bank_branch: d.bank_branch || "",
          bank_account_name: d.bank_account_name || "",
          bank_account_number: d.bank_account_number || "",
        });
      }
    } catch (error) {
      console.error("Failed to load payment settings:", error);
      notify("Error", "danger", "Could not load payment settings");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const change = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (saving || !form) return;

    try {
      setSaving(true);
      const res = await apiUpdateSystemSettings(accessToken, {
        ...form,
        quotation_validity_days: Number(form.quotation_validity_days) || 30,
        tax_rate: Number(form.tax_rate) || 0,
      });
      // This endpoint replies with `success`, not `status`.
      if (res?.success) {
        notify("Success", "success", "Payment settings saved");
      } else {
        notify("Error", "danger", res?.message || "Could not save settings");
      }
    } catch (error) {
      console.error("Failed to save payment settings:", error);
      notify(
        "Error",
        "danger",
        error?.response?.data?.message || "Could not save settings",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="mt-5 border border-[#E2E8F0] rounded-xl p-6 animate-pulse">
        <div className="h-4 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-11 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5">
      {/* Why there is no gateway config here */}
      <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
        <FiInfo className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
        <p className="text-xs text-blue-900">
          KIREIZ FORM does not process payments — the customer journey ends at a
          quotation request. These settings control the billing terms shown{" "}
          <strong>on quotations and quotation PDFs</strong>, not a payment
          gateway.
        </p>
      </div>

      <div className="border border-[#E2E8F0] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#1C2C56]">
          Payment &amp; Billing Terms
        </h2>
        <p className="text-sm text-[#64748B] mt-1">
          Printed on quotations sent to customers.
        </p>

        {/* Payment terms */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-[#1C2C56] mb-2">
            Payment Terms
          </label>
          <textarea
            name="payment_terms"
            value={form.payment_terms}
            onChange={change}
            rows={3}
            placeholder="e.g. 50% advance payment required. Balance due on delivery."
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1C4FA8]/30"
          />
        </div>

        {/* Numeric + bank fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {FIELDS.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-[#1C2C56] mb-2">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={change}
                min={field.min}
                max={field.max}
                step={field.step}
                maxLength={field.maxLength}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1C4FA8]/30"
              />
              {field.hint && (
                <p className="text-xs text-[#94A3B8] mt-1">{field.hint}</p>
              )}
            </div>
          ))}
        </div>

        {/* Tax inclusive */}
        <label className="flex items-center gap-3 mt-5 cursor-pointer">
          <input
            type="checkbox"
            name="tax_inclusive"
            checked={form.tax_inclusive}
            onChange={change}
            className="w-4 h-4 accent-[#1C4FA8]"
          />
          <span className="text-sm text-[#1C2C56]">
            Quoted figures already include tax
          </span>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={load}
            disabled={saving}
            className="border border-[#CBD5E1] text-[#486284] px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#1C4FA8] text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <FiSave size={15} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
