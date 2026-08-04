"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiEdit2,
  FiCopy,
  FiPlus,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import Select from "react-select";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
  apiGetPartsList,
  apiDeletePart,
  apiCreatePart,
} from "@/services/PartsService";
import { apiFabricCategoryList } from "@/services/FabricService";
import AddEditPartModal from "./AddEditPartModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import Pagination from "@/components/ui/Pagination";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const PartsTab = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [openAdd, setOpenAdd] = useState(false);
  const [editPart, setEditPart] = useState(null);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partToDelete, setPartToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState(null);

  // View toggle
  const [view, setView] = useState("grid");
  const [pageSize, setPageSize] = useState(10);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total_pages: 1,
    total_items: 0,
  });

  const [categoryOptions, setCategoryOptions] = useState([
    { value: "", label: "All Categories" },
  ]);

  const [category, setCategory] = useState({
    value: "",
    label: "All Categories",
  });
  /* ---------- SELECT STYLES ---------- */
  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "40px",
      borderRadius: "6px",
      borderColor: "#00345F",
      boxShadow: "none",
      "&:hover": { borderColor: "#1C2C56" },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#1C2C56"
        : state.isFocused
          ? "#EEF2FF"
          : "white",
      color: state.isSelected ? "white" : "#1C2C56",
      fontSize: "14px",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  /* ---------- FETCH PARTS ---------- */
  const fetchParts = useCallback(
    async (page = 1) => {
      if (!accessToken) return;

      try {
        setLoading(true);
        const response = await apiGetPartsList(
          accessToken,
          page,
          pageSize,
          debouncedSearch,
          category?.value,
        );

        if (response?.status && response?.data) {
          setParts(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (error) {
        console.error("Failed to fetch parts:", error);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, debouncedSearch, category, pageSize],
  );

  useEffect(() => {
    fetchParts(currentPage);
  }, [fetchParts, currentPage, pageSize]);

  const fetchCategories = useCallback(async () => {
    if (!accessToken) return;

    try {
      const res = await apiFabricCategoryList(accessToken, 1, 100);

      if (res?.status && res?.data) {
        const options = [
          { value: "", label: "All Categories" },
          ...res.data.map((item) => ({
            value: item.id,
            label: item.categoryName,
          })),
        ];

        setCategoryOptions(options);
        setCategory(options[0]);
      }
    } catch (err) {
      console.error("Category fetch failed:", err);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ---------- DELETE ---------- */
  const handleDeleteConfirm = async () => {
    if (!partToDelete || !accessToken) return;

    try {
      setDeleteLoading(true);
      // await apiDeletePart(accessToken, partToDelete.id);
      const response = await apiDeletePart(accessToken, partToDelete.id);

      toast.push(
        <Notification title="Success" type="success">
          {response?.message || "Part deleted successfully."}
        </Notification>,
      );
      setDeleteDialogOpen(false);
      setPartToDelete(null);
      fetchParts(currentPage);
    } catch (error) {
      console.error("Failed to delete part:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ---------- MODAL HANDLERS ---------- */
  const handleAdd = () => {
    setEditPart(null);
    setOpenAdd(true);
  };

  const handleEdit = (part) => {
    setEditPart(part);
    setOpenAdd(true);
  };

  const handleCloseModal = () => {
    setOpenAdd(false);
    setEditPart(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    fetchParts(currentPage);
  };

  const getDuplicatePartName = (name = "") => {
    const baseName = String(name).trim();
    const existingNames = new Set(
      parts.map((item) => item.partName?.trim()).filter(Boolean),
    );

    if (!existingNames.has(baseName)) {
      return baseName;
    }

    let copyIndex = 1;
    let duplicateName = `${baseName} Copy`;

    while (existingNames.has(duplicateName)) {
      copyIndex += 1;
      duplicateName = `${baseName} Copy ${copyIndex}`;
    }

    return duplicateName;
  };

  const handleDuplicatePart = async (part) => {
    if (!accessToken || !part) return;

    try {
      setDuplicatingId(part.id);

      const formData = new FormData();

      formData.append("partName", getDuplicatePartName(part.partName));

      if (part.category?.id) {
        formData.append("category_id", part.category.id);
      }

      if (part.fabric) {
        formData.append("fabric", part.fabric);
      }

      if (part.subcategory?.id) {
        formData.append("subcategory_id", part.subcategory.id);
      }

      if (part.zIndex != null) {
        formData.append("zIndex", part.zIndex);
      }

      // Image URL direct bhej rahe hain
      formData.append("partImage", part.partImage);

      const response = await apiCreatePart(accessToken, formData);

      toast.push(
        <Notification title="Success" type="success">
          {response?.message}
        </Notification>,
      );

      fetchParts(currentPage);
    } catch (error) {
      console.error(error);
    } finally {
      setDuplicatingId(null);
    }
  };
  /* ---------- FILTERING ---------- */
  const filteredParts = parts.filter((p) => {
    const q = searchQuery.toLowerCase();

    return (
      p.partName?.toLowerCase().includes(q) ||
      p.category?.categoryName?.toLowerCase().includes(q)
    );
  });
  /* ---------- PAGINATION ---------- */
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.total_pages) {
      setCurrentPage(page);
    }
  };

  /* ---------- IMAGE URL ---------- */
  const getImageUrl = (path) => {
    if (!path) return "/img/admin/parts/part-1.png";
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path}`;
  };

  /* ---------- SKELETON ---------- */
  const GridSkeleton = () => (
    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="border border-[#1C2C5633] rounded-xl animate-pulse"
        >
          <div className="h-44 bg-gray-200 rounded-t-xl" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
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
    <div className="bg-white rounded-xl shadow md:p-6 p-3">
      <div className="flex justify-between sm:flex-row flex-col items-start mb-4 gap-2">
        <div>
          <h2 className="text-2xl font-semibold text-[#1C2C56]">
            Part Images Library
          </h2>
          <p className="text-base text-[#486284]">
            {pagination.total_items} parts total
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="bg-[#1C4FA8] text-white px-4 py-2 font-medium rounded-md text-sm flex items-center gap-2"
        >
          <FiPlus size={14} />
          Upload New Part
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="relative w-full md:w-72">
          <FiSearch
            className="absolute left-3 top-2.5 text-[#64748B]"
            size={16}
          />
          <input
            type="text"
            placeholder="Search Parts..."
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

        <Select
          options={categoryOptions}
          value={category}
          onChange={setCategory}
          styles={selectStyles}
          menuPortalTarget={
            typeof document !== "undefined" ? document.body : null
          }
          menuPosition="fixed"
          className="w-48 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setCategory(categoryOptions[0]);
            setCurrentPage(1);
          }}
          className="border border-[#CBD5E1] px-4 py-2 rounded-md text-sm text-white bg-[#1C4FA8] hover:bg-[#163F86] transition-colors"
        >
          Reset
        </button>

        <div className="ml-auto flex border rounded-md overflow-hidden">
          <button
            onClick={() => setView("grid")}
            className={`px-4 py-2 text-sm ${
              view === "grid" ? "bg-[#EEF2FF] text-[#1C2C56]" : "text-[#486284]"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 text-sm ${
              view === "list" ? "bg-[#EEF2FF] text-[#1C2C56]" : "text-[#486284]"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* ===== GRID VIEW ===== */}
      {view === "grid" &&
        (loading ? (
          <GridSkeleton />
        ) : filteredParts.length === 0 ? (
          <div className="text-center py-16 text-[#94A3B8]">No parts found</div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredParts.map((part) => (
              <div
                key={part.id}
                className="border border-[#1C2C5633] rounded-xl hover:shadow-md transition"
              >
                <div className="h-44 bg-[#1C4FA808] p-3 relative">
                  <img
                    src={getImageUrl(part.partImage)}
                    alt={part.partName}
                    className="w-full h-full object-cover mb-3 rounded"
                  />

                  {/* Status badge */}
                  {/* <span className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-medium ${part.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-600"
                                            }`}>
                                            {part.isActive ? "Active" : "Inactive"}
                                        </span> */}
                </div>

                <div className="p-3">
                  <h3 className="text-sm font-semibold text-[#1C2C56]">
                    {part.partName}
                  </h3>
                  {/* <p className="text-xs text-[#486284] capitalize">
                    {part.category} · z-index: {part.zIndex}
                  </p> */}
                  <p className="text-xs text-[#486284] capitalize">
                    {part.category?.categoryName} · z-index: {part.zIndex}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(part)}
                      className="flex-1 bg-[#1C4FA8] text-white text-xs py-1.5 rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDuplicatePart(part)}
                      disabled={duplicatingId === part.id}
                      className="flex-1 border border-[#1C4FA8] text-[#1C4FA8] text-xs py-1.5 rounded-md flex items-center justify-center gap-1 hover:bg-[#EEF2FF] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {duplicatingId === part.id
                        ? "Duplicating..."
                        : "Duplicate"}
                    </button>
                    <button
                      onClick={() => {
                        setPartToDelete(part);
                        setDeleteDialogOpen(true);
                      }}
                      className="flex-1 border border-red-200 text-red-500 text-xs py-1.5 rounded-md flex items-center justify-center gap-1 hover:bg-red-50 transition-colors"
                    >
                      <FiTrash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* ===== LIST VIEW ===== */}
      {view === "list" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F1F5F9] text-[#486284]">
              <tr>
                <th className="text-left px-5 py-4 font-medium">Preview</th>
                <th className="text-left px-5 py-4 font-medium">Part Name</th>
                <th className="text-left px-5 py-4 font-medium">Category</th>
                <th className="text-left px-5 py-4 font-medium">Usage</th>
                <th className="text-left px-5 py-4 font-medium">z-index</th>
                {/* <th className="text-left px-5 py-4 font-medium">Status</th> */}
                <th className="text-right px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-white" : "bg-[#1C4FA80F]"}
                  >
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[#64748B]">
                    No parts found
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => (
                  <tr key={part.id}>
                    <td className="px-4 py-3">
                      <img
                        src={getImageUrl(part.partImage)}
                        alt={part.partName}
                        className="w-12 h-12 rounded-md object-cover border"
                      />
                    </td>

                    <td className="px-4 py-3 text-[#1C2C56] font-medium">
                      {part.partName}
                    </td>

                    <td className="px-4 py-3 text-[#486284] capitalize">
                      {/* {part.category} */}
                      {part.category?.categoryName}
                    </td>

                    <td className="px-4 py-3 text-[#1C2C56]">
                      {part.usageTemmpCount} Templates
                    </td>

                    <td className="px-4 py-3 text-[#486284]">{part.zIndex}</td>

                    {/* <td className="px-4 py-3">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${part.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-600"
                                                }`}>
                                                {part.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td> */}

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3 text-[#1C2C56]">
                        <button
                          className="p-1.5 rounded hover:bg-[#EEF2FF]"
                          onClick={() => handleEdit(part)}
                        >
                          <FiEdit2 size={14} />
                        </button>

                        <button
                          className="p-1.5 rounded hover:bg-[#EEF2FF] disabled:opacity-60 disabled:cursor-not-allowed"
                          onClick={() => handleDuplicatePart(part)}
                          disabled={duplicatingId === part.id}
                          title="Duplicate"
                        >
                          <FiCopy size={14} />
                        </button>

                        <button
                          className="p-1.5 rounded hover:bg-red-50 text-red-500"
                          onClick={() => {
                            setPartToDelete(part);
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
      )}

      {/* ===== PAGINATION ===== */}
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

      {/* ===== MODALS ===== */}
      <AddEditPartModal
        key={editPart ? editPart.id : "add"}
        isOpen={openAdd}
        onClose={handleCloseModal}
        mode={editPart ? "edit" : "add"}
        initialData={editPart}
        onSaveSuccess={handleSaveSuccess}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPartToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Part"
        message="Are you sure you want to delete this part? This action cannot be undone."
        itemName={partToDelete?.partName}
        loading={deleteLoading}
      />
    </div>
  );
};

export default PartsTab;
