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

const PricingRules = () => {
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
              title: "Rental Pricing Formula",
              description: "Formula used for rental price calculation",
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
              title: "Late Fee Formula",
              description: "Formula used to calculate late fee",
              content: (
                <div className="mt-4 space-y-3">
                  <div className="rounded-[12px] bg-[#FCF7F3] px-5 py-3">
                    <p className="text-[15px] font-medium text-[#2F241F]">
                      {rule.late_fee_formula_label}
                    </p>
                  </div>

                  <div className="rounded-[12px] bg-[#FCF7F3] px-5 py-3">
                    <p className="text-[20px] font-semibold text-[#2F241F]">
                      {rule.late_fee_rate}%
                    </p>
                  </div>
                </div>
              ),
            },
            {
              icon: TbCalendarTime,
              iconClass: "bg-[#FFF6E9] text-[#E39A29]",
              title: "Grace Period",
              description: "Days allowed before charging late fee",
              content: (
                <div className="mt-4 rounded-[12px] bg-[#FCF7F3] px-5 py-3">
                  <p className="text-[20px] font-semibold text-[#2F241F]">
                    {rule.grace_period_days} Days
                  </p>
                </div>
              ),
            },
            {
              icon: TbTruckDelivery,
              iconClass: "bg-[#EEF4FF] text-[#5C85EE]",
              title: "Flat Shipping Fee",
              description: "Shipping charge per order",
              content: (
                <div className="mt-4 rounded-[12px] bg-[#FCF7F3] px-5 py-3">
                  <p className="text-[20px] font-semibold text-[#2F241F]">
                    ₹{rule.flat_shipping_fee}
                  </p>
                </div>
              ),
            },
            {
              icon: TbReceiptTax,
              iconClass: "bg-[#FFF3EB] text-[#D19060]",
              title: "Consumption Tax",
              description: "Tax applied to rental orders",
              content: (
                <div className="mt-4 flex gap-3">
                  <div className="rounded-[12px] bg-[#FCF7F3] px-5 py-3">
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
                      {rule.enable_consumption_tax ? "Enabled" : "Disabled"}
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
