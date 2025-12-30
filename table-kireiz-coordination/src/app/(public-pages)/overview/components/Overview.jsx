'use client'
import React, { useState } from 'react'
import ThankyouPopup from '../../thankyou-popup/ThankyouPopup'
import PaymentFailedPopup from '../../payment-failed-popup/PaymentFailedPopup';
import { useRouter } from 'next/navigation';

const Overview = () => {
    const router = useRouter();
    const [dialogThankyouPopupOpen, setDialogThankyouPopupOpen] = useState(false);
    const [dialogCancelPopupOpen, setDialogCancelPopupOpen] = useState(false);
    const openDialogThankyouPopup = () => {
        setDialogThankyouPopupOpen(true)
    }
    const openDialogCancelPopup = () => {
        setDialogCancelPopupOpen(true)
    }
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

                            {/* CONTACT INFO */}
                            <div className="space-y-1">
                                <p className=" text-[#111827] text-lg font-semibold">
                                    Contact Information:
                                </p>
                                <p className="text-base text-[#3F3F3F] font-medium">Sarah Johnson</p>
                                <p className="text-base text-[#3F3F3F] font-medium">sarah@example.com</p>
                            </div>

                            <hr />

                            {/* DELIVERY ADDRESS */}
                            <div className="space-y-1">
                                <p className="text-[#111827] text-lg font-semibold">
                                    Delivery Address
                                </p>
                                <p className="text-base text-[#3F3F3F] font-medium">Grand Hotel Ballroom</p>
                                <p className="text-base text-[#3F3F3F] font-medium">
                                    123 Event Street, Tokyo 100-0001
                                </p>
                                <p className="text-base text-[#3F3F3F] font-medium">Japan</p>
                            </div>

                            <hr />

                            {/* RENTAL PERIOD */}
                            <div className="space-y-1">
                                <p className="text-[#111827] text-lg font-semibold">
                                    Rental Period
                                </p>
                                <p className="text-base text-[#3F3F3F] font-medium">
                                    Start: December 15, 2025
                                </p>
                                <p className="text-base text-[#3F3F3F] font-medium">
                                    Return: December 17, 2025
                                </p>
                                <p className="text-base text-[#3F3F3F] font-medium">
                                    Duration: 3 days
                                </p>
                            </div>
                            <hr />


                        </div>

                        {/* RIGHT — ORDER ITEMS */}
                        <div className="bg-white rounded-xl p-6 shadow-xl space-y-6">

                            <h3 className="text-[#111827] text-lg font-semibold">
                                Order Items
                            </h3>

                            {/* ITEM */}
                            <div className="flex justify-between items-center border-b border-[#CFCFCFAD] pb-4">
                                <div>
                                    <p className="text-base text-[#3F3F3F] font-medium">
                                        Luxury Velvet Tablecloth - Red (2)
                                    </p>
                                    <p className="text-base text-[#3F3F3F] font-medium">¥8,000</p>
                                </div>
                                <img
                                    src="/img/table-form/tables/table1.png"
                                    alt=""
                                    className="w-15 h-15 rounded-sm object-cover"
                                />
                            </div>

                            <div className="flex justify-between items-center border-b border-[#CFCFCFAD] pb-4">
                                <div>
                                    <p className="text-base text-[#3F3F3F] font-medium">
                                        Satin Chair Covers - Ivory (12)
                                    </p>
                                    <p className="text-base text-[#3F3F3F] font-medium">¥9,600</p>
                                </div>
                                <img
                                    src="/img/table-form/tables/table3.png"
                                    alt=""
                                    className="w-15 h-15 rounded-sm object-cover"
                                />
                            </div>

                            <div className="flex justify-between items-center border-b border-[#CFCFCFAD] pb-4">
                                <div>
                                    <p className="text-base text-[#3F3F3F] font-medium">
                                        Linen Napkins - White (24)
                                    </p>
                                    <p className="text-base text-[#3F3F3F] font-medium">¥7,200</p>
                                </div>
                                <img
                                    src="/img/table-form/tables/table6.png"
                                    alt=""
                                    className="w-15 h-15 rounded-sm object-cover"
                                />
                            </div>

                            {/* SUMMARY */}
                            <div className="space-y-2 py-4 border-b border-[#CFCFCFAD]">
                                <h4 className="text-[#3F3F3F] text-lg font-semibold">Order Summary</h4>

                                <div className="flex justify-between text-base">
                                    <span>Subtotal:</span>
                                    <span>¥24,800</span>
                                </div>

                                <div className="flex justify-between text-base">
                                    <span>Shipping:</span>
                                    <span>¥2,500</span>
                                </div>

                                <div className="flex justify-between text-base">
                                    <span>Tax:</span>
                                    <span>¥2,484</span>
                                </div>
                            </div>

                            {/* TERMS */}
                            <label className="flex items-center gap-2 text-base text-[#374151] pt-4">
                                <input type="checkbox" />
                                <span>
                                    I Agree to privacy <span className="text-[#8B4513] underline">policy & terms</span>
                                </span>
                            </label>

                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-4">
                        <div></div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-10 w-full ">
                            <button className="w-full px-6 py-3 bg-[#8B4513] text-white rounded-md"  onClick={() => router.back()}>
                                Edit Delivery
                            </button>
                            <button className="w-full px-6 py-3 bg-[#8B4513] text-white rounded-md" onClick={openDialogThankyouPopup}>
                                Proceed to Payment
                            </button>
                            <button className="w-full px-6 py-3 bg-[#8B4513] text-white rounded-md" onClick={openDialogCancelPopup}>
                                Payment Cancel
                            </button>
                        </div>
                    </div>


                </div>
            </section>

            <ThankyouPopup
                isOpen={dialogThankyouPopupOpen}
                onClose={() => setDialogThankyouPopupOpen(false)}
            />
             <PaymentFailedPopup
                isOpen={dialogCancelPopupOpen}
                onClose={() => setDialogCancelPopupOpen(false)}
            />
        </>
    )
}

export default Overview