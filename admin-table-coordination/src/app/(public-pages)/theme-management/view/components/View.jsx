"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
} from "react-icons/fi";

const bannerImages = [
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600",
];

const sectionsData = [
  {
    id: 1,
    title: "Table Setup",
    itemsCount: 14,
    open: true,
  },
  {
    id: 2,
    title: "Floral & Decor",
    itemsCount: 5,
    open: false,
  },
  {
    id: 3,
    title: "Furniture",
    itemsCount: 8,
    open: false,
  },
  {
    id: 4,
    title: "Lighting",
    itemsCount: 2,
    open: false,
  },
];

const PreviewTheme = () => {
  const [sections, setSections] = useState(sectionsData);
  const [activeImage, setActiveImage] = useState(0);
  const router = useRouter();

  const toggleSection = (id) => {
    setSections((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, open: !item.open } : item,
      ),
    );
  };

  return (
    <div className="bg-[#FAF8F6] min-h-screen p-4">
      <div className="max-w-[1450px] mx-auto ">
        {/* Header */}

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full border border-[#E7D9CF] bg-white flex items-center justify-center hover:bg-[#F8F4F1]"
          >
            <FiArrowLeft />
          </button>

          <h1 className="text-[30px] font-bold text-[#24160E]">View Theme</h1>
        </div>

        {/* Banner */}

        <div className="relative overflow-hidden rounded-2xl h-[360px]">
          <img
            src={bannerImages[activeImage]}
            alt=""
            className="w-full h-full object-cover"
          />

          {/* overlay */}

          <div className="absolute inset-0 bg-black/20" />

          {/* Preset */}

          <div className="absolute top-5 left-5">
            <span className="bg-white/95 text-[#7A553D] text-xs px-3 py-1 rounded-full shadow">
              Preset Look
            </span>
          </div>

          {/* Slider dots */}

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={`w-2.5 h-2.5 rounded-full transition ${
                  activeImage === index ? "bg-white w-6" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Items Heading */}

        <div className="flex items-center gap-5 mt-8 mb-5">
          <h2 className="text-[20px] font-bold text-[#7B3C1D]">
            Items Included In This Theme
          </h2>

          <span className="px-3 py-1 rounded-full shadow-sm bg-white text-[#8B5A3C] text-sm">
            14 items total
          </span>
        </div>

        {/* Sections */}

        <div className="space-y-5">
          {sections.map((section) => (
            <div
              key={section.id}
              className="rounded-2xl border border-[#EFE5DD] bg-[#f6f6f6] overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#FBF5F0] flex items-center justify-center">
                    <FiPackage size={20} className="text-[#A86B45]" />
                  </div>

                  <span className="text-[15px] text-[#2C1810]">
                    {section.title}
                  </span>
                </div>

                {section.open ? (
                  <FiChevronUp size={20} className="text-[#8B5A3C]" />
                ) : (
                  <FiChevronDown size={20} className="text-[#8B5A3C]" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreviewTheme;
