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
  const recentOrders = data?.Recent_Orders_Today || [];
  const todayCount = data?.Today_Orders_Count ?? recentOrders.length;
  const t = useTranslations("dashboard.recentOrders");

  return (
    <div className="bg-white rounded-xl border border-[#ececec] shadow-md p-5">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          {/* <div className="p-2 bg-[#FAF6F4] text-[#B66636] rounded-lg border border-[#F0E4DE]">
            <FiShoppingBag size={18} />
          </div> */}
          <div>
            <h3 className="text-[17px] font-semibold text-[#3B3B3B] flex items-center gap-2">
              {t("title")}
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#B66636]/10 text-[#B66636]">
                {todayCount} {t("today")}
              </span>
            </h3>
            {/* <p className="text-xs text-gray-500">{t("subtitle")}</p> */}
          </div>
        </div>
        <Link
          href="/orders"
          className="text-xs font-medium text-[#B66636] hover:underline flex items-center gap-1"
        >
          {t("viewall")} <FiArrowRight size={12} />
        </Link>
      </div>

      {recentOrders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F1F5F9] text-[#486284]">
              <tr className="bg-[#F7F2EE] text-[#6B7280] text-sm">
                <th className="py-2.5 px-3 text-left rounded-l-lg">
                  {t("orderId")}
                </th>
                <th className="py-2.5 px-3 text-left">{t("customer")}</th>
                <th className="py-2.5 px-3 text-left">{t("datetime")}</th>
                <th className="py-2.5 px-3 text-left">{t("amount")}</th>
                <th className="py-2.5 px-3 text-left">{t("status")}</th>
                <th className="py-2.5 px-3 text-left rounded-r-lg">
                  {t("action")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {recentOrders.map((order, index) => (
                <tr
                  key={order.id || order.order_id || index}
                  className="hover:bg-gray-50/80 transition"
                >
                  <td className="py-3 px-3 text-[14px] font-semibold text-gray-900">
                    {order.order_id}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-gray-900">
                      {order.customer_name || "Customer"}
                    </div>
                    {order.customer_email && (
                      <div className="text-xs text-gray-400">
                        {order.customer_email}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[14px] text-gray-500">
                    <div className="flex items-center gap-1">
                      <FiClock size={15} className="text-gray-400" />
                      {order.formatted_date || order.created_at}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-gray-900">
                    ${parseFloat(order.total_amount || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(order.status, order.is_paid)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-left">
                    <Link
                      href={`/orders/${order.order_id}`}
                      className="text-[13px] font-medium text-[#B66636] hover:text-[#9E5328] hover:underline"
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
          {t("noOrders")}
        </div>
      )}
    </div>
  );
};

export default RecentOrdersCard;
