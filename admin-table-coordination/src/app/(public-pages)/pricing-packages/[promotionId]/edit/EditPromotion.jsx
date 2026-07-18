"use client";

import { useRouter } from "next/navigation";
import { TbArrowLeft, TbCalendar, TbChevronDown } from "react-icons/tb";

const FieldLabel = ({ children }) => (
  <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">
    {children}
  </p>
);

const inputClassName =
  "h-[42px] w-full rounded-[10px] border border-[#F2E5DD] bg-[#FFFCFA] px-4 text-[12px] text-[#5C4F48] outline-none";

const EditPromotion = ({ promotionId }) => {
  const router = useRouter();

  if (!promotionId) {
    return null;
  }

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
          Edit Promotion
        </h1>
      </div>

      <div className="mt-5 rounded-[14px] border border-[#F0E4DB] bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel>Promotion Name</FieldLabel>
            <input readOnly value="Summer Celebration Sale" className={inputClassName} />
          </div>
          <div>
            <FieldLabel>Promotion Type</FieldLabel>
            <div className="relative">
              <input readOnly value="Percentage" className={inputClassName} />
              <TbChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F8D81]" size={16} />
            </div>
          </div>
          <div>
            <FieldLabel>Discount Value</FieldLabel>
            <input readOnly value="15%" className={inputClassName} />
          </div>
          <div>
            <FieldLabel>Start Date*</FieldLabel>
            <div className="relative">
              <input readOnly value="8/16/13" className={inputClassName} />
              <TbCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F8D81]" size={16} />
            </div>
          </div>
          <div>
            <FieldLabel>End Date</FieldLabel>
            <input readOnly value="8/22/13" className={inputClassName} />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Eligible Customers</FieldLabel>
            <div className="relative">
              <input readOnly value="All Customers" className={inputClassName} />
              <TbChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F8D81]" size={16} />
            </div>
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Description</FieldLabel>
            <textarea
              readOnly
              value="Briefly describe promotion for internal reference..."
              className="min-h-[82px] w-full rounded-[10px] border border-[#F2E5DD] bg-[#FFFCFA] px-4 py-3 text-[12px] text-[#5C4F48] outline-none"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-[13px] font-semibold text-[#2F241F]">Active Status</h3>
            <p className="mt-1 text-[11px] text-[#B29D8C]">
              Enable or disable this promotion immediately
            </p>
          </div>
          <div className="flex h-6 w-10 items-center rounded-full bg-[#B56735] px-1">
            <div className="ml-auto h-4 w-4 rounded-full bg-white" />
          </div>
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
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditPromotion;
