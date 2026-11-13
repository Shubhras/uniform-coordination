"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Pagination from "@/components/ui/Pagination";
import Select from "react-select";
import {
  FiSearch,
  FiX,
  FiRotateCcw,
  FiPlus,
  FiEdit2,
  FiSlash,
  FiCheckCircle,
  FiShield,
  FiAlertTriangle,
} from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiGetAdminUsersList,
  apiCreateAdminUser,
  apiUpdateAdminUser,
} from "@/services/UserPermissionService";
import Spinner from "@/components/ui/Spinner";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";

const validatePasswordComplexity = (password, t) => {
  if (!password || password.length < 12) {
    return t ? t("passwordMinLength") : "Password must be at least 12 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return t ? t("passwordUppercase") : "Password must contain at least one uppercase letter (A-Z).";
  }
  if (!/[a-z]/.test(password)) {
    return t ? t("passwordLowercase") : "Password must contain at least one lowercase letter (a-z).";
  }
  if (!/[0-9]/.test(password)) {
    return t ? t("passwordNumber") : "Password must contain at least one number (0-9).";
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    return t ? t("passwordSpecial") : "Password must contain at least one special character (!@#$%^&* etc.).";
  }
  return null;
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

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
    year: "2-digit",
  }).format(date);
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

const AdminUsers = () => {
  const t = useTranslations("userPermissions.users");
  const locale = useLocale();

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const currentAdminEmail = session?.user?.email;

  const adminRoleOptions = [
    { value: "all", label: t("allRoles") },
    { value: "admin", label: t("admin") },
    { value: "staff", label: t("staff") },
    { value: "logistics", label: t("logistics") },
    { value: "corporate", label: t("corporate") },
  ];

  const statusOptions = [
    { value: "all", label: t("statusFilter") || "Status" },
    { value: "active", label: t("active") || "Active" },
    { value: "inactive", label: t("inactive") || "Inactive" },
  ];

  // Admin / Staff Users State
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminRoleFilter, setAdminRoleFilter] = useState(adminRoleOptions[0]);
  const [adminStatusFilter, setAdminStatusFilter] = useState(statusOptions[0]);
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [adminPagination, setAdminPagination] = useState({
    page: 1,
    page_size: itemsPerPage,
    total_pages: 1,
    total_items: 0,
  });

  // Add Admin User Modal
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [createAdminLoading, setCreateAdminLoading] = useState(false);
  const [createAdminError, setCreateAdminError] = useState("");
  const [adminFormErrors, setAdminFormErrors] = useState({});
  const [newAdminForm, setNewAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    role: "staff",
  });

  // Edit Admin User Modal
  const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false);
  const [editAdminLoading, setEditAdminLoading] = useState(false);
  const [editAdminError, setEditAdminError] = useState("");
  const [selectedAdminForEdit, setSelectedAdminForEdit] = useState(null);
  const [editAdminForm, setEditAdminForm] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "staff",
    password: "",
    is_active: true,
  });

  // Deactivate / Activate Admin User Confirmation Modal
  const [selectedAdminForStatus, setSelectedAdminForStatus] = useState(null);
  const [statusActionLoading, setStatusActionLoading] = useState(false);
  const [statusError, setStatusError] = useState("");

  // Fetch Admin Users
  const fetchAdminUsers = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      setAdminLoading(true);
      const queryParams = new URLSearchParams();

      if (adminSearchQuery.trim()) {
        queryParams.set("search", adminSearchQuery.trim());
      }
      if (adminRoleFilter.value !== "all") {
        queryParams.set("role", adminRoleFilter.value);
      }
      if (adminStatusFilter.value !== "all") {
        queryParams.set(
          "status",
          adminStatusFilter.value === "active" ? "true" : "false",
        );
      }

      const response = await apiGetAdminUsersList(
        accessToken,
        adminCurrentPage,
        itemsPerPage,
        queryParams.toString() ? `&${queryParams.toString()}` : "",
      );

      const payload = response?.data?.data || response?.data || response;
      const list =
        payload?.results ||
        payload?.rows ||
        payload?.users ||
        payload?.items ||
        (Array.isArray(payload) ? payload : []);
      const count = payload?.count ?? list.length;

      setAdminUsers(list);
      setAdminPagination({
        page: adminCurrentPage,
        page_size: itemsPerPage,
        total_pages: Math.max(1, Math.ceil(count / itemsPerPage)),
        total_items: count,
      });
    } catch (err) {
      console.error("Failed to fetch admin users:", err);
      setAdminUsers([]);
    } finally {
      setAdminLoading(false);
    }
  }, [
    accessToken,
    adminCurrentPage,
    adminSearchQuery,
    adminRoleFilter.value,
    adminStatusFilter.value,
  ]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAdminUsers();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchAdminUsers]);

  const handleAdminReset = () => {
    setAdminSearchQuery("");
    setAdminRoleFilter(adminRoleOptions[0]);
    setAdminStatusFilter(statusOptions[0]);
    setAdminCurrentPage(1);
  };

  // Create Admin User
  const handleCreateAdminUser = async (e) => {
    e.preventDefault();
    setCreateAdminError("");

    const errors = {};
    if (!newAdminForm.name.trim()) {
      errors.name = t("fullNameRequired") || "Full name is required";
    }
    if (!newAdminForm.email.trim()) {
      errors.email = t("emailRequired") || "Email address is required";
    } else if (!isValidEmail(newAdminForm.email.trim())) {
      errors.email = t("emailInvalid") || "Please enter a valid email address";
    }
    if (!newAdminForm.password.trim()) {
      errors.password = t("passwordRequired") || "Password is required";
    } else {
      const passwordError = validatePasswordComplexity(newAdminForm.password, t);
      if (passwordError) {
        errors.password = passwordError;
      }
    }
    if (!newAdminForm.role) {
      errors.role = t("roleRequired") || "Please select a role";
    }
    if (newAdminForm.mobile && newAdminForm.mobile.trim().length > 15) {
      errors.mobile = t("phoneMaxLength") || "Phone number cannot exceed 15 characters";
    }

    if (Object.keys(errors).length > 0) {
      setAdminFormErrors(errors);
      return;
    }
    setAdminFormErrors({});

    try {
      setCreateAdminLoading(true);
      setCreateAdminError("");

      const payload = {
        name: newAdminForm.name.trim(),
        email: newAdminForm.email.trim(),
        password: newAdminForm.password,
        mobile: newAdminForm.mobile.trim(),
        role: newAdminForm.role,
      };

      const res = await apiCreateAdminUser(accessToken, payload);
      if (res?.status || res?.statusCode === 201) {
        toast.push(
          <Notification title="Success" type="success">
            {res?.message || "Admin / Staff user created successfully."}
          </Notification>,
        );
        setIsAddAdminModalOpen(false);
        setNewAdminForm({
          name: "",
          email: "",
          password: "",
          mobile: "",
          role: "staff",
        });
        setAdminFormErrors({});
        fetchAdminUsers();
      } else {
        setCreateAdminError(res?.message || "Failed to create account.");
      }
    } catch (err) {
      let msg = err?.response?.data?.message;
      const backendErrors = err?.response?.data?.errors;
      if (backendErrors && typeof backendErrors === "object") {
        const fieldErrors = {};
        if (backendErrors.name) fieldErrors.name = Array.isArray(backendErrors.name) ? backendErrors.name[0] : backendErrors.name;
        if (backendErrors.email) fieldErrors.email = Array.isArray(backendErrors.email) ? backendErrors.email[0] : backendErrors.email;
        if (backendErrors.password) fieldErrors.password = Array.isArray(backendErrors.password) ? backendErrors.password[0] : backendErrors.password;
        if (backendErrors.mobile) fieldErrors.mobile = Array.isArray(backendErrors.mobile) ? backendErrors.mobile[0] : backendErrors.mobile;
        if (backendErrors.role) fieldErrors.role = Array.isArray(backendErrors.role) ? backendErrors.role[0] : backendErrors.role;
        if (Object.keys(fieldErrors).length > 0) {
          setAdminFormErrors((prev) => ({ ...prev, ...fieldErrors }));
        }
      }
      setCreateAdminError(
        msg || err?.message || "Failed to create admin user.",
      );
    } finally {
      setCreateAdminLoading(false);
    }
  };

  // Open Edit Admin Modal
  const handleOpenEditAdminModal = (user) => {
    setSelectedAdminForEdit(user);
    setEditAdminForm({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      role: user.role?.name || user.role_name || "staff",
      password: "",
      is_active: user.is_active ?? true,
    });
    setEditAdminError("");
    setIsEditAdminModalOpen(true);
  };

  // Save Edit Admin User
  const handleSaveEditAdminUser = async (e) => {
    e.preventDefault();
    if (!selectedAdminForEdit) return;

    try {
      setEditAdminLoading(true);
      setEditAdminError("");

      if (editAdminForm.mobile && editAdminForm.mobile.trim().length > 15) {
        setEditAdminError("Phone number cannot exceed 15 characters.");
        setEditAdminLoading(false);
        return;
      }

      const payload = {
        name: editAdminForm.name.trim(),
        email: editAdminForm.email.trim(),
        mobile: editAdminForm.mobile.trim(),
        role: editAdminForm.role,
        is_active: editAdminForm.is_active,
      };

      if (editAdminForm.password.trim()) {
        const passwordError = validatePasswordComplexity(
          editAdminForm.password.trim(),
          t,
        );
        if (passwordError) {
          setEditAdminError(passwordError);
          setEditAdminLoading(false);
          return;
        }
        payload.password = editAdminForm.password.trim();
      }

      const res = await apiUpdateAdminUser(
        accessToken,
        selectedAdminForEdit.id,
        payload,
      );
      if (res?.status || res?.statusCode === 200) {
        toast.push(
          <Notification title="Success" type="success">
            Account updated successfully.
          </Notification>,
        );
        setIsEditAdminModalOpen(false);
        setSelectedAdminForEdit(null);
        fetchAdminUsers();
      } else {
        setEditAdminError(res?.message || "Failed to update account.");
      }
    } catch (err) {
      let msg = err?.response?.data?.message;
      if (!msg) {
        const errors = err?.response?.data?.errors;
        if (errors && typeof errors === "object") {
          const firstKey = Object.keys(errors)[0];
          const firstErr = Array.isArray(errors[firstKey])
            ? errors[firstKey][0]
            : errors[firstKey];
          msg = firstErr
            ? `Invalid data ,${firstErr}`
            : "Failed to update account.";
        }
      }
      setEditAdminError(msg || err?.message || "Failed to update account.");
    } finally {
      setEditAdminLoading(false);
    }
  };

  // Open Status Confirmation Modal
  const handleOpenStatusModal = (user) => {
    setSelectedAdminForStatus(user);
    setStatusError("");
  };

  // Confirm Toggle Admin User Status
  const handleConfirmStatusChange = async () => {
    if (!selectedAdminForStatus) return;

    try {
      setStatusActionLoading(true);
      setStatusError("");
      const updatedStatus = !selectedAdminForStatus.is_active;
      const res = await apiUpdateAdminUser(
        accessToken,
        selectedAdminForStatus.id,
        {
          is_active: updatedStatus,
        },
      );

      toast.push(
        <Notification title="Status Updated" type="success">
          {selectedAdminForStatus.name || selectedAdminForStatus.email} is now{" "}
          {updatedStatus ? "Active" : "Inactive"}.
        </Notification>,
      );
      setSelectedAdminForStatus(null);
      fetchAdminUsers();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update user status.";
      setStatusError(errMsg);
      toast.push(
        <Notification title="Error" type="danger">
          {errMsg}
        </Notification>,
      );
    } finally {
      setStatusActionLoading(false);
    }
  };

  // Helper for Role Badges
  const renderRoleBadge = (roleName) => {
    const r = (roleName || "user").toLowerCase();
    let badgeClass = "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]";

    if (r === "admin") {
      badgeClass = "bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]";
    } else if (r === "staff") {
      badgeClass = "bg-[#FDF4EB] text-[#A0522D] border-[#F3CDB6]";
    } else if (r === "sales_rep" || r.includes("sales")) {
      badgeClass = "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]";
    } else if (r === "logistics") {
      badgeClass = "bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]";
    } else if (r === "corporate" || r === "b2b") {
      badgeClass = "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]";
    }

    return (
      <span
        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider border ${badgeClass}`}
      >
        {roleName || "USER"}
      </span>
    );
  };

  return (
    <>
      {/* Controls bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-5">
        <div className="relative w-full lg:max-w-md xl:max-w-lg">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A85A32B2]"
            size={16}
          />
          <input
            type="text"
            placeholder={t("adminUserSearchPlaceHolder")}
            value={adminSearchQuery}
            onChange={(e) => setAdminSearchQuery(e.target.value)}
            className="w-full h-10 border border-[#D1D5DB] text-sm text-[#2A211D] rounded-lg pl-10 pr-10 outline-none focus:border-[#A0522D]"
          />
          {adminSearchQuery && (
            <button
              type="button"
              onClick={() => setAdminSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <FiX className="text-gray-500 hover:text-gray-700" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Role filter */}
          <div className="w-full sm:w-44 flex-1 sm:flex-initial min-w-[130px]">
            <Select
              value={
                adminRoleOptions.find(
                  (option) => option.value === adminRoleFilter.value,
                ) || adminRoleOptions[0]
              }
              onChange={setAdminRoleFilter}
              options={adminRoleOptions}
              styles={selectStyles}
              isSearchable={false}
            />
          </div>

          {/* Status filter */}
          <div className="w-full sm:w-40 flex-1 sm:flex-initial min-w-[130px]">
            <Select
              value={
                statusOptions.find(
                  (option) => option.value === adminStatusFilter.value,
                ) || statusOptions[0]
              }
              onChange={setAdminStatusFilter}
              options={statusOptions}
              styles={selectStyles}
              isSearchable={false}
            />
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleAdminReset}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#EFE5DD] bg-white px-4 text-sm font-medium text-[#C08457] transition hover:bg-[#FCF7F3] shrink-0"
          >
            <FiRotateCcw size={14} />
            <span>{t("reset")}</span>
          </button>

          {/* Add Admin User button */}
          <button
            type="button"
            onClick={() => {
              setIsAddAdminModalOpen(true);
              setCreateAdminError("");
              setAdminFormErrors({});
            }}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#A0522D] hover:bg-[#854122] px-4 text-sm font-medium text-white transition shadow-sm whitespace-nowrap shrink-0 w-full sm:w-auto"
          >
            <FiPlus size={16} />
            <span>{t("addAdminStaff")}</span>
          </button>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F1F5F9] text-[#486284]">
            <tr className="bg-[#F7F2EE] text-[#6B7280] text-sm">
              <th className="text-left px-4 py-3 font-medium">
                {t("fullNameColumn")}
              </th>
              <th className="text-left px-4 py-3 font-medium">
                {t("role")}
              </th>
              <th className="text-left px-4 py-3 font-medium">
                {t("email")}
              </th>
              <th className="text-left px-4 py-3 font-medium">
                {t("phonenumber")}
              </th>
              <th className="text-left px-4 py-3 font-medium">
                {t("registrationdate")}
              </th>
              <th className="text-left px-4 py-3 font-medium">
                {t("statusColumn")}
              </th>
              <th className="text-left px-4 py-3 font-medium">
                {t("actionsColumn")}
              </th>
            </tr>
          </thead>
          <tbody>
            {adminLoading ? (
              <tr>
                <td colSpan={7} className="py-20 text-center">
                  <div className="flex justify-center items-center">
                    <Spinner size={36} customColorClass="text-[#A0522D]" />
                  </div>
                </td>
              </tr>
            ) : adminUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-500">
                  {t("noAdminStaff")}
                </td>
              </tr>
            ) : (
              adminUsers.map((user) => {
                const isSelf = user.email === currentAdminEmail;
                const initials = (user.name || user.email || "A")
                  .charAt(0)
                  .toUpperCase();
                const roleLabel =
                  user.role?.name || user.role_name || "Admin";

                return (
                  <tr
                    key={user.id}
                    className="odd:bg-white even:bg-[#FBF8F6]"
                  >
                    <td className="px-5 py-3.5 font-medium text-[#2A211D]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EFE5DD] text-[#A0522D] flex items-center justify-center font-bold text-xs shadow-xs">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {user.name || "Administrator"}
                          </div>
                          {isSelf && (
                            <span className="text-[11px] font-medium text-[#A0522D]">
                              {t("you") || "(You)"}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#2A211D]">
                      {renderRoleBadge(roleLabel)}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#2A211D]">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#2A211D]">
                      {user.mobile || "-"}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#2A211D]">
                      {formatDate(user.created_at, locale)}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#2A211D]">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${user.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                          }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-red-500"
                            }`}
                        />
                        {user.is_active ? t("active") : t("inactive")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#2A211D]">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditAdminModal(user)}
                          title={t("editUserDetails")}
                          className="p-1.5 text-gray-500 hover:text-[#A0522D] hover:bg-[#F8F2ED] rounded-lg transition"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => handleOpenStatusModal(user)}
                          title={
                            isSelf
                              ? t("cannotDeactivateSelf")
                              : user.is_active
                                ? t("deactivateAccount")
                                : t("activateAccount")
                          }
                          className={`p-1.5 rounded-lg transition ${isSelf
                            ? "text-gray-300 cursor-not-allowed"
                            : user.is_active
                              ? "text-gray-500 hover:text-red-600 hover:bg-red-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                        >
                          {user.is_active ? (
                            <FiSlash size={16} />
                          ) : (
                            <FiCheckCircle size={16} />
                          )}
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

      {/* Pagination */}
      <div className="flex justify-end mt-4">
        <Pagination
          currentPage={adminCurrentPage}
          pageSize={itemsPerPage}
          total={adminPagination.total_items}
          onChange={(page) => setAdminCurrentPage(page)}
        />
      </div>

      {/* MODAL: Add New Admin / Staff Account */}
      <Dialog
        isOpen={isAddAdminModalOpen}
        closable={false}
        onClose={() => {
          if (!createAdminLoading) {
            setIsAddAdminModalOpen(false);
            setCreateAdminError("");
          }
        }}
        onRequestClose={() => {
          if (!createAdminLoading) {
            setIsAddAdminModalOpen(false);
            setCreateAdminError("");
          }
        }}
        className="w-full max-w-lg mx-auto"
      >
        <div className="flex flex-col p-3">
          <div className="border-b pb-3 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-[#2A211D] flex items-center gap-2">
              <FiShield className="text-[#A0522D]" />
              {t("addAdminAccountTitle")}
            </h3>
            <button
              type="button"
              disabled={createAdminLoading}
              onClick={() => {
                setIsAddAdminModalOpen(false);
                setCreateAdminError("");
                setAdminFormErrors({});
              }}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
            >
              <FiX size={20} />
            </button>
          </div>

          {createAdminError && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md">
              {createAdminError}
            </div>
          )}

          <form onSubmit={handleCreateAdminUser} noValidate className="py-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                {t("fullNameLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newAdminForm.name}
                onChange={(e) => {
                  setNewAdminForm({ ...newAdminForm, name: e.target.value });
                  if (adminFormErrors.name) {
                    setAdminFormErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
                placeholder={t("fullNamePlaceholder")}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${adminFormErrors.name
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#D1D5DB] focus:border-[#A0522D]"
                  }`}
              />
              {adminFormErrors.name && (
                <p className="text-red-500 text-xs mt-1">{adminFormErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                {t("emailAddressLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={newAdminForm.email}
                onChange={(e) => {
                  setNewAdminForm({ ...newAdminForm, email: e.target.value });
                  if (adminFormErrors.email) {
                    setAdminFormErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                placeholder={t("emailPlaceholder")}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${adminFormErrors.email
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#D1D5DB] focus:border-[#A0522D]"
                  }`}
              />
              {adminFormErrors.email && (
                <p className="text-red-500 text-xs mt-1">{adminFormErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                {t("passwordLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={newAdminForm.password}
                onChange={(e) => {
                  setNewAdminForm({ ...newAdminForm, password: e.target.value });
                  if (adminFormErrors.password) {
                    setAdminFormErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
                placeholder={t("passwordPlaceholder")}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${adminFormErrors.password
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#D1D5DB] focus:border-[#A0522D]"
                  }`}
              />
              {adminFormErrors.password ? (
                <p className="text-red-500 text-xs mt-1">{adminFormErrors.password}</p>
              ) : (
                <p className="text-[11px] text-gray-500 mt-1">
                  {t("passwordHint")}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                  {t("phoneNumberLabel")}
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={newAdminForm.mobile}
                  onChange={(e) => {
                    setNewAdminForm({
                      ...newAdminForm,
                      mobile: e.target.value.slice(0, 15),
                    });
                    if (adminFormErrors.mobile) {
                      setAdminFormErrors((prev) => ({ ...prev, mobile: "" }));
                    }
                  }}
                  placeholder="+81..."
                  className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${adminFormErrors.mobile
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#D1D5DB] focus:border-[#A0522D]"
                    }`}
                />
                {adminFormErrors.mobile ? (
                  <p className="text-red-500 text-xs mt-1">{adminFormErrors.mobile}</p>
                ) : (
                  <p className="text-[11px] text-gray-400 mt-1">
                    {t("maxCharacters")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                  {t("assignedRoleLabel")} <span className="text-red-500">*</span>
                </label>
                <select
                  value={newAdminForm.role}
                  onChange={(e) => {
                    setNewAdminForm({ ...newAdminForm, role: e.target.value });
                    if (adminFormErrors.role) {
                      setAdminFormErrors((prev) => ({ ...prev, role: "" }));
                    }
                  }}
                  className={`w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white font-medium ${adminFormErrors.role
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#D1D5DB] focus:border-[#A0522D]"
                    }`}
                >
                  <option value="staff">{t("roleStaffOperational")}</option>
                  <option value="admin">{t("roleAdminFullAccess")}</option>
                  <option value="logistics">{t("roleLogistics")}</option>
                  <option value="corporate">{t("roleCorporate")}</option>
                </select>
                {adminFormErrors.role && (
                  <p className="text-red-500 text-xs mt-1">{adminFormErrors.role}</p>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              💡 <strong>{t("roleNoticeTitle")}</strong> {t("roleNoticeBody")}
            </div>

            <div className="border-t pt-4 flex justify-end gap-3">
              <Button
                variant="plain"
                size="sm"
                disabled={createAdminLoading}
                onClick={() => {
                  setIsAddAdminModalOpen(false);
                  setCreateAdminError("");
                  setAdminFormErrors({});
                }}
                className="bg-blue-100 rounded-lg"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                variant="solid"
                size="sm"
                loading={createAdminLoading}
                className="px-5 text-white bg-[#A0522D] hover:bg-[#854122] rounded-md"
              >
                {createAdminLoading ? t("creatingAccount") : t("createAccount")}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* MODAL: Edit Admin / Staff Account */}
      <Dialog
        isOpen={isEditAdminModalOpen}
        closable={false}
        onClose={() => {
          if (!editAdminLoading) {
            setIsEditAdminModalOpen(false);
            setEditAdminError("");
          }
        }}
        onRequestClose={() => {
          if (!editAdminLoading) {
            setIsEditAdminModalOpen(false);
            setEditAdminError("");
          }
        }}
        className="w-full max-w-lg mx-auto"
      >
        <div className="flex flex-col p-3">
          <div className="border-b pb-3 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-[#2A211D] flex items-center gap-2">
              <FiEdit2 className="text-[#A0522D]" />
              {t("editAdminAccountTitle")}
            </h3>
            <button
              type="button"
              disabled={editAdminLoading}
              onClick={() => {
                setIsEditAdminModalOpen(false);
                setEditAdminError("");
              }}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
            >
              <FiX size={20} />
            </button>
          </div>

          {editAdminError && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md">
              {editAdminError}
            </div>
          )}

          <form onSubmit={handleSaveEditAdminUser} className="py-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                {t("fullNameLabel")}
              </label>
              <input
                type="text"
                value={editAdminForm.name}
                onChange={(e) =>
                  setEditAdminForm({ ...editAdminForm, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-sm outline-none focus:border-[#A0522D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                {t("emailAddressLabel")}
              </label>
              <input
                type="email"
                value={editAdminForm.email}
                onChange={(e) =>
                  setEditAdminForm({ ...editAdminForm, email: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-sm outline-none focus:border-[#A0522D]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                  {t("phoneNumberLabel")}
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={editAdminForm.mobile}
                  onChange={(e) =>
                    setEditAdminForm({
                      ...editAdminForm,
                      mobile: e.target.value.slice(0, 15),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-sm outline-none focus:border-[#A0522D]"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  {t("maxCharacters")}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                  {t("role")}
                </label>
                <select
                  value={editAdminForm.role}
                  onChange={(e) =>
                    setEditAdminForm({ ...editAdminForm, role: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-sm outline-none focus:border-[#A0522D] bg-white font-medium"
                >
                  <option value="staff">{t("staff")}</option>
                  <option value="admin">{t("admin")}</option>
                  <option value="logistics">{t("logistics")}</option>
                  <option value="corporate">{t("corporate")}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                {t("resetPasswordLeaveBlank")}
              </label>
              <input
                type="password"
                value={editAdminForm.password}
                onChange={(e) =>
                  setEditAdminForm({
                    ...editAdminForm,
                    password: e.target.value,
                  })
                }
                placeholder={t("enterNewPasswordIfChanging")}
                className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-sm outline-none focus:border-[#A0522D]"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                {t("passwordChangeHint")}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                {t("accountStatus")}
              </label>
              <div className="flex items-center gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="editStatus"
                    checked={editAdminForm.is_active === true}
                    onChange={() =>
                      setEditAdminForm({ ...editAdminForm, is_active: true })
                    }
                  />
                  <span className="text-emerald-700 font-medium">{t("active")}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="editStatus"
                    checked={editAdminForm.is_active === false}
                    onChange={() =>
                      setEditAdminForm({ ...editAdminForm, is_active: false })
                    }
                  />
                  <span className="text-red-600 font-medium">{t("inactive")}</span>
                </label>
              </div>
            </div>

            <div className="border-t pt-4 flex justify-end gap-3">
              <Button
                variant="plain"
                size="sm"
                disabled={editAdminLoading}
                onClick={() => {
                  setIsEditAdminModalOpen(false);
                  setEditAdminError("");
                }}
                className="bg-blue-100 rounded-lg"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                variant="solid"
                size="sm"
                loading={editAdminLoading}
                className="px-5 text-white bg-[#A0522D] hover:bg-[#854122] rounded-md"
              >
                {editAdminLoading ? t("saving") : t("saveChanges")}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* MODAL: Admin User Deactivate / Activate Dialog */}
      <Dialog
        isOpen={Boolean(selectedAdminForStatus)}
        closable={false}
        onClose={() => {
          if (!statusActionLoading) {
            setSelectedAdminForStatus(null);
            setStatusError("");
          }
        }}
        onRequestClose={() => {
          if (!statusActionLoading) {
            setSelectedAdminForStatus(null);
            setStatusError("");
          }
        }}
        className="w-full max-w-lg mx-auto"
      >
        <div className="flex flex-col p-2">
          <div className="border-b pb-3 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-[#2A211D] flex items-center gap-2">
              {selectedAdminForStatus?.is_active ? (
                <>
                  <FiAlertTriangle className="text-amber-600" />
                  <span>{t("deactivateAccount")}</span>
                </>
              ) : (
                <>
                  <FiCheckCircle className="text-emerald-600" />
                  <span>{t("activateAccount")}</span>
                </>
              )}
            </h3>
            <button
              type="button"
              disabled={statusActionLoading}
              onClick={() => {
                setSelectedAdminForStatus(null);
                setStatusError("");
              }}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
            >
              <FiX size={20} />
            </button>
          </div>

          {statusError && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md">
              {statusError}
            </div>
          )}

          <div className="py-4">
            {selectedAdminForStatus?.is_active ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-3">
                {/* <FiAlertTriangle className="text-amber-600 mt-0.5 shrink-0" size={18} /> */}
                <div className="text-sm text-amber-900">
                  <p className="font-semibold mb-1">
                    {t("warning")}
                  </p>
                  <p>
                    {t("deactivateConfirmation") || "Are you sure you want to deactivate the account for"}{" "}
                    <span className="font-semibold text-gray-900">
                      "{selectedAdminForStatus?.name || selectedAdminForStatus?.email}"
                    </span>
                    {t("deactivateConfirmationSuffix")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-start gap-3">
                <FiCheckCircle className="text-emerald-600 mt-0.5 shrink-0" size={18} />
                <div className="text-sm text-emerald-900">
                  <p>
                    {t("reactivateConfirmation")}{" "}
                    <span className="font-semibold text-gray-900">
                      "{selectedAdminForStatus?.name || selectedAdminForStatus?.email}"
                    </span>
                    {t("reactivateConfirmationSuffix")}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4 flex justify-end gap-3">
            <button
              type="button"
              size="sm"
              disabled={statusActionLoading}
              onClick={() => {
                setSelectedAdminForStatus(null);
                setStatusError("");
              }}
              className="h-10 px-5 rounded-md border border-[#E9DDD3] bg-white text-[#6E6258] font-medium hover:bg-[#F8F3EF] transition"
            >
              {t("cancel")}
            </button>
            <Button
              type="button"
              variant="solid"
              size="sm"
              loading={statusActionLoading}
              onClick={handleConfirmStatusChange}
              className={`px-5 text-white rounded-md ${selectedAdminForStatus?.is_active
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
                }`}
            >
              {selectedAdminForStatus?.is_active
                ? t("deactivateAccount")
                : t("activateAccount")}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default AdminUsers;

