"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiRotateCcw,
  FiSearch,
  FiSlash,
} from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetUsersList } from "@/services/UserPermissionService";

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "b2c", label: "B2C" },
  { value: "b2b", label: "B2B" },
];

const statusOptions = [
  { value: "all", label: "Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const getApiErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.detail ||
  error?.message ||
  "";

const isUsersNotFoundError = (error) =>
  error?.response?.status === 404 &&
  getApiErrorMessage(error).toLowerCase().includes("no users found");

const getDisplayName = (user) =>
  user?.fullName ||
  user?.full_name ||
  user?.name ||
  user?.user_name ||
  user?.username ||
  "-";

const getDisplayEmail = (user) => user?.email || user?.user_email || "-";

const getDisplayStatus = (user) => {
  if (typeof user?.status === "boolean") {
    return user.status ? "Active" : "Inactive";
  }

  if (typeof user?.is_active === "boolean") {
    return user.is_active ? "Active" : "Inactive";
  }

  const rawStatus =
    user?.status_label ||
    user?.statusText ||
    user?.account_status ||
    user?.state;

  if (typeof rawStatus === "string") {
    return rawStatus.toLowerCase() === "active" ? "Active" : "Inactive";
  }

  return "Inactive";
};

const getDisplayUserType = (user) => {
  const rawType =
    user?.display_user_type ||
    user?.user_type_label ||
    user?.customer_type ||
    user?.userType ||
    user?.user_type ||
    user?.type;

  if (typeof rawType === "string") {
    const normalized = rawType.trim().toLowerCase();

    if (["b2b", "business", "corporate", "company"].includes(normalized)) {
      return "B2B";
    }

    if (["b2c", "customer", "individual", "consumer"].includes(normalized)) {
      return "B2C";
    }
  }

  if (typeof user?.role === "number") {
    return user.role === 2 ? "B2C" : "B2B";
  }

  return "B2C";
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).format(date);
};

const normalizeUser = (user) => ({
  ...user,
  id: user?.id ?? user?.user_id ?? user?.pk,
  fullName: getDisplayName(user),
  email: getDisplayEmail(user),
  userType: getDisplayUserType(user),
  registrationDate: formatDate(
    user?.registrationDate ||
      user?.registration_date ||
      user?.created_at ||
      user?.date_joined ||
      user?.createdAt,
  ),
  statusLabel: getDisplayStatus(user),
  isActive: getDisplayStatus(user) === "Active",
});

const matchesSearchQuery = (user, query) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [user.fullName, user.email].some((value) =>
    String(value || "")
      .toLowerCase()
      .includes(normalizedQuery),
  );
};

const matchesUserType = (user, selectedType) => {
  if (selectedType === "all") {
    return true;
  }

  return user.userType.toLowerCase() === selectedType;
};

const matchesStatus = (user, selectedStatus) => {
  if (selectedStatus === "all") {
    return true;
  }

  return selectedStatus === "active" ? user.isActive : !user.isActive;
};

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
  menu: (base) => ({ ...base, zIndex: 30 }),
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

const UsersPermissionsPage = () => {
  const router = useRouter();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const filteredModePageSize = 200;

  const [activeTab, setActiveTab] = useState("Users");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userType, setUserType] = useState(typeOptions[0]);
  const [status, setStatus] = useState(statusOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: itemsPerPage,
    total_pages: 1,
    total_items: 0,
  });
  const hasActiveFilters = userType.value !== "all" || status.value !== "all";

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, status.value, userType.value]);

  const fetchUsers = useCallback(async () => {
    if (!accessToken || activeTab !== "Users") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      const requestPage = hasActiveFilters ? 1 : currentPage;
      const requestPageSize = hasActiveFilters
        ? filteredModePageSize
        : itemsPerPage;

      if (searchQuery.trim()) {
        queryParams.set("search", searchQuery.trim());
      }

      const response = await apiGetUsersList(
        accessToken,
        requestPage,
        requestPageSize,
        `&${queryParams.toString()}`,
      );

      const payload = response?.data?.data || response?.data || response;
      const list =
        payload?.results ||
        payload?.rows ||
        payload?.users ||
        payload?.list ||
        payload?.items ||
        (Array.isArray(payload) ? payload : []);
      const responsePagination = payload?.pagination || response?.pagination;
      const normalizedUsers = list.map(normalizeUser);
      const totalItems =
        responsePagination?.total_items ??
        payload?.count ??
        payload?.total ??
        payload?.total_items ??
        payload?.total_count ??
        response?.count ??
        response?.total ??
        response?.total_items ??
        normalizedUsers.length;
      const totalPages =
        responsePagination?.total_pages ??
        payload?.total_pages ??
        response?.total_pages ??
        Math.max(1, Math.ceil(totalItems / itemsPerPage));
      const pageSize =
        responsePagination?.page_size ??
        payload?.page_size ??
        response?.page_size ??
        itemsPerPage;
      const page =
        responsePagination?.page ??
        payload?.page ??
        response?.page ??
        currentPage;

      if (hasActiveFilters) {
        const filteredUsers = normalizedUsers.filter(
          (user) =>
            matchesSearchQuery(user, searchQuery) &&
            matchesUserType(user, userType.value) &&
            matchesStatus(user, status.value),
        );
        const filteredTotalItems = filteredUsers.length;
        const filteredTotalPages = Math.max(
          1,
          Math.ceil(filteredTotalItems / itemsPerPage),
        );
        const safeCurrentPage = Math.min(currentPage, filteredTotalPages);
        const pageStartIndex = (safeCurrentPage - 1) * itemsPerPage;
        const paginatedFilteredUsers = filteredUsers.slice(
          pageStartIndex,
          pageStartIndex + itemsPerPage,
        );

        setUsers(paginatedFilteredUsers);
        setPagination({
          page: safeCurrentPage,
          page_size: itemsPerPage,
          total_pages: filteredTotalPages,
          total_items: filteredTotalItems,
        });
        return;
      }

      setUsers(
        normalizedUsers.filter((user) => matchesSearchQuery(user, searchQuery)),
      );
      setPagination({
        page,
        page_size: pageSize,
        total_pages: totalPages,
        total_items: totalItems,
      });
    } catch (error) {
      if (!isUsersNotFoundError(error)) {
        console.error("Failed to fetch users:", error);
      }
      setUsers([]);
      setPagination({
        page: currentPage,
        page_size: itemsPerPage,
        total_pages: 1,
        total_items: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [
    accessToken,
    activeTab,
    currentPage,
    hasActiveFilters,
    itemsPerPage,
    filteredModePageSize,
    searchQuery,
    status.value,
    userType.value,
  ]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [fetchUsers]);

  const totalPages = pagination.total_pages || 1;
  const startItem =
    pagination.total_items === 0
      ? 0
      : (currentPage - 1) * pagination.page_size + 1;
  const endItem = Math.min(
    currentPage * pagination.page_size,
    pagination.total_items,
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
    setUserType(typeOptions[0]);
    setStatus(statusOptions[0]);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-[30px] font-semibold leading-tight text-[#2A211D]">
        Users &amp; Permissions
      </h1>
      <p className="mt-1 text-[12px] text-[#B29D8C]">
        Manage user accounts, roles, permissions, and access across the
        platform.
      </p>

      <div className="mt-5 flex gap-8 border-b border-[#E8DDD4]">
        {["Users", "Permissions"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`border-b pb-3 text-[12px] ${
              activeTab === tab
                ? "border-[#B56735] text-[#2B211C]"
                : "border-transparent text-[#7F756E]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Users" ? (
        <>
          <div className="mt-5 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D1A48A]"
                size={13}
              />
              <input
                type="text"
                placeholder="Search by user name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-[34px] w-full rounded-md border border-[#F3E7DE] bg-white pl-8 pr-3 text-[11px] text-[#6F625B] outline-none placeholder:text-[#C28E73] focus:border-[#D7B7A3]"
              />
            </div>

            <div className="w-full lg:w-[112px]">
              <Select
                instanceId="users-type-filter"
                inputId="users-type-filter"
                value={userType}
                onChange={(selectedOption) =>
                  setUserType(selectedOption ?? typeOptions[0])
                }
                options={typeOptions}
                isSearchable={false}
                styles={selectStyles}
              />
            </div>

            <div className="w-full lg:w-[96px]">
              <Select
                instanceId="users-status-filter"
                inputId="users-status-filter"
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
              className="flex h-[34px] w-full items-center justify-center gap-1 rounded-md border border-[#F2E5DD] bg-white px-3 text-[11px] font-medium text-[#B7774D] transition hover:bg-[#FCF4EF] lg:w-auto"
            >
              <FiRotateCcw size={12} />
              Reset
            </button>
          </div>

          <div className="mt-4 overflow-x-auto rounded-md border border-[#F4E9E1]">
            <table className="min-w-[980px] w-full">
              <thead>
                <tr className="bg-[#FBF5F0] text-left text-[11px] font-medium text-[#8F7B6E]">
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">User Type</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Registration Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: itemsPerPage }).map((_, index) => (
                      <tr
                        key={`loading-${index}`}
                        className="border-t border-[#F8EEE8] bg-white text-[11px] text-[#5F534C]"
                      >
                        <td className="px-4 py-3">
                          <div className="h-4 w-28 animate-pulse rounded bg-[#F5ECE6]" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-12 animate-pulse rounded bg-[#F5ECE6]" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-40 animate-pulse rounded bg-[#F5ECE6]" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-20 animate-pulse rounded bg-[#F5ECE6]" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-6 w-16 animate-pulse rounded-full bg-[#F5ECE6]" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-10 animate-pulse rounded bg-[#F5ECE6]" />
                        </td>
                      </tr>
                    ))
                  : users.map((user) => {
                      const isActive = user.isActive;
                      const canViewUser = Boolean(user.id);

                      return (
                        <tr
                          key={user.id}
                          className="border-t border-[#F8EEE8] bg-white text-[11px] text-[#5F534C]"
                        >
                          <td className="px-4 py-3 font-semibold text-[#4A3D36]">
                            {user.fullName}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded px-2 py-0.5 text-[9px] font-medium ${
                                user.userType === "B2C"
                                  ? "bg-[#EAF4FF] text-[#4B93D4]"
                                  : "bg-[#FFF0E8] text-[#C58A62]"
                              }`}
                            >
                              {user.userType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#4A3D36]">
                            {user.email}
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#4A3D36]">
                            {user.registrationDate}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                                isActive
                                  ? "bg-[#E8FAF2] text-[#007A55]"
                                  : "bg-[#FFE9E8] text-[#F04444]"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isActive ? "bg-[#007A55]" : "bg-[#F04444]"
                                }`}
                              />
                              {user.statusLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 text-[#7D6C63]">
                              <button
                                type="button"
                                disabled={!canViewUser}
                                onClick={() => {
                                  if (canViewUser) {
                                    router.push(
                                      `/users-permissions/${user.id}`,
                                    );
                                  }
                                }}
                                className={
                                  canViewUser ? "" : "cursor-default opacity-60"
                                }
                              >
                                <FiEye size={13} />
                              </button>
                              <button type="button" className="cursor-default">
                                <FiSlash size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {!loading && users.length === 0 && (
            <div className="mt-4 rounded-md border border-dashed border-[#E6D6CD] bg-white px-4 py-10 text-center text-[11px] text-[#8B6A55]">
              No users found for the selected search and filters.
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 text-[11px] text-[#9A8C82] sm:flex-row sm:items-center sm:justify-between">
            <p>
              {pagination.total_items === 0
                ? "No results"
                : `Showing ${startItem}-${endItem} of ${pagination.total_items}`}
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
                    className={`flex h-8 min-w-[30px] items-center justify-center rounded px-2 ${
                      currentPage === page
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
        </>
      ) : null}
    </div>
  );
};

export default UsersPermissionsPage;
