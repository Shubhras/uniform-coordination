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
import Select from "react-select";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiGetTemplatesList,
  apiDeleteTemplate,
} from "@/services/TemplateService";
import { apiFabricCategoryList } from "@/services/FabricService";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import AddEditTemplateModal from "./AddEditTemplateModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import PreviewTemplateModal from "./PreviewTemplateModal";
import Pagination from "@/components/ui/Pagination";

const TemplatesTab = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [categoryOptions, setCategoryOptions] = useState([
    { value: "", label: "All Categories" },
  ]);

  const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0]);

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewTemplate(null);
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total_pages: 1,
    total_items: 0,
  });

  const filterOptions = [
    { value: "all", label: "All Categories" },
    { value: "chef-wear", label: "Chef Wear" },
    { value: "aprons", label: "Aprons" },
  ];

  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);

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

  /* ---------- FETCH TEMPLATES ---------- */
  const fetchTemplates = useCallback(
    async (page = 1) => {
      if (!accessToken) return;

      try {
        setLoading(true);
        const response = await apiGetTemplatesList(accessToken, {
          page,
          pageSize,
          search: debouncedSearch,
          categoryId: selectedCategory?.value,
        });

        if (response?.status) {
          setTemplates(response.data);
          setPagination(response.pagination);
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, debouncedSearch, selectedCategory, pageSize],
  );

  useEffect(() => {
    fetchTemplates(currentPage);
  }, [fetchTemplates, currentPage, pageSize]);

  /* ---------- DELETE ---------- */
  const handleDeleteConfirm = async () => {
    if (!templateToDelete || !accessToken) return;

    try {
      setDeleteLoading(true);
      const response = await apiDeleteTemplate(
        accessToken,
        templateToDelete.id,
      );

      toast.push(
        <Notification title="Success" type="success">
          {response?.message}
        </Notification>,
      );
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
      fetchTemplates(currentPage);
    } catch (error) {
      console.error("Failed to delete template:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ---------- MODAL HANDLERS ---------- */
  const handleAdd = () => {
    setEditTemplate(null);
    setOpenModal(true);
  };

  const handleEdit = (template) => {
    setEditTemplate(template);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditTemplate(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    fetchTemplates(currentPage);
  };

  /* ---------- FILTERING ---------- */
  const filteredTemplates = templates.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.templateName?.toLowerCase().includes(q) ||
      t.partName?.toLowerCase().includes(q)
    );
  });

  /* ---------- PAGINATION ---------- */
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.total_pages) {
      setCurrentPage(page);
    }
  };

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
        setSelectedCategory(options[0]);
      }
    } catch (err) {
      console.error("Category fetch failed", err);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ---------- SKELETON ---------- */
  const CardSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="border border-[#E2E8F0] rounded-xl animate-pulse"
        >
          <div className="flex justify-center items-center p-3">
            <div className="w-32 h-32 rounded-full bg-gray-200" />
          </div>
          <div className="px-4 pb-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-5 bg-gray-100 rounded-full w-16 mt-2" />
            <div className="flex gap-2 mt-3">
              <div className="h-7 bg-gray-200 rounded flex-1" />
              <div className="h-7 bg-gray-100 rounded flex-1" />
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
              Template Gallery
            </h2>
            <p className="text-sm text-[#486284]">
              {pagination.total_items} templates available
            </p>
          </div>

          <div className="flex gap-2">
            <button className="border border-[#CBD5E1] px-4 py-2 rounded-md text-sm text-[#1C2C56]">
              Import Template
            </button>
            <button
              onClick={handleAdd}
              className="bg-[#1C4FA8] text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
            >
              <FiPlus size={14} />
              Create Template
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="relative w-full md:w-72">
            <FiSearch
              className="absolute left-3 top-2.5 text-[#64748B]"
              size={16}
            />
            <input
              type="text"
              placeholder="Search Templates..."
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
            value={selectedCategory}
            onChange={setSelectedCategory}
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
              setSearchQuery("");
              setSelectedCategory(categoryOptions[0]);
              setCurrentPage(1);
            }}
            className="border border-[#CBD5E1] px-4 py-2 rounded-md text-sm text-white bg-[#1C4FA8] hover:bg-[#163F86] transition-colors"
          >
            Reset
          </button>
        </div>

        {loading ? (
          <CardSkeleton />
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-16 text-[#94A3B8]">
            No templates found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {filteredTemplates.map((t) => (
              <div
                key={t.id}
                className="border border-[#E2E8F0] rounded-xl bg-white hover:shadow-md transition"
              >
                <div className="flex justify-center items-center p-3">
                  <div className="w-32 h-32 flex items-center justify-center">
                    <img
                      src={t.templateImage}
                      alt={t.templateName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <h3 className="text-sm font-semibold text-[#1C2C56]">
                    {t.templateName}
                  </h3>

                  <p className="text-xs text-[#486284] mt-1">
                    {t.partName} &nbsp; | &nbsp; {t.partUsageCount} Parts
                  </p>

                  <span
                    className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs ${
                      t.isActive
                        ? "bg-[#EEF2FF] text-[#1C2C56]"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {t.isActive ? "Active" : "Inactive"}
                  </span>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(t)}
                      className="flex-1 bg-[#1C4FA8] text-white text-xs py-1.5 rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setTemplateToDelete(t);
                        setDeleteDialogOpen(true);
                      }}
                      className="flex-1 border border-red-200 text-red-500 text-xs py-1.5 rounded-md flex items-center justify-center gap-1 hover:bg-red-50 transition-colors"
                    >
                      {/* <FiTrash2 size={12} /> */}
                      Delete
                    </button>
                    <button
                      onClick={() => handlePreview(t)}
                      className="flex-1 border border-[#CBD5E1] text-[#1C2C56] text-xs py-1.5 rounded-md"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
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

      {/* Modals */}
      <AddEditTemplateModal
        isOpen={openModal}
        onClose={handleCloseModal}
        mode={editTemplate ? "edit" : "add"}
        initialData={editTemplate}
        onSaveSuccess={handleSaveSuccess}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTemplateToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        itemName={templateToDelete?.templateName}
        loading={deleteLoading}
      />
      <PreviewTemplateModal
        isOpen={previewOpen}
        onClose={handleClosePreview}
        template={previewTemplate}
      />
    </>
  );
};

export default TemplatesTab;
