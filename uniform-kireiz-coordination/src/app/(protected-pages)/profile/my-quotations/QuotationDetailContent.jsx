'use client'

import React from 'react'
import Spinner from '@/components/ui/Spinner'
import {
    FiArrowLeft,
    FiDownload,
    FiEye,
    FiFileText,
    FiCheck,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiSend,
    FiInbox,
    FiUser,
    FiUserCheck,
    FiMail,
    FiPhone,
    FiPaperclip,
    FiCalendar,
    FiDollarSign,
    FiCopy,
} from 'react-icons/fi'
import { formatDate } from '@/utils/dateFormater'
import ComposeEmailModal from '@/components/shared/ComposeEmailModal'

const statusStyles = {
    approved: {
        text: '#34C759',
        bg: '#1C4FA80F',
        label: 'Approved',
    },
    cancelled: {
        text: '#C10007',
        bg: '#1C4FA80F',
        label: 'Cancelled',
    },
    declined: {
        text: '#C10007',
        bg: '#1C4FA80F',
        label: 'Declined',
    },
    pending: {
        text: '#4580ED',
        bg: '#1C4FA80F',
        label: 'Pending',
    },
    submitted: {
        text: '#4580ED',
        bg: '#1C4FA80F',
        label: 'Submitted',
    },
    received: {
        text: '#FF8D28',
        bg: '#1C4FA80F',
        label: 'Received',
    },
}

const StatusBadge = ({ statusKey, statusLabel }) => {
    const style = statusStyles[statusKey] || statusStyles.pending

    return (
        <span
            className="inline-flex items-center rounded-md px-3 py-1.5 text-[12px] font-medium"
            style={{
                color: style.text,
                backgroundColor: style.bg,
            }}
        >
            {statusLabel}
        </span>
    )
}

/**
 * Status Progression Stepper Component (FU-034)
 * Visualizes the 4-stage pipeline: Received > Quoting > Submitted > Agreed / Declined
 */
const StatusProgressionStepper = ({ quotation }) => {
    const statusKey = quotation?.statusKey || 'pending'
    const workflowStatus = String(quotation?.workflowStatus || '').toUpperCase()

    // Determine current pipeline stage
    const isDeclined = statusKey === 'declined' || statusKey === 'cancelled'
    const isAgreed =
        ['approved', 'agreed', 'accepted'].includes(statusKey) ||
        ['AGREED', 'SIGNED', 'COMPLETED'].includes(workflowStatus)

    let currentStageIndex = 0 // 0: Received, 1: Quoting, 2: Submitted, 3: Agreed/Declined

    if (isDeclined || isAgreed) {
        currentStageIndex = 3
    } else if (
        ['submitted', 'sent'].includes(statusKey) ||
        workflowStatus === 'SENT' ||
        Boolean(quotation?.total && quotation?.total !== '0.00')
    ) {
        currentStageIndex = 2
    } else if (['quoting', 'under_review'].includes(statusKey)) {
        currentStageIndex = 1
    } else {
        // Freshly received or pending request: Received is completed (0), currently Quoting (1)
        currentStageIndex = 1
    }

    const stages = [
        {
            key: 'received',
            label: 'Received',
            description: 'Request submitted',
            icon: FiInbox,
        },
        {
            key: 'quoting',
            label: 'Quoting',
            description: 'Preparing proposal',
            icon: FiClock,
        },
        {
            key: 'submitted',
            label: 'Submitted',
            description: 'Proposal ready',
            icon: FiSend,
        },
        {
            key: 'agreed',
            label: isDeclined ? 'Declined' : 'Agreed',
            description: isDeclined ? 'Request declined' : 'Contract finalized',
            icon: isDeclined ? FiXCircle : FiCheckCircle,
        },
    ]

    return (
        <section className="rounded-2xl border border-[#EDF2F7] bg-white p-4 md:p-6 shadow-xs">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-[#003560] animate-pulse"></span>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#003560]">
                        Quotation Workflow Progression
                    </h3>
                </div>
                <div className="text-xs text-[#64748B]">
                    Current Stage:{' '}
                    <span className="font-semibold text-[#003560]">
                        {stages[currentStageIndex]?.label}
                    </span>
                </div>
            </div>

            {/* Stepper Grid / Timeline */}
            <div className="relative">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {stages.map((stage, idx) => {
                        const Icon = stage.icon
                        const isPast = idx < currentStageIndex
                        const isCurrent = idx === currentStageIndex
                        const isUpcoming = idx > currentStageIndex

                        let badgeBg = 'bg-[#F1F5F9] text-[#94A3B8] border-[#E2E8F0]'
                        let lineBg = 'bg-[#E2E8F0]'
                        let textColor = 'text-[#64748B]'

                        if (isPast) {
                            badgeBg = 'bg-[#003560] text-white border-[#003560]'
                            lineBg = 'bg-[#003560]'
                            textColor = 'text-[#003560]'
                        } else if (isCurrent) {
                            if (isDeclined) {
                                badgeBg = 'bg-[#EF4444] text-white border-[#DC2626] ring-4 ring-[#FEE2E2]'
                                textColor = 'text-[#DC2626]'
                            } else if (isAgreed) {
                                badgeBg = 'bg-[#10B981] text-white border-[#059669] ring-4 ring-[#D1FAE5]'
                                textColor = 'text-[#059669]'
                            } else {
                                badgeBg = 'bg-[#003560] text-white border-[#003560] ring-4 ring-[#E0F2FE]'
                                textColor = 'text-[#003560]'
                            }
                        }

                        return (
                            <div key={stage.key} className="relative flex flex-col items-center text-center">
                                {/* Connecting line for tablet & desktop */}
                                {idx < stages.length - 1 && (
                                    <div
                                        className={`hidden sm:block absolute top-5 left-[50%] w-full h-[3px] -z-0 transition-colors ${
                                            idx < currentStageIndex ? 'bg-[#003560]' : 'bg-[#E2E8F0]'
                                        }`}
                                    />
                                )}

                                {/* Step Circle Indicator */}
                                <div
                                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${badgeBg}`}
                                >
                                    {isPast ? (
                                        <FiCheck size={18} strokeWidth={3} />
                                    ) : (
                                        <Icon size={18} />
                                    )}
                                </div>

                                {/* Step Label & Subtitle */}
                                <div className="mt-3">
                                    <p className={`text-xs font-semibold ${textColor}`}>
                                        {stage.label}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-[#64748B]">
                                        {stage.description}
                                    </p>
                                </div>

                                {/* Current Status Tag */}
                                {isCurrent && (
                                    <span
                                        className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                            isDeclined
                                                ? 'bg-[#FEF2F2] text-[#B91C1C]'
                                                : isAgreed
                                                ? 'bg-[#ECFDF5] text-[#047857]'
                                                : 'bg-[#EFF6FF] text-[#1D4ED8]'
                                        }`}
                                    >
                                        Active
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

/**
 * Assigned Sales Representative Card (FU-033)
 * Displays sales representative contact card or pending assignment state.
 */
const copyToClipboardFallback = (text) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text)
    }

    // Robust fallback for non-secure HTTP contexts
    return new Promise((resolve, reject) => {
        try {
            const textArea = document.createElement('textarea')
            textArea.value = text
            textArea.style.position = 'fixed'
            textArea.style.left = '-999999px'
            textArea.style.top = '-999999px'
            textArea.setAttribute('readonly', '')
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            const successful = document.execCommand('copy')
            document.body.removeChild(textArea)
            if (successful) {
                resolve()
            } else {
                reject(new Error('execCommand returned false'))
            }
        } catch (err) {
            reject(err)
        }
    })
}

const SalesRepresentativeCard = ({ salesRep, quotationId }) => {
    const [copied, setCopied] = React.useState(false)
    const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false)

    const getInitials = (name) => {
        if (!name) return 'SR'
        const parts = name.trim().split(/\s+/)
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }

    const targetEmail = salesRep?.email || 'support@kireiz.jp'
    const targetName = salesRep?.name || 'Support Team'

    const handleCopySupportEmail = () => {
        copyToClipboardFallback(targetEmail)
            .then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2500)
            })
            .catch((err) => {
                console.error('Failed to copy email:', err)
            })
    }

    return (
        <section className="rounded-2xl border border-[#EDF2F7] bg-white p-4 md:p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between border-b border-[#EDF2F7] pb-3">
                <div className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[0.03em] text-[#003560]">
                    <FiUserCheck className="text-[#003560]" size={16} />
                    Assigned Sales Representative
                </div>
                {salesRep ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-xs font-medium text-[#059669]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]"></span>
                        Primary Representative
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFBEB] px-2.5 py-1 text-xs font-medium text-[#D97706]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]"></span>
                        Assignment Pending
                    </span>
                )}
            </div>

            {salesRep ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF] text-[#003560] font-bold text-base border border-[#DCE7F8]">
                            {getInitials(salesRep.name)}
                        </div>
                        <div>
                            <h4 className="text-base font-semibold text-[#111827]">
                                {salesRep.name || 'Assigned Representative'}
                            </h4>
                            <p className="text-xs text-[#6B7280]">
                                {salesRep.designation || 'B2B Corporate Account Specialist'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {salesRep.email && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsEmailModalOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-xs font-medium text-[#374151] hover:border-[#003560] hover:text-[#003560] transition-colors"
                                    title="Send In-App Email"
                                >
                                    <FiMail size={14} className="text-[#003560]" />
                                    <span>{salesRep.email}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCopySupportEmail}
                                    title="Copy email to clipboard"
                                    className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-2 text-xs font-medium text-[#475569] hover:bg-[#F1F5F9] hover:text-[#003560] transition-colors"
                                >
                                    {copied ? (
                                        <>
                                            <FiCheck size={13} className="text-emerald-600" />
                                            <span className="text-emerald-600 font-semibold">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiCopy size={13} />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </>
                        )}

                        {salesRep.phone && (
                            <a
                                href={`tel:${salesRep.phone}`}
                                className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-xs font-medium text-[#374151] hover:border-[#003560] hover:text-[#003560] transition-colors"
                                title="Call Representative"
                            >
                                <FiPhone size={14} className="text-[#003560]" />
                                <span>{salesRep.phone}</span>
                            </a>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl bg-[#F8FAFC] p-4 text-xs text-[#64748B]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E2E8F0] text-[#64748B]">
                            <FiUser size={16} />
                        </div>
                        <div>
                            <p className="font-semibold text-[#334155]">
                                Sales Representative Assignment in Progress
                            </p>
                            <p className="mt-0.5 text-[11px] text-[#64748B]">
                                A dedicated corporate sales executive is being assigned to review your quotation requirements.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsEmailModalOpen(true)}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-medium text-[#003560] hover:bg-[#F1F5F9] transition-colors"
                        >
                            <FiMail size={13} />
                            Contact Support
                        </button>
                        <button
                            type="button"
                            onClick={handleCopySupportEmail}
                            title="Copy support email address to clipboard"
                            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-medium text-[#475569] hover:bg-[#F1F5F9] hover:text-[#003560] transition-colors"
                        >
                            {copied ? (
                                <>
                                    <FiCheck size={13} className="text-emerald-600" />
                                    <span className="text-emerald-600 font-semibold">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <FiCopy size={13} />
                                    <span>Copy Email</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            <ComposeEmailModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                recipientEmail={targetEmail}
                recipientName={targetName}
                initialSubject={quotationId ? `Inquiry regarding Quotation #${quotationId}` : 'Support Request'}
            />
        </section>
    )
}

/**
 * Attached Documents Section (FU-032)
 * Lists all quotation attachments with View and Download buttons.
 */
const AttachmentsSection = ({
    attachments = [],
    onDownload,
    onView,
    downloadLoading,
}) => {
    return (
        <section className="rounded-2xl border border-[#EDF2F7] bg-white p-4 md:p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between border-b border-[#EDF2F7] pb-3">
                <div className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[0.03em] text-[#003560]">
                    <FiPaperclip className="text-[#003560]" size={16} />
                    Attached Documents & Quotation Files
                </div>
                <span className="rounded-full bg-[#EEF4FF] px-2.5 py-0.5 text-xs font-medium text-[#003560]">
                    {attachments.length} {attachments.length === 1 ? 'Document' : 'Documents'}
                </span>
            </div>

            <div className="space-y-3">
                {attachments.map((doc, idx) => (
                    <div
                        key={doc.id || `doc-${idx}`}
                        className="flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-[#FBFDFF] p-3.5 transition-all hover:border-[#CBD5E1] hover:shadow-xs sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                                <FiFileText size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold text-[#111827]">
                                        {doc.title || doc.name || 'Quotation Document'}
                                    </h4>
                                    <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-medium uppercase text-[#475569]">
                                        {doc.category || 'PDF'}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-xs text-[#6B7280]">
                                    {doc.name || `Document_${idx + 1}.pdf`}
                                    {doc.created_at ? ` • Updated ${formatDate(doc.created_at)}` : ''}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                                type="button"
                                onClick={() =>
                                    onView
                                        ? onView(doc)
                                        : doc.file_url
                                        ? window.open(doc.file_url, '_blank')
                                        : onDownload(doc)
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827] transition-colors"
                            >
                                <FiEye size={14} className="text-[#4B5563]" />
                                <span>View</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => onDownload(doc)}
                                disabled={downloadLoading}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#003560] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#002747] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {downloadLoading ? <Spinner size={13} /> : <FiDownload size={13} />}
                                <span>Download</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

const QuotationDetailContent = ({
    quotation,
    onBack,
    onDownload,
    onView,
    downloadLoading,
}) => {
    return (
        <div className="w-full space-y-5 rounded-2xl bg-white">
            {/* Top Navigation Bar & Status Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6] transition-colors"
                        title="Back to Quotations"
                    >
                        <FiArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-[20px] font-semibold text-[#111827]">
                            Quotation Details
                        </h2>
                        <p className="text-xs text-[#6B7280]">
                            Request Ref: {quotation.requestId}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <StatusBadge
                        statusKey={quotation.statusKey}
                        statusLabel={quotation.statusLabel}
                    />
                </div>
            </div>

            {/* Feature 1: Status Progression Stepper (FU-034) */}
            <StatusProgressionStepper quotation={quotation} />

            {/* Feature 2: Assigned Sales Representative (FU-033) */}
            <SalesRepresentativeCard
                salesRep={quotation.salesRep}
                quotationId={quotation.requestId || quotation.quotationId}
            />

            {/* Feature 3: Attached Documents Section (FU-032) */}
            <AttachmentsSection
                attachments={quotation.attachments || []}
                onDownload={onDownload}
                onView={onView}
                downloadLoading={downloadLoading}
            />

            {/* General Information Sections */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* Company Information */}
                <section className="rounded-2xl border border-[#EDF2F7] bg-white p-4 md:p-5 shadow-xs">
                    <div className="mb-4 flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[0.03em] text-[#003560] border-b border-[#EDF2F7] pb-3">
                        <FiFileText size={15} />
                        Company & Contact Details
                    </div>

                    <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                        <div>
                            <p className="text-[11px] uppercase tracking-wide text-[#64748B]">Company Name</p>
                            <p className="mt-1 text-sm font-semibold text-[#111827]">{quotation.companyName}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-wide text-[#64748B]">Contact Person</p>
                            <p className="mt-1 text-sm font-semibold text-[#111827]">{quotation.contactPerson}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-wide text-[#64748B]">Email Address</p>
                            <p className="mt-1 text-sm font-semibold text-[#111827]">{quotation.email}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-wide text-[#64748B]">Phone Number</p>
                            <p className="mt-1 text-sm font-semibold text-[#111827]">{quotation.phoneNumber}</p>
                        </div>
                    </div>
                </section>

                {/* Quotation Information & Pricing */}
                <section className="rounded-2xl border border-[#EDF2F7] bg-white p-4 md:p-5 shadow-xs">
                    <div className="mb-4 flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[0.03em] text-[#003560] border-b border-[#EDF2F7] pb-3">
                        <FiCalendar size={15} />
                        Quotation Parameters
                    </div>

                    <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                        <div>
                            <p className="text-[11px] uppercase tracking-wide text-[#64748B]">Quotation ID</p>
                            <p className="mt-1 text-sm font-semibold text-[#111827]">{quotation.requestId}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-wide text-[#64748B]">Requested Date</p>
                            <p className="mt-1 text-sm font-semibold text-[#111827]">
                                {formatDate(quotation.requestedDate)}
                            </p>
                        </div>
                        {quotation.validUntil ? (
                            <div>
                                <p className="text-[11px] uppercase tracking-wide text-[#64748B]">Valid Until</p>
                                <p className="mt-1 text-sm font-semibold text-[#111827]">
                                    {formatDate(quotation.validUntil)}
                                </p>
                            </div>
                        ) : null}
                        {quotation.total ? (
                            <div>
                                <p className="text-[11px] uppercase tracking-wide text-[#64748B]">Quoted Total</p>
                                <p className="mt-1 text-sm font-bold text-[#003560]">
                                    ${Number(quotation.total).toLocaleString()}
                                </p>
                            </div>
                        ) : null}
                    </div>
                </section>
            </div>

            {/* Requested Items Table */}
            <section className="overflow-hidden rounded-2xl border border-[#EDF2F7] bg-white shadow-xs">
                <div className="flex items-center justify-between border-b border-[#EDF2F7] px-4 py-4 md:px-5">
                    <h3 className="text-[16px] font-semibold text-[#111827]">Requested Items & Sizing</h3>
                    {quotation.attachments?.length > 0 && (
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#003560] hover:underline disabled:opacity-70"
                            onClick={() => onDownload(quotation.attachments[0])}
                            disabled={downloadLoading}
                        >
                            {downloadLoading ? <Spinner size={15} /> : <FiDownload size={15} />}
                            <span>Download Quotation PDF</span>
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-[#FBFDFF]">
                            <tr className="border-b border-[#E9EEF5]">
                                <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.03em] text-[#003560]">
                                    Uniform / Item Name
                                </th>
                                <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.03em] text-[#003560]">
                                    Category
                                </th>
                                <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.03em] text-[#003560]">
                                    Quantity / Sizing
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotation.items.map((item) => (
                                <tr key={item.id} className="border-b border-[#EEF2F7] last:border-b-0">
                                    <td className="px-4 py-4 text-sm font-medium text-[#111827]">
                                        {item.uniform_name}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="inline-flex rounded-full bg-[#EEF4FF] px-2.5 py-1 text-[11px] font-medium text-[#003560]">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-[#4B5563]">{item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}

export default QuotationDetailContent
