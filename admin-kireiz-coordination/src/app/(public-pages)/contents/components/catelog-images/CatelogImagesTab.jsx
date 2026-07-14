"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FiSearch,
  FiPlus,
  FiImage,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiGetCatalogImageList,
  apiDeleteCatalogImage,
} from "@/services/CatalogService";
import AddEditCatalogModal from "./AddEditCatalogModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

const CatelogImagesTab = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total_pages: 1,
    total_items: 0,
  });

  /* ---------- FETCH ---------- */
  const fetchImages = useCallback(
    async (page = 1) => {
      if (!accessToken) return;

      try {
        setLoading(true);
        const response = await apiGetCatalogImageList(accessToken, page);

        if (response?.status && response?.data) {
          console.log("afsgvegf", response.data);
          console.log(response.data[0]);
          setImages(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          } else {
            setPagination((prev) => ({
              ...prev,
              total_items:
                response.count || response.total_items || response.data.length,
              total_pages: response.total_pages || 1,
              page: response.page || page,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch catalog images:", error);
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    fetchImages(currentPage);
  }, [fetchImages, currentPage]);

  /* ---------- DELETE ---------- */
  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !accessToken) return;

    try {
      setDeleteLoading(true);
      await apiDeleteCatalogImage(accessToken, itemToDelete.id);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchImages(currentPage);
    } catch (error) {
      console.error("Failed to delete catalog image:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ---------- HANDLERS ---------- */
  const handleAdd = () => {
    setEditItem(null);
    setOpenModal(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditItem(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    fetchImages(currentPage);
  };

  /* ---------- FILTER ---------- */
  const filteredImages = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return images;
    return images.filter((img) => {
      const name = img.name?.toLowerCase() || "";
      const category = img.category_name?.toLowerCase() || "";

      return name.includes(term) || category.includes(term);
    });
  }, [images, search]);

  /* ---------- PAGINATION ---------- */
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.total_pages) {
      setCurrentPage(page);
    }
  };

  /* ---------- SKELETON ---------- */
  const CardSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-[#E2E8F0] rounded-xl p-3 animate-pulse"
        >
          <div className="bg-gray-100 rounded-lg p-3 flex justify-center">
            <div className="w-52 h-52 rounded-full bg-gray-200" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="bg-[#F4F7FC] rounded-xl shadow md:p-6 p-4">
        {/* Header */}
        <div className="flex justify-between sm:flex-row flex-col items-start gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              Catalog Images
            </h2>
            <p className="text-base text-[#486284]">
              Upload and manage catalog photography
            </p>
          </div>

          <div className="flex gap-3">
            <button className="border border-[#CBD5E1] text-[#1C2C56] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
              Bulk Edit
            </button>

            <button
              onClick={handleAdd}
              className="bg-[#1C4FA8] text-[#FFFFFF] px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
            >
              <FiPlus size={16} />
              Upload Image
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80 mb-6">
          <FiSearch
            className="absolute left-3 top-2.5 text-[#64748B]"
            size={16}
          />
          <input
            type="text"
            placeholder="Search Catalog..."
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

        {/* Image Grid */}
        {loading ? (
          <CardSkeleton />
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-16 text-[#94A3B8]">
            No catalog images found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredImages.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-sm hover:shadow-md transition"
              >
                <div className="bg-[#074bc208] rounded-lg p-3 flex justify-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-52 h-52 object-cover rounded-full"
                  />
                </div>

                <div className="mt-3">
                  <p className="text-base font-semibold text-[#1C2C56]">
                    {item.name}
                  </p>
                  <p className="text-sm text-[#64748B]">{item.category}</p>

                  <div className="flex justify-end gap-1 mt-2">
                    <button
                      type="button"
                      className="text-[#1C2C56] hover:text-[#0F172A] p-1.5 rounded hover:bg-[#EEF2FF]"
                      onClick={() => handleEdit(item)}
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50"
                      onClick={() => {
                        setItemToDelete(item);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Image Card */}
            <div
              onClick={handleAdd}
              className="border-2 border-dashed border-[#CBD5E1] rounded-xl flex flex-col items-center justify-center p-6 bg-white hover:bg-gray-50 cursor-pointer transition"
            >
              <FiImage className="text-[#64748B]" size={28} />
              <p className="text-sm font-medium text-[#1C2C56] mt-2">
                Add New Image
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between mt-6 px-2">
            <p className="text-sm text-[#64748B]">
              Page {pagination.page} of {pagination.total_pages} (
              {pagination.total_items || images.length} items)
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
      <AddEditCatalogModal
        isOpen={openModal}
        onClose={handleCloseModal}
        mode={editItem ? "edit" : "add"}
        initialData={editItem}
        onSaveSuccess={handleSaveSuccess}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Catalog Image"
        message="Are you sure you want to delete this catalog image? This action cannot be undone."
        itemName={itemToDelete?.name}
        loading={deleteLoading}
      />
    </>
  );
};

export default CatelogImagesTab;
