"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import {
  TbBan,
  TbChevronLeft,
  TbChevronRight,
  TbEye,
  TbPencil,
  TbSearch,
} from "react-icons/tb";

const promotions = [
  {
    id: "summer-celebration-sale-1",
    name: "Summer Celebration Sale",
    type: "Percentage",
    typeColor: "text-[#A85A32]",
    value: "15%",
    validityTop: "6-12 July 26",
    validityBottom: "",
    status: "Active",
  },
  {
    id: "new-client-welcome",
    name: "New Client Welcome",
    type: "First Purchase",
    typeColor: "text-[#007A55]",
    value: "¥200",
    validityTop: "2025-06-01",
    validityBottom: "No end",
    status: "Active",
  },
  {
    id: "loyal-partner-reward",
    name: "Loyal Partner Reward",
    type: "Repeat Customer",
    typeColor: "text-[#432DD7]",
    value: "10%",
    validityTop: "2025-06-01",
    validityBottom: "2025-08-31",
    status: "Active",
  },
  {
    id: "spring-floral-flash",
    name: "Spring Floral Flash",
    type: "Limited Time",
    typeColor: "text-[#8D54FF]",
    value: "20%",
    validityTop: "2025-06-01",
    validityBottom: "2025-06-30",
    status: "Expired",
  },
  {
    id: "venue-partner-promo",
    name: "Venue Partner Promo",
    type: "Fixed Amount",
    typeColor: "text-[#5C85EE]",
    value: "15%",
    validityTop: "2025-06-01",
    validityBottom: "2025-08-31",
    status: "Active",
  },
  {
    id: "holiday-spectacular",
    name: "Holiday Spectacular",
    type: "Limited Time",
    typeColor: "text-[#8D54FF]",
    value: "15%",
    validityTop: "2025-06-01",
    validityBottom: "2025-08-31",
    status: "Scheduled",
  },
  {
    id: "summer-celebration-sale-2",
    name: "Summer Celebration Sale",
    type: "Percentage",
    typeColor: "text-[#A85A32]",
    value: "15%",
    validityTop: "2025-06-01",
    validityBottom: "2025-08-31",
    status: "Active",
  },
  {
    id: "summer-celebration-sale-3",
    name: "Summer Celebration Sale",
    type: "Percentage",
    typeColor: "text-[#A85A32]",
    value: "15%",
    validityTop: "2025-06-01",
    validityBottom: "2025-08-31",
    status: "Active",
  },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "percentage", label: "Percentage" },
  { value: "first purchase", label: "First Purchase" },
  { value: "repeat customer", label: "Repeat Customer" },
  { value: "limited time", label: "Limited Time" },
  { value: "fixed amount", label: "Fixed Amount" },
];

const statusOptions = [
  { value: "all", label: "Status" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "scheduled", label: "Scheduled" },
];

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "34px",
    borderColor: "#F2E5DD",
    borderRadius: "6px",
    boxShadow: "none",
    fontSize: "11px",
    "&:hover": { borderColor: "#E2CFC2" },
  }),
  valueContainer: (base) => ({ ...base, paddingLeft: "8px", paddingRight: "8px" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, color: "#B7774D", padding: "0 8px 0 0" }),
  menu: (base) => ({ ...base, zIndex: 30 }),
  option: (base, state) => ({
    ...base,
    fontSize: "11px",
    backgroundColor: state.isSelected ? "#B56735" : state.isFocused ? "#FCF4EF" : "#FFFFFF",
    color: state.isSelected ? "#FFFFFF" : "#6F625B",
  }),
};

const getStatusClasses = (status) => {
  if (status === "Active") return "bg-[#E8FAF2] text-[#007A55]";
  if (status === "Expired") return "bg-[#FFE9E8] text-[#F04444]";
  return "bg-[#FFF6E7] text-[#E6A11E]";
};

const Promotions = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [type, setType] = useState(typeOptions[0]);
  const [status, setStatus] = useState(statusOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredPromotions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return promotions.filter((promotion) => {
      const matchesSearch = !query || promotion.name.toLowerCase().includes(query);
      const matchesType =
        type.value === "all" || promotion.type.toLowerCase() === type.value;
      const matchesStatus =
        status.value === "all" || promotion.status.toLowerCase() === status.value;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, status, type]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, type, status]);

  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedPromotions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPromotions.slice(start, start + itemsPerPage);
  }, [filteredPromotions, currentPage]);

  const startItem =
    filteredPromotions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredPromotions.length);

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

  return (
    <div className="mt-5">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D1A48A]" size={13} />
          <input
            type="text"
            placeholder="Search promotions..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-[34px] w-full rounded-md border border-[#F3E7DE] bg-white pl-8 pr-3 text-[11px] text-[#6F625B] outline-none placeholder:text-[#C28E73] focus:border-[#D7B7A3]"
          />
        </div>

        <div className="w-full lg:w-[112px]">
          <Select
            instanceId="pricing-packages-type-filter"
            inputId="pricing-packages-type-filter"
            value={type}
            onChange={(selectedOption) => setType(selectedOption ?? typeOptions[0])}
            options={typeOptions}
            isSearchable={false}
            styles={selectStyles}
          />
        </div>

        <div className="w-full lg:w-[96px]">
          <Select
            instanceId="pricing-packages-status-filter"
            inputId="pricing-packages-status-filter"
            value={status}
            onChange={(selectedOption) => setStatus(selectedOption ?? statusOptions[0])}
            options={statusOptions}
            isSearchable={false}
            styles={selectStyles}
          />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-md border border-[#F4E9E1]">
        <table className="min-w-[980px] w-full">
          <thead>
            <tr className="bg-[#FBF5F0] text-left text-[11px] font-medium text-[#8F7B6E]">
              <th className="px-4 py-3">Promotion Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Validity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPromotions.map((promotion) => {
              const isActive = promotion.status === "Active";
              return (
                <tr
                  key={promotion.id}
                  className="border-t border-[#F8EEE8] bg-white text-[11px] text-[#5F534C]"
                >
                  <td className="px-4 py-3 font-semibold text-[#4A3D36]">
                    {promotion.name}
                  </td>
                  <td className={`px-4 py-3 font-medium ${promotion.typeColor}`}>
                    {promotion.type}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#4A3D36]">{promotion.value}</td>
                  <td className="px-4 py-3">
                    <p className="text-[#4A3D36]">{promotion.validityTop}</p>
                    {promotion.validityBottom ? (
                      <p className="mt-1 text-[#B29D8C]">{promotion.validityBottom}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${getStatusClasses(promotion.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${promotion.status === "Active" ? "bg-[#007A55]" : promotion.status === "Expired" ? "bg-[#F04444]" : "bg-[#E6A11E]"}`} />
                      {promotion.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 text-[#7D6C63]">
                      <button
                        type="button"
                        disabled={!isActive}
                        onClick={() => {
                          if (isActive) {
                            router.push(`/pricing-packages/${promotion.id}`);
                          }
                        }}
                        className={isActive ? "" : "cursor-default opacity-50"}
                      >
                        <TbEye size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={!isActive}
                        onClick={() => {
                          if (isActive) {
                            router.push(`/pricing-packages/${promotion.id}/edit`);
                          }
                        }}
                        className={isActive ? "" : "cursor-default opacity-50"}
                      >
                        <TbPencil size={13} />
                      </button>
                      <button type="button" className="cursor-default">
                        <TbBan size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredPromotions.length === 0 && (
        <div className="mt-4 rounded-md border border-dashed border-[#E6D6CD] bg-white px-4 py-10 text-center text-[11px] text-[#8B6A55]">
          No promotions found for the selected search and filters.
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 text-[11px] text-[#9A8C82] sm:flex-row sm:items-center sm:justify-between">
        <p>
          {filteredPromotions.length === 0
            ? "No results"
            : `Showing ${startItem}-${endItem} of ${filteredPromotions.length}`}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded border border-[#E9DDD4] text-[#C9B2A3] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <TbChevronLeft size={14} />
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
            <TbChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Promotions;