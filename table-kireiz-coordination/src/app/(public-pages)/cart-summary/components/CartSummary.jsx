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

const CartSummary = () => {
    const { data: session } = useSession()
    const router = useRouter()

    /* ---------------- CART LIST ---------------- */
    const [cartItems, setCartItems] = useState([])
    const [cartLoading, setCartLoading] = useState(false)
    const [cartError, setCartError] = useState(null)

    /* ---------------- CART SUMMARY ---------------- */
    const [cartSummary, setCartSummary] = useState(null)
    const [summaryLoading, setSummaryLoading] = useState(false)
    const [summaryError, setSummaryError] = useState(null)

    /* ---------------- UPDATE STATES ---------------- */
    const [updatingItemId, setUpdatingItemId] = useState(null)
    const debounceTimers = useRef({})

    /* ---------------- FETCH CART LIST ---------------- */
    const fetchCartList = async () => {
        try {
            if (!session?.accessToken) return
            setCartLoading(true)
            const res = await apiGetCartList(session.accessToken)
            setCartItems(Array.isArray(res?.data) ? res.data : [])
        } catch {
            setCartError("Failed to load cart items")
        } finally {
            setCartLoading(false)
        }
    }

    /* ---------------- FETCH CART SUMMARY ---------------- */
    const fetchCartSummary = async () => {
        try {
            if (!session?.accessToken) return
            setSummaryLoading(true)
            const res = await apiGetCartSummary(session.accessToken)
            setCartSummary(res?.items_count > 0 ? res : null)
        } catch {
            setSummaryError("Failed to load order summary")
        } finally {
            setSummaryLoading(false)
        }
    }

    /* ---------------- API HANDLER ---------------- */
    const updateItemQuantity = async (itemId, qty) => {
        try {
            setUpdatingItemId(itemId)
            if (qty === -1 || qty === 1) {
                console.log("itemId", itemId, qty)
                await apiUpdateItemQuantity(session.accessToken, itemId, qty)
                toast.push(<Notification title="Success!" type="success">Quantity updated successfully</Notification>);
            } else {
                await apiDeleteItem(session.accessToken, itemId)
                toast.push(<Notification title="Success!" type="success">Item removed from cart</Notification>);
            }
            await fetchCartList()
            await fetchCartSummary()
        } catch (error) {
            console.error("Failed to update item quantity", error)
            toast.push(<Notification title="Error!" type="danger">Failed to update cart</Notification>);
        } finally {
            setUpdatingItemId(null)
        }
    }

    /* ---------------- UI HANDLERS ---------------- */
    const increaseQty = (index) => {
        const item = cartItems[index]
        if (!item || updatingItemId === item.id) return;

        // const newQty = item.quantity + 1
        // updateItemQuantity(item.id, newQty)

        updateItemQuantity(item.id, 1)
    }

    const decreaseQty = (index) => {
        const item = cartItems[index]
        if (!item || updatingItemId === item.id) return;

        if (item.quantity <= 1) {
            // Send 0 to trigger the delete (else block)
            updateItemQuantity(item.id, 0)
        } else {
            // Send -1 to decrease
            updateItemQuantity(item.id, -1)
        }
    }

    /* ---------------- EFFECT ---------------- */
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

                    {/* LEFT CART */}
                    <div className="bg-[#FBF4F3] rounded-xl p-5 min-h-[300px]">
                        <h2 className="text-xl font-medium mb-6">
                            Items in your Cart ({cartItems.length})
                        </h2>

                        {cartLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0522D]"></div>
                            </div>
                        ) : cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <FiShoppingCart size={64} className="text-gray-400 mb-4" />
                                <p className="text-gray-600">Your cart is empty</p>
                            </div>
                        ) : (
                            cartItems.map((item, i) => (
                                <div key={item.id} className="flex gap-4 bg-white rounded-lg p-4 mb-4">
                                    <div className="relative w-40 h-28 rounded-md overflow-hidden">
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
                                            Descriptio: {item?.product_description || "-"}
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
                                                    className="cursor-pointer"
                                                    onClick={() => decreaseQty(i)}
                                                />
                                            ) : (
                                                <FiTrash2
                                                    size={16}
                                                    className="cursor-pointer text-red-500"
                                                    onClick={() => decreaseQty(i)}
                                                />
                                            )}

                                            {updatingItemId === item.id ? (
                                                <span
                                                    className="inline-block rounded-full border-2 border-gray-300 border-t-[#8B4513] animate-spin"
                                                    style={{ width: 16, height: 16 }}
                                                />) : (
                                                <span>{item.quantity}</span>
                                            )}

                                            <FaPlus
                                                size={16}
                                                className="cursor-pointer"
                                                onClick={() => increaseQty(i)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* RIGHT SUMMARY */}
                    {!summaryLoading && !cartSummary && (
                        <div className="bg-white rounded-xl p-6 text-center text-gray-500">
                            Order summary is empty
                        </div>
                    )}

                    {cartSummary && (
                        <div className="bg-white rounded-xl p-6 h-fit shadow-sm border border-gray-100">
                            <h3 className="text-[22px] font-medium border-b border-gray-100 pb-4 mb-4">
                                Order Summary
                            </h3>

                            <div className="space-y-4 text-[15px]">
                                <p className="text-[#B05B3B] font-medium">
                                    Items ({cartSummary?.items_count}):
                                </p>

                                <div className="space-y-4">
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

                                <hr className="border-gray-100 my-4" />

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

                                <div className="border-t border-gray-100 mt-4 pt-4">
                                    <div className="flex justify-between items-center text-[17px]">
                                        <span className="text-[#B05B3B]">Order Total:</span>
                                        <span className="font-semibold text-gray-900">¥{cartSummary?.summary?.grand_total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <button
                            className="px-8 py-3 rounded-md bg-[#8B4513] text-white"
                            onClick={() => router.back()}
                        >
                            Continue Shopping
                        </button>

                        {cartItems.length > 0 && (
                            <button
                                className="px-12 py-3 rounded-md bg-[#8B4513] text-white"
                                onClick={() => router.push("/delivery-information")}
                            >
                                Proceed
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </section >
    )
}

export default CartSummary
