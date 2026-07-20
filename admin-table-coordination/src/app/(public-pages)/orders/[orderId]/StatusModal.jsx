"use client";

import { FiCheckCircle, FiX } from "react-icons/fi";

export default function StatusModal({ open, onClose, orderId = "ORD-7821" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-[2px] px-4">
      <div className="w-full max-w-[500px] rounded-[22px] bg-white shadow-2xl">

        {/* Close Button */}
        <div className="flex justify-end p-5 pb-0">
          <button
            onClick={onClose}
            className="text-[#9A9A9A] hover:text-[#555]"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="px-8 pb-8 -mt-2">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-[#F7F1EC] flex items-center justify-center mb-7">
            <FiCheckCircle
              size={24}
              className="text-[#A85A32]"
            />
          </div>

          {/* Heading */}
          <h2 className="text-[25px] leading-none font-bold text-[#1C1917] mb-4">
            Mark as Returned?
          </h2>

          {/* Description */}
          <p className="text-[16px] leading-6 text-[#78716C]">
            You are about to mark order{" "}
            <span className="font-medium text-[#8B8B8B]">{orderId}</span>{" "}
            as returned. Inventory will be updated and the item(s) will be
            sent for quality inspection before restocking.
          </p>

          {/* Buttons */}
          <div className="flex justify-end items-center gap-6 mt-12">
            <button
              onClick={onClose}
              className="text-[14px] font-medium text-[#666] hover:text-[#222]"
            >
              Cancel
            </button>

            <button
              className="bg-[#A85A32] hover:bg-[#944B25] text-white px-5 py-2 rounded-xl text-[14px] font-semibold shadow-md transition"
            >
              Mark Returned
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}