"use client";

import { useEffect, useState } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetContractDetail } from "@/services/ContractsPoliciesService";
import Spinner from "@/components/ui/Spinner";
import ContractStatusPage from "../../components/ContractStatusPage";
import { useTranslations, useLocale } from "next-intl";

export default function ContractStatus({ contractId }) {
  const t = useTranslations("contractPolicies");
  const locale = useLocale();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!accessToken || !contractId) return;

      try {
        setLoading(true);
        setError(null);
        const res = await apiGetContractDetail(accessToken, contractId);
        if (res?.status && res?.data) {
          // Format timeline and summary from raw API data
          const apiData = res.data;
          
          const timeline = [
            {
              title: t("viewStatus.generated"),
              date: apiData.created_at ? new Date(apiData.created_at).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' }) : t("pending"),
              state: "done"
            },
            {
              title: t("viewStatus.sentVia"),
              date: apiData.created_at ? new Date(apiData.created_at).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' }) : t("pending"),
              state: "done"
            },
            {
              title: t("viewStatus.viewBy"),
              date: apiData.is_signed && apiData.signed_at ? new Date(apiData.signed_at).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' }) : t("pending"),
              state: apiData.is_signed ? "done" : "pending"
            },
            {
              title: t("viewStatus.signed"),
              date: apiData.is_signed && apiData.signed_at ? new Date(apiData.signed_at).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' }) : t("pending"),
              state: apiData.is_signed ? "complete" : "pending"
            }
          ];

          const activityHistory = (apiData.audit_logs || []).map(log => ({
            title: log.description,
            date: log.timestamp ? new Date(log.timestamp).toLocaleString(locale, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ""
          }));

          // Fallback if no audit logs exist
          if (activityHistory.length === 0) {
            activityHistory.push({
              title: t("contractGenerated"),
              date: apiData.created_at ? new Date(apiData.created_at).toLocaleString(locale, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ""
            });
            activityHistory.push({
              title: t("viewStatus.sentVia"),
              date: apiData.created_at ? new Date(apiData.created_at).toLocaleString(locale, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ""
            });
          }

          const statusSummary = {
            currentStatus: apiData.is_signed ? t("statusSigned") : t("statusSent"),
            cloudsign: apiData.is_signed ? t("statusSigned") : t("awaitingSign"),
            contractValue: apiData.summary?.total || "—",
            generatedOn: apiData.created_at ? new Date(apiData.created_at).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' }) : "—"
          };

          const formattedContract = {
            ...apiData,
            timeline,
            activityHistory,
            statusSummary
          };

          setContract(formattedContract);
        } else {
          setError(res?.message || t("contractNotFound"));
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || t("fetchStatusFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [accessToken, contractId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFCFA]">
        <Spinner size={50} customColorClass="text-[#A0522D]" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFFCFA] p-6 text-center">
        <h2 className="text-xl font-semibold text-[#2E231E]">{t("errorLoadingStatus")}</h2>
        <p className="mt-2 text-sm text-[#7A6E66]">{error || t("statusNotRetrieved")}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-[#A85A32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#8B4C2A]"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  return <ContractStatusPage contract={contract} />;
}
