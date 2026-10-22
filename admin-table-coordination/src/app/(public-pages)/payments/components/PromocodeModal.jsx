"use client";

import React, { useState, useEffect } from "react";
import { FiTag, FiX } from "react-icons/fi";
import { useTranslations } from "next-intl";

const PromocodeModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedPromocode,
  promoForm,
  setPromoForm,
  promoSubmitting,
}) => {
  const t = useTranslations("paymentManagement");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!promoForm.promocodeName?.trim()) {
      newErrors.promocodeName = t("validation.promocodeNameRequired");
    }

    if (!promoForm.description?.trim()) {
      newErrors.description = t("validation.descriptionRequired");
    }

    if (!promoForm.promocodeType) {
      newErrors.promocodeType = t("validation.discountTypeRequired");
    }

    if (!String(promoForm.amount ?? "").trim()) {
      newErrors.amount = t("validation.amountRequired");
    } else if (Number(promoForm.amount) < 0) {
      newErrors.amount = t("validation.amountNegative");
    } else if (Number(promoForm.amount) === 0) {
      newErrors.amount = t("validation.amountGreaterThanZero");
    } else if (
      promoForm.promocodeType === "discount" &&
      Number(promoForm.amount) > 100
    ) {
      newErrors.amount = t("validation.amountPercentageMax");
    }

    if (
      promoForm.min_order_value !== "" &&
      promoForm.min_order_value !== null &&
      promoForm.min_order_value !== undefined &&
      Number(promoForm.min_order_value) < 0
    ) {
      newErrors.min_order_value = t("validation.minOrderValueNegative");
    }

    if (promoForm.limit_uses) {
      if (!String(promoForm.max_uses ?? "").trim()) {
        newErrors.max_uses = t("validation.maxUsesRequired");
      } else if (Number(promoForm.max_uses) <= 0) {
        newErrors.max_uses = t("validation.maxUsesGreaterThanZero");
      }
    }

    if (
      promoForm.started_at &&
      promoForm.ended_at &&
      new Date(promoForm.ended_at) <= new Date(promoForm.started_at)
    ) {
      newErrors.ended_at = t("validation.endAfterStart");
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    onSubmit(e);
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiTag className="text-[#A0522D]" />
            {selectedPromocode
              ? t("editPromocode")
              : t("createNewPromocode")}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl"
          >
            <FiX />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {t("promocodeNameCode")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={promoForm.promocodeName}
              onChange={(e) => {
                setPromoForm({
                  ...promoForm,
                  promocodeName: e.target.value.toUpperCase(),
                });
                setErrors((prev) => ({
                  ...prev,
                  promocodeName: "",
                }));
              }}
              placeholder="e.g. SUMMER2026"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
            {errors.promocodeName && (
              <p className="text-red-500 text-sm mt-1">{errors.promocodeName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {t("description")} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={promoForm.description}
              onChange={(e) => {
                setPromoForm({
                  ...promoForm,
                  description: e.target.value,
                });
                setErrors((prev) => ({
                  ...prev,
                  description: "",
                }));
              }}
              placeholder={t("promocodeTermsDetails")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {t("discountType")} <span className="text-red-500">*</span>
              </label>
              <select
                value={promoForm.promocodeType}
                onChange={(e) => {
                  setPromoForm({
                    ...promoForm,
                    promocodeType: e.target.value,
                  });
                  setErrors((prev) => ({
                    ...prev,
                    promocodeType: "",
                    amount: "",
                  }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
              >
                <option value="discount"> {t("percentageDiscount")}</option>
                <option value="fix_price"> {t("fixedAmount")}</option>
              </select>
              {errors.promocodeType && (
                <p className="text-red-500 text-sm mt-1">{errors.promocodeType}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {t("amountValue")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={promoForm.amount}
                onChange={(e) => {
                  setPromoForm({ ...promoForm, amount: e.target.value });
                  setErrors((prev) => ({
                    ...prev,
                    amount: "",
                  }));
                }}
                placeholder={
                  promoForm.promocodeType === "discount"
                    ? t("percentagePlaceholder")
                    : t("fixedAmountPlaceholder")
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {t("minimumOrderValue")}
            </label>
            <input
              type="number"
              step="0.01"
              value={promoForm.min_order_value}
              onChange={(e) => {
                setPromoForm({
                  ...promoForm,
                  min_order_value: e.target.value,
                });
                setErrors((prev) => ({
                  ...prev,
                  min_order_value: "",
                }));
              }}
              placeholder={t("optionalMinimumCartTotal")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
            />
            {errors.min_order_value && (
              <p className="text-red-500 text-sm mt-1">{errors.min_order_value}</p>
            )}
          </div>

          <div className="flex items-center gap-3 py-1">
            <input
              type="checkbox"
              id="limit_uses"
              checked={promoForm.limit_uses}
              onChange={(e) => {
                setPromoForm({
                  ...promoForm,
                  limit_uses: e.target.checked,
                });
                setErrors((prev) => ({
                  ...prev,
                  max_uses: "",
                }));
              }}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="limit_uses"
              className="text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              {t("limitMaximumUses")}
            </label>
          </div>

          {promoForm.limit_uses && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {t("maxUsesCount")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={promoForm.max_uses}
                onChange={(e) => {
                  setPromoForm({ ...promoForm, max_uses: e.target.value });
                  setErrors((prev) => ({
                    ...prev,
                    max_uses: "",
                  }));
                }}
                placeholder={t("maxUsesPlaceholder")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
              />
              {errors.max_uses && (
                <p className="text-red-500 text-sm mt-1">{errors.max_uses}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {t("startDate")}
              </label>
              <input
                type="datetime-local"
                value={promoForm.started_at}
                onChange={(e) => {
                  setPromoForm({
                    ...promoForm,
                    started_at: e.target.value,
                  });
                  setErrors((prev) => ({
                    ...prev,
                    started_at: "",
                    ended_at: "",
                  }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs focus:outline-none"
              />
              {errors.started_at && (
                <p className="text-red-500 text-sm mt-1">{errors.started_at}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {t("endDate")}
              </label>
              <input
                type="datetime-local"
                value={promoForm.ended_at}
                onChange={(e) => {
                  setPromoForm({ ...promoForm, ended_at: e.target.value });
                  setErrors((prev) => ({
                    ...prev,
                    ended_at: "",
                  }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs focus:outline-none"
              />
              {errors.ended_at && (
                <p className="text-red-500 text-sm mt-1">{errors.ended_at}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 py-1">
            <input
              type="checkbox"
              id="isActive"
              checked={promoForm.isActive}
              onChange={(e) =>
                setPromoForm({ ...promoForm, isActive: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="isActive"
              className="text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              {t("promocodeActive")}
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={promoSubmitting}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#A0522D] text-white shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {promoSubmitting
              ? t("saving")
              : selectedPromocode
                ? t("updatePromocode")
                : t("savePromocode")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromocodeModal;
