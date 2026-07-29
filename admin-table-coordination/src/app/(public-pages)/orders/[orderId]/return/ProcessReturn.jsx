"use client";

import { useEffect, useState } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiProcessReturnDetails } from "@/services/OrderRentals";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiAlertCircle, FiClock } from "react-icons/fi";
import Spinner from "@/components/ui/Spinner";

export default function ProcessReturn({ orderId }) {
  const router = useRouter();

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);

      const res = await apiProcessReturnDetails(accessToken, orderId);

      console.log("PROCESS RETURN =>", res);

      if (res?.results?.length) {
        setOrderDetails(res.results[0]);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchOrder();
    }
  }, [accessToken]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Available":
        return "bg-[#E8FFF3] text-[#22A06B]";
      case "Missing/Damaged":
        return "bg-[#FFF3E8] text-[#D97706]";
      case "Damaged":
        return "bg-[#FEECEC] text-[#DC2626]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={40} customColorClass="text-[#A0522D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white border border-[#E7DDD5] flex items-center justify-center hover:bg-[#F8F3EE]"
          >
            <FiArrowLeft className="text-lg text-[#5B4434]" />
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-[#1A1410]">
              Process Return
            </h1>
            <p className="text-sm text-[#8B8B8B] mt-1">
              Order ID :{" "}
              <span className="font-medium text-[#A0522D]">{orderId}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() =>
              router.push("/inventory-management?tab=Inspection%20Queue")
            }
            className="px-4 py-2 rounded-lg bg-[#F0EBE5] border border-[#E7DDD5] text-[#8C4A2F] text-sm font-semibold"
          >
            Continue Inspection
          </button>

          <button className="px-4 py-2 rounded-lg border border-[#E7DDD5] bg-white text-[#A85A32] text-sm font-semibold">
            Late Fee
          </button>

          <button className="px-4 py-2 rounded-lg bg-[#B63B2B] text-white text-sm font-semibold hover:bg-[#9E3225]">
            Generate Compensation
          </button>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-3 rounded-xl border border-[#FFC9C9] bg-[#FEF2F2] p-4">
          <FiClock className="text-[#DC2626] mt-1" size={17} />
          <div>
            <h3 className="text-[15px] font-semibold text-[#C10007]">
              Return overdue by 3 days
            </h3>
            <p className="text-[12px] font-medium text-[#FB2C36] mt-1">
              Expected: Jul 1, 2025 • Actual: Jul 4, 2025
            </p>
          </div>
        </div>

        <div className="flex gap-3 rounded-xl border border-[#F6D8AF] bg-[#FFF7ED] p-4">
          <FiAlertCircle className="text-[#F59E0B] mt-1" size={17} />
          <div>
            <h3 className="text-[15px] font-semibold text-[#CA3500]">
              Missing or damaged items detected
            </h3>
            <p className="text-[12px] text-[#FF6900] mt-1">
              2 missing chairs • 1 damaged candelabra
            </p>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl border border-[#ECE6E1] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F1ECE7]">
          <h2 className="text-[16px] font-semibold text-[#1C1917]">
            Return Item Checklist
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF8F6] text-[#8B8B8B] uppercase text-[11px]">
              <tr>
                <th className="text-left px-6 py-4">Item</th>
                <th className="text-center px-4 py-4">Rented</th>
                <th className="text-center px-4 py-4">Returned</th>
                <th className="text-center px-4 py-4">Missing</th>
                <th className="text-center px-4 py-4">Damaged</th>
                <th className="text-center px-4 py-4">Late</th>
                <th className="text-center px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {orderDetails?.items?.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-[#F4EFEB] hover:bg-[#FCFAF8]"
                >
                  <td className="px-6 py-5 font-medium text-[#2C1A0E]">
                    {item.product_name}
                  </td>

                  <td className="text-center text-[#666]">{item.quantity}</td>

                  <td className="text-center text-[#666]">
                    {item.returned_quantity}
                  </td>

                  <td
                    className={`text-center font-semibold ${
                      item.missing !== "-" ? "text-[#DC2626]" : "text-[#888]"
                    }`}
                  >
                    {item.lost_quantity > 0 ? item.lost_quantity : "-"}
                  </td>

                  <td
                    className={`text-center font-semibold ${
                      item.damaged !== "-" ? "text-[#DC2626]" : "text-[#888]"
                    }`}
                  >
                    {item.is_damaged ? "Yes" : "-"}
                  </td>

                  <td
                    className={`text-center font-semibold ${
                      item.late === "Yes" ? "text-[#DC2626]" : "text-[#888]"
                    }`}
                  >
                    {orderDetails?.actual_return_date ? "Yes" : "No"}
                  </td>

                  <td className="text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium $
                        {
                       getStatusBadge(
                        item.is_lost
                            ? "Missing/Damaged"
                            : item.is_damaged
                            ? "Damaged"
                            : "Available"
                        )
                        }`}
                    >
                      {item.is_lost
                        ? "Missing/Damaged"
                        : item.is_damaged
                          ? "Damaged"
                          : "Available"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
