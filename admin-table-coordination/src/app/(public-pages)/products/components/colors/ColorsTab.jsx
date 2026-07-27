"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiPlus,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetColorsList, apiDeleteColor } from "@/services/ColorsService";
import AddEditColorModal from "./AddEditColorModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

const ColorsTab = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedColor, setSelectedColor] = useState(null);

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [colorToDelete, setColorToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total_pages: 1,
    total_items: 0,
  });

  /* ---------- FETCH COLORS ---------- */
  const fetchColors = useCallback(
    async (page = 1) => {
      if (!accessToken) return;

      try {
        setLoading(true);
        const response = await apiGetColorsList(accessToken, page);

        if (response?.status && response?.data) {
          setColors(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (error) {
        console.error("Failed to fetch colors:", error);
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    fetchColors(currentPage);
  }, [fetchColors, currentPage]);

  /* ---------- DELETE ---------- */
  const handleDeleteConfirm = async () => {
    if (!colorToDelete || !accessToken) return;

    try {
      setDeleteLoading(true);
      const response = await apiDeleteColor(accessToken, colorToDelete.id);

      toast.push(
        <Notification title="Success" type="success">
          {response.message}
        </Notification>,
      );
      setDeleteDialogOpen(false);
      setColorToDelete(null);
      fetchColors(currentPage);
    } catch (error) {
      console.error("Failed to delete color:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ---------- MODAL HANDLERS ---------- */
  const handleAddColor = () => {
    setModalMode("add");
    setSelectedColor(null);
    setIsModalOpen(true);
  };

  const handleEditColor = (color) => {
    setModalMode("edit");
    setSelectedColor(color);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedColor(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    fetchColors(currentPage);
  };

  /* ---------- HELPERS ---------- */
  const hexToRgb = (hex) => {
    if (!hex) return "";
    const cleanHex = hex.replace("#", "");
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
  };

  /* ---------- FILTERING ---------- */
  const filteredColors = colors.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.colorName?.toLowerCase().includes(q) ||
      c.colorCode?.toLowerCase().includes(q)
    );
  });

  /* ---------- PAGINATION ---------- */
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.total_pages) {
      setCurrentPage(page);
    }
  };

  /* ---------- SKELETON ---------- */
  const CardSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="border border-[#1C2C5633] rounded-xl overflow-hidden animate-pulse"
        >
          <div className="h-52 bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="flex gap-2 mt-3">
              <div className="h-5 bg-gray-100 rounded-full w-16" />
              <div className="h-5 bg-gray-100 rounded-full w-16" />
            </div>
            <div className="flex gap-2 mt-3">
              <div className="h-7 bg-gray-200 rounded flex-1" />
              <div className="h-7 bg-gray-100 rounded flex-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="bg-[#FFFDFC] border border-[#E8DDD4] rounded-xl shadow md:p-6 p-3">
        <div className="flex justify-between items-start flex-wrap gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              Color Palette
            </h2>
            <p className="text-sm text-[#486284]">
              {pagination.total_items} colors available
            </p>
          </div>

          <button
            onClick={handleAddColor}
            className="bg-[#A0522D] text-white px-4 py-2 font-semibold rounded-md text-sm flex items-center gap-2"
          >
            <FiPlus size={14} />
            Add Color
          </button>
        </div>

        <div className="relative w-full md:w-72 mb-6">
          <FiSearch
            className="absolute left-3 top-2.5 text-[#64748B]"
            size={16}
          />
          <input
            type="text"
            placeholder="Search Colors..."
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

        {loading ? (
          <CardSkeleton />
        ) : filteredColors.length === 0 ? (
          <div className="text-center py-16 text-[#94A3B8]">
            No colors found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredColors.map((color) => (
              <div
                key={color.id}
                className="border border-[#1C2C5633] rounded-xl overflow-hidden bg-white hover:shadow-md transition"
              >
                <div
                  className="h-52"
                  style={{ backgroundColor: color.colorCode || "#ccc" }}
                />

                <div className="p-4">
                  <h3 className="text-sm font-semibold text-[#1C2C56]">
                    {color.colorName}
                  </h3>

                  <p className="text-xs text-[#486284] mt-1">
                    {color.colorCode} &nbsp; {hexToRgb(color.colorCode)}
                  </p>

                  {/* Compatible Fabrics from API */}
                  {color.compatibleFabric &&
                    color.compatibleFabric.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-[#486284] mb-1">
                          Compatible Fabrics:
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {color.compatibleFabric.map((fabric, index) => (
                            <span
                              key={index}
                              className="text-xs px-3 py-1 rounded-full bg-[#EEF2FF] text-[#1C2C56]"
                            >
                              {fabric}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEditColor(color)}
                      className="flex-1 bg-[#1C4FA8] text-white text-xs py-1.5 rounded-md"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setColorToDelete(color);
                        setDeleteDialogOpen(true);
                      }}
                      className="flex-1 border border-red-200 text-red-500 text-xs py-1.5 rounded-md flex items-center justify-center gap-1 hover:bg-red-50 transition-colors"
                    >
                      {/* <FiTrash2 size={12} /> */}
                      Delete
                    </button>
                    <button
                      // onClick={() => handleEditColor(color)}
                      className="flex-1 border border-gray-300 text-[#91A1B6] text-xs py-1.5 rounded-md"
                    >
                      Duplicate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between mt-6 px-2">
            <p className="text-sm text-[#64748B]">
              Page {pagination.page} of {pagination.total_pages} (
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
      </div>

      {/* Modals */}
      <AddEditColorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        initialData={selectedColor}
        onSaveSuccess={handleSaveSuccess}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setColorToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Color"
        message="Are you sure you want to delete this color? This action cannot be undone."
        itemName={colorToDelete?.colorName}
        loading={deleteLoading}
      />
    </>
  );
};

export default ColorsTab;
