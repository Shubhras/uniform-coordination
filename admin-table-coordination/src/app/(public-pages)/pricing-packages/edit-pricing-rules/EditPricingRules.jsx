"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { apiUpdatePricingList } from "@/services/PricingPackages";
import { FiArrowLeft } from "react-icons/fi";
import Button from "@/components/ui/Button";

export default function EditPricingRules() {
  const router = useRouter();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    lateFeeFormula: "Rental Value × Late Fee % × Days Overdue",
    lateFeeRate: 5,
    gracePeriod: 3,
    flatShippingFee: 150,
    enableConsumptionTax: true,
    taxPercentage: 10,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.lateFeeFormula.trim()) {
      newErrors.lateFeeFormula = "Late fee formula is required*";
    }

    if (!formData.lateFeeRate) {
      newErrors.lateFeeRate = "Late fee rate is required*";
    }

    if (!formData.gracePeriod) {
      newErrors.gracePeriod = "Grace period is required*";
    }

    if (!formData.flatShippingFee) {
      newErrors.flatShippingFee = "Shipping fee is required*";
    }

    if (!formData.taxPercentage) {
      newErrors.taxPercentage = "Tax percentage is required*";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const payload = {
        late_fee_formula_label: formData.lateFeeFormula,
        late_fee_rate: Number(formData.lateFeeRate),
        grace_period_days: Number(formData.gracePeriod),
        flat_shipping_fee: Number(formData.flatShippingFee),
        enable_consumption_tax: formData.enableConsumptionTax,
        tax_percentage: Number(formData.taxPercentage),
      };

      const res = await apiUpdatePricingList(accessToken, payload);

      toast.push(
        <Notification title="Success" type="success">
          {res?.data?.message || "Pricing Rule Updated Successfully"}
        </Notification>,
      );

      router.back();
    } catch (error) {
      toast.push(
        <Notification title="Error" type="danger">
          {error?.response?.data?.message || "Something went wrong"}
        </Notification>,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAF8] p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="h-9 w-9 rounded-full border border-[#E9DDD3] bg-white flex items-center justify-center hover:bg-[#F8F5F2] transition"
        >
          <FiArrowLeft size={18} className="text-[#3C2F2F]" />
        </button>

        <h1 className="text-[28px] font-semibold text-[#2C1A0E]">
          Edit Pricing Rules
        </h1>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-[#EFE5DC] bg-white p-5">
        {/* Late Fee */}
        <div>
          <h2 className="text-lg font-semibold text-[#2C1A0E]">
            Late Fee Configuration
          </h2>

          <p className="mt-1 text-sm text-[#9A8B82]">
            Define how late fees are calculated and applied
          </p>

          <div className="mt-6">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Late Fee Formula
            </label>

            <input
              type="text"
              name="lateFeeFormula"
              value={formData.lateFeeFormula}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 py-3 text-sm outline-none focus:border-[#B56A3C]"
            />

            {errors.lateFeeFormula && (
              <p className="text-red-500 text-sm mt-1">
                {errors.lateFeeFormula}
              </p>
            )}

            <p className="mt-2 text-xs text-[#B3A39A]">
              Descriptive formula label shown to staff in invoices
            </p>
          </div>

          <div className="mt-6">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Late Fee Rate (% Per Day)
            </label>

            <input
              type="number"
              name="lateFeeRate"
              value={formData.lateFeeRate}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 py-3 text-sm outline-none focus:border-[#B56A3C]"
            />

            {errors.lateFeeRate && (
              <p className="text-red-500 text-sm mt-1">{errors.lateFeeRate}</p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="my-5 border-t border-[#F0E8E1]" />

        {/* Return & Delivery */}
        <div>
          <h2 className="text-lg font-semibold text-[#2C1A0E]">
            Return & Delivery Settings
          </h2>

          <p className="mt-1 text-sm text-[#9A8B82]">
            Configure grace period and shipping fee
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
                Grace Period (Days)
              </label>

              <input
                type="number"
                name="gracePeriod"
                value={formData.gracePeriod}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 py-3 text-sm outline-none focus:border-[#B56A3C]"
              />

              {errors.gracePeriod && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.gracePeriod}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
                Flat Shipping Fee
              </label>

              <input
                type="number"
                name="flatShippingFee"
                value={formData.flatShippingFee}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 py-3 text-sm outline-none focus:border-[#B56A3C]"
              />

              {errors.flatShippingFee && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.flatShippingFee}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-5 border-t border-[#F0E8E1]" />

        {/* Tax */}
        <div>
          <h2 className="text-lg font-semibold text-[#2C1A0E]">Tax Settings</h2>

          <p className="mt-1 text-sm text-[#9A8B82]">
            Configure consumption tax on rental transactions
          </p>

          {/* Toggle Card */}
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#E9DDD3] bg-[#FCFAF8] px-5 py-2">
            <div>
              <h3 className="font-semibold text-[#2C1A0E] text-[15px]">
                Enable Consumption Tax
              </h3>

              <p className="text-[13px] text-[#9A8B82] mt-1">
                Apply sales tax to all taxable transactions
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="enableConsumptionTax"
                checked={formData.enableConsumptionTax}
                onChange={handleChange}
                className="peer sr-only"
              />
              <div className="h-7 w-12 rounded-full bg-[#D9C5B8] peer-checked:bg-[#A75C34] transition"></div>

              <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5"></div>
            </label>
          </div>

          <div className="mt-6">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Tax Percentage (%)
            </label>

            <input
              type="number"
              name="taxPercentage"
              value={formData.taxPercentage}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 py-3 text-sm outline-none focus:border-[#B56A3C]"
            />

            {errors.taxPercentage && (
              <p className="text-red-500 text-sm mt-1">
                {errors.taxPercentage}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-10 px-5 rounded-xl border border-[#E9DDD3] bg-white text-[#6E6258] font-medium hover:bg-[#F8F3EF] transition"
        >
          Cancel
        </button>

        <Button
          type="button"
          onClick={handleSave}
          loading={loading}
          disabled={loading}
          className="h-10 px-5 rounded-xl bg-[#A85A32] text-white font-medium hover:bg-[#8F4D2A]"
        >
          Save Rule
        </Button>
      </div>
    </div>
  );
}
