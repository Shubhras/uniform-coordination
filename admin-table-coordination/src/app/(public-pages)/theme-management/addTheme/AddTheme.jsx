"use client";

import { useEffect, useState } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { FiArrowLeft, FiLayers, FiPlus, FiX } from "react-icons/fi";
import Select from "react-select";
import { FiBarChart2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import ThemeBuilder from "./components/ThemeBuilder";
import PreviewTheme from "./components/PreviewTheme";
import { apiGetCategoryList } from "@/services/CategoryService";

const AddTheme = () => {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [categoryList, setCategoryList] = useState([]);
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const categoryOptions = categoryList.map((item) => ({
    value: item.id,
    label: item.categoryName,
  }));

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await apiGetCategoryList(accessToken, 1, 100);

      if (res?.status) {
        setCategoryList(res.data);
      }
    };

    if (accessToken) {
      fetchCategories();
    }
  }, [accessToken]);

  const [themeData, setThemeData] = useState({
    title: "",
    category: null,
    description: "",
    image: null,
    coverImages: [],
    order: 1,
    is_active: true,

    theme_items: {
      table_setup: [],
      floral_decor: [],
      seating: [],
      additional_elements: [],
    },
  });

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
                  value={themeData.title}
                  onChange={(e) =>
                    setThemeData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
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
                  styles={selectStyles}
                  value={themeData.category}
                  onChange={(value) =>
                    setThemeData((prev) => ({
                      ...prev,
                      category: value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-5">
              <label className="text-[13px] font-bold uppercase tracking-wider text-[#8C6E5D] mb-2 block">
                Short Description
              </label>

              <textarea
                value={themeData.description}
                onChange={(e) =>
                  setThemeData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
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
                <div className="overflow-hidden rounded-xl border border-[#EFE5DD] h-[230px]">
                  {themeData.image ? (
                    <img
                      src={URL.createObjectURL(themeData.image)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <label className="w-full h-full flex items-center justify-center cursor-pointer bg-[#FAF8F6]">
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setThemeData((prev) => ({
                              ...prev,
                              image: file,
                            }));
                          }
                        }}
                      />

                      <div className="text-center">
                        <FiPlus className="mx-auto text-[#A0522D]" size={26} />
                        <p className="mt-2 text-sm text-[#8C6E5D]">
                          Upload Thumbnail
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery */}
    

            {/* Footer Buttons */}
            <div className="flex justify-between mt-10">
              <button
                onClick={() => router.back()}
                className="px-8 py-2.5 rounded-xl border border-[#E5D5C8] text-[#8C6E5D] font-medium hover:bg-[#FAF5F2]"
              >
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
      {step === 2 && (
        <ThemeBuilder
          themeData={themeData}
          setThemeData={setThemeData}
          onBack={() => setStep(1)}
          onPreview={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <PreviewTheme
          themeData={themeData}
          setThemeData={setThemeData}
          onBack={() => setStep(2)}
        />
      )}
    </div>
  );
};

export default AddTheme;
