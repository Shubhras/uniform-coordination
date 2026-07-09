'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiApplyPromocode, apiCreateOrder } from '@/services/createOrder'

const DeliveryInformation = () => {
    const router = useRouter()
    const { data: session } = useSession();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [couponCode, setCouponCode] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState("");
    const [couponSuccess, setCouponSuccess] = useState("");

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        postal_code: "",
        country: "India",
        start_date: "",
        return_date: "",
        payment_method: "card",
    });

    const today = new Date().toISOString().split("T")[0];

    const rentalDays =
        form.start_date && form.return_date
            ? Math.max(
                0,
                (new Date(form.return_date) - new Date(form.start_date)) /
                (1000 * 60 * 60 * 24)
            )
            : 0;

    const isFormValid =
        form.first_name &&
        form.last_name &&
        form.email &&
        form.phone &&
        form.address_line_1 &&
        form.city &&
        form.postal_code &&
        form.country &&
        form.start_date &&
        form.return_date &&
        new Date(form.return_date) >= new Date(form.start_date);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleCreateOrder = async () => {
        if (!session?.accessToken) return;

        if (!isFormValid) {
            setError("Please fill all required fields correctly.");
            return;
        }

        setLoading(true);
        setError("");

        const payload = {
            cart_id: 1,
            customer: {
                first_name: form.first_name,
                last_name: form.last_name,
                email: form.email,
                phone: form.phone,
            },
            delivery_address: {
                address_line_1: form.address_line_1,
                address_line_2: form.address_line_2,
                city: form.city,
                postal_code: form.postal_code,
                country: form.country,
            },
            payment: {
                payment_method: form.payment_method,
            },
            rental_start_date: form.start_date,
            rental_end_date: form.return_date,
            // rental: {
            //     start_date: form.start_date,
            //     return_date: form.return_date,
            // },
            promocode: couponCode ? { code: couponCode } : {},
        };
        console.log(payload)
        setLoading(false);

        try {
            const res = await apiCreateOrder(session.accessToken, payload);
            if (res?.status) {
                const createdOrderId = res?.data?.order?.order_id
                router.push(`/overview?orderId=${createdOrderId}`)
            } else {
                setError("Failed to create order. Please try again.")
            }
        } catch (err) {
            setError("Failed to create order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleApplyCoupon = async () => {
        if (!session?.accessToken) return;

        if (!couponCode.trim()) {
            setCouponError("Please enter a coupon code");
            setCouponSuccess("");
            return;
        }

        try {
            setCouponLoading(true);
            setCouponError("");
            setCouponSuccess("");

            const payload = {
                code: couponCode.trim(),
            };

            const res = await apiApplyPromocode(session.accessToken, payload);

            // adjust according to your API response
            if (res?.status) {
                setCouponSuccess("Discount applied successfully");
            } else {
                setCouponError("Invalid or expired coupon");
            }
        } catch (err) {
            setCouponError("Failed to apply coupon");
        } finally {
            setCouponLoading(false);
        }
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
                                    <label className="text-sm mb-1 block text-[#374151]">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        name="first_name"
                                        placeholder="Enter first name"
                                        onChange={handleChange}
                                        className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm mb-1 block text-[#374151]">Last Name  <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        name="last_name"
                                        placeholder="Enter last name"
                                        onChange={handleChange}
                                        className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm mb-1 block text-[#374151]">Email  <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        name="email"
                                        placeholder="Enter email address"
                                        onChange={handleChange}
                                        className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm mb-1 block text-[#374151]">Phone  <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="number"
                                        name="phone"
                                        placeholder="Enter phone number"
                                        onChange={handleChange}
                                        className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                                    />
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
                                    <label className="text-sm mb-1 block text-[#374151]">Address line 1  <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        name="address_line_1"
                                        placeholder="Street address, P.O. box"
                                        onChange={handleChange}
                                        className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm mb-1 block text-[#374151]">Address line 2</label>
                                    <input
                                        type="text"
                                        name="address_line_2"
                                        placeholder="Apartment, suite, unit (optional)"
                                        onChange={handleChange}
                                        className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div>
                                        <label className="text-sm mb-1 block text-[#374151]">City <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="text"
                                            name="city"
                                            placeholder="Enter city"
                                            onChange={handleChange}
                                            className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm mb-1 block text-[#374151]">Postal <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            required
                                            name="postal_code"
                                            placeholder="Postal / ZIP code"
                                            onChange={handleChange}
                                            className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                                        />
                                    </div>

                                </div>

                                <div>
                                    <label className="text-sm mb-1 block text-[#374151]">Country <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="country"
                                        required
                                        placeholder="Enter country"
                                        onChange={handleChange}
                                        className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                                    />
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
                                    <label className="text-sm mb-1 block text-[#374151]">Start Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        min={today}
                                        required
                                        onChange={handleChange}
                                        className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm mb-1 block text-[#374151]">Return Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        name="return_date"
                                        min={form.start_date || today}
                                        required
                                        onChange={handleChange}
                                        className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                                    />
                                </div>

                                <p className="text-sm text-gray-600">
                                    Rental Duration: {rentalDays} day{rentalDays !== 1 ? "s" : ""}
                                </p>

                            </div>
                        </div>

                        {/* COUPON */}
                        <div>
                            <label className="text-sm mb-1 block text-[#374151]">
                                Coupon Code
                            </label>

                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Enter coupon code"
                                    className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513] flex-1"
                                />

                                <button
                                    type="button"
                                    onClick={handleApplyCoupon}
                                    disabled={couponLoading}
                                    className="px-4 py-2 bg-[#8B4513] text-white rounded-md disabled:opacity-60"
                                >
                                    {couponLoading ? "Applying..." : "Apply"}
                                </button>
                            </div>

                            {couponError && (
                                <p className="text-red-600 text-sm mt-1">
                                    {couponError}
                                </p>
                            )}

                            {couponSuccess && (
                                <p className="text-green-600 text-sm mt-1">
                                    {couponSuccess}
                                </p>
                            )}
                        </div>


                        {/* PAYMENT METHOD */}
                        <div>
                            <h3 className="text-lg font-medium text-[#8B4513] mb-3">
                                Payment Method <span className="text-red-500">*</span>
                            </h3>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 border rounded-md p-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="card"
                                        checked={form.payment_method === "card"}
                                        onChange={handleChange}
                                    />
                                    <span>Credit Card (ending in 4242)</span>
                                </label>

                                <label className="flex items-center gap-3 border rounded-md p-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="paypal"
                                        checked={form.payment_method === "paypal"}
                                        onChange={handleChange}
                                    />
                                    <span>PayPal</span>
                                </label>

                                <label className="flex items-center gap-3 border rounded-md p-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="other"
                                        checked={form.payment_method === "other"}
                                        onChange={handleChange}
                                    />
                                    <span>Choose another payment method</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="text-red-600 text-sm mt-4 text-right">
                        {error}
                    </p>
                )}

                {/* FOOTER BUTTONS */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-4">
                    <div></div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-10 w-full ">
                        <button className="w-full px-6 py-3 bg-[#8B4513] text-white rounded-md " onClick={() => router.back()}>
                            Back to Cart
                        </button>
                        <button
                            className="w-full px-6 py-3 bg-[#8B4513] text-white rounded-md"
                            onClick={handleCreateOrder}
                        >
                            {loading ? "Processing..." : "Continue to Payment"}
                        </button>

                    </div>
                </div>

            </div>
        </section>
    )
}

export default DeliveryInformation
