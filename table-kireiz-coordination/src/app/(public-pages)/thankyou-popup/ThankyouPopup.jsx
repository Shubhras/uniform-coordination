'use client'
import Dialog from '@/components/ui/Dialog'
import { FiCheckCircle } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

const ThankyouPopup = ({ isOpen, onClose, orderData }) => {
    const router = useRouter()

    const handleClose = () => {
        if (onClose) {
            onClose()
        }
        router.push('/profile/my-order-rentals/active-orders')
    }

    const customer = orderData?.customer
    const deliveryAddress = orderData?.delivery_address
    const rentalPeriod = orderData?.rental_period
    const orderItems = Array.isArray(orderData?.order_items) ? orderData.order_items : (Array.isArray(orderData?.items) ? orderData.items : [])
    const orderSummary = orderData?.order_summary || orderData?.summary
    const orderId = orderData?.order_id || orderData?.id

    const subtotal = orderSummary?.subtotal
    const shipping = orderSummary?.shipping_charge ?? orderSummary?.shipping
    const discount = orderSummary?.promo_discount ?? orderSummary?.discount
    const tax = orderSummary?.tax
    const totalAmount = orderSummary?.total_amount ?? orderSummary?.total ?? orderSummary?.grand_total

    const startDate = rentalPeriod?.start_date || rentalPeriod?.start
    const endDate = rentalPeriod?.end_date || rentalPeriod?.end || rentalPeriod?.return
    const duration = rentalPeriod?.duration_days ? `${rentalPeriod.duration_days} days` : rentalPeriod?.duration

    const customerName = customer ? (customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim()) : null

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
                <div className="p-6 space-y-5">

                    {/* CUSTOMER & DELIVERY INFO */}
                    {(customerName || deliveryAddress) && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#374151]">
                            {customerName && (
                                <div>
                                    <h5 className="font-semibold text-[#111827] mb-1">Customer Info</h5>
                                    <p className="font-medium">{customerName}</p>
                                    {customer?.email && <p className="text-gray-500 text-xs">{customer.email}</p>}
                                    {customer?.phone && <p className="text-gray-500 text-xs">{customer.phone}</p>}
                                </div>
                            )}

                            {deliveryAddress && (
                                <div>
                                    <h5 className="font-semibold text-[#111827] mb-1">Delivery Address</h5>
                                    <p>{deliveryAddress.address_line1 || deliveryAddress.address || '—'}</p>
                                    {deliveryAddress.address_line2 && <p>{deliveryAddress.address_line2}</p>}
                                    <p>{deliveryAddress.city ? `${deliveryAddress.city}${deliveryAddress.postal_code ? `, ${deliveryAddress.postal_code}` : ''}` : ''}</p>
                                    <p>{deliveryAddress.country || 'India'}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ORDER ITEMS LIST */}
                    {orderItems.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                            <h4 className="font-semibold text-[#111827] mb-3 border-b pb-2">
                                Items Ordered ({orderItems.length})
                            </h4>
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                {orderItems.map((item, idx) => {
                                    const itemName = item.product_name || item.name || `Item ${idx + 1}`
                                    const qty = item.quantity || 1
                                    const price = item.total_price || item.price || 0
                                    const pricePerDay = item.price_per_day

                                    return (
                                        <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
                                            <div>
                                                <p className="font-medium text-gray-800">{itemName}</p>
                                                <p className="text-xs text-gray-500">
                                                    Qty: {qty} {pricePerDay ? `(¥${Number(pricePerDay).toLocaleString()}/day)` : ''}
                                                </p>
                                            </div>
                                            <span className="font-semibold text-gray-800">
                                                ¥{Number(price).toLocaleString()}
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
                            <h4 className="font-semibold text-[#111827] mb-3 border-b pb-2">
                                Rental Summary
                            </h4>

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
                            <h4 className="font-semibold text-[#111827] mb-3 border-b pb-2">
                                Order Summary
                            </h4>

                            <div className="text-sm text-[#374151] space-y-2">
                                {subtotal !== undefined && subtotal !== null && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Subtotal:</span>
                                        <span>¥{Number(subtotal).toLocaleString()}</span>
                                    </div>
                                )}
                                {shipping !== undefined && shipping !== null && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Shipping:</span>
                                        <span>¥{Number(shipping).toLocaleString()}</span>
                                    </div>
                                )}
                                {discount !== undefined && discount !== null && Number(discount) > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount:</span>
                                        <span>-¥{Number(discount).toLocaleString()}</span>
                                    </div>
                                )}
                                {tax !== undefined && tax !== null && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Tax:</span>
                                        <span>¥{Number(tax).toLocaleString()}</span>
                                    </div>
                                )}
                                {totalAmount !== undefined && totalAmount !== null && (
                                    <div className="flex justify-between font-semibold text-base text-[#111827] border-t pt-2 mt-1">
                                        <span>Total:</span>
                                        <span className="text-[#8B4513]">¥{Number(totalAmount).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                </div>

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
