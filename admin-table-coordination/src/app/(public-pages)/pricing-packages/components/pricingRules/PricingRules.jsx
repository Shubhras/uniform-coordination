"use client";

import {
  TbCalendarTime,
  TbAlertTriangle,
  TbPercentage,
  TbReceiptTax,
  TbTruckDelivery,
} from "react-icons/tb";

const ruleCards = [
  {
    icon: TbPercentage,
    iconClass: "bg-[#FFF2EA] text-[#C87B49]",
    title: "Rental Pricing Rule",
    badge: "SYSTEM MANAGED",
    description: "Core formula for calculating all rental costs — not editable",
    content: (
      <div className="mt-4 rounded-[12px] bg-[#FCF7F3] px-5 py-4 text-[14px] text-[#776860]">
        Daily Rate × Quantity × Rental Days
      </div>
    ),
  },
  {
    icon: TbAlertTriangle,
    iconClass: "bg-[#FFF1EF] text-[#F05C57]",
    title: "Late Fee Rule",
    description: "Applied when items are returned after the grace period",
    content: (
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-[12px] bg-[#FCF7F3] px-5 py-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">
            Late Fee Rate
          </p>
          <p className="mt-2 text-[22px] font-semibold text-[#2F241F]">5% <span className="text-[13px] font-medium text-[#927F73]">/day</span></p>
        </div>
        <div className="rounded-[12px] bg-[#FCF7F3] px-5 py-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">
            Formula
          </p>
          <p className="mt-2 text-[13px] text-[#5F534C]">
            Rental Value × Late Fee % × Days Overdue
          </p>
        </div>
      </div>
    ),
  },
  {
    icon: TbCalendarTime,
    iconClass: "bg-[#FFF6E9] text-[#E39A29]",
    title: "Grace Period",
    description: "Days after the event before late fees begin to apply",
    content: (
      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="rounded-[12px] bg-[#FCF7F3] px-5 py-4">
          <p className="text-[28px] font-semibold leading-none text-[#2F241F]">
            3 <span className="text-[13px] font-medium text-[#927F73]">days</span>
          </p>
        </div>
        <p className="text-[12px] text-[#A49489]">
          Clients have 3 days post-event to return all rental items without penalty.
        </p>
      </div>
    ),
  },
  {
    icon: TbTruckDelivery,
    iconClass: "bg-[#EEF4FF] text-[#5C85EE]",
    title: "Flat Round Trip Shipping Fee",
    description: "Fixed delivery and pickup charge applied once per event",
    content: (
      <div className="mt-4 inline-flex rounded-[12px] bg-[#FCF7F3] px-5 py-4">
        <p className="text-[22px] font-semibold text-[#2F241F]">¥150.00 <span className="text-[13px] font-medium text-[#927F73]">per event</span></p>
      </div>
    ),
  },
  {
    icon: TbReceiptTax,
    iconClass: "bg-[#FFF3EB] text-[#D19060]",
    title: "Consumption Tax",
    description: "Sales tax applied to all taxable rental transactions",
    content: (
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="rounded-[12px] bg-[#FCF7F3] px-5 py-4">
          <p className="text-[28px] font-semibold leading-none text-[#2F241F]">10%</p>
        </div>
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#E8FAF2] px-2.5 py-1 text-[10px] font-medium text-[#15AA78]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#15AA78]" />
          Active
        </span>
      </div>
    ),
  },
];

const PricingRules = () => {
  return (
    <div className="mt-5 space-y-4">
      {ruleCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="rounded-[14px] border border-[#F0E4DB] bg-white p-4 sm:p-5"
          >
            <div className="flex gap-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${card.iconClass}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[14px] font-semibold text-[#2F241F]">
                    {card.title}
                  </h2>
                  {card.badge ? (
                    <span className="rounded-full bg-[#F4F0EC] px-2 py-0.5 text-[8px] font-semibold tracking-[0.12em] text-[#9B8B7F]">
                      {card.badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-[11px] text-[#B29D8C]">{card.description}</p>
                {card.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PricingRules;
