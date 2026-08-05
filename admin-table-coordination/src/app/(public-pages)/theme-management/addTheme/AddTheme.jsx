"use client";

import { useEffect, useState } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { FiArrowLeft, FiLayers, FiPlus, FiX } from "react-icons/fi";
import Select from "react-select";
import { FiBarChart2, FiImage } from "react-icons/fi";
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
  const [errors, setErrors] = useState({});

  const categoryOptions = categoryList.map((item) => ({
    value: item.id,
    label: item.categoryName,
  }));

  const validateStepOne = () => {
    const newErrors = {};

    if (!themeData.title.trim()) {
      newErrors.title = "Theme name is required*";
    }

    if (!themeData.category) {
      newErrors.category = "Category is required*";
    }

    if (!themeData.description.trim()) {
      newErrors.description = "Description is required*";
    }

    if (!themeData.image) {
      newErrors.image = "Thumbnail is required*";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

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
    <div className="bg-white min-h-screen p-6">
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
                  onChange={(e) => {
                    setThemeData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      title: "",
                    }));
                  }}
                  placeholder="Enter theme name"
                  className="w-full h-12 rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] px-4 outline-none focus:border-[#A85A32]"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="text-[13px] font-bold uppercase tracking-wider text-[#8C6E5D] mb-2 block">
                  Category
                </label>

                <Select
                  options={categoryOptions}
                  styles={selectStyles}
                  value={themeData.category}
                  onChange={(value) => {
                    setThemeData((prev) => ({
                      ...prev,
                      category: value,
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      category: "",
                    }));
                  }}
                />
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-5">
              <label className="text-[13px] font-bold uppercase tracking-wider text-[#8C6E5D] mb-2 block">
                Short Description
              </label>

              <textarea
                value={themeData.description}
                onChange={(e) => {
                  setThemeData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }));

                  setErrors((prev) => ({
                    ...prev,
                    description: "",
                  }));
                }}
                rows={4}
                placeholder="Write short description..."
                className="w-full rounded-xl border border-[#E9DDD3] bg-[#FCFAF8] p-4 resize-none outline-none focus:border-[#A85A32]"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
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

              {themeData.image ? (
                <div>
                  <div className="overflow-hidden rounded-2xl border border-[#E7D6C9]">
                    <img
                      src={URL.createObjectURL(themeData.image)}
                      alt="Thumbnail"
                      className="w-full h-[220px] object-cover"
                    />
                  </div>

                  <label className="mt-5 inline-block cursor-pointer">
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

                          setErrors((prev) => ({
                            ...prev,
                            image: "",
                          }));
                        }
                      }}
                    />

                    <span className="px-5 py-2 border border-[#D7A07B] rounded-full text-[#A85A32] text-sm font-medium hover:bg-[#FFF4ED] transition">
                      Change Image
                    </span>
                  </label>
                </div>
              ) : (
                <div className="border border-dashed border-[#E7D6C9] rounded-2xl bg-[#FCFAF8] h-[220px] flex flex-col items-center justify-center">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-full bg-[#FDF4EE] flex items-center justify-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#FEF3EC] flex items-center justify-center">
                      <FiImage size={18} className="text-[#A0522D]" />
                    </div>
                  </div>

                  <h3 className="text-[16px] font-medium text-[#1A1410]">
                    Upload image
                  </h3>

                  <p className="text-[13px] text-[#9E8D80] mt-1">
                    PNG or JPG up to 5 MB
                  </p>

                  <label className="mt-5 cursor-pointer">
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

                          setErrors((prev) => ({
                            ...prev,
                            image: "",
                          }));
                        }
                      }}
                    />

                    <span className="px-5 py-2 border border-[#D7A07B] rounded-full text-[#A85A32] text-sm font-medium hover:bg-[#FFF4ED] transition">
                      Browse Files
                    </span>
                  </label>
                </div>
              )}

              {errors.image && (
                <p className="text-red-500 text-sm mt-2">{errors.image}</p>
              )}
            </div>

            {/* Gallery */}
            {/* Gallery */}
            <div className="mt-8">
              <label className="block text-[13px] font-bold uppercase tracking-wider text-[#8C6E5D] mb-3">
                Gallery Photos
              </label>

              <div className="flex gap-3 flex-wrap">
                {themeData.coverImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#E7D9CF]"
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      alt=""
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setThemeData((prev) => ({
                          ...prev,
                          coverImages: prev.coverImages.filter(
                            (_, i) => i !== index,
                          ),
                        }));
                      }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white shadow flex items-center justify-center"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}

                <label className="w-24 h-24 border-2 border-dashed border-[#E7D9CF] rounded-xl flex items-center justify-center cursor-pointer hover:border-[#A0522D]">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);

                      setThemeData((prev) => ({
                        ...prev,
                        image: prev.image || files[0],
                        coverImages: [...prev.coverImages, ...files],
                      }));
                    }}
                  />

                  <FiPlus size={24} className="text-[#A0522D]" />
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between mt-10">
              <button
                onClick={() => router.back()}
                className="px-8 py-2.5 rounded-xl border border-[#E5D5C8] text-[#8C6E5D] font-medium hover:bg-[#FAF5F2]"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (validateStepOne()) {
                    setStep(2);
                  }
                }}
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
