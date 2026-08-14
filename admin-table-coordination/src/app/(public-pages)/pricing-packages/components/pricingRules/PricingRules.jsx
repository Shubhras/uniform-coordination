"use client";

import {
  TbCalendarTime,
  TbAlertTriangle,
  TbPercentage,
  TbReceiptTax,
  TbTruckDelivery,
} from "react-icons/tb";
import { useEffect, useState } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetPricingList } from "@/services/PricingPackages";
import { useTranslations } from "next-intl";

const PricingRules = () => {
  const t = useTranslations("pricingPackages.pricingRules");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [pricingRules, setPricingRules] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPricingRules = async () => {
      try {
        setLoading(true);

        const res = await apiGetPricingList(accessToken);

        if (res?.success) {
          setPricingRules(res.data);
        }
      } catch (error) {
        console.log("Pricing Rules Error", error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchPricingRules();
    }
  }, [accessToken]);

  return (
    <div className="mt-5 space-y-4">
      {pricingRules &&
        (() => {
          const rule = pricingRules;

          const cards = [
            {
              icon: TbPercentage,
              iconClass: "bg-[#FFF2EA] text-[#C87B49]",
              title: t("pricingFormula"),
              description: t("pricingFormulaContent"),
              content: (
                <div className="mt-4 rounded-[12px] bg-[#FCF7F3] px-5 py-3">
                  <p className="text-[17px] font-semibold text-[#2F241F]">
                    {rule.rental_pricing_formula_label}
                  </p>
                </div>
              ),
            },
            {
              icon: TbAlertTriangle,
              iconClass: "bg-[#FFF1EF] text-[#F05C57]",
              title: t("lateFee"),
              description: t("lateFeeContent"),
              content: (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {/* Late Fee Rate */}
                  <div className="rounded-2xl border border-[#F3E9E2] bg-[#FCF7F3] px-5 py-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A08D82]">
                      {t("lateFeeRate")}
                    </p>

                    <div className="flex items-end gap-1">
                      <span className="text-[24px] font-semibold leading-none text-[#2F241F]">
                        {rule.late_fee_rate}%
                      </span>
                      <span className="text-[14px] text-[#8A7A71]">/ day</span>
                    </div>
                  </div>

                  {/* Formula */}
                  <div className="rounded-2xl border border-[#F3E9E2] bg-[#FCF7F3] px-5 py-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A08D82]">
                      {t("formula")}
                    </p>

                    <p className="text-[15px] font-medium leading-6 text-[#5A4C44]">
                      {rule.late_fee_formula_label}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              icon: TbCalendarTime,
              iconClass: "bg-[#FFF6E9] text-[#E39A29]",
              title: t("gracePeriod"),
              description: t("graceContent"),
              content: (
                <div className="mt-4 flex items-center gap-4">
                  {/* Days Box */}
                  <div className="flex min-w-[72px] items-end justify-center rounded-2xl border border-[#F3E9E2] bg-[#FCF7F3] px-4 py-3">
                    <span className="text-[36px] font-semibold leading-none text-[#2F241F]">
                      {rule.grace_period_days}
                    </span>
                    <span className="ml-2 text-[15px] text-[#8A7A71]">
                      {t("days")}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="max-w-md text-[14px] leading-6 text-[#9B8B82]">
                    {t("clienttext")}
                    <span className="font-medium">
                      {rule.grace_period_days} {t("days")}
                    </span>{" "}
                    {t("dayspost")}
                  </p>
                </div>
              ),
            },
            {
              icon: TbTruckDelivery,
              iconClass: "bg-[#EEF4FF] text-[#5C85EE]",
              title: t("flatRound"),
              description: t("flatRoundContent"),
              content: (
                <div className="mt-4">
                  <div className="inline-flex items-end rounded-2xl border border-[#F3E9E2] bg-[#FCF7F3] px-5 py-4">
                    <span className="text-[37px] font-semibold leading-none text-[#2F241F]">
                      ${rule.flat_shipping_fee}
                    </span>

                    <span className="ml-2 text-[17px] text-[#9C8476]">
                      {t("perEvent")}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              icon: TbReceiptTax,
              iconClass: "bg-[#FFF3EB] text-[#D19060]",
              title: t("consumptionTax"),
              description: t("consumpTaxContent"),
              content: (
                <div className="mt-4 flex gap-3">
                  <div className="mt-4 rounded-[12px] bg-[#FCF7F3] px-5 py-3">
                    <p className="text-[20px] font-semibold text-[#2F241F]">
                      {rule.tax_percentage}%
                    </p>
                  </div>
                  <div className="rounded-[12px] px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-2 text-xs font-medium ${
                        rule.enable_consumption_tax
                          ? "bg-[#E8FAF2] text-[#007A55]"
                          : "bg-[#FDECEC] text-[#D14343]"
                      }`}
                    >
                      {rule.enable_consumption_tax ? t("enabled") : t("disabled")}
                    </span>
                  </div>
                </div>
              ),
            },
          ];

          return cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-[14px] border border-[#F0E4DB] bg-white p-4 sm:p-5"
              >
                <div className="flex gap-4">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${card.iconClass}`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-[16px] font-semibold text-[#2F241F]">
                      {card.title}
                    </h2>

                    <p className="mt-1 text-[13px] text-[#B29D8C]">
                      {card.description}
                    </p>

                    {card.content}
                  </div>
                </div>
              </div>
            );
          });
        })()}
    </div>
  );
};

export default PricingRules;
