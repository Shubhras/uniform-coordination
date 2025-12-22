import React from "react"
import Image from "next/image"
import { FiTrash2 } from "react-icons/fi"
import { CgFileAdd } from "react-icons/cg"
import { GoPlus } from "react-icons/go"
import { FaPlus } from "react-icons/fa6"
import { useRouter } from 'next/navigation'

const CartSummary = () => {

    const router = useRouter()

const handleClick = () => {
        router.push("/delivery-information");
    };
    return (
        <section className="w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12 mt-14">
            <div className="py-10">

                <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-8">

                    {/* LEFT – CART ITEMS */}
                    <div className="bg-[#FBF4F3] rounded-xl p-6">
                        <h2 className="text-xl font-medium mb-6">
                            Items in your Cart (4)
                        </h2>

                        {/* ITEM */}
                        {[
                            {
                                img: "/img/table-form/cart/cart1.jpg",
                                title: "Tablecloth - Orange Lines",
                            },
                            {
                                img: "/img/table-form/cart/cart2.jpg",
                                title: "Napkins - Yellow Cotton",
                            },
                            {
                                img: "/img/table-form/cart/cart3.jpg",
                                title: "Chair Covers - White (x12)",
                            },
                            {
                                img: "/img/table-form/cart/cart4.jpg",
                                title: "Centrepiece - Citrus Arrangement",
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex gap-4 bg-white rounded-lg p-4 mb-4"
                            >
                                {/* IMAGE */}
                                <div className="relative w-40 h-28 rounded-md overflow-hidden">
                                    <Image
                                        src={item.img}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* DETAILS */}
                                <div className="flex-1 space-y-1">
                                    <h4 className="font-medium text-base">{item.title}</h4>
                                    <p className="text-sm text-[#572E1B]">Description</p>
                                    <p className="text-sm ">Quantity: 1</p>
                                    <p className="text-sm text-[#16A34A]">
                                        Price : ¥4,000 × 2 = ¥8,000
                                    </p>
                                </div>

                                {/* ACTIONS */}
                                <div className="flex items-center gap-2">
                                    {/* <button className="border rounded-full p-2">
                  </button> */}
                                    <div className="flex items-center justify-between border rounded-full px-3 py-1 md:min-w-30 w-24">
                                        <FiTrash2 size={16} />
                                        <span className="px-3">1</span>
                                        <FaPlus size={16} />
                                        {/* <button>+</button> */}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* ACTION BUTTONS */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                            <button className="px-8 py-3 rounded-md bg-[#8B4513] text-white min-w-xs">
                                Continue Shopping
                            </button>
                            <button className="px-12 py-3 rounded-md bg-[#8B4513] text-white min-w-xs" onClick={handleClick}>
                                Proceed
                            </button>
                        </div>
                    </div>

                    {/* RIGHT – ORDER SUMMARY */}
                    <div className="bg-white rounded-xl p-6 h-fit">
                        <h3 className="text-xl font-medium border-b border-[#E9E9E9] pb-4">Order Summary</h3>

                        <div className="space-y-3 text-sm py-2">
                            <p className="font-medium text-[#8B4513]">Items (4):</p>

                            <div className="flex justify-between">
                                <div>
                                    <p className="text-[#000000]">Tablecloth - Orange Lines</p>
                                    <p className="text-[#6B7280] text-sm">2 days</p>
                                </div>
                                <span className="text-[#000000]">¥45.00</span>
                            </div>

                            <div className="flex justify-between">
                                <div>
                                    <p className="text-[#000000]">Napkins - Yellow Cotton</p>
                                    <p className="text-[#6B7280] text-sm">2 days</p>
                                </div>
                                <span className="text-[#000000]">¥50.00</span>
                            </div>

                            <div className="flex justify-between">
                                <div>
                                    <p className="text-[#000000]">Chair Covers - White (x12)</p>
                                    <p className="text-[#6B7280] text-sm">2 days</p>
                                </div>
                                <span className="text-[#000000]">¥25.00</span>
                            </div>

                            <div className="flex justify-between">
                                <div>
                                    <p className="text-[#000000]">Centrepiece - Citrus Arrangement</p>
                                    <p className="text-[#6B7280] text-sm">2 days</p>
                                </div>
                                <span className="text-[#000000]">¥75.00</span>
                            </div>

                            <hr className="my-3" />

                            <div className="flex justify-between text-[#000000]" >
                                <span >Shipping & Handling</span>
                                <span>¥50.00</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>Discount (SPRING10)</span>
                                <span>-¥25.00</span>
                            </div>
                            <div className="flex justify-between text-[#000000]" >
                                <span >Tax</span>
                                <span>¥75.00</span>
                            </div>
                            <div className="flex justify-between text-[#8B4513]">
                                <span>Fees</span>
                                <span>¥75.00</span>
                            </div>

                            <div className="flex justify-between text-sm border border-[#E9E9E9] p-2 ">
                                <span className="text-[#8B4513]">Order Total:</span>
                                <span className="text-black font-semibold">¥29,784</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default CartSummary
