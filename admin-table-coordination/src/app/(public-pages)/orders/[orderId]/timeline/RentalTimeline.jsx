"use client";

import { FiArrowLeft } from "react-icons/fi";
import { useEffect, useState } from "react";
import {
  FiFileText,
  FiSend,
  FiShoppingBag,
  FiEdit3,
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiRotateCcw,
  FiInfo,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiOrderRentalDetails } from "@/services/OrderRentals";
import Spinner from "@/components/ui/Spinner";
import { useTranslations } from "next-intl";

export default function RentalTimeline({ orderId }) {
  const t = useTranslations("orderRetals.timeline");
  const router = useRouter();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) {
      fetchOrder();
    }
  }, [accessToken]);

  const fetchOrder = async () => {
    try {
      setLoading(true);

      const res = await apiOrderRentalDetails(accessToken, orderId);
      console.log("RES =>", res);
      console.log("RES.DATA =>", res.data);

      if (res?.status) {
        setOrder(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F5]">
        <Spinner size={40} customColorClass="text-[#A0522D]" />
      </div>
    );
  }

  const timeline = [
    {
      key: "pending",
      title: t("orderConfirmed"),
      desc: t("orderCreated"),
      icon: <FiShoppingBag />,
    },
    {
      key: "confirmed",
      title: t("paymentReceived"),
      desc: t("paymentReceived"),
      icon: <FiCreditCard />,
    },
    {
      key: "processing",
      title: t("shipped"),
      desc: t("dispatched"),
      icon: <FiTruck />,
    },
    {
      key: "delivered",
      title: t("delivered"),
      desc: t("deliveredDesc"),
      icon: <FiCheckCircle />,
    },
    {
      key: "returned",
      title: t("returned"),
      desc: t("returnedDesc"),
      icon: <FiRotateCcw />,
    },
  ];

  const currentStep = timeline.findIndex(
    (item) => item.key === order?.status?.toLowerCase(),
  );

  console.log("Current Step:", currentStep);
  const totalSteps = timeline.length;
  const completedSteps = currentStep >= 0 ? currentStep + 1 : 0;
  const progressPercentage = (completedSteps / totalSteps) * 100;

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
          {t("rentalTimeline")}
        </h1>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="col-span-8 bg-white border border-[#EEE5DE] rounded-2xl p-8">
          <div className="relative">
            {timeline.map((item, index) => {
              const completed = index <= currentStep;

              return (
                <div
                  key={item.key}
                  className="relative flex justify-between pb-10 last:pb-0"
                >
                  {/* Line */}
                  {index !== timeline.length - 1 && (
                    <div
                      className={`absolute left-[17px] top-9 w-[2px] h-full ${
                        index < currentStep ? "bg-[#C96B34]" : "bg-[#E5E5E5]"
                      }`}
                    />
                  )}

                  <div className="flex gap-4">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm z-10 ${
                        completed
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
                          completed ? "text-[#2D241C]" : "text-[#B8B8B8]"
                        }`}
                      >
                        {item.title}
                      </h3>

                      <p
                        className={`text-xs mt-1 ${
                          completed ? "text-[#8D857D]" : "text-[#C6C6C6]"
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs ${
                      completed ? "text-[#8B8B8B]" : "text-[#BEBEBE]"
                    }`}
                  >
                    {completed ? t("completed") : t("pending")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-4 space-y-5">
          {/* Summary */}
          <div className="bg-white border border-[#EEE5DE] rounded-2xl p-4">
            <h3 className="text-[13px] font-medium text-[#7A6E66] uppercase mb-5">
              {t("orderSummary")}
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#8C8177]">{t("orderId")}</span>
                <span className="font-medium text-[12px] text-[#A85A32]">
                  {order?.order_id}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8C8177]">{t("company")}</span>
                <span className="font-semibold text-[#1A1714]">
                  {order?.delivery_address?.name}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8C8177]">{t("type")}</span>

                <span className="px-2 py-1 rounded bg-[#F0F9FF] border border-[#B8E6FE] text-[#0069A8] text-xs font-semibold">
                  B2C
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8C8177]">{t("amount")}</span>
                <span className="font-semibold text-[#A85A32]">
                  {order?.payment_summary?.currency || "₹"}{" "}
                  {order?.total_amount}
                </span>{" "}
              </div>

              <div className="flex justify-between">
                <span className="text-[#8C8177]">{t("status")}</span>

                <span
                  className={`px-2 py-1 rounded border text-xs font-semibold capitalize
      ${
        order?.status === "returned"
          ? "bg-[#FAF5FF] text-[#8200DB] border-[#E9D4FF]"
          : order?.status === "delivered"
            ? "bg-[#EAF8F0] text-[#3E9C68] border-[#86EFAC]"
            : order?.status === "processing"
              ? "bg-[#FFF4E5] text-[#D97706] border-[#FCD34D]"
              : order?.status === "pending"
                ? "bg-[#FFF4E5] text-[#BB4D00] border-[#BB4D00]"
                : "bg-[#EFF6FF] text-[#1447E6] border-[#BEDBFF]"
      }`}
                >
                  {order?.status}
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-[#FFF8F3] border border-[#ECD8CB] rounded-2xl p-4">
            <h3 className="flex items-center gap-2 text-[13px] uppercase text-[#C26C35] font-semibold mb-4">
              <FiInfo size={17} />
              {t("progress")}
            </h3>

            <div className="w-full h-2 rounded-full bg-[#E8D7CA] overflow-hidden">
              <div
                className="h-full bg-[#B8663A] rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <p className="mt-3 text-xs text-[#A85A32] font-semibold">
              {completedSteps} {t("of")} {totalSteps} {t("stepsCompleted")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
