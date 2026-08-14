"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiCreditCard,
  FiClock,
} from "react-icons/fi";
import Spinner from "@/components/ui/Spinner";
import StatusModal from "./StatusModal";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { useTranslations, useLocale } from "next-intl";

export default function B2COrderDetails({ orderId, order, fetchOrder }) {
  const t = useTranslations("orderRetals.viewOrder");
  const locale = useLocale();
  const router = useRouter();
  const [openReturnModal, setOpenReturnModal] = useState(false);
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const items = [
    {
      name: "Crystal Chandelier Set (6 pcs)",
      qty: 2,
      days: "14d",
      price: "$85.00",
      subtotal: "$2380.00",
    },
    {
      name: "Velvet Banquet Chair",
      qty: 60,
      days: "14d",
      price: "$4.50",
      subtotal: "$3780.00",
    },
    {
      name: "Marble Top Table (180cm)",
      qty: 10,
      days: "14d",
      price: "$28.00",
      subtotal: "$3920.00",
    },
    {
      name: "Marble Top Table (180cm)",
      qty: 10,
      days: "14d",
      price: "$28.00",
      subtotal: "$3920.00",
    },
  ];

  const statusConfig = {
    // pending: {
    //   action: t("markAsShippedAction"),
    // },
    // processing: {
    //   action: t("markAsDeliveredAction"),
    // },
    pending: {
      action: t("markAsConfirmedAction"),
    },

    confirmed: {
      action: t("markAsShippedAction"),
    },

    processing: {
      action: t("markAsDeliveredAction"),
    },

    out_for_delivery: {
      action: t("markAsDeliveredAction"),
    },

    shipped: {
      action: t("markAsDeliveredAction"),
    },
    delivered: {
      action: t("markAsReturnedAction"),
    },
    returned: {
      action: t("processReturnAction"),
      isProcessReturn: true,
    },
  };

  const currentAction = statusConfig[order?.status?.toLowerCase()] || {
    action: t("updateStatusAction"),
  };

  const handleAction = () => {
    if (currentAction.isProcessReturn) {
      router.push(`/orders/${orderId}/return`);
      return;
    }

    setOpenReturnModal(true);
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F5]">
        <Spinner size={40} customColorClass="text-[#A0522D]" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F8F7F5] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-full border border-[#E9DED4] bg-white flex items-center justify-center hover:bg-[#F8F3EE]"
            >
              <FiArrowLeft className="text-lg text-[#5B4434]" />
            </button>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-[#222]">
                {t("orderDetails")}
              </h1>

              <span
                className={`px-3 py-1 rounded-lg border text-xs font-semibold capitalize
    ${
      order?.status === "completed"
        ? "bg-[#E9F9F0] text-[#22A06B] border-[#22A06B]"
        : order?.status === "pending"
          ? "bg-[#FFF4E5] text-[#BB4D00] border-[#FEE685]"
          : "bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]"
    }`}
              >
                {order?.status}
              </span>
            </div>
          </div>

          <button
            // onClick={() => setOpenReturnModal(true)}
            onClick={handleAction}
            className="bg-[#8C4A2F] text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-[#723A24]"
          >
            {currentAction.action}
          </button>
        </div>

        {/* Top Cards */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Customer */}

          <div className="bg-white rounded-xl border border-[#EEE] p-5">
            <div className="flex items-center gap-2 text-[12px] text-[#7A6E66] mb-4">
              <FiUser size={15} className="text-[#A85A32]" />
              {t("customer")}
            </div>

            <h3 className="font-semibold text-[17px]">
              {order?.delivery_address?.name}
            </h3>

            <span className="inline-block mt-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">
              B2C
            </span>

            <div className="mt-4 space-y-1 text-[15px] text-[#7A6E66]">
              <p>{order?.delivery_address?.email}</p>
              <p>{order?.delivery_address?.phone}</p>
            </div>
          </div>

          {/* Shipping */}

          <div className="bg-white rounded-xl border border-[#EEE] p-5">
            <div className="flex items-center gap-2 text-[12px] text-[#7A6E66] mb-4">
              <FiMapPin size={15} className="text-[#A85A32]" />
              {t("shippingAdd")}
            </div>

            <h3 className="font-semibold text-[15px]">
              {order?.delivery_address?.name}
            </h3>

            <div className="text-sm text-gray-500 mt-2 leading-6">
              <p>{order?.delivery_address?.address_line_1}</p>
              <p>{order?.delivery_address?.address_line_2}</p>
              <p>
                {order?.delivery_address?.city},{" "}
                {order?.delivery_address?.postal_code}
              </p>
              <p>{order?.delivery_address?.country}</p>
            </div>
          </div>

          {/* Rental */}

          <div className="bg-white rounded-xl border border-[#EEE] p-5">
            <div className="flex items-center gap-2 text-[12px] text-[#7A6E66] mb-4">
              <FiCalendar size={17} className="text-[#A85A32]" />
              {t("rentalDates")}
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-[13px] text-[#7A6E66]">{t("rentalStart")}</p>

                <p className="font-semibold text-[#1A1714] mt-1 text-[15px]">
                  {order?.rental_start_date}
                </p>
              </div>

              <div>
                <p className="text-[13px] text-[#7A6E66]">{t("rentalEnd")}</p>

                <p className="font-semibold text-[#1A1714] mt-1 text-[15px]">
                  {order?.rental_end_date}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          {/* Table */}

          <div className="xl:col-span-3 bg-white rounded-xl border border-[#EEE] overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4">
              <h2 className="text-[15px] font-semibold text-[#1A1714]">
                {t("orderItems")}
              </h2>

              <span className="text-sm text-gray-500">
                {t("itemsCount", { count: order?.order_items?.length || 0 })}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F1F5F9] text-[#486284]">
                  <tr className="bg-[#F7F2EE] text-[#6B7280] text-sm">
                    <th className="text-left px-4 py-3 font-medium">
                      {t("item")}
                    </th>

                    <th className="text-left px-2 py-3 font-medium">
                      {t("qty")}
                    </th>

                    <th className="text-left px-4 py-3 font-medium">
                      {t("days")}
                    </th>

                    <th className="text-left px-4 py-3 font-medium">
                      {t("unitPrice")}
                    </th>

                    <th className="text-left px-4 py-3 font-medium">
                      {t("subtotal")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {order?.order_items?.map((item) => (
                    <tr
                      key={item.id}
                      className="odd:bg-white even:bg-[#FBF8F6]"
                    >
                      <td className="px-4 py-4">
                        <div className="flex">
                          <div>
                            <p className="font-semibold text-[#1A1714]">
                              {item.product_name}
                              {/* {""} {item.category} */}
                            </p>

                            <p className="text-xs text-gray-500">
                              {item.category}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-3">{item.quantity}</td>

                      <td className="px-4 py-3">{item.rental_days}d</td>

                      <td className="px-4 py-3">${item.price_per_day}</td>

                      <td className="px-4 py-3 font-semibold text-[#1A1714]">
                        ${item.subtotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment */}

          <div className="bg-white rounded-xl border border-[#EEE] p-4">
            <h2 className="flex items-center gap-2 font-semibold text-[12px] text-[#7A6E66] mb-5">
              <FiCreditCard size={15} className="text-[#A85A32]" />
              {t("paymentSummary")}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#7A6E66]">{t("totalItems")}</span>
                <span>{order?.order_items?.length || 0}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7A6E66]">{t("shipping")}</span>
                <span>{order?.payment_summary?.shipping_charge || 0}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7A6E66]">{t("promoDiscount")}</span>
                <span>{order?.payment_summary?.promo_amount || 0}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7A6E66]">{t("subtotal")}</span>
                <span>${order?.payment_summary?.subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7A6E66]">{t("deliveryFee")}</span>
                <span>${order?.payment_summary?.shipping_charge}</span>
              </div>

              {/* <div className="flex justify-between">
              <span className="text-[#7A6E66]">Tax</span>
              <span>
                {order?.payment_summary?.currency} {order?.payment_summary?.tax}
              </span>
            </div> */}

              <div className="border-t pt-4 mt-4 flex justify-between font-semibold text-[15px] text-[#1A1714]">
                <span>{t("rentalSubtotal")}</span>

                <span className="text-[#A85A32] text-[15px]">
                  ${order?.payment_summary?.total_amount}
                </span>
              </div>
            </div>

            <div className="mt-7">
              <p className="text-[13px] text-[#7A6E66] mb-2">
                {t("paymentMethod")}
              </p>

              <div className="border rounded-lg p-3 h-10 flex items-center gap-3">
                <FiCreditCard />
                {order?.payment_summary?.payment_method || t("na")}
              </div>
            </div>

            <div className="mt-6">
              {/* Payment Status */}
              <div className="flex justify-between items-center mb-4">
                <p className="text-[13px] uppercase text-[#7A6E66] font-medium">
                  {t("paymentStatus")}
                </p>

                <span
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold uppercase ${
                    order?.payment_summary?.payment_status === "success"
                      ? "bg-[#EAF9F0] text-[#22A06B] border border-[#B7E8C9]"
                      : "bg-[#FEE2E2] text-[#DC2626]"
                  }`}
                >
                  {order?.payment_summary?.payment_status === "success"
                    ? t("paid")
                    : order?.payment_summary?.payment_status || t("unpaid")}
                </span>
              </div>

              {/* Payment Date */}
              <div className="flex justify-between items-center">
                <p className="text-[13px] uppercase text-[#7A6E66] font-medium">
                  {t("paymentDate")}
                </p>

                <p className="text-[14px] text-[#6B7280]">
                  {new Date(order?.payment_summary?.paid_at).toLocaleDateString(
                    locale,
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push(`/orders/${orderId}/timeline`)}
              className="w-full mt-8 border border-[#D8A07C] text-[#A85A32] rounded-lg py-2 hover:bg-[#FFF8F3] flex items-center justify-center gap-2 text-sm font-medium"
            >
              <FiClock size={18} />
              {t("viewTimeline")}
            </button>
          </div>
        </div>
      </div>

      <StatusModal
        open={openReturnModal}
        onClose={() => setOpenReturnModal(false)}
        orderId={order?.order_id}
        status={order?.status}
        accessToken={accessToken}
        fetchOrder={fetchOrder}
      />
    </>
  );
}
