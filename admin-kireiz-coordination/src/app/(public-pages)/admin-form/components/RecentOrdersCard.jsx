"use client";

import Link from "next/link";
import { FiShoppingBag, FiClock, FiArrowRight } from "react-icons/fi";
import { useTranslations } from "next-intl";

const getStatusBadge = (status, isPaid) => {
  const s = status?.toLowerCase();
  if (s === "completed" || s === "rented" || isPaid) {
    return "bg-green-100 text-green-700 border-green-200";
  }
  if (s === "pending") {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }
  if (s === "cancelled" || s === "failed") {
    return "bg-red-100 text-red-700 border-red-200";
  }
  return "bg-blue-100 text-blue-700 border-blue-200";
};

const RecentOrdersCard = ({ data }) => {
  const t = useTranslations("dashboard.recentOrders");
  const recentOrders = data?.Recent_Orders_Today || [];
  const todayCount = data?.Today_Orders_Count ?? recentOrders.length;

  const getStatusLabel = (status) => {
    if (!status) return "";
    const s = status.toLowerCase();
    switch (s) {
      case "completed":
        return t("statusCompleted");
      case "rented":
        return t("statusRented");
      case "pending":
        return t("statusPending");
      case "cancelled":
        return t("statusCancelled");
      case "failed":
        return t("statusFailed");
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#ececec] shadow-md p-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#F4F7FC] text-[#1C2C56] rounded-lg border border-[#F0E4DE]">
            <FiShoppingBag size={18} />
          </div>
          <div>
            <h3 className="text-[#1C2C56] font-semibold text-base flex items-center gap-2">
              {t("recentOrders")}
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F4F7FC] text-[#1C2C56]">
                {t("todayBadge", { count: todayCount })}
              </span>
            </h3>
            <p className="text-xs text-gray-500">{t("subtitle")}</p>
          </div>
        </div>
        <Link
          href="/quotation-requests"
          className="text-xs font-medium text-[#1C2C56] hover:underline flex items-center gap-1"
        >
          {t("viewAll")} <FiArrowRight size={12} />
        </Link>
      </div>

      {recentOrders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="py-2.5 px-3 rounded-l-lg">{t("orderId")}</th>
                <th className="py-2.5 px-3">{t("customer")}</th>
                <th className="py-2.5 px-3">{t("dateTime")}</th>
                <th className="py-2.5 px-3">{t("amount")}</th>
                <th className="py-2.5 px-3">{t("status")}</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">{t("action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {recentOrders.map((order, index) => (
                <tr key={order.id || order.order_id || index} className="hover:bg-gray-50/80 transition">
                  <td className="py-3 px-3 font-semibold text-gray-900">
                    {order.order_id}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-gray-900">{order.customer_name || t("defaultCustomer")}</div>
                    {order.customer_email && (
                      <div className="text-xs text-gray-400">{order.customer_email}</div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <FiClock size={12} className="text-gray-400" />
                      {order.formatted_date || order.created_at}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-gray-900">
                    ${parseFloat(order.total_amount || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(order.status, order.is_paid)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href="/quotation-requests"
                      className="text-xs font-medium text-[#B66636] hover:text-[#9E5328] hover:underline"
                    >
                      {t("details")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-400 text-sm">
          <FiShoppingBag size={28} className="mx-auto mb-2 opacity-50" />
          {t("noOrdersToday")}
        </div>
      )}
    </div>
  );
};

export default RecentOrdersCard;
