"use client";

import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiShoppingBag,
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiRotateCcw,
  FiInfo,
} from "react-icons/fi";
import Dialog from "@/components/ui/Dialog";
import Spinner from "@/components/ui/Spinner";
import { useSession } from "next-auth/react";
import { apiSindleOrderDetials } from "@/services/OrderService";

const TIMELINE_STEPS = [
  {
    key: "pending",
    title: "Order Confirmed",
    desc: "Order Created",
    icon: <FiShoppingBag size={18} />,
  },
  {
    key: "confirmed",
    title: "Payment Received",
    desc: "Payment Received",
    icon: <FiCreditCard size={18} />,
  },
  {
    key: "processing",
    title: "Shipped",
    desc: "Dispatched",
    icon: <FiTruck size={18} />,
  },
  {
    key: "delivered",
    title: "Delivered",
    desc: "Items delivered successfully",
    icon: <FiCheckCircle size={18} />,
  },
  {
    key: "returned",
    title: "Returned",
    desc: "Items received and logged for inspection",
    icon: <FiRotateCcw size={18} />,
  },
];

const getStepIndex = (rawStatus) => {
  const s = String(rawStatus || "").toLowerCase();
  if (s === "returned") return 4;
  if (s === "delivered") return 3;
  if (s === "processing" || s === "shipped" || s === "out_for_delivery")
    return 2;
  if (s === "confirmed" || s === "paid") return 1;
  if (s === "pending") return 0;
  return 0;
};

const getStatusBadgeStyle = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "returned") {
    return "bg-[#FAF5FF] text-[#8200DB] border-[#E9D4FF]";
  }
  if (s === "delivered") {
    return "bg-[#EAF8F0] text-[#3E9C68] border-[#86EFAC]";
  }
  if (s === "processing" || s === "shipped" || s === "out_for_delivery") {
    return "bg-[#FFF4E5] text-[#D97706] border-[#FCD34D]";
  }
  if (s === "pending") {
    return "bg-[#FFF4E5] text-[#BB4D00] border-[#BB4D00]";
  }
  if (s === "confirmed" || s === "paid") {
    return "bg-[#EFF6FF] text-[#1447E6] border-[#BEDBFF]";
  }
  if (s === "cancelled") {
    return "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]";
  }
  return "bg-[#EFF6FF] text-[#1447E6] border-[#BEDBFF]";
};

export default function RentalTimelineModal({
  isOpen,
  onClose,
  orderId,
  initialOrder = null,
}) {
  const { data: session } = useSession();
  const token = session?.accessToken || session?.user?.accessToken;

  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialOrder) {
      setOrder(initialOrder);
    }

    const fetchDetail = async () => {
      const targetId = orderId || initialOrder?.order_id;
      if (!token || !targetId) return;

      try {
        if (!initialOrder) {
          setLoading(true);
        }
        const res = await apiSindleOrderDetials(token, targetId);
        if (res?.data) {
          const detailed = Array.isArray(res.data) ? res.data[0] : res.data;
          setOrder(detailed);
        }
      } catch (err) {
        console.error("Failed to load rental timeline order details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, orderId, token, initialOrder]);

  const currentStep = getStepIndex(order?.status);
  const totalSteps = TIMELINE_STEPS.length;
  const completedSteps = currentStep + 1;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  const customerName =
    order?.delivery_address?.name ||
    order?.delivery_address?.first_name ||
    (order?.customer?.first_name
      ? `${order.customer.first_name} ${order.customer.last_name || ""}`.trim()
      : null) ||
    order?.customer_name ||
    session?.user?.name ||
    "—";

  const totalAmount = Number(order?.total_amount || 0).toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      width={860}
      contentClassName="p-0 overflow-hidden rounded-2xl"
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-[#FAF8F6] p-4 sm:p-6 max-h-[88vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#E9DED4] bg-white flex items-center justify-center hover:bg-[#F8F3EE] transition shrink-0 cursor-pointer text-[#5A4332]"
            aria-label="Back"
          >
            <FiArrowLeft className="text-lg text-[#5A4332]" />
          </button>

          <h2 className="text-xl sm:text-2xl md:text-[26px] font-bold text-[#2F241D]">
            Rental Timeline
          </h2>
        </div>

        {loading && !order ? (
          <div className="py-20 flex justify-center items-center">
            <Spinner size={40} customColorClass="text-[#A0522D]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            {/* LEFT: Stepper Timeline */}
            <div className="col-span-1 lg:col-span-7 xl:col-span-8 bg-white border border-[#EEE5DE] rounded-2xl p-4 sm:p-6 md:p-7 shadow-xs">
              <div className="relative">
                {TIMELINE_STEPS.map((step, index) => {
                  const completed = index <= currentStep;
                  const isLast = index === TIMELINE_STEPS.length - 1;

                  return (
                    <div
                      key={step.key}
                      className="relative flex justify-between items-start gap-4 pb-8 last:pb-0"
                    >
                      {/* Vertical Connecting Line */}
                      {!isLast && (
                        <div
                          className={`absolute left-[19px] top-10 w-[2px] h-[calc(100%-12px)] transition-colors duration-300 ${
                            index < currentStep
                              ? "bg-[#C96B34]"
                              : "bg-[#E5E5E5]"
                          }`}
                        />
                      )}

                      <div className="flex gap-3 sm:gap-4 min-w-0">
                        {/* Circle Icon */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm z-10 shrink-0 transition-all ${
                            completed
                              ? "bg-[#B8663A] text-white shadow-sm"
                              : "bg-white border border-[#D9D9D9] text-[#999]"
                          }`}
                        >
                          {step.icon}
                        </div>

                        {/* Title & Description */}
                        <div className="min-w-0 pt-0.5">
                          <h3
                            className={`font-semibold text-sm ${
                              completed ? "text-[#2D241C]" : "text-[#B8B8B8]"
                            }`}
                          >
                            {step.title}
                          </h3>

                          <p
                            className={`text-xs mt-1 leading-snug ${
                              completed ? "text-[#8D857D]" : "text-[#C6C6C6]"
                            }`}
                          >
                            {step.desc}
                          </p>
                        </div>
                      </div>

                      {/* Right Tag */}
                      <span
                        className={`text-xs shrink-0 whitespace-nowrap pt-1 font-medium ${
                          completed ? "text-[#8B8B8B]" : "text-[#BEBEBE]"
                        }`}
                      >
                        {completed ? "Completed" : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Order Summary & Progress */}
            <div className="col-span-1 lg:col-span-5 xl:col-span-4 space-y-4">
              {/* ORDER SUMMARY Card */}
              <div className="bg-white border border-[#EEE5DE] rounded-2xl p-4 sm:p-5 shadow-xs">
                <h3 className="text-[12px] font-semibold text-[#7A6E66] uppercase tracking-wider mb-4">
                  ORDER SUMMARY
                </h3>

                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-[#8C8177] shrink-0">Order ID</span>
                    <span className="font-semibold text-xs text-[#A85A32] truncate">
                      {order?.order_id || orderId || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-3">
                    <span className="text-[#8C8177] shrink-0">Company</span>
                    <span className="font-semibold text-xs text-[#1A1714] text-right truncate max-w-[170px]">
                      {customerName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-3">
                    <span className="text-[#8C8177] shrink-0">Type</span>
                    <span className="px-2 py-0.5 rounded bg-[#F0F9FF] border border-[#B8E6FE] text-[#0069A8] text-[11px] font-semibold shrink-0">
                      {order?.order_type?.toUpperCase() || "B2C"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-3">
                    <span className="text-[#8C8177] shrink-0">Amount</span>
                    <span className="font-bold text-xs text-[#A85A32]">
                      ${totalAmount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-3">
                    <span className="text-[#8C8177] shrink-0">Status</span>
                    <span
                      className={`px-2.5 py-0.5 rounded border text-[11px] font-semibold capitalize shrink-0 ${getStatusBadgeStyle(
                        order?.status
                      )}`}
                    >
                      {order?.status || "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* PROGRESS Card */}
              <div className="bg-[#FFF8F3] border border-[#ECD8CB] rounded-2xl p-4 sm:p-5 shadow-xs">
                <h3 className="flex items-center gap-1.5 text-[12px] uppercase text-[#C26C35] font-bold mb-3">
                  <FiInfo size={15} />
                  PROGRESS
                </h3>

                <div className="w-full h-2 rounded-full bg-[#E8D7CA] overflow-hidden">
                  <div
                    className="h-full bg-[#B8663A] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                <p className="mt-2.5 text-xs text-[#A85A32] font-semibold">
                  {completedSteps} of {totalSteps} steps completed
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
