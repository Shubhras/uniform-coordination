"use client";

import { apiGetProductDetailsById } from "@/services/ProductService";
import { apiAddToCart } from "@/services/CartSummaryService";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FiArrowLeft, FiShoppingCart, FiCalendar, FiPlus, FiMinus } from "react-icons/fi";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import DatePicker from "@/components/ui/DatePicker";
import dayjs from "dayjs";

/**
 * UniformSingle Dynamic Component ([id])
 *
 * Fetches and renders detailed product specifications, pricing, description, and direct link to 3D customization editor.
 */
const UniformSingle = () => {
  const { id } = useParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [singleProductData, setSingleProductData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d;
  });

  const rentalDays = useMemo(() => {
    if (!startDate || !returnDate) return 1;
    const diffTime = Math.abs(new Date(returnDate) - new Date(startDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [startDate, returnDate]);

  const estimatedTotal = useMemo(() => {
    if (!singleProductData) return 0;
    const pricePerDay = Number(singleProductData.rental_price_per_day || singleProductData.price || 0);
    return (pricePerDay * rentalDays * quantity).toFixed(2);
  }, [singleProductData, rentalDays, quantity]);

  /**
   * Fetches product detail specifications by route param ID.
   */
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setSingleProductData(null);

        const res = await apiGetProductDetailsById(id);

        if (res?.status && res?.data) {
          setSingleProductData(res.data);
        } else {
          toast.push(
            <Notification title="Error!" type="danger">
              {res?.message || "Product not found"}
            </Notification>,
          );
        }
      } catch (err) {
        toast.push(
          <Notification title="Error!" type="danger">
            Failed to load product detail
          </Notification>,
        );
        console.error("Failed to load product detail", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductDetails();
  }, [id]);

  /**
   * Navigates to the 3D uniform customization editor for this specific product ID.
   */
  const handleUniformDesigning = () => {
    // product id
    router.push(`/dashboards/uniform-3d-design/${id}`);
  };

  /**
   * Directly adds this product with selected quantity to cart.
   */
  const handleAddToCart = async () => {
    const token = session?.accessToken || session?.user?.accessToken;
    if (!token) {
      toast.push(
        <Notification title="Authentication Required" type="warning">
          Please sign in to add items to your cart.
        </Notification>
      );
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      setAddingToCart(true);
      const res = await apiAddToCart(token, id, quantity);
      if (res?.status || res?.statusCode === 200 || res?.statusCode === 201) {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "selected_rental_dates",
            JSON.stringify({
              start_date: dayjs(startDate).format("YYYY-MM-DD"),
              return_date: dayjs(returnDate).format("YYYY-MM-DD"),
              rental_days: rentalDays,
            })
          );
        }

        toast.push(
          <Notification title="Added to Cart!" type="success">
            {singleProductData.productName} (x{quantity}) added to cart.
          </Notification>
        );
      } else {
        toast.push(
          <Notification title="Error" type="danger">
            {res?.message || "Could not add item to cart"}
          </Notification>
        );
      }
    } catch (err) {
      console.error("Failed to add product to cart:", err);
      toast.push(
        <Notification title="Error" type="danger">
          {err?.response?.data?.message || "Failed to add item to cart"}
        </Notification>
      );
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <section className="w-full bg-white flex flex-col lg:flex-row px-6 lg:px-4 py-4 gap-10 mt-15">
      <div className="w-full mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 py-5 md:pt-1">
          <button
            onClick={() => router.back()}
            className="text-[#1C2C56] hover:text-[#1C4FA8] transition-colors"
            title="Go Back"
          >
            <FiArrowLeft size={20} />
          </button>
          <p className="text-sm text-[#7B3C1D]">
            <Link
              href="/kireiz-form"
              className="hover:underline hover:text-[#1C4FA8] cursor-pointer"
            >
              My dashboard
            </Link>{" "}
            /{" "}
            <Link
              href={`/medical-form/${singleProductData?.category?.id}`}
              className="hover:underline hover:text-[#1C4FA8] cursor-pointer"
            >
              {singleProductData?.category?.categoryName}
            </Link>{" "}
            / {singleProductData?.subcategory?.name}
          </p>
        </div>

        {/* Header */}
        <div className="bg-[#F5F8FF] rounded-xl md:p-8 p-5">
          <div className="text-center mb-8">
            <h2 className="text-[#7B3C1D] text-3xl font-semibold capitalize">
              {singleProductData?.productName || "Product Details"}
            </h2>
            <div className="w-20 h-1 bg-[#7B3C1D] mx-auto mt-2 rounded-full" />
            {singleProductData?.category?.categoryName && (
              <p className="text-[#8B5A3C] mt-2 text-[15px] font-medium">
                Category: {singleProductData.category.categoryName}{" "}
                {singleProductData.subcategory?.name
                  ? `| ${singleProductData.subcategory.name}`
                  : ""}
              </p>
            )}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Info Card */}
            <div className="order-2 lg:order-1 bg-white border border-[#E8E0D9] rounded-[20px] md:p-8 p-5 flex flex-col shadow-sm">
              {loading && (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B3C1D]"></div>
                </div>
              )}

              {!loading && !singleProductData && (
                <p className="text-center text-sm text-[#6B7280]">
                  No product data available
                </p>
              )}

              {!loading && singleProductData && (
                <>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-[#2C1810] text-2xl font-semibold capitalize">
                        {singleProductData.productName}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm mt-1">
                      <div>
                        <span className="text-[#6B7280] text-[15px]">
                          Price:{" "}
                        </span>
                        <span className="text-[#7B3C1D] font-bold text-[19px]">
                          ${singleProductData.price}
                        </span>
                      </div>
                      {singleProductData.rental_price_per_day && (
                        <div className="border-l border-gray-300 pl-4">
                          <span className="text-[#6B7280] text-[15px]">
                            Rental:{" "}
                          </span>
                          <span className="text-[#1C2C56] font-semibold text-[19px]">
                            ${singleProductData.rental_price_per_day}{" "}
                            <span className="text-xs font-normal text-gray-500">
                              / day
                            </span>
                          </span>
                        </div>
                      )}
                      {singleProductData.discount > 0 && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-md font-medium">
                          Save {singleProductData.discount}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Rental Period Selection */}
                  <div className="mt-5 pt-4 border-t border-[#E8E0D9] space-y-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-[#2C1810]">
                        Quantity:
                      </label>
                      <div className="flex items-center border border-[#DCCBC1] rounded-lg bg-white overflow-hidden shadow-sm">
                        <button
                          type="button"
                          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                          disabled={quantity <= 1}
                          className="px-3 py-1.5 text-gray-600 hover:bg-[#F5F0EE] disabled:opacity-40 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus size={14} />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={singleProductData.available_quantity || 99}
                          value={quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 1) setQuantity(val);
                          }}
                          className="w-12 text-center text-sm font-semibold text-[#2C1810] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity((prev) => prev + 1)}
                          className="px-3 py-1.5 text-gray-600 hover:bg-[#F5F0EE] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Rental Period Date Pickers */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-[#2C1810]">
                        <FiCalendar className="text-[#7B3C1D]" size={16} />
                        <span>Select Rental Period:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="block text-xs font-medium text-gray-600 mb-1">
                            Start Date
                          </span>
                          <DatePicker
                            value={startDate}
                            onChange={(date) => {
                              setStartDate(date);
                              if (returnDate && date && new Date(date) > new Date(returnDate)) {
                                const nextDay = new Date(date);
                                nextDay.setDate(nextDay.getDate() + 3);
                                setReturnDate(nextDay);
                              }
                            }}
                            minDate={new Date()}
                            placeholder="Start Date"
                            size="sm"
                            className="w-full text-xs"
                          />
                        </div>
                        <div>
                          <span className="block text-xs font-medium text-gray-600 mb-1">
                            Return Date
                          </span>
                          <DatePicker
                            value={returnDate}
                            onChange={(date) => setReturnDate(date)}
                            minDate={startDate ? new Date(startDate) : new Date()}
                            placeholder="Return Date"
                            size="sm"
                            className="w-full text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-[#8B5A3C] bg-[#FBF9F7] px-3 py-2 rounded-md border border-[#E8E0D9]">
                        <span>
                          Rental Duration: <strong>{rentalDays} day{rentalDays !== 1 ? "s" : ""}</strong>
                        </span>
                        <span>
                          Estimated Total: <strong>${estimatedTotal}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Add to Cart + Customize */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      type="button"
                      disabled={addingToCart}
                      onClick={handleAddToCart}
                      className="flex-1 bg-[#7B3C1D] hover:bg-[#602D15] transition-colors text-white py-3 px-4 rounded-md text-sm font-medium shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      {addingToCart ? (
                        <>
                          <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          <span>Adding to Cart...</span>
                        </>
                      ) : (
                        <>
                          <FiShoppingCart size={18} />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleUniformDesigning}
                      className="sm:w-auto bg-white hover:bg-[#F5F0EE] border border-[#8B4513] text-[#8B4513] transition-colors py-3 px-5 rounded-md text-sm font-medium shadow-sm whitespace-nowrap cursor-pointer"
                    >
                      Customize in 3D
                    </button>
                  </div>

                  <div className="pt-6 space-y-5 flex-1">
                    {/* Description */}
                    <div>
                      <h4 className="text-[#2C1810] font-semibold mb-1">
                        Description
                      </h4>
                      <p className="text-[#6B7280] text-[16px] leading-relaxed">
                        {singleProductData.description ||
                          "No description available"}
                      </p>
                    </div>

                    {/* Specifications */}
                    <div className="border-t border-[#E8E0D9] pt-4">
                      <h4 className="text-[#2C1810] font-semibold mb-3">
                        Product Specifications
                      </h4>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs sm:text-sm">
                        {singleProductData.fabric_details?.name && (
                          <div>
                            <span className="text-gray-500 text-[15px]">
                              Fabric:{" "}
                            </span>
                            <span className="font-medium text-gray-800 text-[15px]">
                              {singleProductData.fabric_details.name}
                            </span>
                          </div>
                        )}
                        {singleProductData.color_details?.name && (
                          <div>
                            <span className="text-gray-500 text-[15px]">
                              Color:{" "}
                            </span>
                            <span className="font-medium text-gray-800 text-[15px]">
                              {singleProductData.color_details.name}
                            </span>
                          </div>
                        )}
                        {singleProductData.size && (
                          <div>
                            <span className="text-gray-500 text-[15px]">
                              Size:{" "}
                            </span>
                            <span className="font-medium text-gray-800 text-[15px]">
                              {singleProductData.size}
                            </span>
                          </div>
                        )}
                        {singleProductData.style && (
                          <div>
                            <span className="text-gray-500 text-[15px]">
                              Style:{" "}
                            </span>
                            <span className="font-medium text-gray-800 capitalize text-[15px]">
                              {singleProductData.style}
                            </span>
                          </div>
                        )}
                        {singleProductData.table_shape && (
                          <div>
                            <span className="text-gray-500 text-[15px]">
                              Shape:{" "}
                            </span>
                            <span className="font-medium text-gray-800 capitalize text-[15px]">
                              {singleProductData.table_shape}
                            </span>
                          </div>
                        )}
                        {singleProductData.productType && (
                          <div>
                            <span className="text-gray-500 text-[15px]">
                              Type:{" "}
                            </span>
                            <span className="font-medium text-gray-800 capitalize text-[15px]">
                              {singleProductData.productType}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Product Image Preview */}
            <div className="order-1 lg:order-2 relative flex justify-center">
              <div className="relative z-10">
                {/* <Image
                                    src={singleProductData?.ProductImage}
                                    alt="Uniform"
                                    width={450}
                                    height={800}
                                    className="object-contain"
                                    priority
                                    unoptimized
                                /> */}
                {singleProductData?.ProductImage && (
                  <Image
                    src={singleProductData.ProductImage}
                    alt="Uniform"
                    width={450}
                    height={800}
                    className="object-contain"
                    priority
                    unoptimized
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UniformSingle;
