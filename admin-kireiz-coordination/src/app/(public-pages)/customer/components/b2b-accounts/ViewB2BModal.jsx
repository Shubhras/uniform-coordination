"use client";

import Dialog from "@/components/ui/Dialog";
import { useTranslations } from "next-intl";
import { FiX, FiMail, FiPhone, FiMessageSquare, FiSend } from "react-icons/fi";

const ViewB2BModal = ({ isOpen, onClose, account }) => {
  const t = useTranslations("customerSalesRep.b2bAccounts.viewAccountModal");

  if (!isOpen || !account) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      width={420}
    >
      <div className="relative bg-white rounded-2xl">

        {/* Header */}
        <div className="px-6 pt-6 pb-5 text-center">
          <p className="text-[11px] uppercase tracking-wider text-[#B8C2D0] font-semibold">
            {t("salesRepTitle")}
          </p>

          <div className="relative w-20 h-20 mx-auto mt-4">
            <img
              src={
                account.profile_image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  account.name,
                )}`
              }
              alt=""
              className="w-full h-full rounded-full object-cover shadow-md"
            />

            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
          </div>

          <h2 className="mt-4 text-[30px] font-normal text-[#364152]">
            {account.name}
          </h2>

          <p className="mt-1 text-[15px] text-[#94A3B8]">
            {account.designation || ""}
          </p>
        </div>

        {/* Contact */}
        <div className="px-5 space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-4">
            <div className="w-10 h-10 rounded-lg bg-[#1C4FA8] flex items-center justify-center text-white">
              <FiMail size={17} />
            </div>

            <div>
              <p className="text-xs text-gray-400">{t("email")}</p>
              <p className="text-sm text-[#364152]">{account.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-4">
            <div className="w-10 h-10 rounded-lg bg-[#1C4FA8] flex items-center justify-center text-white">
              <FiPhone size={17} />
            </div>

            <div>
              <p className="text-xs text-gray-400">{t("phone")}</p>
              <p className="text-sm text-[#364152]">{account.mobile || "-"}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-5">
          <div className="flex gap-3">
            <button className="flex-1 h-11 rounded-lg bg-[#1C4FA8] text-white flex items-center justify-center gap-2">
              <FiMessageSquare size={17} />
              {t("message")}
            </button>

            <button className="w-11 h-11 rounded-lg bg-[#F1F5F9] flex items-center justify-center">
              <FiPhone className="text-[#1C4FA8]" />
            </button>

            <button className="w-11 h-11 rounded-lg bg-[#F1F5F9] flex items-center justify-center">
              <FiMail className="text-[#1C4FA8]" />
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            {t("availability")}
          </p>
        </div>
      </div>
    </Dialog>
  );
};

export default ViewB2BModal;
