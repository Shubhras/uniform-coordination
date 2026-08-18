"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
  apiUpdatePricingList,
  apiGetPricingList,
} from "@/services/PricingPackages";
import { FiArrowLeft } from "react-icons/fi";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";

export default function EditPricingRules() {
  const t = useTranslations("pricingPackages.pricingRules");
  const ts = useTranslations("successTitle");
  const te = useTranslations("errorTitle");
  const router = useRouter();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    lateFeeFormula: "",
    lateFeeRate: "",
    gracePeriod: "",
    flatShippingFee: "",
    enableConsumptionTax: false,
    taxPercentage: "",
  });
  useEffect(() => {
    const fetchPricingRules = async () => {
      try {
        const res = await apiGetPricingList(accessToken);

        if (res?.success) {
          const data = res.data;

          setFormData({
            lateFeeFormula: data.late_fee_formula_label || "",
            lateFeeRate: data.late_fee_rate || "",
            gracePeriod: data.grace_period_days || "",
            flatShippingFee: data.flat_shipping_fee || "",
            enableConsumptionTax: data.enable_consumption_tax,
            taxPercentage: data.tax_percentage || "",
          });
        }
      } catch (error) {
        console.log("Pricing Rules Error", error);
      }
    };

    if (accessToken) {
      fetchPricingRules();
    }
  }, [accessToken]);

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
      newErrors.lateFeeFormula = t("validation.lateFeeFormulaRequired");
    }

    if (!formData.lateFeeRate) {
      newErrors.lateFeeRate = t("validation.lateFeeRateRequired");
    }

    if (!formData.gracePeriod) {
      newErrors.gracePeriod = t("validation.gracePeriodRequired");
    }

    if (!formData.flatShippingFee) {
      newErrors.flatShippingFee = t("validation.shippingFeeRequired");
    }

    if (!formData.taxPercentage) {
      newErrors.taxPercentage = t("validation.taxPercentageRequired");
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
        <Notification title={ts("success")} type="success">
          {res?.data?.message || t("updateSuccess")}
        </Notification>,
      );

      router.back();
    } catch (error) {
      toast.push(
        <Notification title={te("error")} type="danger">
          {error?.response?.data?.message || t("somethingWentWrong")}
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
          {t("editPrice")}
        </h1>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-[#EFE5DC] bg-white p-5">
        {/* Late Fee */}
        <div>
          <h2 className="text-lg font-semibold text-[#2C1A0E]">
            {t("lateFeeConfig")}
          </h2>

          <p className="mt-1 text-sm text-[#9A8B82]">{t("define")}</p>

          <div className="mt-6">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              {t("lateFeeFormulaLabel")}
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
              {t("descriptiveFormula")}
            </p>
          </div>

          <div className="mt-6">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              {t("lateFeeRateLabel")}
            </label>

            <input
              type="number"
              name="lateFeeRate"
              value={formData.lateFeeRate}
              onChange={handleChange}
              min={0}
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
            {t("returnDelivery")}
          </h2>

          <p className="mt-1 text-sm text-[#9A8B82]">{t("deliveryContent")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
                {t("gracePeriodLabel")}
              </label>

              <input
                type="number"
                name="gracePeriod"
                value={formData.gracePeriod}
                onChange={handleChange}
                min={0}
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
                {t("flatShippingFeeLabel")}
              </label>

              <input
                type="number"
                name="flatShippingFee"
                value={formData.flatShippingFee}
                onChange={handleChange}
                min={0}
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
          <h2 className="text-lg font-semibold text-[#2C1A0E]">
            {t("taxSetting")}
          </h2>

          <p className="mt-1 text-sm text-[#9A8B82]">
            {t("taxsettingContent")}
          </p>

          {/* Toggle Card */}
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#E9DDD3] bg-[#FCFAF8] px-5 py-2">
            <div>
              <h3 className="font-semibold text-[#2C1A0E] text-[15px]">
                {t("enableTax")}
              </h3>

              <p className="text-[13px] text-[#9A8B82] mt-1">
                {t("applySales")}
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
              {t("taxPercentageLabel")}
            </label>

            <input
              type="number"
              name="taxPercentage"
              value={formData.taxPercentage}
              onChange={handleChange}
              min={0}
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
          className="h-10 px-5 rounded-lg border border-[#E9DDD3] bg-white text-[#6E6258] font-medium hover:bg-[#F8F3EF] transition"
        >
          {t("cancel")}
        </button>

        <Button
          type="button"
          onClick={handleSave}
          loading={loading}
          disabled={loading}
          className="h-10 px-5 rounded-lg bg-[#A85A32] text-white font-medium hover:bg-[#8F4D2A]"
        >
          {t("saveRule")}
        </Button>
      </div>
    </div>
  );
}
