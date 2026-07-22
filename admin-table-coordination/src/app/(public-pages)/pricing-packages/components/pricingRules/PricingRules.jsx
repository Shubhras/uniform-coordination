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

const iconMap = {
  rental_pricing_rule: {
    icon: TbPercentage,
    iconClass: "bg-[#FFF2EA] text-[#C87B49]",
  },
  late_fee_rule: {
    icon: TbAlertTriangle,
    iconClass: "bg-[#FFF1EF] text-[#F05C57]",
  },
  grace_period: {
    icon: TbCalendarTime,
    iconClass: "bg-[#FFF6E9] text-[#E39A29]",
  },
  shipping_fee: {
    icon: TbTruckDelivery,
    iconClass: "bg-[#EEF4FF] text-[#5C85EE]",
  },
  consumption_tax: {
    icon: TbReceiptTax,
    iconClass: "bg-[#FFF3EB] text-[#D19060]",
  },
};

const PricingRules = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [pricingRules, setPricingRules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPricingRules = async () => {
      try {
        setLoading(true);

        const res = await apiGetPricingList(accessToken);

        if (res?.status) {
          setPricingRules(res?.data || []);
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
      {pricingRules.length > 0 &&
        (() => {
          const rule = pricingRules[0];

          const cards = [
            {
              icon: TbPercentage,
              iconClass: "bg-[#FFF2EA] text-[#C87B49]",
              title: "Base Rental Price",
              description: "Base rental amount used for pricing calculations",
              content: (
                <div className="mt-4 rounded-[12px] bg-[#FCF7F3] px-5 py-4">
                  <p className="text-[24px] font-semibold text-[#2F241F]">
                    ¥{rule.base_price}
                  </p>
                </div>
              ),
            },
            {
              icon: TbAlertTriangle,
              iconClass: "bg-[#FFF1EF] text-[#F05C57]",
              title: "Rush Order Multiplier",
              description: "Multiplier applied for rush orders",
              content: (
                <div className="mt-4 rounded-[12px] bg-[#FCF7F3] px-5 py-4">
                  <p className="text-[24px] font-semibold text-[#2F241F]">
                    {rule.rush_order_multiplier}×
                  </p>
                </div>
              ),
            },
            {
              icon: TbCalendarTime,
              iconClass: "bg-[#FFF6E9] text-[#E39A29]",
              title: "Tiered Pricing",
              description: "Enable or disable tiered pricing",
              content: (
                <div className="mt-4 rounded-[12px] bg-[#FCF7F3] px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      rule.tiered_pricing_enabled
                        ? "bg-[#E8FAF2] text-[#007A55]"
                        : "bg-[#FDECEC] text-[#D14343]"
                    }`}
                  >
                    {rule.tiered_pricing_enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              ),
            },
            {
              icon: TbReceiptTax,
              iconClass: "bg-[#FFF3EB] text-[#D19060]",
              title: "Tax",
              description: "Applied tax settings",
              content: (
                <div className="mt-4 flex gap-3">
                  <div className="rounded-[12px] bg-[#FCF7F3] px-5 py-4">
                    <p className="text-[22px] font-semibold text-[#2F241F]">
                      {rule.tax_rate}%
                    </p>
                  </div>

                  <div className="rounded-[12px] bg-[#FCF7F3] px-5 py-4">
                    <p className="text-[14px] text-[#5F534C] capitalize">
                      {rule.tax_type}
                    </p>
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
                    <h2 className="text-[14px] font-semibold text-[#2F241F]">
                      {card.title}
                    </h2>

                    <p className="mt-1 text-[11px] text-[#B29D8C]">
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
