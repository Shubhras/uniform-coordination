"use client";

import React, { useEffect, useRef, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FiBox,
  FiChevronRight,
  FiClock,
  FiDownload,
  FiEdit2,
  FiFileText,
  FiLock,
} from "react-icons/fi";
import { HiCheckCircle } from "react-icons/hi";
import { CiUser } from "react-icons/ci";
import { GoArrowRight } from "react-icons/go";
import {
  apiGetProfile,
  apiGetQuotation,
  apiSimulationExportPdf,
  apiSimulationHistory,
} from "@/services/AuthProfileService";
import { apiGetUserQuotationDetail } from "@/services/QuotationRequestService";

const normalizePdfUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") {
    return rawUrl;
  }

  const sanitizedUrl = rawUrl.replace(/\[|\]|\(|\)|"|`/g, "").trim();

  if (!sanitizedUrl) {
    return rawUrl;
  }

  const preferredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!preferredBaseUrl) {
    return sanitizedUrl;
  }

  try {
    const preferredOrigin = new URL(preferredBaseUrl).origin;

    if (sanitizedUrl.startsWith("/")) {
      return new URL(sanitizedUrl, preferredOrigin).toString();
    }

    const parsedUrl = new URL(sanitizedUrl);
    if (
      parsedUrl.hostname === "localhost" ||
      parsedUrl.hostname === "127.0.0.1"
    ) {
      return new URL(
        `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`,
        preferredOrigin,
      ).toString();
    }

    return parsedUrl.toString();
  } catch (error) {
    console.error("Failed to normalize PDF URL:", error);
    return sanitizedUrl;
  }
};

const formatDisplayDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const normalizeQuotationRecord = (quotation) => {
  return {
    ...quotation,
    id:
      quotation?.id ||
      quotation?.uuids ||
      quotation?.uuid ||
      quotation?.quotation_id ||
      "",
    uuids: quotation?.uuids || quotation?.uuid || quotation?.id || "",
    quotationNo:
      quotation?.quotationNo ||
      quotation?.quotation_id ||
      quotation?.request_id ||
      "",
    company_name:
      quotation?.company_name ||
      quotation?.companyName ||
      quotation?.contact_person ||
      "Quotation",
    created_at: quotation?.created_at || quotation?.submitted_at || "",
  };
};

const extractQuotationCollection = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.results)) return payload.results;
  if (payload?.data && typeof payload.data === "object") return [payload.data];
  return [];
};

const MyProfile = () => {
  const fileRef = useRef(null);
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [quotationData, setQuotationData] = useState([]);
  const [image, setImage] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [quotationLoading, setQuotationLoading] = useState(true);
  const [simulationData, setSimulationData] = useState([]);
  const [simulationLoading, setSimulationLoading] = useState(true);
  const [pdfLoadingId, setPdfLoadingId] = useState(null);
  const [quotationDetailLoadingId, setQuotationDetailLoadingId] =
    useState(null);
  const activeQuotation = quotationData?.[0] || null;
  const visibleRecentSimulations = simulationData.slice(0, 3);

  const handleRecentQuotationClick = (quotation) => {
    const quotationId =
      quotation?.quotationNo ||
      quotation?.quotation_id ||
      quotation?.request_id ||
      quotation?.uuids ||
      quotation?.uuid ||
      quotation?.id ||
      "";

    if (!quotationId) {
      router.push("/profile/my-quotations");
      return;
    }

    router.push(`/profile/my-quotations/${quotationId}`);
  };

  const fetchProfile = async () => {
    try {
      if (!session?.accessToken) return;
      setProfileLoading(true);
      const res = await apiGetProfile(session.accessToken);
      if (res?.status && res?.data) {
        setProfile(res.data);
        setImage(res.data.profileImage || null);
      }
    } catch (error) {
      console.error("Profile API error:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchQuotation = async () => {
    try {
      if (!session?.accessToken) return;
      setQuotationLoading(true);
      const res = await apiGetQuotation(session.accessToken);
      if (res?.success || res?.status) {
        let normalizedQuotations = extractQuotationCollection(res).map(
          normalizeQuotationRecord,
        );

        const firstQuotationUuid =
          normalizedQuotations?.[0]?.uuids ||
          normalizedQuotations?.[0]?.uuid ||
          normalizedQuotations?.[0]?.id;

        if (firstQuotationUuid) {
          try {
            const detailRes = await apiGetUserQuotationDetail(
              firstQuotationUuid,
              session.accessToken,
            );

            if (detailRes?.success || detailRes?.status) {
              const detailRecord = normalizeQuotationRecord(
                detailRes?.data || detailRes,
              );

              normalizedQuotations = [
                detailRecord,
                ...normalizedQuotations.slice(1),
              ];
            }
          } catch (detailError) {
            console.error("Initial quotation detail API error:", detailError);
          }
        }

        setQuotationData(normalizedQuotations);
      }
    } catch (error) {
      console.error("Quotation API error:", error);
    } finally {
      setQuotationLoading(false);
    }
  };
  /* -------------------- FETCH SIMULATION HISTORY -------------------- */
  const fetchSimulationHistory = async () => {
    try {
      if (!session?.accessToken) return;
      setSimulationLoading(true);
      const params = {
        category: "",
        sort: "new",
        range: "30",
      };

      const res = await apiSimulationHistory(session.accessToken, params);
      if (res?.status) {
        setSimulationData(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load Simulation History", err);
    } finally {
      setSimulationLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.accessToken) return;
    fetchProfile();
    fetchQuotation();
    fetchSimulationHistory();
  }, [session?.accessToken]);

  const handleSelectImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const handleSimulationRedirect = (id) => {
    if (!id) return;
    router.push(`/dashboards/design-result/${id}`);
  };

  const handleSimulationPdfDownload = async (id) => {
    try {
      if (!session?.accessToken || !id) return;
      setPdfLoadingId(id);

      const res = await apiSimulationExportPdf(session.accessToken, id);

      if (res?.status && res?.pdf_url) {
        window.open(normalizePdfUrl(res.pdf_url), "_blank");
      }
    } catch (error) {
      console.error("Simulation PDF download error:", error);
    } finally {
      setPdfLoadingId(null);
    }
  };

  const handleQuotationPreview = async (quotation) => {
    if (!quotation) return;

    const quotationId =
      quotation?.quotationNo ||
      quotation?.quotation_id ||
      quotation?.request_id ||
      quotation?.uuids ||
      quotation?.uuid ||
      quotation?.id;

    if (!quotationId) {
      return;
    }

    setQuotationDetailLoadingId(quotationId);
    router.push(`/profile/my-profile/${quotationId}`);
  };

  if (profileLoading) {
    return (
      <section className="relative mt-15 mx-auto w-full bg-white px-5 md:px-8 lg:px-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#1C4FA8]" />
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 bg-[#F9FAFB]">
      <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F6FAFF] p-4 md:px-5 md:py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-4">
          <div className="w-full max-w-[120px] rounded-[16px] border border-[#E5E7EB] bg-[#F6FAFF] p-5">
            <div className="mx-auto flex w-fit items-center justify-center rounded-[24px]  bg-white p-1.5">
              <Avatar
                size={76}
                icon={<CiUser />}
                src={
                  image ||
                  profile?.profileImage ||
                  profile?.profile_image ||
                  profile?.avatar ||
                  profile?.image ||
                  ""
                }
                className="object-cover"
              />
            </div>
            {/* 
                        <div className="mt-3 flex items-center justify-center gap-2 text-[9px] font-medium">
                            <button
                                type="button"
                                className="text-[#4F8FEF]"
                                onClick={() => fileRef.current?.click()}
                            >
                                Upload
                            </button>
                            <button
                                type="button"
                                className="text-[#EF4444]"
                                onClick={handleRemoveImage}
                            >
                                Remove
                            </button>
                        </div> */}

            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              className="hidden"
              onChange={handleSelectImage}
            />
          </div>

          <div className="relative flex-1 pr-0 md:pr-[110px]">
            <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-medium text-[#10B981] md:absolute md:right-3 md:-top-2 md:mb-0 md:shadow-[0_0_0_6px_#F6FAFF]">
              <HiCheckCircle size={12} />
              Verified Account
            </span>

            <div className="rounded-[16px] border border-[#E5E7EB] bg-[#F6FAFF] p-4 md:w-[762px] md:min-h-[132px] md:px-5 md:py-4">
              <div className="mb-5">
                <h4 className="text-base font-semibold text-[#1F2937]">
                  Personal Details
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-x-12 gap-y-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-[#94A3B8]">First Name</p>
                  <p className="mt-1 text-sm font-medium text-[#1F2937]">
                    {profile?.firstName || "John"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8]">Last Name</p>
                  <p className="mt-1 text-sm font-medium text-[#1F2937]">
                    {profile?.lastName || "Doe"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8]">Email Address</p>
                  <div className="mt-1 flex items-center gap-1">
                    <p className="text-sm font-medium text-[#1F2937] break-all">
                      {profile?.email || "john@company.com"}
                    </p>
                    <HiCheckCircle
                      size={14}
                      className="shrink-0 text-[#22C55E]"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8]">Phone Number</p>
                  <p className="mt-1 text-sm font-medium text-[#1F2937]">
                    {profile?.phone || "+81 90-234-5678"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8]">Position</p>
                  <p className="mt-1 text-sm font-medium text-[#1F2937]">
                    {profile?.roleName || "Manager"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 pl-0 md:pl-[142px]">
          <Button
            size="sm"
            icon={<FiEdit2 size={13} />}
            className="h-8 whitespace-nowrap rounded-md border border-[#E5E7EB] px-3.5 text-xs font-medium text-[#475569]"
            onClick={() => router.push("/profile/personal-information")}
          >
            Edit Profile
          </Button>
          <Button
            size="sm"
            icon={<FiLock size={13} />}
            className="h-8 whitespace-nowrap rounded-md border border-[#E5E7EB] px-3.5 text-xs font-medium text-[#475569]"
            onClick={() => router.push("/profile/change-password")}
          >
            Change Password
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#8DB4E2] bg-white p-1">
        <div className="flex items-center justify-between border-b border-[#E5EDF7] px-4 py-3">
          <div>
            <h4 className="text-lg md:text-[20px] font-semibold text-[#1C4FA8]">
              Quotation Status
            </h4>
            <p className="mt-1 text-sm font-medium text-[#003560]">
              {activeQuotation?.quotationNo ||
                activeQuotation?.quotation_id ||
                "RQ-2025-0194"}
            </p>
            <p className="mt-1 text-xs text-[#4B5563] font-medium">
              {formatDisplayDate(activeQuotation?.created_at)}
            </p>
          </div>

          <Button className="rounded-md h-8 bg-[#003560] px-4 py-1 text-xs md:text-sm text-white hover:bg-[#002a49]">
            View Design
          </Button>
        </div>

        <div className="bg-white px-4 py-4 space-y-3">
          {quotationLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size={24} />
            </div>
          ) : quotationData.length ? (
            quotationData.slice(0, 3).map((quotation, index) => (
              <div
                key={quotation?.quotation_id || quotation?.quotationNo || index}
                className="flex items-center justify-between rounded-lg  bg-[#F8FBFF] px-4 py-2.5"
              >
                <p className="text-sm font-medium text-[#111827]">
                  {quotation?.company_name ||
                    quotation?.companyName ||
                    "Quotation"}
                </p>

                <button
                  type="button"
                  className="flex flex-col items-center gap-1 text-xs font-medium text-[#4B5563]"
                  onClick={() => handleQuotationPreview(quotation)}
                  disabled={
                    quotationDetailLoadingId ===
                    (quotation?.uuids ||
                      quotation?.uuid ||
                      quotation?.id ||
                      quotation?.quotation_id)
                  }
                >
                  <FiFileText className="text-[#003560]" size={16} />
                  {quotationDetailLoadingId ===
                  (quotation?.uuids ||
                    quotation?.uuid ||
                    quotation?.id ||
                    quotation?.quotation_id)
                    ? "Loading..."
                    : "View PDF"}
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-[#F8FBFF] px-4 py-6 text-center text-sm text-[#6B7280]">
              No quotations found
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[10px] border border-[#E5EDF7] bg-white p-1">
          <div className="flex items-center justify-between border-b border-[#EEF2F7] px-5 py-4">
            <h4 className="flex items-center gap-2 text-base font-semibold text-[#1E293B]">
              <FiBox size={17} />
              Recent Quotation
            </h4>
            <button
              className="flex items-center gap-1 text-xs font-medium text-[#2563A8]"
              onClick={() => router.push("/profile/my-quotations")}
            >
              View All <GoArrowRight size={12} />
            </button>
          </div>

          <div className="px-4 pb-4">
            <div className="mt-4">
              <div className="space-y-2">
                {quotationData.length ? (
                  quotationData.slice(0, 3).map((quotation, index) => (
                    <div
                      key={
                        quotation?.quotation_id ||
                        quotation?.quotationNo ||
                        index
                      }
                      className="flex cursor-pointer items-center justify-between rounded-[10px] bg-[#F8FBFF] px-3 py-3"
                      onClick={() => handleRecentQuotationClick(quotation)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white">
                          <FiFileText className="text-[#94A3B8]" size={17} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1E293B]">
                            {quotation?.company_name ||
                              quotation?.companyName ||
                              "Quotation"}
                          </p>
                          <p className="text-xs text-[#9CA3AF]">
                            {quotation?.quotationNo ||
                              quotation?.quotation_id ||
                              "-"}
                          </p>
                        </div>
                      </div>
                      <FiChevronRight className="text-[#1E293B]" size={15} />
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg bg-[#F8FBFF] px-4 py-6 text-center text-sm text-[#6B7280]">
                    No quotations found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-[#E5EDF7] bg-white p-1">
          <div className="flex items-center justify-between border-b border-[#EEF2F7] px-5 py-4">
            <h4 className="flex items-center gap-2 text-base font-semibold text-[#1E293B]">
              <FiFileText size={17} />
              Recent Simulations
            </h4>
            <button
              className="flex items-center gap-1 text-xs font-medium text-[#2563A8]"
              onClick={() => router.push("/profile/simulation-history")}
            >
              View All <GoArrowRight size={12} />
            </button>
          </div>

          <div className="px-5 pb-5 pt-1">
            {simulationLoading ? (
              <div className="flex items-center justify-center py-6">
                <Spinner size={24} />
              </div>
            ) : simulationData.length > 0 ? (
              <div className="space-y-0">
                {visibleRecentSimulations.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative flex items-start justify-between gap-4 py-5"
                  >
                    <div className="flex min-w-0 gap-3">
                      <div className="relative flex w-4 shrink-0 justify-center">
                        <span className="mt-1.5 h-3 w-3 rounded-full border border-[#3B82F6] bg-white" />
                        {index !== visibleRecentSimulations.length - 1 && (
                          <span className="absolute top-5 h-[82px] w-px bg-[#DCE7F5]" />
                        )}
                      </div>
                      <div className="min-w-0 space-y-2">
                        <p className="truncate text-sm font-semibold leading-[20px] text-[#1F2A44]">
                          {item?.productName || "Untitled Simulation"}
                        </p>
                        <div className="flex items-center gap-1 text-xs font-normal text-[#9CA3AF]">
                          <FiClock size={12} className="shrink-0" />
                          <span>{formatDisplayDate(item?.created_at)}</span>
                        </div>
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs font-medium text-[#2D6CDF] transition-colors hover:text-[#1C4FA8] disabled:cursor-not-allowed disabled:opacity-70"
                          onClick={() => handleSimulationPdfDownload(item?.id)}
                          disabled={pdfLoadingId === item?.id}
                        >
                          <FiDownload size={12} className="shrink-0" />
                          {pdfLoadingId === item?.id
                            ? "Downloading..."
                            : "PDF Download"}
                        </button>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-5 pt-0.5 text-right">
                      <span
                        className={`inline-flex justify-center rounded-[4px] px-2.5 py-1.5 text-xs font-semibold leading-none ${
                          item?.isActive
                            ? "bg-[#DBEAFE] text-[#2563A8]"
                            : "bg-[#F1F5F9] text-[#94A3B8]"
                        }`}
                      >
                        {item?.isActive ? "OPEN" : "CLOSED"}
                      </span>
                      <button
                        type="button"
                        className="text-xs font-medium text-[#7C8AA5] transition-colors hover:text-[#1C4FA8]"
                        onClick={() => handleSimulationRedirect(item?.id)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#9CA3AF]">
                No recent simulations found
              </div>
            )}

            <div className="mt-6 border-t border-[#D7E3F4] pt-6">
              <Button
                variant="default"
                className="h-10 w-full justify-center rounded-[10px] border border-[#6D95D8] bg-[#F8FBFF] px-4 text-sm font-medium text-[#1F3F75] hover:bg-[#F3F8FF]"
                onClick={() => router.push("/dashboards")}
              >
                Create New Simulation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
