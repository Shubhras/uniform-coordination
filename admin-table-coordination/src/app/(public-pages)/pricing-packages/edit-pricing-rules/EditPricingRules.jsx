"use client";

import { useRouter } from "next/navigation";
import { TbArrowLeft } from "react-icons/tb";

const inputClassName =
  "h-[42px] w-full rounded-[10px] border border-[#F2E5DD] bg-[#FFFCFA] px-4 text-[12px] text-[#5C4F48] outline-none";

const FieldLabel = ({ children }) => (
  <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">
    {children}
  </p>
);

const EditPricingRules = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#EDE0D7] bg-white text-[#6F6058]"
        >
          <TbArrowLeft size={14} />
        </button>

        <h1 className="text-[30px] font-semibold leading-tight text-[#2A211D]">
          Edit Pricing Rules
        </h1>
      </div>

      <div className="mt-5 rounded-[14px] border border-[#F0E4DB] bg-white p-5">
        <div>
          <h2 className="text-[14px] font-semibold text-[#2F241F]">Late Fee Configuration</h2>
          <p className="mt-1 text-[11px] text-[#B29D8C]">
            Define how late fees are calculated and applied
          </p>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <FieldLabel>Late Fee Formula</FieldLabel>
            <input readOnly value="Rental Value × Late Fee % × Days Overdue" className={inputClassName} />
            <p className="mt-2 text-[10px] text-[#B29D8C]">Descriptive formula label shown to staff in invoices</p>
          </div>

          <div>
            <FieldLabel>Late Fee Rate (% Per Day)</FieldLabel>
            <input readOnly value="5%" className={inputClassName} />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-[14px] font-semibold text-[#2F241F]">Return &amp; Delivery Settings</h2>
          <p className="mt-1 text-[11px] text-[#B29D8C]">
            Configure grace period and shipping fee
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel>Grace Period (Days)</FieldLabel>
            <input readOnly value="3" className={inputClassName} />
          </div>
          <div>
            <FieldLabel>Flat Shipping Fee</FieldLabel>
            <input readOnly value="150" className={inputClassName} />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-[14px] font-semibold text-[#2F241F]">Tax Settings</h2>
          <p className="mt-1 text-[11px] text-[#B29D8C]">
            Configure consumption tax on rental transactions
          </p>
        </div>

        <div className="mt-5 rounded-[12px] border border-[#F0E4DB] bg-white px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-[13px] font-semibold text-[#2F241F]">Enable Consumption Tax</h3>
              <p className="mt-1 text-[11px] text-[#B29D8C]">
                Apply sales tax to all taxable transactions
              </p>
            </div>
            <div className="flex h-6 w-10 items-center rounded-full bg-[#B56735] px-1">
              <div className="ml-auto h-4 w-4 rounded-full bg-white" />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <FieldLabel>Tax Percentage (%)</FieldLabel>
          <input readOnly value="10" className={inputClassName} />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          className="rounded-full border border-[#EAD9CD] px-5 py-2 text-[12px] text-[#7F736B]"
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded-full bg-[#B56735] px-5 py-2 text-[12px] font-medium text-white"
        >
          Save Rules
        </button>
      </div>
    </div>
  );
};

export default EditPricingRules;
