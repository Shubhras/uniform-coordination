"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { FiArrowLeft } from "react-icons/fi";
import { apiRentalHistory } from "@/services/ProductService";
import Spinner from "@/components/ui/Spinner";
import { useTranslations } from "next-intl";

export default function RentalHistory() {
  const t = useTranslations("inventoryManagement.inventoryDetails");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const productId = searchParams.get("id");

  const [rentalHistory, setRentalHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchRentalHistory = async () => {
      try {
        setLoading(true);
        const res = await apiRentalHistory(accessToken, productId);
        if (res?.status) {
          setRentalHistory(res.data || []);
        }
      } catch (err) {
        console.error("Rental History Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken && productId) {
      fetchRentalHistory();
    } else {
      setLoading(false);
    }
  }, [accessToken, productId]);

  return (
    <div className="min-h-screen bg-[#FAF8F6] px-6 py-8">
      {/* Header & Breadcrumb */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full border border-[#E8DDD4] bg-white flex items-center justify-center hover:bg-[#F7F2EE] transition"
        >
          <FiArrowLeft size={18} className="text-[#4D3A2E]" />
        </button>

        <div>
          <h1 className="text-[28px] font-bold text-[#1A1410]">
            Rental History
          </h1>
          {/* <div className="flex items-center gap-2 text-[13px] text-[#A38A75] mt-0.5">
            <span>Inventory Management</span>
            <span>&gt;</span>
            <span>Inventory List</span>
            <span>&gt;</span>
            <span className="font-semibold text-[#4A382A]">Rental History</span>
          </div> */}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-[#EFE5DD] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF5F0] border-b border-[#EFE5DD] text-[13px] font-semibold text-[#6B4A2A]">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Rental Period</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE5DD]">
              {loading ? (
                <tr>
                  <div className="flex justify-center items-center h-[400px]">
                    <Spinner size={36} customColorClass="text-[#A0522D]" />
                  </div>
                </tr>
              ) : rentalHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    {t("noRentalHistory") || "No rental history found."}
                  </td>
                </tr>
              ) : (
                rentalHistory.map((item, index) => {
                  const startDate = item.rental_start_date;
                  const endDate = item.rental_end_date;
                  const period =
                    startDate && endDate
                      ? `${formatDate(startDate)}-${formatDate(endDate)}`
                      : item.rental_period || "-";

                  return (
                    <tr
                      key={item.id || index}
                      onClick={() =>
                        item.order_id && router.push(`/orders/${item.order_id}`)
                      }
                      className={`cursor-pointer transition hover:bg-[#FDFBF9] ${index % 2 === 1 ? "bg-[#FCF9F6]" : "bg-white"
                        }`}
                    >
                      <td className="px-6 py-5 font-semibold text-[#1A1410] text-[14px]">
                        #{item.order_id}
                      </td>
                      <td className="px-6 py-5 font-semibold text-[#1A1410] text-[14px]">
                        {item.customer_name || t("guestCustomer") || "Guest Customer"}
                      </td>
                      <td className="px-6 py-5 font-semibold text-[#1A1410] text-[14px]">
                        {item.quantity || 1}
                      </td>
                      <td className="px-6 py-5 font-semibold text-[#1A1410] text-[14px]">
                        {period}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-md text-[12px] font-semibold capitalize border ${item.order_status === "returned" ||
                            item.order_status === "completed"
                            ? "bg-[#EAF9F0] text-[#138A4B] border-[#CBEFD8]"
                            : item.order_status === "processing" ||
                              item.order_status === "active" ||
                              item.order_status === "rented"
                              ? "bg-[#EFF6FF] text-[#2F6BFF] border-[#D5E3FF]"
                              : "bg-[#F3F4F6] text-[#4B5563] border-[#D1D5DB]"
                            }`}
                        >
                          {item.order_status === "returned"
                            ? "Returned"
                            : item.order_status === "completed"
                              ? "Completed"
                              : item.order_status === "processing"
                                ? "Active"
                                : item.order_status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
