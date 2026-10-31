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
    const [expandedDescriptions, setExpandedDescriptions] = useState({})

    /**
     * Toggles expanded description visibility for a cart item.
     * 
     * @param {string|number} id - Cart item ID.
     */
    const toggleDescription = (id) => {
        setExpandedDescriptions((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

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
            const errorMsg = error?.response?.data?.message || error?.response?.data?.error || error?.response?.data?.detail || "Failed to update cart"
            toast.push(<Notification title="Error!" type="danger">{errorMsg}</Notification>);
        } finally {
            setUpdatingItemId(null)
        }
    }

    /**
     * Increases the quantity of a cart item by 1 if within available quantity limit.
     * 
     * @param {number} index - Index of the item in the cartItems array.
     */
    const increaseQty = (index) => {
        const item = cartItems[index]
        if (!item || updatingItemId || summaryLoading) return;

        if (item.available_quantity !== null && item.available_quantity !== undefined) {
            const availableQty = Number(item.available_quantity)
            if (!isNaN(availableQty)) {
                if (availableQty <= 0) {
                    toast.push(
                        <Notification title="Out of Stock" type="danger">
                            This item is currently out of stock.
                        </Notification>
                    );
                    return;
                }
                if (item.quantity >= availableQty) {
                    toast.push(
                        <Notification title="Stock Limit Reached" type="warning">
                            Only {availableQty} item{availableQty > 1 ? "s" : ""} available in stock.
                        </Notification>
                    );
                    return;
                }
            }
        }

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
        const exceededItem = cartItems.find(
            (item) =>
                item.available_quantity !== null &&
                item.available_quantity !== undefined &&
                item.quantity > Number(item.available_quantity)
        )
        if (exceededItem) {
            toast.push(
                <Notification title="Stock Limit Exceeded" type="danger">
                    Please adjust quantity. &quot;{exceededItem.product_name}&quot; exceeds available stock ({exceededItem.available_quantity}).
                </Notification>
            )
            return
        }

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
        <section className="w-full bg-white px-3 sm:px-6 md:px-8 lg:px-12 mt-8 sm:mt-12 md:mt-14">
            <div className="py-6 sm:py-8 lg:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-6">

                    {/* Left Panel: Cart Items List */}
                    <div className="bg-[#FBF4F3] rounded-xl p-3.5 sm:p-5 md:p-6 min-h-[300px] flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6">
                                Items in your Cart ({cartItems.length})
                            </h2>

                            {cartLoading ? (
                                /* Loading Spinner */
                                <div className="flex justify-center items-center py-12 sm:py-20">
                                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#8B4513]"></div>
                                </div>
                            ) : cartItems.length === 0 ? (
                                /* Empty Cart View */
                                <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                                    <FiShoppingCart size={54} className="text-gray-400 mb-3 sm:mb-4" />
                                    <p className="text-gray-600 text-sm sm:text-base">Your cart is empty</p>
                                </div>
                            ) : (
                                /* Cart Item Row List */
                                cartItems.map((item, i) => {
                                    const isMaxReached =
                                        item?.available_quantity !== null &&
                                        item?.available_quantity !== undefined &&
                                        item?.quantity >= Number(item?.available_quantity);

                                    return (
                                        <div
                                            key={item.id}
                                            className="bg-white rounded-lg p-3 sm:p-4 mb-4 shadow-xs border border-gray-100"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                                {/* Top section on mobile: Image + Item Details */}
                                                <div className="flex gap-3 sm:gap-4 flex-1 min-w-0">
                                                    {/* Product Image */}
                                                    <div className="relative w-24 h-24 sm:w-36 sm:h-28 md:w-40 md:h-28 rounded-md overflow-hidden shrink-0 bg-gray-50 self-start sm:self-center">
                                                        <Image
                                                            src={item?.product_image}
                                                            alt={item?.product_name || "Product image"}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    </div>

                                                    {/* Product Details */}
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                                                        <h4
                                                            className="text-base sm:text-[17px] font-semibold text-gray-800 capitalize mb-1 break-words"
                                                            title={item?.product_name}
                                                        >
                                                            {item?.product_name}
                                                        </h4>

                                                        <div className="mb-2">
                                                            <p
                                                                className={`text-xs sm:text-sm text-gray-500 break-words ${
                                                                    expandedDescriptions[item.id]
                                                                        ? "line-clamp-none max-h-36 overflow-y-auto pr-1 leading-relaxed text-gray-600"
                                                                        : "line-clamp-2"
                                                                }`}
                                                                title={item?.product_description || ""}
                                                            >
                                                                <span className="font-medium text-gray-700">Description:</span>{" "}
                                                                {item?.product_description || "-"}
                                                            </p>
                                                            {item?.product_description && item.product_description.length > 80 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleDescription(item.id)}
                                                                    className="text-xs font-semibold text-[#8B4513] hover:text-[#72380f] hover:underline mt-0.5 inline-block cursor-pointer focus:outline-none"
                                                                >
                                                                    {expandedDescriptions[item.id] ? "Show less" : "Read more"}
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="space-y-1 mt-0.5">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="text-xs sm:text-sm text-gray-600">
                                                                    Quantity: {item?.quantity}
                                                                </p>
                                                                {item?.available_quantity !== null && item?.available_quantity !== undefined && (
                                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                                        Available: {item.available_quantity}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <span className="text-xs text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md font-medium inline-block">
                                                                    Rental Days: 1
                                                                </span>
                                                            </div>
                                                            <p className="text-xs sm:text-sm font-medium">
                                                                <span className="text-green-600">
                                                                    Price: ${item?.price} × {item?.quantity} = ${item?.total_price}
                                                                </span>
                                                            </p>
                                                            {isMaxReached && (
                                                                <p className="text-xs text-amber-600 font-medium">
                                                                    Max available stock reached ({item.available_quantity})
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stepper Controls: Bottom bar on mobile, right-aligned on desktop */}
                                                <div className="flex items-center justify-between sm:justify-end pt-2.5 sm:pt-0 border-t border-gray-100 sm:border-t-0 shrink-0 mt-1 sm:mt-0">
                                                    <div className="sm:hidden flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                        <span>Item Total:</span>
                                                        <span className="text-sm font-bold text-gray-900">${item?.total_price}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between border border-gray-200 rounded-full px-3 py-1 w-24 bg-white shadow-xs">
                                                        {item.quantity > 1 ? (
                                                            <FaMinus
                                                                size={14}
                                                                className={`cursor-pointer hover:text-[#8B4513] transition ${updatingItemId || summaryLoading ? 'opacity-30 pointer-events-none cursor-not-allowed' : ''}`}
                                                                onClick={() => decreaseQty(i)}
                                                            />
                                                        ) : (
                                                            <FiTrash2
                                                                size={15}
                                                                className={`cursor-pointer text-[#B05B3B] hover:text-red-700 transition ${updatingItemId || summaryLoading ? 'opacity-30 pointer-events-none cursor-not-allowed' : ''}`}
                                                                onClick={() => decreaseQty(i)}
                                                            />
                                                        )}

                                                        {updatingItemId && String(updatingItemId) === String(item.id) ? (
                                                            <span
                                                                className="inline-block rounded-full border-2 border-gray-300 border-t-[#8B4513] animate-spin"
                                                                style={{ width: 18, height: 18, margin: "2px" }}
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-medium text-gray-800">{item.quantity}</span>
                                                        )}

                                                        <FaPlus
                                                            size={14}
                                                            className={`${updatingItemId || summaryLoading ? 'opacity-30 pointer-events-none cursor-not-allowed' : isMaxReached ? 'opacity-40 cursor-not-allowed text-gray-400' : 'cursor-pointer hover:text-[#8B4513] transition'}`}
                                                            onClick={() => increaseQty(i)}
                                                            title={isMaxReached ? `Maximum available quantity reached (${item.available_quantity})` : 'Increase quantity'}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Cart Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-6 sm:mt-8">
                            <button
                                type="button"
                                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-md bg-[#8B4513] text-white hover:bg-[#72380f] transition font-medium text-center text-sm sm:text-base cursor-pointer"
                                onClick={() => router.push("/table-form")}
                            >
                                Continue Shopping
                            </button>

                            {cartItems.length > 0 && (
                                <button
                                    type="button"
                                    className="w-full sm:w-auto px-8 sm:px-12 py-2.5 sm:py-3 rounded-md bg-[#8B4513] text-white hover:bg-[#72380f] transition font-medium text-center text-sm sm:text-base cursor-pointer"
                                    onClick={handleProceed}
                                >
                                    Proceed
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Order Summary Breakdown */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 h-fit shadow-sm border border-gray-100">
                        <h3 className="text-lg sm:text-[22px] font-medium border-b border-[#E9E9E9] pb-3 sm:pb-4 mb-4">
                            Order Summary
                        </h3>

                        {summaryLoading && !cartSummary ? (
                            <div className="flex justify-center items-center py-12 sm:py-16">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]"></div>
                            </div>
                        ) : !cartSummary ? (
                            <div className="text-center text-gray-500 py-8">
                                Order summary is empty
                            </div>
                        ) : (
                            <div className="space-y-4 text-sm sm:text-[15px]">
                                <p className="text-[#B05B3B] font-medium">
                                    Items ({cartSummary?.items_count}):
                                </p>

                                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                                    {cartSummary.items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-start gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-gray-800 break-words">{item.product_name}</p>
                                                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <span className="text-gray-800 shrink-0 whitespace-nowrap text-sm sm:text-base">${Number(item.total_price || 0).toLocaleString()} /day</span>
                                        </div>
                                    ))}
                                </div>

                                <hr className="border-[#E9E9E9] my-4" />

                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Subtotal</span>
                                        <span>${Number(cartSummary?.summary?.subtotal || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Shipping & Handling</span>
                                        <span>${Number(cartSummary?.summary?.shipping || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[#00A859]">
                                        <span>Discount</span>
                                        <span>${Number(cartSummary?.summary?.discount || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>
                                            Tax
                                            {cartSummary?.summary?.tax_percentage != null
                                                ? ` (${Number(cartSummary.summary.tax_percentage)}%)`
                                                : cartSummary?.summary?.tax_rate != null
                                                    ? ` (${Number(cartSummary.summary.tax_rate)}%)`
                                                    : ""}
                                        </span>
                                        <span>${Number(cartSummary?.summary?.tax || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="border-t border-[#E9E9E9] mt-4 pt-4">
                                    <div className="flex justify-between items-center text-base sm:text-[17px]">
                                        <span className="text-[#B05B3B]">Order Total:</span>
                                        <span className="font-semibold text-gray-900">${Number(cartSummary?.summary?.grand_total || 0).toLocaleString()}</span>
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

