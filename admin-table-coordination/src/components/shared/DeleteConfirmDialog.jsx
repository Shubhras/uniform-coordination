"use client";

import { FiAlertTriangle } from "react-icons/fi";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";

const DeleteConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Confirmation",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    itemName = "",
    loading = false,
}) => {
    const t = useTranslations("deleteConfirmDialog");
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            className="w-full md:min-w-[440px] max-w-md mx-auto "
            contentClassName="!p-0 !h-auto"
        >
            <div className="flex flex-col">
                {/* Header */}
                <div className="px-6 pt-6 pb-2 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <FiAlertTriangle className="text-red-500" size={28} />
                    </div>

                    <h2 className="text-lg font-semibold text-[#1C2C56]">
                        {title}
                    </h2>

                    <p className="text-sm text-[#64748B] mt-2 max-w-xs">
                        {message}
                    </p>

                    {itemName && (
                        <div className="mt-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2">
                            <p className="text-sm font-medium text-[#1E293B]">
                                &quot;{itemName}&quot;
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-5 flex justify-center gap-3">
                    <Button
                        variant="plain"
                        size="sm"
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 bg-blue-100 rounded-lg"
                    >
                         {t("cancel")}
                    </Button>

                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                         {loading ? t("deleting") : t("delete")}
                    </button>
                </div>
            </div>
        </Dialog>
    );
};

export default DeleteConfirmDialog;
