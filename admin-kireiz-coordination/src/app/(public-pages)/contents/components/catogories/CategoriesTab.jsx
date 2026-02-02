"use client";

import { useState } from "react";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiChevronDown,
  FiGrid,
} from "react-icons/fi";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import AddEditCategoryModal from "./AddEditCategoryModal";

const CategoriesTab = () => {
  const [search, setSearch] = useState("");
  const [openCategory, setOpenCategory] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  // ✅ Categories must be state for drag reorder
  const [categories, setCategories] = useState([
    {
      name: "Medical & Nursing Care",
      subcategories: [
        "Medical Scrubs",
        "Professional Lab Coats",
        "Clinical Staff Wear",
        "Office & Admin Staff",
      ],
    },
    {
      name: "Food Service & Dining",
      subcategories: ["Chef Wear", "Restaurant Uniforms"],
    },
    {
      name: "Office & Back-End Operations",
      subcategories: ["Corporate Shirts", "Formal Pants"],
    },
  ]);

  // ✅ Drag End Handler (CATEGORY reorder)
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const updated = Array.from(categories);

    // Remove dragged category
    const [moved] = updated.splice(result.source.index, 1);

    // Insert in new position
    updated.splice(result.destination.index, 0, moved);

    setCategories(updated);
  };

  return (
    <>
      <div className="bg-[#F4F7FC] rounded-xl shadow md:p-6 p-3">
        {/* ================= HEADER ================= */}
        <div className="flex justify-between sm:flex-row flex-col items-start gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              Product Categories
            </h2>
            <p className="text-base text-[#486284]">
              Manage and organize your product categories
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button className="border border-[#CBD5E1] text-[#1C2C56] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
              Arrange Order
            </button>

            <button className="bg-[#1C2C56] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              onClick={() => {
                setEditCategory(null);
                setOpenModal(true);
              }}>
              <FiPlus size={16} />
              Add Category
            </button>
          </div>
        </div>

        {/* ================= SEARCH ================= */}
        <div className="relative w-full md:w-80 mb-6">
          <FiSearch
            className="absolute left-3 top-2.5 text-[#64748B]"
            size={16}
          />
          <input
            type="text"
            placeholder="Search Categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#00345F] rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none"
          />
        </div>

        {/* ================= CATEGORY DRAG LIST ================= */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categoryList">
            {(provided) => (
              <div
                className="space-y-4"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {categories
                  .filter((cat) =>
                    cat.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((cat, index) => (
                    <Draggable
                      key={cat.name}
                      draggableId={cat.name}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          {/* ===== CATEGORY ROW ===== */}
                          <div
                            onClick={() =>
                              setOpenCategory(
                                openCategory === index ? null : index
                              )
                            }
                            className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-[#E2E8F0] px-5 py-5 hover:shadow-md transition cursor-pointer"
                          >
                            {/* Left */}
                            <div className="flex items-center gap-4">
                              {/* ✅ Drag Handle Only */}
                              <span
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing"
                              >
                                <FiGrid className="text-[#94A3B8]" size={18} />
                              </span>

                              <p className="text-base font-semibold text-[#1C2C56]">
                                {cat.name}
                              </p>
                            </div>

                            {/* Right Icons */}
                            <div className="flex items-center gap-4">
                              <FiChevronDown
                                size={18}
                                className={`text-[#1C2C56] transition-transform ${openCategory === index ? "rotate-180" : ""
                                  }`}
                              />

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditCategory(cat);
                                  setOpenModal(true);
                                }}
                              >
                                <FiEdit2 size={18} />
                              </button>

                            </div>
                          </div>

                          {/* ===== SUBCATEGORY PANEL (SMOOTH OPEN) ===== */}
                          <div
                            className={`ml-6 mt-3 overflow-hidden transition-all duration-500 ease-in-out
                          ${openCategory === index
                                ? "max-h-[500px] opacity-100"
                                : "max-h-0 opacity-0"
                              }`}
                          >
                            <div className="space-y-2">
                              {cat.subcategories.map((sub, subIndex) => (
                                <div
                                  key={subIndex}
                                  className="flex items-center justify-between px-6 py-5 rounded-xl border border-[#E5E7EB] bg-white"
                                >
                                  <p className="text-base font-semibold text-[#1C2C56]">
                                    {sub}
                                  </p>

                                  <div className="flex items-center gap-4">
                                    <button className="bg-[#1C2C56] text-white text-sm px-5 py-2 rounded-md font-medium">
                                      Create
                                    </button>

                                    <button className="text-[#1C2C56] hover:text-[#0F172A]">
                                      <FiEdit2 size={18} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
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
      </div>
      <AddEditCategoryModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        mode={editCategory ? "edit" : "add"}
        initialData={editCategory}
      />
    </>
  );
};

export default CategoriesTab;
