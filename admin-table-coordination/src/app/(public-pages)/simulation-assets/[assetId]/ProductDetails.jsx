"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft, FiTrash2, FiEdit2, FiActivity } from "react-icons/fi";

export default function ViewInventory() {
  const router = useRouter();

  return (
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
            Product details
          </h1>
        </div>


      </div>

      {/* Main Section */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left */}
        <div className="col-span-12 lg:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-[#EFE5DD] bg-white">
            <img
              src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1400"
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
                    Tablecloth
                  </p>
                </div>

                {/* Fabric */}
                <div>
                  <p className="text-[11px] uppercase text-[#8B6D4E] font-semibold">
                    Fabric
                  </p>
                  <p className="mt-1 text-[16px] font-medium text-[#1A1410]">
                    Velvet
                  </p>
                </div>

                {/* Table Shape */}
                <div>
                  <p className="text-[11px] uppercase text-[#8B6D4E] font-semibold">
                    Table Shape
                  </p>
                  <p className="mt-1 text-[16px] font-medium text-[#1A1410]">
                    Round
                  </p>
                </div>

                {/* Style */}
                <div>
                  <p className="text-[11px] uppercase text-[#8B6D4E] font-semibold">
                    Style
                  </p>
                  <p className="mt-1 text-[16px] font-medium text-[#1A1410]">
                    Premium
                  </p>
                </div>

                {/* Color */}
                <div>
                  <p className="text-[11px] uppercase text-[#8B6D4E] font-semibold">
                    Color
                  </p>
                  <p className="mt-1 text-[16px] font-medium text-[#1A1410]">
                    Ivory
                  </p>
                </div>

                {/* Size */}
                <div>
                  <p className="text-[11px] uppercase text-[#8B6D4E] font-semibold">
                    Size
                  </p>
                  <p className="mt-1 text-[16px] font-medium text-[#1A1410]">
                    90" × 156"
                  </p>
                </div>

                {/* Rental */}
                <div>
                  <p className="text-[11px] uppercase text-[#8B6D4E] font-semibold">
                    Rental Price / Day
                  </p>
                  <p className="mt-1 text-[16px] font-medium text-[#1A1410]">
                    ₹12.00
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
                      Enabled
                    </p>
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <p className="text-[11px] uppercase text-[#8B6D4E] font-semibold">
                    Stock Quantity
                  </p>
                  <p className="mt-1 text-[16px] font-medium text-[#1A1410]">
                    8 Units
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
                Regal throne chair upholstered in plush ivory velvet with an
                ornate gold-leaf carved mahogany frame. The statement piece for
                wedding head tables, VIP seating areas, luxury banquets and
                premium event décor. Designed to provide both elegance and
                comfort while complementing sophisticated event themes.
              </p>
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

              <span className="text-[30px] font-bold text-[#1A1410]">8</span>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[#CBEFD8] bg-[#ECFDF5] p-5 text-center">
                <h3 className="text-[30px] font-bold text-[#138A4B]">4</h3>
                <p className="mt-1 text-[11px] uppercase font-semibold text-[#138A4B]">
                  Available
                </p>
              </div>

              <div className="rounded-2xl border border-[#D5E3FF] bg-[#EFF6FF] p-5 text-center">
                <h3 className="text-[30px] font-bold text-[#2F6BFF]">2</h3>
                <p className="mt-1 text-[11px] uppercase font-semibold text-[#2F6BFF]">
                  On Rent
                </p>
              </div>

              <div className="rounded-2xl border border-[#FFE2B6] bg-[#FFFBEB] p-5 text-center">
                <h3 className="text-[30px] font-bold text-[#E48A00]">1</h3>
                <p className="mt-1 text-[11px] uppercase font-semibold text-[#E48A00]">
                  Cleaning
                </p>
              </div>

              <div className="rounded-2xl border border-[#E8DDFF] bg-[#F5F3FF] p-5 text-center">
                <h3 className="text-[30px] font-bold text-[#7B3EFF]">0</h3>
                <p className="mt-1 text-[11px] uppercase font-semibold text-[#7B3EFF]">
                  Inspection
                </p>
              </div>

              <div className="rounded-2xl border border-[#FFD8D8] bg-[#FFF3F3] p-5 text-center col-span-2">
                <h3 className="text-[30px] font-bold text-[#E53935]">1</h3>
                <p className="mt-1 text-[11px] uppercase font-semibold text-[#E53935]">
                  Damaged
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}