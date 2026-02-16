"use client";

import React, { useState } from "react";
import { FiSearch, FiPlus, FiImage } from "react-icons/fi";

const CatelogImagesTab = () => {
  const [search, setSearch] = useState("");

  const images = [
    {
      title: "Medical & Nursing Care",
      subtitle: "Healthcare uniforms",
      img: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      title: "Food Service & Dining",
      subtitle: "Hospitality uniforms",
      img: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      title: "Office & Back-End Operations",
      subtitle: "Corporate wear",
      img: "https://randomuser.me/api/portraits/men/76.jpg",
    },
  ];

  return (
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

          <button className="bg-[#1C2C56] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
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
          placeholder="Search Fabrics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-[#00345F] rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none"
        />
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {images
          .filter((img) =>
            img.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((item, index) => (
            <div
              key={index}
              className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-sm hover:shadow-md transition"
            >
              <div className="bg-[#074bc208] rounded-lg p-3 flex justify-center">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-52 h-52 object-cover rounded-full"
                />
              </div>

              <div className="mt-3">
                <p className="text-base font-semibold text-[#1C2C56]">
                  {item.title}
                </p>
                <p className="text-sm text-[#64748B]">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}

        {/* Add New Image Card */}
        <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl flex flex-col items-center justify-center p-6 bg-white hover:bg-gray-50 cursor-pointer transition">
          <FiImage className="text-[#64748B]" size={28} />
          <p className="text-sm font-medium text-[#1C2C56] mt-2">
            Add New Image
          </p>
        </div>
      </div>
    </div>
  );
};

export default CatelogImagesTab;
