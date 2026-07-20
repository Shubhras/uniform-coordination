"use client";

import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiDownload,
} from "react-icons/fi";
import StatusBadge, { getStatusColors } from "./StatusBadge";

const DetailCard = ({ title, children, className = "" }) => (
  <div className={`rounded-2xl border border-[#F1E6DE] bg-white ${className}`}>
    <div className="border-b border-[#F5ECE6] px-5 py-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B6876A]">
        {title}
      </h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const InfoPair = ({ label, value, valueClassName = "" }) => (
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9B8D84]">
      {label}
    </p>
    <p className={`mt-1 text-sm font-medium text-[#3E312A] ${valueClassName}`}>
      {value}
    </p>
  </div>
);

const DownloadButton = ({ label }) => (
  <button
    type="button"
    className="inline-flex items-center gap-2 rounded-lg border border-[#EEDDD1] bg-[#FFF8F3] px-3 py-2 text-xs font-medium text-[#C2703D]"
  >
    <FiDownload size={13} />
    {label}
  </button>
);

const ContractDetailPage = ({ contract }) => {
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
          View Status
        </button>
      </div>

      <div className="space-y-4">
        <DetailCard title="Company Information">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <InfoPair label="ABC Hotels Pvt Ltd" value={contract.companyName} />
            <InfoPair label="Contact Person" value={contract.contactPerson} />
            <InfoPair label="Business Email" value={contract.businessEmail} />
            <InfoPair label="Phone Number" value={contract.phoneNumber} />
            <InfoPair
              label="Company Address"
              value={contract.companyAddress}
              valueClassName="max-w-[260px] text-[13px] leading-5"
            />
            <InfoPair label="User Type" value={contract.userType} />
          </div>
        </DetailCard>

        <DetailCard title="Quotation & Contract Information">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            <InfoPair label="Quotation No" value={contract.quotationNo} />
            <InfoPair label="Quotation Date" value={contract.quotationDate} />
            <InfoPair label="Contract ID" value={contract.contractIdShort} />
            <InfoPair label={contract.signedOnLabel} value={contract.signedOnValue} />
            <InfoPair
              label={contract.contractStatusLabel}
              value={contract.contractStatusValue}
              valueClassName={isSigned ? "text-[#17A673]" : colors.accent}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {contract.downloads.map((label) => (
              <DownloadButton key={label} label={label} />
            ))}
          </div>
        </DetailCard>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
          <DetailCard title="Rental Information">
            <div className="grid gap-5 md:grid-cols-2">
              <InfoPair label="Rental Start" value={contract.rentalStart} />
              <InfoPair label="Rental End" value={contract.rentalEnd} />
              <InfoPair label="Venue Type" value={contract.venueType} />
              <InfoPair label="Venue Name" value={contract.venueName} />
            </div>
          </DetailCard>

          <DetailCard title="Customer Notes">
            <p className="text-sm leading-6 text-[#7A6C64]">
              {contract.customerNotes}
            </p>
          </DetailCard>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#F1E6DE] bg-white">
          <div className="border-b border-[#F5ECE6] px-5 py-4">
            <h3 className="text-sm font-semibold text-[#2E231E]">
              Requested Items
            </h3>
            <p className="mt-1 text-xs text-[#A09186]">
              {contract.requestedItemsNote}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[880px] w-full">
              <thead>
                <tr className="bg-[#FCF7F3] text-left text-[11px] uppercase tracking-[0.08em] text-[#A09186]">
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Requested</th>
                  <th className="px-5 py-3">Availability</th>
                  <th className="px-5 py-3 text-right">Unit Rate/Day</th>
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
                    <td className="px-5 py-4 text-[#17A673]">{item.availability}</td>
                    <td className="px-5 py-4 text-right">{item.unitRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#F5ECE6] px-5 py-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9B8D84]">
              Quote Summary
            </h3>

            <div className="mt-4 grid gap-2 text-sm text-[#8B7C73]">
              <div className="flex items-center justify-between">
                <span>Items</span>
                <span className="font-medium text-[#463932]">
                  {contract.summary.items}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Rental Days</span>
                <span className="font-medium text-[#463932]">
                  {contract.summary.rentalDays}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[#463932]">
                  {contract.summary.subtotal}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Discount (%)</span>
                <span className="font-medium text-[#53A998]">
                  {contract.summary.discount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery</span>
                <span className="font-medium text-[#53A998]">
                  {contract.summary.delivery}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-[#F5ECE6] pt-3 text-[15px] font-semibold text-[#302520]">
                <span>Total</span>
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
