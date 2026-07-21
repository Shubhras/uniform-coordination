"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiRotateCcw,
  FiSearch,
  FiX,
} from "react-icons/fi";

const notifications = [
  {
    id: "NOT-0001",
    recipient: "Sophia Hartmann",
    email: "sophia.hartmann@outlook.com",
    orderId: "ORD-88421",
    status: "Sent",
    sentAt: "09 Jul 2025, 20:02",
  },
  {
    id: "NOT-0002",
    recipient: "Courtney Henry",
    email: "curtis.weaver@example.com",
    orderId: "ORD-88421",
    status: "Failed",
    sentAt: "09 Jul 2025, 20:02",
  },
  {
    id: "NOT-0003",
    recipient: "Darrell Steward",
    email: "deanna.curtis@example.com",
    orderId: "ORD-88421",
    status: "Sent",
    sentAt: "09 Jul 2025, 20:02",
  },
  {
    id: "NOT-0004",
    recipient: "Leslie Alexander",
    email: "dolores.chambers@example.com",
    orderId: "ORD-88421",
    status: "Sent",
    sentAt: "09 Jul 2025, 20:02",
  },
  {
    id: "NOT-0005",
    recipient: "Albert Flores",
    email: "kenzi.lawson@example.com",
    orderId: "ORD-88421",
    status: "Sent",
    sentAt: "09 Jul 2025, 20:02",
  },
  {
    id: "NOT-0006",
    recipient: "Kristin Watson",
    email: "dolores.chambers@example.com",
    orderId: "ORD-88421",
    status: "Sent",
    sentAt: "09 Jul 2025, 20:02",
  },
  {
    id: "NOT-0007",
    recipient: "Cameron Williamson",
    email: "michael.mitc@example.com",
    orderId: "ORD-88421",
    status: "Sent",
    sentAt: "09 Jul 2025, 20:02",
  },
  {
    id: "NOT-0008",
    recipient: "Dianne Russell",
    email: "bill.sanders@example.com",
    orderId: "ORD-88421",
    status: "Sent",
    sentAt: "09 Jul 2025, 20:02",
  },
];

const statusOptions = [
  { value: "all", label: "Status" },
  { value: "sent", label: "Sent" },
  { value: "failed", label: "Failed" },
];

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "34px",
    borderColor: "#F2E5DD",
    borderRadius: "6px",
    boxShadow: "none",
    fontSize: "11px",
    "&:hover": {
      borderColor: "#E2CFC2",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    paddingLeft: "8px",
    paddingRight: "8px",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#B7774D",
    padding: "0 8px 0 0",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 30,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "11px",
    backgroundColor: state.isSelected
      ? "#B56735"
      : state.isFocused
        ? "#FCF4EF"
        : "#FFFFFF",
    color: state.isSelected ? "#FFFFFF" : "#6F625B",
  }),
};

const NotificationPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState(statusOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return notifications.filter((item) => {
      const matchesSearch =
        !query ||
        item.recipient.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.orderId.toLowerCase().includes(query);

      const matchesStatus =
        status.value === "all" ||
        item.status.toLowerCase() === status.value.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, status]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, status]);

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [filteredNotifications, currentPage]);

  const startItem =
    filteredNotifications.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredNotifications.length);

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

  return (
    <div className="min-h-screen bg-white px-3 py-4 sm:px-6 sm:py-5">
      <div className="mb-4">
        <h1 className="text-[24px] font-semibold leading-tight text-[#241915] sm:text-[28px]">
          Notifications
        </h1>
        <p className="mt-1 text-[11px] text-[#94867C] sm:text-xs">
          All transactional notifications sent by KIREIZ SPACE
        </p>
      </div>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:flex-1">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D1A48A]"
            size={13}
          />
          <input
            type="text"
            placeholder="Search by ID, recipient, order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[34px] w-full rounded-md border border-[#F3E7DE] bg-white pl-8 pr-8 text-[11px] text-[#6F625B] outline-none placeholder:text-[#C28E73] focus:border-[#D7B7A3]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A8E86]"
              aria-label="Clear search"
            >
              <FiX size={13} />
            </button>
          )}
        </div>

        <div className="w-full sm:w-[96px]">
          <Select
            instanceId="notifications-status-filter"
            inputId="notifications-status-filter"
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
          className="flex h-[34px] w-full items-center justify-center gap-1 rounded-md border border-[#F2E5DD] bg-white px-3 text-[11px] font-medium text-[#B7774D] transition hover:bg-[#FCF4EF] sm:w-auto"
        >
          <FiRotateCcw size={12} />
          Reset
        </button>
      </div>

      <div className="overflow-x-auto rounded-md border border-[#F4E9E1]">
        <table className="min-w-[980px] w-full">
          <thead>
            <tr className="bg-[#FBF5F0] text-left text-[11px] font-medium text-[#8F7B6E]">
              <th className="px-3 py-3">Recipient</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Order ID</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Sent At</th>
              <th className="px-3 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedNotifications.map((item) => {
              const isSent = item.status === "Sent";
              return (
                <tr
                  key={item.id}
                  className="border-t border-[#F8EEE8] bg-white text-[11px] text-[#5F534C]"
                >
                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#4A3D36]">
                    {item.recipient}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-[#4A3D36]">
                    {item.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#4A3D36]">
                    {item.orderId}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${isSent
                          ? "bg-[#E8FAF2] text-[#007A55]"
                          : "bg-[#FFE9E8] text-[#F04444]"
                        }`}
                    >
                      {isSent ? (
                        <FiCheckCircle size={11} />
                      ) : (
                        <FiAlertCircle size={11} />
                      )}
                      {item.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#4A3D36]">
                    {item.sentAt}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/notifications/${item.status.toLowerCase()}`)
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-[#EDD8CA] bg-white px-3 py-1 text-[10px] font-medium text-[#C17443] transition hover:bg-[#FCF4EE]"
                    >
                      <FiEye size={11} />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredNotifications.length === 0 && (
        <div className="mt-4 rounded-md border border-dashed border-[#E6D6CD] bg-white px-4 py-10 text-center text-[11px] text-[#8B6A55]">
          No notifications found for the selected search and status.
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 text-[11px] text-[#9A8C82] sm:flex-row sm:items-center sm:justify-between">
        <p>
          {filteredNotifications.length === 0
            ? "No results"
            : `Showing ${startItem}-${endItem} of ${filteredNotifications.length}`}
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

export default NotificationPage;