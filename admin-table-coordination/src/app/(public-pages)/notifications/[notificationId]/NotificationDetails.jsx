"use client";

import { useRouter } from "next/navigation";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiMail,
} from "react-icons/fi";

const notifications = {
  sent: {
    id: "NOT-0001",
    status: "Sent",
    sentAt: "09 Jul 2025, 20:02",
    deliveredAt: "09 Jul 2025",
    subject: "Your KIREIZ SPACE Order Has Been Confirmed — ORD-88421",
    from: "noreply@kireizspace.com",
    previewTitle: "Your KIREIZ SPACE Order Has Been Confirmed — ORD-88421",
    recipient: "Sophia",
    body: [
      "Thank you for your order with KIREIZ SPACE. We are pleased to confirm that your order ORD-88421 has been successfully placed and is now being processed by our fulfillment team.",
    ],
    orderSummary: [
      ["Order ID", "ORD-88421"],
      ["Order Date", "July 9, 2025"],
      ["Payment Method", "Visa •••• 4821"],
      ["Estimated Ship", "July 11, 2025"],
    ],
    itemsOrdered: [
      ["1× Ceramic Pour-Over Set (Sand)", "¥12,800"],
      ["1× Bamboo Tray — Medium", "¥4,200"],
    ],
    totals: [
      ["Subtotal", "¥17,000"],
      ["Shipping", "¥800"],
      ["Total", "¥17,800"],
    ],
    footerLines: [
      "You will receive a shipping confirmation email once your order has been dispatched. You can track the status of your order at any time through your account dashboard.",
      "If you have any questions, please contact our support team at support@kireizspace.com.",
      "With gratitude,",
      "KIREIZ SPACE Customer Experience Team",
    ],
  },
  failed: {
    id: "NOT-0002",
    status: "Failed",
    sentAt: "09 Jul 2025, 20:02",
    deliveredAt: "Not Delivered",
    subject: "Return Update — ORD-88371: Package Not Yet Received",
    from: "noreply@kireizspace.com",
    previewTitle: "Return Update — ORD-88371: Package Not Yet Received",
    recipient: "Isabella",
    body: [
      "We have not yet received the return package for order ORD-88371. Our records indicate that the return window expires on July 10, 2025.",
      "Return Reference : RTN-00285",
      "Expected by : July 8, 2025",
      "Current Status : Not Received",
      "If you have already dispatched your return, please share your tracking number with our support team so we can locate the shipment. If you have not yet sent the return, please do so before July 10, 2025 to avoid forfeiting your refund eligibility.",
      "Contact us at returns@kireizspace.com or call +81 03-0000-1234.",
      "KIREIZ SPACE Returns Team",
    ],
    orderSummary: [],
    itemsOrdered: [],
    totals: [],
    footerLines: [],
  },
};

const NotificationDetails = ({ notificationId }) => {
  const router = useRouter();
  const notification = notifications[notificationId];

  if (!notification) {
    return <div className="p-6">Notification not found.</div>;
  }

  const isSent = notification.status === "Sent";

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
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${
              isSent
                ? "bg-[#E8FAF2] text-[#15AA78]"
                : "bg-[#FFE9E8] text-[#F04444]"
            }`}
          >
            {isSent ? <FiCheckCircle size={11} /> : <FiAlertCircle size={11} />}
            {notification.status}
          </span>
        </div>

        <div className="grid gap-1 text-right text-[10px] text-[#9B8D84]">
          <div className="flex items-center justify-end gap-3">
            <span>Sent At:</span>
            <span className="font-medium text-[#5B4D46]">{notification.sentAt}</span>
          </div>
          <div className="flex items-center justify-end gap-3">
            <span>Delivered At:</span>
            <span
              className={
                isSent ? "font-medium text-[#5B4D46]" : "font-medium text-[#F04444]"
              }
            >
              {notification.deliveredAt}
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
            {notification.subject}
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
              From: <span className="text-[#6A5B54]">{notification.from}</span>
            </span>
          </div>

          <div className="p-4">
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
                      noreply@kireizspace.com • sophia.hartmann@outlook.com
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-[10px] font-semibold text-[#2F241F]">
                  {notification.previewTitle}
                </p>
              </div>

              <div className="px-4 py-4 text-[11px] leading-6 text-[#594C45]">
                <p>{notification.recipient ? `Dear ${notification.recipient},` : ""}</p>

                {notification.body.map((paragraph) => (
                  <p key={paragraph} className="mt-4">
                    {paragraph}
                  </p>
                ))}

                {notification.orderSummary.length > 0 && (
                  <>
                    <p className="mt-5 font-medium text-[#3A2F2A]">Order Summary:</p>
                    <div className="mt-3 max-w-[240px] border-t border-[#C9B9AE] pt-2">
                      {notification.orderSummary.map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between py-0.5 text-[10px]"
                        >
                          <span>{label}</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 max-w-[240px] border-t border-[#C9B9AE] pt-2">
                      {notification.itemsOrdered.map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between py-0.5 text-[10px]"
                        >
                          <span>{label}</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 max-w-[240px] border-t border-[#C9B9AE] pt-2">
                      {notification.totals.map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between py-0.5 text-[10px]"
                        >
                          <span>{label}</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {notification.footerLines.map((line) => (
                  <p key={line} className="mt-4">
                    {line}
                  </p>
                ))}

                <div className="mt-6 rounded bg-[#B56835] px-3 py-2 text-[9px] text-white/90">
                  KIREIZ SPACE Inc. · 1-23 Minami-Aoyama, Minato-ku, Tokyo 107-0062 · Japan
                  <br />
                  This is an automated transactional email. Please do not reply to this message.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetails;
