"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX, FiPlus
} from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { apiGetFabricList, apiDeleteFabric } from "@/services/FabricService";
import AddEditFabricModal from "./AddEditFabricModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import Pagination from "@/components/ui/Pagination";

const FabricsTab = () => {
  const t = useTranslations("productSpecification.fabrics");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [fabrics, setFabrics] = useState([]);
  // Display currency comes from System Settings via the API, so this page cannot
  // drift from Reports and Quotation History. It printed a hardcoded ₹ before.
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      try {
        setLoading(true);
        const response = await apiGetFabricList(
          page,
          pageSize,
          debouncedSearch,
        );

        if (response?.status && response?.data) {
          setFabrics(response.data);
          if (response.currency?.symbol) {
            setCurrencySymbol(response.currency.symbol);
          }
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
    [debouncedSearch, pageSize],
  );

  useEffect(() => {
    fetchFabrics(currentPage);
  }, [fetchFabrics, currentPage, pageSize]);

  // Delete fabric
  const handleDeleteConfirm = async () => {
    if (!fabricToDelete || !accessToken) return;

    try {
      setDeleteLoading(true);
      await apiDeleteFabric(accessToken, fabricToDelete.id);

      toast.push(
        <Notification title={t("successTitle")} type="success">
          Fabric deleted successfully.
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

  // Local filter fallback
  const filteredFabrics = useMemo(() => {
    if (!searchQuery) return fabrics;
    const query = searchQuery.toLowerCase();
    return fabrics.filter(
      (f) =>
        f.fabricName?.toLowerCase().includes(query) ||
        f.color?.toLowerCase().includes(query) ||
        f.materialType?.toLowerCase().includes(query),
    );
  }, [fabrics, searchQuery]);

  return (
    <div className="bg-[#F4F7FC] rounded-xl shadow md:p-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#1C2C56]">
            {t("title")}
          </h2>
          <p className="text-[#64748B] text-sm">
            {t("totalCount", { count: pagination.total_items || fabrics.length })}
          </p>
        </div>

        <button
          onClick={() => {
            setEditFabric(null);
            setOpenAdd(true);
          }}
          className="bg-[#1C4FA8] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-[#163F86] transition-colors"
        >
          <FiPlus size={14} />
          {t("addNew")}
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
          placeholder={t("searchPlaceholder")}
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
        <table className="w-full text-base">
          <thead className="bg-[#1C4FA80F] text-[#486284]">
            <tr>
              <th className="text-left px-5 py-4 font-medium">{t("tableHeaders.fabricName")}</th>
              <th className="text-left px-5 py-4 font-medium">{t("tableHeaders.color")}</th>
              <th className="text-left px-5 py-4 font-medium">{t("tableHeaders.material")}</th>
              <th className="text-left px-5 py-4 font-medium">
                {t("tableHeaders.pricePerUnit")}
              </th>
              <th className="text-left px-5 py-4 font-medium">{t("tableHeaders.status")}</th>
              <th className="text-right px-5 py-4 font-medium">{t("tableHeaders.actions")}</th>
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
                  {t("noData")}
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
                    {currencySymbol}
                    {Number(fabric.pricePerUnit).toLocaleString()}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${fabric.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                        }`}
                    >
                      {fabric.isActive ? t("addFabricModal.statusActive") : t("addFabricModal.statusInactive")}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-3">
                      <button
                        className="p-2 rounded-md bg-[#EEF2FF] text-[#1C2C56] hover:bg-[#E0E7FF] transition-colors"
                        onClick={() => {
                          setEditFabric(fabric);
                          setOpenAdd(true);
                        }}
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        className="p-2 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
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

      <div className="mt-5">
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          total={pagination.total_items}
          onChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

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
        title={t("deleteDialog.title")}
        message={t("deleteDialog.message")}
        itemName={fabricToDelete?.fabricName}
        loading={deleteLoading}
      />
    </div>
  );
};

export default FabricsTab;
