"use client";

import { useState } from "react";
import { FiAlertCircle, FiX } from "react-icons/fi";
import { apiOrderUpdate } from "@/services/OrderRentals";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import Spinner from "@/components/ui/Spinner";
import { useTranslations } from "next-intl";

export default function CancelOrderModal({
  open,
  onClose,
  orderId,
  accessToken,
  fetchOrder,
}) {
  const ts = useTranslations("successTitle");

  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleCancelOrder = async () => {
    if (!reason.trim()) {
      setError("Cancellation reason is required*");
      return;
    }

    try {
      setLoading(true);

      const res = await apiOrderUpdate(accessToken, orderId, {
        status: "cancelled",
        cancellation_reason: reason.trim(),
      });

      if (res?.status) {
        toast.push(
          <Notification title={ts("success")} type="success">
            {res.message || "Order cancelled successfully."}
          </Notification>,
        );

        setReason("");
        onClose();

        if (fetchOrder) {
          await fetchOrder();
        }
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong while cancelling the order.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[450px] rounded-[20px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#F0E8E2] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#2C1810]">Cancel Order</h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-[#9A9A9A] hover:text-[#555]"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="mb-6 flex gap-3 rounded-xl bg-[#FFF7F2] p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FBE9DD]">
              <FiAlertCircle className="text-[#A85A32]" size={20} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#2C1810]">
                Are you sure you want to cancel the order?
              </p>

              <p className="mt-1 text-xs leading-5 text-[#7A6A60]">
                This action will cancel the order and cannot be undone.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#2C1810]">
              Cancellation Reason
            </label>

            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              disabled={loading}
              rows={4}
              placeholder="Enter cancellation reason"
              className="w-full resize-none rounded-lg border border-[#E5D9D0] bg-white px-3 py-3 text-sm text-[#2C1810] outline-none placeholder:text-[#A99B91] focus:border-[#A85A32]"
            />

            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <div className="mt-7 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-[#E5D9D0] px-5 py-2.5 text-sm font-medium text-[#5B4434]"
            >
              Keep Order
            </button>

            <button
              type="button"
              onClick={handleCancelOrder}
              disabled={loading || !reason.trim()}
              className="flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Spinner size={18} /> : "Cancel Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
