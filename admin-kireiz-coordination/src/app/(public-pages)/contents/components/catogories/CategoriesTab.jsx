"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiGrid,
} from "react-icons/fi";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetCategoryList, apiDeleteCategory, apiReorderCategory } from "@/services/CategoryService";
import { apiGetSubcategoriesByCategoryId } from "@/services/SubcategoryService";
import AddEditCategoryModal from "./AddEditCategoryModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

/* ---------- SUBCATEGORY DROPDOWN CONTENT ---------- */
const SubcategoryList = ({ categoryId, accessToken, isOpen }) => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!isOpen || !accessToken || !categoryId || fetched) return;

    const fetchSubcategories = async () => {
      setLoading(true);
      try {
        const response = await apiGetSubcategoriesByCategoryId(accessToken, categoryId);
        if (response?.status && response?.data) {
          setSubcategories(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
      } finally {
        setLoading(false);
        setFetched(true);
      }
    };

    fetchSubcategories();
  }, [isOpen, accessToken, categoryId, fetched]);

  // Reset when closed so next open refetches fresh data
  useEffect(() => {
    if (!isOpen) {
      setFetched(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="px-6 py-4 rounded-xl border border-[#E5E7EB] bg-white animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-48" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {subcategories.length === 0 && (
        <p className="text-sm text-[#94A3B8] text-center py-2">No subcategories found</p>
      )}

      {subcategories.map((sub) => (
        <div
          key={sub.id}
          className="flex items-center justify-between px-6 py-4 rounded-xl border border-[#E5E7EB] bg-white"
        >
          <div className="flex items-center gap-3">
            {sub.subcategoryImage && (
              <img
                src={sub.subcategoryImage}
                alt={sub.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <div>
              <p className="text-base font-semibold text-[#1C2C56]">
                {sub.name}
              </p>
              {sub.description && (
                <p className="text-xs text-[#64748B] mt-0.5 line-clamp-1">
                  {sub.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-0.5 rounded-full ${sub.isActive ? "bg-[#EEF2FF] text-[#1C2C56]" : "bg-red-50 text-red-600"}`}>
              {sub.isActive ? "Active" : "Inactive"}
            </span>
            <button className="text-[#1C2C56] hover:text-[#0F172A] p-1 rounded hover:bg-[#EEF2FF]">
              <FiEdit2 size={16} />
            </button>
          </div>
        </div>
      ))}

      {/* Always show Add Subcategory button */}
      <div className="px-6 py-3 rounded-xl border border-dashed border-[#CBD5E1] bg-white text-center">
        <button className="bg-[#1C2C56] text-white text-sm px-5 py-2 rounded-md font-medium inline-flex items-center gap-2">
          <FiPlus size={14} />
          Add Subcategory
        </button>
      </div>
    </div>
  );
};

/* ---------- MAIN COMPONENT ---------- */
const CategoriesTab = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openCategory, setOpenCategory] = useState(null);

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ---------- FETCH ---------- */
  const fetchCategories = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const response = await apiGetCategoryList(accessToken, 1, 100);

      if (response?.status && response?.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ---------- DELETE ---------- */
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete || !accessToken) return;

    try {
      setDeleteLoading(true);
      await apiDeleteCategory(accessToken, categoryToDelete.id);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ---------- DRAG & DROP REORDER ---------- */
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (sourceIndex === destIndex) return;

    // Get the order value of the category at the destination position
    const destCategory = categories[destIndex];
    const newOrder = destCategory?.order ?? destIndex + 1;

    // Optimistic UI update
    const updated = Array.from(categories);
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(destIndex, 0, moved);
    setCategories(updated);

    try {
      await apiReorderCategory(accessToken, moved.id, newOrder);
      // Refetch to get the accurate order values from the server
      fetchCategories();
    } catch (error) {
      console.error("Failed to reorder category:", error);
      fetchCategories();
    }
  };

  /* ---------- HANDLERS ---------- */
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditCategory(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    fetchCategories();
  };

  /* ---------- FILTER ---------- */
  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((cat) =>
      cat.categoryName?.toLowerCase().includes(term)
    );
  }, [categories, search]);

  /* ---------- SKELETON ---------- */
  const ListSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] px-5 py-5 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-5 h-5 bg-gray-200 rounded" />
            <div className="h-5 bg-gray-200 rounded w-48" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="bg-[#F4F7FC] rounded-xl shadow md:p-6 p-3">
        <div className="flex justify-between sm:flex-row flex-col items-start gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              Product Categories
            </h2>
            <p className="text-base text-[#486284]">
              Manage and organize your product categories
            </p>
          </div>

          <div className="flex gap-3">
            <button className="border border-[#CBD5E1] text-[#1C2C56] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
              Arrange Order
            </button>

            <button
              className="bg-[#1C2C56] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              onClick={() => {
                setEditCategory(null);
                setOpenModal(true);
              }}
            >
              <FiPlus size={16} />
              Add Category
            </button>
          </div>
        </div>

        <div className="relative w-full md:w-80 mb-6">
          <FiSearch className="absolute left-3 top-2.5 text-[#64748B]" size={16} />
          <input
            type="text"
            placeholder="Search Categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#00345F] rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none"
          />
        </div>

        {loading ? (
          <ListSkeleton />
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16 text-[#94A3B8]">No categories found</div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="categoryList">
              {(provided) => (
                <div
                  className="space-y-4"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {filteredCategories.map((cat, index) => (
                    <Draggable
                      key={cat.id}
                      draggableId={String(cat.id)}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <div
                            onClick={() =>
                              setOpenCategory(
                                openCategory === cat.id ? null : cat.id
                              )
                            }
                            className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-[#E2E8F0] px-5 py-5 hover:shadow-md transition cursor-pointer"
                          >
                            <div className="flex items-center gap-4">
                              <span
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing"
                              >
                                <FiGrid className="text-[#94A3B8]" size={18} />
                              </span>

                              <p className="text-base font-semibold text-[#1C2C56]">
                                {cat.categoryName}
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              <FiChevronDown
                                size={18}
                                className={`text-[#1C2C56] transition-transform ${openCategory === cat.id ? "rotate-180" : ""
                                  }`}
                              />

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditCategory(cat);
                                  setOpenModal(true);
                                }}
                                className="text-[#1C2C56] hover:text-[#0F172A] p-1 rounded hover:bg-[#EEF2FF]"
                              >
                                <FiEdit2 size={18} />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCategoryToDelete(cat);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Expanded subcategories */}
                          <div
                            className={`ml-6 mt-3 overflow-hidden transition-all duration-500 ease-in-out
                                                        ${openCategory === cat.id
                                ? "max-h-[1000px] opacity-100"
                                : "max-h-0 opacity-0"
                              }`}
                          >
                            <SubcategoryList
                              categoryId={cat.id}
                              accessToken={accessToken}
                              isOpen={openCategory === cat.id}
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Modals */}
      <AddEditCategoryModal
        isOpen={openModal}
        onClose={handleCloseModal}
        mode={editCategory ? "edit" : "add"}
        initialData={editCategory}
        onSaveSuccess={handleSaveSuccess}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        itemName={categoryToDelete?.categoryName}
        loading={deleteLoading}
      />
    </>
  );
};

export default CategoriesTab;
