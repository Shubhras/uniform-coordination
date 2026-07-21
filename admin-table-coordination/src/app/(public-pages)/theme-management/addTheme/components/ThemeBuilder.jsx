"use client";

import { useState } from "react";
import {
  FiArrowLeft,
  FiChevronRight,
  FiChevronDown,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
} from "react-icons/fi";
import { LuGripVertical } from "react-icons/lu";
import { useRouter } from "next/navigation";
import InventoryItemsModal from "./InventoryItemsModal";

const ThemeBuilder = ({ themeData, setThemeData, onBack, onPreview }) => {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [currentSection, setCurrentSection] = useState("");

  const [sections, setSections] = useState([
    {
      id: 1,
      key: "table_setup",
      title: "Table Setup",
    },

    {
      id: 2,
      key: "floral_decor",
      title: "Floral & Decor",
    },

    {
      id: 3,
      key: "seating",
      title: "Seating",
    },

    {
      id: 4,
      key: "additional_elements",
      title: "Additional Elements",
    },
  ]);

  const toggleSection = (id) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, open: !section.open } : section,
      ),
    );
  };

  const handleAddItem = (product) => {
    setThemeData((prev) => ({
      ...prev,

      theme_items: {
        ...prev.theme_items,

        [currentSection]: [...prev.theme_items[currentSection], product],
      },
    }));

    setOpenModal(false);
  };

  return (
    <>
      <div className="bg-[#FAF8F6] min-h-screen">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full border border-[#E7D9CF] bg-white flex items-center justify-center hover:bg-[#F8F4F1]"
          >
            <FiArrowLeft size={18} className="text-[#1A1410]" />
          </button>

          <h1 className="text-[28px] font-bold text-[#1A1410]">
            Theme Builder
          </h1>
        </div>

        {/* Theme Details */}

        <div className="bg-[#FAF5F2] rounded-xl border border-[#F0E4DA] px-6 py-4 mb-8">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="font-semibold text-[#5C534A]">
                Elegant White Wedding
              </span>
            </div>

            <span className="text-[#CFC4BC]">|</span>

            <span className="text-[#A08070]">4 items across 2 sections</span>

            <span className="text-[#A08070]">|</span>

            <span className="text-[#A08070]">
              Last modified Today at 2:34 PM
            </span>
          </div>
        </div>

        {/* Sections */}

        <div className="space-y-5">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white border border-[#EFE5DD] rounded-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center px-4 py-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleSection(section.id)}>
                    {section.open ? (
                      <FiChevronDown className="text-[#A0522D]" />
                    ) : (
                      <FiChevronRight className="text-[#A0522D]" />
                    )}
                  </button>

                  <div className="w-[4px] h-5 bg-[#A0522D]" />

                  <h3 className="font-bold text-[#1C1917] text-[17px]">
                    {section.title}
                  </h3>

                  <span className="px-2 py-1 rounded-full bg-[#FDF1EA] text-[#A85A32] text-[13px] font-semibold">
                    {themeData.theme_items[section.key].length}
                    items
                  </span>
                </div>

                <button
                  onClick={() => {
                    setCurrentSection(section.key);
                    setOpenModal(true);
                  }}
                  className="flex items-center gap-2 border border-[#E8D8CC] rounded-lg px-4 py-2 text-[#A85A32] text-[14px] bg-[#FAF5F2]"
                >
                  <FiPlus size={14} />
                  Add Item
                </button>
              </div>

              {section.open && (
                <div className="border-t border-[#F2ECE8]">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative w-full max-w-xs">
                        <input
                          type="text"
                          placeholder="Search themes by name..."
                          className="w-full h-10 rounded-lg border border-[#E8DDD4] pl-10 pr-4 text-sm outline-none focus:border-[#A85A32]"
                        />

                        <svg
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          width="15"
                          height="15"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="7" cy="7" r="5" />
                          <path d="M11 11l3 3" />
                        </svg>
                      </div>
                      {/* 
                      <select className="h-10 rounded-lg border border-[#E8DDD4] px-4 text-sm outline-none">
                        <option>Categories</option>
                        <option>Tableware</option>
                        <option>Furniture</option>
                        <option>Decor</option>
                      </select> */}
                    </div>
                  </div>

                  {/* Items */}

                  <div className="px-5 pb-5 space-y-3">
                    {themeData.theme_items[section.key].map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between border rounded-xl p-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.thumbnail || item.image}
                            className="w-12 h-12 rounded-lg object-cover"
                            alt=""
                          />

                          <div>
                            <p className="font-medium">{item.productName}</p>

                            <p className="text-xs text-gray-500">
                              {item.category?.categoryName}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setThemeData((prev) => ({
                              ...prev,
                              theme_items: {
                                ...prev.theme_items,
                                [section.key]: prev.theme_items[
                                  section.key
                                ].filter((p) => p.id !== item.id),
                              },
                            }));
                          }}
                          className="text-red-500"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-10">
          <button
            onClick={onBack}
            className="px-8 py-2.5 rounded-xl border border-[#E5D5C8] text-[#8C6E5D] font-medium hover:bg-[#FAF5F2]"
          >
            Back
          </button>

          <button
            onClick={onPreview}
            className="px-8 py-2.5 rounded-xl bg-[#A85A32] text-white font-semibold hover:bg-[#8E4727]"
          >
            Preview Theme
          </button>
        </div>
      </div>

      <InventoryItemsModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onAdd={handleAddItem}
      />
    </>
  );
};

export default ThemeBuilder;
