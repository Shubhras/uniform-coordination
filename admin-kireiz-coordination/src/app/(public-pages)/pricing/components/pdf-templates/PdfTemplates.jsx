"use client";

import { useState } from "react";
import { FiDownload, FiSend, FiChevronDown, FiFileText } from "react-icons/fi";
import { IoCheckmarkCircle, IoTimeOutline, IoCloseCircle } from "react-icons/io5";

const quotations = [
    {
        id: 1,
        company: "Fashion Forward Ltd.",
        quoteNumber: "#Q-2024-089",
        date: "2024-03-15",
        amount: 4520.00,
        items: 12,
        status: "approved",
        details: {
            created: "2024-03-15",
            validUntil: "2024-04-15",
            salesRep: "Alex M.",
            subtotal: 4972.00,
            discountPercent: 10,
            discountAmount: -452.00,
            total: 4520.00,
        },
    },
    {
        id: 2,
        company: "Textile Innovations",
        quoteNumber: "#Q-2024-088",
        date: "2024-03-14",
        amount: 1250.50,
        items: 4,
        status: "sent",
        details: {
            created: "2024-03-14",
            validUntil: "2024-04-14",
            salesRep: "Sarah K.",
            subtotal: 1250.50,
            discountPercent: 0,
            discountAmount: 0,
            total: 1250.50,
        },
    },
    {
        id: 3,
        company: "Global Garments Inc.",
        quoteNumber: "#Q-2024-087",
        date: "2024-03-12",
        amount: 8900.00,
        items: 25,
        status: "pending",
        details: {
            created: "2024-03-12",
            validUntil: "2024-04-12",
            salesRep: "Mike R.",
            subtotal: 9500.00,
            discountPercent: 6.3,
            discountAmount: -600.00,
            total: 8900.00,
        },
    },
    {
        id: 4,
        company: "Boutique Parisienne",
        quoteNumber: "#Q-2024-086",
        date: "2024-03-10",
        amount: 3200.00,
        items: 8,
        status: "rejected",
        details: {
            created: "2024-03-10",
            validUntil: "2024-04-10",
            salesRep: "Emily W.",
            subtotal: 3200.00,
            discountPercent: 0,
            discountAmount: 0,
            total: 3200.00,
        },
    },
    {
        id: 5,
        company: "Urban Outfitters Co.",
        quoteNumber: "#Q-2024-085",
        date: "2024-03-08",
        amount: 5600.75,
        items: 15,
        status: "approved",
        details: {
            created: "2024-03-08",
            validUntil: "2024-04-08",
            salesRep: "David L.",
            subtotal: 6200.00,
            discountPercent: 9.7,
            discountAmount: -599.25,
            total: 5600.75,
        },
    },
];

const statusConfig = {
    approved: {
        label: "approved",
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
    sent: {
        label: "sent",
        icon: FiSend,
        bg: "bg-[#1C2C56]",
        text: "text-white",
        dotColor: "bg-blue-500",
    },
    rejected: {
        label: "rejected",
        icon: IoCloseCircle,
        bg: "bg-red-100",
        text: "text-red-600",
        dotColor: "bg-red-400",
    },
};

const timelineDotColors = ["border-blue-500", "border-green-500", "border-amber-400", "border-red-400", "border-teal-400"];

const PdfTemplates = () => {
    const [expandedId, setExpandedId] = useState(1);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#1C2C56]">PDF Templates</h1>
                <p className="text-sm text-[#64748B] mt-1">
                    Manage discount tiers and corporate rules
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
                            Track and manage sent proposals
                        </p>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                            <span className="text-xs text-[#64748B]">Approved</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            <span className="text-xs text-[#64748B]">Pending</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            <span className="text-xs text-[#64748B]">Sent</span>
                        </div>
                    </div>
                </div>

                {/* Timeline List */}
                <div className="relative">
                    {quotations.map((q, idx) => {
                        const status = statusConfig[q.status];
                        const StatusIcon = status.icon;
                        const isExpanded = expandedId === q.id;
                        const isLast = idx === quotations.length - 1;
                        const dotColor = timelineDotColors[idx % timelineDotColors.length];

                        return (
                            <div key={q.id} className="relative flex gap-4 md:gap-6">

                                {/* Timeline line + dot */}
                                <div className="flex flex-col items-center">
                                    <div className={`w-3 h-3 rounded-full border-2 ${dotColor} bg-white flex-shrink-0 mt-6`} />
                                    {!isLast && (
                                        <div className="w-px flex-1 bg-[#E2E8F0]" />
                                    )}
                                </div>

                                {/* Card */}
                                <div className={`flex-1 mb-4 border rounded-xl transition-all ${isExpanded ? 'border-[#1C2C56]/20 shadow-sm' : 'border-[#E2E8F0]'}`}>

                                    {/* Main Row */}
                                    <div
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-[#FAFBFF] transition-colors rounded-xl"
                                        onClick={() => toggleExpand(q.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* File icon */}
                                            <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                                                <FiFileText size={18} className="text-[#64748B]" />
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-sm font-semibold text-[#0F172A]">
                                                        {q.company}
                                                    </h3>
                                                    <span className="text-xs text-[#94A3B8]">
                                                        {q.quoteNumber}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[#94A3B8] mt-0.5">
                                                    {q.date}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 sm:gap-4">
                                            {/* Amount */}
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-[#0F172A]">
                                                    $ {q.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                                <p className="text-[10px] text-[#94A3B8]">
                                                    {q.items} Items
                                                </p>
                                            </div>

                                            {/* Status Badge */}
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                                                <StatusIcon size={13} />
                                                {status.label}
                                            </span>

                                            {/* Chevron */}
                                            <FiChevronDown
                                                size={18}
                                                className={`text-[#94A3B8] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="border-t border-[#E2E8F0] p-4 md:p-5 bg-[#FAFBFF] rounded-b-xl">
                                            <div className="flex flex-col md:flex-row gap-6">

                                                {/* Quote Details + Summary */}
                                                <div className="flex-1 flex flex-col sm:flex-row gap-6 md:gap-10">

                                                    {/* Quote Details */}
                                                    <div>
                                                        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                                                            Quote Details
                                                        </p>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#1C2C56]" />
                                                                <span className="text-xs text-[#64748B] w-16">Created:</span>
                                                                <span className="text-xs text-[#0F172A] font-medium">{q.details.created}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#1C2C56]" />
                                                                <span className="text-xs text-[#64748B] w-16">Valid Until:</span>
                                                                <span className="text-xs text-[#0F172A] font-medium">{q.details.validUntil}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#1C2C56]" />
                                                                <span className="text-xs text-[#64748B] w-16">Sales Rep:</span>
                                                                <span className="text-xs text-[#0F172A] font-medium">{q.details.salesRep}</span>
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
                                                                <span className="text-xs text-[#64748B] w-28">Subtotal:</span>
                                                                <span className="text-xs text-[#0F172A] font-medium">
                                                                    $ {q.details.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                            {q.details.discountAmount !== 0 && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1C2C56]" />
                                                                    <span className="text-xs text-red-500 w-28">
                                                                        Discount ({q.details.discountPercent}%):
                                                                    </span>
                                                                    <span className="text-xs text-red-500 font-medium">
                                                                        -$ {Math.abs(q.details.discountAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#1C2C56]" />
                                                                <span className="text-xs text-[#64748B] font-semibold w-28">Total:</span>
                                                                <span className="text-xs text-[#0F172A] font-bold">
                                                                    $ {q.details.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex flex-col gap-2 sm:min-w-[160px]">
                                                    <button className="flex items-center justify-center gap-2 border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm text-[#0F172A] hover:bg-[#F1F5F9] transition-colors">
                                                        <FiDownload size={15} />
                                                        Download PDF
                                                    </button>
                                                    <button className="flex items-center justify-center gap-2 bg-[#1C2C56] text-white rounded-lg px-4 py-2 text-sm hover:bg-[#142040] transition-colors">
                                                        <FiSend size={14} />
                                                        Resend Quote
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PdfTemplates;
