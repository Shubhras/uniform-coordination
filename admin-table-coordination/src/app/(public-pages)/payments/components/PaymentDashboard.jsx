"use client";

import { useState } from "react";
import {
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiCreditCard,
  FiDownload,
  FiEye,
  FiSearch,
  FiTrendingDown,
  FiXCircle,
} from "react-icons/fi";

const paymentData = [
  {
    id: "#ORD-1001",
    customer: "John Doe",
    email: "john.doe@email.com",
    date: "28 May 2025",
    time: "10:30 AM",
    method: "Visa **** 4242",
    amount: "$ 1,250.00",
    status: "Paid",
    invoice: "INV-1001",
  },
  {
    id: "#ORD-1002",
    customer: "Jane Smith",
    email: "jane.smith@email.com",
    date: "28 May 2025",
    time: "11:15 AM",
    method: "Mastercard **** 5555",
    amount: "$ 850.00",
    status: "Paid",
    invoice: "INV-1002",
  },
  {
    id: "#ORD-1003",
    customer: "Robert Brown",
    email: "robert.brown@email.com",
    date: "27 May 2025",
    time: "02:45 PM",
    method: "PayPal",
    amount: "$ 2,100.00",
    status: "Pending",
    invoice: "INV-1003",
  },
  {
    id: "#ORD-1004",
    customer: "Emily Davis",
    email: "emily.davis@email.com",
    date: "27 May 2025",
    time: "03:20 PM",
    method: "UPI",
    amount: "$ 1,560.00",
    status: "Paid",
    invoice: "INV-1004",
  },
  {
    id: "#ORD-1005",
    customer: "Michael Wilson",
    email: "michael.wilson@email.com",
    date: "26 May 2025",
    time: "09:10 AM",
    method: "Visa **** 1111",
    amount: "$ 3,450.00",
    status: "Failed",
    invoice: "INV-1005",
  },
  {
    id: "#ORD-1006",
    customer: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    date: "26 May 2025",
    time: "10:05 AM",
    method: "Mastercard **** 8888",
    amount: "$ 950.00",
    status: "Paid",
    invoice: "INV-1006",
  },
  {
    id: "#ORD-1007",
    customer: "David Lee",
    email: "david.lee@email.com",
    date: "25 May 2025",
    time: "01:30 PM",
    method: "PayPal",
    amount: "$ 1,780.00",
    status: "Pending",
    invoice: "INV-1007",
  },
  {
    id: "#ORD-1008",
    customer: "Jennifer Taylor",
    email: "jennifer.taylor@email.com",
    date: "25 May 2025",
    time: "04:50 PM",
    method: "UPI",
    amount: "$ 2,750.00",
    status: "Paid",
    invoice: "INV-1008",
  },
];

const stats = [
  {
    title: "Total Payments",
    value: "$ 48,750.00",
    subText: "This Month",
    icon: FiCreditCard,
  },
  {
    title: "Successful Payments",
    value: "$ 42,180.00",
    subText: "86.52%",
    icon: FiCreditCard,
    subColor: "text-green-600",
  },
  {
    title: "Refunds",
    value: "$ 4,250.00",
    subText: "8.72%",
    icon: FiTrendingDown,
    subColor: "text-red-500",
  },
  {
    title: "Pending Payments",
    value: "$ 2,320.00",
    subText: "4.76%",
    icon: FiClock,
    subColor: "text-amber-500",
  },
  {
    title: "Failed Payments",
    value: "$ 240.00",
    subText: "0.49%",
    icon: FiXCircle,
    subColor: "text-red-500",
  },
];

const getStatusStyle = (status) => {
  if (status === "Paid") {
    return "bg-[#DCF4E2] text-[#258B42]";
  }

  if (status === "Pending") {
    return "bg-[#FFF0D2] text-[#C68115]";
  }

  return "bg-[#FBE0DD] text-[#D34C43]";
};

const PaymentDashboard = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [paymentMethod, setPaymentMethod] = useState("All Payment Methods");
  const [page, setPage] = useState(1);

  const filteredData = paymentData.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.id.toLowerCase().includes(searchText) ||
      item.customer.toLowerCase().includes(searchText) ||
      item.email.toLowerCase().includes(searchText);

    const matchesStatus = status === "All Status" || item.status === status;

    const matchesMethod =
      paymentMethod === "All Payment Methods" ||
      item.method.toLowerCase().includes(paymentMethod.toLowerCase());

    return matchesSearch && matchesStatus && matchesMethod;
  });

  return (
    <div className="w-full">
      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex min-h-[86px] items-center gap-3 rounded-lg border border-[#eee7e2] bg-white px-3 py-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7EADF]">
                <Icon size={17} className="text-[#92572F]" strokeWidth={2} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-[15px] text-[#555] font-semibold">
                  {item.title}
                </p>

                <p className="mt-1 text-[14px] font-bold text-[#282828]">
                  {item.value}
                </p>

                <p
                  className={`mt-1 text-[10px] ${
                    item.subColor || "text-[#777]"
                  }`}
                >
                  {item.subText}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= TABLE ================= */}
      <div className="mt-2 overflow-hidden rounded-lg border border-[#eee7e2] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse">
            <thead>
              <tr className="bg-[#FBF2EB]">
                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#333]">
                  Order ID
                </th>

                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#333]">
                  Customer
                </th>

                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#333]">
                  Date
                </th>

                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#333]">
                  Payment Method
                </th>

                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#333]">
                  Amount
                </th>

                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#333]">
                  Status
                </th>

                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#333]">
                  Invoice
                </th>

                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#333]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[#eee] last:border-b-0"
                >
                  {/* Order */}
                  <td className="px-3 py-3 text-[12px] font-semibold text-[#985A32]">
                    {item.id}
                  </td>

                  {/* Customer */}
                  <td className="px-3 py-2.5">
                    <p className="text-[13px] font-medium text-[#333]">
                      {item.customer}
                    </p>

                    <p className="mt-0.5 text-[10px] text-[#888]">
                      {item.email}
                    </p>
                  </td>

                  {/* Date */}
                  <td className="px-3 py-2.5">
                    <p className="text-[13px] text-[#444]">{item.date}</p>

                    <p className="mt-0.5 text-[11px] text-[#888]">{item.time}</p>
                  </td>

                  {/* Payment Method */}
                  <td className="px-3 py-2.5 text-[13px] text-[#444]">
                    {item.method}
                  </td>

                  {/* Amount */}
                  <td className="px-3 py-2.5 text-[13px] font-medium text-[#333]">
                    {item.amount}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ${getStatusStyle(
                        item.status,
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Invoice */}
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-[12px] font-medium text-[#985A32] hover:underline"
                    >
                      {item.invoice}
                      <FiDownload size={11} />
                    </button>
                  </td>

                  {/* Action */}
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-[13px] text-[#985A32] hover:text-[#555]"
                    >
                      <FiEye size={15} />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-[11px] text-[#888]"
                  >
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        <div className="flex items-center justify-between px-3 py-3">
          <p className="text-[9px] text-[#777]">
            Showing 1 to {filteredData.length} of 128 entries
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="flex h-7 w-7 items-center justify-center rounded border border-[#e5dfda] text-[#777] disabled:opacity-40"
            >
              <FiChevronLeft size={13} />
            </button>

            {[1, 2, 3].map((number) => (
              <button
                key={number}
                type="button"
                onClick={() => setPage(number)}
                className={`flex h-7 w-7 items-center justify-center rounded text-[9px] ${
                  page === number
                    ? "bg-[#92572F] text-white"
                    : "border border-[#e5dfda] text-[#555]"
                }`}
              >
                {number}
              </button>
            ))}

            <span className="px-1 text-[9px] text-[#777]">...</span>

            <button
              type="button"
              onClick={() => setPage(16)}
              className="flex h-7 w-7 items-center justify-center rounded border border-[#e5dfda] text-[9px] text-[#555]"
            >
              16
            </button>

            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              className="flex h-7 w-7 items-center justify-center rounded border border-[#e5dfda] text-[#777]"
            >
              <FiChevronRight size={13} />
            </button>

            <select
              className="ml-2 h-7 rounded border border-[#e5dfda] bg-white px-2 text-[9px] text-[#555] outline-none"
              defaultValue="10"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDashboard;
