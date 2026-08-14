"use client";

import { useEffect, useState, use } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiProcessReturnDetails,
  apiGetOrCreateCompensationInvoice,
  apiGenerateCompensationInvoice,
} from "@/services/OrderRentals";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiAlertTriangle } from "react-icons/fi";
import Spinner from "@/components/ui/Spinner";
import Dialog from "@/components/ui/Dialog";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { useTranslations, useLocale } from "next-intl";

export default function CompensationInvoicePage({ params }) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.orderId;
  const router = useRouter();
  const locale = useLocale();
  const isJa = locale === "ja";

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [orderDetails, setOrderDetails] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchOrderAndInvoice = async () => {
    try {
      setLoading(true);
      const [orderRes, invoiceRes] = await Promise.allSettled([
        apiProcessReturnDetails(accessToken, orderId),
        apiGetOrCreateCompensationInvoice(accessToken, orderId),
      ]);

      if (orderRes.status === "fulfilled" && orderRes.value?.results?.length) {
        const found =
          orderRes.value.results.find((r) => r.order_id === orderId) ||
          orderRes.value.results[0];
        setOrderDetails(found);
      }

      if (invoiceRes.status === "fulfilled" && invoiceRes.value?.data) {
        setInvoiceData(invoiceRes.value.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchOrderAndInvoice();
    }
  }, [accessToken, orderId]);

  // Use items from DB invoiceData if available, otherwise calculate from orderDetails
  const compensationRows = [];
  if (invoiceData?.items?.length) {
    invoiceData.items.forEach((item) => {
      const issueLabel =
        item.issue_type === "missing" || item.issue_type === "Missing"
          ? "Missing"
          : "Damaged";
      compensationRows.push({
        id: item.id,
        name: item.product_name_display || item.product_name || "Item",
        issue: issueLabel,
        qty: item.quantity,
        replacement: parseFloat(item.replacement_cost) || 0,
        penalty: parseFloat(item.penalty_cost) || 0,
        total: parseFloat(item.total_cost) || 0,
      });
    });
  } else {
    const items = orderDetails?.items || [];
    const missingItems = items.filter(
      (i) => i.is_lost || i.lost_quantity > 0 || i.quantity > i.returned_quantity
    );
    const damagedItems = items.filter((i) => i.is_damaged);

    if (missingItems.length > 0) {
      missingItems.forEach((item) => {
        const qty =
          item.lost_quantity > 0
            ? item.lost_quantity
            : item.quantity - (item.returned_quantity || 0) || 1;
        const unitPrice = parseFloat(item.price_per_day) || 100;
        const replacementCost = unitPrice * qty;
        const penalty = replacementCost * 0.1;
        compensationRows.push({
          id: item.id || `m-${item.product}`,
          name: item.product_name || "Item",
          issue: "Missing",
          qty: qty,
          replacement: replacementCost,
          penalty: penalty,
          total: replacementCost + penalty,
        });
      });
    }
    if (damagedItems.length > 0) {
      damagedItems.forEach((item) => {
        const unitPrice = parseFloat(item.price_per_day) || 120;
        compensationRows.push({
          id: item.id || `d-${item.product}`,
          name: item.product_name || "Item",
          issue: "Damaged",
          qty: 1,
          replacement: unitPrice,
          penalty: 0,
          total: unitPrice,
        });
      });
    }
    if (compensationRows.length === 0) {
      compensationRows.push({
        id: "demo-1",
        name: "Napkins",
        issue: "Damaged",
        qty: 1,
        replacement: 199,
        penalty: 0,
        total: 199,
      });
    }
  }

  const grandTotal = invoiceData?.grand_total
    ? parseFloat(invoiceData.grand_total)
    : compensationRows.reduce((acc, row) => acc + row.total, 0);

  const missingCount =
    invoiceData?.missing_count ??
    compensationRows.filter((r) => r.issue === "Missing").reduce((a, b) => a + b.qty, 0);
  const damagedCount =
    invoiceData?.damaged_count ??
    compensationRows.filter((r) => r.issue === "Damaged").reduce((a, b) => a + b.qty, 0);

  const invoiceNumber = invoiceData?.invoice_number || `CP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-003`;
  const customerName = invoiceData?.customer_name || orderDetails?.customer_name || "ghanshyam nagar";
  const notesText = invoiceData?.notes || "1 item not delivered by customer; damaged item returned unrepairable. Photos uploaded by inspection staff.";

  const handleGenerateInvoice = async () => {
    try {
      setSubmitting(true);
      const res = await apiGenerateCompensationInvoice(accessToken, orderId, {
        notes: notesText,
      });

      if (res?.data) {
        setInvoiceData(res.data);
      }

      toast.push(
        <Notification type="success" title={isJa ? "成功" : "Success"}>
          {isJa
            ? `損害賠償インボイス（$${res?.data?.grand_total || grandTotal}）を発行・保存しました`
            : `Compensation invoice of $${res?.data?.grand_total || grandTotal} generated and stored successfully.`}
        </Notification>
      );
      setIsConfirmModalOpen(false);
    } catch (err) {
      toast.push(
        <Notification type="danger" title={isJa ? "エラー" : "Error"}>
          {isJa ? "発行に失敗しました" : "Failed to generate compensation invoice"}
        </Notification>
      );
    } finally {
      setSubmitting(false);
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
            className="w-9 h-9 rounded-full bg-white border border-[#E7DDD5] flex items-center justify-center hover:bg-[#F8F3EE] cursor-pointer"
          >
            <FiArrowLeft className="text-lg text-[#5B4434]" />
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-[#1A1410]">
              {isJa ? "損害賠償インボイス" : "Compensation Invoice"}
            </h1>
          </div>
        </div>

        <button
          onClick={() => setIsConfirmModalOpen(true)}
          className="px-5 py-2.5 rounded-lg bg-[#B63B2B] hover:bg-[#9E3225] text-white text-sm font-semibold cursor-pointer transition shadow-sm"
        >
          {isJa ? "損害賠償インボイスを発行" : "Generate Compensation Invoice"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Table & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Damaged / Missing Items Table */}
          <div className="bg-white border border-[#ECE6E1] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1ECE7] flex items-center gap-2">
              <FiAlertTriangle className="text-[#CA3500]" size={18} />
              <h2 className="text-base font-semibold text-[#1C1917]">
                {isJa ? "破損・欠品アイテム" : "Damaged / Missing Items"}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#FAF8F6] text-[#8B8B8B] uppercase text-[11px]">
                  <tr>
                    <th className="text-left px-6 py-3.5">{isJa ? "商品名" : "ITEM"}</th>
                    <th className="text-center px-4 py-3.5">{isJa ? "問題" : "ISSUE"}</th>
                    <th className="text-center px-4 py-3.5">{isJa ? "数量" : "QTY"}</th>
                    <th className="text-right px-4 py-3.5">
                      {isJa ? "交換コスト" : "REPLACEMENT"}
                    </th>
                    <th className="text-right px-4 py-3.5">
                      {isJa ? "ペナルティ" : "PENALTY"}
                    </th>
                    <th className="text-right px-6 py-3.5">{isJa ? "合計" : "TOTAL"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFEB]">
                  {compensationRows.map((row) => (
                    <tr key={row.id} className="hover:bg-[#FCFAF8]">
                      <td className="px-6 py-4 font-medium text-[#2C1A0E]">
                        {row.name}
                      </td>
                      <td className="text-center px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            row.issue === "Missing"
                              ? "bg-[#FFF2F2] text-[#DC2626]"
                              : "bg-[#FFF7ED] text-[#D97706]"
                          }`}
                        >
                          {row.issue === "Missing"
                            ? isJa
                              ? "欠品"
                              : "Missing"
                            : isJa
                            ? "破損"
                            : "Damaged"}
                        </span>
                      </td>
                      <td className="text-center px-4 py-4 text-[#666]">
                        {row.qty}
                      </td>
                      <td className="text-right px-4 py-4 text-[#666]">
                        ${row.replacement}
                      </td>
                      <td className="text-right px-4 py-4 text-[#666]">
                        {row.penalty > 0 ? `$${row.penalty}` : "-"}
                      </td>
                      <td className="text-right px-6 py-4 font-semibold text-[#2C1A0E]">
                        ${row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-[#FAF8F6] px-6 py-4 flex justify-between items-center border-t border-[#F1ECE7]">
              <span className="text-sm font-semibold text-[#1C1917]">
                {isJa ? "総合計" : "Grand Total"}
              </span>
              <span className="text-xl font-bold text-[#B63B2B]">
                ${grandTotal}
              </span>
            </div>
          </div>

          {/* Evidence & Notes */}
          <div className="bg-white border border-[#ECE6E1] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[#1C1917] mb-4">
              {isJa ? "証拠・メモ" : "Evidence & Notes"}
            </h2>

            <div className="flex gap-4 mb-4">
              <div className="w-20 h-20 bg-gray-100 rounded-xl border border-[#EFE5DD] overflow-hidden flex items-center justify-center text-xs text-gray-400">
                <span className="text-center px-1">
                  {isJa ? "欠品写真" : "Missing Photo"}
                </span>
              </div>
              <div className="w-20 h-20 bg-gray-100 rounded-xl border border-[#EFE5DD] overflow-hidden flex items-center justify-center text-xs text-gray-400">
                <span className="text-center px-1">
                  {isJa ? "破損写真" : "Damaged Photo"}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#666] leading-relaxed bg-[#FAF8F6] p-4 rounded-xl border border-[#F1ECE7]">
              {notesText}
            </p>
          </div>
        </div>

        {/* Right Column: Summary & Policy */}
        <div className="space-y-6">
          {/* Invoice Summary */}
          <div className="bg-white border border-[#ECE6E1] rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-[#8B8B8B] uppercase tracking-wider mb-4">
              {isJa ? "請求書サマリー" : "Invoice Summary"}
            </h2>
            <div className="space-y-3 text-sm border-b border-[#F1ECE7] pb-4">
              <div className="flex justify-between">
                <span className="text-[#8B8B8B]">{isJa ? "請求書番号" : "Invoice #"}</span>
                <span className="font-medium text-[#1C1917]">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B8B8B]">{isJa ? "注文" : "Order"}</span>
                <span className="font-medium text-[#A0522D]">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B8B8B]">{isJa ? "顧客" : "Customer"}</span>
                <span className="font-medium text-[#1C1917]">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B8B8B]">{isJa ? "欠品商品" : "Missing Items"}</span>
                <span className="font-medium text-[#1C1917]">{missingCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B8B8B]">{isJa ? "破損商品" : "Damaged Items"}</span>
                <span className="font-medium text-[#1C1917]">{damagedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B8B8B]">{isJa ? "ステータス" : "Status"}</span>
                <span
                  className={`font-semibold capitalize ${
                    invoiceData?.status === "sent" ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {invoiceData?.status || "Draft"}
                </span>
              </div>
            </div>
            <div className="pt-4 flex justify-between items-center">
              <span className="text-sm font-semibold text-[#1C1917]">
                {isJa ? "請求金額" : "Total"}
              </span>
              <span className="text-xl font-bold text-[#B63B2B]">
                ${grandTotal}
              </span>
            </div>
          </div>

          {/* Policy Reference */}
          <div className="bg-white border border-[#ECE6E1] rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-[#8B8B8B] uppercase tracking-wider mb-3">
              {isJa ? "規定・ポリシー" : "Policy Reference"}
            </h2>
            <p className="text-xs text-[#666] leading-relaxed">
              {isJa
                ? "欠品商品は再調達価格＋20%の手数料で請求されます。破損商品はレンタル利用規約第6.1条に基づき検品スタッフによって評価されます。"
                : "Missing items are charged at replacement value plus a 20% processing fee. Damaged items are assessed by inspection staff under section 6.1 of the rental agreement."}
            </p>
          </div>
        </div>
      </div>

      {/* Confirm Compensation Invoice Modal */}
      <Dialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        width={450}
      >
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mb-4">
            <FiAlertTriangle size={24} className="text-[#B63B2B]" />
          </div>
          <h3 className="text-lg font-bold text-[#1C1917] mb-2">
            {isJa ? "損害賠償インボイスを発行しますか？" : "Confirm Compensation Invoice?"}
          </h3>
          <p className="text-sm text-[#666] mb-6 leading-relaxed">
            {isJa
              ? `欠品・破損商品について $${grandTotal} のインボイスが発行され、${customerName} に送信されます。発行後に詳細を確認できます。`
              : `An invoice of $${grandTotal} will be generated for missing/damaged items and sent to ${customerName}. You can inspect invoice details after generation.`}
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="flex-1 px-4 h-10 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold cursor-pointer"
              disabled={submitting}
            >
              {isJa ? "キャンセル" : "Cancel"}
            </button>
            <button
              onClick={handleGenerateInvoice}
              disabled={submitting}
              className="flex-1 px-4 h-10 bg-[#B63B2B] hover:bg-[#9E3225] text-white rounded-lg font-semibold cursor-pointer flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <Spinner size={18} customColorClass="text-white" />
              ) : (
                isJa ? "インボイスを発行" : "Generate Invoice"
              )}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
