"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
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

const B2BAccounts = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  /* ---------- FETCH ---------- */
  const fetchAccounts = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const response = await apiGetCustomersList(accessToken);

      if (response?.results) {
        setAccounts(response.results);
      } else if (response?.status && response?.data) {
        setAccounts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch B2B accounts:", error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

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

  /* ---------- FILTER ---------- */
  const filteredAccounts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return accounts;
    return accounts.filter(
      (acc) =>
        acc.full_name?.toLowerCase().includes(term) ||
        acc.email?.toLowerCase().includes(term) ||
        acc.phone?.includes(term),
    );
  }, [accounts, search]);

  /* ---------- SKELETON ---------- */
  const TableSkeleton = () => (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
      <table className="min-w-[800px] w-full text-sm text-left">
        <thead className="bg-[#F8FAFC] text-[#486284] border-b border-[#E2E8F0]">
          <tr>
            <th className="px-5 py-3 font-medium">User Name</th>
            <th className="px-5 py-3 font-medium">User Type</th>
            <th className="px-5 py-3 font-medium">Contact Info</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
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
              Customers Lists
            </h2>
            <p className="text-[#486284] text-sm">
              Manage discount tiers and corporate rules
            </p>
          </div>

          <button
            className="bg-[#1C4FA8] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
            onClick={() => {
              setEditData(null);
              setOpenModal(true);
            }}
          >
            <FiPlus size={16} />
            Add Account
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80 mb-6">
          <FiSearch
            className="absolute left-3 top-2.5 text-[#64748B]"
            size={16}
          />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#00345F] rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none"
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

        {/* Table */}
        {loading ? (
          <TableSkeleton />
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-16 text-[#94A3B8]">
            No accounts found
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
            <table className="min-w-[800px] w-full text-sm text-left">
              <thead className="bg-[#F8FAFC] text-[#486284] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-5 py-3 font-medium">User Name</th>
                  <th className="px-5 py-3 font-medium">User Type</th>
                  <th className="px-5 py-3 font-medium">Contact Info</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAccounts.map((acc) => {
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
                          {acc.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="text-[#1C4FA8] hover:bg-[#EEF4FF] p-1.5 rounded"
                            onClick={() =>
                              router.push(`/customer/customer-details/${q.uuids}`)
                            }
                          >
                            <FiEye size={17} />
                          </button>
                          <button
                            className="text-[#1C2C56] hover:text-[#0F172A] p-1.5 rounded hover:bg-[#EEF2FF]"
                            onClick={() => {
                              setEditData(acc);
                              setOpenModal(true);
                            }}
                          >
                            <FiEdit2 size={16} />
                          </button>
                          {/* <button
                            className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50"
                            onClick={() => {
                              setAccountToDelete(acc);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <FiTrash2 size={16} />
                          </button> */}
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

      {/* Modals */}

      {/* <ViewB2BModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedAccount(null);
        }}
        account={selectedAccount}
      /> */}

      {/* <AddEditB2BAccountModal
        isOpen={openModal}
        onClose={handleCloseModal}
        mode={editData ? "edit" : "add"}
        initialData={editData}
        onSaveSuccess={handleSaveSuccess}
      /> */}

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setAccountToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Account"
        message="Are you sure you want to delete this B2B account? This action cannot be undone."
        itemName={accountToDelete?.full_name}
        loading={deleteLoading}
      />
    </>
  );
};

export default B2BAccounts;
