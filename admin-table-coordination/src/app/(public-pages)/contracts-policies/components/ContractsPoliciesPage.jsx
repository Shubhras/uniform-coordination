"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { FiChevronLeft, FiChevronRight, FiEye, FiRotateCcw, FiSearch, FiX } from "react-icons/fi";
import StatusBadge from "./StatusBadge";

const contractRows = [
  {
    contractId: "CTR-2024-0891",
    company: "Meridian Events Group",
    orderId: "ORD-2024-3847",
    quotationId: "QUO-2024-1203",
    sentDate: "—",
    signedDate: "Nov 13, 2024",
    status: "Sent",
  },
  {
    contractId: "CTR-2024-0892",
    company: "Bluewater Hospitality Co.",
    orderId: "ORD-2024-3848",
    quotationId: "QUO-2024-1204",
    sentDate: "Nov 10, 2024",
    signedDate: "Nov 13, 2024",
    status: "Signed",
  },
  {
    contractId: "CTR-2024-0893",
    company: "Lumina Wedding Studios",
    orderId: "ORD-2024-3849",
    quotationId: "QUO-2024-1205",
    sentDate: "Nov 11, 2024",
    signedDate: "Nov 13, 2024",
    status: "Sent",
  },
  {
    contractId: "CTR-2024-0894",
    company: "Bluewater Hospitality Co.",
    orderId: "ORD-2024-3850",
    quotationId: "QUO-2024-1206",
    sentDate: "Nov 12, 2024",
    signedDate: "Nov 14, 2024",
    status: "Signed",
  },
  {
    contractId: "CTR-2024-0895",
    company: "Meridian Events Group",
    orderId: "ORD-2024-3851",
    quotationId: "QUO-2024-1207",
    sentDate: "—",
    signedDate: "Nov 15, 2024",
    status: "Sent",
  },
  {
    contractId: "CTR-2024-0896",
    company: "Meridian Events Group",
    orderId: "ORD-2024-3852",
    quotationId: "QUO-2024-1208",
    sentDate: "—",
    signedDate: "Nov 16, 2024",
    status: "Sent",
  },
  {
    contractId: "CTR-2024-0897",
    company: "Meridian Events Group",
    orderId: "ORD-2024-3853",
    quotationId: "QUO-2024-1209",
    sentDate: "—",
    signedDate: "Nov 17, 2024",
    status: "Sent",
  },
  {
    contractId: "CTR-2024-0898",
    company: "Meridian Events Group",
    orderId: "ORD-2024-3854",
    quotationId: "QUO-2024-1210",
    sentDate: "—",
    signedDate: "Nov 18, 2024",
    status: "Sent",
  },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState(statusOptions[0]);

  // Search aur status ke hisab se rows filter hongi
  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return contractRows.filter((row) => {
      const matchesSearch =
        !query ||
        row.contractId.toLowerCase().includes(query) ||
        row.company.toLowerCase().includes(query) ||
        row.orderId.toLowerCase().includes(query) ||
        row.quotationId.toLowerCase().includes(query);

      const matchesStatus =
        status.value === "all" ||
        row.status.toLowerCase() === status.value.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, status]);

  const handleReset = () => {
    setSearchQuery("");
    setStatus(statusOptions[0]);
  };

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
              <th className="px-4 py-4">Quotation ID</th>
              <th className="px-4 py-4">Sent Date</th>
              <th className="px-4 py-4">Signed Date</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.length > 0 ? (
              filteredRows.map((row, index) => (
                <tr
                  key={`${row.contractId}-${index}`}
                  className="border-t border-[#F6EFEB] bg-[#FFFDFC] text-xs text-[#5F534C]"
                >
                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#4A3D36]">
                    {row.contractId}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 font-medium text-[#4A3D36]">
                    {row.company}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#4A3D36]">
                    {row.orderId}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#4A3D36]">
                    {row.quotationId}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#7E736C]">
                    {row.sentDate}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#4A3D36]">
                    {row.signedDate}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <StatusBadge status={row.status} />
                  </td>

                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/contracts-policies/${row.contractId}`)
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#E7D9CF] bg-white px-3 py-1.5 text-xs font-medium text-[#A85A32] transition hover:bg-[#FAF3EE]"
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
                  colSpan={8}
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
        <p>Showing 1-10</p>

        <div className="flex items-center gap-2">
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded border border-[#E9DDD4] text-[#C9B2A3]">
            <FiChevronLeft size={14} />
          </button>
          <button type="button" className="flex h-8 min-w-[30px] items-center justify-center rounded bg-[#D88957] px-2 text-white">
            1
          </button>
          <button type="button" className="text-[#8C7C73]">2</button>
          <button type="button" className="text-[#8C7C73]">3</button>
          <span className="text-[#8C7C73]">...</span>
          <button type="button" className="text-[#8C7C73]">10</button>
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded border border-[#E9DDD4] text-[#8C7C73]">
            <FiChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractsPoliciesPage;