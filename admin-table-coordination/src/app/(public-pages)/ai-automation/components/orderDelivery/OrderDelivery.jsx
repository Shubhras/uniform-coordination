"use client";

import { useState } from "react";
import { FiEye, FiSearch } from "react-icons/fi";
import { apiOrderDeliveryList } from "@/services/AiAutomation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";

const OrderDelivery = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [searchMode, setSearchMode] = useState("orderId");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [apiMessage, setApiMessage] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setApiMessage("");
      setOrderData(null);

      const res = await apiOrderDeliveryList(accessToken, searchQuery.trim());

      if (res?.success && res?.data) {
        setOrderData(res.data);
      } else {
        setApiMessage(res?.message || "No order found.");
      }
    } catch (error) {
      setApiMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-[24px] font-semibold leading-tight text-[#2A1A0E]">
        Order &amp; Delivery Inquiry
      </h2>

      <p className="mt-1 text-[13px] text-[#B29D8C]">
        Read-only order lookup — no editing permitted
      </p>

      <div className="mt-4 rounded-lg border border-[#D9E4F3] bg-[#F5F9FF] px-4 py-3 text-[11px] text-[#7990AF]">
        <div className="flex items-center gap-2">
          <FiEye size={12} />
          Read-only mode — this tool does not modify any order data
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[#F1E5DC] bg-white p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSearchMode("orderId")}
            className={`rounded-full px-4 py-2 text-[13px] font-medium ${
              searchMode === "orderId"
                ? "bg-[#B76836] text-white"
                : "bg-[#F7EFE9] text-[#6B615A]"
            }`}
          >
            Order ID
          </button>

          <button
            onClick={() => setSearchMode("customerName")}
            className={`rounded-full px-4 py-2 text-[13px] font-medium ${
              searchMode === "customerName"
                ? "bg-[#B76836] text-white"
                : "bg-[#F7EFE9] text-[#6B615A]"
            }`}
          >
            Customer Name
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <div className="flex-1 rounded-xl border border-[#EFE3DA] bg-[#FFFCFA] px-4 py-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchMode === "orderId"
                  ? "e.g. ORD-KRZ-2024-0847"
                  : "e.g. Sophia Mitchell"
              }
              className="w-full bg-transparent text-[15px] text-[#6C615A] outline-none placeholder:text-[#D4C2B5]"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || loading}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-[14px] font-semibold text-white md:w-[130px] ${
              searchQuery.trim() ? "bg-[#A85A32]" : "bg-[#E4C4AE]"
            }`}
          >
            <FiSearch size={16} />
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
        {apiMessage && (
          <p className="mt-3 text-sm text-red-500">{apiMessage}</p>
        )}

        <p className="mt-3 text-[11px] text-[#D7C7BC]">
          Try: ORD-KRZ-2024-0847
        </p>

        {orderData && (
          <pre className="mt-5 rounded-lg bg-gray-100 p-4 text-xs overflow-auto">
            {JSON.stringify(orderData, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default OrderDelivery;
