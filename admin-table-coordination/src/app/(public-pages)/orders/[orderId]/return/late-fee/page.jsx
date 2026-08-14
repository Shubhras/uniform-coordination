"use client";

import { useEffect, useState, use } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiProcessReturnDetails,
  apiGetOrCreateLateFeeInvoice,
  apiNotifyLateFeeCustomer,
} from "@/services/OrderRentals";
import { apiGetPricingList } from "@/services/PricingPackages";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiClock, FiCheck, FiSend } from "react-icons/fi";
import Spinner from "@/components/ui/Spinner";
import Dialog from "@/components/ui/Dialog";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { useTranslations, useLocale } from "next-intl";

export default function LateFeePage({ params }) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.orderId;
  const router = useRouter();
  const locale = useLocale();
  const isJa = locale === "ja";

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [orderDetails, setOrderDetails] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [pricingPolicy, setPricingPolicy] = useState(null);
  const [loading, setLoading] = useState(false);

  // Late Fee Form State
  const [rawOverdueDays, setRawOverdueDays] = useState(3);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchOrderAndInvoice = async () => {
    try {
      setLoading(true);
      const [orderRes, policyRes, invoiceRes] = await Promise.allSettled([
        apiProcessReturnDetails(accessToken, orderId),
        apiGetPricingList(accessToken),
        apiGetOrCreateLateFeeInvoice(accessToken, orderId),
      ]);

      if (orderRes.status === "fulfilled" && orderRes.value?.results?.length) {
        const found =
          orderRes.value.results.find((r) => r.order_id === orderId) ||
          orderRes.value.results[0];
        setOrderDetails(found);

        if (found.end_date) {
          const expected = new Date(found.end_date);
          const actual = found.actual_return_date
            ? new Date(found.actual_return_date)
            : new Date();
          const diff = Math.ceil((actual - expected) / (1000 * 60 * 60 * 24));
          if (diff > 0) setRawOverdueDays(diff);
        }
      }

      if (policyRes.status === "fulfilled" && policyRes.value?.data) {
        setPricingPolicy(policyRes.value.data);
      }

      if (invoiceRes.status === "fulfilled" && invoiceRes.value?.data) {
        const inv = invoiceRes.value.data;
        setInvoiceData(inv);
        if (inv.days_late) setRawOverdueDays(inv.days_late);
        if (inv.notification_message) {
          setNotificationMsg(inv.notification_message);
        }
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

  // Policy Settings or fallbacks from screenshot
  const gracePeriod = pricingPolicy?.grace_period_days ?? 4;
  const lateFeeRatePct = parseFloat(pricingPolicy?.late_fee_rate) || 5.0; // 5% per day
  const formulaLabel =
    pricingPolicy?.late_fee_formula_label ||
    "Rental Value × Late Fee % × Days Overdue";

  const displayOverdueDays = invoiceData?.days_late ?? rawOverdueDays;

  // Calculation taking grace period into account
  const billableDays = Math.max(0, displayOverdueDays - gracePeriod);
  const orderTotalAmount = parseFloat(orderDetails?.total_amount) || 1700;
  
  const calculatedFee =
    billableDays > 0
      ? Math.round(orderTotalAmount * (lateFeeRatePct / 100) * billableDays)
      : Math.round(displayOverdueDays * 85);

  const totalLateFee = invoiceData?.total_late_fee
    ? parseFloat(invoiceData.total_late_fee)
    : calculatedFee > 0
    ? calculatedFee
    : displayOverdueDays * 85;

  const ratePerDayDisplay = invoiceData?.rate_per_day
    ? `$${Math.round(parseFloat(invoiceData.rate_per_day))}`
    : `$${Math.round(totalLateFee / (displayOverdueDays || 1))}`;

  const invoiceNum = invoiceData?.invoice_number || `LF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-001`;
  const customerName = invoiceData?.customer_name || orderDetails?.customer_name || "Customer";
  const customerEmail = invoiceData?.customer_email;
  const expectedReturnDate = invoiceData?.expected_return_date || orderDetails?.end_date || "2025-07-01";
  const actualReturnDate = invoiceData?.actual_return_date || orderDetails?.actual_return_date || "2025-07-04";

  useEffect(() => {
    if (!invoiceData?.notification_message) {
      setNotificationMsg(
        isJa
          ? `${customerName} 様,\n\nレンタル注文 ${orderId} について、合意された返却日（${expectedReturnDate}）より ${displayOverdueDays} 日遅れて返却されたことを確認いたしました。レンタル契約に基づき、アカウントに $${totalLateFee} の延滞料金が適用されました。`
          : `Dear ${customerName},\nWe've noted that your rental order ${orderId} was returned ${displayOverdueDays} days after the agreed date of ${expectedReturnDate}. As per our rental agreement, a late return fee of $${totalLateFee} has been applied to your account.`
      );
    }
  }, [customerName, orderId, displayOverdueDays, totalLateFee, expectedReturnDate, isJa, invoiceData]);

  const handleSendNotification = async () => {
    try {
      setSubmitting(true);
      const res = await apiNotifyLateFeeCustomer(accessToken, orderId, {
        notification_message: notificationMsg,
      });

      if (res?.data) {
        setInvoiceData(res.data);
      }

      toast.push(
        <Notification type="success" title={isJa ? "成功" : "Success"}>
          {isJa
            ? `遅延損害金インボイス（$${res?.data?.total_late_fee || totalLateFee}）を ${res?.data?.customer_email || "顧客"} に送信しました`
            : `Late fee invoice of $${res?.data?.total_late_fee || totalLateFee} sent to ${res?.data?.customer_email || "customer email"}.`}
        </Notification>
      );
      setIsNotifyModalOpen(false);
    } catch (err) {
      toast.push(
        <Notification type="danger" title={isJa ? "エラー" : "Error"}>
          {isJa ? "送信に失敗しました" : "Failed to send notification email"}
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
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white border border-[#E7DDD5] flex items-center justify-center hover:bg-[#F8F3EE] cursor-pointer"
        >
          <FiArrowLeft className="text-lg text-[#5B4434]" />
        </button>

        <div>
          <h1 className="text-2xl font-semibold text-[#1A1410]">
            {isJa ? "延滞料金" : "Late Fee"}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Fee Calculation & Message */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fee Calculation Card */}
          <div className="bg-white border border-[#ECE6E1] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiClock className="text-[#A0522D]" size={18} />
              <h2 className="text-base font-semibold text-[#1C1917]">
                {isJa ? "料金計算" : "Fee Calculation"}
              </h2>
            </div>

            {/* Summary Stat Boxes */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#FAF8F6] border border-[#EFE5DD] rounded-xl p-4 text-center">
                <span className="block text-sm font-semibold text-[#1C1917]">
                  {expectedReturnDate}
                </span>
                <span className="text-xs text-[#8B8B8B] mt-0.5 block">
                  {isJa ? "予定返却日" : "Expected Return"}
                </span>
              </div>

              <div className="bg-[#FAF8F6] border border-[#EFE5DD] rounded-xl p-4 text-center">
                <span className="block text-sm font-semibold text-[#1C1917]">
                  {actualReturnDate}
                </span>
                <span className="text-xs text-[#8B8B8B] mt-0.5 block">
                  {isJa ? "実際の返却日" : "Actual Return"}
                </span>
              </div>

              <div className="bg-[#FAF8F6] border border-[#EFE5DD] rounded-xl p-4 text-center">
                <span className="block text-sm font-bold text-[#C10007]">
                  {displayOverdueDays} {isJa ? "日遅延" : "days Late"}
                </span>
                <span className="text-xs text-[#8B8B8B] mt-0.5 block">
                  {isJa ? "遅延日数" : "Days Late"}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-[#F1ECE7] rounded-xl mb-4">
              <table className="w-full text-sm">
                <thead className="bg-[#FAF8F6] text-[#8B8B8B] uppercase text-[11px]">
                  <tr>
                    <th className="text-left px-4 py-3">
                      {isJa ? "説明" : "DESCRIPTION"}
                    </th>
                    <th className="text-center px-4 py-3">
                      {isJa ? "単価" : "RATE"}
                    </th>
                    <th className="text-center px-4 py-3">
                      {isJa ? "日数" : "DAYS"}
                    </th>
                    <th className="text-right px-4 py-3">
                      {isJa ? "金額" : "AMOUNT"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFEB]">
                  <tr>
                    <td className="px-4 py-3.5 font-medium text-[#2C1A0E]">
                      {isJa ? "標準延滞料金" : "Standard Late Fee"}
                    </td>
                    <td className="text-center px-4 py-3.5 text-[#666]">
                      {ratePerDayDisplay}/{isJa ? "日" : "day"}
                    </td>
                    <td className="text-center px-4 py-3.5 text-[#666]">
                      {displayOverdueDays}
                    </td>
                    <td className="text-right px-4 py-3.5 font-semibold text-[#2C1A0E]">
                      ${totalLateFee}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-semibold text-[#1C1917]">
                {isJa ? "延滞料金合計" : "Total Late Fee"}
              </span>
              <span className="text-lg font-bold text-[#A0522D]">
                ${totalLateFee}
              </span>
            </div>
          </div>

          {/* Notification Message Card */}
          <div className="bg-white border border-[#ECE6E1] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[#1C1917] mb-3">
              {isJa ? "通知メッセージ" : "Notification Message"}
            </h2>
            <textarea
              rows={5}
              value={notificationMsg}
              onChange={(e) => setNotificationMsg(e.target.value)}
              className="w-full p-4 rounded-xl border border-[#EFE5DD] bg-[#FAF8F6] text-sm text-[#2C1A0E] focus:outline-none focus:border-[#A0522D]"
            />
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => setIsNotifyModalOpen(true)}
                className="px-6 py-2.5 rounded-lg bg-[#8C4A2F] text-white text-sm font-semibold hover:bg-[#733D26] cursor-pointer transition flex items-center gap-2"
              >
                <FiSend size={16} />
                {invoiceData?.is_notified || invoiceData?.status === "sent"
                  ? isJa
                    ? "再通知を送信"
                    : "Resend Notification"
                  : isJa
                  ? "顧客に通知"
                  : "Notify Customer"}
              </button>

              {(invoiceData?.is_notified || invoiceData?.status === "sent") && (
                <span className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
                  {isJa ? "通知送信済み" : "Notification Sent"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Invoice Preview & Policy Reference */}
        <div className="space-y-6">
          {/* Invoice Preview */}
          <div className="bg-white border border-[#ECE6E1] rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-[#8B8B8B] uppercase tracking-wider mb-4">
              {isJa ? "請求書プレビュー" : "Invoice Preview"}
            </h2>
            <div className="space-y-3 text-sm border-b border-[#F1ECE7] pb-4">
              <div className="flex justify-between">
                <span className="text-[#8B8B8B]">{isJa ? "請求書番号" : "Invoice #"}</span>
                <span className="font-medium text-[#1C1917]">{invoiceNum}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B8B8B]">{isJa ? "注文" : "Order"}</span>
                <span className="font-medium text-[#A0522D]">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B8B8B]">{isJa ? "顧客" : "Customer"}</span>
                <span className="font-medium text-[#1C1917]">{customerName}</span>
              </div>
              {customerEmail && (
                <div className="flex justify-between">
                  <span className="text-[#8B8B8B]">{isJa ? "メール" : "Email"}</span>
                  <span className="font-medium text-[#1C1917]">{customerEmail}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#8B8B8B]">{isJa ? "ステータス" : "Status"}</span>
                <span
                  className={`font-semibold capitalize ${
                    invoiceData?.status === "sent" ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {invoiceData?.status || "Pending"}
                </span>
              </div>
            </div>
            <div className="pt-4 flex justify-between items-center">
              <span className="text-sm font-semibold text-[#1C1917]">
                {isJa ? "請求金額" : "Amount Due"}
              </span>
              <span className="text-xl font-bold text-[#A0522D]">
                ${totalLateFee}
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
                ? `遅延損害金はレンタル料金 ${lateFeeRatePct}% / 日で計算され、猶予期間 ${gracePeriod} 日の後に適用されます。（${formulaLabel}）`
                : `Late returns are charged at ${lateFeeRatePct}% per day based on policy rules. Fees apply after a ${gracePeriod}-day grace period (${formulaLabel}).`}
            </p>
          </div>
        </div>
      </div>

      {/* Notify Customer Modal */}
      <Dialog
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        width={450}
      >
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mb-4">
            <FiCheck size={24} className="text-[#8C4A2F]" />
          </div>
          <h3 className="text-lg font-bold text-[#1C1917] mb-2">
            {isJa ? "延滞料金を顧客に通知しますか？" : "Notify Customer of Late Fee?"}
          </h3>
          <p className="text-sm text-[#666] mb-6 leading-relaxed">
            {isJa
              ? `延滞料金インボイス（$${totalLateFee}）がメールで顧客に送信されます。この操作は取り消せません。`
              : `A late fee invoice of $${totalLateFee} will be sent to the customer via email. This action is irreversible.`}
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setIsNotifyModalOpen(false)}
              className="flex-1 px-4 h-10 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold cursor-pointer"
              disabled={submitting}
            >
              {isJa ? "キャンセル" : "Cancel"}
            </button>
            <button
              onClick={handleSendNotification}
              disabled={submitting}
              className="flex-1 px-4 h-10 bg-[#8C4A2F] hover:bg-[#733D26] text-white rounded-lg font-semibold cursor-pointer flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <Spinner size={18} customColorClass="text-white" />
              ) : (
                isJa ? "通知を送信" : "Send Notification"
              )}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
