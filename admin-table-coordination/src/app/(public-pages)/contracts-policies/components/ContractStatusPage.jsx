"use client";

import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiDownload,
  FiFileText,
  FiSend,
} from "react-icons/fi";
import StatusBadge, { getStatusColors } from "./StatusBadge";

const iconMap = {
  done: FiCheck,
  pending: FiClock,
  complete: FiCheck,
};

const activityIconMap = [FiFileText, FiSend, FiFileText, FiCheck];

const ContractStatusPage = ({ contract }) => {
  const router = useRouter();
  const colors = getStatusColors(contract.status);

  return (
    <div className="min-h-screen bg-[#FFFCFA] p-3 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center gap-3">
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

      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#F1E6DE] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#2E231E]">
              Signature Timeline
            </h2>
            <p className="mt-1 text-xs text-[#A09186]">
              Contract {contract.contractId} · Meridian Events Group
            </p>

            <div className="mt-6 space-y-6">
              {contract.timeline.map((step, index) => {
                const Icon = iconMap[step.state] || FiClock;
                const isPending = step.state === "pending";
                const isComplete = step.state === "complete";

                return (
                  <div key={step.title} className="relative flex gap-4">
                    {index < contract.timeline.length - 1 && (
                      <div className="absolute left-[15px] top-9 h-[44px] w-px bg-[#ECDDD2]" />
                    )}

                    <div
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border ${
                        isPending
                          ? "border-[#E4CDBD] bg-white text-[#D0A78A]"
                          : isComplete
                            ? "border-[#007A55] bg-[#007A55] text-white"
                            : "border-[#B96D38] bg-[#B96D38] text-white"
                      }`}
                    >
                      <Icon size={14} />
                    </div>

                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isPending ? "text-[#9A8A80]" : "text-[#3F332C]"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="mt-1 text-xs text-[#B0A298]">{step.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#F1E6DE] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#2E231E]">
              Activity History
            </h2>
            <p className="mt-1 text-xs text-[#A09186]">All contract events</p>

            <div className="mt-5 space-y-5">
              {contract.activityHistory.map((entry, index) => {
                const Icon = activityIconMap[index] || FiFileText;

                return (
                  <div key={`${entry.title}-${index}`} className="flex gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF4EC] text-[#C2703D]">
                      <Icon size={12} />
                    </div>
                    <div>
                      <p className="text-sm text-[#54463F]">{entry.title}</p>
                      <p className="mt-1 text-xs text-[#AE9E92]">{entry.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#F1E6DE] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#2E231E]">
              Status Summary
            </h2>

            <div className="mt-5 space-y-4 text-xs uppercase tracking-[0.08em] text-[#9E8F83]">
              <div className="flex items-center justify-between gap-4">
                <span>Current Status</span>
                <span className={`font-semibold ${colors.badge} rounded-full px-2.5 py-1 normal-case tracking-normal`}>
                  {contract.statusSummary.currentStatus}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>CloudSign</span>
                <span
                  className={`text-right text-[13px] font-semibold normal-case tracking-normal ${
                    contract.status === "Signed"
                      ? "text-[#007A55]"
                      : "text-[#F08A24]"
                  }`}
                >
                  {contract.statusSummary.cloudsign}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Contract Value</span>
                <span className="text-[15px] font-semibold normal-case tracking-normal text-[#C2703D]">
                  {contract.statusSummary.contractValue}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Generated On</span>
                <span className="text-[13px] font-medium normal-case tracking-normal text-[#53463E]">
                  {contract.statusSummary.generatedOn}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#F1E6DE] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#2E231E]">Documents</h2>

            <div className="mt-5 space-y-3">
              {contract.documents.map((document) => (
                <div
                  key={document.label}
                  className="flex items-center justify-between rounded-xl bg-[#FCF7F3] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#C2703D]">
                      <FiFileText size={13} />
                    </div>
                    <span
                      className={`text-sm ${
                        document.enabled ? "text-[#43362F]" : "text-[#C6B8AE]"
                      }`}
                    >
                      {document.label}
                    </span>
                  </div>

                  {document.enabled ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (document.url) {
                          window.open(document.url, "_blank");
                        }
                      }}
                      className="text-[#C2703D] hover:text-[#9F5425]"
                    >
                      <FiDownload size={14} />
                    </button>
                  ) : (
                    <span className="text-xs text-[#D0C1B6]">NA</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractStatusPage;
