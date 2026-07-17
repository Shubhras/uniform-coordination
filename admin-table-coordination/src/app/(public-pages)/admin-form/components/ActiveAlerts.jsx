"use client";

import { FiAlertTriangle, FiClock } from "react-icons/fi";

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

const ActiveAlerts = ({ data }) => {
    const alerts = data?.active_alerts || defaultAlerts;
    const alertCount = data?.alert_count ?? alerts.length;

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

                    <button className="text-sm text-[#1C2C56] hover:underline">
                        Mark All Read
                    </button>
                </div>

                {/* Alerts List */}
                <div className="space-y-4">
                    {alerts.map((alert, index) => {
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
                                    <button className="
      bg-[#1C2C56] text-white
      px-3 py-1.5 md:px-4 md:py-2
      rounded-md
      text-xs md:text-sm
      w-fit
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
