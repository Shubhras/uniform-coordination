'use client'
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiGetOverviewSummary } from '@/services/OrderService'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Spinner from '@/components/ui/Spinner'
import { FiUser, FiMapPin, FiCalendar } from 'react-icons/fi'
import Image from 'next/image'
const Overview = () => {
    const { data: session } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId')

    const [overviewData, setOverviewData] = useState(null)
    const [cartItems, setCartItems] = useState([])
    const [cartSummary, setCartSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const [navigatingToPayment, setNavigatingToPayment] = useState(false)

    useEffect(() => {
        if (session?.accessToken && orderId) {
            fetchOverviewSummary()
        } else if (!orderId) {
            setLoading(false)
            setError('No Order ID found in request.')
        }
    }, [session?.accessToken, orderId])

    const fetchOverviewSummary = async () => {
        try {
            if (!session?.accessToken || !orderId) return
            setLoading(true)
            setError(null)

            const res = await apiGetOverviewSummary(session.accessToken, { order_id: orderId })

            const data = res?.data || res?.order_details || res || null

            if (data) {
                setOverviewData(data)
                setCartItems(Array.isArray(data?.order_items) ? data.order_items : (Array.isArray(data?.items) ? data.items : []))
                setCartSummary(data?.order_summary || data?.summary || null)
            } else {
                setError('Failed to load order details.')
            }
        } catch (err) {
            console.error('Fetch overview error:', err)
            setError('Failed to load order details. Please try again.')
            toast.push(
                <Notification title="Error!" type="danger">
                    Failed to load order overview
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    const handleProceedToPayment = () => {
        if (!agreedToTerms) {
            toast.push(
                <Notification title="Warning!" type="warning">
                    Please agree to the privacy policy & terms to proceed.
                </Notification>
            )
            return
        }

        setNavigatingToPayment(true)
        router.push(`/payment?orderId=${orderId}`)
    }

    const contactInfo = overviewData?.contact_information || {
        name: overviewData?.customer ? `${overviewData.customer.first_name || ''} ${overviewData.customer.last_name || ''}`.trim() : null,
        email: overviewData?.customer?.email || null,
        phone: overviewData?.customer?.phone || null,
    }

    const deliveryAddr = overviewData?.delivery_address || {
        address_line_1: overviewData?.delivery_address?.address || null,
        address_line_2: null,
        city: null,
        postal_code: null,
        country: 'India',
    }

    const rentalInfo = overviewData?.rental_period || {
        start: overviewData?.rental_start_date || null,
        end: overviewData?.rental_end_date || null,
        duration: overviewData?.rental_days ? `${overviewData.rental_days} day(s)` : null,
    }

    return (
        <section className="w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12 mt-14">
            <div className="py-10">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-xl p-8 max-w-lg mx-auto border border-red-200">
                        <p className="text-red-600 font-medium mb-4">{error}</p>
                        <button
                            onClick={fetchOverviewSummary}
                            className="px-6 py-2 bg-[#8B4513] text-white rounded-md hover:bg-[#71370F] transition"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-6">

                            {/* LEFT — ORDER REVIEW */}
                            <div className="bg-white rounded-xl p-6 shadow-xl space-y-6 border border-gray-100">
                                <h3 className="text-xl font-semibold text-[#8B4513] border-b border-gray-100 pb-3">
                                    Order Review
                                </h3>

                                {/* Contact Information */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[#111827] text-lg font-semibold">
                                        <FiUser className="text-[#8B4513]" />
                                        <span>Contact Information:</span>
                                    </div>
                                    <div className="pl-6 space-y-1">
                                        <p className="text-base text-[#3F3F3F] font-medium">
                                            {contactInfo?.name || '—'}
                                        </p>
                                        <p className="text-base text-[#3F3F3F] font-medium">
                                            {contactInfo?.email || '—'}
                                        </p>
                                        {contactInfo?.phone && (
                                            <p className="text-base text-[#3F3F3F] font-medium">
                                                {contactInfo.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <hr className="border-gray-200" />

                                {/* Delivery Address */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[#111827] text-lg font-semibold">
                                        <FiMapPin className="text-[#8B4513]" />
                                        <span>Delivery Address</span>
                                    </div>
                                    <div className="pl-6 space-y-1">
                                        <p className="text-base text-[#3F3F3F] font-medium">
                                            {deliveryAddr?.address_line_1 || deliveryAddr?.address || '—'}
                                        </p>
                                        {deliveryAddr?.address_line_2 && (
                                            <p className="text-base text-[#3F3F3F] font-medium">
                                                {deliveryAddr.address_line_2}
                                            </p>
                                        )}
                                        <p className="text-base text-[#3F3F3F] font-medium">
                                            {deliveryAddr?.city ? `${deliveryAddr.city}${deliveryAddr?.postal_code ? ` ${deliveryAddr.postal_code}` : ''}` : '—'}
                                        </p>
                                        <p className="text-base text-[#3F3F3F] font-medium">
                                            {deliveryAddr?.country || '—'}
                                        </p>
                                    </div>
                                </div>

                                <hr className="border-gray-200" />

                                {/* Rental Period */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[#111827] text-lg font-semibold">
                                        <FiCalendar className="text-[#8B4513]" />
                                        <span>Rental Period</span>
                                    </div>
                                    <div className="pl-6 space-y-1">
                                        <p className="text-base text-[#3F3F3F] font-medium">
                                            Start: {rentalInfo?.start || '—'}
                                        </p>
                                        <p className="text-base text-[#3F3F3F] font-medium">
                                            Return: {rentalInfo?.end || rentalInfo?.return || '—'}
                                        </p>
                                        <p className="text-base text-[#3F3F3F] font-medium">
                                            Duration: {rentalInfo?.duration || '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT — ORDER ITEMS & SUMMARY (DESIGN MATCHED TO FIGMA) */}
                            <div className="bg-white rounded-xl p-6 shadow-xl space-y-6 border border-gray-100">
                                <h3 className="text-xl font-semibold text-[#111827]">
                                    Order Items
                                </h3>

                                {/* ITEMS LIST */}
                                {cartItems.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-4">No items found in this order</p>
                                ) : (
                                    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                                        {cartItems.map((item, index) => {
                                            const itemName = item?.name || item?.product_name || `Item ${index + 1}`
                                            const itemQty = item?.quantity || 1
                                            const itemPrice = item?.total_price || item?.price || 0
                                            const itemThumb = item?.product_image || item?.thumbnail || item?.image

                                            return (
                                                <div
                                                    key={item.id || index}
                                                    className="flex justify-between items-center border-b border-gray-200 pb-4"
                                                >
                                                    {/* LEFT: Name + Qty and Price */}
                                                    <div className="space-y-1 pr-4">
                                                        <p className="text-base text-[#1E293B] font-medium capitalize">
                                                            {itemName} ({itemQty})
                                                        </p>
                                                        <p className="text-base font-semibold text-[#1E293B]">
                                                            ¥{Number(itemPrice).toLocaleString()}
                                                        </p>
                                                    </div>

                                                    {/* RIGHT: Thumbnail Image */}
                                                    <div className="w-[68px] h-[68px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                                        <Image
                                                            src={itemThumb || '/img/table-form/3d-table.png'}
                                                            alt={itemName}
                                                            fill
                                                            className="w-full h-full object-cover"

                                                            unoptimized
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* ORDER SUMMARY */}
                                {cartSummary && (
                                    <div className="space-y-3 pt-4 border-t border-gray-200">
                                        <h4 className="text-[#111827] text-xl font-semibold mb-4">
                                            Order Summary
                                        </h4>

                                        {cartSummary?.subtotal !== undefined && cartSummary?.subtotal !== null && (
                                            <div className="flex justify-between text-base text-[#374151] font-medium">
                                                <span>Subtotal:</span>
                                                <span>¥{Number(cartSummary.subtotal).toLocaleString()}</span>
                                            </div>
                                        )}

                                        {cartSummary?.shipping !== undefined && cartSummary?.shipping !== null && (
                                            <div className="flex justify-between text-base text-[#374151] font-medium">
                                                <span>Shipping:</span>
                                                <span>¥{Number(cartSummary.shipping).toLocaleString()}</span>
                                            </div>
                                        )}

                                        {cartSummary?.discount !== undefined && cartSummary?.discount !== null && Number(cartSummary.discount) > 0 && (
                                            <div className="flex justify-between text-base text-green-600 font-medium">
                                                <span>Discount:</span>
                                                <span>-¥{Number(cartSummary.discount).toLocaleString()}</span>
                                            </div>
                                        )}

                                        {cartSummary?.tax !== undefined && cartSummary?.tax !== null && (
                                            <div className="flex justify-between text-base text-[#374151] font-medium">
                                                <span>Tax:</span>
                                                <span>¥{Number(cartSummary.tax).toLocaleString()}</span>
                                            </div>
                                        )}

                                        {(cartSummary?.total !== undefined || cartSummary?.grand_total !== undefined) && (
                                            <div className="flex justify-between text-lg font-semibold text-[#111827] pt-2 border-t border-gray-100">
                                                <span>Total:</span>
                                                <span>¥{Number(cartSummary?.total ?? cartSummary?.grand_total ?? 0).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* TERMS CHECKBOX */}
                                <div className="pt-2">
                                    <label className="flex items-center gap-2 text-base text-[#374151] cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={agreedToTerms}
                                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                                            className="w-4 h-4 accent-[#8B4513] cursor-pointer rounded"
                                        />
                                        <span>
                                            I Agree to privacy{' '}
                                            <span className="text-[#8B4513] underline font-medium">
                                                policy & terms
                                            </span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER BUTTONS */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-6 mt-8">
                            <div></div>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
                                <button
                                    className="w-full px-6 py-3 bg-[#8B4513] hover:bg-[#71370F] text-white rounded-md transition font-medium"
                                    onClick={() => router.push(`/delivery-information/${overviewData?.cart_id || overviewData?.cart || 1}`)}
                                    disabled={navigatingToPayment}
                                >
                                    Edit Delivery
                                </button>
                                <button
                                    className="w-full px-6 py-3 bg-[#8B4513] hover:bg-[#71370F] text-white rounded-md flex items-center justify-center gap-2 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                                    onClick={handleProceedToPayment}
                                    disabled={navigatingToPayment}
                                >
                                    {navigatingToPayment ? <Spinner size={18} customColorClass="text-white" /> : null}
                                    {navigatingToPayment ? 'Redirecting...' : 'Proceed to Payment'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}

export default Overview
