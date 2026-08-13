"use client";

import { useEffect, useState } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiProcessReturnDetails } from "@/services/OrderRentals";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiAlertCircle, FiClock, FiCheckCircle } from "react-icons/fi";
import Spinner from "@/components/ui/Spinner";
import { useTranslations, useLocale } from "next-intl";

export default function ProcessReturn({ orderId }) {
  const t = useTranslations("orderRetals.processReturn");
  const locale = useLocale();
  const router = useRouter();

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await apiProcessReturnDetails(accessToken, orderId);

      console.log("PROCESS RETURN =>", res);

      if (res?.results?.length) {
        const found =
          res.results.find((r) => r.order_id === orderId) || res.results[0];
        setOrderDetails(found);
      }
    } catch (err) {
      console.error("Error fetching process return details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchOrder();
    }
  }, [accessToken, orderId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  // Dynamic Overdue Calculation
  const expectedDate = orderDetails?.end_date ? new Date(orderDetails.end_date) : null;
  const actualDate = orderDetails?.actual_return_date
    ? new Date(orderDetails.actual_return_date)
    : new Date();

  let overdueDays = 0;
  if (expectedDate && actualDate) {
    const diffTime = actualDate - expectedDate;
    if (diffTime > 0) {
      overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }
  const isOverdue = overdueDays > 0;

  // Dynamic Missing / Damaged Items Calculation
  const missingItems =
    orderDetails?.items?.filter(
      (item) =>
        item.is_lost ||
        item.lost_quantity > 0 ||
        (item.returned_quantity < item.quantity && orderDetails?.order_status === "returned")
    ) || [];

  const damagedItems =
    orderDetails?.items?.filter((item) => item.is_damaged) || [];

  const missingDetails = missingItems.map((item) => {
    const qty =
      item.lost_quantity > 0
        ? item.lost_quantity
        : item.quantity - item.returned_quantity > 0
        ? item.quantity - item.returned_quantity
        : 1;
    return locale === "ja"
      ? `欠品 ${item.product_name} ${qty}個`
      : `${qty} missing ${item.product_name || "item"}`;
  });

  const damagedDetails = damagedItems.map((item) => {
    return locale === "ja"
      ? `破損 ${item.product_name} 1個`
      : `1 damaged ${item.product_name || "item"}`;
  });

  const missingDamagedSummary = [...missingDetails, ...damagedDetails].join(" • ");
  const hasMissingOrDamaged = missingDetails.length > 0 || damagedDetails.length > 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Available":
        return "bg-[#E8FFF3] text-[#22A06B]";
      case "Missing/Damaged":
      case "Missing":
        return "bg-[#FFF3E8] text-[#D97706]";
      case "Damaged":
        return "bg-[#FEECEC] text-[#DC2626]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={40} customColorClass="text-[#A0522D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white border border-[#E7DDD5] flex items-center justify-center hover:bg-[#F8F3EE]"
          >
            <FiArrowLeft className="text-lg text-[#5B4434]" />
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-[#1A1410]">
              {t("processReturn")}
            </h1>
            <p className="text-sm text-[#8B8B8B] mt-1">
              {t("orderId")} :{" "}
              <span className="font-medium text-[#A0522D]">{orderId}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() =>
              router.push(`/inventory-management?tab=inspection&search=${orderId}`)
            }
            className="px-4 py-2 rounded-lg bg-[#F0EBE5] border border-[#E7DDD5] text-[#8C4A2F] text-sm font-semibold hover:bg-[#E7DDD5] cursor-pointer transition"
          >
            {t("continueInspection")}
          </button>

          <button
            disabled={!isOverdue}
            onClick={() => router.push(`/orders/${orderId}/return/late-fee`)}
            title={
              !isOverdue
                ? locale === "ja"
                  ? "期限内に返却されたため延滞料金はありません"
                  : "Order returned on time. No late fee applicable."
                : ""
            }
            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${
              isOverdue
                ? "border-[#E7DDD5] bg-white text-[#A85A32] hover:bg-[#F8F3EE] cursor-pointer"
                : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
            }`}
          >
            {t("lateFee")}
          </button>

          <button
            onClick={() => router.push(`/orders/${orderId}/return/compensation`)}
            className="px-4 py-2 rounded-lg bg-[#B63B2B] text-white text-sm font-semibold hover:bg-[#9E3225] cursor-pointer transition"
          >
            {t("generate")}
          </button>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-4 mb-6">
        {/* Overdue Alert */}
        {isOverdue ? (
          <div className="flex gap-3 rounded-xl border border-[#FFC9C9] bg-[#FEF2F2] p-4">
            <FiClock className="text-[#DC2626] mt-1 flex-shrink-0" size={17} />
            <div>
              <h3 className="text-[15px] font-semibold text-[#C10007]">
                {locale === "ja"
                  ? `返却期限を ${overdueDays} 日超過しています`
                  : `Return overdue by ${overdueDays} day${overdueDays > 1 ? "s" : ""}`}
              </h3>
              <p className="text-[12px] font-medium text-[#FB2C36] mt-1">
                {t("expected")}: {formatDate(orderDetails?.end_date)} • {t("actual")}: {formatDate(orderDetails?.actual_return_date || actualDate)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 rounded-xl border border-[#C6F6D5] bg-[#F0FFF4] p-4">
            <FiCheckCircle className="text-[#22A06B] mt-1 flex-shrink-0" size={17} />
            <div>
              <h3 className="text-[15px] font-semibold text-[#22A06B]">
                {locale === "ja" ? "期限内の返却" : "On-time Return"}
              </h3>
              <p className="text-[12px] font-medium text-[#2F855A] mt-1">
                {t("expected")}: {formatDate(orderDetails?.end_date)} • {t("actual")}: {formatDate(orderDetails?.actual_return_date || actualDate)}
              </p>
            </div>
          </div>
        )}

        {/* Missing / Damaged Items Alert */}
        {hasMissingOrDamaged ? (
          <div className="flex gap-3 rounded-xl border border-[#F6D8AF] bg-[#FFF7ED] p-4">
            <FiAlertCircle className="text-[#F59E0B] mt-1 flex-shrink-0" size={17} />
            <div>
              <h3 className="text-[15px] font-semibold text-[#CA3500]">
                {t("missinDamaged")}
              </h3>
              <p className="text-[12px] text-[#FF6900] mt-1 font-medium">
                {missingDamagedSummary}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <FiCheckCircle className="text-[#64748B] mt-1 flex-shrink-0" size={17} />
            <div>
              <h3 className="text-[15px] font-semibold text-[#334155]">
                {locale === "ja" ? "欠品・破損アイテムなし" : "No Missing or Damaged Items"}
              </h3>
              <p className="text-[12px] text-[#64748B] mt-1">
                {locale === "ja"
                  ? "すべての商品が正常に返却されました。"
                  : "All items in this order were returned in good condition."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl border border-[#ECE6E1] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F1ECE7]">
          <h2 className="text-[16px] font-semibold text-[#1C1917]">
            {t("itemsChecklist")}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF8F6] text-[#8B8B8B] uppercase text-[11px]">
              <tr>
                <th className="text-left px-6 py-4">{t("item")}</th>
                <th className="text-center px-4 py-4">{t("rented")}</th>
                <th className="text-center px-4 py-4">{t("returned")}</th>
                <th className="text-center px-4 py-4">{t("missing")}</th>
                <th className="text-center px-4 py-4">{t("damaged")}</th>
                <th className="text-center px-4 py-4">{t("late")}</th>
                <th className="text-center px-6 py-4">{t("status")}</th>
              </tr>
            </thead>

            <tbody>
              {orderDetails?.items?.map((item) => {
                const missingQty =
                  item.lost_quantity > 0
                    ? item.lost_quantity
                    : item.is_lost
                    ? item.quantity - item.returned_quantity
                    : 0;

                const isItemDamaged = item.is_damaged;

                const statusType =
                  missingQty > 0 || isItemDamaged
                    ? missingQty > 0 && isItemDamaged
                      ? "Missing/Damaged"
                      : isItemDamaged
                      ? "Damaged"
                      : "Missing"
                    : "Available";

                return (
                  <tr
                    key={item.id}
                    className="border-t border-[#F4EFEB] hover:bg-[#FCFAF8]"
                  >
                    <td className="px-6 py-5 font-medium text-[#2C1A0E]">
                      {item.product_name}
                    </td>

                    <td className="text-center text-[#666]">{item.quantity}</td>

                    <td className="text-center text-[#666]">
                      {item.returned_quantity ?? 0}
                    </td>

                    <td
                      className={`text-center font-semibold ${
                        missingQty > 0 ? "text-[#DC2626]" : "text-[#888]"
                      }`}
                    >
                      {missingQty > 0 ? missingQty : 0}
                    </td>

                    <td
                      className={`text-center font-semibold ${
                        isItemDamaged ? "text-[#DC2626]" : "text-[#888]"
                      }`}
                    >
                      {isItemDamaged ? t("yes") : t("no")}
                    </td>

                    <td
                      className={`text-center font-semibold ${
                        isOverdue ? "text-[#DC2626]" : "text-[#888]"
                      }`}
                    >
                      {isOverdue ? t("yes") : t("no")}
                    </td>

                    <td className="text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          statusType
                        )}`}
                      >
                        {statusType === "Missing/Damaged"
                          ? t("statusMissingDamaged")
                          : statusType === "Damaged"
                          ? t("statusDamaged")
                          : statusType === "Missing"
                          ? locale === "ja"
                            ? "欠品"
                            : "Missing"
                          : t("statusAvailable")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
