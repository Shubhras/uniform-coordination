"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { FiCheck, FiX } from "react-icons/fi";


export default function QuotationWorkflowProgression({
  status = "",
  currentStatus = "",
  workflowStatus = "",
  onStatusChange,
  onRequestSubmit,
  onRequestCancel,
  saving = false,
}) {
  const t = useTranslations(
    "customerSalesRep.quotationHistory.editQuotationPage"
  );

  const stages = [
    {
      key: "received",
      title: t.has?.("stageReceived") ? t("stageReceived") : "Received",
      subtitle: t.has?.("stageReceivedSub")
        ? t("stageReceivedSub")
        : "Request submitted",
      statusValue: "pending",
    },
    {
      key: "quoting",
      title: t.has?.("stageQuoting") ? t("stageQuoting") : "Quoting",
      subtitle: t.has?.("stageQuotingSub")
        ? t("stageQuotingSub")
        : "Preparing proposal",
      statusValue: "received",
    },
    {
      key: "submitted",
      title: t.has?.("stageSubmitted") ? t("stageSubmitted") : "Submitted",
      subtitle: t.has?.("stageSubmittedSub")
        ? t("stageSubmittedSub")
        : "Proposal ready",
      statusValue: "accepted",
    },
    {
      key: "agreed",
      title: t.has?.("stageAgreed") ? t("stageAgreed") : "Agreed",
      subtitle: t.has?.("stageAgreedSub")
        ? t("stageAgreedSub")
        : "Contract finalized",
      statusValue: "approved",
    },
    {
      key: "sent",
      title: t.has?.("stageSent") ? t("stageSent") : "Sent",
      subtitle: t.has?.("stageSentSub")
        ? t("stageSentSub")
        : "Quotation sent",
      statusValue: "sent",
    },
  ];

  // Use quotation status as the primary source of truth from the form
  const raw = String(status || currentStatus || workflowStatus || "")
    .toLowerCase()
    .trim();

  // Map the current quotation status to an active step index (0 - 4)
  const getActiveStageIndex = () => {
    if (!raw) return 0;
    if (raw === "pending") return 0;
    if (raw === "received" || raw === "quoting") return 1;
    if (raw === "accepted" || raw === "submitted") return 2;
    if (raw === "approved" || raw === "agreed") return 3;
    if (raw === "sent") return 4;
    if (raw === "cancelled" || raw === "declined") return 4;
    return 0;
  };

  const activeIndex = getActiveStageIndex();
  const isCancelled = raw === "cancelled" || raw === "declined";
  const isSent = raw === "sent";
  const canCancel =
    raw !== "approved" && raw !== "agreed" && raw !== "sent" && !isCancelled;

  const currentStageLabel = isCancelled
    ? (t.has?.("statusCancelled") ? t("statusCancelled") : "Cancelled")
    : isSent
      ? (t.has?.("statusSent") ? t("statusSent") : "Sent")
      : stages[activeIndex]?.title || "Received";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1C2C56] inline-block" />
          <h2 className="text-xs sm:text-sm font-bold tracking-wider text-[#1C2C56] uppercase">
            {t.has?.("workflowProgressionTitle")
              ? t("workflowProgressionTitle")
              : "QUOTATION WORKFLOW PROGRESSION"}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs sm:text-sm text-gray-500 font-normal">
            {t.has?.("currentStage") ? t("currentStage") : "Current Stage:"}{" "}
            <span
              className={`font-bold ml-1 ${activeIndex >= 3 && !isCancelled
                  ? "text-[#10B981]"
                  : isCancelled
                    ? "text-red-600"
                    : "text-[#1C2C56]"
                }`}
            >
              {currentStageLabel}
            </span>
          </div>

          {/* Action: When at Received (pending), allow changing to Quoting */}
          {(raw === "pending" || !raw) && onStatusChange && (
            <button
              type="button"
              onClick={() => onStatusChange("received")}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0F2F57] text-white hover:bg-[#1a4478] transition shadow-sm disabled:opacity-50"
            >
              {t.has?.("moveToQuoting")
                ? t("moveToQuoting")
                : "Move to Quoting"}
            </button>
          )}

          {/* Action: When at Quoting (received), allow changing to Submitted */}
          {(raw === "received" || raw === "quoting") && onRequestSubmit && (
            <button
              type="button"
              onClick={onRequestSubmit}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0F2F57] text-white hover:bg-[#1a4478] transition shadow-sm disabled:opacity-50"
            >
              {t.has?.("changeToSubmitted")
                ? t("changeToSubmitted")
                : "Change to Submitted"}
            </button>
          )}

          {/* Action: When at Agreed (approved), allow changing to Sent */}
          {(raw === "approved" || raw === "agreed") && onStatusChange && (
            <button
              type="button"
              onClick={() => onStatusChange("sent")}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#10B981] text-white hover:bg-[#059669] transition shadow-sm disabled:opacity-50"
            >
              {saving
                ? t.has?.("sending")
                  ? t("sending")
                  : "Sending..."
                : t.has?.("changeToSent")
                  ? t("changeToSent")
                  : "Change to Sent"}
            </button>
          )}

          {/* Cancel Quotation: ONLY allowed before Agreed */}
          {canCancel && onRequestCancel && (
            <button
              type="button"
              onClick={onRequestCancel}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
            >
              {t.has?.("cancelQuotation")
                ? t("cancelQuotation")
                : "Cancel Quotation"}
            </button>
          )}
        </div>
      </div>

      {/* Stepper Progression */}
      <div className="overflow-x-auto">
        <div className="min-w-[720px] pt-7 pb-3 px-6 sm:px-12">
          <div className="relative flex items-start justify-between">
            {stages.map((stage, idx) => {
              const isCompleted = idx < activeIndex;
              const isActive = idx === activeIndex;

              const stageTitle =
                idx === 4 && isCancelled
                  ? t.has?.("stageCancelled")
                    ? t("stageCancelled")
                    : "Cancelled"
                  : stage.title;
              const stageSubtitle =
                idx === 4 && isCancelled
                  ? t.has?.("stageCancelledSub")
                    ? t("stageCancelledSub")
                    : "Request cancelled"
                  : stage.subtitle;

              return (
                <div
                  key={stage.key}
                  className="relative flex-1 flex flex-col items-center text-center"
                >
                  {/* Connecting Line to next step */}
                  {idx < stages.length - 1 && (
                    <div
                      className={`absolute top-5 left-1/2 w-full h-[2px] -translate-y-1/2 ${
                        idx < activeIndex
                          ? idx >= 3
                            ? "bg-[#10B981]"
                            : "bg-[#0F2F57]"
                          : "bg-gray-200"
                      }`}
                    />
                  )}

                  {/* Step Circle */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-default ${
                      isCompleted
                        ? idx >= 3
                          ? "bg-[#10B981] text-white shadow-sm"
                          : "bg-[#0F2F57] text-white shadow-sm"
                        : isActive
                          ? isCancelled
                            ? "bg-red-500 text-white ring-4 ring-red-100 shadow-sm"
                            : idx >= 3
                              ? "bg-[#10B981] text-white ring-4 ring-[#D1FAE5] shadow-sm"
                              : "bg-[#0F2F57] text-white ring-4 ring-blue-100 shadow-sm"
                          : "bg-white border-2 border-gray-300 text-gray-400"
                    }`}
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
                  </div>

                  {/* Labels */}
                  <div className="mt-3 flex flex-col items-center">
                    <span
                      className={`text-sm font-bold tracking-tight ${
                        isActive
                          ? isCancelled
                            ? "text-red-600"
                            : idx >= 3
                              ? "text-[#10B981]"
                              : "text-[#1C2C56]"
                          : isCompleted
                            ? idx >= 3
                              ? "text-[#10B981]"
                              : "text-[#1C2C56]"
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
                        className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          isCancelled
                            ? "bg-red-50 text-red-600"
                            : idx >= 3
                              ? "bg-[#E8F8F0] text-[#10B981]"
                              : "bg-blue-50 text-[#1C4FA8]"
                        }`}
                      >
                        {isCancelled
                          ? t.has?.("cancelledBadge")
                            ? t("cancelledBadge")
                            : "Cancelled"
                          : t.has?.("activeBadge")
                            ? t("activeBadge")
                            : "Active"}
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
