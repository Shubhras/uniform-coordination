"use client";

import { useState } from "react";
import { FiAlertTriangle, FiClock, FiCheckCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiMarkDashboardAlertsRead } from "@/services/DashboardService";

const defaultAlerts = [
    {
        level: "HIGH",
        message: "5 quotes pending review - 2 overdue",
        action: "Review Now",
        icon: "alert",
        color: "text-red-500",
    },
    {
        level: "MEDIUM",
        message: "3 Quotation request - Contact customers required",
        action: "View Details",
        icon: "clock",
        color: "text-orange-500",
    },
];

const iconMap = {
    alert: FiAlertTriangle,
    clock: FiClock,
};

// alert.type comes from the admindesh API. QuotationHistory seeds its status
// filter from the ?status= param, so these land on a pre-filtered list.
const alertRoutes = {
    pending_review: "/quotation-requests?status=Pending",
    awaiting_customer: "/quotation-requests?status=Sent",
};

const FALLBACK_ROUTE = "/quotation-requests";

const ActiveAlerts = ({ data, onAlertsRead }) => {
    const router = useRouter();
    const { session } = useCurrentSession();
    const accessToken = session?.user?.accessToken;

    const [marking, setMarking] = useState(false);

    // Read-state lives server-side, per admin (DashboardAlertRead). The API has
    // already filtered out anything this admin marked read, so whatever arrives here
    // is unread by definition.
    const visibleAlerts = data?.active_alerts || defaultAlerts;
    const alertCount = data?.alert_count ?? visibleAlerts.length;

    const handleMarkAllRead = async () => {
        if (!accessToken || marking) return;

        try {
            setMarking(true);
            const res = await apiMarkDashboardAlertsRead(accessToken);
            if (res?.status) {
                // Refetch so the list reflects what the server now considers unread.
                await onAlertsRead?.();
            }
        } catch (error) {
            console.error("Failed to mark alerts as read:", error);
        } finally {
            setMarking(false);
        }
    };

    return (
        <div className="mt-10 px-5 md:px-8 lg:px-12 ">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-5">

                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <h3 className="text-[#1C2C56] font-semibold">
                            Active Alerts
                        </h3>
                        <span className="bg-[#E0E7FF] text-[#1C2C56] text-xs font-medium px-2 py-0.5 rounded-full">
                            {alertCount}
                        </span>
                    </div>

                    {alertCount > 0 && (
                        <button
                            type="button"
                            onClick={handleMarkAllRead}
                            disabled={marking}
                            className="text-sm text-[#1C2C56] hover:underline disabled:opacity-50"
                        >
                            {marking ? "Marking..." : "Mark All Read"}
                        </button>
                    )}
                </div>

                {/* Empty state — nothing pending, or everything marked read */}
                {alertCount === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                        <FiCheckCircle className="text-green-500" size={28} />
                        <p className="text-sm font-medium text-[#1C2C56]">
                            You&apos;re all caught up
                        </p>
                        <p className="text-xs text-[#64748B]">
                            New alerts will appear here as quotation activity comes in.
                        </p>
                    </div>
                )}

                {/* Alerts List */}
                <div className="space-y-4">
                    {visibleAlerts.map((alert, index) => {
                        const Icon = iconMap[alert.icon] || (alert.level === 'HIGH' ? FiAlertTriangle : FiClock);
                        const color = alert.color || (alert.level === 'HIGH' ? 'text-red-500' : 'text-orange-500');

                        return (
                            <div
                                key={index}
                                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-[#E2E8F0] rounded-lg p-4"
                            >
                                {/* LEFT CONTENT */}
                                <div className="flex items-start gap-3">
                                    <Icon className={`${color} mt-1`} size={18} />

                                    <div>
                                        <p className="text-sm font-semibold text-[#1C2C56]">
                                            {alert.level}
                                        </p>
                                        <p className="text-sm text-[#64748B]">
                                            {alert.message}
                                        </p>
                                    </div>
                                </div>

                                {/* ACTION BUTTON */}
                                <div className="flex md:justify-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.push(
                                                alertRoutes[alert.type] ||
                                                    FALLBACK_ROUTE,
                                            )
                                        }
                                        className="
      bg-[#1C2C56] text-white
      px-3 py-1.5 md:px-4 md:py-2
      rounded-md
      text-xs md:text-sm
      w-fit
      hover:opacity-90
    ">
                                        {alert.action}
                                    </button>
                                </div>
                            </div>

                        );
                    })}
                </div>
            </div>
        </div>

    );
};

export default ActiveAlerts;
