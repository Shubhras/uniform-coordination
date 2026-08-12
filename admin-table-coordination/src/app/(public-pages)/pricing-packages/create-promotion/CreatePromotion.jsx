"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiCreatePromoCode,
  apiUpdatePromotion,
  apiPromoCodeDetails,
} from "@/services/PricingPackages";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { useTranslations } from "next-intl";

import {
  FiArrowLeft,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
} from "react-icons/fi";

const inputClassName =
  "h-[42px] w-full rounded-[10px] border border-[#F2E5DD] bg-[#FFFCFA] px-4 text-[13px] text-[#5C4F48] outline-none focus:border-[#B56735]";

const textareaClassName =
  "min-h-[90px] w-full rounded-[10px] border border-[#F2E5DD] bg-[#FFFCFA] px-4 py-3 text-[13px] text-[#5C4F48] outline-none focus:border-[#B56735]";

const labelClassName =
  "mb-2 block text-[13px] font-bold uppercase tracking-wider text-[#8C6E5D]";

const CreatePromotion = () => {
  const t = useTranslations("pricingPackages.promotions");
  const ts = useTranslations("successTitle");
  const te = useTranslations("errorTitle");
  const router = useRouter();
  const params = useParams();
  console.log("params", params);
  console.log("promotionId", params.id);

  const promotionId = params.id;
  const isEdit = !!promotionId;

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!form.promocodeName.trim()) {
      newErrors.promocodeName = t("validation.nameRequired");
    }

    if (!form.promocodeType) {
      newErrors.promocodeType = t("validation.typeRequired");
    }

    if (!form.amount) {
      newErrors.amount = t("validation.amountRequired");
    } else if (Number(form.amount) <= 0) {
      newErrors.amount = t("validation.amountGreaterThanZero");
    }

    if (!form.started_at) {
      newErrors.started_at = t("validation.startDateRequired");
    }

    if (!form.ended_at) {
      newErrors.ended_at = t("validation.endDateRequired");
    }

    if (
      form.started_at &&
      form.ended_at &&
      new Date(form.ended_at) <= new Date(form.started_at)
    ) {
      newErrors.ended_at = t("validation.endAfterStart");
    }

    if (!form.description.trim()) {
      newErrors.description = t("validation.descriptionRequired");
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    promocodeName: "",
    promocodeType: "discount",
    amount: "",
    // min_order_value: "",
    // limit_uses: false,
    // max_uses: "",
    started_at: "",
    ended_at: "",
    isActive: true,
    description: "",
  });

  useEffect(() => {
    if (!isEdit || !accessToken) return;

    const getPromotionDetails = async () => {
      try {
        const res = await apiPromoCodeDetails(accessToken, promotionId);

        if (res?.status) {
          const data = res.data;

          setForm({
            promocodeName: data.promocodeName || "",
            promocodeType: data.promocodeType || "discount",
            amount: data.amount || "",
            started_at: data.started_at
              ? new Date(data.started_at).toISOString().slice(0, 16)
              : "",
            ended_at: data.ended_at
              ? new Date(data.ended_at).toISOString().slice(0, 16)
              : "",
            isActive: data.isActive,
            description: data.description || "",
          });
        }
      } catch (error) {
        console.log(error);
      }
    };

    getPromotionDetails();
  }, [isEdit, promotionId, accessToken]);

  const handleCreate = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("promocodeName", form.promocodeName);
      formData.append("promocodeType", form.promocodeType);
      formData.append("amount", form.amount);
      // formData.append("min_order_value", form.min_order_value);
      // formData.append("limit_uses", form.limit_uses);
      // formData.append("max_uses", form.max_uses);

      formData.append("started_at", new Date(form.started_at).toISOString());

      formData.append("ended_at", new Date(form.ended_at).toISOString());

      formData.append("isActive", form.isActive);
      formData.append("description", form.description);

      // const res = await apiCreatePromoCode(accessToken, formData);
      let res;

      if (isEdit) {
        res = await apiUpdatePromotion(accessToken, promotionId, formData);
      } else {
        res = await apiCreatePromoCode(accessToken, formData);
      }
      if (res?.status) {
        toast.push(
          <Notification title={ts("success")} type="success">
            {res.message}
          </Notification>,
        );

        router.push("/pricing-packages");
      }
    } catch (err) {
      toast.push(
        <Notification title={te("error")} type="danger">
          {err?.response?.data?.message || t("genericError")}
        </Notification>,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EDE0D7] bg-white text-[#6F6058]"
        >
          <FiArrowLeft size={16} />
        </button>

        <h1 className="text-[30px] font-semibold text-[#2A211D]">
          {isEdit ? t("editPromotion") : t("createPromotion")}
        </h1>
      </div>

      <div className="mt-6 rounded-[14px] border border-[#F0E4DB] bg-white p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClassName}>{t("promotionName")}</label>

            <input
              type="text"
              name="promocodeName"
              value={form.promocodeName}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  promocodeName: e.target.value,
                }));

                setErrors((prev) => ({
                  ...prev,
                  promocodeName: "",
                }));
              }}
              className={inputClassName}
              placeholder={t("namePlaceholder")}
            />
            {errors.promocodeName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.promocodeName}
              </p>
            )}
          </div>

          {/* Promotion Type */}
          <div>
            <label className={labelClassName}>{t("promotionType")}</label>

            <div className="relative">
              <select
                name="promocodeType"
                value={form.promocodeType}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    promocodeType: e.target.value,
                  }));

                  setErrors((prev) => ({
                    ...prev,
                    promocodeType: "",
                  }));
                }}
                className={`${inputClassName} appearance-none`}
              >
                <option value="discount">{t("typePercentage")}</option>
                <option value="fix_price">{t("typeFixedPrice")}</option>
              </select>
              {errors.promocodeType && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.promocodeType}
                </p>
              )}
              <FiChevronDown
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A38D82] pointer-events-none"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className={labelClassName}>{t("discountValue")}</label>

            <input
              type="number"
              name="amount"
              min={0}
              value={form.amount}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  amount: e.target.value,
                }));

                setErrors((prev) => ({
                  ...prev,
                  amount: "",
                }));
              }}
              className={inputClassName}
              placeholder={t("amountPlaceholder")}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          {/* Minimum Order */}
          {/* <div>
            <label className={labelClassName}>Minimum Order Value</label>

            <input
              type="number"
              name="min_order_value"
              value={form.min_order_value}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Minimum order value"
            />
          </div>

          <div>
            <label className={labelClassName}>Maximum Uses</label>

            <input
              type="number"
              name="max_uses"
              value={form.max_uses}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Maximum usage"
            />
          </div> */}

          {/* Start Date */}
          <div>
            <label className={labelClassName}>{t("startDate")}</label>

            <div className="relative">
              <input
                type="datetime-local"
                name="started_at"
                value={form.started_at}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    started_at: e.target.value,
                  }));

                  setErrors((prev) => ({
                    ...prev,
                    started_at: "",
                  }));
                }}
                className={inputClassName}
              />

              <FiCalendar
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A38D82] pointer-events-none"
              />
            </div>
            {errors.started_at && (
              <p className="mt-1 text-sm text-red-500">{errors.started_at}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className={labelClassName}>{t("endDate")}</label>

            <div className="relative">
              <input
                type="datetime-local"
                name="ended_at"
                value={form.ended_at}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    ended_at: e.target.value,
                  }));

                  setErrors((prev) => ({
                    ...prev,
                    ended_at: "",
                  }));
                }}
                className={inputClassName}
              />

              <FiCalendar
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A38D82] pointer-events-none"
              />
            </div>
            {errors.ended_at && (
              <p className="mt-1 text-sm text-red-500">{errors.ended_at}</p>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className={labelClassName}>{t("descriptionLabel")}</label>

            <textarea
              name="description"
              value={form.description}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }));

                setErrors((prev) => ({
                  ...prev,
                  description: "",
                }));
              }}
              className={textareaClassName}
              placeholder={t("descriptionPlaceholder")}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Limit Uses */}
          {/* <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="limit_uses"
                checked={form.limit_uses}
                onChange={handleChange}
                className="h-4 w-4 accent-[#B56735]"
              />

              <span className="text-[14px] text-[#4B3F38]">
                Limit number of uses
              </span>
            </label>
          </div> */}
        </div>

        {/* Active Status */}
        <div className="mt-6 flex items-center justify-between border-t border-[#F3E7DE] pt-5">
          <div>
            <h3 className="text-[14px] font-semibold text-[#2F241F]">
              {t("activeStatus")}
            </h3>

            <p className="mt-1 text-[12px] text-[#A08E83]">
              {t("promoImmediately")}
            </p>
          </div>

          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  isActive: e.target.checked,
                }));
              }}
              className="peer sr-only"
            />

            <div className="peer h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-[#B56735] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5"></div>
          </label>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-[#EAD9CD] px-6 py-2.5 text-[13px] font-medium text-[#6E615A]"
        >
          {t("cancel")}
        </button>

        <button
          type="button"
          onClick={handleCreate}
          disabled={loading}
          className="rounded-xl bg-[#B56735] px-5 py-1 text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? isEdit
              ? t("updating")
              : t("creating")
            : isEdit
              ? t("updatePromotion")
              : t("createPromotion")}
        </button>
      </div>
    </div>
  );
};

export default CreatePromotion;
