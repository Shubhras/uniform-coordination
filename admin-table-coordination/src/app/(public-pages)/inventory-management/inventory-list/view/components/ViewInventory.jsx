"use client";

import { useEffect, useState } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowLeft, FiTrash2, FiEdit2, FiActivity } from "react-icons/fi";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import NewDeleteModal from "@/components/shared/NewDeleteModal";
import {
  apiGetProductDetails,
  apiDeleteProduct,
} from "@/services/ProductService";

export default function ViewInventory() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const productId = searchParams.get("id");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [product, setProduct] = useState(null);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await apiGetProductDetails(accessToken, productId);

        if (res?.status && res?.data) {
          setProduct(res.data);
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (accessToken && productId) {
      fetchProduct();
    }
  }, [accessToken, productId]);

  const handleDeleteConfirm = async () => {
    if (!product) return;

    setDeleteLoading(true);

    try {
      const res = await apiDeleteProduct(accessToken, product.id);

      if (res?.status) {
        toast.push(
          <Notification title="Success" type="success">
            {res.message}
          </Notification>,
        );

        setDeleteDialogOpen(false);

        // delete hone ke baad list page pe bhej do
        router.push("/inventory-management");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#FAF8F6] px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full border border-[#E8DDD4] bg-white flex items-center justify-center hover:bg-[#F7F2EE]"
            >
              <FiArrowLeft size={18} className="text-[#4D3A2E]" />
            </button>

            <h1 className="text-[28px] font-semibold text-[#1A1410]">
              Inventory Details
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDeleteDialogOpen(true)}
              size={15}
              className="flex items-center gap-2 px-5 h-10 rounded-lg bg-[#FFF1F0] text-[#F04438] text-sm font-medium hover:bg-[#FFE4E2] transition"
            >
              <FiTrash2 />
              Delete Product
            </button>

            <button
              onClick={() =>
                router.push(
                  `/inventory-management/add?mode=edit&id=${product.id}`,
                )
              }
              className="flex items-center gap-2 px-5 h-10 rounded-lg bg-[#A0522D] text-white text-sm font-medium hover:bg-[#914A27] transition"
            >
              <FiEdit2 size={15} />
              Edit Product
            </button>
          </div>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left */}
          <div className="col-span-12 lg:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-[#EFE5DD] bg-white">
              <img
                src={product?.ProductImage || "/placeholder-image.png"}
                alt="Inventory"
                className="w-full h-[360px] object-cover rounded-2xl"
              />
            </div>
            <div className="mt-6 bg-white border border-[#EFE5DD] rounded-2xl overflow-hidden">
              <div className="p-5">
                <h3 className="text-[12px] uppercase tracking-wider font-bold text-[#8B6D4E] mb-6">
                  Product Details
                </h3>

                <div className="grid grid-cols-2 gap-x-16 gap-y-6">
                  {/* Category */}
                  <div>
                    <p className="text-[11px] uppercase text-[#8B6D4E] font-semibold">
                      Category
                    </p>
                    <p className="mt-1 text-[16px] font-medium text-[#1A1410]">
                      {product?.category?.categoryName}
                    </p>
                  </div>

                  {/* Fabric */}
                  <div>
                    <p className="text-[11px] uppercase text-[#8B6D4E] font-semibold">
                      Fabric
                    </p>
                    <p className="mt-1 text-[16px] font-medium text-[#1A1410]">
                      {product?.fabric_details?.name || "-"}
                    </p>
                  </div>

                  {/* Table Shape */}
                  <div>
                    <p className="text-[11px] uppercase text-[#8B6D4E] font-semibold">
                      Table Shape
                    </p>
                    <p className="mt-1 text-[16px] font-medium text-[#1A1410]">
                      {product?.table_shape}
                    </p>
                  </div>

                  {/* Style */}
                  <div>
                    <p className="text-[11px] uppercase text-[#8B6D4E] font-semibold">
                      Style
                    </p>
                    <p className="mt-1 text-[16px] font-medium text-[#1A1410]">
                      {product?.style}
                    </p>
                  </div>

                  {/* Color */}
                  <div>
                    <p className="text-[11px] uppercase text-[#8B6D4E] font-semibold">
                      Color
                    </p>
                    <p className="mt-1 text-[16px] font-medium text-[#1A1410]">
                      {product?.color_details?.name || "-"}
                    </p>
                  </div>

                  {/* Size */}
                  <div>
                    <p className="text-[11px] uppercase text-[#8B6D4E] font-semibold">
                      Size
                    </p>
                    <p className="mt-1 text-[16px] font-medium text-[#1A1410]">
                      {product?.size}
                    </p>
                  </div>

                  {/* Rental */}
                  <div>
                    <p className="text-[11px] uppercase text-[#8B6D4E] font-semibold">
                      Rental Price / Day
                    </p>
                    <p className="mt-1 text-[16px] font-medium text-[#1A1410]">
                      ₹{product?.rental_price_per_day}
                    </p>
                  </div>

                  {/* RFID */}
                  <div>
                    <p className="text-[11px] uppercase text-[#8B6D4E] font-semibold">
                      RFID Tracking
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-[#16A34A]" />

                      <p className="text-[15px] font-medium text-[#16A34A]">
                        {product?.rfid_tracking_enabled
                          ? "Enabled"
                          : "Disabled"}
                      </p>
                    </div>
                  </div>

                  {/* Stock */}
                  <div>
                    <p className="text-[11px] uppercase text-[#8B6D4E] font-semibold">
                      Stock Quantity
                    </p>
                    <p className="mt-1 text-[16px] font-medium text-[#1A1410]">
                      {product?.total_quantity} Units
                    </p>
                  </div>

                  {/* Rentals */}
                  <div>
                    <p className="text-[11px] uppercase text-[#8B6D4E] font-semibold">
                      Total Rentals
                    </p>
                    <p className="mt-1 text-[16px] font-medium text-[#1A1410]">
                      14 Times
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#EFE5DD]" />

              {/* Description */}
              <div className="p-5">
                <h3 className="text-[12px] uppercase tracking-wider font-bold text-[#8B6D4E] mb-2">
                  Description
                </h3>

                <p className="text-[15px] leading-7 text-[#6B4A2A]">
                  {product?.description}
                </p>
              </div>
            </div>
            {/* Rental History */}
            <div className="mt-4 bg-white border border-[#EFE5DD] rounded-2xl p-5 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="flex items-center gap-2 text-[12px] font-bold text-[#8B6D4E]">
                  <FiActivity size={18} className="text-[#8B6D4E]" />
                  RENTAL HISTORY
                </h3>

                <button className="text-[14px] font-medium text-[#B85C2F] hover:underline">
                  View all
                </button>
              </div>

              {/* History Item */}
              <div className="flex items-center justify-between rounded-xl">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-[#F7EFE7] flex items-center justify-center">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#B86A3D"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21a8 8 0 0 0-16 0" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>

                  {/* Details */}
                  <div>
                    <h4 className="text-[18px] font-semibold text-[#1A1410] leading-none">
                      The Grand Mayfair Hotel
                    </h4>

                    <p className="mt-2 text-[14px] text-[#A38A75]">
                      ORD-2851 · 01 Jul 2025
                    </p>
                  </div>
                </div>

                {/* Status */}
                <span className="px-5 py-2 rounded-lg border border-[#B6F0D3] bg-[#ECFDF5] text-[#0E9F6E] text-[13px] font-semibold uppercase tracking-wide">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-[#EFE5DD] rounded-2xl p-4">
              <p className="text-[12px] uppercase tracking-wider text-[#8B6D4E] font-semibold">
                Stock Summary
              </p>

              <div className="flex items-center justify-between mt-4 mb-6">
                <span className="text-[15px] font-semibold text-[#6B4A2A]">
                  Total Units
                </span>

                <span className="text-[30px] font-bold text-[#1A1410]">
                  {" "}
                  {product?.units || 0}
                </span>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#CBEFD8] bg-[#ECFDF5] p-5 text-center">
                  <h3 className="text-[30px] font-bold text-[#138A4B]">
                    {" "}
                    {product?.available_quantity || 0}
                  </h3>
                  <p className="mt-1 text-[11px] uppercase font-semibold text-[#138A4B]">
                    Available
                  </p>
                </div>

                <div className="rounded-2xl border border-[#D5E3FF] bg-[#EFF6FF] p-5 text-center">
                  <h3 className="text-[30px] font-bold text-[#2F6BFF]">
                    {" "}
                    {product?.on_rent_quantity || 0}
                  </h3>
                  <p className="mt-1 text-[11px] uppercase font-semibold text-[#2F6BFF]">
                    On Rent
                  </p>
                </div>

                <div className="rounded-2xl border border-[#FFE2B6] bg-[#FFFBEB] p-5 text-center">
                  <h3 className="text-[30px] font-bold text-[#E48A00]">
                    {" "}
                    {product?.cleaning_quantity || 0}
                  </h3>
                  <p className="mt-1 text-[11px] uppercase font-semibold text-[#E48A00]">
                    Cleaning
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E8DDFF] bg-[#F5F3FF] p-5 text-center">
                  <h3 className="text-[30px] font-bold text-[#7B3EFF]">
                    {" "}
                    {product?.inspect_quantity || 0}
                  </h3>
                  <p className="mt-1 text-[11px] uppercase font-semibold text-[#7B3EFF]">
                    Inspection
                  </p>
                </div>

                <div className="rounded-2xl border border-[#FFD8D8] bg-[#FFF3F3] p-5 text-center col-span-2">
                  <h3 className="text-[30px] font-bold text-[#E53935]">
                    {" "}
                    {product?.damaged_quantity || 0}
                  </h3>
                  <p className="mt-1 text-[11px] uppercase font-semibold text-[#E53935]">
                    Damaged
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <NewDeleteModal
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message="Deleting this product will remove it from all over the platform. This action cannot be undone."
        itemName={product?.productName}
        loading={deleteLoading}
      />
    </>
  );
}
