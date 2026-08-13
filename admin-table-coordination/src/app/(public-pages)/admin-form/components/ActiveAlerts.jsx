"use client";

import { useState, useEffect } from "react";
import { FiAlertTriangle, FiClock } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiMarkAlertsReviewed } from "@/services/DashboardService";

const defaultAlerts = [
  {
    level: "HIGH",
    levelKey: "priorityHigh",
    messageKey: "itemsWaitingInspection",
    messageCount: 5,
    actionKey: "reviewNow",
    icon: "alert",
    color: "text-red-500",
    path: "/inventory-management?tab=Inspection Queue",
  },
  {
    level: "MEDIUM",
    levelKey: "priorityMedium",
    messageKey: "lateReturns",
    messageCount: 3,
    actionKey: "viewDetails",
    icon: "clock",
    color: "text-orange-500",
    path: "/orders",
  },
];

const iconMap = {
  alert: FiAlertTriangle,
  clock: FiClock,
};

const ActiveAlerts = ({ data, onRefresh }) => {
  const router = useRouter();
  const t = useTranslations("dashboard.activeAlerts");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const [isCleared, setIsCleared] = useState(false);
  const apiAlerts = data?.Active_Alerts;

  const alertsSignature = apiAlerts
    ? `${apiAlerts.high?.count || 0}-${apiAlerts.medium?.count || 0}`
    : "default";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const clearedSignature = localStorage.getItem("dashboard_alerts_cleared_signature");
      if (clearedSignature === alertsSignature) {
        setIsCleared(true);
      } else {
        setIsCleared(false);
      }
    }
  }, [alertsSignature]);

  const handleMarkAllRead = async () => {
    setIsCleared(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboard_alerts_cleared_signature", alertsSignature);
    }
    if (accessToken) {
      try {
        await apiMarkAlertsReviewed(accessToken);
        if (onRefresh) {
          onRefresh();
        }
      } catch (err) {
        console.error("Failed to mark alerts as reviewed:", err);
      }
    }
  };

  const alerts = isCleared
    ? []
    : apiAlerts
      ? [
          {
            level: "HIGH",
            levelKey: "priorityHigh",
            messageKey: "itemsWaitingInspection",
            messageCount: apiAlerts.high?.count || 0,
            actionKey: "reviewNow",
            icon: "alert",
            color: "text-red-500",
            count: apiAlerts.high?.count || 0,
            path: "/inventory-management?tab=Inspection Queue",
          },
          {
            level: "MEDIUM",
            levelKey: "priorityMedium",
            messageKey: "lateReturns",
            messageCount: apiAlerts.medium?.count || 0,
            actionKey: "viewDetails",
            icon: "clock",
            color: "text-orange-500",
            count: apiAlerts.medium?.count || 0,
            path: "/orders",
          },
        ].filter(alert => alert.count > 0)
      : defaultAlerts;

  const alertCount = isCleared
    ? 0
    : apiAlerts
      ? alerts.reduce((total, item) => total + (item.count ?? 0), 0)
      : defaultAlerts.length;

  return (
    <div className="mt-10 px-5 md:px-8 lg:px-8 ">
      <div className="bg-white rounded-xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h3 className="text-[#1C2C56] font-semibold">{t("title")}</h3>
            <span className="bg-[#E0E7FF] text-[#1C2C56] text-xs font-medium px-2 py-0.5 rounded-full">
              {alertCount}
            </span>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="text-sm text-[#1C2C56] hover:underline cursor-pointer"
          >
            {t("markAllRead")}
          </button>
        </div>

        <div className="space-y-4">
          {alerts.length > 0 ? (
            alerts.map((alert, index) => {
              const Icon =
                iconMap[alert.icon] ||
                (alert.level === "HIGH" ? FiAlertTriangle : FiClock);
              const color =
                alert.color ||
                (alert.level === "HIGH" ? "text-red-500" : "text-orange-500");

              return (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-[#E2E8F0] rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`${color} mt-1`} size={18} />

                    <div>
                      <p className="text-sm font-semibold text-[#1C2C56]">
                        {t(alert.levelKey)}
                      </p>
                      <p className="text-sm text-[#64748B]">
                        {t(alert.messageKey, { count: alert.messageCount })}
                      </p>
                    </div>
                  </div>

                  <div className="flex md:justify-end">
                    <button
                      onClick={() => {
                        if (alert.path) {
                          router.push(alert.path);
                        }
                      }}
                      className="
      bg-[#6A341A] text-white
      px-3 py-1.5 md:px-4 md:py-2
      rounded-md
      text-xs md:text-sm
      w-fit
      cursor-pointer
    "
                    >
                      {t(alert.actionKey)}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0]">
              <p className="text-sm font-semibold text-[#64748B]">{t("allCaughtUp")}</p>
              <p className="text-xs text-[#94A3B8] mt-1">{t("allCaughtUpDesc")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveAlerts;
