'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { apiUserOrderList } from '@/services/OrderService'
import { formatDate } from '@/utils/formatDate'
import { formatCurrency } from '@/utils/formatCurrency'
import { FiCalendar, FiMapPin } from 'react-icons/fi'
import Pagination from '@/components/ui/Pagination'

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

// Completed orders tab content component
const CompletedOrders = ({ onTotalCountChange }) => {
    const router = useRouter()
    const { data: session } = useSession()

    // Completed orders state
    const [ordersList, setOrdersList] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const pageSize = 5

    // Fetch completed orders
    useEffect(() => {
        const fetchCompletedOrders = async () => {
            if (!session?.accessToken) return
            try {
                setLoading(true)
                const params = {
                    status: 'delivered',
                    page: currentPage,
                    page_size: pageSize,
                }

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
                console.error('Error fetching completed orders:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchCompletedOrders()
    }, [session?.accessToken, currentPage])

    // View order details handler
    const handleViewDetails = (orderId) => {
        router.push(`/profile/my-order-rentals/${orderId}`)
    }

    // Status badge style helper
    const getStatusBadge = (status) => {
        const lower = status?.toLowerCase()
        if (lower === 'completed' || lower === 'delivered') {
            return 'bg-green-100 text-green-700 border-green-200'
        }
        if (lower === 'cancelled') {
            return 'bg-red-100 text-red-700 border-red-200'
        }
        if (lower === 'returned') {
            return 'bg-gray-100 text-gray-700 border-gray-200'
        }
        return 'bg-green-100 text-green-700 border-green-200'
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

    return (
        <div>
            {/* Orders List */}
            <div className="mt-5 space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0522D]"></div>
                    </div>
                ) : ordersList.length === 0 ? (
                    <div className="rounded-2xl border border-[#F0E4DE] bg-white p-8 text-center text-[#8D7769]">
                        <p className="text-base font-medium">No completed orders found.</p>
                    </div>
                ) : (
                    ordersList.map((order, index) => (
                        <div
                            key={order.id || `completed-${order.order_id}-${index}`}
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

export default CompletedOrders
