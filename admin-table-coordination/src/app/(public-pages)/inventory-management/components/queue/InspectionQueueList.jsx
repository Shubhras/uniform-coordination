"use client";

import { useState } from "react";
import {
  FiSearch,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";

const inspectionData = [
  {
    id: 1,
    name: "Gold Charger Plate",
    category: "Tableware",
    orderId: "#ORD-2847",
    qty: "2 units",
    date: "04 Jul 2025",
  },
  {
    id: 2,
    name: "Gold Satin Table Runner",
    category: "Runner",
    orderId: "#ORD-2847",
    qty: "2 units",
    date: "04 Jul 2025",
  },
  {
    id: 3,
    name: "Crystal Wine Glass Set",
    category: "Tableware",
    orderId: "#ORD-2847",
    qty: "2 units",
    date: "04 Jul 2025",
  },
  {
    id: 4,
    name: "Bordeaux Linen Napkin",
    category: "Napkin",
    orderId: "#ORD-2847",
    qty: "2 units",
    date: "04 Jul 2025",
  },
  {
    id: 5,
    name: "Ivory Chiavari Chair",
    category: "Chair",
    orderId: "#ORD-2848",
    qty: "4 units",
    date: "05 Jul 2025",
  },
  {
    id: 6,
    name: "Velvet Sofa",
    category: "Furniture",
    orderId: "#ORD-2850",
    qty: "1 unit",
    date: "05 Jul 2025",
  },
];

const InspectionQueueList = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen">
      {/* Search + Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-full lg:max-w-xl">
          <FiSearch className="absolute left-4  top-1/2 -translate-y-1/2 text-[#C08457] text-sm" />

          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-lg border border-[#EFE5DD] text-[#C08457] pl-10 pr-4  text-sm outline-none focus:border-[#C08457]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <FiX className="text-gray-500" />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none h-10 w-[110px] rounded-lg border border-[#EFE5DD] bg-white px-4 pr-10 text-[14px] text-[#8B5E3C] outline-none cursor-pointer"
          >
            <option value="">Status</option>
            <option>Pending</option>
            <option>Passed</option>
            <option>Failed</option>
          </select>

          <FiChevronDown
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B5E3C] pointer-events-none"
          />
        </div>
      </div>

      {/* Table */}
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[#EFE5DD] bg-white">
        <table className="min-w-full">
          {/* Header */}
          <thead className="bg-[#A85A320F]">
            <tr className="text-left text-[16px] text-[#5D5E5F]">
              <th className="px-5 py-3 font-normal">Product Name</th>
              <th className="px-5 py-3 font-normal">Order ID</th>
              <th className="px-5 py-3 font-normal">Returned Qty</th>
              <th className="px-5 py-3 font-normal">Return Date</th>
              <th className="px-5 py-3 font-normal text-center">Action</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {inspectionData.map((item, index) => (
              <tr
                key={item.id}
                className={`text-[13px] ${
                  index % 2 === 0 ? "bg-white" : "bg-[#FBF7F3]"
                }`}
              >
                {/* Product */}
                <td className="px-5 py-4">
                  <h3 className="text-[#2C1A0E] text-[14px] font-semibold">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-[11px] text-[#B39A88]">
                    {item.category}
                  </p>
                </td>

                {/* Order ID */}
                <td className="px-5 py-5 text-[#2C1A0E] font-semibold text-[14px]">
                  {item.orderId}
                </td>

                {/* Returned Qty */}
                <td className="px-5 py-4 text-[#2C1A0E] font-semibold text-[14px]">
                  {item.qty}
                </td>

                {/* Return Date */}
                <td className="px-5 py-4 text-[#2C1A0E] font-semibold text-[14px]">
                  {item.date}
                </td>

                {/* Action */}
                <td className="px-5 py-4">
                  <div className="flex justify-center items-center gap-3">
                    <button className="min-w-[68px] h-9 rounded-md border border-[#B8F1D4] bg-[#F2FFF7] text-[#0E9F6E] text-[13px] font-semibold hover:bg-[#E7FCEF] transition">
                      Pass
                    </button>

                    <button className="min-w-[68px] h-9 rounded-md border border-[#FFD0D7] bg-white text-[#E11D48] text-[13px] font-semibold hover:bg-[#FFF5F7] transition">
                      Fail
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-5 border-t border-[#F2ECE6]">
          <p className="text-[14px] text-[#8B7A6E]">Showing 1–10</p>

          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-lg border border-[#E9DDD4] bg-white flex items-center justify-center text-[#8A7769] hover:bg-[#F8F4F1]">
              <FiChevronLeft size={18} />
            </button>

            <button className="w-9 h-9 rounded-lg bg-[#C97849] text-white text-[14px] font-semibold">
              1
            </button>

            <button className="w-9 h-9 rounded-lg text-[14px] text-[#7A6A5F] hover:bg-[#F6F1EC]">
              2
            </button>

            <button className="w-9 h-9 rounded-lg text-[14px] text-[#7A6A5F] hover:bg-[#F6F1EC]">
              3
            </button>

            <span className="px-1 text-[#8B7A6E]">...</span>

            <button className="w-9 h-9 rounded-lg text-[14px] text-[#7A6A5F] hover:bg-[#F6F1EC]">
              10
            </button>

            <button className="w-9 h-9 rounded-lg border border-[#E9DDD4] bg-white flex items-center justify-center text-[#8A7769] hover:bg-[#F8F4F1]">
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionQueueList;
