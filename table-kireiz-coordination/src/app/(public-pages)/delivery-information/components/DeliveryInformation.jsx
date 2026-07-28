'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiApplyPromocode, apiCreateOrder } from '@/services/createOrder'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Spinner from '@/components/ui/Spinner'
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'


const deliveryValidationSchema = z.object({
    first_name: z.string().min(1, { message: 'First name is required' }),
    last_name: z.string().min(1, { message: 'Last name is required' }),
    email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Invalid email address' }),
    phone: z.string().min(1, { message: 'Phone number is required' }),
    address_line_1: z.string().min(1, { message: 'Address is required' }),
    address_line_2: z.string().optional(),
    city: z.string().min(1, { message: 'City is required' }),
    postal_code: z.string().min(1, { message: 'Postal code is required' }),
    country: z.string().min(1, { message: 'Country is required' }),
    start_date: z.string().min(1, { message: 'Start date is required' }),
    return_date: z.string().min(1, { message: 'Return date is required' }),
    payment_method: z.string().min(1, { message: 'Payment method is required' })
})

const DeliveryInformation = () => {
    const router = useRouter()
    const { data: session } = useSession();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [couponCode, setCouponCode] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState("");
    const [couponSuccess, setCouponSuccess] = useState("");

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(deliveryValidationSchema),
        defaultValues: {
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
        },
    });

    const start_date = watch("start_date");
    const return_date = watch("return_date");
    const payment_method = watch("payment_method");

    const today = new Date().toISOString().split("T")[0];

    const rentalDays =
        start_date && return_date
            ? Math.max(
                0,
                (new Date(return_date) - new Date(start_date)) /
                (1000 * 60 * 60 * 24)
            )
            : 0;

    const onSubmit = async (data) => {
        if (!session?.accessToken) return;

        if (new Date(data.return_date) < new Date(data.start_date)) {
            toast.push(<Notification title="Warning!" type="warning">Return date must be after start date.</Notification>);
            return;
        }

        setLoading(true);
        setError("");

        const payload = {
            cart_id: 1,
            customer: {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone: data.phone,
            },
            delivery_address: {
                address_line_1: data.address_line_1,
                address_line_2: data.address_line_2,
                city: data.city,
                postal_code: data.postal_code,
                country: data.country,
            },
            payment: {
                payment_method: data.payment_method,
            },
            rental_start_date: data.start_date,
            rental_end_date: data.return_date,
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
                const createdOrderId = res?.data?.order_id
                toast.push(<Notification title="Success!" type="success">Order created successfully</Notification>);
                router.push(`/overview?orderId=${createdOrderId}`)
            } else {
                toast.push(<Notification title="Error!" type="danger">Failed to create order</Notification>);
                setError("Failed to create order. Please try again.")
            }
        } catch (err) {
            toast.push(<Notification title="Error!" type="danger">Failed to create order</Notification>);
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
                                <FormItem
                                    label="First Name *"
                                    invalid={Boolean(errors.first_name)}
                                    errorMessage={errors.first_name?.message}
                                >
                                    <Controller
                                        name="first_name"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="text"
                                                autoComplete="off"
                                                placeholder="Enter first name"
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Last Name *"
                                    invalid={Boolean(errors.last_name)}
                                    errorMessage={errors.last_name?.message}
                                >
                                    <Controller
                                        name="last_name"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="text"
                                                autoComplete="off"
                                                placeholder="Enter last name"
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Email *"
                                    invalid={Boolean(errors.email)}
                                    errorMessage={errors.email?.message}
                                >
                                    <Controller
                                        name="email"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="text"
                                                autoComplete="off"
                                                placeholder="Enter email address"
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Phone *"
                                    invalid={Boolean(errors.phone)}
                                    errorMessage={errors.phone?.message}
                                >
                                    <Controller
                                        name="phone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="number"
                                                autoComplete="off"
                                                placeholder="Enter phone number"
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                            </div>
                        </div>
                        {/* DELIVERY ADDRESS */}
                        <div>
                            <h3 className="text-lg font-medium text-[#8B4513] mb-4">
                                Delivery Address
                            </h3>
                            <div className="space-y-4">
                                <FormItem
                                    label="Address line 1 *"
                                    invalid={Boolean(errors.address_line_1)}
                                    errorMessage={errors.address_line_1?.message}
                                >
                                    <Controller
                                        name="address_line_1"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="text"
                                                autoComplete="off"
                                                placeholder="Street address, P.O. box"
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Address line 2"
                                    invalid={Boolean(errors.address_line_2)}
                                    errorMessage={errors.address_line_2?.message}
                                >
                                    <Controller
                                        name="address_line_2"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="text"
                                                autoComplete="off"
                                                placeholder="Apartment, suite, unit (optional)"
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormItem
                                        label="City *"
                                        invalid={Boolean(errors.city)}
                                        errorMessage={errors.city?.message}
                                    >
                                        <Controller
                                            name="city"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type="text"
                                                    autoComplete="off"
                                                    placeholder="Enter city"
                                                    {...field}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                    <FormItem
                                        label="Postal *"
                                        invalid={Boolean(errors.postal_code)}
                                        errorMessage={errors.postal_code?.message}
                                    >
                                        <Controller
                                            name="postal_code"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    autoComplete="off"
                                                    placeholder="Postal / ZIP code"
                                                    {...field}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormItem
                                        label="Country *"
                                        invalid={Boolean(errors.country)}
                                        errorMessage={errors.country?.message}
                                    >
                                        <Controller
                                            name="country"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type="text"
                                                    autoComplete="off"
                                                    placeholder="Enter country"
                                                    {...field}
                                                />
                                            )}
                                        />
                                    </FormItem>
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

                                <FormItem
                                    label="Start Date *"
                                    invalid={Boolean(errors.start_date)}
                                    errorMessage={errors.start_date?.message}
                                >
                                    <Controller
                                        name="start_date"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="date"
                                                min={today}
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Return Date *"
                                    invalid={Boolean(errors.return_date)}
                                    errorMessage={errors.return_date?.message}
                                >
                                    <Controller
                                        name="return_date"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="date"
                                                min={start_date || today}
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
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
                                    <Controller
                                        name="payment_method"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="radio"
                                                value="card"
                                                checked={field.value === "card"}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                    <span>Credit Card (ending in 4242)</span>
                                </label>
                                <label className="flex items-center gap-3 border rounded-md p-3 cursor-pointer">
                                    <Controller
                                        name="payment_method"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="radio"
                                                value="paypal"
                                                checked={field.value === "paypal"}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                    <span>PayPal</span>
                                </label>
                                <label className="flex items-center gap-3 border rounded-md p-3 cursor-pointer">
                                    <Controller
                                        name="payment_method"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="radio"
                                                value="other"
                                                checked={field.value === "other"}
                                                onChange={field.onChange}
                                            />
                                        )}
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
                            className="w-full px-6 py-3 bg-[#8B4513] hover:bg-[#71370F] text-white rounded-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition"
                            onClick={handleSubmit(onSubmit)}
                            disabled={loading}
                        >
                            {loading ? <Spinner size={18} customColorClass="text-white" /> : null}
                            {loading ? "Processing..." : "Continue to Payment"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default DeliveryInformation
