"use client";

import { FiArrowLeft, FiLayers, FiPlus, FiX } from "react-icons/fi";
import Select from "react-select";
import { FiBarChart2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ThemeBuilder from "./components/ThemeBuilder";

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

const AddTheme = () => {
  const router = useRouter();

  const [category, setCategory] = useState(categoryOptions[0]);
  const [step, setStep] = useState(1);

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

  return (
    <div className="bg-[#FAF8F6] min-h-screen p-6">
      {/* Header */}
      {step === 1 && (
        <>
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-full border border-[#E7D9CF] bg-white flex items-center justify-center hover:bg-[#F8F4F1]"
            >
              <FiArrowLeft size={18} className="text-[#1A1410]" />
            </button>

            <h1 className="text-[28px] font-bold text-[#1A1410]">
              Add New Theme
            </h1>
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
          <div className="mt-8 bg-white rounded-2xl border border-[#EFE5DD] p-6">
            {/* Heading */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#FEF3EC] flex items-center justify-center">
                <FiLayers size={18} className="text-[#A0522D]" />
              </div>

              <h2 className="text-[20px] font-bold text-[#2C1A0E]">
                Theme Images
              </h2>
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
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />

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

            {/* Footer Buttons */}
            <div className="flex justify-between mt-10">
              <button className="px-8 py-2.5 rounded-xl border border-[#E5D5C8] text-[#8C6E5D] font-medium hover:bg-[#FAF5F2]">
                Cancel
              </button>

              <button
                onClick={() => setStep(2)}
                className="px-8 py-2.5 rounded-xl bg-[#A85A32] text-white font-semibold hover:bg-[#8E4727]"
              >
                Continue
              </button>
            </div>
          </div>
        </>
      )}
      {step === 2 && <ThemeBuilder onBack={() => setStep(1)} />}
    </div>
  );
};

export default AddTheme;
