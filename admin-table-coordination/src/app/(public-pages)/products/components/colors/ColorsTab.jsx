"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiPlus,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiRotateCcw,
} from "react-icons/fi";
import Select from "react-select";
import toast from "@/components/ui/toast";
import { useTranslations } from "next-intl";
import Notification from "@/components/ui/Notification";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiGetColorsList,
  apiDeleteColor,
  apiCreateColor,
} from "@/services/ColorsService";
import { apiFabricCategoryList } from "@/services/FabricService";
import AddEditColorModal from "./AddEditColorModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import Pagination from "@/components/ui/Pagination";
import Spinner from "@/components/ui/Spinner";

const ColorsTab = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const t = useTranslations("productSpecification.color");
  const ts = useTranslations("successTitle");
  const te = useTranslations("errorTitle");

  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Delay search API call until user stops typing for 500ms
  // Also reset pagination to the first page for new search results
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch category options
  useEffect(() => {
    if (!accessToken) return;

    const fetchCategories = async () => {
      try {
        const res = await apiFabricCategoryList(accessToken);
        const options =
          res?.data?.map((item) => ({
            value: item.id,
            label: item.categoryName,
          })) || [];
        setCategoryOptions(options);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, [accessToken]);

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
  const [pageSize, setPageSize] = useState(10);

  /* ------------------------------------------------------------------
   Fetch color list from the API based on:
   - Current page
   - Page size
   - Search keyword
   - Category ID
------------------------------------------------------------------- */
  const fetchColors = useCallback(
    async (page = 1) => {
      if (!accessToken) return;

      try {
        // Show loader while fetching data
        setLoading(true);
        const response = await apiGetColorsList(
          accessToken,
          page,
          pageSize,
          debouncedSearch,
          selectedCategory?.value || null,
        );

        if (response?.status && response?.data) {
          // Update color list and pagination using API response
          setColors(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (error) {
        console.error("Failed to fetch colors:", error);
      } finally {
        // Hide loader after API request completes
        setLoading(false);
      }
    },
    [accessToken, pageSize, debouncedSearch, selectedCategory],
  );

  // Automatically reload data whenever
  // page number, page size, search query or category changes
  useEffect(() => {
    fetchColors(currentPage);
  }, [fetchColors, currentPage, pageSize]);

  // Reset filters
  const handleReset = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "40px",
      height: "40px",
      borderColor: "#D1D5DB",
      boxShadow: "none",
      borderRadius: "8px",
      "&:hover": {
        borderColor: "#A85A32B2",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      height: "40px",
      padding: "0 8px",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "40px",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#A85A32B2",
      fontSize: "14px",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#A85A32B2",
      fontSize: "14px",
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
      fontSize: "14px",
    }),
  };

  /* ---- Delete selected color from database and refresh current page------- */
  const handleDeleteConfirm = async () => {
    if (!colorToDelete || !accessToken) return;

    try {
      setDeleteLoading(true);
      const response = await apiDeleteColor(accessToken, colorToDelete.id);

      toast.push(
        <Notification title={ts("success")} type="success">
          {response.message}
        </Notification>,
      );
      setDeleteDialogOpen(false);
      setColorToDelete(null);
      // Refresh list after successful deletion
      fetchColors(currentPage);
    } catch (error) {
      console.error("Failed to delete color:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open modal in Add mode
  const handleAddColor = () => {
    setModalMode("add");
    setSelectedColor(null);
    setIsModalOpen(true);
  };

  // Open modal in Edit mode with selected color details
  const handleEditColor = (color) => {
    setModalMode("edit");
    setSelectedColor(color);
    setIsModalOpen(true);
  };

  // Duplicate a color directly via the API without opening a modal
  const handleDuplicateColor = async (color) => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const categoryId =
        color.category?.id ||
        (typeof color.category === "number" ? color.category : null) ||
        color.category_id;

      const payload = {
        colorName: color.colorName,
        colorCode: color.colorCode,
        compatibleFabric: color.compatibleFabric || [],
        ...(categoryId ? { category_id: categoryId } : {}),
      };

      const response = await apiCreateColor(accessToken, payload);

      if (response?.status) {
        toast.push(
          <Notification title={ts("success")} type="success">
            {response.message || t("duplicateSuccess")}
          </Notification>,
        );
      } else {
        const errorMessage =
          Object.values(response?.message || {}).flat()[0] ||
          t("duplicateFailed");
        toast.push(
          <Notification title={te("error")} type="danger">
            {errorMessage}
          </Notification>,
        );
      }
      fetchColors(currentPage);
    } catch (error) {
      console.error("Failed to duplicate color:", error);
      toast.push(
        <Notification title={te("error")} type="danger">
          {t("duplicateError")}
        </Notification>,
      );
      fetchColors(currentPage);
    } finally {
      setLoading(false);
    }
  };

  // Close modal and clear selected color
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedColor(null);
  };

  // Refresh list after successful add/edit operation
  const handleSaveSuccess = () => {
    handleCloseModal();
    fetchColors(currentPage);
  };

  // Convert HEX color code into RGB format for display
  const hexToRgb = (hex) => {
    if (!hex) return "";
    const cleanHex = hex.replace("#", "");
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <>
      <div className="bg-[#FFFDFC] border border-[#E8DDD4] rounded-xl shadow md:p-6 p-3">
        <div className="flex justify-between items-start flex-wrap gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#2A211D]">
              {t("palette")}
            </h2>
            <p className="text-sm text-[#B29D8C]">
              {pagination.total_items} {t("colorAvailable")}
            </p>
          </div>

          <button
            onClick={handleAddColor}
            className="bg-[#A0522D] text-white px-4 py-2 font-semibold rounded-md text-sm flex items-center gap-2"
          >
            <FiPlus size={14} />
            {t("addColor")}
          </button>
        </div>

        {/* Filters: Search, Category Select, Reset */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search input for filtering colors */}
          <div className="relative w-full md:w-72">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A85A32B2]"
              size={16}
            />
            <input
              type="text"
              placeholder={t("searchColor")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 border border-[#D1D5DB] text-[#A85A32B2] rounded-lg pl-10 pr-10 outline-none focus:border-[#A85A32B2]"
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

          {/* Category Select */}
          <div className="w-full sm:w-56">
            <Select
              instanceId="color-category-select"
              placeholder={t("selectCategory")}
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(val);
                setCurrentPage(1);
              }}
              options={categoryOptions}
              styles={selectStyles}
              isClearable={false}
            />
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            className="flex h-10 items-center gap-2 rounded-lg border border-[#EFE5DD] bg-white px-4 text-sm font-medium text-[#C08457] transition hover:bg-[#FCF7F3]"
          >
            <FiRotateCcw size={14} />
            {t("reset")}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[400px] w-full">
            <Spinner size={40} customColorClass="text-[#A0522D]" />
          </div>
        ) : colors.length === 0 ? (
          <div className="text-center py-16 text-[#94A3B8]">
            No colors found
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
                  <h3 className="text-sm font-semibold text-[#2A211D]">
                    {color.colorName}
                  </h3>

                  <p className="text-xs text-[#78716C] mt-1">
                    {color.colorCode} &nbsp; {hexToRgb(color.colorCode)}
                  </p>

                  {color.category?.categoryName && (
                    <p className="text-xs text-[#486284] font-medium mt-1">
                      Category: {color.category.categoryName}
                    </p>
                  )}

                  {/* Compatible Fabrics from API */}
                  {color.compatibleFabric &&
                    color.compatibleFabric.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-[#486284] mb-1">
                          {t("compatibleFabric")}:
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
                      className="flex items-center justify-center bg-[#A0522D] text-white text-xs px-3 py-1.5 rounded-md"
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
                      {t("Delete")}
                    </button>
                    <button
                      onClick={() => handleDuplicateColor(color)}
                      className="flex-1 border border-gray-300 text-[#486284] hover:bg-gray-50 transition-colors text-xs py-1.5 rounded-md cursor-pointer"
                    >
                      {t("duplicate")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
        title={t("deleteColor")}
        message={t("deleteColorContent")}
        itemName={colorToDelete?.colorName}
        loading={deleteLoading}
      />
    </>
  );
};

export default ColorsTab;
