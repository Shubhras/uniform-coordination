'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

const DeliveryInformation = () => {

    const router = useRouter()

    const handleClick = () => {
        router.push("/overview");
    };
    return (
        <section className="w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12 mt-14">
            <div className="py-10">

                <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-4">

                    {/* LEFT – CUSTOMER DETAILS */}
                    <div className="bg-white rounded-xl p-6 space-y-8 shadow-xl">

                        {/* CUSTOMER DETAILS */}
                        <div>
                            <h3 className="text-lg font-medium text-[#8B4513] mb-4">
                                Customer Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>
                                    <label className="text-sm mb-1 block text-[#374151]">First Name</label>
                                    <input type="text" className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]" />
                                </div>

                                <div>
                                    <label className="text-sm mb-1 block text-[#374151]">Last Name</label>
                                    <input type="text" className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]" />
                                </div>

                                <div>
                                    <label className="text-sm mb-1 block text-[#374151]">Email</label>
                                    <input type="email" className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]" />
                                </div>

                                <div>
                                    <label className="text-sm mb-1 block text-[#374151]">Phone</label>
                                    <input type="number" className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]" />
                                </div>

                            </div>
                        </div>

                        {/* DELIVERY ADDRESS */}
                        <div>
                            <h3 className="text-lg font-medium text-[#8B4513] mb-4">
                                Delivery Address
                            </h3>

                            <div className="space-y-4">

                                <div>
                                    <label className="text-sm mb-1 block text-[#374151]">Address line 1</label>
                                    <input type="text" className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]" />
                                </div>

                                <div>
                                    <label className="text-sm mb-1 block text-[#374151]">Address line 2</label>
                                    <input type="text" className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div>
                                        <label className="text-sm mb-1 block text-[#374151]">City</label>
                                        <select className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]">
                                            <option>City Name</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm mb-1 block text-[#374151]">Postal</label>
                                        <input type="number" className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]" />
                                    </div>

                                </div>

                                <div>
                                    <label className="text-sm mb-1 block text-[#374151]">Country</label>
                                    <select className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]">
                                        <option>India</option>
                                        <option>Australia</option>
                                        <option>Japan</option>
                                    </select>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* RIGHT – RENTAL & PAYMENT */}
                    <div className="bg-white rounded-xl p-6 space-y-6 shadow-xl">

                        {/* RENTAL PERIOD */}
                        <div>
                            <h3 className="text-lg font-medium text-[#8B4513] mb-4">
                                Rental Period
                            </h3>

                            <div className="space-y-4">

                                <div>
                                    <label className="text-sm mb-1 block text-[#374151]">Start Date</label>
                                    <input type="date" className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]" />
                                </div>

                                <div>
                                    <label className="text-sm mb-1 block text-[#374151]">Return Date</label>
                                    <input type="date" className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]" />
                                </div>

                                <p className="text-sm text-gray-600">
                                    Rental Duration: 3 days (calculated automatically)
                                </p>
                            </div>
                        </div>

                        {/* COUPON */}
                        <div>
                            <label className="text-sm mb-1 block text-[#374151]">Coupon Code</label>
                            <div className="flex items-center gap-2">
                                <input type="text" className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513] flex-1" />
                                <button className="px-4 py-2 bg-[#8B4513] text-white rounded-md">
                                    Apply
                                </button>
                            </div>
                            <p className="text-green-600 text-sm mt-1">
                                Discount applied: 10% off
                            </p>
                        </div>

                        {/* PAYMENT METHOD */}
                        <div>
                            <h3 className="text-lg font-medium text-[#8B4513] mb-3">
                                Payment Method
                            </h3>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 border rounded-md p-3 cursor-pointer">
                                    <input type="radio" name="payment" defaultChecked />
                                    <span>Credit Card (ending in 4242)</span>
                                </label>

                                <label className="flex items-center gap-3 border rounded-md p-3 cursor-pointer">
                                    <input type="radio" name="payment" />
                                    <span>PayPal</span>
                                </label>

                                <label className="flex items-center gap-3 border rounded-md p-3 cursor-pointer">
                                    <input type="radio" name="payment" />
                                    <span>Choose another payment method</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER BUTTONS */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-4">
                    <div></div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-10 w-full ">
                        <button className="w-full px-6 py-3 bg-[#8B4513] text-white rounded-md ">
                            Back to Cart
                        </button>
                        <button className=" w-full px-6 py-3 bg-[#8B4513] text-white rounded-md " onClick={handleClick}>
                            Continue to Payment
                        </button>
                    </div>
                </div>

            </div>
        </section>
    )
}

export default DeliveryInformation
