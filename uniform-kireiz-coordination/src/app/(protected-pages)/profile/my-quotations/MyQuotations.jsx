'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useSession } from 'next-auth/react'
import { FiArrowLeft, FiDownload, FiEye, FiFileText, FiSearch } from 'react-icons/fi'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { apiGetQuotation } from '@/services/AuthProfileService'
import { formatDate } from '@/utils/dateFormater'

const ITEMS_PER_PAGE = 6

const statusStyles = {
    accepted: {
        text: '#34C759',
        bg: '#1C4FA80F',
        label: 'Accepted',
    },
    declined: {
        text: '#C10007',
        bg: '#1C4FA80F',
        label: 'Declined',
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

const displayStatuses = [
    'accepted',
    'declined',
    'accepted',
    'declined',
    'accepted',
    'declined',
    'accepted',
    'submitted',
    'received',
    'declined',
]

const fallbackItems = Array.from({ length: 6 }, (_, index) => ({
    id: `item-${index + 1}`,
    uniform_name: 'Medical Scrub Set',
    category: 'Medical',
    quantity: 150,
}))

const getNormalizedStatus = (quotation, index) => {
    const rawStatus = String(
        quotation?.status ||
        quotation?.quotation_status ||
        quotation?.request_status ||
        displayStatuses[index % displayStatuses.length],
    ).toLowerCase()

    if (rawStatus.includes('accept')) return 'accepted'
    if (rawStatus.includes('declin') || rawStatus.includes('reject')) return 'declined'
    if (rawStatus.includes('submit')) return 'submitted'
    if (rawStatus.includes('receiv') || rawStatus.includes('review')) return 'received'

    return displayStatuses[index % displayStatuses.length]
}

const getPdfUrl = (quotation) =>
    quotation?.pdf_url ||
    quotation?.pdf ||
    quotation?.quotation_pdf ||
    quotation?.quotationPdf ||
    quotation?.export_pdf_url ||
    ''

const getRequestedItems = (quotation) => {
    const source =
        quotation?.requested_items ||
        quotation?.items ||
        quotation?.products ||
        quotation?.line_items

    if (Array.isArray(source) && source.length) {
        return source.map((item, index) => ({
            id: item?.id || `item-${index}`,
            uniform_name: item?.uniform_name || item?.name || item?.product_name || 'Medical Scrub Set',
            category: item?.category || item?.item_type || 'Medical',
            quantity: item?.quantity || item?.qty || 150,
        }))
    }

    return fallbackItems
}

const normalizeQuotation = (quotation, index) => {
    const statusKey = getNormalizedStatus(quotation, index)

    return {
        id: quotation?.id || quotation?.quotation_id || quotation?.quotationNo || `RQ-2025-019${index + 1}`,
        requestId: quotation?.quotationNo || quotation?.quotation_id || `RQ-2025-019${index + 1}`,
        productName: quotation?.product_name || quotation?.item_type || quotation?.title || 'Corporate Shirt',
        quantity:
            quotation?.quantity ||
            quotation?.qty ||
            quotation?.total_quantity ||
            quotation?.requested_quantity ||
            12,
        statusKey,
        statusLabel: statusStyles[statusKey].label,
        submittedOn: quotation?.created_at || quotation?.submitted_at || quotation?.request_date || '2025-11-26',
        companyName: quotation?.company_name || 'Acme Corp',
        contactPerson: quotation?.contact_person || quotation?.name || 'John Smith',
        email: quotation?.email || 'Debra.Holt@Example.Com',
        phoneNumber: quotation?.phone_number || quotation?.phone || '(239) 555-0108',
        tier: quotation?.tier || 'Bronze',
        requestedDate: quotation?.requested_date || quotation?.created_at || '2024-05-20',
        pdfUrl: getPdfUrl(quotation),
        items: getRequestedItems(quotation),
    }
}

const buildDisplayQuotations = (rawData) => {
    const source = Array.isArray(rawData) ? rawData : []

    if (!source.length) {
        return displayStatuses.map((_, index) => normalizeQuotation({}, index))
    }

    const normalized = source.map((item, index) => normalizeQuotation(item, index))

    if (normalized.length >= displayStatuses.length) {
        return normalized
    }

    const expanded = [...normalized]

    for (let index = normalized.length; index < displayStatuses.length; index += 1) {
        const baseItem = source[index % source.length] || {}
        const forcedStatus = displayStatuses[index]
        const normalizedItem = normalizeQuotation(
            {
                ...baseItem,
                status: forcedStatus,
                quotation_status: forcedStatus,
                request_status: forcedStatus,
                quotation_id:
                    baseItem?.quotation_id ||
                    baseItem?.quotationNo ||
                    `RQ-2025-019${index + 1}`,
            },
            index,
        )

        expanded.push({
            ...normalizedItem,
            id: `${normalizedItem.id}-${forcedStatus}-${index}`,
            requestId:
                index < 9
                    ? `RQ-2025-019${index + 1}`
                    : normalizedItem.requestId,
        })
    }

    return expanded
}

const StatusBadge = ({ statusKey, statusLabel }) => {
    const style = statusStyles[statusKey] || statusStyles.submitted

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

const QuotationDetailView = ({ quotation, onBack }) => {
    const isAccepted = quotation.statusKey === 'accepted'
    const isReceived = quotation.statusKey === 'received'

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
                <section className="rounded-2xl border border-[#EDF2F7] bg-white p-4">
                    <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.03em] text-[#003560]">
                        <FiFileText size={12} />
                        Company Information
                    </div>

                    <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-3">
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

                <section className="rounded-2xl border border-[#EDF2F7] bg-white p-4">
                    <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.03em] text-[#003560]">
                        <FiFileText size={12} />
                        Quotation Information
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="grid flex-1 grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-[#94A3B8]">Request ID</p>
                                <p className="mt-1 text-sm font-medium text-[#111827]">{quotation.requestId}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-[#94A3B8]">Requested Date</p>
                                <p className="mt-1 text-sm font-medium text-[#111827]">{formatDate(quotation.requestedDate)}</p>
                            </div>
                        </div>

                        {isAccepted || isReceived ? (
                            <button
                                type="button"
                                className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[10px] border border-[#B7C9E2] bg-white px-6 text-[14px] font-semibold text-[#2B436F] shadow-none transition-colors hover:bg-[#F8FBFF]"
                                onClick={() => {
                                    if (quotation.pdfUrl) {
                                        window.open(quotation.pdfUrl, '_blank', 'noopener,noreferrer')
                                    }
                                }}
                            >
                                {isAccepted ? (
                                    <>
                                        <FiDownload size={16} />
                                        <span>Download Quotation PDF</span>
                                    </>
                                ) : (
                                    <span>Preview Quotation PDF</span>
                                )}
                            </button>
                        ) : null}
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-[#EDF2F7] bg-white">
                    <div className="border-b border-[#EDF2F7] px-4 py-4">
                        <h3 className="text-base font-semibold text-[#111827]">Requested Items</h3>
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

const MyQuotations = () => {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [quotations, setQuotations] = useState([])
    const [selectedQuotation, setSelectedQuotation] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const fetchQuotations = async () => {
            if (!session?.accessToken) return

            setLoading(true)
            try {
                const res = await apiGetQuotation(session.accessToken)
                const rawData = Array.isArray(res?.data) ? res.data : []
                setQuotations(buildDisplayQuotations(rawData))
            } catch (error) {
                console.error('Quotation API error:', error)
                setQuotations(buildDisplayQuotations([]))
            } finally {
                setLoading(false)
            }
        }

        fetchQuotations()
    }, [session?.accessToken])

    const filteredQuotations = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase()

        if (!keyword) {
            return quotations
        }

        return quotations.filter((item) =>
            item.requestId.toLowerCase().includes(keyword),
        )
    }, [quotations, searchTerm])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    const totalPages = Math.ceil(filteredQuotations.length / ITEMS_PER_PAGE) || 1
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const currentQuotations = filteredQuotations.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE,
    )

    if (selectedQuotation) {
        return (
            <QuotationDetailView
                quotation={selectedQuotation}
                onBack={() => setSelectedQuotation(null)}
            />
        )
    }

    return (
        <div className="w-full rounded-2xl bg-white px-4 py-6 shadow-sm md:px-6">
            <div className="mb-6">
                <h2 className="text-[30px] font-semibold text-[#003560]">My Quotations</h2>
            </div>

            <div className="relative mb-6 w-full max-w-[360px]">
                <FiSearch
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by request id..."
                    className="h-11 w-full rounded-lg border border-[#003560] bg-white pl-10 pr-4 text-sm text-[#111827] outline-none placeholder:text-[#94A3B8]"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Spinner size={28} />
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-[#EEF2F7]">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-[#F2F5FB]">
                                <tr>
                                    <th className="px-4 py-4 text-left text-sm font-medium text-[#4B5563]">Request ID</th>
                                    <th className="px-4 py-4 text-left text-sm font-medium text-[#4B5563]">Product Name</th>
                                    <th className="px-4 py-4 text-left text-sm font-medium text-[#4B5563]">Quantity</th>
                                    <th className="px-4 py-4 text-left text-sm font-medium text-[#4B5563]">Status</th>
                                    <th className="px-4 py-4 text-left text-sm font-medium text-[#4B5563]">Submitted on</th>
                                    <th className="px-4 py-4 text-left text-sm font-medium text-[#4B5563]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentQuotations.length ? (
                                    currentQuotations.map((item, index) => (
                                        <tr
                                            key={`${item.id}-${index}`}
                                            className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F7F9FC]'} border-b border-[#EEF2F7] last:border-b-0`}
                                        >
                                            <td className="px-4 py-4 text-sm font-medium text-[#003560]">{item.requestId}</td>
                                            <td className="px-4 py-4 text-sm text-[#003560]">{item.productName}</td>
                                            <td className="px-4 py-4 text-sm text-[#003560]">{item.quantity}</td>
                                            <td className="px-4 py-4 text-sm">
                                                <span style={{ color: statusStyles[item.statusKey].text }}>
                                                    {item.statusLabel}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-[#003560]">{formatDate(item.submittedOn)}</td>
                                            <td className="px-4 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedQuotation(item)}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-[#003560] px-3 py-1.5 text-xs font-medium text-[#003560]"
                                                >
                                                    <FiEye size={13} />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-[#6B7280]">
                                            No quotations found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between text-sm text-[#64748B]">
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            disabled={currentPage === 1}
                            className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
                                currentPage === 1
                                    ? 'cursor-not-allowed border-gray-200 text-gray-300'
                                    : 'border-[#1C4FA8] bg-[#1C4FA8] text-white hover:bg-[#1C4FA8]'
                            }`}
                        >
                            <IoChevronBack size={16} />
                        </button>

                        <button
                            onClick={() =>
                                setCurrentPage((page) => Math.min(totalPages, page + 1))
                            }
                            disabled={currentPage === totalPages}
                            className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
                                currentPage === totalPages
                                    ? 'cursor-not-allowed border-gray-200 text-gray-300'
                                    : 'border-[#1C4FA8] bg-[#1C4FA8] text-white hover:bg-[#1C4FA8]'
                            }`}
                        >
                            <IoChevronForward size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyQuotations
