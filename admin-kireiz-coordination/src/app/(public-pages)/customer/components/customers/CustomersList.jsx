"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  FiSearch,
  FiPlus,
  FiMail,
  FiPhone,
  FiEdit2,
  FiTrash2,
  FiX,
  FiEye,
} from "react-icons/fi";
import Select from "react-select";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { useRouter } from "next/navigation";
import Pagination from "@/components/ui/Pagination";
import {
  apiGetCustomersList,
  apiDeleteB2BAccount,
} from "@/services/B2BAccountService";
// import AddEditB2BAccountModal from "./AddEditB2BAccountModal";
// import ViewB2BModal from "./ViewB2BModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

const tierColors = {
  gold: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  silver: "bg-slate-50 text-slate-700 border border-slate-200",
  bronze: "bg-orange-50 text-orange-700 border border-orange-200",
};
const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "40px",
    borderRadius: "6px",
    borderColor: "#E2E8F0",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#1C2C56",
    },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#1C4FA8"
      : state.isFocused
        ? "#EEF2FF"
        : "white",
    color: state.isSelected ? "white" : "#1E293B",
    fontSize: "14px",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
};

const B2BAccounts = () => {
  const t = useTranslations("customerSalesRep.customers");
  const tStatus = useTranslations("customerSalesRep.statusFilter");
  const router = useRouter();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [userType] = useState("uniform");
  const [isVerify] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const statusOptions = [
    { value: "", label: tStatus("allStatus") },
    { value: "true", label: tStatus("active") },
    { value: "false", label: tStatus("inactive") },
  ];

  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0]);

  /* ---------- FETCH ---------- */
  const fetchAccounts = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const response = await apiGetCustomersList(
        accessToken,
        currentPage,
        pageSize,
        debouncedSearch,
        userType,
        selectedStatus.value,
      );

      if (response?.results) {
        setAccounts(response.results);
        setTotalItems(response.count || 0);
      } else if (response?.status && response?.data) {
        setAccounts(response.data);
        setTotalItems(response.count || response.pagination?.total_items || 0);
      }
    } catch (error) {
      console.error("Failed to fetch B2B accounts:", error);
    } finally {
      setLoading(false);
    }
  }, [
    accessToken,
    currentPage,
    pageSize,
    debouncedSearch,
    selectedStatus,
    userType,
  ]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  /* ---------- DELETE ---------- */
  const handleDeleteConfirm = async () => {
    if (!accountToDelete || !accessToken) return;

    try {
      setDeleteLoading(true);
      const response = await apiDeleteB2BAccount(
        accessToken,
        accountToDelete.id,
      );

      toast.push(
        <Notification title="Success" type="success">
          {response?.message || "User Deleted successfully"}
        </Notification>,
      );

      setDeleteDialogOpen(false);
      setAccountToDelete(null);
      fetchAccounts();
    } catch (error) {
      console.error("Failed to delete account:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ---------- HANDLERS ---------- */
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditData(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    fetchAccounts();
  };

  /* ---------- SKELETON ---------- */
  const TableSkeleton = () => (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
      <table className="min-w-[800px] w-full text-sm text-left">
        <thead className="bg-[#F8FAFC] text-[#486284] border-b border-[#E2E8F0]">
          <tr>
            <th className="px-5 py-3 font-medium">{t("tableHeaders.userName")}</th>
            <th className="px-5 py-3 font-medium">{t("tableHeaders.userType")}</th>
            <th className="px-5 py-3 font-medium">{t("tableHeaders.contactInfo")}</th>
            <th className="px-5 py-3 font-medium">{t("tableHeaders.status")}</th>
            <th className="px-5 py-3 font-medium text-right">{t("tableHeaders.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }).map((_, i) => (
            <tr key={i} className="border-b border-[#E2E8F0]">
              <td className="px-5 py-4">
                <div className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
              </td>
              <td className="px-5 py-4">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              </td>
              <td className="px-5 py-4">
                <div className="h-4 bg-gray-200 rounded w-36 animate-pulse" />
              </td>
              <td className="px-5 py-4">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              </td>
              <td className="px-5 py-4">
                <div className="h-4 bg-gray-200 rounded w-12 ml-auto animate-pulse" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-xl shadow md:p-6 p-3">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              {t("title")}
            </h2>
            <p className="text-[#486284] text-sm">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative w-80">
            <FiSearch className="absolute left-3 top-2.5 text-[#64748B]" />

            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[#00345F] rounded-md pl-9 pr-3 py-2"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1C2C56]"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          <Select
            options={statusOptions}
            value={selectedStatus}
            onChange={(option) => {
              setSelectedStatus(option);
              setCurrentPage(1);
            }}
            styles={selectStyles}
            menuPortalTarget={
              typeof document !== "undefined" ? document.body : null
            }
            menuPosition="fixed"
            className="w-60 text-sm"
          />

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setDebouncedSearch("");
              setSelectedStatus(statusOptions[0]);
              setCurrentPage(1);
            }}
            className="border border-[#CBD5E1] px-4 py-2 rounded-md text-white bg-[#1C4FA8] hover:bg-[#1C4FA8] transition-colors"
          >
            {t("reset")}
          </button>
        </div>
        {/* Table */}
        {loading ? (
          <TableSkeleton />
        ) : accounts.length === 0 ? (
          <div className="text-center py-16 text-[#94A3B8]">
            {t("noData")}
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
            <table className="min-w-[800px] w-full text-sm text-left">
              <thead className="bg-[#F8FAFC] text-[#486284] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-5 py-3 font-medium">{t("tableHeaders.userName")}</th>
                  <th className="px-5 py-3 font-medium">{t("tableHeaders.userType")}</th>
                  <th className="px-5 py-3 font-medium">{t("tableHeaders.contactInfo")}</th>
                  <th className="px-5 py-3 font-medium">{t("tableHeaders.status")}</th>
                  <th className="px-5 py-3 font-medium text-right">{t("tableHeaders.actions")}</th>
                </tr>
              </thead>

              <tbody>
                {accounts.map((acc) => {
                  const tierKey = acc.tier?.toLowerCase();

                  const tierStyle =
                    tierColors[tierKey] ||
                    "bg-gray-50 text-gray-600 border border-gray-200";

                  return (
                    <tr
                      key={acc.id}
                      className="border-b last:border-none border-[#E2E8F0] hover:bg-gray-50 transition"
                    >
                      <td className="px-5 py-4 font-medium text-[#1C2C56]">
                        {acc.firstName} {acc.lastName}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {acc.userType}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-2">
                            <FiMail className="text-[#1C2C56]" size={14} />
                            <span>{acc.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiPhone className="text-[#1C2C56]" size={14} />
                            <span>{acc.phone}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            acc.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {acc.isActive ? tStatus("active") : tStatus("inactive")}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="text-[#1C4FA8] hover:bg-[#EEF4FF] p-1.5 rounded"
                            onClick={() =>
                              router.push(
                                `/customer/customer-details/${acc.id}`,
                              )
                            }
                          >
                            <FiEye size={17} />
                          </button>
                          <button
                            className="text-[#1C2C56] hover:text-[#0F172A] p-1.5 rounded hover:bg-[#EEF2FF]"
                            onClick={() =>
                              router.push(`/customer/customer-edit/${acc.id}`)
                            }
                          >
                            <FiEdit2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-5">
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          total={totalItems}
          onChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setAccountToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Account"
        message="Are you sure you want to delete this account? This action cannot be undone."
        itemName={accountToDelete?.full_name}
        loading={deleteLoading}
      />
    </>
  );
};

export default B2BAccounts;
