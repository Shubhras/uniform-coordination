"use client";

import { useRouter } from "next/navigation";
import { TbArrowLeft } from "react-icons/tb";

const PromotionDetails = ({ promotionId }) => {
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
          Promotion Details
        </h1>
      </div>

      <div className="mt-5 rounded-[14px] border border-[#F0E4DB] bg-white p-5">
        <div className="grid gap-x-10 gap-y-5 md:grid-cols-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">Promotion Name</p>
            <p className="mt-2 text-[13px] font-medium text-[#3F332C]">Summer Celebration Sale</p>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">Promotion Type</p>
            <p className="mt-2 text-[13px] font-medium text-[#3F332C]">Percentage</p>
          </div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">Discount Value</p>
              <p className="mt-2 text-[13px] font-medium text-[#3F332C]">15%</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-[#E8FAF2] px-2.5 py-1 text-[10px] font-medium text-[#15AA78]">
              Active
            </span>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">Start Date</p>
            <p className="mt-2 text-[13px] font-medium text-[#3F332C]">20 May 2024</p>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">End Date</p>
            <p className="mt-2 text-[13px] font-medium text-[#3F332C]">26 May 2024</p>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">Eligible Customers</p>
            <p className="mt-2 text-[13px] font-medium text-[#3F332C]">All Customers</p>
          </div>
          <div className="md:col-span-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">Description</p>
            <p className="mt-2 text-[11px] font-semibold uppercase text-[#3F332C]">
              Special summer discounts on tablecloths, runners, and centerpieces — perfect for weddings and events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionDetails;
