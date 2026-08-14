'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { apiUserOrderList, apiReorderOrder } from '@/services/OrderService'
import { formatDate } from '@/utils/formatDate'
import { formatCurrency } from '@/utils/formatCurrency'
import { FiCalendar, FiSearch, FiX, FiRotateCcw, FiMapPin, FiRefreshCw } from 'react-icons/fi'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Pagination from '@/components/ui/Pagination'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { HiCheck } from 'react-icons/hi'

// Order image component with fallback pattern
const OrderImage = ({ src, alt }) => (
    <div className="h-[102px] w-[98px] overflow-hidden rounded-xl border border-[#F0E4DE] bg-[#FAF6F4] shrink-0 flex items-center justify-center">
        {src ? (
            <img src={src} alt={alt || 'Order item'} className="h-full w-full object-cover rounded-xl" />
        ) : (
            <div className="relative h-full w-full bg-[radial-gradient(circle_at_top,_#fef6ee,_#f2dfcf_65%,_#ead3bf)]">
                <div className="absolute left-2 right-2 top-2 h-7 rounded-full bg-[#F7EEDD]" />
                <div className="absolute left-4 right-4 top-3 h-5 rounded-full bg-[#FFFFFF]" />
                <div className="absolute left-3 right-3 top-1 h-8 rounded-full bg-[#F9F2E8]" />
                <div className="absolute left-2 right-2 top-8 h-10 rounded-t-[40px] bg-[#EED9C8]" />
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-[linear-gradient(180deg,_rgba(229,204,182,0),_rgba(224,194,166,0.9))]" />
                <div className="absolute left-4 top-3 h-10 w-1 rounded bg-[#F6E7D5]" />
                <div className="absolute right-4 top-3 h-10 w-1 rounded bg-[#F6E7D5]" />
                <div className="absolute left-7 top-2 h-2 w-2 rounded-full bg-[#E8C9B2]" />
                <div className="absolute left-9 top-1 h-2 w-2 rounded-full bg-[#F2D8C4]" />
                <div className="absolute left-11 top-2 h-2 w-2 rounded-full bg-[#EFD5C3]" />
                <div className="absolute right-8 top-2 h-2 w-2 rounded-full bg-[#F1DACA]" />
                <div className="absolute right-10 top-1 h-2 w-2 rounded-full bg-[#E9C9B1]" />
            </div>
        )}
    </div>
)

// Active orders tab content component
const ActiveOrders = ({ onTotalCountChange }) => {
    const router = useRouter()
    const { data: session } = useSession()

    // Active orders state
    const [ordersList, setOrdersList] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [reorderingId, setReorderingId] = useState(null)
    const pageSize = 5

    // Reorder handler
    const handleReorder = async (orderId) => {
        if (!session?.accessToken || !orderId) return
        try {
            setReorderingId(orderId)
            const res = await apiReorderOrder(session.accessToken, orderId)
            if (res?.status) {
                toast.push(
                    <Notification title="Success!" type="success">
                        {res?.message || 'Reorder created successfully! Redirecting to payment...'}
                    </Notification>
                )
                const redirectUrl = res?.data?.redirect_url || `/overview?orderId=${res?.data?.order_id || orderId}`
                router.push(redirectUrl)
            } else {
                toast.push(
                    <Notification title="Reorder Unavailable" type="danger">
                        {res?.message || 'Item is currently unavailable for reorder.'}
                    </Notification>
                )
            }
        } catch (err) {
            console.error('Reorder error:', err)
            const errMsg = err?.response?.data?.message || err?.message || 'Failed to reorder items.'
            toast.push(
                <Notification title="Reorder Failed" type="danger">
                    {errMsg}
                </Notification>
            )
        } finally {
            setReorderingId(null)
        }
    }

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
            setCurrentPage(1)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm])

    // Fetch active orders list
    useEffect(() => {
        const fetchActiveOrders = async () => {
            if (!session?.accessToken) return
            try {
                setLoading(true)
                const params = {
                    page: currentPage,
                    page_size: pageSize,
                }
                if (debouncedSearchTerm) params.search = debouncedSearchTerm
                if (statusFilter) params.status = statusFilter

                const response = await apiUserOrderList(session.accessToken, params)

                let list = []
                let total = 0

                if (response?.status && Array.isArray(response?.data)) {
                    list = response.data
                    total = response?.pagination?.total_records ?? response?.total ?? response?.count ?? response?.data?.length ?? 0
                } else if (response?.results && Array.isArray(response?.results)) {
                    list = response.results
                    total = response?.pagination?.total_records ?? response?.count ?? response?.results?.length ?? 0
                } else if (Array.isArray(response)) {
                    list = response
                    total = response.length
                }

                setOrdersList(list)
                setTotalCount(total)
                if (onTotalCountChange) onTotalCountChange(total)
            } catch (err) {
                console.error('Error fetching active orders:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchActiveOrders()
    }, [session?.accessToken, debouncedSearchTerm, statusFilter, currentPage])

    // Status filter options
    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'processing', label: 'Processing' },
        { value: 'out_for_delivery', label: 'Out For Delivery' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'returned', label: 'Returned' },
    ]

    // Custom select option item
    const CustomOption = (props) => {
        const { innerProps, label, isSelected, isDisabled } = props
        return (
            <div
                className={`flex items-center justify-between px-3 py-1.5 cursor-pointer ${isSelected ? 'text-[#A0522D] bg-[#F2F7FF]' : 'text-[#1C2C56] hover:bg-gray-100'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                {...innerProps}
            >
                <span className="ml-2 text-sm font-medium">{label}</span>
                {isSelected && <HiCheck className="text-lg" />}
            </div>
        )
    }

    // View order details handler
    const handleViewDetails = (orderId) => {
        router.push(`/profile/my-order-rentals/${orderId}`)
    }

    // Status badge style helper
    const getStatusBadge = (status) => {
        const lower = status?.toLowerCase()
        if (lower === 'out_for_delivery') {
            return 'bg-purple-100 text-purple-700 border-purple-200'
        }
        if (lower === 'processing' || lower === 'active') {
            return 'bg-blue-100 text-blue-700 border-blue-200'
        }
        if (lower === 'confirmed') {
            return 'bg-indigo-100 text-indigo-700 border-indigo-200'
        }
        return 'bg-amber-100 text-amber-800 border-amber-200'
    }

    // Address formatter helper
    const formatAddress = (addr) => {
        if (!addr) return ''
        if (typeof addr === 'string') return addr
        const parts = [
            addr.address_line_1,
            addr.address_line_2,
            addr.city,
            addr.postal_code,
            addr.country,
        ].filter(Boolean)
        return parts.join(', ')
    }

    // Reset filters handler
    const handleResetFilters = () => {
        setSearchTerm('')
        setDebouncedSearchTerm('')
        setStatusFilter('')
        setCurrentPage(1)
    }

    return (
        <div>
            {/* Search & Status Filters */}
            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C08A72]">
                        <FiSearch size={16} />
                    </span>
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by Order ID ..."
                        className="pl-10 pr-10 border-[#E7D8D0] bg-white w-full focus:!border-[#A0522D] focus:!ring-[#A0522D] focus:!ring-1"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm('')
                                setDebouncedSearchTerm('')
                                setCurrentPage(1)
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                        >
                            <FiX size={16} />
                        </button>
                    )}
                </div>
                <Select
                    instanceId="active-orders-status-select"
                    options={statusOptions}
                    value={statusOptions.find((o) => o.value === statusFilter) || statusOptions[0]}
                    onChange={(selected) => {
                        setStatusFilter(selected?.value || '')
                        setCurrentPage(1)
                    }}
                    isSearchable={false}
                    className="md:w-[160px] relative z-10"
                    components={{ Option: CustomOption }}
                    styles={{
                        control: (base) => ({
                            ...base,
                            borderRadius: '8px',
                            borderColor: '#EFE1D8',
                            borderStyle: 'solid',
                            borderWidth: '1px',
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1px 4px',
                            cursor: 'pointer',
                            boxShadow: 'none',
                            '&:hover': { borderColor: '#D7B7A3' },
                        }),
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
                        singleValue: () => ({ color: '#9C7F6D', fontWeight: 500, fontSize: '14px' }),
                    }}
                    maxMenuHeight={220}
                />

                <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-[#A0522D] bg-white border border-[#EFE1D8] rounded-lg hover:bg-[#FAF6F4] transition shrink-0"
                >
                    <FiRotateCcw size={14} />
                    Reset
                </button>
            </div>

            {/* Orders List */}
            <div className="mt-5 space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0522D]"></div>
                    </div>
                ) : ordersList.length === 0 ? (
                    <div className="rounded-2xl border border-[#F0E4DE] bg-white p-8 text-center text-[#8D7769]">
                        <p className="text-base font-medium">No active orders found.</p>
                    </div>
                ) : (
                    ordersList.map((order, index) => (
                        <div
                            key={order.id || `active-${order.order_id}-${index}`}
                            className="rounded-2xl border border-[#F0E4DE] bg-white p-4 shadow-sm transition hover:border-[#D7B7A3]"
                        >
                            <div className="flex flex-col gap-4 md:flex-row">
                                <OrderImage src={order.item_image} alt={order.item_name} />

                                <div className="flex-1">
                                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B49786]">
                                                    {order.order_id || `ORD-${order.id}`} • {formatDate(order.created_at)}
                                                </p>
                                                {order.status && (
                                                    <span
                                                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${getStatusBadge(
                                                            order.status
                                                        )}`}
                                                    >
                                                        {order.status.replace(/_/g, ' ')}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="mt-1 text-lg font-semibold text-[#2C1810]">
                                                {order.item_name ||
                                                    (order.order_type
                                                        ? `${order.order_type.charAt(0).toUpperCase() + order.order_type.slice(1)} Order`
                                                        : 'Rental Order')}
                                            </h3>
                                        </div>

                                        <p className="text-lg font-bold text-[#C26D3C]">
                                            {formatCurrency(order.total_amount, order.currency)}
                                        </p>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#7C6558]">
                                        <div className="flex items-center gap-2">
                                            <FiCalendar size={14} className="text-[#B48A73]" />
                                            <span>
                                                {formatDate(order.rental_start_date)} -{' '}
                                                {formatDate(order.rental_end_date)}{' '}
                                                {order.rental_days ? `(${order.rental_days} days)` : ''}
                                            </span>
                                        </div>

                                        {formatAddress(order.delivery_address) && (
                                            <div className="flex items-center gap-2">
                                                <FiMapPin size={14} className="text-[#B48A73]" />
                                                <span>{formatAddress(order.delivery_address)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleViewDetails(order.order_id)}
                                            className="rounded-md border border-[#E4B292] bg-white px-4 py-2 text-sm font-medium text-[#B66636] hover:bg-[#FAF6F4] transition"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleViewDetails(order.order_id)}
                                            className="rounded-md border border-[#E4B292] bg-white px-4 py-2 text-sm font-medium text-[#B66636] hover:bg-[#FAF6F4] transition"
                                        >
                                            Track Delivery
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleReorder(order.order_id || order.id)}
                                            disabled={reorderingId === (order.order_id || order.id)}
                                            className="rounded-md border border-[#B66636] bg-[#B66636] px-4 py-2 text-sm font-medium text-white hover:bg-[#9E5328] disabled:opacity-50 transition flex items-center gap-1.5"
                                        >
                                            {reorderingId === (order.order_id || order.id) ? (
                                                <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                                            ) : (
                                                <FiRefreshCw size={14} />
                                            )}
                                            Reorder
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalCount > 0 && (
                <div className="mt-6 flex justify-end">
                    <Pagination
                        currentPage={currentPage}
                        pageSize={pageSize}
                        total={totalCount}
                        onChange={(page) => setCurrentPage(page)}
                    />
                </div>
            )}
        </div>
    )
}

export default ActiveOrders
