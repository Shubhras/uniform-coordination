"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

import { useSession } from "next-auth/react";
import { apiApplyPromocode, apiCreateOrder, apiGetCustomerDetails } from "@/services/OrderService";
import Notification from "@/components/ui/Notification";
import toast from "@/components/ui/toast";
import Spinner from "@/components/ui/Spinner";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import dayjs from "dayjs";
import DatePicker from "@/components/ui/DatePicker";

/**
 * Zod validation schema for customer delivery details & rental dates.
 */
const deliveryValidationSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be 10 digits" })
    .max(10, { message: "Phone number must be 10 digits" })
    .regex(/^\d+$/, { message: "Only digits are allowed" }),
  address_line_1: z.string().min(1, { message: "Address is required" }),
  address_line_2: z.string().optional(),
  city: z.string().min(1, { message: "City is required" }),
  postal_code: z.string().min(1, { message: "Postal code is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  start_date: z.string().min(1, { message: "Start date is required" }),
  return_date: z.string().min(1, { message: "Return date is required" }),
  coupon_code: z.string().optional(),
});

/**
 * DeliveryInformation Component
 *
 * Form component collecting delivery addresses, rental dates, promo codes, and creating customer orders.
 */
const DeliveryInformation = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const params = useParams();
  const searchParams = useSearchParams();
  const cartId = params?.id || searchParams?.get("id");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(deliveryValidationSchema),
    defaultValues: {
      first_name: session?.user?.firstName || "",
      last_name: session?.user?.lastName || "",
      email: session?.user?.email || "",
      phone: "",
      address_line_1: "",
      address_line_2: "",
      city: "",
      postal_code: "",
      country: "India",
      start_date: "",
      return_date: "",
      coupon_code: "",
      payment_method: "",
    },
  });

  useEffect(() => {
    const loadCustomerDetails = async () => {
      if (!session?.accessToken) return;
      try {
        const res = await apiGetCustomerDetails(session.accessToken);
        if (res?.status && res?.data) {
          const cust = res.data;
          if (cust.first_name) setValue("first_name", cust.first_name);
          if (cust.last_name) setValue("last_name", cust.last_name);
          if (cust.email) setValue("email", cust.email);
          if (cust.phone) setValue("phone", cust.phone);
          if (cust.address_line_1) setValue("address_line_1", cust.address_line_1);
          if (cust.address_line_2) setValue("address_line_2", cust.address_line_2 || "");
          if (cust.city) setValue("city", cust.city);
          if (cust.postal_code) setValue("postal_code", cust.postal_code);
          if (cust.country) setValue("country", cust.country);
        } else {
          // Fallback to session user details
          if (session?.user) {
            if (session.user.email) setValue("email", session.user.email);
            if (session.user.firstName || session.user.name) {
              setValue(
                "first_name",
                session.user.firstName || session.user.name?.split(" ")[0] || "",
              );
            }
            if (session.user.lastName || session.user.name) {
              setValue(
                "last_name",
                session.user.lastName || session.user.name?.split(" ")[1] || "",
              );
            }
          }
        }
      } catch (err) {
        console.error("Failed to load customer details:", err);
      }
    };
    loadCustomerDetails();
  }, [session, setValue]);

  const start_date = watch("start_date");
  const return_date = watch("return_date");
  const couponCode = watch("coupon_code");

  const today = new Date().toISOString().split("T")[0];

  const rentalDays =
    start_date && return_date
      ? Math.max(
        0,
        (new Date(return_date) - new Date(start_date)) /
        (1000 * 60 * 60 * 24),
      )
      : 0;

  /**
   * Handles order submission with customer details, delivery address, and rental dates.
   *
   * @param {Object} data - Form data values.
   */
  const onSubmit = async (data) => {
    if (!session?.accessToken) return;

    if (new Date(data.return_date) < new Date(data.start_date)) {
      toast.push(
        <Notification title="Warning!" type="warning">
          Return date must be after start date.
        </Notification>,
      );
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      cart_id: cartId,
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
        payment_method: "",
      },
      rental_start_date: data.start_date,
      rental_end_date: data.return_date,
      promocode: couponCode ? { code: couponCode } : {},
    };

    try {
      const res = await apiCreateOrder(session.accessToken, payload);
      if (res?.status) {
        const createdOrderId = res?.data?.order_id;
        toast.push(
          <Notification title="Success!" type="success">
            Order created successfully
          </Notification>,
        );
        router.push(`/overview?orderId=${createdOrderId}`);
      } else {
        toast.push(
          <Notification title="Error!" type="danger">
            Failed to create order
          </Notification>,
        );
        setError("Failed to create order. Please try again.");
      }
    } catch (err) {
      toast.push(
        <Notification title="Error!" type="danger">
          Failed to create order
        </Notification>,
      );
      setError("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Applies promo coupon code via API.
   */
  const handleApplyCoupon = async () => {
    if (!session?.accessToken) return;

    if (!couponCode || !couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      setCouponSuccess("");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError("");
      setCouponSuccess("");

      const payload = {
        // code: couponCode.trim(),
        promocode: couponCode.trim(),
      };

      const res = await apiApplyPromocode(session.accessToken, payload);

      if (res?.status) {
        setCouponSuccess(res?.message || "Discount applied successfully");
        setCouponError("");
        setCouponApplied(true);

        toast.push(
          <Notification title="Success!" type="success">
            {res?.message || "Discount applied successfully"}
          </Notification>,
        );
      } else {
        setCouponSuccess("");
        setCouponError(res?.message || "Invalid promocode.");

        toast.push(
          <Notification title="Error!" type="danger">
            {res?.message || "Invalid promocode."}
          </Notification>,
        );
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
            <h3 className="text-lg font-medium text-[#8B4513] mb-4">
              Customer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0">
              <FormItem
                label="First Name *"
                labelClass="!text-sm"
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
                      className="mb-1"
                      {...field}
                    />
                  )}
                />
              </FormItem>
              <FormItem
                label="Last Name *"
                labelClass="!text-sm"
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
                      className="mb-1"
                      {...field}
                    />
                  )}
                />
              </FormItem>
              <FormItem
                label="Email *"
                labelClass="!text-sm"
                invalid={Boolean(errors.email)}
                errorMessage={errors.email?.message}
              >
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      readOnly
                      autoComplete="off"
                      placeholder="Enter email address"
                      className="mb-1 bg-gray-100 cursor-not-allowed"
                      {...field}
                    />
                  )}
                />
              </FormItem>
              <FormItem
                label="Phone *"
                labelClass="!text-sm"
                invalid={Boolean(errors.phone)}
                errorMessage={errors.phone?.message}
              >
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      autoComplete="off"
                      placeholder="Enter phone number"
                      className="mb-1"
                      maxLength={10}
                      value={field.value}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        field.onChange(value);
                      }}
                    //   {...field}
                    />
                  )}
                />
              </FormItem>
            </div>
            {/* DELIVERY ADDRESS */}
            <div>
              <h3 className="text-lg font-medium text-[#8B4513] mb-4">
                Delivery Address
              </h3>
              <div className="space-y-4">
                <FormItem
                  label="Address line 1 *"
                  labelClass="!text-sm"
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
                        className="mb-1"
                        {...field}
                      />
                    )}
                  />
                </FormItem>
                <FormItem
                  label="Address line 2"
                  labelClass="!text-sm"
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
                        className="mb-1"
                        {...field}
                      />
                    )}
                  />
                </FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0">
                  <FormItem
                    label="City *"
                    labelClass="!text-sm"
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
                          className="mb-1"
                          {...field}
                        />
                      )}
                    />
                  </FormItem>
                  <FormItem
                    label="Postal *"
                    labelClass="!text-sm"
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
                          className="mb-1"
                          {...field}
                        />
                      )}
                    />
                  </FormItem>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 ">
                  <FormItem
                    label="Country *"
                    labelClass="!text-sm"
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
                          className="mb-1"
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
                  labelClass="!text-sm"
                  invalid={Boolean(errors.start_date)}
                  errorMessage={errors.start_date?.message}
                >
                  <Controller
                    name="start_date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value ? new Date(field.value) : null}
                        onChange={(date) =>
                          field.onChange(
                            date ? dayjs(date).format("YYYY-MM-DD") : "",
                          )
                        }
                        placeholder="Start Date"
                        className="mb-1"
                        minDate={new Date()}
                        inputtable={true} // agar library support karti ho
                      />
                    )}
                  />
                </FormItem>
                <FormItem
                  label="Return Date *"
                  labelClass="!text-sm"
                  invalid={Boolean(errors.return_date)}
                  errorMessage={errors.return_date?.message}
                >
                  <Controller
                    name="return_date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value ? new Date(field.value) : null}
                        onChange={(date) =>
                          field.onChange(
                            date ? dayjs(date).format("YYYY-MM-DD") : "",
                          )
                        }
                        placeholder="Return Date"
                        className="mb-1"
                        minDate={start_date ? new Date(start_date) : new Date()}
                      />
                    )}
                  />
                </FormItem>
              </div>
              <p className="text-sm text-gray-600">
                Rental Duration: {rentalDays} day{rentalDays !== 1 ? "s" : ""}
              </p>
            </div>

            {/* COUPON */}
            <div>
              <FormItem
                label="Coupon Code"
                labelClass="!text-sm"
                invalid={Boolean(errors.coupon_code)}
                errorMessage={errors.coupon_code?.message}
                className="mb-2"
              >
                <div className="flex items-center gap-2">
                  <Controller
                    name="coupon_code"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        autoComplete="off"
                        placeholder="Enter coupon code"
                        {...field}
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || couponApplied}
                    className="px-4 py-2 bg-[#8B4513] text-white rounded-md disabled:opacity-60 shrink-0"
                  >
                    {couponLoading ? "Applying..." : "Apply"}
                  </button>
                </div>
              </FormItem>
              {couponError && (
                <p className="text-red-600 text-sm mt-1">{couponError}</p>
              )}
              {couponSuccess && (
                <p className="text-green-600 text-sm mt-1">{couponSuccess}</p>
              )}
            </div>
          </div>
        </div>
        {error && (
          <p className="text-red-600 text-sm mt-4 text-right">{error}</p>
        )}

        {/* FOOTER BUTTONS */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-4">
          <div></div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-10 w-full ">
            <button
              className="w-full px-6 py-3 bg-[#8B4513] text-white rounded-md "
              onClick={() => router.back()}
            >
              Back to Cart
            </button>
            <button
              className="w-full px-4 py-1 bg-[#8B4513] hover:bg-[#71370F] text-white rounded-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition"
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? (
                <Spinner size={18} customColorClass="text-white" />
              ) : null}
              {loading ? "Processing..." : "Continue to Payment"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliveryInformation;
