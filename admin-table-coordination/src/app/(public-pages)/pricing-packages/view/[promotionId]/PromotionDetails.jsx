"use client";

import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import Spinner from "@/components/ui/Spinner";
import { apiPromoCodeDetails } from "@/services/PricingPackages";

const PromotionDetails = ({ promotionId }) => {
  const t = useTranslations("pricingPackages.promotions");
  const locale = useLocale();
  const router = useRouter();

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPromotionDetails = async () => {
    try {
      setLoading(true);

      const res = await apiPromoCodeDetails(accessToken, promotionId);

      if (res?.status) {
        setPromotion(res.data);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && promotionId) {
      getPromotionDetails();
    }
  }, [accessToken, promotionId]);

  if (!promotionId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full border border-[#E7D9CF] bg-white flex items-center justify-center hover:bg-[#F8F4F1]"
        >
          <FiArrowLeft className="text-lg text-[#5B4434]" />
        </button>
        <h1 className="text-[30px] font-semibold leading-tight text-[#2A211D]">
          {t("promotionDetails")}
        </h1>
      </div>

      <div className="mt-5 rounded-[14px] border border-[#F0E4DB] bg-white p-5">
        <div className="grid gap-x-10 gap-y-5 md:grid-cols-3">
          <div>
            <p className="text-[13px] font-semibold text-[#B3A096]">
              {t("promotionName")}
            </p>
            <p className="mt-2 text-[15px] font-medium text-[#3F332C]">
              {promotion?.promocodeName}
            </p>
          </div>
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">
              {t("promotionType")}
            </p>
            <p className="mt-2 text-[15px] font-medium text-[#3F332C]">
              {promotion?.promocodeType?.replace("_", " ")}
            </p>
          </div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-semibold text-[#B3A096]">
                {t("discountValue")}
              </p>
              <p className="mt-2 text-[15px] font-medium text-[#3F332C]">
                {promotion?.promocodeType === "percentage"
                  ? `${promotion?.amount}%`
                  : `₹ ${promotion?.amount}`}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium ${
                promotion?.isActive
                  ? "bg-[#E8FAF2] text-[#007A55]"
                  : "bg-[#FFE9E8] text-[#F04444]"
              }`}
            >
              {promotion?.isActive ? t("statusActive") : t("statusInactive")}
            </span>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-[#B3A096]">
              {t("startDate")}
            </p>
            <p className="mt-2 text-[15px] font-medium text-[#3F332C]">
              {promotion?.started_at
                ? new Date(promotion.started_at).toLocaleDateString(locale)
                : "-"}{" "}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-[#B3A096]">{t("endDate")}</p>
            <p className="mt-2 text-[15px] font-medium text-[#3F332C]">
              {promotion?.ended_at
                ? new Date(promotion.ended_at).toLocaleDateString(locale)
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">
              {t("eligibleCustomers")}
            </p>
            <p className="mt-2 text-[15px] font-medium text-[#3F332C]">
              {promotion?.eligibleCustomers || "-"}
            </p>
          </div>
          <div className="md:col-span-3">
            <p className="text-[9px] font-semibold text-[#B3A096]">
              {t("descriptionLabel")}
            </p>
            <p className="mt-2 text-[14px] font-semibold uppercase text-[#3F332C]">
              {promotion?.description || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionDetails;
