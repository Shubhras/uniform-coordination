"use client";

import { FiAlertTriangle } from "react-icons/fi";
import Dialog from "@/components/ui/Dialog";

const NewDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Product",
  message = "Deleting this product will remove it from all over the platform.",
  loading = false,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      className="w-full max-w-[490px]"
      contentClassName="!p-0 overflow-hidden rounded-2xl bg-white"
    >
      <div className="bg-white">
        {/* Body */}
        <div className="px-6 pt-7 pb-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF2F2]">
              <FiAlertTriangle
                size={20}
                className="text-[#EF4444] fill-[#EF4444]"
              />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h2 className="text-[24px] font-semibold text-[#1F2937]">
                {title}
              </h2>

              <p className="mt-3 text-[15px] leading-6 text-[#6B7280]">
                {message}{" "}
                <span className="font-medium text-[#374151] underline">
                  This action cannot be undone.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[#ECECEC] px-6 py-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-10 rounded-md border border-[#E5E7EB] bg-white px-5 text-sm font-medium text-[#4B5563] transition hover:bg-[#F9FAFB] disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="h-10 rounded-md bg-[#EF4444] px-5 text-sm font-medium text-white transition hover:bg-[#DC2626] disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default NewDeleteModal;
