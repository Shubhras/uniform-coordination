"use client";

import { useState } from "react";
import Select from "react-select";
import { FiSearch, FiEye, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";

const ordersData = [
  {
    id: 1,
    orderId: "ORD-2024-0091",
    customer: "Maison Dorval",
    type: "B2B",
    period: "12 Jun – 26 Jun 2024",
    amount: "₹4,850.00",
    status: "Delivered",
  },
  {
    id: 2,
    orderId: "ORD-2024-0092",
    customer: "Robert Fox",
    type: "B2C",
    period: "12 Jun – 26 Jun 2024",
    amount: "₹4,850.00",
    status: "Delivered",
  },
  {
    id: 3,
    orderId: "ORD-2024-0093",
    customer: "Cody Fisher",
    type: "B2B",
    period: "12 Jun – 26 Jun 2024",
    amount: "₹4,850.00",
    status: "Returned",
  },
  {
    id: 4,
    orderId: "ORD-2024-0291",
    customer: "Sophie Laurent",
    type: "B2C",
    period: "8 Jun – 10 Jun 2024",
    amount: "₹620.00",
    status: "Returned",
  },
  {
    id: 5,
    orderId: "ORD-2024-0097",
    customer: "Wade Warren",
    type: "B2B",
    period: "12 Jun – 26 Jun 2024",
    amount: "₹4,850.00",
    status: "Shipped",
  },
];

const customerOptions = [
  { value: "all", label: "All Customers" },
  { value: "maison", label: "Maison Dorval" },
  { value: "robert", label: "Robert Fox" },
  { value: "cody", label: "Cody Fisher" },
  { value: "sophie", label: "Sophie Laurent" },
];

const statusOptions = [
  { value: "all", label: "Status" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Returned" },
  { value: "shipped", label: "Shipped" },
];

export default function Orders() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState(customerOptions[0]);
  const [status, setStatus] = useState(statusOptions[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "44px",
      borderColor: "#EFE5DD",
      boxShadow: "none",
      borderRadius: "8px",
      "&:hover": {
        borderColor: "#C08457",
      },
    }),

    singleValue: (base) => ({
      ...base,
      color: "#A85A32B2",
    }),

    placeholder: (base) => ({
      ...base,
      color: "#A85A32B2",
    }),

    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#A0522D"
        : state.isFocused
          ? "#F8F2ED"
          : "#fff",
      color: state.isSelected ? "#fff" : "#444",
    }),
  };

  return (
    <div className="min-h-screen bg-[#FAF8F6] px-4 py-5">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A1410]">
          Order & Rentals
        </h1>

        <p className="text-[15px] text-[#757575] mt-1">
          Manage rental orders, deliveries and returns.
        </p>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        {/* <div className="relative w-full lg:max-w-xl">
          <FiSearch className="absolute left-4  top-1/2 -translate-y-1/2 text-[#C08457] text-sm" />

          <input
            type="text"
            placeholder="Search products..."
            className="w-full h-11 rounded-lg border border-[#EFE5DD] text-[#C08457] pl-10 pr-4  text-sm outline-none focus:border-[#C08457]"
          />
        </div> */}
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

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Filters */}
          <div className="flex gap-3">
            <div className="w-52">
              <Select
                value={customer}
                onChange={setCustomer}
                options={customerOptions}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>

            <div className="w-52">
              <Select
                value={status}
                onChange={setSearch}
                options={statusOptions}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Table Part will come in Part 2 */}
      <div className="overflow-x-auto rounded-l border border-[#EFE5DD] bg-white">
        <table className="min-w-full">
          <thead className="bg-[#F8F3EE]">
            <tr className="text-left text-[15px] font-medium text-[#5F6368]">
              <th className="px-5 py-4 font-medium">Order ID</th>
              <th className="px-5 py-4 font-medium">Customer</th>
              <th className="px-5 py-4 font-medium">Type</th>
              <th className="px-5 py-4 font-medium">Rental Period</th>
              <th className="px-5 py-4 font-medium">Amount</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {ordersData.map((order, index) => (
              <tr
                key={order.id}
                className={`border-t border-[#F3ECE7] text-[14px] ${
                  index % 2 === 0 ? "bg-white" : "bg-[#FCF9F6]"
                }`}
              >
                {/* Order ID */}

                <td className="px-5 py-5 font-semibold text-[#2C1A0E] whitespace-nowrap">
                  {order.orderId}
                </td>

                {/* Customer */}

                <td className="px-5 py-5 text-[#2C1A0E] font-medium whitespace-nowrap">
                  {order.customer}
                </td>

                {/* Type */}

                <td className="px-5 py-5">
                  <span
                    className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium ${
                      order.type === "B2B"
                        ? "bg-[#FDF2EC] text-[#C96B39] border border-[#F3D4C2]"
                        : "bg-[#EAF5FF] text-[#2485D3] border border-[#CFE6FA]"
                    }`}
                  >
                    {order.type}
                  </span>
                </td>

                {/* Rental Period */}

                <td className="px-5 py-5 text-[#2C1A0E] whitespace-nowrap">
                  {order.period}
                </td>

                {/* Amount */}

                <td className="px-5 py-5 font-semibold text-[#2C1A0E] whitespace-nowrap">
                  {order.amount}
                </td>

                {/* Status */}

                <td className="px-5 py-5">
                  {order.status === "Delivered" && (
                    <span className="inline-flex rounded-full border border-[#B6E7D2] bg-[#E8FFF5] px-3 py-1 text-[11px] font-medium text-[#0E9F6E]">
                      Delivered
                    </span>
                  )}

                  {order.status === "Returned" && (
                    <span className="inline-flex rounded-full border border-[#E3CCFF] bg-[#F4EAFF] px-3 py-1 text-[11px] font-medium text-[#9333EA]">
                      Returned
                    </span>
                  )}

                  {order.status === "Shipped" && (
                    <span className="inline-flex rounded-full border border-[#C8DAFF] bg-[#EEF4FF] px-3 py-1 text-[11px] font-medium text-[#2563EB]">
                      Shipped
                    </span>
                  )}
                </td>

                {/* Action */}

                <td className="px-5 py-5">
                  <div className="flex justify-center">
                    <button
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="inline-flex items-center gap-2 rounded-md border border-[#E6CDBB] bg-white px-4 py-1.5 text-[13px] font-medium text-[#A85A32] transition hover:bg-[#FFF7F2]"
                    >
                      <FiEye size={14} />
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ;
    </div>
  );
}

{
  /* Orders Table */
}
