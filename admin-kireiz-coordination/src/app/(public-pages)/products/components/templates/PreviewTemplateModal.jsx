"use client";

import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { FiX } from "react-icons/fi";

export default function PreviewTemplateDialog({ isOpen, onClose, template }) {
  if (!template) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      className="w-full md:min-w-[700px]"
      contentClassName="!p-0 !h-auto"
    >
      <div className="bg-white rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-[#1C2C56]">
            Template Preview
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Image */}
          <div className="flex justify-center mb-8">
            <img
              src={template?.templateImage}
              alt={template?.templateName}
              className="w-52 h-52 object-cover rounded-xl border border-[#E2E8F0]"
            />
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-5">
            <div>
              <p className="text-sm text-[#64748B]">Template Name</p>
              <p className="font-medium text-[#1C2C56] mt-1">
                {template?.templateName}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#64748B]">Part Name</p>
              <p className="font-medium text-[#1C2C56] mt-1">
                {template?.partName}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#64748B]">Part Category</p>
              <p className="font-medium text-[#1C2C56] mt-1">
                {template?.partCategory}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#64748B]">Usage Count</p>
              <p className="font-medium text-[#1C2C56] mt-1">
                {template?.partUsageCount}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#64748B]">Status</p>

              <span
                className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                  template?.isActive
                    ? "bg-[#EEF2FF] text-[#1C4FA8]"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {template?.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div>
              <p className="text-sm text-[#64748B]">Created On</p>
              <p className="font-medium text-[#1C2C56] mt-1">
                {new Date(template?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-2 flex justify-end">
          <Button
            variant="plain"
            onClick={onClose}
            className="bg-blue-100 rounded-lg"
          >
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
