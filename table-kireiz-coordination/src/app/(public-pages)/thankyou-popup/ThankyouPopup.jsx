'use client'
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Dialog from '@/components/ui/Dialog'
import { FiCheckCircle } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { apiPaymentDetail } from '@/services/paymentService'
import { formatDate } from '@/utils/formatDate'
import { formatCurrency } from '@/utils/formatCurrency'

/**
 * ThankyouPopup Component
 * 
 * Order confirmation dialog modal showing order items summary, delivery address, rental dates, and payment receipt breakdown.
 * 
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Modal visibility flag.
 * @param {Function} props.onClose - Modal close handler callback.
 * @param {string|number} props.paymentId - Confirmation payment ID.
 */
const ThankyouPopup = ({ isOpen, onClose, paymentId }) => {
    const router = useRouter()
    const { data: session } = useSession()
    const [orderPaymentDetail, setOrderPaymentDetail] = useState(null)
    const [loading, setLoading] = useState(false)

    /**
     * Fetches order payment receipt details by payment ID.
     */
    useEffect(() => {
        const fetchPaymentDetail = async () => {
            if (!isOpen || !session?.accessToken || !paymentId) return

            setLoading(true)
            try {
                const res = await apiPaymentDetail(session.accessToken, paymentId)
                if (res?.status) {
                    setOrderPaymentDetail(res?.data)
                } else {
                    setOrderPaymentDetail(null)
                }
            } catch (error) {
                console.error('Fetch payment detail error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPaymentDetail()
    }, [isOpen, session?.accessToken, paymentId])

    /**
     * Closes the confirmation popup and redirects to order history.
     */
    const handleClose = () => {
        if (onClose) {
            onClose()
        }
        router.push('/profile/my-order-rentals')
    }


    const order = orderPaymentDetail?.order
    const deliveryAddress = order?.delivery_address
    const customer = order?.customer

    const orderId = order?.order_id

    const customerName = deliveryAddress?.name || customer?.name || `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim()
    const customerEmail = deliveryAddress?.email || customer?.email
    const customerPhone = deliveryAddress?.phone || customer?.phone

    let orderItems = []
    if (Array.isArray(order?.order_items) && order.order_items.length > 0) {
        orderItems = order.order_items
    } else if (Array.isArray(order?.items) && order.items.length > 0) {
        orderItems = order.items
    } else if (order?.item_name) {
        orderItems = [{
            product_name: order.item_name,
            quantity: 1,
            total_price: order.total_amount || order.subtotal,
            price_per_day: null
        }]
    }

    const startDate = order?.rental_start_date ? formatDate(order.rental_start_date) : '—'
    const endDate = order?.rental_end_date ? formatDate(order.rental_end_date) : '—'
    const duration = order?.rental_days ? `${order.rental_days} days` : '—'

    const currencyCode = order?.currency || orderPaymentDetail?.currency || 'USD'

    const subtotal = order?.subtotal
    const shipping = order?.shipping_charge
    const discount = order?.discount
    const tax = order?.tax
    const totalAmount = order?.total_amount ?? orderPaymentDetail?.amount

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            onRequestClose={handleClose}
            className="w-full md:min-w-3xl max-w-2xl mx-auto p-0"
        >
            <div className="rounded-xl overflow-hidden bg-white max-h-[90vh] overflow-y-auto">

                {/* HEADER */}
                <div className="bg-[#FAF6F4] px-6 py-6 text-center space-y-2 border-b border-gray-100">
                    <div className="flex justify-center text-[#8B4513]">
                        <FiCheckCircle size={44} />
                    </div>
                    <h2 className="text-xl font-semibold text-[#3F3F3F]">
                        Thank you for your order!
                    </h2>
                    <p className="text-sm text-gray-600">
                        Your table rental has been confirmed.
                    </p>
                    {orderId && (
                        <div className="inline-block bg-[#8B4513]/10 text-[#8B4513] text-sm font-semibold px-4 py-1 rounded-full mt-1">
                            Order ID: {orderId}
                        </div>
                    )}
                </div>

                {/* BODY */}
                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
                    </div>
                ) : (
                    <div className="p-6 space-y-5">
                        {/* CUSTOMER & DELIVERY INFO */}
                        {(customerName || deliveryAddress) && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#374151]">
                                {customerName && (
                                    <div>
                                        <h5 className="font-semibold text-[#111827] mb-1">Customer Info</h5>
                                        <p className="font-medium mb-1">{customerName}</p>
                                        {customerEmail && <p className="text-gray-500 text-xs mb-1">{customerEmail}</p>}
                                        {customerPhone && <p className="text-gray-500 text-xs">{customerPhone}</p>}
                                    </div>
                                )}

                                {deliveryAddress && (
                                    <div>
                                        <h5 className="font-semibold text-[#111827] mb-1">Delivery Address</h5>
                                        <p>{deliveryAddress.address_line_1 || deliveryAddress.address_line1 || deliveryAddress.address || '—'}</p>
                                        {deliveryAddress.address_line_2 && <p>{deliveryAddress.address_line_2}</p>}
                                        <p>{deliveryAddress.city ? `${deliveryAddress.city}${deliveryAddress.postal_code ? `, ${deliveryAddress.postal_code}` : ''}` : ''}</p>
                                        <p>{deliveryAddress.country || 'India'}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ORDER ITEMS LIST */}
                        {orderItems.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                                <h5 className="font-semibold text-[#111827] mb-3 border-b pb-2">
                                    Items Ordered ({orderItems.length})
                                </h5>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                    {orderItems.map((item, idx) => {
                                        const itemName = item.product_name || item.name || `Item ${idx + 1}`
                                        const qty = item.quantity || 1
                                        const price = item.total_price || item.price || 0
                                        const pricePerDay = item.price_per_day

                                        return (
                                            <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
                                                <div>
                                                    <p className="font-medium text-[15px] text-gray-800">{itemName}</p>
                                                    <p className="text-[14px] text-gray-500">
                                                        Qty: {qty} {pricePerDay ? `(${formatCurrency(pricePerDay, currencyCode)}/day)` : ''}
                                                    </p>
                                                </div>
                                                <span className="font-semibold text-gray-800 text-[15px]">
                                                    {formatCurrency(price, currencyCode)}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ORDER & RENTAL SUMMARY GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* RENTAL SUMMARY */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                                <h5 className="font-semibold text-[#111827] mb-3 border-b pb-2">
                                    Rental Summary
                                </h5>

                                <div className="text-sm text-[#374151] space-y-2">
                                    <p className="flex justify-between">
                                        <span className="text-gray-500">Start Date:</span>
                                        <span className="font-medium">{startDate || '—'}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-gray-500">Return Date:</span>
                                        <span className="font-medium">{endDate || '—'}</span>
                                    </p>
                                    <p className="flex justify-between border-t pt-2">
                                        <span className="text-gray-500">Duration:</span>
                                        <span className="font-semibold text-[#8B4513]">{duration || '—'}</span>
                                    </p>
                                </div>
                            </div>

                            {/* ORDER SUMMARY */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                                <h5 className="font-semibold text-[#111827] mb-3 border-b pb-2">
                                    Order Summary
                                </h5>

                                <div className="text-sm text-[#374151] space-y-2">
                                    {subtotal !== undefined && subtotal !== null && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Subtotal:</span>
                                            <span>{formatCurrency(subtotal, currencyCode)}</span>
                                        </div>
                                    )}
                                    {shipping !== undefined && shipping !== null && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Shipping:</span>
                                            <span>{formatCurrency(shipping, currencyCode)}</span>
                                        </div>
                                    )}
                                    {discount !== undefined && discount !== null && Number(discount) > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount:</span>
                                            <span>-{formatCurrency(discount, currencyCode)}</span>
                                        </div>
                                    )}
                                    {tax !== undefined && tax !== null && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Tax:</span>
                                            <span>{formatCurrency(tax, currencyCode)}</span>
                                        </div>
                                    )}
                                    {totalAmount !== undefined && totalAmount !== null && (
                                        <div className="flex justify-between font-semibold text-base text-[#111827] border-t pt-2 mt-1">
                                            <span>Total:</span>
                                            <span className="text-[#8B4513]">{formatCurrency(totalAmount, currencyCode)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* FOOTER */}
                <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
                    <p className="text-xs text-[#6B7280]">
                        Need help with your order? Contact{' '}
                        <a href="mailto:support@kireiz.com" className="text-[#8B4513] font-medium underline">
                            support@kireiz.com
                        </a>
                    </p>
                    <button
                        onClick={handleClose}
                        className="px-6 py-2 bg-[#8B4513] hover:bg-[#71370F] text-white text-sm font-medium rounded-md transition"
                    >
                        View Active Orders
                    </button>
                </div>

            </div>
        </Dialog>
    )
}

export default ThankyouPopup
