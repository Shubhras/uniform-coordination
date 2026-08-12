'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { apiSindleOrderDetials } from '@/services/OrderService'
import { formatDate } from '@/utils/formatDate'
import { formatCurrency } from '@/utils/formatCurrency'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import {
    FiArrowLeft,
    FiCalendar,
    FiCreditCard,
    FiMail,
    FiPhone,
    FiUser,
    FiFileText,
} from 'react-icons/fi'

// Order item image preview component
const PreviewImage = ({ src, alt }) => (
    <div className="h-[186px] w-full overflow-hidden rounded-xl border border-[#EADCD2] bg-[radial-gradient(circle_at_top,_#f8efe7,_#ead4be_60%,_#e4c7aa)]">
        {src ? (
            <img src={src} alt={alt || 'Order item'} className="h-full w-full object-cover rounded-xl" />
        ) : (
            <div className="relative h-full w-full">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,_rgba(255,247,238,0.9),_transparent_20%),radial-gradient(circle_at_83%_20%,_rgba(255,249,241,0.85),_transparent_18%),linear-gradient(180deg,_rgba(255,252,249,0.2),_rgba(220,188,156,0.18))]" />
                <div className="absolute left-[18%] right-[18%] top-[10%] h-5 rounded-full bg-[#FEF7F0]" />
                <div className="absolute left-[24%] right-[24%] top-[4%] h-5 rounded-full bg-[#F6ECE2]" />
                <div className="absolute left-[21%] top-[10%] h-8 w-[2px] rounded bg-[#FFF5EC]" />
                <div className="absolute right-[21%] top-[10%] h-8 w-[2px] rounded bg-[#FFF5EC]" />
                <div className="absolute left-[14%] right-[14%] top-[31%] h-12 rounded-full bg-[#FFFDFB]" />
                <div className="absolute left-[10%] right-[10%] top-[37%] h-[92px] rounded-t-[70px] bg-[#E9D0BA]" />
                <div className="absolute left-[18%] right-[18%] top-[28%] h-9 rounded-full bg-[#ECE3D8]" />
                <div className="absolute left-[26%] top-[20%] h-9 w-9 rounded-full bg-[#F8EFEA]" />
                <div className="absolute left-[33%] top-[18%] h-10 w-10 rounded-full bg-[#F4E9E4]" />
                <div className="absolute left-[40%] top-[16%] h-11 w-11 rounded-full bg-[#EFE4DB]" />
                <div className="absolute left-[48%] top-[18%] h-10 w-10 rounded-full bg-[#F7EEE7]" />
                <div className="absolute left-[56%] top-[20%] h-9 w-9 rounded-full bg-[#EFE6DE]" />
                <div className="absolute bottom-0 left-0 right-0 h-14 bg-[linear-gradient(180deg,_rgba(229,204,182,0),_rgba(224,194,166,0.92))]" />
            </div>
        )}
    </div>
)

const cardClassName = 'rounded-2xl border border-[#F0E4DE] bg-white shadow-sm'

// Reusable detail card container
const DetailCard = ({ title, icon, children, className = '' }) => (
    <div className={`${cardClassName} p-4 ${className}`}>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A18C]">
            {icon}
            <p>{title}</p>
        </div>
        <div className="mt-4">{children}</div>
    </div>
)

// Reusable detail info row
const InfoRow = ({ label, value, valueClassName = 'text-[#2C1810]' }) => (
    <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A18C]">{label}</p>
        <p className={`mt-1 text-sm font-medium leading-5 ${valueClassName}`}>{value}</p>
    </div>
)

// Payment status badge style helper
const getPaymentStatusBadge = (status) => {
    const lower = status?.toLowerCase()
    if (lower === 'success' || lower === 'paid') {
        return 'bg-[#EAFBF0] text-[#16A34A] border border-green-200'
    }
    if (lower === 'pending') {
        return 'bg-amber-100 text-amber-800 border border-amber-200'
    }
    if (lower === 'failed' || lower === 'cancelled') {
        return 'bg-red-100 text-red-700 border border-red-200'
    }
    if (lower === 'processing') {
        return 'bg-blue-100 text-blue-700 border border-blue-200'
    }
    return 'bg-gray-100 text-gray-700 border border-gray-200'
}

// Order rental detail component
const OrderRentalDetail = ({ backPath = '/profile/my-order-rentals' }) => {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()

    // Single order detail state
    const [orderDetailData, setOrderDetailData] = useState(null)
    const [loading, setLoading] = useState(true)

    const orderId = params?.id || 'ORD-2024-0091'

    // Fetch order details by ID
    useEffect(() => {
        const fetchOrderDetail = async () => {
            if (!session?.accessToken || !orderId) return
            try {
                setLoading(true)
                const response = await apiSindleOrderDetials(session.accessToken, orderId)
                setOrderDetailData(response)
            } catch (err) {
                console.error('Error fetching single order details:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchOrderDetail()
    }, [session?.accessToken, orderId])

    // Back button click handler
    const handleBack = () => {
        router.push(backPath)
    }

    const orderData = Array.isArray(orderDetailData?.data)
        ? orderDetailData.data[0]
        : orderDetailData?.data || orderDetailData

    const currencyCode = orderData?.payment_summary?.currency || orderData?.currency || 'USD'

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
        <div className="mx-auto w-full max-w-7xl py-6 px-4 md:px-8">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5D5CD] bg-white text-[#8B6A55] hover:bg-[#FAF6F4] transition"
                >
                    <FiArrowLeft size={16} />
                </button>
                <div className="flex-1">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <h2 className="text-2xl font-bold text-[#2C1810]">
                            {orderData?.item_name || `Order ${orderData?.order_id || orderId}`}
                        </h2>
                        {orderData?.created_at && (
                            <p className="text-sm text-[#8D7769] font-medium">
                                Ordered On {formatDate(orderData.created_at)}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0522D]"></div>
                </div>
            ) : (
                <>
                    <div className="grid gap-4 xl:grid-cols-[1.06fr_0.56fr] xl:items-stretch">
                        <div className="flex h-full flex-col gap-4">
                            <div className={`${cardClassName} overflow-hidden`}>
                                {orderData?.item_image ? (
                                    <img
                                        src={orderData.item_image}
                                        alt={orderData.item_name || 'Order banner'}
                                        className="w-full h-[240px] md:h-[320px] object-cover"
                                    />
                                ) : (
                                    <div className="p-4">
                                        <PreviewImage src={null} alt={orderData?.item_name} />
                                    </div>
                                )}
                            </div>

                            <DetailCard
                                title="Rental Information"
                                icon={<FiCalendar size={12} className="text-[#B66636]" />}
                                className="flex-grow-0"
                            >
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <InfoRow label="Rental Start" value={formatDate(orderData?.rental_start_date)} />
                                    <InfoRow label="Rental End" value={formatDate(orderData?.rental_end_date)} />
                                </div>
                            </DetailCard>

                            {orderData?.contract_info && (
                                <DetailCard
                                    title="Quotation & Contract Information"
                                    icon={<FiFileText size={12} className="text-[#B66636]" />}
                                    className="flex-grow-0"
                                >
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                        <InfoRow label="Contract ID" value={orderData.contract_info.contract_id} />
                                        <InfoRow label="Contract Status" value={orderData.contract_info.contract_status?.toUpperCase()} />
                                        <InfoRow label="Workflow Status" value={orderData.contract_info.workflow_status?.replace(/_/g, ' ')} />
                                        {orderData.contract_info.signed_at && (
                                            <InfoRow label="Signed Date" value={formatDate(orderData.contract_info.signed_at)} />
                                        )}
                                    </div>
                                    {orderData.contract_info.signed_pdf && (
                                        <a
                                            href={orderData.contract_info.signed_pdf}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-5 inline-flex w-full items-center justify-center rounded-md border border-[#E4B292] bg-white px-4 py-2 text-sm font-medium text-[#B66636] hover:bg-[#FAF6F4] transition"
                                        >
                                            Download Contract PDF
                                        </a>
                                    )}
                                </DetailCard>
                            )}
                        </div>

                        <div className="h-full">
                            <div className={`${cardClassName} flex h-full flex-col p-4`}>
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A18C]">
                                    <FiCreditCard size={12} className="text-[#B66636]" />
                                    <p>Payment Summary</p>
                                </div>
                                <div className="mt-4 space-y-3 text-sm text-[#6D5548]">
                                    <div className="flex items-center justify-between">
                                        <span>Total Items</span>
                                        <span>{orderData?.order_items?.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Sub Total</span>
                                        <span>{formatCurrency(orderData?.payment_summary?.subtotal, currencyCode)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Delivery Fee</span>
                                        <span>{formatCurrency(orderData?.payment_summary?.shipping_charge, currencyCode)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Consumption Tax (10%)</span>
                                        <span>{formatCurrency(orderData?.payment_summary?.tax, currencyCode)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Corporate Discount</span>
                                        <span className="text-[#B04E2F]">-{formatCurrency(orderData?.payment_summary?.discount || 0, currencyCode)}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-[#F2E6E0] pt-3 font-semibold text-[#B04E2F]">
                                        <span>Rental Subtotal</span>
                                        <span>{formatCurrency(orderData?.payment_summary?.total_amount, currencyCode)}</span>
                                    </div>
                                </div>

                                <div className="mt-5 border-t border-[#F2E6E0] pt-5">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A18C]">
                                        Payment Method
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 rounded-md border border-[#EEE1D8] bg-white px-3 py-3 text-sm font-medium text-[#2C1810]">
                                        <span className="rounded bg-[#EEF6FF] px-1.5 py-0.5 text-[10px] font-semibold text-[#2B7FFF]">
                                            {orderData?.payment_summary?.payment_method?.[0]?.toUpperCase()}
                                        </span>
                                        <span> {orderData?.payment_summary?.payment_method}</span>
                                    </div>
                                    <div className="mt-5 flex items-center justify-between text-sm text-[#7C6558]">
                                        <span>Payment Status</span>
                                        <span className={`rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase ${getPaymentStatusBadge(orderData?.payment_summary?.payment_status)}`}>
                                            {orderData?.payment_summary?.payment_status}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-sm text-[#7C6558]">
                                        <span>Payment Date</span>
                                        <span>{orderData?.payment_summary?.paid_at ? formatDate(orderData?.payment_summary?.paid_at) : ''}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="mt-5 w-full rounded-md border border-[#E4B292] bg-white px-4 py-2 text-sm font-medium text-[#B66636] hover:bg-[#FAF6F4] transition"
                                    >
                                        Track Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                        <div className="mt-4 space-y-4">
                            <DetailCard
                                title="Customer Information"
                                icon={<FiUser size={12} className="text-[#B66636]" />}
                            >
                                <div className="grid gap-x-8 gap-y-4 md:grid-cols-3">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A18C]">
                                            Customer Name
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="text-sm font-medium text-[#2C1810]">{orderData?.delivery_address?.name}</span>
                                        </div>
                                    </div>
                                    <InfoRow label="Business Email" value={orderData?.delivery_address?.email} />
                                    <div className="flex items-center gap-2 text-sm text-[#2C1810]">
                                        <FiPhone size={14} className="text-[#B48A73]" />
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A18C]">
                                                Phone Number
                                            </p>
                                            <p className="mt-1 font-medium">{orderData?.delivery_address?.phone}</p>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <div className="flex items-start gap-2 text-sm text-[#2C1810]">
                                            <FiMail size={14} className="mt-0.5 text-transparent" />
                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A18C]">
                                                    Delivery Address
                                                </p>
                                                <p className="mt-1 font-medium leading-5">
                                                    {formatAddress(orderData?.delivery_address) && (
                                                        <>
                                                            {formatAddress(orderData?.delivery_address)}
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </DetailCard>

                            <div className={`${cardClassName} overflow-hidden`}>
                                <div className="flex items-center justify-between border-b border-[#F4E8E2] px-4 py-4">
                                    <h3 className="text-sm font-semibold text-[#2C1810]">Ordered Items</h3>
                                    <span className="text-xs text-[#B8A89E]">{orderData?.order_items?.length} items</span>
                                </div>
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="min-w-full">
                                        <thead className="bg-[#FFFDFC] text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A0725B]">
                                            <tr>
                                                <th className="px-4 py-3">Item</th>
                                                <th className="px-4 py-3">Qty</th>
                                                <th className="px-4 py-3">Days</th>
                                                <th className="px-4 py-3">Unit Price</th>
                                                <th className="px-4 py-3">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderData?.order_items?.map((item, index) => (
                                                <tr
                                                    key={`${item.product_name}-${index}`}
                                                    className="border-t border-[#F7EEEA] text-sm text-[#2C1810]"
                                                >
                                                    <td className="px-4 py-3.5">{item.product_name}</td>
                                                    <td className="px-4 py-3.5">{item.quantity}</td>
                                                    <td className="px-4 py-3.5">{item.rental_days}</td>
                                                    <td className="px-4 py-3.5">{formatCurrency(item.price_per_day, currencyCode)}</td>
                                                    <td className="px-4 py-3.5">{formatCurrency(item.subtotal, currencyCode)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="space-y-3 p-4 md:hidden">
                                    {orderData?.order_items?.map((item, index) => (
                                        <div
                                            key={`${item.product_name}-${index}-mobile`}
                                            className="rounded-xl border border-[#F3E7E1] bg-[#FFFDFC] p-4"
                                        >
                                            <p className="text-sm font-semibold text-[#2C1810]">{item.product_name}</p>
                                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-[#6D5548]">
                                                <span>Qty: {item.quantity}</span>
                                                <span>Days: {item.rental_days}</span>
                                                <span>{formatCurrency(item.price_per_day, currencyCode)}</span>
                                                <span>{formatCurrency(item.subtotal, currencyCode)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
        </div>
    )
}

export default OrderRentalDetail
