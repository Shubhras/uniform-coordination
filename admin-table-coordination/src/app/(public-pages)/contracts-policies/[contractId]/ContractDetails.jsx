"use client";

import { useEffect, useState } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetContractDetail } from "@/services/ContractsPoliciesService";
import Spinner from "@/components/ui/Spinner";
import ContractDetailPage from "../components/ContractDetailPage";

export default function ContractDetails({ contractId }) {
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
          setContract(res.data);
        } else {
          setError(res?.message || "Contract not found");
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || "Failed to fetch contract details");
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
        <h2 className="text-xl font-semibold text-[#2E231E]">Error loading contract</h2>
        <p className="mt-2 text-sm text-[#7A6E66]">{error || "Contract details could not be retrieved."}</p>
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

  return <ContractDetailPage contract={contract} />;
}
