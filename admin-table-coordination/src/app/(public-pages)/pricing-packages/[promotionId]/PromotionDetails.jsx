"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TbArrowLeft } from "react-icons/tb";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiPromoCodeDetails } from "@/services/PricingPackages";
import Spinner from "@/components/ui/Spinner";

const PromotionDetails = ({ promotionId }) => {
  const router = useRouter();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [loading, setLoading] = useState(true);
  const [promo, setPromo] = useState(null);

  useEffect(() => {
    if (accessToken && promotionId) {
      fetchDetails();
    }
  }, [accessToken, promotionId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await apiPromoCodeDetails(accessToken, promotionId);
      if (res?.status || res?.data) {
        setPromo(res.data || res);
      }
    } catch (err) {
      console.error("Error fetching promotion details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!promotionId) {
    return null;
  }

  const isExpired = promo?.ended_at && new Date(promo.ended_at) < new Date();
  const statusLabel = isExpired ? "Expired" : promo?.isActive ? "Active" : "Inactive";
  const statusColor = isExpired
    ? "bg-[#FFE9E8] text-[#F04444]"
    : promo?.isActive
      ? "bg-[#E8FAF2] text-[#007A55]"
      : "bg-[#FFF6E7] text-[#E6A11E]";

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/pricing-packages?tab=promotions")}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#EDE0D7] bg-white text-[#6F6058] hover:bg-gray-50"
        >
          <TbArrowLeft size={14} />
        </button>
        <h1 className="text-[30px] font-semibold leading-tight text-[#2A211D]">
          Promotion Details
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[300px] mt-5">
          <Spinner size={40} customColorClass="text-[#A0522D]" />
        </div>
      ) : !promo ? (
        <div className="mt-5 p-8 text-center text-gray-500">
          Promotion not found.
        </div>
      ) : (
        <div className="mt-5 rounded-[14px] border border-[#F0E4DB] bg-white p-5">
          <div className="grid gap-x-10 gap-y-5 md:grid-cols-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">Promotion Name</p>
              <p className="mt-2 text-[13px] font-medium text-[#3F332C]">
                {promo.promocodeName || "-"}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">Promotion Type</p>
              <p className="mt-2 text-[13px] font-medium text-[#3F332C]">
                {promo.promocodeType === "discount" ? "Percentage" : promo.promocodeType === "fix_price" ? "Fixed Amount" : promo.promocodeType || "-"}
              </p>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">Discount Value</p>
                <p className="mt-2 text-[13px] font-medium text-[#3F332C]">
                  {promo.promocodeType === "discount" ? `${promo.amount}%` : `$${promo.amount}`}
                </p>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">Start Date</p>
              <p className="mt-2 text-[13px] font-medium text-[#3F332C]">
                {promo.started_at ? new Date(promo.started_at).toLocaleDateString() : "-"}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">End Date</p>
              <p className="mt-2 text-[13px] font-medium text-[#3F332C]">
                {promo.ended_at ? new Date(promo.ended_at).toLocaleDateString() : "-"}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">Eligible Customers</p>
              <p className="mt-2 text-[13px] font-medium text-[#3F332C]">
                {promo.description?.includes("[Eligibility: first_purchase]")
                  ? "First Purchase Only"
                  : promo.description?.includes("[Eligibility: repeat_customer]")
                    ? "Repeat Customers Only"
                    : "All Customers"}
              </p>
            </div>
            <div className="md:col-span-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B3A096]">Description</p>
              <p className="mt-2 text-[12px] text-[#3F332C]">
                {(promo.description || "")
                  .replace(/\[Eligibility:\s*[^\]]+\]\s*/g, "")
                  .trim() || "No description provided."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionDetails;
