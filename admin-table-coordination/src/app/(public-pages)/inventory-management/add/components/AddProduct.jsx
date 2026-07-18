"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  FiArrowLeft,
  FiChevronDown,
  FiBarChart2,
  FiLayers,
  FiImage,
} from "react-icons/fi";

const AddProduct = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isEdit = searchParams.get("mode") === "edit";

  return (
    <div className="min-h-screen bg-[#FAF8F6] px-4 py-5">
      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full border border-[#E9DDD3] bg-white flex items-center justify-center hover:bg-[#F8F3EF] transition"
        >
          <FiArrowLeft className="text-[#4B3A2F]" size={18} />
        </button>

        <h1 className="text-[32px] font-semibold text-[#1A1410]">
          {isEdit ? "Edit Product" : "Add Product"}
        </h1>
      </div>

      {/* Product Information Card */}
      <div className="bg-white border border-[#EFE5DD] rounded-3xl p-7">
        {/* Card Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-full bg-[#FDF4EE] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#FEF3EC] flex items-center justify-center">
              <FiBarChart2 size={18} className="text-[#A0522D]" />
            </div>
          </div>

          <h2 className="text-[20px] font-semibold text-[#2C1A0E]">
            Product Information
          </h2>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Product Name
            </label>

            <input
              type="text"
              placeholder="Enter product name"
              className="w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 outline-none focus:border-[#A85A32]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Category
            </label>

            <div className="relative">
              <select className="w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 appearance-none outline-none focus:border-[#A85A32]">
                <option>Select Category</option>
                <option>Tablecloth</option>
                <option>Napkin</option>
                <option>Chair Cover</option>
                <option>Runner</option>
              </select>

              <FiChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8D7A6C]"
                size={18}
              />
            </div>
          </div>
        </div>

        {/* Short Description */}
        <div className="mt-6">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
            Short Description
          </label>

          <textarea
            rows={4}
            placeholder="Write product description..."
            className="w-full rounded-2xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 py-3 outline-none resize-none focus:border-[#A85A32]"
          />
        </div>
        {/* Remaining Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Table Shape */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Table Shape
            </label>

            <div className="relative">
              <select className="w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 appearance-none outline-none focus:border-[#A85A32]">
                <option>Round</option>
                <option>Rectangle</option>
                <option>Square</option>
                <option>Oval</option>
              </select>

              <FiChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8D7A6C]"
                size={18}
              />
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Style
            </label>

            <div className="relative">
              <select className="w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 appearance-none outline-none focus:border-[#A85A32]">
                <option>Premium</option>
                <option>Classic</option>
                <option>Luxury</option>
                <option>Modern</option>
              </select>

              <FiChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8D7A6C]"
                size={18}
              />
            </div>
          </div>

          {/* Fabric */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Fabric
            </label>

            <div className="relative">
              <select className="w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 appearance-none outline-none focus:border-[#A85A32]">
                <option>Cotton Blend</option>
                <option>Polyester</option>
                <option>Linen</option>
                <option>Silk</option>
              </select>

              <FiChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8D7A6C]"
                size={18}
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Color
            </label>

            <div className="relative">
              <select className="w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 appearance-none outline-none focus:border-[#A85A32]">
                <option>Ivory</option>
                <option>White</option>
                <option>Gold</option>
                <option>Black</option>
              </select>

              <FiChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8D7A6C]"
                size={18}
              />
            </div>
          </div>

          {/* Table Size */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Table Size
            </label>

            <div className="relative">
              <select className="w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 appearance-none outline-none focus:border-[#A85A32]">
                <option>90" × 156"</option>
                <option>90" × 132"</option>
                <option>60" × 120"</option>
              </select>

              <FiChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8D7A6C]"
                size={18}
              />
            </div>
          </div>

          {/* Rental Price */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Rental Price / Day*
            </label>

            <input
              type="text"
              placeholder="₹0.00"
              className="w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 outline-none focus:border-[#A85A32]"
            />
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8C6E5D] mb-2">
              Stock Quantity
            </label>

            <input
              type="number"
              placeholder="0"
              className="w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 outline-none focus:border-[#A85A32]"
            />
          </div>

          {/* RFID Tracking */}
          <div className="flex items-center justify-between px-5 py-4 ">
            <div>
              <h3 className="text-[16px] font-semibold text-[#1A1410]">
                RFID Tracking
              </h3>

              <p className="text-[13px] text-[#9B8A7A] mt-1">
                Enable asset tracking via RFID tags
              </p>
            </div>

            <button
              type="button"
              className="relative w-12 h-7 rounded-full bg-[#A85A32]"
            >
              <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white transition-all"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Image */}
      <div className="bg-white border border-[#EFE5DD] rounded-3xl p-6 mb-6">
        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-[#FDF4EE] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#FEF3EC] flex items-center justify-center">
              <FiLayers size={18} className="text-[#A0522D]" />
            </div>
          </div>

          <h2 className="text-[20px] font-semibold text-[#1A1410]">
            Product Image
          </h2>
        </div>

        {/* Upload Box */}
        <div className="border border-dashed border-[#E7D6C9] rounded-2xl bg-[#FCFAF8] h-[220px] flex flex-col items-center justify-center">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-[#FDF4EE] flex items-center justify-center mb-4">
            <div className="w-8 h-8 rounded-full bg-[#FEF3EC] flex items-center justify-center">
              <FiImage size={18} className="text-[#A0522D]" />
            </div>
          </div>

          <h3 className="text-[16px] font-medium text-[#1A1410]">
            Upload image
          </h3>

          <p className="text-[13px] text-[#9E8D80] mt-1">
            PNG or JPG up to 5 MB
          </p>

          <label className="mt-5 cursor-pointer">
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
            />

            <span className="px-5 py-2 border border-[#D7A07B] rounded-full text-[#A85A32] text-sm font-medium hover:bg-[#FFF4ED] transition">
              Browse Files
            </span>
          </label>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-10 px-5 rounded-xl border border-[#E9DDD3] bg-white text-[#6E6258] font-medium hover:bg-[#F8F3EF] transition"
        >
          Cancel
        </button>

        <button
          type="button"
          className="h-10 px-5 rounded-xl bg-[#A85A32] text-white font-medium hover:bg-[#8F4D2A] transition"
        >
          {isEdit ? "Save Changes" : "Publish Product"}
        </button>
      </div>
    </div>
  );
};

export default AddProduct;
