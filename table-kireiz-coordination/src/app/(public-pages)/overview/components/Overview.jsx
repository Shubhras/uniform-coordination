// 'use client'
// import React, { useEffect, useState } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { useSession } from 'next-auth/react'
// import { apiGetOverviewSummary } from '@/services/createOrder'

// const Overview = () => {
//     const { data: session } = useSession()
//     const router = useRouter()
//     const searchParams = useSearchParams()
//     const orderId = searchParams.get('orderId')

//     /* ---------------- CART LIST ---------------- */
//     const [cartItems, setCartItems] = useState([])
//     const [cartLoading, setCartLoading] = useState(false)
//     const [cartError, setCartError] = useState(null)


//     /* ---------------- CART SUMMARY ---------------- */
//     const [cartSummary, setCartSummary] = useState(null)
//     const [summaryLoading, setSummaryLoading] = useState(false)
//     const [summaryError, setSummaryError] = useState(null)

//     const [overviewData, setOverviewData] = useState(null)
//     const [overviewLoading, setOverviewLoading] = useState(false)
//     const [overviewError, setOverviewError] = useState(null)

//     const fetchOverviewSummary = async () => {
//         try {
//             if (!session?.accessToken || !orderId) return

//             setOverviewLoading(true)
//             setCartLoading(true)
//             setSummaryLoading(true)

//             setOverviewError(null)
//             setCartError(null)
//             setSummaryError(null)

//             const res = await apiGetOverviewSummary(
//                 session.accessToken,
//                 { order_id: orderId }
//             )

//             const data = res?.data?.data || null

//             setOverviewData(data)
//             setCartItems(Array.isArray(data?.order_items) ? data.order_items : [])
//             setCartSummary(data?.order_summary || null)

//         } catch {
//             setOverviewError('Failed to load order details')
//             setCartError('Failed to load cart items')
//             setSummaryError('Failed to load order summary')

//             setOverviewData(null)
//             setCartItems([])
//             setCartSummary(null)
//         } finally {
//             setOverviewLoading(false)
//             setCartLoading(false)
//             setSummaryLoading(false)
//         }
//     }


//     const handleProceedToPayment = () => {
//         router.push(`/payment?orderId=${orderId}`)
//     }

//     useEffect(() => {
//         if (session?.accessToken) {
//             fetchOverviewSummary()
//         }
//     }, [session?.accessToken, orderId])


//     return (
//         <>
//             <section className="w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12 mt-14">
//                 <div className="py-10">
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

//                         {/* LEFT — ORDER REVIEW */}
//                         <div className="bg-white rounded-xl p-6 shadow-xl space-y-6">
//                             <h3 className="text-[#8B4513] font-medium">
//                                 Order Review
//                             </h3>

//                             {overviewLoading && (
//                                 <p className="text-sm text-gray-500">Loading order details...</p>
//                             )}

//                             {!overviewLoading && overviewError && (
//                                 <p className="text-sm text-red-500">{overviewError}</p>
//                             )}

//                             {!overviewLoading && overviewData && (
//                                 <>
//                                     {/* Contact Information */}
//                                     <div className="space-y-1">
//                                         <p className=" text-[#111827] text-lg font-semibold">
//                                             Contact Information:
//                                         </p>
//                                         <p className="text-base text-[#3F3F3F] font-medium">
//                                             {overviewData?.contact_information?.name || '—'}
//                                         </p>
//                                         <p className="text-base text-[#3F3F3F] font-medium">
//                                             {overviewData?.contact_information?.email || '—'}
//                                         </p>
//                                     </div>

//                                     <hr />

//                                     {/* Delivery Address */}
//                                     <div className="space-y-1">
//                                         <p className="text-[#111827] text-lg font-semibold">
//                                             Delivery Address
//                                         </p>
//                                         <p className="text-base text-[#3F3F3F] font-medium">
//                                             {overviewData?.delivery_address?.address || '—'}
//                                         </p>
//                                         <p className="text-base text-[#3F3F3F] font-medium">
//                                             {overviewData?.delivery_address
//                                                 ? `${overviewData.delivery_address.city} ${overviewData.delivery_address.postal_code}`
//                                                 : '—'}
//                                         </p>
//                                         <p className="text-base text-[#3F3F3F] font-medium">
//                                             {overviewData?.delivery_address?.country || '—'}
//                                         </p>
//                                     </div>

//                                     <hr />

//                                     {/* Rental Period */}
//                                     <div className="space-y-1">
//                                         <p className="text-[#111827] text-lg font-semibold">
//                                             Rental Period
//                                         </p>
//                                         <p className="text-base text-[#3F3F3F] font-medium">
//                                             Start: {overviewData?.rental_period?.start || '—'}
//                                         </p>
//                                         <p className="text-base text-[#3F3F3F] font-medium">
//                                             Return: {overviewData?.rental_period?.return || '—'}
//                                         </p>
//                                         <p className="text-base text-[#3F3F3F] font-medium">
//                                             Duration: {overviewData?.rental_period?.duration || '—'}
//                                         </p>
//                                     </div>

//                                     <hr />
//                                 </>
//                             )}

//                             {!overviewLoading && !overviewError && !overviewData && (
//                                 <p className="text-sm text-gray-500">
//                                     No order details available
//                                 </p>
//                             )}
//                         </div>


//                         {/* RIGHT — ORDER ITEMS */}
//                         <div className="bg-white rounded-xl p-6 shadow-xl space-y-6">
//                             <h3 className="text-[#111827] text-lg font-semibold">
//                                 Order Items
//                             </h3>

//                             {/* LOADING */}
//                             {cartLoading && (
//                                 <p className="text-sm text-gray-500">
//                                     Loading cart items...
//                                 </p>
//                             )}

//                             {/* ERROR */}
//                             {!cartLoading && cartError && (
//                                 <p className="text-sm text-red-500">
//                                     {cartError}
//                                 </p>
//                             )}

//                             {/* EMPTY */}
//                             {!cartLoading && !cartError && cartItems.length === 0 && (
//                                 <p className="text-sm text-gray-500">
//                                     No items in your cart
//                                 </p>
//                             )}

//                             {/* ITEMS */}
//                             {!cartLoading && !cartError &&
//                                 cartItems.map((item, index) => (
//                                     <div key={index} className="flex justify-between items-center border-b border-[#CFCFCFAD] pb-4">
//                                         <div>
//                                             <p className="text-base text-[#3F3F3F] font-medium capitalize">
//                                                 {item.name} ({item.quantity})
//                                             </p>
//                                             <p className="text-base text-[#3F3F3F] font-medium">
//                                                 ¥{Number(item.total_price).toLocaleString()}
//                                             </p>
//                                         </div>

//                                         <img
//                                             src={`http://54.81.43.26${item.thumbnail}`}
//                                             alt={item.name}
//                                             className="w-15 h-15 rounded-sm object-cover"
//                                         />
//                                     </div>
//                                 ))
//                             }

//                             {/* SUMMARY */}
//                             {summaryLoading && (
//                                 <p className="text-sm text-gray-500">
//                                     Loading order summary...
//                                 </p>
//                             )}

//                             {!summaryLoading && summaryError && (
//                                 <p className="text-sm text-red-500">
//                                     {summaryError}
//                                 </p>
//                             )}

//                             {!summaryLoading && cartSummary && (
//                                 <div className="space-y-2 py-4 border-b border-[#CFCFCFAD]">
//                                     <h4 className="text-[#3F3F3F] text-lg font-semibold">
//                                         Order Summary
//                                     </h4>

//                                     <div className="flex justify-between text-base">
//                                         <span>Subtotal:</span>
//                                         <span>
//                                             ¥{cartSummary?.subtotal?.toLocaleString()}
//                                         </span>
//                                     </div>

//                                     {/* <div className="flex justify-between text-base">
//                                         <span>Shipping:</span>
//                                         <span>
//                                             {cartSummary.shipping
//                                                 ? `¥${cartSummary.shipping}`
//                                                 : '—'}
//                                         </span>
//                                     </div>

//                                     <div className="flex justify-between text-base">
//                                         <span>Tax:</span>
//                                         <span>
//                                             {cartSummary.tax
//                                                 ? `¥${cartSummary.tax}`
//                                                 : '—'}
//                                         </span>
//                                     </div> */}
//                                     <div className="flex justify-between text-base">
//                                         <span>Tax:</span>
//                                         <span>
//                                             ¥{cartSummary?.discount?.toLocaleString()}
//                                         </span>
//                                     </div>

//                                     <div className="flex justify-between text-base font-semibold pt-2">
//                                         <span>Total:</span>
//                                         <span>
//                                             ¥{cartSummary?.total?.toLocaleString()}
//                                         </span>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* TERMS */}
//                             <label className="flex items-center gap-2 text-base text-[#374151] pt-4">
//                                 <input type="checkbox" />
//                                 <span>
//                                     I Agree to privacy{' '}
//                                     <span className="text-[#8B4513] underline">
//                                         policy & terms
//                                     </span>
//                                 </span>
//                             </label>
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-4">
//                         <div></div>
//                         <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-10 w-full">
//                             <button
//                                 className="w-full px-6 py-3 bg-[#8B4513] text-white rounded-md"
//                                 onClick={() => router.back()}
//                             >
//                                 Edit Delivery
//                             </button>
//                             <button
//                                 className="w-full px-6 py-3 bg-[#8B4513] text-white rounded-md"
//                                 onClick={handleProceedToPayment}
//                             >
//                                 Proceed to Payment
//                             </button>
//                             {/* <button
//                                 className="w-full px-6 py-3 bg-[#8B4513] text-white rounded-md"
//                                 onClick={() => setDialogCancelPopupOpen(true)}
//                             >
//                                 Payment Cancel
//                             </button> */}
//                         </div>
//                     </div>
//                 </div>
//             </section>
//         </>
//     )
// }

// export default Overview

'use client'
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiGetOverviewSummary } from '@/services/createOrder'

const Overview = () => {
    const { data: session } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId')

    /* ---------------- CART LIST ---------------- */
    const [cartItems, setCartItems] = useState([])
    const [cartLoading, setCartLoading] = useState(false)
    const [cartError, setCartError] = useState(null)

    /* ---------------- CART SUMMARY ---------------- */
    const [cartSummary, setCartSummary] = useState(null)
    const [summaryLoading, setSummaryLoading] = useState(false)
    const [summaryError, setSummaryError] = useState(null)

    /* ---------------- OVERVIEW ---------------- */
    const [overviewData, setOverviewData] = useState(null)
    const [overviewLoading, setOverviewLoading] = useState(false)
    const [overviewError, setOverviewError] = useState(null)

    const fetchOverviewSummary = async () => {
        try {
            if (!session?.accessToken || !orderId) return

            setOverviewLoading(true)
            setCartLoading(true)
            setSummaryLoading(true)

            setOverviewError(null)
            setCartError(null)
            setSummaryError(null)

            const res = await apiGetOverviewSummary(
                session.accessToken,
                { order_id: orderId }
            )

            const data = res?.data || null

            setOverviewData(data)
            setCartItems(Array.isArray(data?.order_items) ? data.order_items : [])
            setCartSummary(data?.order_summary || null)

        } catch (err) {
            setOverviewError('Failed to load order details')
            setCartError('Failed to load cart items')
            setSummaryError('Failed to load order summary')

            setOverviewData(null)
            setCartItems([])
            setCartSummary(null)
        } finally {
            setOverviewLoading(false)
            setCartLoading(false)
            setSummaryLoading(false)
        }
    }

    const handleProceedToPayment = () => {
        router.push(`/payment?orderId=${orderId}`)
    }

    useEffect(() => {
        if (session?.accessToken && orderId) {
            fetchOverviewSummary()
        }
    }, [session?.accessToken, orderId])

    return (
        <>
            <section className="w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12 mt-14">
                <div className="py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* LEFT — ORDER REVIEW */}
                        <div className="bg-white rounded-xl p-6 shadow-xl space-y-6">
                            <h3 className="text-[#8B4513] font-medium">
                                Order Review
                            </h3>

                            {overviewLoading && (
                                <p className="text-sm text-gray-500">
                                    Loading order details...
                                </p>
                            )}

                            {!overviewLoading && overviewError && (
                                <p className="text-sm text-red-500">
                                    {overviewError}
                                </p>
                            )}

                            {!overviewLoading && overviewData && (
                                <>
                                    {/* Contact Information */}
                                    <div className="space-y-1">
                                        <p className="text-[#111827] text-lg font-semibold">
                                            Contact Information:
                                        </p>
                                        <p className="text-base text-[#3F3F3F] font-medium">
                                            {overviewData?.contact_information?.name || '—'}
                                        </p>
                                        <p className="text-base text-[#3F3F3F] font-medium">
                                            {overviewData?.contact_information?.email || '—'}
                                        </p>
                                    </div>

                                    <hr />

                                    {/* Delivery Address */}
                                    <div className="space-y-1">
                                        <p className="text-[#111827] text-lg font-semibold">
                                            Delivery Address
                                        </p>
                                        <p className="text-base text-[#3F3F3F] font-medium">
                                            {overviewData?.delivery_address?.address || '—'}
                                        </p>
                                    </div>

                                    <hr />

                                    {/* Rental Period */}
                                    <div className="space-y-1">
                                        <p className="text-[#111827] text-lg font-semibold">
                                            Rental Period
                                        </p>
                                        <p className="text-base text-[#3F3F3F] font-medium">
                                            Start: {overviewData?.rental_period?.start || '—'}
                                        </p>
                                        <p className="text-base text-[#3F3F3F] font-medium">
                                            Return: {overviewData?.rental_period?.return || '—'}
                                        </p>
                                        <p className="text-base text-[#3F3F3F] font-medium">
                                            Duration: {overviewData?.rental_period?.duration || '—'}
                                        </p>
                                    </div>

                                    <hr />
                                </>
                            )}

                            {!overviewLoading && !overviewError && !overviewData && (
                                <p className="text-sm text-gray-500">
                                    No order details available
                                </p>
                            )}
                        </div>

                        {/* RIGHT — ORDER ITEMS */}
                        <div className="bg-white rounded-xl p-6 shadow-xl space-y-6">
                            <h3 className="text-[#111827] text-lg font-semibold">
                                Order Items
                            </h3>

                            {cartLoading && (
                                <p className="text-sm text-gray-500">
                                    Loading cart items...
                                </p>
                            )}

                            {!cartLoading && cartError && (
                                <p className="text-sm text-red-500">
                                    {cartError}
                                </p>
                            )}

                            {!cartLoading && !cartError && overviewData && cartItems.length === 0 && (
                                <p className="text-sm text-gray-500">
                                    No items in your cart
                                </p>
                            )}

                            {!cartLoading && !cartError &&
                                cartItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center border-b border-[#CFCFCFAD] pb-4"
                                    >
                                        <div>
                                            <p className="text-base text-[#3F3F3F] font-medium capitalize">
                                                {item.name} ({item.quantity})
                                            </p>
                                            <p className="text-base text-[#3F3F3F] font-medium">
                                                ¥{Number(item.total_price).toLocaleString()}
                                            </p>
                                        </div>

                                        <img
                                            src={`http://54.81.43.26${item.thumbnail}`}
                                            alt={item.name}
                                            className="w-15 h-15 rounded-sm object-cover"
                                        />
                                    </div>
                                ))
                            }

                            {summaryLoading && (
                                <p className="text-sm text-gray-500">
                                    Loading order summary...
                                </p>
                            )}

                            {!summaryLoading && summaryError && (
                                <p className="text-sm text-red-500">
                                    {summaryError}
                                </p>
                            )}

                            {!summaryLoading && cartSummary && (
                                <div className="space-y-2 py-4 border-b border-[#CFCFCFAD]">
                                    <h4 className="text-[#3F3F3F] text-lg font-semibold">
                                        Order Summary
                                    </h4>

                                    <div className="flex justify-between text-base">
                                        <span>Subtotal:</span>
                                        <span>
                                            ¥{cartSummary.subtotal?.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-base">
                                        <span>Tax:</span>
                                        <span>
                                            ¥{cartSummary.discount?.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-base font-semibold pt-2">
                                        <span>Total:</span>
                                        <span>
                                            ¥{cartSummary.total?.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <label className="flex items-center gap-2 text-base text-[#374151] pt-4">
                                <input type="checkbox" />
                                <span>
                                    I Agree to privacy{' '}
                                    <span className="text-[#8B4513] underline">
                                        policy & terms
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-4">
                        <div></div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-10 w-full">
                            <button
                                className="w-full px-6 py-3 bg-[#8B4513] text-white rounded-md"
                                onClick={() => router.back()}
                            >
                                Edit Delivery
                            </button>
                            <button
                                className="w-full px-6 py-3 bg-[#8B4513] text-white rounded-md"
                                onClick={handleProceedToPayment}
                            >
                                Proceed to Payment
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Overview

