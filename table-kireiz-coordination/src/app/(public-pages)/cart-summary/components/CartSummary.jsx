import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { FiShoppingCart, FiTrash2 } from "react-icons/fi"
import { FaPlus } from "react-icons/fa6"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
    apiGetCartList,
    apiGetCartSummary,
    apiUpdateItemQuantity,
    apiDeleteItem,
} from "@/services/CartSummaryService"

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

    /* ---------------- DEBOUNCED API HANDLER ---------------- */
    const syncItemWithServer = (itemId, quantity) => {
        if (debounceTimers.current[itemId]) {
            clearTimeout(debounceTimers.current[itemId])
        }

        debounceTimers.current[itemId] = setTimeout(async () => {
            try {
                setUpdatingItemId(itemId)

                if (quantity > 0) {
                    await apiUpdateItemQuantity(session.accessToken, itemId, quantity)
                } else {
                    await apiDeleteItem(session.accessToken, itemId)
                }

                await fetchCartList()
                await fetchCartSummary()
            } finally {
                setUpdatingItemId(null)
            }
        }, 200)
    }

    /* ---------------- UI HANDLERS ---------------- */
    const increaseQty = (index) => {
        setCartItems((prev) => {
            const updated = [...prev]
            const item = updated[index]
            const newQty = item.quantity + 1
            updated[index] = { ...item, quantity: newQty }
            syncItemWithServer(item.id, newQty)
            return updated
        })
    }

    const decreaseQty = (index) => {
        setCartItems((prev) => {
            const updated = [...prev]
            const item = updated[index]
            const newQty = item.quantity - 1

            if (newQty <= 0) {
                syncItemWithServer(item.id, 0)
                return updated.filter((_, i) => i !== index)
            }

            updated[index] = { ...item, quantity: newQty }
            syncItemWithServer(item.id, newQty)
            return updated
        })
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

                        {!cartLoading && cartItems.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <FiShoppingCart size={64} className="text-gray-400 mb-4" />
                                <p className="text-gray-600">Your cart is empty</p>
                            </div>
                        )}

                        {cartItems.map((item, i) => (
                            <div key={item.id} className="flex gap-4 bg-white rounded-lg p-4 mb-4">
                                <div className="relative w-40 h-28 rounded-md overflow-hidden">
                                    <Image
                                        src={`http://54.81.43.26${item.product?.ProductImage}`}
                                        alt={item.product?.productName}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>

                                <div className="flex-1 space-y-1">
                                    <h4 className="font-medium capitalize">{item.product?.productName}</h4>
                                    <p className="text-sm">¥{item.price} × {item.quantity}</p>
                                </div>

                                <div className="flex items-center">
                                    <div className="flex items-center justify-between border rounded-full px-3 py-1 w-24">
                                        <FiTrash2
                                            size={16}
                                            className="cursor-pointer"
                                            onClick={() => decreaseQty(i)}
                                        />

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
                        ))}
                    </div>

                    {/* RIGHT SUMMARY */}
                    {!summaryLoading && !cartSummary && (
                        <div className="bg-white rounded-xl p-6 text-center text-gray-500">
                            Order summary is empty
                        </div>
                    )}

                    {cartSummary && (
                        <div className="bg-white rounded-xl p-5 h-fit">
                            <h3 className="text-xl font-medium border-b pb-4">
                                Order Summary
                            </h3>

                            <div className="space-y-3 text-sm py-3">
                                <p className="font-medium text-[#8B4513]">
                                    Items ({cartSummary.items_count})
                                </p>

                                {cartSummary.items.map((item, i) => (
                                    <div key={i} className="flex justify-between">
                                        <div>
                                            <p className="capitalize">{item.name}</p>
                                            <p className="text-gray-500 text-sm">
                                                Qty: {item.quantity}
                                            </p>
                                        </div>

                                        <span>¥{item.total}</span>
                                    </div>
                                ))}

                                <hr />

                                <div className="flex justify-between font-semibold">
                                    <span className="text-[#8B4513]">Order Total</span>
                                    <span>¥{cartSummary.total_amount}</span>
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
