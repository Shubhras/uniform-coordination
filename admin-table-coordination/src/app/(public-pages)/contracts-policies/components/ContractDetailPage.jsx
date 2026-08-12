"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft, FiDownload } from "react-icons/fi";
import StatusBadge, { getStatusColors } from "./StatusBadge";
import { useTranslations } from "next-intl";

const DownloadButton = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-lg border border-[#EEDDD1] bg-[#FFF8F3] px-3 py-2 text-xs font-medium text-[#C2703D] hover:bg-[#FFEFE5] transition-colors"
  >
    <FiDownload size={13} />
    {label}
  </button>
);

const ContractDetailPage = ({ contract }) => {
  const t = useTranslations("contractPolicies");
  const router = useRouter();
  const colors = getStatusColors(contract.status);
  const isSigned = contract.status === "Signed";

  return (
    <div className="min-h-screen bg-[#FFFCFA] p-3 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EDE0D7] bg-white text-[#6F6058]"
          >
            <FiArrowLeft size={14} />
          </button>

          <h1 className="text-[18px] font-bold text-[#2E231E] sm:text-[28px]">
            {contract.contractId}
          </h1>

          <StatusBadge status={contract.status} />
        </div>

        <button
          type="button"
          onClick={() =>
            router.push(`/contracts-policies/${contract.contractId}/status`)
          }
          className="rounded-lg border border-[#F1DED1] bg-[#FFF7F1] px-4 py-2 text-xs font-medium text-[#C2703D]"
        >
          {t("viewStatus.viewStatus")}
        </button>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-[#F1E6DE] bg-white">
          <div className="border-b border-[#F5ECE6] px-5 py-3">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7A6E66]">
              {t("companyInfo")}
            </h3>
          </div>

          <div className="p-5">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-[13px] font-semibold text-[#7A6E66]">
                  {t("companyName")}
                </p>
                <p className="mt-1 text-[15px] font-semibold text-[#1A1714]">
                  {contract.companyName}
                </p>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-[#7A6E66]">
                  {t("contactPerson")}
                </p>
                <p className="mt-1 text-[15px] font-semibold text-[#1A1714]">
                  {contract.contactPerson}
                </p>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-[#7A6E66]">
                  {t("businessEmail")}
                </p>
                <p className="mt-1 text-[15px] font-semibold text-[#1A1714]">
                  {contract.businessEmail}
                </p>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-[#7A6E66]">
                  {t("phone")}
                </p>
                <p className="mt-1 text-[15px] font-semibold text-[#1A1714]">
                  {contract.phoneNumber}
                </p>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-[#7A6E66]">
                  {t("companyAdd")}
                </p>
                <p className="mt-1 max-w-[260px] text-[15px] font-semibold leading-5 text-[#1A1714]">
                  {contract.companyAddress}
                </p>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-[#7A6E66]">
                  {t("userType")}
                </p>
                <p className="mt-1 text-[15px] font-semibold text-[#1A1714]">
                  {contract.userType}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#F1E6DE] bg-white">
          <div className="border-b border-[#F5ECE6] px-5 py-3">
            <h3 className="text-[12px] font-semibold text-[#7A6E66]">
              {t("ordercontract")}
            </h3>
          </div>

          <div className="p-5">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              <div>
                <p className="text-[10px] font-semibold text-[#9B8D84]">
                  {t("orderid")}
                </p>
                <p className="mt-1 text-sm font-medium text-[#3E312A]">
                  {contract.quotationNo}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-[#9B8D84]">
                  {t("orderDate")}
                </p>
                <p className="mt-1 text-sm font-medium text-[#3E312A]">
                  {contract.quotationDate}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-[#9B8D84]">
                  {t("contractid")}
                </p>
                <p className="mt-1 text-sm font-medium text-[#3E312A]">
                  {contract.contractIdShort}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9B8D84]">
                  {contract.signedOnLabel}
                </p>
                <p className="mt-1 text-sm font-medium text-[#3E312A]">
                  {contract.signedOnValue}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9B8D84]">
                  {contract.contractStatusLabel}
                </p>
                <p
                  className={`mt-1 text-sm font-medium ${
                    isSigned ? "text-[#007A55]" : colors.accent
                  }`}
                >
                  {contract.contractStatusValue}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {contract.downloads.map((label) => {
                const handleDownload = () => {
                  let docName = "";
                  if (label === "Download Contract PDF") {
                    docName = "Contract PDF";
                  } else if (label === "Download Signed PDF") {
                    docName = "Signed PDF";
                  }
                  const doc = contract.documents?.find((d) => d.label === docName);
                  if (doc?.url) {
                    window.open(doc.url, "_blank");
                  } else {
                    alert(`${docName} not available`);
                  }
                };
                return <DownloadButton key={label} label={label} onClick={handleDownload} />;
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
          {/* Rental Information */}
          <div className="rounded-2xl border border-[#F1E6DE] bg-white">
            <div className="border-b border-[#F5ECE6] px-5 py-3">
              <h3 className="text-[12px] font-semibold text-[#7A6E66]">
                {t("rentalInfo")}
              </h3>
            </div>

            <div className="p-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <p className="text-[10px] font-semibold text-[#9B8D84]">
                    {t("rentalStart")}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#3E312A]">
                    {contract.rentalStart}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-[#9B8D84]">
                    {t("rentalEnd")}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#3E312A]">
                    {contract.rentalEnd}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-[#9B8D84]">
                    {t("venuType")}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#3E312A]">
                    {contract.venueType}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-[#9B8D84]">
                    {t("venuName")}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#3E312A]">
                    {contract.venueName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Notes */}
          <div className="rounded-2xl border border-[#F1E6DE] bg-white">
            <div className="border-b border-[#F5ECE6] px-5 py-3">
              <h3 className="text-[11px] font-semibold text-[#B6876A]">
                {t("customerNotes")}
              </h3>
            </div>

            <div className="p-5">
              <p className="text-sm leading-6 text-[#7A6C64]">
                {contract.customerNotes}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#F1E6DE] bg-white">
          <div className="border-b border-[#F5ECE6] px-5 py-4">
            <h3 className="text-[18px] font-semibold text-[#1E130C]">
              {t("requestedItems")}
            </h3>
            <p className="mt-1 text-xs font-semibold text-[#A09186]">
              {contract.requestedItemsNote}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[880px] w-full">
              <thead>
                <tr className="bg-[#FCF7F3] text-left text-[11px] uppercase tracking-[0.08em] text-[#A09186]">
                  <th className="px-5 py-3">{t("itemColumn")}</th>
                  <th className="px-5 py-3">{t("categoryColumn")}</th>
                  <th className="px-5 py-3">{t("requested")}</th>
                  <th className="px-5 py-3">{t("availabilityColumn")}</th>
                  <th className="px-5 py-3 text-right">{t("unitPerDay")}</th>
                </tr>
              </thead>
              <tbody>
                {contract.items.map((item) => (
                  <tr
                    key={item.item}
                    className="border-t border-[#F7EEE7] text-sm text-[#43362F]"
                  >
                    <td className="px-5 py-4 font-medium">{item.item}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-[#F5EEE8] px-2.5 py-1 text-[11px] text-[#8B776A]">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">{item.requested}</td>
                    <td className="px-5 py-4 text-[#007A55]">
                      {item.availability}
                    </td>
                    <td className="px-5 py-4 text-right">{item.unitRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#F5ECE6] px-5 py-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9B8D84]">
              {t("orderSummary")}
            </h3>

            <div className="mt-4 grid gap-2 text-sm text-[#8B7C73]">
              <div className="flex items-center justify-between">
                <span>{t("items")}</span>
                <span className="font-medium text-[#463932]">
                  {contract.summary.items}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t("rentalDays")}</span>
                <span className="font-medium text-[#463932]">
                  {contract.summary.rental_days}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t("subtotal")}</span>
                <span className="font-medium text-[#463932]">
                  {contract.summary.subtotal}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t("discount")}</span>
                <span className="font-medium text-[#53A998]">
                  {contract.summary.discount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t("delivery")}</span>
                <span className="font-medium text-[#53A998]">
                  {contract.summary.delivery}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-[#F5ECE6] pt-3 text-[15px] font-semibold text-[#302520]">
                <span>{t("total")}</span>
                <span className="text-[#C2703D]">{contract.summary.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetailPage;
