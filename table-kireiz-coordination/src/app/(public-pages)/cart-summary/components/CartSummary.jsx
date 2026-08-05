"use client";

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { FiShoppingCart, FiTrash2 } from "react-icons/fi"
import { FaPlus, FaMinus } from "react-icons/fa6"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
    apiGetCartList,
    apiGetCartSummary,
    apiUpdateItemQuantity,
    apiDeleteItem,
} from "@/services/CartSummaryService"
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'

/**
 * CartSummary Component
 * 
 * Manages active user cart items, quantity adjustments, item deletions,
 * and order price breakdown calculations with checkout navigation.
 */
const CartSummary = () => {
    const { data: session } = useSession()
    const router = useRouter()
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(100)

    /* Cart Items State */
    const [cartItems, setCartItems] = useState([])
    const [cartLoading, setCartLoading] = useState(false)
    const [cartError, setCartError] = useState(null)

    /* Cart Summary Totals State */
    const [cartSummary, setCartSummary] = useState(null)
    const [summaryLoading, setSummaryLoading] = useState(false)
    const [summaryError, setSummaryError] = useState(null)
    const [cartId, setCartId] = useState(null)

    /* Item Update States */
    const [updatingItemId, setUpdatingItemId] = useState(null)

    /**
     * Fetches current user cart items list from the CartSummary API.
     */
    const fetchCartList = async () => {
        try {
            if (!session?.accessToken) return
            setCartLoading(true)
            const params = {
                page: currentPage,
                page_size: pageSize,
            }
            const res = await apiGetCartList(session.accessToken, params)
            setCartItems(Array.isArray(res?.results) ? res.results : [])
            if (res?.results?.length > 0) {
                setCartId(res.results[0]?.cart?.id)
            }
        } catch {
            setCartError("Failed to load cart items")
        } finally {
            setCartLoading(false)
        }
    }

    /**
     * Fetches current order summary details (subtotal, shipping, tax, grand total).
     * 
     * @param {boolean} [isSilent=false] - If true, suppresses the main summary loading spinner.
     */
    const fetchCartSummary = async (isSilent = false) => {
        try {
            if (!session?.accessToken) return
            if (!isSilent) setSummaryLoading(true)
            const res = await apiGetCartSummary(session.accessToken)
            setCartSummary(res?.items_count > 0 ? res : null)
        } catch {
            setSummaryError("Failed to load order summary")
        } finally {
            if (!isSilent) setSummaryLoading(false)
        }
    }

    /**
     * Updates item quantity or removes item if quantity reaches 0.
     * 
     * @param {string|number} itemId - ID of the cart item.
     * @param {number} qty - Quantity delta (+1, -1) or 0 for deletion.
     */
    const updateItemQuantity = async (itemId, qty) => {
        try {
            setUpdatingItemId(String(itemId))
            if (qty === -1 || qty === 1) {
                await apiUpdateItemQuantity(session.accessToken, itemId, qty)
                toast.push(<Notification title="Success!" type="success">Quantity updated successfully</Notification>);
            } else {
                await apiDeleteItem(session.accessToken, itemId)
                toast.push(<Notification title="Success!" type="success">Item removed from cart</Notification>);
            }
            await fetchCartList()
            await fetchCartSummary(true)
        } catch (error) {
            console.error("Failed to update item quantity", error)
            toast.push(<Notification title="Error!" type="danger">Failed to update cart</Notification>);
        } finally {
            setUpdatingItemId(null)
        }
    }

    /**
     * Increases the quantity of a cart item by 1.
     * 
     * @param {number} index - Index of the item in the cartItems array.
     */
    const increaseQty = (index) => {
        const item = cartItems[index]
        if (!item || updatingItemId || summaryLoading) return;
        updateItemQuantity(item.id, 1)
    }

    /**
     * Decreases the quantity of a cart item or removes it if current quantity is 1.
     * 
     * @param {number} index - Index of the item in the cartItems array.
     */
    const decreaseQty = (index) => {
        const item = cartItems[index]
        if (!item || updatingItemId || summaryLoading) return;

        if (item.quantity <= 1) {
            updateItemQuantity(item.id, 0)
        } else {
            updateItemQuantity(item.id, -1)
        }
    }

    /**
     * Navigates to the delivery information checkout step.
     */
    const handleProceed = () => {
        const targetCartId = cartId
        router.push(`/delivery-information/${targetCartId}`)
    }

    useEffect(() => {
        if (session?.accessToken) {
            fetchCartList()
            fetchCartSummary()
        }
    }, [session?.accessToken])

    return (
        <section className="w-full bg-white px-5 md:px-8 lg:px-12 mt-14">
            <div className="py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-6">

                    {/* Left Panel: Cart Items List */}
                    <div className="bg-[#FBF4F3] rounded-xl p-5 min-h-[300px] flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-medium mb-6">
                                Items in your Cart ({cartItems.length})
                            </h2>

                            {cartLoading ? (
                                /* Loading Spinner */
                                <div className="flex justify-center items-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
                                </div>
                            ) : cartItems.length === 0 ? (
                                /* Empty Cart View */
                                <div className="flex flex-col items-center justify-center py-20">
                                    <FiShoppingCart size={64} className="text-gray-400 mb-4" />
                                    <p className="text-gray-600">Your cart is empty</p>
                                </div>
                            ) : (
                                /* Cart Item Row List */
                                cartItems.map((item, i) => (
                                    <div key={item.id} className="flex gap-4 bg-white rounded-lg p-4 mb-4">
                                        <div className="relative w-40 h-28 rounded-md overflow-hidden shrink-0">
                                            <Image
                                                src={item?.product_image}
                                                alt={item?.product_name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>

                                        <div className="flex-1 flex flex-col justify-center py-1">
                                            <h4 className="text-[17px] font-semibold text-gray-800 capitalize mb-1">
                                                {item?.product_name}
                                            </h4>
                                            <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                                                Description: {item?.product_description || "-"}
                                            </p>

                                            <div className="space-y-1 mt-1">
                                                <p className="text-sm text-gray-600">
                                                    Quantity: {item?.quantity}
                                                </p>
                                                <p className="text-sm font-medium">
                                                    <span className="text-green-600">
                                                        Price: ¥{item?.price} × {item?.quantity} = ¥{item?.total_price}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <div className="flex items-center justify-between border rounded-full px-3 py-1 w-24">
                                                {item.quantity > 1 ? (
                                                    <FaMinus
                                                        size={16}
                                                        className={`cursor-pointer ${updatingItemId || summaryLoading ? 'opacity-30 pointer-events-none cursor-not-allowed' : ''}`}
                                                        onClick={() => decreaseQty(i)}
                                                    />
                                                ) : (
                                                    <FiTrash2
                                                        size={16}
                                                        className={`cursor-pointer text-[#B05B3B] ${updatingItemId || summaryLoading ? 'opacity-30 pointer-events-none cursor-not-allowed' : ''}`}
                                                        onClick={() => decreaseQty(i)}
                                                    />
                                                )}

                                                {updatingItemId && String(updatingItemId) === String(item.id) ? (
                                                    <span
                                                        className="inline-block rounded-full border-2 border-gray-300 border-t-[#8B4513] animate-spin"
                                                        style={{ width: 20, height: 20, margin: "2px" }}
                                                    />
                                                ) : (
                                                    <span>{item.quantity}</span>
                                                )}

                                                <FaPlus
                                                    size={16}
                                                    className={`cursor-pointer ${updatingItemId || summaryLoading ? 'opacity-30 pointer-events-none cursor-not-allowed' : ''}`}
                                                    onClick={() => increaseQty(i)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Cart Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                            <button
                                type="button"
                                className="px-8 py-3 rounded-md bg-[#8B4513] text-white hover:bg-[#72380f] transition font-medium"
                                onClick={() => router.push("/table-form")}
                            >
                                Continue Shopping
                            </button>

                            {cartItems.length > 0 && (
                                <button
                                    type="button"
                                    className="px-12 py-3 rounded-md bg-[#8B4513] text-white hover:bg-[#72380f] transition font-medium"
                                    onClick={handleProceed}
                                >
                                    Proceed
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Order Summary Breakdown */}
                    <div className="bg-white rounded-xl p-6 h-fit shadow-sm border border-gray-100">
                        <h3 className="text-[22px] font-medium border-b border-[#E9E9E9] pb-4 mb-4">
                            Order Summary
                        </h3>

                        {summaryLoading && !cartSummary ? (
                            <div className="flex justify-center items-center py-16">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]"></div>
                            </div>
                        ) : !cartSummary ? (
                            <div className="text-center text-gray-500 py-8">
                                Order summary is empty
                            </div>
                        ) : (
                            <div className="space-y-4 text-[15px]">
                                <p className="text-[#B05B3B] font-medium">
                                    Items ({cartSummary?.items_count}):
                                </p>

                                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                                    {cartSummary.items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-start">
                                            <div>
                                                <p className="text-gray-800">{item.product_name}</p>
                                                <p className="text-gray-400 text-sm mt-0.5">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <span className="text-gray-800">¥{item.total_price}</span>
                                        </div>
                                    ))}
                                </div>

                                <hr className="border-[#E9E9E9]-100 my-4" />

                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Subtotal</span>
                                        <span>¥{cartSummary?.summary?.subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Shipping & Handling</span>
                                        <span>¥{cartSummary?.summary?.shipping}</span>
                                    </div>
                                    <div className="flex justify-between text-[#00A859]">
                                        <span>Discount</span>
                                        <span>¥{cartSummary?.summary?.discount}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Tax</span>
                                        <span>¥{cartSummary?.summary?.tax}</span>
                                    </div>
                                    <div className="flex justify-between text-[#B05B3B]">
                                        <span>Fees:</span>
                                        <span>¥{cartSummary?.summary?.fees}</span>
                                    </div>
                                </div>

                                <div className="border-t border-[#E9E9E9] mt-4 pt-4">
                                    <div className="flex justify-between items-center text-[17px]">
                                        <span className="text-[#B05B3B]">Order Total:</span>
                                        <span className="font-semibold text-gray-900">¥{cartSummary?.summary?.grand_total}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CartSummary

