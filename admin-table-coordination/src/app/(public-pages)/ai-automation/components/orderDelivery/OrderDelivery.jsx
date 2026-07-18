"use client";

import { useState } from "react";
import { FiEye, FiSearch } from "react-icons/fi";

const OrderDelivery = () => {
  const [searchMode, setSearchMode] = useState("orderId"); // "orderId" | "customerName"
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="mt-6">
      <h2 className="text-[29px] font-semibold leading-tight text-[#2A211D] sm:text-[30px]">
        Order &amp; Delivery Inquiry
      </h2>
      <p className="mt-1 text-[12px] text-[#B29D8C]">
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
            type="button"
            onClick={() => setSearchMode("orderId")}
            className={`rounded-full px-4 py-2 text-[11px] font-medium ${
              searchMode === "orderId"
                ? "bg-[#B76836] text-white"
                : "bg-[#F7EFE9] text-[#6B615A]"
            }`}
          >
            Order ID
          </button>
          <button
            type="button"
            onClick={() => setSearchMode("customerName")}
            className={`rounded-full px-4 py-2 text-[11px] font-medium ${
              searchMode === "customerName"
                ? "bg-[#B76836] text-white"
                : "bg-[#F7EFE9] text-[#6B615A]"
            }`}
          >
            Customer Name
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <div className="flex-1 rounded-xl border border-[#EFE3DA] bg-[#FFFCFA] px-4 py-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchMode === "orderId"
                  ? "e.g. KRZ-2024-0847"
                  : "e.g. Sophia Mitchell"
              }
              className="w-full bg-transparent text-[12px] text-[#6C615A] outline-none placeholder:text-[#D4C2B5]"
            />
          </div>
          <button
            type="button"
            className={`flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-6 py-4 text-[12px] font-medium text-white md:w-[130px] ${
              searchQuery.trim() ? "bg-[#B76836]" : "bg-[#E4C4AE]"
            }`}
          >
            <FiSearch size={13} className="shrink-0" />
            Search
          </button>
        </div>

        <p className="mt-3 text-[11px] text-[#D7C7BC]">
          Try: KRZ-2024-0847 · KRZ-2024-0721 · "Sophia Mitchell"
        </p>
      </div>
    </div>
  );
};

export default OrderDelivery;