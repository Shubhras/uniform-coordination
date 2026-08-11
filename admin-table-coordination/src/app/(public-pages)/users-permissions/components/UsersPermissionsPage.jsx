"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Pagination from "@/components/ui/Pagination";
import Select from "react-select";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiRotateCcw,
  FiSearch,
  FiSlash,
  FiX,
} from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetUsersList } from "@/services/UserPermissionService";
import PermissionPage from "./PermissionPage";
import Spinner from "@/components/ui/Spinner";





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
  if (typeof user?.isActive === "boolean") {
    return user.isActive ? "Active" : "Inactive";
  }

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
    minHeight: "40px",
    borderColor: "#EFE5DD",
    boxShadow: "none",
    borderRadius: "8px",
    "&:hover": {
      borderColor: "#C08457",
    },
  }),

  singleValue: (base) => ({
    ...base,
    color: "#A85A32B2",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#A85A32B2",
  }),

  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#A0522D"
      : state.isFocused
        ? "#F8F2ED"
        : "#fff",
    color: state.isSelected ? "#fff" : "#444",
  }),
};
const UsersPermissionsPage = () => {
  const t = useTranslations("userPermissions.users");
  const tp = useTranslations("userPermissions.permissions");

  const typeOptions = [
    { value: "all", label: t("allTypes") },
    { value: "b2c", label: "B2C" },
    { value: "b2b", label: "B2B" },
    { value: "user", label: t("typeUser") },
  ];

  const statusOptions = [
    { value: "all", label: t("statusFilter") },
    { value: "active", label: t("active") },
    { value: "inactive", label: t("inactive") },
  ];

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

  const handleReset = () => {
    setSearchQuery("");
    setUserType(typeOptions[0]);
    setStatus(statusOptions[0]);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-[30px] font-semibold leading-tight text-[#2A211D]">
        {t("title")}
      </h1>
      <p className="mt-1 text-[13px] text-[#B29D8C]">
        {t("subtitle")}
      </p>

      <div className="mt-5 flex gap-8 border-b border-[#E8DDD4]">
        {[
          { key: "Users", label: t("users") },
          { key: "Permissions", label: tp("permission") },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`pb-1 text-base font-medium whitespace-nowrap ${
              activeTab === tab.key
                ? "text-[#000000] text-[16px] border-b-3 border-[#A85A32]"
                : "text-[#525252] text-[16px]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "Users" && (
        <>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-5">
            <div className="relative w-full lg:max-w-xl">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A85A32B2]"
                size={16}
              />

              <input
                type="text"
                placeholder={t("searchUsers")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 border border-[#D1D5DB] text-[#A85A32B2] rounded-lg pl-10 pr-10 outline-none focus:border-[#1C4FA8]"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <FiX className="text-gray-500" />
                </button>
              )}
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Filters */}
              <div className="flex gap-3">
                <div className="w-52">
                  <Select
                    value={status}
                    onChange={setStatus}
                    options={statusOptions}
                    styles={selectStyles}
                    isSearchable={false}
                  />
                </div>

                <div className="w-52">
                  <Select
                    value={userType}
                    onChange={setUserType}
                    options={typeOptions}
                    styles={selectStyles}
                    isSearchable={false}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex h-10 items-center gap-2 rounded-lg border border-[#EFE5DD] bg-white px-4 text-sm font-medium text-[#C08457] transition hover:bg-[#FCF7F3]"
                >
                  <FiRotateCcw size={14} />
                  {t("reset")}
                </button>
              </div>
            </div>
          </div>

          <div className=" mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F1F5F9] text-[#486284]">
                <tr className="bg-[#F7F2EE] text-[#6B7280] text-sm">
                  <th className="text-left px-4 py-3">{t("fullNameColumn")}</th>
                  <th className="text-left px-4 py-3">{t("role")}</th>
                  <th className="text-left px-4 py-3">{t("email")}</th>
                  <th className="text-left px-4 py-3">{t("registration")}</th>
                  <th className="text-left px-4 py-3">{t("statusColumn")}</th>
                  <th className="text-left px-4 py-3">{t("actionsColumn")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16">
                      <div className="flex justify-center items-center h-[400px]">
                        <Spinner size={40} customColorClass="text-[#A0522D]" />
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const canViewUser = Boolean(user.id);

                    return (
                      <tr
                        key={user.id}
                        className="odd:bg-white even:bg-[#FBF8F6]"
                      >
                        <td className="px-4 py-3 font-semibold text-[#4A3D36]">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded px-3 py-1 text-[12px] font-medium ${
                              user.role === "b2c"
                                ? "bg-[#EAF4FF] text-[#4B93D4]"
                                : user.role === "b2b"
                                  ? "bg-[#FFF0E8] text-[#C58A62]"
                                  : "bg-[#F3F4F6] text-[#6B7280]"
                            }`}
                          >
                            {user.role?.toUpperCase()}
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
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium ${
                              user.isActive
                                ? "bg-[#E8FAF2] text-[#007A55]"
                                : "bg-[#FFE9E8] text-[#F04444]"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                user.isActive ? "bg-[#007A55]" : "bg-[#F04444]"
                              }`}
                            />
                            {user.isActive ? t("active") : t("inactive")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-0 text-[#7D6C63]">
                            <button
                              type="button"
                              disabled={!canViewUser}
                              onClick={() => {
                                if (canViewUser) {
                                  router.push(`/users-permissions/${user.id}`);
                                }
                              }}
                              className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"

                              // className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-[#F1E8E2] transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"
                            >
                              <FiEye size={17} />
                            </button>
                            <button
                              type="button"
                              className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"

                              // className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-[#F1E8E2] transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"
                            >
                              <FiSlash size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && users.length === 0 && (
            <div className="mt-4 rounded-md border border-dashed border-[#E6D6CD] bg-white px-4 py-10 text-center text-[14px] text-[#8B6A55]">
              {t("noUsers")}
            </div>
          )}

          <div
            className="flex justify-end mt-3"
            style={{ marginRight: "6px", marginLeft: "6px" }}
          >
            <Pagination
              currentPage={currentPage}
              pageSize={itemsPerPage}
              total={pagination.total_items}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>
        </>
      )}
      {activeTab === "Permissions" && <PermissionPage />}
    </div>
  );
};

export default UsersPermissionsPage;
