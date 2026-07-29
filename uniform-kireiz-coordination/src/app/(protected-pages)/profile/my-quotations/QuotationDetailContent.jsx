'use client'

import Spinner from '@/components/ui/Spinner'
import { FiArrowLeft, FiDownload, FiFileText } from 'react-icons/fi'
import { formatDate } from '@/utils/dateFormater'

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
            className="inline-flex rounded-md px-2.5 py-1 text-[11px] font-medium"
            style={{
                color: style.text,
                backgroundColor: style.bg,
            }}
        >
            {statusLabel}
        </span>
    )
}

const QuotationDetailContent = ({
    quotation,
    onBack,
    onDownload,
    downloadLoading,
}) => {
    const showDownload =
        ['approved', 'received'].includes(quotation.statusKey) &&
        Boolean(quotation.quotationId || quotation.downloadUrl || quotation.pdfUrl)

    return (
        <div className="w-full rounded-2xl bg-white">
            <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[#4B5563]"
                    >
                        <FiArrowLeft size={16} />
                    </button>
                    <h2 className="text-base font-semibold text-[#111827]">My Quotations</h2>
                </div>
                <StatusBadge statusKey={quotation.statusKey} statusLabel={quotation.statusLabel} />
            </div>

            <div className="space-y-4">
                <section className="rounded-2xl border border-[#EDF2F7] bg-white p-4 md:p-5">
                    <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.03em] text-[#003560]">
                        <FiFileText size={12} />
                        Company Information
                    </div>

                    <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-[#94A3B8]">Company Name</p>
                            <p className="mt-1 text-sm font-medium text-[#111827]">{quotation.companyName}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-[#94A3B8]">Contact Person</p>
                            <p className="mt-1 text-sm font-medium text-[#111827]">{quotation.contactPerson}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-[#94A3B8]">Email</p>
                            <p className="mt-1 text-sm font-medium text-[#111827]">{quotation.email}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-[#94A3B8]">Phone Number</p>
                            <p className="mt-1 text-sm font-medium text-[#111827]">{quotation.phoneNumber}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-[#94A3B8]">Tier</p>
                            <p className="mt-1 text-sm font-medium text-[#111827]">{quotation.tier}</p>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-[#EDF2F7] bg-white p-4 md:p-5">
                    <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.03em] text-[#003560]">
                        <FiFileText size={12} />
                        Quotation Information
                    </div>

                    <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-[#94A3B8]">Request ID</p>
                            <p className="mt-1 text-sm font-medium text-[#111827]">{quotation.requestId}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-[#94A3B8]">Requested Date</p>
                            <p className="mt-1 text-sm font-medium text-[#111827]">{formatDate(quotation.requestedDate)}</p>
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-[#EDF2F7] bg-white">
                    <div className="flex items-center justify-between border-b border-[#EDF2F7] px-4 py-4 md:px-5">
                        <h3 className="text-base font-semibold text-[#111827]">Requested Items</h3>
                        {showDownload ? (
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 text-sm font-medium text-[#2B436F] disabled:cursor-not-allowed disabled:opacity-70"
                                onClick={onDownload}
                                disabled={downloadLoading}
                            >
                                {downloadLoading ? <Spinner size={16} /> : <FiDownload size={16} />}
                                <span>{downloadLoading ? 'Downloading...' : 'Download PDF'}</span>
                            </button>
                        ) : null}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-[#FBFDFF]">
                                <tr className="border-b border-[#E9EEF5]">
                                    <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.03em] text-[#003560]">
                                        Uniform Name
                                    </th>
                                    <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.03em] text-[#003560]">
                                        Category
                                    </th>
                                    <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.03em] text-[#003560]">
                                        Quantity
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotation.items.map((item) => (
                                    <tr key={item.id} className="border-b border-[#EEF2F7] last:border-b-0">
                                        <td className="px-4 py-4 text-sm font-medium text-[#111827]">{item.uniform_name}</td>
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
        </div>
    )
}

export default QuotationDetailContent
