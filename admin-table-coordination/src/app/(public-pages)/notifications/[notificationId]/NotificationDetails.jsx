"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiMail,
} from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetNotificationDetails } from "@/services/NotificationService";

const recentNotificationRequests = new Map();
const NOTIFICATION_REQUEST_DEDUP_MS = 1500;

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const getStatusLabel = (item) => {
  const rawStatus =
    item?.status ||
    item?.notification_status ||
    item?.delivery_status ||
    item?.state;

  if (typeof rawStatus === "string") {
    const normalized = rawStatus.trim().toLowerCase();

    if (["sent", "success", "delivered", "done"].includes(normalized)) {
      return "Sent";
    }

    if (["failed", "error", "undelivered"].includes(normalized)) {
      return "Failed";
    }
  }

  if (typeof item?.is_sent === "boolean") {
    return item.is_sent ? "Sent" : "Failed";
  }

  return "Sent";
};

const toParagraphs = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => String(item));
  }

  if (typeof value === "string") {
    return value
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const getNotificationPayload = (payload) => {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload[0] || null;
  if (Array.isArray(payload?.results)) return payload.results[0] || null;
  if (Array.isArray(payload?.data)) return payload.data[0] || null;

  return payload?.notification || payload?.result || payload?.data || payload;
};

const normalizeNotificationDetails = (item) => {
  const sentAtRaw =
    item?.sent_at || item?.created_at || item?.updated_at || item?.timestamp;
  const deliveredAtRaw =
    item?.delivered_at || item?.read_at || item?.updated_at || null;
  const bodyParagraphs = toParagraphs(
    item?.message ||
      item?.body ||
      item?.description ||
      item?.content ||
      item?.text ||
      "",
  );

  return {
    ...item,
    id: item?.id ?? item?.notification_id ?? item?.pk,
    statusLabel: getStatusLabel(item),
    sentAt: formatDate(sentAtRaw),
    deliveredAt: deliveredAtRaw ? formatDate(deliveredAtRaw) : "Not Delivered",
    subject:
      item?.subject ||
      item?.title ||
      item?.notification_title ||
      item?.heading ||
      "Notification Details",
    from:
      item?.from_email ||
      item?.sender_email ||
      item?.sender ||
      "noreply@kireizspace.com",
    recipientName:
      item?.recipient_name ||
      item?.recipient ||
      item?.customer_name ||
      item?.user_name ||
      item?.name ||
      "",
    recipientEmail:
      item?.recipient_email ||
      item?.email ||
      item?.user_email ||
      item?.customer_email ||
      "",
    previewTitle:
      item?.preview_title ||
      item?.subject ||
      item?.title ||
      item?.notification_title ||
      "Notification Preview",
    body:
      bodyParagraphs.length > 0
        ? bodyParagraphs
        : ["No notification message content is available for this record."],
    orderSummary: [
      ["Notification ID", item?.id ?? item?.notification_id ?? item?.pk ?? "-"],
      ["Order ID", item?.order_id || item?.orderId || item?.reference_id || "-"],
      ["Priority", item?.priority || "-"],
      ["Type", item?.notification_type || item?.type || "-"],
    ],
  };
};

const NotificationDetails = ({ notificationId }) => {
  const router = useRouter();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNotificationDetails = useCallback(async () => {
    if (!accessToken || !notificationId) {
      setLoading(false);
      return;
    }

    const requestKey = `${accessToken}:${notificationId}`;
    const now = Date.now();
    const previousRequestTime = recentNotificationRequests.get(requestKey);

    if (
      typeof previousRequestTime === "number" &&
      now - previousRequestTime < NOTIFICATION_REQUEST_DEDUP_MS
    ) {
      return;
    }

    recentNotificationRequests.set(requestKey, now);

    try {
      setLoading(true);
      const response = await apiGetNotificationDetails(accessToken, notificationId);
      const payload = response?.data?.data || response?.data || response;
      const rawNotification = getNotificationPayload(payload);
      setNotification(
        rawNotification ? normalizeNotificationDetails(rawNotification) : null,
      );
    } catch (error) {
      console.error("Failed to fetch notification details:", error);
      setNotification(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, notificationId]);

  useEffect(() => {
    fetchNotificationDetails();
  }, [fetchNotificationDetails]);

  const isSent = notification?.statusLabel === "Sent";
  const summaryRows = useMemo(() => {
    return (notification?.orderSummary || []).filter(([, value]) => value && value !== "-");
  }, [notification]);

  if (!notificationId) {
    return <div className="p-6">Notification not found.</div>;
  }

  return (
    <div className="min-h-screen bg-white px-3 py-4 sm:px-6 sm:py-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#EDE0D7] bg-white text-[#6F6058]"
          >
            <FiArrowLeft size={12} />
          </button>
          <h1 className="text-[20px] font-semibold text-[#241915] sm:text-[28px]">
            Notification Details
          </h1>
          {!loading && notification ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                isSent
                  ? "bg-[#E8FAF2] text-[#007A55]"
                  : "bg-[#FFE9E8] text-[#F04444]"
              }`}
            >
              {isSent ? (
                <FiCheckCircle size={11} />
              ) : (
                <FiAlertCircle size={11} />
              )}
              {notification.statusLabel}
            </span>
          ) : null}
        </div>

        <div className="grid gap-1 text-right text-[10px] text-[#9B8D84]">
          <div className="flex items-center justify-end gap-3">
            <span>Sent At:</span>
            <span className="font-medium text-[#5B4D46]">
              {loading ? "Loading..." : notification?.sentAt || "-"}
            </span>
          </div>
          <div className="flex items-center justify-end gap-3">
            <span>Delivered At:</span>
            <span
              className={
                isSent ? "font-medium text-[#5B4D46]" : "font-medium text-[#F04444]"
              }
            >
              {loading ? "Loading..." : notification?.deliveredAt || "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-[#F2E7DE] bg-white">
          <div className="border-b border-[#F7EEE7] px-4 py-2.5">
            <h3 className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#BC9074]">
              Subject Line
            </h3>
          </div>
          <div className="px-4 py-3 text-[11px] font-medium text-[#3E312A] sm:text-xs">
            {loading
              ? "Loading notification subject..."
              : notification?.subject || "Notification Details"}
          </div>
        </div>

        <div className="rounded-xl border border-[#F2E7DE] bg-white">
          <div className="flex items-center justify-between border-b border-[#F7EEE7] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <FiMail size={12} className="text-[#BC9074]" />
              <h3 className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#BC9074]">
                Email Content Preview
              </h3>
            </div>
            <span className="text-[10px] text-[#A1948B]">
              From:{" "}
              <span className="text-[#6A5B54]">
                {loading ? "Loading..." : notification?.from || "-"}
              </span>
            </span>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                <div className="h-5 w-48 animate-pulse rounded bg-[#F5ECE6]" />
                <div className="h-4 w-full animate-pulse rounded bg-[#F5ECE6]" />
                <div className="h-4 w-11/12 animate-pulse rounded bg-[#F5ECE6]" />
                <div className="h-4 w-10/12 animate-pulse rounded bg-[#F5ECE6]" />
              </div>
            ) : notification ? (
              <div className="overflow-hidden rounded-lg border border-[#F3E7DE]">
                <div className="border-b border-[#F7EEE7] bg-[#FBF7F4] px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#B56835] text-[9px] font-semibold text-white">
                      KS
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[#5A4C45]">
                        KIREIZ SPACE
                      </p>
                      <p className="text-[9px] text-[#A4968C]">
                        {notification.from}
                        {notification.recipientEmail
                          ? ` • ${notification.recipientEmail}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] font-semibold text-[#2F241F]">
                    {notification.previewTitle}
                  </p>
                </div>

                <div className="px-4 py-4 text-[11px] leading-6 text-[#594C45]">
                  {notification.recipientName ? (
                    <p>{`Dear ${notification.recipientName},`}</p>
                  ) : null}

                  {notification.body.map((paragraph) => (
                    <p key={paragraph} className="mt-4">
                      {paragraph}
                    </p>
                  ))}

                  {summaryRows.length > 0 ? (
                    <>
                      <p className="mt-5 font-medium text-[#3A2F2A]">
                        Notification Summary:
                      </p>
                      <div className="mt-3 max-w-[280px] border-t border-[#C9B9AE] pt-2">
                        {summaryRows.map(([label, value]) => (
                          <div
                            key={label}
                            className="flex items-center justify-between gap-4 py-0.5 text-[10px]"
                          >
                            <span>{label}</span>
                            <span className="text-right">{value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}

                  <div className="mt-6 rounded bg-[#B56835] px-3 py-2 text-[9px] text-white/90">
                    KIREIZ SPACE Inc. · 1-23 Minami-Aoyama, Minato-ku, Tokyo
                    107-0062 · Japan
                    <br />
                    This is an automated transactional email. Please do not
                    reply to this message.
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-[13px] text-[#8B6A55]">
                Notification details not found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetails;
