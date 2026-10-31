"use client";

import { useState, useEffect, useMemo } from "react";
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
import Select from "react-select";

import {
  FiArrowLeft,
  FiCalendar,
  FiPackage,
} from "react-icons/fi";

const inputClassName =
  "w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 outline-none focus:border-[#A85A32]";

const textareaClassName =
  "min-h-[90px] w-full rounded-[10px] border border-[#F2E5DD] bg-[#FFFCFA] px-4 py-3 text-[13px] text-[#5C4F48] outline-none focus:border-[#B56735]";

const labelClassName =
  "mb-2 block text-[13px] font-bold uppercase tracking-wider text-[#8C6E5D]";

const formatDateToYYYYMMDD = (dateValue) => {
  if (!dateValue) return "";
  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
    return dateValue.slice(0, 10);
  }
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

  const today = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!form.promocodeName.trim()) {
      newErrors.promocodeName = t("validation.nameRequired");
    }

    if (!form.promocodeType) {
      newErrors.promocodeType = t("validation.typeRequired");
    }

    if (!String(form.amount || "").trim()) {
      newErrors.amount = t("validation.amountRequired");
    } else if (Number(form.amount) < 0) {
      newErrors.amount = t("validation.amountNegative");
    } else if (Number(form.amount) <= 0) {
      newErrors.amount = t("validation.amountGreaterThanZero");
    } else if (form.promocodeType === "discount" && Number(form.amount) >= 100) {
      newErrors.amount = t("validation.amountPercentageMax");
    }

    if (!form.started_at) {
      newErrors.started_at = t("validation.startDateRequired");
    } else if (!isEdit && form.started_at < today) {
      newErrors.started_at =
        t("validation.startDatePast") || "Start date cannot be before today";
    }

    if (!form.ended_at) {
      newErrors.ended_at = t("validation.endDateRequired");
    } else if (form.started_at && form.ended_at < form.started_at) {
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
    customerEligibility: "all",
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

          const rawDesc = data.description || "";
          let eligibility = "all";
          if (rawDesc.includes("[Eligibility: first_purchase]")) {
            eligibility = "first_purchase";
          } else if (rawDesc.includes("[Eligibility: repeat_customer]")) {
            eligibility = "repeat_customer";
          }

          setForm({
            promocodeName: data.promocodeName || "",
            promocodeType: data.promocodeType || "discount",
            customerEligibility: eligibility,
            amount: data.amount || "",
            started_at: data.started_at
              ? formatDateToYYYYMMDD(data.started_at)
              : "",
            ended_at: data.ended_at
              ? formatDateToYYYYMMDD(data.ended_at)
              : "",
            isActive: data.isActive,
            description: rawDesc.replace(/\[Eligibility:\s*[^\]]+\]\s*/g, "").trim(),
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

      const startDateTime = new Date(`${form.started_at}T00:00:00`);
      formData.append(
        "started_at",
        !isNaN(startDateTime.getTime())
          ? startDateTime.toISOString()
          : form.started_at,
      );

      const endDateTime = new Date(`${form.ended_at}T23:59:59.999`);
      formData.append(
        "ended_at",
        !isNaN(endDateTime.getTime())
          ? endDateTime.toISOString()
          : form.ended_at,
      );

      formData.append("isActive", form.isActive);
      let desc = (form.description || "").trim();
      if (form.customerEligibility === "first_purchase") {
        desc = `[Eligibility: first_purchase] ${desc}`.trim();
      } else if (form.customerEligibility === "repeat_customer") {
        desc = `[Eligibility: repeat_customer] ${desc}`.trim();
      }
      formData.append("description", desc);

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

        router.push("/pricing-packages?tab=promotions");
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

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "48px",
      height: "48px",
      borderColor: "#E9DDD3",
      borderRadius: "12px",
      backgroundColor: "#FCFAF8",
      boxShadow: "none",
      cursor: "pointer",
      "&:hover": {
        borderColor: "#A85A32",
      },
    }),

    valueContainer: (base) => ({
      ...base,
      height: "48px",
      padding: "0 12px",
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),

    dropdownIndicator: (base) => ({
      ...base,
      color: "#8D7A6C",
      "&:hover": {
        color: "#8D7A6C",
      },
    }),

    placeholder: (base) => ({
      ...base,
      color: "#8D7A6C",
    }),

    singleValue: (base) => ({
      ...base,
      color: "#2C1A0E",
    }),

    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#A85A32"
        : state.isFocused
          ? "#F8F2ED"
          : "#fff",
      color: state.isSelected ? "#fff" : "#444",
      cursor: "pointer",
    }),
  };

  const promocodeTypeOptions = [
    { value: "discount", label: t("typePercentage") },
    { value: "fix_price", label: t("typeFixedPrice") },
  ];

  const customerEligibilityOptions = [
    { value: "all", label: t("eligibilityAll") },
    { value: "first_purchase", label: t("eligibilityFirstPurchase") },
    { value: "repeat_customer", label: t("eligibilityRepeatCustomer") },
  ];

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => router.push("/pricing-packages?tab=promotions")}
          className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border border-[#EDE0D7] bg-white text-[#6F6058] hover:bg-[#FAF6F3] transition"
        >
          <FiArrowLeft size={18} />
        </button>

        <h1 className="text-xl xs:text-2xl sm:text-[30px] font-semibold text-[#2A211D] tracking-tight">
          {isEdit ? t("editPromotion") : t("createPromotion")}
        </h1>
      </div>

      <div className="mt-6 rounded-[14px] border border-[#F0E4DB] bg-white p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClassName}>
              {t("promotionName")} <span className="text-red-500">*</span>
            </label>

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
            <label className={labelClassName}>
              {t("promotionType")} <span className="text-red-500">*</span>
            </label>

            <Select
              value={
                promocodeTypeOptions.find(
                  (opt) => opt.value === form.promocodeType
                ) || promocodeTypeOptions[0]
              }
              onChange={(selected) => {
                const newType = selected?.value;
                setForm((prev) => ({
                  ...prev,
                  promocodeType: newType,
                }));

                setErrors((prev) => {
                  let amountError = prev.amount;
                  if (
                    newType === "discount" &&
                    form.amount &&
                    Number(form.amount) >= 100
                  ) {
                    amountError = t("validation.amountPercentageMax");
                  } else if (
                    newType === "fix_price" &&
                    amountError === t("validation.amountPercentageMax")
                  ) {
                    amountError = "";
                  }
                  return {
                    ...prev,
                    promocodeType: "",
                    amount: amountError,
                  };
                });
              }}
              options={promocodeTypeOptions}
              styles={selectStyles}
              placeholder={t("promotionType")}
              isSearchable={false}
            />
            {errors.promocodeType && (
              <p className="mt-1 text-sm text-red-500">
                {errors.promocodeType}
              </p>
            )}
          </div>

          {/* Customer Eligibility (First Purchase / Repeat Customer / All Customers) */}
          <div>
            <label className={labelClassName}>{t("customerEligibility")}</label>
            <Select
              value={
                customerEligibilityOptions.find(
                  (opt) => opt.value === (form.customerEligibility || "all")
                ) || customerEligibilityOptions[0]
              }
              onChange={(selected) => {
                const newEligibility = selected?.value || "all";
                setForm((prev) => ({
                  ...prev,
                  customerEligibility: newEligibility,
                }));
              }}
              options={customerEligibilityOptions}
              styles={selectStyles}
              isSearchable={false}
            />
            <p className="mt-1 text-xs text-gray-500">
              {t("customerEligibilityHint")}
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className={labelClassName}>
              {t("discountValue")} {form.promocodeType === "discount" ? "(%)" : "(¥)"}{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={(e) => {
                const val = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  amount: val,
                }));

                let errorMsg = "";
                if (val !== "") {
                  if (Number(val) < 0) {
                    errorMsg = t("validation.amountNegative");
                  } else if (Number(val) === 0) {
                    errorMsg = t("validation.amountGreaterThanZero");
                  } else if (
                    form.promocodeType === "discount" &&
                    Number(val) >= 100
                  ) {
                    errorMsg = t("validation.amountPercentageMax");
                  }
                }

                setErrors((prev) => ({
                  ...prev,
                  amount: errorMsg,
                }));
              }}
              className={inputClassName}
              placeholder={
                form.promocodeType === "discount"
                  ? "e.g. 10 (%)"
                  : "e.g. 500 (¥)"
              }
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
            <label className={labelClassName}>
              {t("startDate")} <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <input
                type="date"
                name="started_at"
                min={
                  isEdit && form.started_at && form.started_at < today
                    ? form.started_at
                    : today
                }
                value={form.started_at}
                onClick={(e) => {
                  try {
                    e.target.showPicker?.();
                  } catch (err) { }
                }}
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
                className={`${inputClassName} cursor-pointer`}
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
            <label className={labelClassName}>
              {t("endDate")} <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <input
                type="date"
                name="ended_at"
                min={form.started_at || today}
                value={form.ended_at}
                onClick={(e) => {
                  try {
                    e.target.showPicker?.();
                  } catch (err) { }
                }}
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
                className={`${inputClassName} cursor-pointer`}
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
            <label className={labelClassName}>
              {t("descriptionLabel")} <span className="text-red-500">*</span>
            </label>

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
          onClick={() => router.push("/pricing-packages?tab=promotions")}
          className="rounded-lg border border-[#EAD9CD] px-6 py-2.5 text-[13px] font-medium text-[#6E615A]"
        >
          {t("cancel")}
        </button>

        <button
          type="button"
          onClick={handleCreate}
          disabled={loading}
          className="rounded-lg bg-[#B56735] px-5 py-1 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
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
