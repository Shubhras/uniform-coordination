"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
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
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetNotificationList } from "@/services/NotificationService";

const getApiErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.detail ||
  error?.message ||
  "";

const isNotificationNotFoundError = (error) =>
  error?.response?.status === 404 &&
  getApiErrorMessage(error).toLowerCase().includes("no notification");

const formatDate = (value, locale = "en-US") => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const targetLocale = locale === "ja" ? "ja-JP" : "en-GB";
  return new Intl.DateTimeFormat(targetLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const getNotificationStatus = (item) => {
  const rawStatus =
    item?.status ||
    item?.notification_status ||
    item?.delivery_status ||
    item?.state;

  if (typeof rawStatus === "string") {
    const normalized = rawStatus.trim().toLowerCase();

    if (["sent", "success", "delivered", "done"].includes(normalized)) {
      return "Sent";
    }

    if (["failed", "error", "undelivered"].includes(normalized)) {
      return "Failed";
    }
  }

  if (typeof item?.is_sent === "boolean") {
    return item.is_sent ? "Sent" : "Failed";
  }

  if (typeof item?.sent === "boolean") {
    return item.sent ? "Sent" : "Failed";
  }

  return "Sent";
};

const normalizeNotification = (item, locale = "en-US") => ({
  ...item,
  id: item?.id ?? item?.notification_id ?? item?.pk,
  recipient:
    item?.recipient_name ||
    item?.recipient ||
    item?.customer_name ||
    item?.user_name ||
    item?.name ||
    "-",
  email:
    item?.recipient_email ||
    item?.email ||
    item?.user_email ||
    item?.customer_email ||
    "-",
  orderId:
    item?.order_id ||
    item?.orderId ||
    item?.reference_id ||
    item?.reference ||
    "-",
  statusLabel: getNotificationStatus(item),
  sentAt: formatDate(
    item?.sent_at ||
    item?.created_at ||
    item?.updated_at ||
    item?.timestamp ||
    item?.date,
    locale
  ),
});

const matchesSearch = (item, query) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [item.id, item.recipient, item.email, item.orderId].some((value) =>
    String(value || "")
      .toLowerCase()
      .includes(normalizedQuery),
  );
};

const matchesStatus = (item, selectedStatus) => {
  if (selectedStatus === "all") {
    return true;
  }

  return item.statusLabel.toLowerCase() === selectedStatus;
};

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "40px",
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
  const t = useTranslations("notifications");
  const locale = useLocale();

  const statusOptions = [
    { value: "all", label: t("statusFilter") },
    { value: "sent", label: t("statusSent") },
    { value: "failed", label: t("statusFailed") },
  ];

  const router = useRouter();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState(statusOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchNotifications = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiGetNotificationList(accessToken);
      const payload = response?.data?.data || response?.data || response;
      const list =
        payload?.results ||
        payload?.rows ||
        payload?.notifications ||
        payload?.list ||
        payload?.items ||
        (Array.isArray(payload) ? payload : []);

      setNotifications(list.map((item) => normalizeNotification(item, locale)));
    } catch (error) {
      if (!isNotificationNotFoundError(error)) {
        console.error("Failed to fetch notifications:", error);
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(
      (item) =>
        matchesSearch(item, searchQuery) && matchesStatus(item, status.value),
    );
  }, [notifications, searchQuery, status.value]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, status.value]);

  const totalPages =
    Math.ceil(filteredNotifications.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [currentPage, filteredNotifications]);

  const startItem =
    filteredNotifications.length === 0
      ? 0
      : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(
    currentPage * itemsPerPage,
    filteredNotifications.length,
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) end = 4;
    if (currentPage >= totalPages - 2) start = totalPages - 3;

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }
    if (end < totalPages - 1) pages.push("...");

    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  const handleReset = () => {
    setSearchQuery("");
    setStatus(statusOptions[0]);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white px-3 py-4 sm:px-6 sm:py-5">
      <div className="mb-4">
        <h1 className="text-[24px] font-semibold leading-tight text-[#241915] sm:text-[28px]">
          {t("title")}
        </h1>
        <p className="mt-1 text-[12px] text-[#94867C] sm:text-xs">
          {t("subtitle")}
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
            placeholder={t("searchby")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-md border border-[#F3E7DE] bg-white pl-8 pr-8 text-[11px] text-[#6F625B] outline-none placeholder:text-[#C28E73] focus:border-[#D7B7A3]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A8E86]"
              aria-label={t("clearSearch")}
            >
              <FiX size={13} />
            </button>
          )}
        </div>

        <div className="w-full sm:w-[96px]">
          <Select
            // instanceId="notifications-status-filter"
            // inputId="notifications-status-filter"
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
          className="flex h-10 w-full items-center justify-center gap-1 rounded-md border border-[#F2E5DD] bg-white px-3 text-sm font-medium text-[#B7774D] transition hover:bg-[#FCF4EF] sm:w-auto"
        >
          <FiRotateCcw size={12} />
          {t("reset")}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F1F5F9] text-[#486284]">
            <tr className="bg-[#F7F2EE] text-[#6B7280] text-sm">
              <th className="text-left px-4 py-3 font-medium">{t("recipient")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("email")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("orderId")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("statusFilter")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("sentAt")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("action")}</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: itemsPerPage }).map((_, index) => (
                <tr
                  key={`loading-${index}`}
                  className="odd:bg-white even:bg-[#FBF8F6]"
                >
                  <td className="px-3 py-3">
                    <div className="h-4 w-28 animate-pulse rounded bg-[#F5ECE6]" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 w-40 animate-pulse rounded bg-[#F5ECE6]" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 w-20 animate-pulse rounded bg-[#F5ECE6]" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-6 w-16 animate-pulse rounded-full bg-[#F5ECE6]" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-[#F5ECE6]" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="mx-auto h-6 w-14 animate-pulse rounded-full bg-[#F5ECE6]" />
                  </td>
                </tr>
              ))
              : paginatedNotifications.map((item) => {
                const isSent = item.statusLabel === "Sent";
                const targetOrderId =
                  item.orderId && item.orderId !== "-"
                    ? item.orderId
                    : item.id;
                const canView = Boolean(targetOrderId);

                return (
                  <tr
                    key={item.id}
                    className="odd:bg-white even:bg-[#FBF8F6]"
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
                        {isSent ? t("statusSent") : t("statusFailed")}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#4A3D36]">
                      {item.sentAt}
                    </td>
                    <td className="px-3 py-3 text-start">
                      <button
                        type="button"
                        disabled={!canView}
                        onClick={() => {
                          if (canView) {
                            router.push(`/orders/${targetOrderId}`);
                          }
                        }}
                        className={`inline-flex items-center gap-1 rounded-lg border border-[#EDD8CA] bg-white px-3 py-1 text-[10px] font-medium text-[#C17443] transition hover:bg-[#FCF4EE] ${canView ? "" : "cursor-default opacity-60"
                          }`}
                      >
                        <FiEye size={11} />
                        {t("view")}
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {!loading && filteredNotifications.length === 0 && (
        <div className="mt-4 rounded-md border border-dashed border-[#E6D6CD] bg-white px-4 py-10 text-center text-[13px] text-[#8B6A55]">
          {t("noNotifications")}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 text-[11px] text-[#9A8C82] sm:flex-row sm:items-center sm:justify-between">
        <p>
          {filteredNotifications.length === 0
            ? "Showing 0 of 0"
            : `Showing ${startItem}-${endItem} of ${filteredNotifications.length}`}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded border border-[#E9DDD4] text-[#C9B2A3] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronLeft size={14} />
          </button>

          {pageNumbers.map((page, idx) =>
            page === "..." ? (
              <span key={`dots-${idx}`} className="px-1 text-[#8C7C73]">
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                className={`flex h-8 min-w-[30px] items-center justify-center rounded px-2 ${currentPage === page
                  ? "bg-[#D88957] text-white"
                  : "text-[#8C7C73] hover:bg-[#FCF4EF]"
                  }`}
              >
                {page}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded border border-[#E9DDD4] text-[#8C7C73] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
