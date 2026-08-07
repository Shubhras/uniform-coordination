"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { FiChevronLeft, FiChevronRight, FiEye, FiRotateCcw, FiSearch, FiX } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetContractsList } from "@/services/ContractsPoliciesService";
import Spinner from "@/components/ui/Spinner";
import StatusBadge from "./StatusBadge";

const statusOptions = [
  { value: "all", label: "Status" },
  { value: "sent", label: "Sent" },
  { value: "signed", label: "Signed" },
];

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "42px",
    borderColor: "#F0E6DE",
    borderRadius: "8px",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#D7C3B7",
    },
  }),

  valueContainer: (base) => ({
    ...base,
    paddingLeft: "10px",
    paddingRight: "10px",
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),

  dropdownIndicator: (base) => ({
    ...base,
    color: "#A85A32B2",
    padding: "0 10px 0 0",
  }),

  menu: (base) => ({
    ...base,
    zIndex: 20,
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#A85A32"
      : state.isFocused
        ? "#FAF3EE"
        : "#FFFFFF",
    color: state.isSelected ? "#FFFFFF" : "#6F625B",
  }),
};

const ContractsPoliciesPage = () => {
  const router = useRouter();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState(statusOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchContracts = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const res = await apiGetContractsList(
        accessToken,
        currentPage,
        pageSize,
        debouncedSearch,
        status.value
      );

      if (res?.status) {
        setContracts(res.data || []);
        setTotal(res.pagination?.count || 0);
      } else {
        setContracts([]);
        setTotal(0);
      }
    } catch (err) {
      console.error(err);
      setContracts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [accessToken, currentPage, pageSize, debouncedSearch, status]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) end = 4;
    if (currentPage >= totalPages - 2) start = totalPages - 3;

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");

    pages.push(totalPages);
    return pages;
  };

  const handleReset = () => {
    setSearchQuery("");
    setStatus(statusOptions[0]);
    setCurrentPage(1);
  };

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div className="bg-white p-3 sm:p-6">
      <div className="mb-5">
        <h1 className="text-[28px] font-semibold leading-tight text-[#1A1410]">
          Contracts & Policies
        </h1>

        <p className="mt-1 text-sm text-[#8B817A]">
          Manage rental agreements, digital signatures, and compensation
          policies.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:flex-1">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C28E73]"
            size={15}
          />

          <input
            type="text"
            placeholder="Search by contract id..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[42px] w-full rounded-lg border border-[#F0E6DE] bg-white pl-10 pr-10 text-sm text-[#6F625B] outline-none placeholder:text-[#C28E73] focus:border-[#D7B7A3]"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A8E86]"
              aria-label="Clear search"
            >
              <FiX size={15} />
            </button>
          )}
        </div>

        <div className="w-full sm:w-[140px]">
          <Select
            instanceId="contracts-status-filter"
            inputId="contracts-status-filter"
            value={status}
            onChange={(selectedOption) =>
              setStatus(selectedOption ?? statusOptions[0])
            }
            options={statusOptions}
            isSearchable={false}
            styles={selectStyles}
          />
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex h-[42px] w-full items-center justify-center gap-1.5 rounded-lg border border-[#F0E6DE] bg-white px-4 text-sm font-medium text-[#A85A32] transition hover:bg-[#FAF3EE] sm:w-auto"
        >
          <FiRotateCcw size={14} />
          Reset
        </button>
      </div>

      <div className="overflow-x-auto rounded-[10px] border border-[#F2EAE4]">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr className="bg-[#F8F3EF] text-left text-xs font-medium text-[#85776F]">
              <th className="px-4 py-4">Contract ID</th>
              <th className="px-4 py-4">Company</th>
              <th className="px-4 py-4">Order ID</th>
              <th className="px-4 py-4">Sent Date</th>
              <th className="px-4 py-4">Signed Date</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10">
                  <div className="flex justify-center">
                    <Spinner size={40} customColorClass="text-[#A0522D]" />
                  </div>
                </td>
              </tr>
            ) : contracts.length > 0 ? (
              contracts.map((row, index) => (
                <tr
                  key={`${row.contract_id}-${index}`}
                  className="border-t border-[#F6EFEB] bg-[#FFFDFC] text-xs text-[#5F534C]"
                >
                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#4A3D36]">
                    {row.contract_id}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 font-medium text-[#4A3D36]">
                    {row.company_name}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#4A3D36]">
                    {row.order_id || "—"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#7E736C]">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#4A3D36]">
                    {row.signed_at ? new Date(row.signed_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <StatusBadge status={row.is_signed ? "Signed" : "Sent"} />
                  </td>

                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/contracts-policies/${row.contract_id}`)
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7D9CF] bg-white px-3 py-1.5 text-xs font-medium text-[#A85A32] transition hover:bg-[#FAF3EE]"
                    >
                      <FiEye size={12} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="bg-white px-4 py-12 text-center text-sm text-[#8B817A]"
                >
                  No contracts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex flex-col gap-3 text-[11px] text-[#9A8C82] sm:flex-row sm:items-center sm:justify-between">
        <p>
          {total === 0
            ? "No results"
            : `Showing ${startItem}-${endItem} of ${total}`}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded border border-[#E9DDD4] text-[#C9B2A3] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiChevronLeft size={14} />
          </button>

          {getPageNumbers().map((page, idx) =>
            page === "..." ? (
              <span key={`dots-${idx}`} className="text-[#8C7C73] px-1">
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                className={`flex h-8 min-w-[30px] items-center justify-center rounded px-2 ${
                  currentPage === page
                    ? "bg-[#D88957] text-white"
                    : "text-[#8C7C73] hover:bg-[#FCF4EF]"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded border border-[#E9DDD4] text-[#8C7C73] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractsPoliciesPage;