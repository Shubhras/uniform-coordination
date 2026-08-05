"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { FiExternalLink } from "react-icons/fi";
import { LuPalette } from "react-icons/lu";
import { LiaFileDownloadSolid } from "react-icons/lia";
import { useRouter } from "next/navigation";
import {
  apiSimulationExportPdf,
  apiSimulationHistory,
} from "@/services/AuthProfileService";
import { apiGetHomeData } from "@/services/HomeService";
import { useSession } from "next-auth/react";
import { formatDate } from "@/utils/dateFormater";
import { Alert } from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import Select from "@/components/ui/Select";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { HiCheck } from "react-icons/hi";
import Pagination from "@/components/ui/Pagination";

const ITEMS_PER_PAGE = 8;

const CustomOption = (props) => {
  const { innerProps, label, isSelected, isDisabled } = props;
  return (
    <div
      className={`flex items-center justify-between px-3 py-1.5 cursor-pointer ${
        isSelected
          ? "text-[#1C4FA8] bg-[#F2F7FF]"
          : "text-[#1C2C56] hover:bg-gray-100"
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      {...innerProps}
    >
      <span className="ml-2 text-sm font-medium">{label}</span>
      {isSelected && <HiCheck className="text-lg" />}
    </div>
  );
};

const sortOptions = [
  { value: "", label: "Sort" },
  { value: "new", label: "Newest" },
  { value: "old", label: "Oldest" },
];

const rangeOptions = [
  { value: "", label: "Select Date Range" },
  { value: "30", label: "Last 30 Days" },
  { value: "180", label: "Last 6 Month" },
  { value: "365", label: "Last 1 Year" },
];

const normalizePdfUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") {
    return rawUrl;
  }

  const preferredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!preferredBaseUrl) {
    return rawUrl;
  }

  try {
    const preferredOrigin = new URL(preferredBaseUrl).origin;

    if (rawUrl.startsWith("/")) {
      return new URL(rawUrl, preferredOrigin).toString();
    }

    const parsedUrl = new URL(rawUrl);
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
    return rawUrl;
  }
};

const SimulationHistory = () => {
  const { data: session } = useSession();

  const [simulationData, setSimulationData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState(null);
  const [pdfError, setPdfError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({
    category: "",
    sort: "new",
    range: "30",
  });

  const router = useRouter();

  const handleRedirect = (id) => {
    // product id
    router.push(`/dashboards/design-result/${id}`);
  };

  /* -------------------- FETCH HOME DATA (CATEGORIES) -------------------- */
  const fetchHomeData = async () => {
    try {
      const res = await apiGetHomeData();
      if (res?.status) {
        setCategories(res.data?.categories || []);
      }
    } catch (err) {
      console.error("Failed to load home data", err);
    }
  };

  const handlePdfDownload = async (id) => {
    try {
      if (!session?.accessToken || !id) return;

      setPdfLoadingId(id);
      setPdfError("");

      const res = await apiSimulationExportPdf(session.accessToken, id);

      if (res?.status && res?.pdf_url) {
        window.open(normalizePdfUrl(res.pdf_url), "_blank");
      } else {
        setPdfError(res?.message || "PDF URL not found");
      }
    } catch (err) {
      console.error("Failed to download PDF", err);
      setPdfError("Failed to download PDF. Please try again.");
    } finally {
      setPdfLoadingId(null);
    }
  };

  /* -------------------- FETCH SIMULATION HISTORY -------------------- */
  const fetchSimulationHistory = async () => {
    try {
      if (!session?.accessToken) return;
      setLoading(true);
      setCurrentPage(1);
      const params = {};

      if (filters.category) params.category = filters.category;
      if (filters.sort) params.sort = filters.sort;
      if (filters.range) params.range = filters.range;

      const res = await apiSimulationHistory(
        session.accessToken,
        currentPage,
        pageSize,
        params,
      );
      console.log(res);
      if (res?.status) {
        setSimulationData(res.data || []);
        setTotalCount(
          res.count || res.total || res.pagination?.total_items || 0,
        );
      }
    } catch (err) {
      console.error("Failed to load Simulation History", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  useEffect(() => {
    fetchSimulationHistory();
  }, [session?.accessToken, filters, currentPage, pageSize]);

  return (
    <div className="w-full bg-[#E8EEF842] md:p-8 p-4 rounded-2xl max-w-7xl mx-auto shadow-md">
      {pdfError && (
        <Alert showIcon className="mb-4" type="danger">
          <span className="break-all">{pdfError}</span>
        </Alert>
      )}

      {/* HEADER */}
      <div className="mb-6">
        <h3 className="text-[#0F2A44] text-[18px] font-semibold flex items-center gap-1">
          <LuPalette size={23} />
          Simulation History
        </h3>
        <p className="text-[#6B7280] text-[14px] mt-1">
          Your recent designs and customizations
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 mb-8">
        {/* LEFT */}
        <div className="flex gap-2 w-full sm:w-auto relative z-10">
          <Select
            instanceId="simulation-sort-select"
            options={[
              { value: "", label: "All Industry" },
              ...categories.map((cat) => ({
                value: cat.slug,
                label: cat.categoryName,
              })),
            ]}
            value={
              [
                { value: "", label: "All Industry" },
                ...categories.map((cat) => ({
                  value: cat.slug,
                  label: cat.categoryName,
                })),
              ].find((o) => o.value === filters.category) || {
                value: "",
                label: "All Industry",
              }
            }
            onChange={(selected) =>
              setFilters({ ...filters, category: selected?.value || "" })
            }
            className="w-full min-w-[180px]"
            components={{ Option: CustomOption }}
            styles={{
              control: () => ({
                borderRadius: "10px",
                borderColor: "#B2C7E3",
                borderStyle: "solid",
                borderWidth: "1px",
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "2px 4px",
                cursor: "pointer",
              }),
              menu: (base) => ({
                ...base,
                marginTop: "4px",
                borderRadius: "14px",
                padding: "6px",
                overflow: "hidden",
              }),
              menuList: (base) => ({
                ...base,
                paddingTop: 0,
                paddingBottom: 0,
                maxHeight: "220px",
                overflowY: "auto",
              }),

              singleValue: () => ({
                color: "#1C2C56",
                fontWeight: 500,
                fontSize: "14px",
              }),
              placeholder: () => ({
                color: "#1C2C56",
                fontWeight: 500,
                fontSize: "14px",
              }),
            }}
          />
        </div>

        {/* RIGHT */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-3 sm:mt-0 relative z-10">
          <Select
            instanceId="simulation-range-select"
            options={sortOptions}
            value={
              sortOptions.find((o) => o.value === filters.sort) ||
              sortOptions[0]
            }
            onChange={(selected) =>
              setFilters({ ...filters, sort: selected?.value || "" })
            }
            className="w-full min-w-[180px]"
            components={{ Option: CustomOption }}
            styles={{
              control: () => ({
                borderRadius: "10px",
                borderColor: "#B2C7E3",
                borderStyle: "solid",
                borderWidth: "1px",
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "2px 4px",
                cursor: "pointer",
              }),
              menu: (base) => ({
                ...base,
                marginTop: "4px",
                borderRadius: "14px",
                padding: "6px",
                overflow: "hidden",
              }),
              menuList: (base) => ({
                ...base,
                paddingTop: 0,
                paddingBottom: 0,
                maxHeight: "220px",
                overflowY: "auto",
              }),

              singleValue: () => ({
                color: "#1C2C56",
                fontWeight: 500,
                fontSize: "14px",
              }),
            }}
          />

          <Select
            instanceId="simulation-category-select"
            options={rangeOptions}
            value={
              rangeOptions.find((o) => o.value === filters.range) ||
              rangeOptions[0]
            }
            onChange={(selected) =>
              setFilters({ ...filters, range: selected?.value || "" })
            }
            className="w-full min-w-[160px]"
            components={{ Option: CustomOption }}
            styles={{
              control: () => ({
                borderRadius: "10px",
                borderColor: "#B2C7E3",
                borderStyle: "solid",
                borderWidth: "1px",
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 8px",
                cursor: "pointer",
              }),
              singleValue: () => ({
                color: "#1C2C56",
                fontWeight: 500,
                fontSize: "14px",
              }),
            }}
          />
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <section className="relative w-full bg-white mx-auto px-5 md:px-8 lg:px-12 mt-15">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C4FA8]"></div>
          </div>
        </section>
      )}

      {/* EMPTY STATE */}
      {!loading && simulationData.length === 0 && (
        <div className="text-center py-10 text-[#6B7280] text-sm">
          No simulation history found
        </div>
      )}

      {/* CARDS */}
      {!loading && simulationData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {simulationData.map((item, i) => {
            const product = item.product_details?.[0];

            return (
              <div
                key={item.id || i}
                className="bg-white border border-[#CBD5E1] rounded-2xl p-6 flex flex-col h-full"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-[240px] h-[240px] rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                    <Image
                      src={item?.ProductImage}
                      width={240}
                      height={240}
                      alt={item?.productName || "Product"}
                      className="object-cover h-full w-full"
                      unoptimized
                    />
                  </div>
                </div>

                <h4 className="text-[#1C2C56] text-[16px] font-semibold">
                  {item?.productName || "-"}
                </h4>

                <p className="text-[#6B7280] text-[13px] mt-1">
                  {formatDate(item.created_at)}
                </p>

                <div className="mt-auto pt-6 flex gap-3">
                  <Button
                    className="flex-[2] bg-[#1C4FA8] hover:bg-[#1C4FA8] text-white py-2 rounded-md"
                    size="sm"
                    icon={<FiExternalLink size={16} />}
                    onClick={() => handleRedirect(item.id)}
                  >
                    OPEN
                  </Button>

                  <Button
                    className="flex-[1] border border-[#1C2C56] text-[#1C2C56] rounded-md"
                    size="sm"
                    variant="default"
                    icon={
                      pdfLoadingId === item?.id ? (
                        <Spinner size={18} />
                      ) : (
                        <LiaFileDownloadSolid />
                      )
                    }
                    disabled={pdfLoadingId === item?.id}
                    onClick={() => handlePdfDownload(item?.id)}
                  >
                    {pdfLoadingId === item?.id ? "PDF..." : "PDF"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {/* <Pagination
        currentPage={currentPage}
        pageSize={ITEMS_PER_PAGE}
        total={simulationData.length}
        onChange={(page) => setCurrentPage(page)}
      /> */}
      <div className="mt-5">
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          total={totalCount}
          onChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
};

export default SimulationHistory;
