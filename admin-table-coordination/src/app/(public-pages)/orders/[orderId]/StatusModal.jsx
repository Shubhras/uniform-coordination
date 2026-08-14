"use client";

import { useState } from "react";
import { apiOrderUpdate } from "@/services/OrderRentals";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { FiCheckCircle, FiX } from "react-icons/fi";
import Spinner from "@/components/ui/Spinner";
import { useTranslations } from "next-intl";

export default function StatusModal({
  open,
  onClose,
  orderId,
  status,
  accessToken,
  fetchOrder,
}) {
  const t = useTranslations("orderRetals.viewOrder");
  const ts = useTranslations("successTitle");

  const [loading, setLoading] = useState(false);
  if (!open) return null;

  const nextStatusMap = {
    // pending: "processing",
    pending: "confirmed",
    confirmed: "processing",
    processing: "out_for_delivery",
    out_for_delivery: "delivered",
    delivered: "returned",
  };

  const handleUpdateStatus = async () => {
    try {
      setLoading(true);

      const nextStatus = nextStatusMap[status];

      if (!nextStatus) {
        toast.error(t("statusCannotUpdate"));
        return;
      }

      const res = await apiOrderUpdate(accessToken, orderId, {
        status: nextStatus,
      });

      if (res?.status) {
        toast.push(
          <Notification title={ts("success")} type="success">
            {res.message}
          </Notification>,
        );

        onClose();

        if (fetchOrder) {
          await fetchOrder();
        }
      }
    } catch (err) {
      toast.error(t("somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    // pending: {
    //   title: t("markAsShipped"),
    //   button: t("markShipped"),
    //   description:
    //     "You are about to mark order as shipped. The customer will be notified that the order has been shipped.",
    // },
    // processing: {
    //   title: t("markAsDeliver"),
    //   button: t("markDeliver"),
    //   description:
    //     "You are about to mark order as delivered. The customer will be notified that the order has been delivered.",
    // },
    pending: {
      title: t("markAsConfirmed"),
      button: t("markConfirmed"),
      description:
        "You are about to mark order as confirmed. The customer will be notified that the order has been confirmed.",
    },

    confirmed: {
      title: t("markAsShipped"),
      button: t("markShipped"),
      description:
        "You are about to mark order as shipped. The customer will be notified that the order has been shipped.",
    },

    processing: {
      title: t("markAsDeliver"),
      button: t("markDeliver"),
      description:
        "You are about to mark order as delivered. The customer will be notified that the order has been delivered.",
    },
    shipped: {
      title: t("markAsDeliver"),
      button: t("markDeliver"),
      description:
        "You are about to mark order as delivered. The customer will be notified that the order has been delivered.",
    },

    delivered: {
      title: t("markAsReturned"),
      button: t("markReturned"),
      description:
        "You are about to mark this order as returned. Inventory will be updated and the item(s) will be sent for quality inspection before restocking.",
    },

    returned: {
      title: t("markAsProcess"),
      button: t("processReturnAction"),
      description:
        "You are about to move this returned order to the return processing stage.",
    },
  };

  const current = statusConfig[status?.toLowerCase()] || {
    title: t("updateStatus"),
    button: t("update"),
    description: "Are you sure you want to update this order status?",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-[2px] px-4">
      <div className="w-full max-w-[450px] rounded-[20px] bg-white shadow-2xl">
        {/* Close Button */}
        <div className="flex justify-end p-5 pb-0">
          <button
            onClick={onClose}
            className="text-[#9A9A9A] hover:text-[#555]"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="px-8 pb-8 -mt-2">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-[#F7F1EC] flex items-center justify-center mb-7">
            <FiCheckCircle size={24} className="text-[#A85A32]" />
          </div>

          {/* Heading */}
          <h2 className="text-[15px] leading-none font-bold text-[#1C1917] mb-2">
            {current.title}
          </h2>

          {/* Description */}
          <p className="text-[12px] leading-6 text-[#78716C]">
            {t("youarAbout")}{" "}
            <span className="font-medium text-[#8B8B8B]">{orderId}.</span>{" "}
            {t("inventoryText")}
          </p>

          {/* <p className="text-[12px] leading-6 text-[#78716C]">
            {current.description}{" "}
            <span className="font-medium text-[#8B8B8B]">{orderId}</span>
          </p> */}

          {/* Buttons */}
          <div className="flex justify-end items-center gap-6 mt-12">
            <button
              onClick={onClose}
              className="text-[14px] font-medium text-[#666] hover:text-[#222]"
            >
              {t("cancel")}
            </button>

            <button
              onClick={handleUpdateStatus}
              disabled={loading}
              className="bg-[#A85A32] hover:bg-[#944B25] disabled:opacity-60 text-white px-5 py-2 rounded-lg text-[14px] font-semibold shadow-md transition"
            >
              {loading ? t("updating") : current.button}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
