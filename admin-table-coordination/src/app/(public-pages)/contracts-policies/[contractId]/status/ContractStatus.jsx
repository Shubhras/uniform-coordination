"use client";

import { useEffect, useState } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetContractDetail } from "@/services/ContractsPoliciesService";
import Spinner from "@/components/ui/Spinner";
import ContractStatusPage from "../../components/ContractStatusPage";

export default function ContractStatus({ contractId }) {
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
              title: "Generated",
              date: apiData.created_at ? new Date(apiData.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "Pending",
              state: "done"
            },
            {
              title: "Sent via CloudSign",
              date: apiData.created_at ? new Date(apiData.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "Pending",
              state: "done"
            },
            {
              title: "Viewed by Recipient",
              date: apiData.is_signed && apiData.signed_at ? new Date(apiData.signed_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "Pending",
              state: apiData.is_signed ? "done" : "pending"
            },
            {
              title: "Signed",
              date: apiData.is_signed && apiData.signed_at ? new Date(apiData.signed_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "Pending",
              state: apiData.is_signed ? "complete" : "pending"
            }
          ];

          const activityHistory = (apiData.audit_logs || []).map(log => ({
            title: log.description,
            date: log.timestamp ? new Date(log.timestamp).toLocaleString("en-US", { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ""
          }));

          // Fallback if no audit logs exist
          if (activityHistory.length === 0) {
            activityHistory.push({
              title: "Contract generated",
              date: apiData.created_at ? new Date(apiData.created_at).toLocaleString("en-US", { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ""
            });
            activityHistory.push({
              title: "Sent via CloudSign",
              date: apiData.created_at ? new Date(apiData.created_at).toLocaleString("en-US", { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ""
            });
          }

          const statusSummary = {
            currentStatus: apiData.is_signed ? "Signed" : "Sent",
            cloudsign: apiData.is_signed ? "Signed" : "Awaiting Signature",
            contractValue: apiData.summary?.total || "—",
            generatedOn: apiData.created_at ? new Date(apiData.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "—"
          };

          const formattedContract = {
            ...apiData,
            timeline,
            activityHistory,
            statusSummary
          };

          setContract(formattedContract);
        } else {
          setError(res?.message || "Contract not found");
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || "Failed to fetch contract status");
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
        <h2 className="text-xl font-semibold text-[#2E231E]">Error loading contract status</h2>
        <p className="mt-2 text-sm text-[#7A6E66]">{error || "Contract status could not be retrieved."}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-[#A85A32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#8B4C2A]"
        >
          Retry
        </button>
      </div>
    );
  }

  return <ContractStatusPage contract={contract} />;
}
