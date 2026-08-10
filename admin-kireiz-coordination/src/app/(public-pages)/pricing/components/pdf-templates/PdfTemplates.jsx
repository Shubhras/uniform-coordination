"use client";

import { useCallback, useEffect, useState } from "react";
import { FiDownload, FiSend, FiChevronDown, FiFileText } from "react-icons/fi";
import {
    IoCheckmarkCircle,
    IoTimeOutline,
    IoCloseCircle,
} from "react-icons/io5";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import Pagination from "@/components/ui/Pagination";
import {
    apiGetQuotationHistory,
    apiResendQuotation,
    apiExportQuotationPdf,
} from "@/services/QuotationHistoryService";

// Keys match QuotationRequest.STATUS_CHOICES on the backend.
const statusConfig = {
    approved: {
        label: "approved",
        icon: IoCheckmarkCircle,
        bg: "bg-[#1C2C56]",
        text: "text-white",
        dotColor: "bg-green-400",
    },
    accepted: {
        label: "accepted",
        icon: IoCheckmarkCircle,
        bg: "bg-[#1C2C56]",
        text: "text-white",
        dotColor: "bg-green-400",
    },
    pending: {
        label: "pending",
        icon: IoTimeOutline,
        bg: "bg-amber-100",
        text: "text-amber-700",
        dotColor: "bg-amber-400",
    },
    received: {
        label: "received",
        icon: IoTimeOutline,
        bg: "bg-amber-100",
        text: "text-amber-700",
        dotColor: "bg-amber-400",
    },
    sent: {
        label: "sent",
        icon: FiSend,
        bg: "bg-[#1C2C56]",
        text: "text-white",
        dotColor: "bg-blue-500",
    },
    cancelled: {
        label: "cancelled",
        icon: IoCloseCircle,
        bg: "bg-red-100",
        text: "text-red-600",
        dotColor: "bg-red-400",
    },
};

const fallbackStatus = {
    label: "unknown",
    icon: IoTimeOutline,
    bg: "bg-gray-100",
    text: "text-gray-600",
    dotColor: "bg-gray-400",
};

const PAGE_SIZE = 10;

// Symbol comes from SystemSettings via the API — never hardcoded.
const formatMoney = (value, symbol = "$") =>
    value === null || value === undefined
        ? "—"
        : `${symbol} ${Number(value).toLocaleString(undefined, {
              minimumFractionDigits: 2,
          })}`;

const notify = (title, type, message) =>
    toast.push(
        <Notification title={title} type={type}>
            {message}
        </Notification>,
    );

const PdfTemplates = () => {
    const { session } = useCurrentSession();
    const accessToken = session?.user?.accessToken;

    const [currencySymbol, setCurrencySymbol] = useState("$");
    const money = (value) => formatMoney(value, currencySymbol);

    const [quotations, setQuotations] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [busyId, setBusyId] = useState(null);

    const fetchHistory = useCallback(async () => {
        if (!accessToken) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await apiGetQuotationHistory(accessToken, {
                page: currentPage,
                pageSize: PAGE_SIZE,
            });
            if (res?.status) {
                const rows = res.data || [];
                setQuotations(rows);
                setTotalItems(res.count || 0);
                if (res.currency?.symbol) setCurrencySymbol(res.currency.symbol);
                // Keep the first row open like the original design did.
                setExpandedId((prev) => prev ?? rows[0]?.id ?? null);
            }
        } catch (error) {
            console.error("Failed to load quotation history:", error);
            notify("Error", "danger", "Could not load quotation history");
        } finally {
            setLoading(false);
        }
    }, [accessToken, currentPage]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleDownloadPdf = async (q) => {
        if (busyId) return;

        try {
            setBusyId(q.id);
            const res = await apiExportQuotationPdf(accessToken, q.quotation_id);
            if (res?.status && res.pdf_url) {
                window.open(res.pdf_url, "_blank", "noopener,noreferrer");
            } else {
                notify(
                    "Error",
                    "danger",
                    res?.message || "Could not generate the PDF",
                );
            }
        } catch (error) {
            console.error("Failed to export PDF:", error);
            notify("Error", "danger", "Could not generate the PDF");
        } finally {
            setBusyId(null);
        }
    };

    const handleResend = async (q) => {
        if (busyId) return;

        try {
            setBusyId(q.id);
            const res = await apiResendQuotation(accessToken, q.quotation_id);
            if (res?.status) {
                notify("Success", "success", res.message || "Quotation resent");
                await fetchHistory();
            } else {
                notify(
                    "Error",
                    "danger",
                    res?.message || "Could not resend the quotation",
                );
            }
        } catch (error) {
            console.error("Failed to resend quotation:", error);
            notify(
                "Error",
                "danger",
                error?.response?.data?.message ||
                    "Could not resend the quotation",
            );
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#1C2C56]">
                    Quotation History
                </h1>
                <p className="text-sm text-[#64748B] mt-1">
                    Track and manage sent proposals
                </p>
            </div>

            {/* Quotation History Card */}
            <div className="bg-white rounded-xl shadow p-5 md:p-6">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-[#0F172A]">
                            Quotation History
                        </h2>
                        <p className="text-sm text-[#64748B] mt-0.5">
                            {loading
                                ? "Loading proposals..."
                                : `${totalItems} total proposals`}
                        </p>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                            <span className="text-xs text-[#64748B]">
                                Approved
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            <span className="text-xs text-[#64748B]">
                                Pending
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            <span className="text-xs text-[#64748B]">Sent</span>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="space-y-3">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="border border-[#E2E8F0] rounded-xl p-4 animate-pulse"
                            >
                                <div className="h-4 w-48 bg-gray-200 rounded" />
                                <div className="h-3 w-24 bg-gray-100 rounded mt-2" />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && quotations.length === 0 && (
                    <div className="border border-dashed border-[#CBD5E1] rounded-xl py-12 text-center">
                        <p className="text-base font-medium text-[#1C2C56]">
                            No quotations yet
                        </p>
                        <p className="text-sm text-[#64748B] mt-1">
                            Customer quotation requests will appear here.
                        </p>
                    </div>
                )}

                {/* Timeline List */}
                {!loading && quotations.length > 0 && (
                    <div className="relative">
                        {quotations.map((q, idx) => {
                            const status =
                                statusConfig[q.status] || fallbackStatus;
                            const StatusIcon = status.icon;
                            const isExpanded = expandedId === q.id;
                            const isLast = idx === quotations.length - 1;
                            const isBusy = busyId === q.id;

                            return (
                                <div
                                    key={q.id}
                                    className="relative flex gap-4 md:gap-6"
                                >
                                    {/* Timeline line + dot — colour now reflects status */}
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-3 h-3 rounded-full ${status.dotColor} flex-shrink-0 mt-6`}
                                        />
                                        {!isLast && (
                                            <div className="w-px flex-1 bg-[#E2E8F0]" />
                                        )}
                                    </div>

                                    {/* Card */}
                                    <div
                                        className={`flex-1 mb-4 border rounded-xl transition-all ${
                                            isExpanded
                                                ? "border-[#1C2C56]/20 shadow-sm"
                                                : "border-[#E2E8F0]"
                                        }`}
                                    >
                                        {/* Main Row */}
                                        <div
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-[#FAFBFF] transition-colors rounded-xl"
                                            onClick={() => toggleExpand(q.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                                                    <FiFileText
                                                        size={18}
                                                        className="text-[#64748B]"
                                                    />
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-sm font-semibold text-[#0F172A]">
                                                            {q.company}
                                                        </h3>
                                                        <span className="text-xs text-[#94A3B8]">
                                                            {q.quote_number}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[#94A3B8] mt-0.5">
                                                        {q.date}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-[#0F172A]">
                                                        {money(q.amount)}
                                                    </p>
                                                    <p className="text-[10px] text-[#94A3B8]">
                                                        {q.items} Items
                                                    </p>
                                                </div>

                                                <span
                                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
                                                >
                                                    <StatusIcon size={13} />
                                                    {status.label}
                                                </span>

                                                <FiChevronDown
                                                    size={18}
                                                    className={`text-[#94A3B8] transition-transform duration-200 ${
                                                        isExpanded
                                                            ? "rotate-180"
                                                            : ""
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="border-t border-[#E2E8F0] p-4 md:p-5 bg-[#FAFBFF] rounded-b-xl">
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    <div className="flex-1 flex flex-col sm:flex-row gap-6 md:gap-10">
                                                        {/* Quote Details */}
                                                        <div>
                                                            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                                                                Quote Details
                                                            </p>
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1C2C56]" />
                                                                    <span className="text-xs text-[#64748B] w-20">
                                                                        Created:
                                                                    </span>
                                                                    <span className="text-xs text-[#0F172A] font-medium">
                                                                        {q.details
                                                                            .created ||
                                                                            "—"}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1C2C56]" />
                                                                    <span className="text-xs text-[#64748B] w-20">
                                                                        Valid
                                                                        Until:
                                                                    </span>
                                                                    <span className="text-xs text-[#0F172A] font-medium">
                                                                        {q.details
                                                                            .valid_until ||
                                                                            "—"}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1C2C56]" />
                                                                    <span className="text-xs text-[#64748B] w-20">
                                                                        Sales
                                                                        Rep:
                                                                    </span>
                                                                    <span className="text-xs text-[#0F172A] font-medium">
                                                                        {q.details
                                                                            .sales_rep ||
                                                                            "Unassigned"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Summary */}
                                                        <div>
                                                            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                                                                Summary
                                                            </p>
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1C2C56]" />
                                                                    <span className="text-xs text-[#64748B] w-28">
                                                                        Subtotal:
                                                                    </span>
                                                                    <span className="text-xs text-[#0F172A] font-medium">
                                                                        {money(
                                                                            q
                                                                                .details
                                                                                .subtotal,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                {!!q.details
                                                                    .discount_amount && (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#1C2C56]" />
                                                                        <span className="text-xs text-red-500 w-28">
                                                                            Discount
                                                                            (
                                                                            {
                                                                                q
                                                                                    .details
                                                                                    .discount_percent
                                                                            }
                                                                            %):
                                                                        </span>
                                                                        <span className="text-xs text-red-500 font-medium">
                                                                            -
                                                                            {money(
                                                                                Math.abs(
                                                                                    q
                                                                                        .details
                                                                                        .discount_amount,
                                                                                ),
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1C2C56]" />
                                                                    <span className="text-xs text-[#64748B] font-semibold w-28">
                                                                        Total:
                                                                    </span>
                                                                    <span className="text-xs text-[#0F172A] font-bold">
                                                                        {money(
                                                                            q
                                                                                .details
                                                                                .total,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-col gap-2 sm:min-w-[160px]">
                                                        <button
                                                            type="button"
                                                            disabled={isBusy}
                                                            onClick={() =>
                                                                handleDownloadPdf(
                                                                    q,
                                                                )
                                                            }
                                                            className="flex items-center justify-center gap-2 border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm text-[#0F172A] hover:bg-[#F1F5F9] transition-colors disabled:opacity-50"
                                                        >
                                                            <FiDownload
                                                                size={15}
                                                            />
                                                            {isBusy
                                                                ? "Working..."
                                                                : "Download PDF"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={isBusy}
                                                            onClick={() =>
                                                                handleResend(q)
                                                            }
                                                            className="flex items-center justify-center gap-2 bg-[#1C2C56] text-white rounded-lg px-4 py-2 text-sm hover:bg-[#142040] transition-colors disabled:opacity-50"
                                                        >
                                                            <FiSend size={14} />
                                                            {isBusy
                                                                ? "Sending..."
                                                                : "Resend Quote"}
                                                        </button>
                                                        {q.last_sent_at && (
                                                            <p className="text-[10px] text-[#94A3B8] text-center">
                                                                Last sent:{" "}
                                                                {new Date(
                                                                    q.last_sent_at,
                                                                ).toLocaleString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && totalItems > PAGE_SIZE && (
                    <div className="flex justify-end mt-4">
                        <Pagination
                            currentPage={currentPage}
                            total={totalItems}
                            pageSize={PAGE_SIZE}
                            onChange={(page) => {
                                setCurrentPage(page);
                                setExpandedId(null);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfTemplates;
