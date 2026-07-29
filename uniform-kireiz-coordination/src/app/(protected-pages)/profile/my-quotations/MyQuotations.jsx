'use client'

import React, { useEffect, useState } from 'react'
import Spinner from '@/components/ui/Spinner'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FiEye, FiSearch } from 'react-icons/fi'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { HiCheck } from 'react-icons/hi'
import { apiGetQuotation } from '@/services/AuthProfileService'
import { formatDate } from '@/utils/dateFormater'

const ITEMS_PER_PAGE = 6

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

const statusFilterOptions = [
    { value: '', label: 'All Status' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'received', label: 'Received' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'declined', label: 'Declined' },
]

const getNormalizedStatus = (quotation) => {
    const rawStatus = String(
        quotation?.status ||
            quotation?.quotation_status ||
            quotation?.request_status ||
            quotation?.state ||
            'submitted',
    ).toLowerCase()

    if (rawStatus.includes('approv') || rawStatus.includes('accept')) return 'approved'
    if (rawStatus.includes('cancel')) return 'cancelled'
    if (rawStatus.includes('declin') || rawStatus.includes('reject')) return 'declined'
    if (rawStatus.includes('pend')) return 'pending'
    if (rawStatus.includes('submit')) return 'submitted'
    if (rawStatus.includes('receiv') || rawStatus.includes('review')) return 'received'

    return 'pending'
}

const getRequestedItems = (quotation) => {
    const source =
        quotation?.requested_items ||
        quotation?.items ||
        quotation?.products ||
        quotation?.line_items

    if (Array.isArray(source) && source.length) {
        return source.map((item, index) => ({
            id: item?.id || `item-${index}`,
            uniform_name:
                item?.uniform_name || item?.name || item?.product_name || 'Medical Scrub Set',
            category: item?.category || item?.item_type || 'Medical',
            quantity: item?.quantity || item?.qty || '-',
        }))
    }

    if (
        quotation?.product_name ||
        quotation?.item_type ||
        quotation?.product_category_name ||
        quotation?.size_quantity
    ) {
        return [
            {
                id: quotation?.product_id || quotation?.uuids || quotation?.quotation_id || 'item-0',
                uniform_name:
                    quotation?.product_name || quotation?.item_type || 'Medical Scrub Set',
                category:
                    quotation?.product_category_name ||
                    quotation?.product_subcategory_name ||
                    quotation?.material ||
                    'Medical',
                quantity:
                    quotation?.size_quantity ||
                    quotation?.quantity ||
                    quotation?.qty ||
                    '-',
            },
        ]
    }

    return []
}

const normalizeQuotation = (quotation, index) => {
    const statusKey = getNormalizedStatus(quotation)

    return {
        id:
            quotation?.id ||
            quotation?.quotation_id ||
            quotation?.quotationNo ||
            `RQ-2025-019${index + 1}`,
        quotationId:
            quotation?.uuid ||
            quotation?.quotation_uuid ||
            quotation?.quotation_id ||
            quotation?.id ||
            '',
        requestId:
            quotation?.quotationNo ||
            quotation?.quotation_id ||
            `RQ-2025-019${index + 1}`,
        productName:
            quotation?.product_name ||
            quotation?.item_type ||
            quotation?.title ||
            'Corporate Shirt',
        quantity:
            quotation?.quantity ||
            quotation?.qty ||
            quotation?.total_quantity ||
            quotation?.requested_quantity ||
            quotation?.size_quantity ||
            '-',
        statusKey,
        statusLabel: statusStyles[statusKey].label,
        submittedOn:
            quotation?.created_at || quotation?.submitted_at || quotation?.request_date || '',
        items: getRequestedItems(quotation),
    }
}

const extractQuotationList = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.results)) return payload.results
    if (Array.isArray(payload?.data?.results)) return payload.data.results
    if (Array.isArray(payload?.items)) return payload.items
    if (Array.isArray(payload?.data?.items)) return payload.data.items
    return []
}

const extractQuotationCount = (payload, fallbackLength) => {
    const count = payload?.count ?? payload?.total ?? payload?.data?.count ?? payload?.data?.total
    return Number.isFinite(count) ? count : fallbackLength
}

const buildDisplayQuotations = (rawData) => {
    const source = Array.isArray(rawData) ? rawData : []
    return source.map((item, index) => normalizeQuotation(item, index))
}

// custom option renderer for status dropdown
const CustomStatusOption = (props) => {
    const { innerProps, label, isSelected, isDisabled } = props
    return (
        <div
            className={`flex items-center justify-between px-3 py-1.5 cursor-pointer ${isSelected ? 'text-[#003560] bg-[#F2F7FF]' : 'text-[#1C2C56] hover:bg-gray-100'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            {...innerProps}
        >
            <span className="ml-2 text-sm font-medium">{label}</span>
            {isSelected && <HiCheck className="text-lg" />}
        </div>
    )
}

const MyQuotations = () => {
    const router = useRouter()
    const { data: session } = useSession()
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [quotations, setQuotations] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [errorMessage, setErrorMessage] = useState('')
    const [totalCount, setTotalCount] = useState(0)
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [detailLoadingId, setDetailLoadingId] = useState('')

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedSearchTerm(searchTerm.trim())
        }, 400)

        return () => window.clearTimeout(timeoutId)
    }, [searchTerm])

    useEffect(() => {
        const fetchQuotations = async () => {
            if (!session?.accessToken) return

            setLoading(true)
            setErrorMessage('')
            try {
                const res = await apiGetQuotation(session.accessToken, {
                    search: debouncedSearchTerm,
                    quotation_status: statusFilter,
                    page: currentPage,
                    page_size: ITEMS_PER_PAGE,
                })
                const rawData = extractQuotationList(res)
                setQuotations(buildDisplayQuotations(rawData))
                setTotalCount(extractQuotationCount(res, rawData.length))
            } catch (error) {
                console.error('Quotation API error:', error)
                setQuotations([])
                setTotalCount(0)
                setErrorMessage(
                    error?.response?.data?.message ||
                    error?.message ||
                    'Unable to load quotations right now.',
                )
            } finally {
                setLoading(false)
            }
        }

        fetchQuotations()
    }, [session?.accessToken, debouncedSearchTerm, statusFilter, currentPage])

    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearchTerm, statusFilter])

    const handleResetFilters = () => {
        setSearchTerm('')
        setStatusFilter('')
        setCurrentPage(1)
    }

    const handleViewQuotationDetails = (quotation) => {
        const quotationId = quotation?.quotationId || quotation?.id
        if (!quotationId) return

        setDetailLoadingId(quotation.id)
        router.push(`/profile/my-quotations/${quotationId}`)
    }

    const filteredQuotations = statusFilter
        ? quotations.filter((item) => item.statusKey === statusFilter)
        : quotations
    const visibleTotalCount = statusFilter ? filteredQuotations.length : totalCount
    const totalPages = Math.max(1, Math.ceil(visibleTotalCount / ITEMS_PER_PAGE))

    return (
        <div className="w-full rounded-2xl bg-white px-4 py-6 shadow-sm md:px-6">
            <div className="mb-6">
                <h2 className="text-[30px] font-semibold text-[#003560]">My Quotations</h2>
            </div>

            <div className="flex flex-col lg:flex-row lg:justify-between gap-3 mb-6">
                <div className="relative w-full max-w-[360px]">
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

                <div className="flex gap-3 lg:w-auto">
                    <Select
                        options={statusFilterOptions}
                        value={statusFilterOptions.find((o) => o.value === statusFilter) || statusFilterOptions[0]}
                        onChange={(selected) => setStatusFilter(selected?.value || '')}
                        isSearchable={false}
                        className="min-w-[180px]"
                        components={{ Option: CustomStatusOption }}
                        styles={{
                            control: (base) => {
                                const activeColor = statusStyles[statusFilter]?.text || '#003560'
                                return {
                                    ...base,
                                    borderRadius: '10px',
                                    borderColor: activeColor,
                                    borderStyle: 'solid',
                                    borderWidth: '1px',
                                    backgroundColor: statusFilter ? statusStyles[statusFilter]?.bg || 'white' : 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '2px 4px',
                                    cursor: 'pointer',
                                    boxShadow: 'none',
                                    '&:hover': { borderColor: activeColor },
                                }
                            },
                            menu: (base) => ({
                                ...base,
                                marginTop: '4px',
                                borderRadius: '14px',
                                padding: '6px',
                                overflow: 'hidden',
                            }),
                            menuList: (base) => ({
                                ...base,
                                paddingTop: 0,
                                paddingBottom: 0,
                                maxHeight: '220px',
                                overflowY: 'auto',
                            }),
                            singleValue: () => ({
                                color: statusStyles[statusFilter]?.text || '#003560',
                                fontWeight: 500,
                                fontSize: '14px',
                            }),
                        }}
                        maxMenuHeight={220}
                    />
                    <Button
                        type="button"
                        onClick={handleResetFilters}
                        className="bg-[#003560] hover:bg-[#00284A] text-white px-5"
                    >
                        Reset
                    </Button>
                </div>
            </div>

            {errorMessage ? (
                <div className="mb-6 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
                    {errorMessage}
                </div>
            ) : null}

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
                                {filteredQuotations.length ? (
                                    filteredQuotations.map((item, index) => (
                                        <tr
                                            key={`${item.id}-${index}`}
                                            className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F7F9FC]'} border-b border-[#EEF2F7] last:border-b-0`}
                                        >
                                            <td className="px-4 py-4 text-sm font-medium text-[#003560]">{item.requestId}</td>
                                            <td className="px-4 py-4 text-sm text-[#003560]">{item.productName}</td>
                                            <td className="px-4 py-4 text-sm text-[#003560]">{item.quantity}</td>
                                            <td className="px-4 py-4 text-sm">
                                                <span style={{ color: (statusStyles[item.statusKey] || statusStyles.pending).text }}>
                                                    {item.statusLabel}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-[#003560]">{formatDate(item.submittedOn)}</td>
                                            <td className="px-4 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewQuotationDetails(item)}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-[#003560] px-3 py-1.5 text-xs font-medium text-[#003560]"
                                                    disabled={detailLoadingId === item.id}
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
                                            {errorMessage ? 'Quotation data could not be loaded.' : 'No quotations found for the selected status.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && visibleTotalCount > 0 && (
                <div className="mt-8 flex items-center justify-between text-sm text-[#64748B]">
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            disabled={currentPage === 1}
                            className={`h-9 w-9 flex items-center justify-center rounded-md border transition-colors ${currentPage === 1
                                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                    : 'border-[#1C4FA8] bg-[#1C4FA8] text-white hover:bg-[#1C4FA8]'
                                }`}
                        >
                            <IoChevronBack size={16} />
                        </button>

                        <button
                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                            disabled={currentPage === totalPages}
                            className={`h-9 w-9 flex items-center justify-center rounded-md border transition-colors ${currentPage === totalPages
                                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
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
