"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetFabricList, apiDeleteFabric } from "@/services/FabricService";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import AddEditFabricModal from "./AddEditFabricModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

const FabricsTab = () => {
  const { session } = useCurrentSession();
  console.log(session);
  const accessToken = session?.user?.accessToken;
  console.log(session?.user?.accessToken);

  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total_pages: 1,
    total_items: 0,
  });

  // Modal states
  const [openAdd, setOpenAdd] = useState(false);
  const [editFabric, setEditFabric] = useState(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fabricToDelete, setFabricToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch fabrics
  const fetchFabrics = useCallback(
    async (page = 1) => {
      if (!accessToken) return;

      try {
        setLoading(true);
        const response = await apiGetFabricList(accessToken, page);

        if (response?.status && response?.data) {
          setFabrics(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (error) {
        console.error("Failed to fetch fabrics:", error);
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    fetchFabrics(currentPage);
  }, [fetchFabrics, currentPage]);

  // Delete fabric
  const handleDeleteConfirm = async () => {
    if (!fabricToDelete || !accessToken) return;

    try {
      setDeleteLoading(true);
      const response = await apiDeleteFabric(accessToken, fabricToDelete.id);

      toast.push(
        <Notification title="Success" type="success">
          {response.message}
        </Notification>,
      );
      setDeleteDialogOpen(false);
      setFabricToDelete(null);
      fetchFabrics(currentPage); // refresh
    } catch (error) {
      console.error("Failed to delete fabric:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // After save/update, refresh
  const handleSaveSuccess = () => {
    setOpenAdd(false);
    setEditFabric(null);
    fetchFabrics(currentPage);
  };

  // Filter by search
  const filteredFabrics = fabrics.filter(
    (f) =>
      f.fabricName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.color?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.materialType?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Page navigation
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.total_pages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const total = pagination.total_pages;

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", total);
      } else if (currentPage >= total - 2) {
        pages.push(1, "...", total - 3, total - 2, total - 1, total);
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          total,
        );
      }
    }
    return pages;
  };

  return (
    <div className="bg-[#FFFDFC] border border-[#E8DDD4] rounded-xl shadow md:p-6 p-3">
      <div className="flex justify-between sm:flex-row flex-col items-start mb-4 gap-2">
        <div>
          <h2 className="text-2xl font-semibold text-[#1C2C56]">
            Fabric Library
          </h2>
          <p className="text-base text-[#486284]">
            {pagination.total_items} fabrics total
          </p>
        </div>

        <button
          onClick={() => {
            setEditFabric(null);
            setOpenAdd(true);
          }}
          className="bg-[#A0522D] text-white px-4 py-2 font-semibold rounded-md text-sm"
        >
          + Add New Fabric
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-72 mb-4">
        <FiSearch
          className="absolute left-3 top-2.5 text-[#64748B]"
          size={16}
        />
        <input
          type="text"
          placeholder="Search Fabrics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-[#00345F] rounded-md pl-9 pr-3 py-2 text-sm"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1C2C56]"
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F1F5F9] text-[#486284]">
            <tr className="bg-[#F7F2EE] text-[#6B7280] text-sm">
              <th className="text-left px-5 py-4 font-medium">Fabric Name</th>
              <th className="text-left px-5 py-4 font-medium">Color</th>
              <th className="text-left px-5 py-4 font-medium">Material</th>
              <th className="text-left px-5 py-4 font-medium">
                Price per Unit
              </th>
              <th className="text-left px-5 py-4 font-medium">Status</th>
              <th className="text-left px-5 py-4 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-white" : "bg-[#1C4FA80F]"}
                >
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredFabrics.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-[#64748B]">
                  No fabrics found
                </td>
              </tr>
            ) : (
              filteredFabrics.map((fabric, index) => (
                <tr
                  key={fabric.id}
                  className={`text-base ${index % 2 === 0 ? "bg-white" : "bg-[#1C4FA80F]"}`}
                >
                  <td className="px-5 py-4 text-[#1C2C56] font-medium">
                    {fabric.fabricName}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: fabric.color || "#ccc" }}
                      />
                      <span className="text-[#486284]">{fabric.color}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-[#486284] capitalize">
                    {fabric.materialType}
                  </td>

                  <td className="px-5 py-4 text-[#1C2C56] font-medium">
                    ₹{Number(fabric.pricePerUnit).toLocaleString()}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        fabric.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {fabric.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-[#F1E8E2] transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"
                        onClick={() => {
                          setEditFabric(fabric);
                          setOpenAdd(true);
                        }}
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-[#F1E8E2] transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"
                        onClick={() => {
                          setFabricToDelete(fabric);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <p className="text-sm text-[#64748B]">
            Showing page {pagination.page} of {pagination.total_pages} (
            {pagination.total_items} items)
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-[#E2E8F0] disabled:opacity-30 hover:bg-[#F1F5F9] transition-colors"
            >
              <FiChevronLeft size={16} />
            </button>

            {getPageNumbers().map((page, idx) => (
              <button
                key={idx}
                onClick={() => typeof page === "number" && goToPage(page)}
                disabled={page === "..."}
                className={`w-9 h-9 rounded-md text-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-[#1C2C56] text-white"
                    : page === "..."
                      ? "cursor-default text-[#64748B]"
                      : "border border-[#E2E8F0] text-[#1E293B] hover:bg-[#F1F5F9]"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === pagination.total_pages}
              className="p-2 rounded-md border border-[#E2E8F0] disabled:opacity-30 hover:bg-[#F1F5F9] transition-colors"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddEditFabricModal
        isOpen={openAdd}
        onClose={() => {
          setOpenAdd(false);
          setEditFabric(null);
        }}
        mode={editFabric ? "edit" : "add"}
        initialData={editFabric}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setFabricToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Fabric"
        message="Are you sure you want to delete this fabric? This action cannot be undone."
        itemName={fabricToDelete?.fabricName}
        loading={deleteLoading}
      />
    </div>
  );
};

export default FabricsTab;
