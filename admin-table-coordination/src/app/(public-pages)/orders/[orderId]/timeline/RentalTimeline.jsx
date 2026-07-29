"use client";

import { FiArrowLeft } from "react-icons/fi";
import {
  FiFileText,
  FiSend,
  FiShoppingBag,
  FiEdit3,
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiRotateCcw,
} from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function RentalTimeline({ orderId }) {
  const router = useRouter();

  const timeline = [
    {
      title: "Order Confirmed",
      desc: "Order ORD-2024-0789 created",
      date: "12 Jun 2024, 10:32",
      icon: <FiShoppingBag />,
      completed: true,
    },
    {
      title: "Payment Received",
      desc: "Payment received via NP Kalebarai",
      date: "12 Jun 2024, 18:45",
      icon: <FiCreditCard />,
      completed: true,
    },
    {
      title: "Shipped",
      desc: "Dispatched via FedEx Priority.",
      date: "12 Jun 2024, 14:00",
      icon: <FiTruck />,
      completed: true,
    },
    {
      title: "Delivered",
      desc: "Items delivered successfully.",
      date: "12 Jun 2024, 18:45",
      icon: <FiCheckCircle />,
      completed: true,
    },
    {
      title: "Returned",
      desc: "Items received and logged for inspection.",
      date: "Pending",
      icon: <FiRotateCcw />,
      completed: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F6] p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full border border-[#E9DED4] bg-white flex items-center justify-center hover:bg-[#F8F3EE]"
        >
          <FiArrowLeft className="text-lg text-[#5A4332]" />
        </button>

        <h1 className="text-[28px] font-bold text-[#2F241D]">
          Rental Timeline
        </h1>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="col-span-8 bg-white border border-[#EEE5DE] rounded-2xl p-8">
          <div className="relative">
            {timeline.map((item, index) => (
              <div
                key={index}
                className="relative flex justify-between pb-10 last:pb-0"
              >
                {/* Line */}
                {index !== timeline.length - 1 && (
                  <div className="absolute left-[17px] top-9 w-[2px] h-full bg-[#C96B34]" />
                )}

                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm z-10 ${
                      item.completed
                        ? "bg-[#B8663A]"
                        : "bg-white border border-[#D9D9D9] text-[#999]"
                    }`}
                  >
                    {item.icon}
                  </div>

                  {/* Text */}
                  <div>
                    <h3
                      className={`font-semibold text-[14px] ${
                        item.completed ? "text-[#2D241C]" : "text-[#B8B8B8]"
                      }`}
                    >
                      {item.title}
                    </h3>

                    <p
                      className={`text-xs mt-1 ${
                        item.completed ? "text-[#8D857D]" : "text-[#C6C6C6]"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs ${
                    item.completed ? "text-[#8B8B8B]" : "text-[#BEBEBE]"
                  }`}
                >
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-4 space-y-5">
          {/* Summary */}
          <div className="bg-white border border-[#EEE5DE] rounded-2xl p-5">
            <h3 className="text-[13px] font-semibold text-[#7A6E66] uppercase mb-5">
              Order Summary
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[#8C8177]">Order ID</span>
                <span className="font-medium text-[12px] text-[#A85A32]">
                  ORD-2024-0091
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8C8177]">Company</span>
                <span className="font-semibold text-[#1A1714]">
                  ABC Hotels Pvt Ltd.
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8C8177]">Type</span>

                <span className="px-2 py-1 rounded bg-[#FFF2E8] text-[#C96A34] text-xs font-semibold">
                  B2B
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8C8177]">Amount</span>
                <span className="font-semibold text-[#A85A32]">₹4850.00</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8C8177]">Status</span>

                <span className="px-2 py-1 rounded bg-[#EAF8F0] text-[#3E9C68] text-xs font-semibold">
                  DELIVERED
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-[#FFF8F3] border border-[#ECD8CB] rounded-2xl p-5">
            <h3 className="text-[11px] uppercase text-[#C26C35] font-semibold mb-4">
              Progress
            </h3>

            <div className="w-full h-2 rounded-full bg-[#E8D7CA] overflow-hidden">
              <div className="w-[88%] h-full bg-[#B8663A] rounded-full" />
            </div>

            <p className="mt-3 text-xs text-[#9C6645] font-medium">
              8 of 9 steps completed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
