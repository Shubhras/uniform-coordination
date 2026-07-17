"use client";

import Select from "react-select";
import {
  FiBarChart2,
  FiArrowLeft,
  FiChevronRight,
  FiChevronDown,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiLayers,
  FiX,
} from "react-icons/fi";
import { LuGripVertical } from "react-icons/lu";

import { useRouter } from "next/navigation";
import { useState } from "react";

const categoryOptions = [
  { value: "Wedding", label: "Wedding" },
  { value: "Corporate", label: "Corporate" },
  { value: "Birthday", label: "Birthday" },
];

const galleryImages = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=300",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=300",
  "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=300",
];

const Edit = () => {
  const router = useRouter();

  const [category, setCategory] = useState(categoryOptions[0]);

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "48px",
      borderColor: "#E7D9CF",
      boxShadow: "none",
      borderRadius: "12px",
      "&:hover": {
        borderColor: "#A0522D",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const [sections, setSections] = useState([
    {
      id: 1,
      title: "Table Setup",
      count: 3,
      open: false,
    },
    {
      id: 2,
      title: "Floral & Decor",
      count: 1,
      open: false,
    },
    {
      id: 3,
      title: "Seating",
      count: 0,
      open: false,
    },
    {
      id: 4,
      title: "Additional Elements",
      count: 0,
      open: false,
    },
  ]);

  const toggleSection = (id) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, open: !section.open } : section,
      ),
    );
  };

  return (
    <div className="bg-[#FAF8F6] min-h-screen p-6">
      {/* Header */}

      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full border border-[#E7D9CF] bg-white flex items-center justify-center hover:bg-[#F8F4F1]"
        >
          <FiArrowLeft size={18} className="text-[#1A1410]" />
        </button>

        <h1 className="text-[28px] font-bold text-[#1A1410]">Edit Theme</h1>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-[#EFE5DD] p-6">
        {/* Section Heading */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-[#FEF3EC] flex items-center justify-center">
            <FiBarChart2 size={18} className="text-[#A0522D]" />
          </div>

          <h2 className="text-[20px] font-bold text-[#2C1A0E]">
            Basic Information
          </h2>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-[13px] font-bold uppercase tracking-wider text-[#8C6E5D] mb-2 block">
              Theme Name
            </label>

            <input
              type="text"
              placeholder="Enter theme name"
              className="w-full h-12 rounded-xl border border-[#E7D9CF] px-4 outline-none focus:border-[#A0522D]"
            />
          </div>

          <div>
            <label className="text-[13px] font-bold uppercase tracking-wider text-[#8C6E5D] mb-2 block">
              Category
            </label>

            <Select
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              styles={selectStyles}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-5">
          <label className="text-[13px] font-bold uppercase tracking-wider text-[#8C6E5D] mb-2 block">
            Short Description
          </label>

          <textarea
            rows={4}
            placeholder="Write short description..."
            className="w-full rounded-xl border border-[#E7D9CF] p-4 resize-none outline-none focus:border-[#A0522D]"
          />
        </div>
      </div>

      {/* Theme Images */}
      <div className="mt-6 bg-white rounded-2xl border border-[#EFE5DD] p-6">
        {/* Heading */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-[#FEF3EC] flex items-center justify-center">
            <FiLayers size={18} className="text-[#A0522D]" />
          </div>

          <h2 className="text-[20px] font-bold text-[#2C1A0E]">Theme Images</h2>
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-[13px] font-bold uppercase tracking-wider text-[#8C6E5D] mb-3">
            Thumbnail
          </label>

          <div className="overflow-hidden rounded-xl border border-[#EFE5DD] h-[230px]">
            <img
              src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1400"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Gallery */}
        <div className="mt-6">
          <label className="block text-[13px] font-bold uppercase tracking-wider text-[#8C6E5D] mb-3">
            Gallery Photos
          </label>

          <div className="flex gap-4 flex-wrap">
            {galleryImages.map((img, index) => (
              <div
                key={index}
                className="relative w-[105px] h-[105px] rounded-xl overflow-hidden border border-[#EFE5DD]"
              >
                <img src={img} alt="" className="w-full h-full object-cover" />

                <button className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow">
                  <FiX size={10} />
                </button>
              </div>
            ))}

            {/* Upload */}
            <button className="w-[105px] h-[105px] rounded-xl border-2 border-dashed border-[#E5D5C8] flex items-center justify-center hover:bg-[#FAF5F2] transition">
              <FiPlus className="text-[#A0522D]" size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EFE5DD] shadow-sm p-6 mt-5">
        {/* Heading */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-[#FEF3EC] flex items-center justify-center">
            <FiLayers size={18} className="text-[#A0522D]" />
          </div>
          <h1 className="text-[20px] font-bold text-[#1A1410]">
            Theme Builder
          </h1>
        </div>
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
                    {section.count} items
                  </span>
                </div>

                <button className="flex items-center gap-2 border border-[#E8D8CC] rounded-lg px-4 py-2 text-[#A85A32] text-[14px] bg-[#FAF5F2]">
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
                    {[
                      {
                        name: "Gold Charger Plate",
                        category: "Tableware",
                        material: "Metal",
                        color: "Gold",
                        image: "https://picsum.photos/60?1",
                      },
                      {
                        name: "Ivory Tablecloth",
                        category: "Linens",
                        material: "Satin",
                        color: "Ivory",
                        image: "https://picsum.photos/60?2",
                      },
                      {
                        name: "Round Table",
                        category: "Tables",
                        material: "Wood",
                        color: "Natural Oak",
                        image: "https://picsum.photos/60?3",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-xl border border-[#EFE5DD] px-5 py-4"
                      >
                        {/* Left */}

                        <div className="flex items-center gap-4">
                          <div className="cursor-grab text-[#C5B7AA]">
                            <LuGripVertical size={16} />
                          </div>

                          <img
                            src={item.image}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            alt=""
                          />

                          {/* Fixed width */}
                          <div className="w-64">
                            <h4 className="font-semibold text-[#A08070] text-sm break-words">
                              {item.name}
                            </h4>

                            <p className="text-xs text-[#8C6E5D]">
                              {item.category}
                            </p>
                          </div>

                          {/* Material & Color */}
                          <div className="hidden md:flex gap-12">
                            <div>
                              <p className="text-[10px] uppercase text-[#A79A8F]">
                                Material
                              </p>
                              <p className="text-sm text-[#3B3028]">
                                {item.material}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] uppercase text-[#A79A8F]">
                                Color
                              </p>
                              <p className="text-sm text-[#3B3028]">
                                {item.color}
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Right */}

                        <div className="flex items-center gap-6">
                          <button className="flex items-center gap-1 text-[#0088FF] text-sm">
                            <FiRefreshCw size={14} strokeWidth={1.8} />
                            Replace
                          </button>

                          <button className="flex items-center gap-1 text-[#EB5757] text-sm">
                            <FiTrash2 size={14} strokeWidth={1.8} />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Edit;
