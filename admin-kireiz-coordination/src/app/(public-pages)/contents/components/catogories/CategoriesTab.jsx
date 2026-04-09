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
import { apiGetSubcategoriesByCategoryId, apiDeleteSubcategory } from "@/services/SubcategoryService";
import AddEditCategoryModal from "./AddEditCategoryModal";
import AddEditSubcategoryModal from "./AddEditSubcategoryModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

/* ---------- SUBCATEGORY DROPDOWN CONTENT ---------- */
const SubcategoryList = ({ categoryId, accessToken, isOpen, onEdit, onDelete, onAdd }) => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchSubcategories = useCallback(async () => {
    if (!accessToken || !categoryId) return;
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
  }, [accessToken, categoryId]);

  useEffect(() => {
    if (!isOpen || fetched) return;
    fetchSubcategories();
  }, [isOpen, fetched, fetchSubcategories]);

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

          <div className="flex items-center gap-2">
            {/* <span className={`text-xs px-2 py-0.5 rounded-full ${sub.isActive ? "bg-[#EEF2FF] text-[#1C2C56]" : "bg-red-50 text-red-600"}`}>
              {sub.isActive ? "Active" : "Inactive"}
            </span> */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(sub);
              }}
              className="text-[#1C2C56] hover:text-[#0F172A] p-1 rounded hover:bg-[#EEF2FF]"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(sub);
              }}
              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      ))}

      {/* Always show Add Subcategory button */}
      <div className="px-6 py-3 rounded-xl border border-dashed border-[#CBD5E1] bg-white text-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(categoryId);
          }}
          className="bg-[#1C2C56] text-white text-sm px-5 py-2 rounded-md font-medium inline-flex items-center gap-2"
        >
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

  // Category modal
  const [openModal, setOpenModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  // Subcategory modal
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editSubcategory, setEditSubcategory] = useState(null);
  const [defaultCategoryId, setDefaultCategoryId] = useState(null);

  // Delete (shared for both category & subcategory)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'category' | 'subcategory', item }
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ---------- FETCH CATEGORIES ---------- */
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
    if (!deleteTarget || !accessToken) return;

    try {
      setDeleteLoading(true);
      if (deleteTarget.type === "category") {
        await apiDeleteCategory(accessToken, deleteTarget.item.id);
        fetchCategories();
      } else {
        await apiDeleteSubcategory(accessToken, deleteTarget.item.id);
        // Force subcategory list to refetch by toggling the open state
        const catId = openCategory;
        setOpenCategory(null);
        setTimeout(() => setOpenCategory(catId), 100);
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete:", error);
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

    const destCategory = categories[destIndex];
    const newOrder = destCategory?.order ?? destIndex + 1;

    const updated = Array.from(categories);
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(destIndex, 0, moved);
    setCategories(updated);

    try {
      await apiReorderCategory(accessToken, moved.id, newOrder);
      fetchCategories();
    } catch (error) {
      console.error("Failed to reorder category:", error);
      fetchCategories();
    }
  };

  /* ---------- CATEGORY MODAL HANDLERS ---------- */
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditCategory(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    fetchCategories();
  };

  /* ---------- SUBCATEGORY MODAL HANDLERS ---------- */
  const handleAddSubcategory = (categoryId) => {
    setEditSubcategory(null);
    setDefaultCategoryId(categoryId);
    setSubModalOpen(true);
  };

  const handleEditSubcategory = (sub) => {
    setEditSubcategory(sub);
    setDefaultCategoryId(null);
    setSubModalOpen(true);
  };

  const handleCloseSubModal = () => {
    setSubModalOpen(false);
    setEditSubcategory(null);
    setDefaultCategoryId(null);
  };

  const handleSubSaveSuccess = () => {
    handleCloseSubModal();
    // Force subcategory list to refetch
    const catId = openCategory;
    setOpenCategory(null);
    setTimeout(() => setOpenCategory(catId), 100);
  };

  const handleDeleteSubcategory = (sub) => {
    setDeleteTarget({ type: "subcategory", item: sub });
    setDeleteDialogOpen(true);
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
                                  setDeleteTarget({ type: "category", item: cat });
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
                              onEdit={handleEditSubcategory}
                              onDelete={handleDeleteSubcategory}
                              onAdd={handleAddSubcategory}
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

      {/* Category Modal */}
      <AddEditCategoryModal
        isOpen={openModal}
        onClose={handleCloseModal}
        mode={editCategory ? "edit" : "add"}
        initialData={editCategory}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* Subcategory Modal */}
      <AddEditSubcategoryModal
        isOpen={subModalOpen}
        onClose={handleCloseSubModal}
        mode={editSubcategory ? "edit" : "add"}
        initialData={editSubcategory}
        onSaveSuccess={handleSubSaveSuccess}
        defaultCategoryId={defaultCategoryId}
      />

      {/* Delete Confirmation (shared) */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={deleteTarget?.type === "subcategory" ? "Delete Subcategory" : "Delete Category"}
        message={`Are you sure you want to delete this ${deleteTarget?.type || "item"}? This action cannot be undone.`}
        itemName={deleteTarget?.type === "subcategory" ? deleteTarget?.item?.name : deleteTarget?.item?.categoryName}
        loading={deleteLoading}
      />
    </>
  );
};

export default CategoriesTab;
