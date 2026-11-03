"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { FiCheck, FiX } from "react-icons/fi";

const STAGES = [
  {
    key: "received",
    title: "Received",
    subtitle: "Request submitted",
    statusValue: "received",
  },
  {
    key: "quoting",
    title: "Quoting",
    subtitle: "Preparing proposal",
    statusValue: "pending",
  },
  {
    key: "submitted",
    title: "Submitted",
    subtitle: "Proposal ready",
    statusValue: "sent",
  },
  {
    key: "agreed",
    title: "Agreed",
    subtitle: "Contract finalized",
    statusValue: "approved",
  },
];

export default function QuotationWorkflowProgression({
  status = "",
  currentStatus = "",
  workflowStatus = "",
  onStatusChange,
}) {
  const t = useTranslations(
    "customerSalesRep.quotationHistory.editQuotationPage"
  );

  // Use quotation status as the primary source of truth from the form
  const raw = String(status || currentStatus || workflowStatus || "")
    .toLowerCase()
    .trim();

  // Map the current quotation status to an active step index (0 - 3)
  const getActiveStageIndex = () => {
    if (!raw) return 1; // Default to Quoting (Pending) if status is not yet loaded
    if (raw === "received") return 0;
    if (raw === "pending" || raw === "quoting") return 1;
    if (raw === "sent" || raw === "submitted") return 2;
    if (raw === "approved" || raw === "accepted" || raw === "agreed") return 3;
    if (raw === "cancelled" || raw === "declined") return 3;
    return 1;
  };

  const activeIndex = getActiveStageIndex();
  const isCancelled = raw === "cancelled" || raw === "declined";

  const currentStageLabel = isCancelled
    ? "Declined"
    : STAGES[activeIndex]?.title || "Quoting";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1C2C56] inline-block" />
          <h2 className="text-xs sm:text-sm font-bold tracking-wider text-[#1C2C56] uppercase">
            {t.has?.("workflowProgressionTitle")
              ? t("workflowProgressionTitle")
              : "QUOTATION WORKFLOW PROGRESSION"}
          </h2>
        </div>

        <div className="text-xs sm:text-sm text-gray-500 font-normal">
          {t.has?.("currentStage") ? t("currentStage") : "Current Stage:"}{" "}
          <span
            className={`font-bold ml-1 ${activeIndex === 3 && !isCancelled
              ? "text-[#10B981]"
              : isCancelled
                ? "text-red-600"
                : "text-[#1C2C56]"
              }`}
          >
            {currentStageLabel}
          </span>
        </div>
      </div>

      {/* Stepper Progression */}
      <div className="overflow-x-auto">
        <div className="min-w-[620px] pt-7 pb-3 px-6 sm:px-12">
          <div className="relative flex items-start justify-between">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx < activeIndex;
              const isActive = idx === activeIndex;

              const stageTitle =
                idx === 3 && isCancelled ? "Declined" : stage.title;
              const stageSubtitle =
                idx === 3 && isCancelled
                  ? "Request declined"
                  : stage.subtitle;

              return (
                <div
                  key={stage.key}
                  className="relative flex-1 flex flex-col items-center text-center"
                >
                  {/* Connecting Line to next step */}
                  {idx < STAGES.length - 1 && (
                    <div
                      className={`absolute top-5 left-1/2 w-full h-[2px] -translate-y-1/2 ${idx < activeIndex ? "bg-[#0F2F57]" : "bg-gray-200"
                        }`}
                    />
                  )}

                  {/* Step Circle Button */}
                  <button
                    type="button"
                    onClick={() => onStatusChange?.(stage.statusValue)}
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${onStatusChange
                      ? "cursor-pointer hover:scale-105"
                      : "cursor-default"
                      } ${isCompleted
                        ? "bg-[#0F2F57] text-white shadow-sm"
                        : isActive
                          ? isCancelled
                            ? "bg-red-500 text-white ring-4 ring-red-100 shadow-sm"
                            : idx === 3
                              ? "bg-[#10B981] text-white ring-4 ring-[#D1FAE5] shadow-sm"
                              : "bg-[#0F2F57] text-white ring-4 ring-blue-100 shadow-sm"
                          : "bg-white border-2 border-gray-300 text-gray-400"
                      }`}
                    title={`Stage: ${stageTitle}`}
                  >
                    {isCompleted ? (
                      <FiCheck size={18} strokeWidth={2.5} className="text-white" />
                    ) : isActive ? (
                      isCancelled ? (
                        <FiX size={18} strokeWidth={2.5} className="text-white" />
                      ) : (
                        <FiCheck size={18} strokeWidth={2.5} className="text-white" />
                      )
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                    )}
                  </button>

                  {/* Labels */}
                  <div className="mt-3 flex flex-col items-center">
                    <span
                      className={`text-sm font-bold tracking-tight ${isActive
                        ? isCancelled
                          ? "text-red-600"
                          : idx === 3
                            ? "text-[#10B981]"
                            : "text-[#1C2C56]"
                        : isCompleted
                          ? "text-[#1C2C56]"
                          : "text-gray-400"
                        }`}
                    >
                      {stageTitle}
                    </span>

                    <span className="text-xs text-gray-400 mt-1 whitespace-nowrap">
                      {stageSubtitle}
                    </span>

                    {/* Active Pill Badge */}
                    {isActive && (
                      <span
                        className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${isCancelled
                          ? "bg-red-50 text-red-600"
                          : idx === 3
                            ? "bg-[#E8F8F0] text-[#10B981]"
                            : "bg-blue-50 text-[#1C4FA8]"
                          }`}
                      >
                        {isCancelled ? "Cancelled" : "Active"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
