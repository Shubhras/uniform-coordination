'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import {
    FiArrowLeft,
    FiShoppingBag,
    FiCreditCard,
    FiTruck,
    FiCheckCircle,
    FiRotateCcw,
    FiInfo,
} from 'react-icons/fi'
import { apiSindleOrderDetials } from '@/services/OrderService'
import Spinner from '@/components/ui/Spinner'

// 5-step rental timeline configuration
const TIMELINE_STEPS = [
    {
        key: 'confirmed',
        title: 'Order Confirmed',
        desc: 'Order Created',
        icon: FiShoppingBag,
    },
    {
        key: 'payment',
        title: 'Payment Received',
        desc: 'Payment Received',
        icon: FiCreditCard,
    },
    {
        key: 'shipped',
        title: 'Shipped',
        desc: 'Dispatched',
        icon: FiTruck,
    },
    {
        key: 'delivered',
        title: 'Delivered',
        desc: 'Items delivered successfully',
        icon: FiCheckCircle,
    },
    {
        key: 'returned',
        title: 'Returned',
        desc: 'Items received and logged for inspection',
        icon: FiRotateCcw,
    },
]

// Step index calculation helper based on raw order status and payment
const getStepIndex = (rawStatus, isPaid) => {
    const s = String(rawStatus || '').toLowerCase()
    if (s === 'returned') return 4
    if (s === 'delivered') return 3
    if (s === 'processing' || s === 'shipped' || s === 'out_for_delivery' || s === 'dispatched') {
        return 2
    }
    if (s === 'confirmed' || s === 'paid' || isPaid === true) return 1
    if (s === 'pending') return 0
    return 0
}

// Status badge styling helper
const getStatusBadgeStyle = (status) => {
    const s = String(status || '').toLowerCase()
    if (s === 'returned') {
        return 'bg-[#FAF5FF] text-[#8200DB] border-[#E9D4FF]'
    }
    if (s === 'delivered') {
        return 'bg-[#EAF8F0] text-[#3E9C68] border-[#86EFAC]'
    }
    if (s === 'processing' || s === 'shipped' || s === 'out_for_delivery' || s === 'dispatched') {
        return 'bg-[#FFF4E5] text-[#D97706] border-[#FCD34D]'
    }
    if (s === 'pending') {
        return 'bg-[#FFF4E5] text-[#BB4D00] border-[#BB4D00]'
    }
    if (s === 'confirmed' || s === 'paid') {
        return 'bg-[#EFF6FF] text-[#1447E6] border-[#BEDBFF]'
    }
    if (s === 'cancelled') {
        return 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
    }
    return 'bg-[#FFF4E5] text-[#BB4D00] border-[#BB4D00]'
}

const RentalTimelineView = () => {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: nextAuthSession, status: authStatus } = useSession()
    const { session: currentSession } = useCurrentSession()
    const session = nextAuthSession || currentSession

    const orderId = params?.id || searchParams?.get('orderId') || searchParams?.get('id') || null
    const token = session?.accessToken || session?.user?.accessToken

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch order details from API
    const fetchTimelineDetails = useCallback(async () => {
        if (!orderId) {
            setLoading(false)
            setError('Order ID is required to view the rental timeline.')
            return
        }

        if (authStatus === 'loading') {
            return
        }

        if (!token) {
            setLoading(false)
            setError('Please sign in to view the rental timeline.')
            return
        }

        try {
            setLoading(true)
            setError(null)
            const res = await apiSindleOrderDetials(token, orderId)
            if (res?.data) {
                const detailed = Array.isArray(res.data) ? res.data[0] : res.data
                setOrder(detailed)
            } else if (res && !res.data) {
                setOrder(res)
            } else {
                setError('No timeline details found for this order.')
            }
        } catch (err) {
            console.error('Failed to load rental timeline details:', err)
            setError(err?.response?.data?.message || err?.message || 'Failed to load timeline details.')
        } finally {
            setLoading(false)
        }
    }, [token, orderId, authStatus])

    useEffect(() => {
        if (!orderId) {
            setLoading(false)
            setError('Order ID is required to view the rental timeline.')
            return
        }

        if (authStatus === 'unauthenticated' && !token) {
            setLoading(false)
            setError('Please sign in to view the rental timeline.')
            return
        }

        if (token && orderId) {
            fetchTimelineDetails()
        }
    }, [fetchTimelineDetails, token, orderId, authStatus])

    // Handle back button
    const handleBack = () => {
        if (orderId) {
            router.push(`/profile/my-order-rentals/${orderId}`)
        } else {
            router.back()
        }
    }

    const currentStep = getStepIndex(order?.status, order?.is_paid)
    const totalSteps = TIMELINE_STEPS.length
    const completedSteps = currentStep + 1
    const progressPercentage = Math.round((completedSteps / totalSteps) * 100)

    const customerName =
        order?.company_name ||
        order?.company ||
        order?.delivery_address?.company ||
        order?.customer?.company_name ||
        order?.delivery_address?.name ||
        (order?.delivery_address?.first_name
            ? `${order.delivery_address.first_name} ${order.delivery_address.last_name || ''}`.trim()
            : null) ||
        (order?.customer?.first_name
            ? `${order.customer.first_name} ${order.customer.last_name || ''}`.trim()
            : null) ||
        order?.customer_name ||
        order?.user?.name ||
        session?.user?.name ||
        '—'

    const rawTotal =
        order?.total_amount ??
        order?.payment_summary?.total_amount ??
        order?.payment_summary?.amount ??
        0

    const totalAmount = Number(rawTotal || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })

    return (
        <div className="min-h-screen bg-[#FAF8F6] py-6 px-2 md:px-4">
            <div className="mx-auto w-full max-w-6xl">
                {/* Header */}
                <div className="mb-6 flex items-center gap-3 sm:gap-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[#E9DED4] bg-white text-[#5A4332] hover:bg-[#F8F3EE] transition shrink-0 cursor-pointer shadow-xs"
                        aria-label="Back"
                    >
                        <FiArrowLeft className="text-lg text-[#5A4332]" />
                    </button>
                    <h1 className="text-xl sm:text-2xl md:text-[26px] font-bold text-[#2F241D]">
                        Rental Timeline
                    </h1>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <Spinner size={44} customColorClass="text-[#A0522D]" />
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-xs">
                        <p className="text-sm font-medium text-red-600 mb-4">{error}</p>
                        <button
                            type="button"
                            onClick={fetchTimelineDetails}
                            className="rounded-md bg-[#B66636] px-4 py-2 text-sm font-medium text-white hover:bg-[#9E5328] transition"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                        {/* LEFT: Stepper Timeline */}
                        <div className="col-span-1 lg:col-span-7 xl:col-span-8 rounded-2xl border border-[#EEE5DE] bg-white p-6 sm:p-7 shadow-xs">
                            <div className="relative">
                                {TIMELINE_STEPS.map((step, index) => {
                                    const isCompleted = index <= currentStep
                                    const isLast = index === TIMELINE_STEPS.length - 1
                                    const IconComponent = step.icon

                                    return (
                                        <div
                                            key={step.title}
                                            className="relative flex justify-between items-start gap-4 pb-8 last:pb-0"
                                        >
                                            {/* Vertical Connecting Line */}
                                            {!isLast && (
                                                <div
                                                    className={`absolute left-[19px] top-10 w-[2px] h-[calc(100%-12px)] transition-colors duration-300 ${index < currentStep
                                                        ? 'bg-[#C96B34]'
                                                        : 'bg-[#E5E5E5]'
                                                        }`}
                                                />
                                            )}

                                            <div className="flex gap-3 sm:gap-4 min-w-0">
                                                {/* Circle Icon */}
                                                <div
                                                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm z-10 shrink-0 transition-all ${isCompleted
                                                        ? 'bg-[#B8663A] text-white shadow-sm'
                                                        : 'bg-white border border-[#D9D9D9] text-[#999999]'
                                                        }`}
                                                >
                                                    <IconComponent size={18} />
                                                </div>

                                                {/* Title & Description */}
                                                <div className="min-w-0 pt-0.5">
                                                    <h3
                                                        className={`font-semibold text-sm ${isCompleted
                                                            ? 'text-[#2D241C]'
                                                            : 'text-[#B8B8B8]'
                                                            }`}
                                                    >
                                                        {step.title}
                                                    </h3>
                                                    <p
                                                        className={`text-xs mt-1 leading-snug ${isCompleted
                                                            ? 'text-[#8D857D]'
                                                            : 'text-[#C6C6C6]'
                                                            }`}
                                                    >
                                                        {step.desc}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right Badge */}
                                            <span
                                                className={`text-xs shrink-0 whitespace-nowrap pt-1 font-medium ${isCompleted
                                                    ? 'text-[#8B8B8B]'
                                                    : 'text-[#BEBEBE]'
                                                    }`}
                                            >
                                                {isCompleted ? 'Completed' : 'Pending'}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* RIGHT: Order Summary & Progress */}
                        <div className="col-span-1 lg:col-span-5 xl:col-span-4 space-y-4">
                            {/* ORDER SUMMARY Card */}
                            <div className="rounded-2xl border border-[#EEE5DE] bg-white p-5 sm:p-6 shadow-xs">
                                <h3 className="text-[12px] font-semibold text-[#7A6E66] uppercase tracking-wider mb-4">
                                    ORDER SUMMARY
                                </h3>

                                <div className="space-y-3.5 text-xs sm:text-sm">
                                    <div className="flex justify-between items-center gap-3">
                                        <span className="text-[#8C8177] shrink-0">Order ID</span>
                                        <span className="font-semibold text-xs text-[#A85A32] truncate">
                                            {order?.order_id || orderId || '—'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center gap-3">
                                        <span className="text-[#8C8177] shrink-0">Company</span>
                                        <span className="font-semibold text-xs text-[#1A1714] text-right truncate max-w-[180px]">
                                            {customerName}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center gap-3">
                                        <span className="text-[#8C8177] shrink-0">Type</span>
                                        <span className="px-2 py-0.5 rounded bg-[#F0F9FF] border border-[#B8E6FE] text-[#0069A8] text-[11px] font-semibold shrink-0">
                                            {order?.order_type?.toUpperCase() || order?.type?.toUpperCase() || 'B2C'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center gap-3">
                                        <span className="text-[#8C8177] shrink-0">Amount</span>
                                        <span className="font-bold text-xs text-[#A85A32]">
                                            ${totalAmount}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center gap-3">
                                        <span className="text-[#8C8177] shrink-0">Status</span>
                                        <span
                                            className={`px-2.5 py-0.5 rounded border text-[11px] font-semibold capitalize shrink-0 ${getStatusBadgeStyle(
                                                order?.status
                                            )}`}
                                        >
                                            {order?.status || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* PROGRESS Card */}
                            <div className="rounded-2xl border border-[#ECD8CB] bg-[#FFF8F3] p-5 shadow-xs">
                                <h3 className="flex items-center gap-1.5 text-[12px] uppercase text-[#C26C35] font-bold mb-3">
                                    <FiInfo size={15} />
                                    PROGRESS
                                </h3>

                                <div className="h-2 w-full rounded-full bg-[#E8D7CA] overflow-hidden">
                                    <div
                                        className="h-full bg-[#B8663A] rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>

                                <p className="mt-2.5 text-xs text-[#A85A32] font-semibold">
                                    {completedSteps} of {totalSteps} steps completed
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RentalTimelineView
