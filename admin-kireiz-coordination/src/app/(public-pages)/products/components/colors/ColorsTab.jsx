"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  FiSearch,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiGetColorsList,
  apiDeleteColor,
  apiCreateColor,
} from "@/services/ColorsService";
import AddEditColorModal from "./AddEditColorModal";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import Pagination from "@/components/ui/Pagination";

const INVISIBLE_DUPLICATE_CHAR = "\u200B";
const INVISIBLE_TEXT_REGEX = /[\u200B-\u200D\uFEFF]/g;

const ColorsTab = () => {
  const t = useTranslations("productSpecification.colors");
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
  const [pageSize, setPageSize] = useState(10);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total_pages: 1,
    total_items: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getVisibleColorName = (name) => {
    if (!name) return "";
    return name.replace(INVISIBLE_TEXT_REGEX, "").trim();
  };

  /* ---------- FETCH COLORS ---------- */
  const fetchColors = useCallback(
    async (page = 1) => {
      if (!accessToken) return;

      try {
        setLoading(true);
        const response = await apiGetColorsList(
          accessToken,
          page,
          pageSize,
          debouncedSearch,
        );

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
    [accessToken, pageSize, debouncedSearch]
  );

  useEffect(() => {
    fetchColors(currentPage);
  }, [fetchColors, currentPage]);

  /* ---------- DELETE ---------- */
  const handleDeleteConfirm = async () => {
    if (!colorToDelete || !accessToken) return;

    try {
      setDeleteLoading(true);
      await apiDeleteColor(accessToken, colorToDelete.id);

      toast.push(
        <Notification title={t("successTitle")} type="success">
          {t("deleteSuccess")}
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

  /* ---------- DUPLICATE COLOR ---------- */
  const handleDuplicateColor = async (color) => {
    if (!accessToken || duplicatingId || !color) return;

    try {
      setDuplicatingId(color.id);

      const cleanColorName = getVisibleColorName(color.colorName);
      const duplicatePayload = {
        colorName: `${cleanColorName}${INVISIBLE_DUPLICATE_CHAR}`,
        colorCode: color.colorCode,
        compatibleFabric: color.compatibleFabric || [],
      };

      const response = await apiCreateColor(accessToken, duplicatePayload);

      if (response?.status) {
        toast.push(
          <Notification title={t("successTitle")} type="success">
            {response.message || t("duplicateSuccess")}
          </Notification>,
        );
        fetchColors(currentPage);
      }
    } catch (error) {
      console.error("Failed to duplicate color:", error);
    } finally {
      setDuplicatingId(null);
    }
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
      <div className="bg-white rounded-xl shadow md:p-6 p-3">
        <div className="flex justify-between items-start flex-wrap gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              {t("title")}
            </h2>
            <p className="text-sm text-[#486284]">
              {t("totalCount", { count: pagination.total_items || colors.length })}
            </p>
          </div>

          <button
            onClick={handleAddColor}
            className="bg-[#1C4FA8] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-[#163F86] transition-colors"
          >
            <FiPlus size={14} />
            {t("addNew")}
          </button>
        </div>

        <div className="relative w-full md:w-72 mb-6">
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

        {loading ? (
          <CardSkeleton />
        ) : colors.length === 0 ? (
          <div className="text-center py-16 text-[#94A3B8]">
            {t("noData")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {colors.map((color) => (
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
                    {getVisibleColorName(color.colorName)}
                  </h3>

                  <p className="text-xs text-[#486284] mt-1">
                    {color.colorCode} &nbsp; {hexToRgb(color.colorCode)}
                  </p>

                  {color.compatibleFabric &&
                    color.compatibleFabric.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-[#486284] mb-1">
                          {t("compatibleFabrics")}:
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
                      {t("edit")}
                    </button>

                    <button
                      onClick={() => {
                        setColorToDelete(color);
                        setDeleteDialogOpen(true);
                      }}
                      className="flex-1 border border-red-200 text-red-500 text-xs py-1.5 rounded-md flex items-center justify-center gap-1 hover:bg-red-50 transition-colors"
                    >
                      {t("delete")}
                    </button>
                    <button
                      onClick={() => handleDuplicateColor(color)}
                      disabled={duplicatingId === color.id}
                      className="flex-1 border border-gray-300 text-[#91A1B6] text-xs py-1.5 rounded-md disabled:opacity-60"
                    >
                      {duplicatingId === color.id
                        ? t("duplicating")
                        : t("duplicate")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
      </div>

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
        title={t("deleteDialog.title")}
        message={t("deleteDialog.message")}
        itemName={getVisibleColorName(colorToDelete?.colorName)}
        loading={deleteLoading}
      />
    </>
  );
};

export default ColorsTab;
