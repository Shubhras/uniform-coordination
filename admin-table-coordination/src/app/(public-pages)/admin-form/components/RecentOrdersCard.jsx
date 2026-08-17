"use client";

import Link from "next/link";
import { FiShoppingBag, FiClock, FiArrowRight } from "react-icons/fi";

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

  return (
    <div className="bg-white rounded-xl border border-[#ececec] shadow-md p-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#FAF6F4] text-[#B66636] rounded-lg border border-[#F0E4DE]">
            <FiShoppingBag size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              Recent Orders (Today)
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#B66636]/10 text-[#B66636]">
                {todayCount} Today
              </span>
            </h3>
            <p className="text-xs text-gray-500">Orders placed by customers today</p>
          </div>
        </div>
        <Link
          href="/orders"
          className="text-xs font-medium text-[#B66636] hover:underline flex items-center gap-1"
        >
          View All <FiArrowRight size={12} />
        </Link>
      </div>

      {recentOrders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="py-2.5 px-3 rounded-l-lg">Order ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {recentOrders.map((order, index) => (
                <tr key={order.id || order.order_id || index} className="hover:bg-gray-50/80 transition">
                  <td className="py-3 px-3 font-semibold text-gray-900">
                    {order.order_id}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-gray-900">{order.customer_name || "Customer"}</div>
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
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/orders/${order.order_id}`}
                      className="text-xs font-medium text-[#B66636] hover:text-[#9E5328] hover:underline"
                    >
                      Details
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
          No orders received today yet.
        </div>
      )}
    </div>
  );
};

export default RecentOrdersCard;
