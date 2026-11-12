"use client";

import { useState } from "react";
import {
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiCreateTheme } from "@/services/ThemeManagement";

const sectionsData = [
  {
    id: 1,
    key: "table_setup",
    title: "Table Setup",
    open: true,
  },
  {
    id: 2,
    key: "floral_decor",
    title: "Floral & Decor",
    open: false,
  },
  {
    id: 3,
    key: "seating",
    title: "Seating",
    open: false,
  },
  {
    id: 4,
    key: "additional_elements",
    title: "Additional Elements",
    open: false,
  },
];

const PreviewTheme = ({ themeData, setThemeData, onBack }) => {
  const [sections, setSections] = useState(sectionsData);
  const [activeImage, setActiveImage] = useState(0);
  const totalItems = Object.values(themeData.theme_items).flat().length;
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const resolveImageUrl = (img) => {
    if (!img) return "";
    if (typeof img === "string") return img;
    if (img instanceof File || img instanceof Blob) {
      return URL.createObjectURL(img);
    }
    if (img?.image && typeof img.image === "string") return img.image;
    if (img?.url && typeof img.url === "string") return img.url;
    return "";
  };

  const bannerImages = [
    themeData.image,
    ...(themeData.coverImages || []),
  ].filter(Boolean);

  const currentImage = bannerImages[activeImage] || bannerImages[0];
  const currentImageUrl = resolveImageUrl(currentImage);

  const handlePrevImage = () => {
    setActiveImage((prev) => Math.max(0, prev - 1));
  };

  const handleNextImage = () => {
    setActiveImage((prev) => Math.min(bannerImages.length - 1, prev + 1));
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      const formData = new FormData();

      formData.append("title", themeData.title);
      formData.append("category", themeData.category.value);
      formData.append("category_id", themeData.category.value);
      formData.append("description", themeData.description);
      formData.append("image", themeData.image);
      formData.append("order", themeData.order);
      formData.append("is_active", themeData.is_active);

      themeData.coverImages.forEach((img) => {
        formData.append("cover_images", img);
      });

      const themeItems = [];

      Object.entries(themeData.theme_items).forEach(([section, products]) => {
        products.forEach((product) => {
          themeItems.push({
            product_id: product.id,
            section,
          });
        });
      });

      formData.append("theme_items", JSON.stringify(themeItems));

      const res = await apiCreateTheme(accessToken, formData);
      toast.push(
        <Notification title="Success" type="success">
          {res.message}
        </Notification>,
      );

      if (res?.status) {
        console.log("Theme Created Successfully");
      }

      if (res?.status) {
        router.push("/theme-management");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (id) => {
    setSections((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, open: !item.open } : item,
      ),
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1450px] mx-auto ">
        {/* Header */}

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full border border-[#E7D9CF] bg-white flex items-center justify-center hover:bg-[#F8F4F1]"
          >
            <FiArrowLeft className="text-lg text-[#5B4434]" />
          </button>

          <div>
            <h1 className="text-[30px] font-bold text-[#24160E]">
              Preview Theme
            </h1>

            <p className="text-[#8B5A3C] mt-1">{themeData.title}</p>
          </div>
        </div>

        {/* Banner */}

        <div className="relative overflow-hidden rounded-2xl h-[380px] md:h-[460px] bg-[#F7F2EE] border border-[#EFE5DD] flex items-center justify-center">
          {currentImageUrl ? (
            <>
              <img
                src={currentImageUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-30 pointer-events-none"
              />
              <img
                src={currentImageUrl}
                alt={themeData.title || "Theme Preview"}
                className="relative z-10 max-h-full max-w-full object-contain"
              />
            </>
          ) : (
            <div className="relative z-10 text-sm text-[#8D8178]">
              No image available
            </div>
          )}

          {/* Preset */}

          <div className="absolute top-5 left-5 z-20">
            <span className="bg-white/95 text-[#7A553D] text-xs font-medium px-3 py-1 rounded-full shadow-sm">
              Preset Look
            </span>
          </div>

          {/* Navigation Arrows */}
          {bannerImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                disabled={activeImage === 0}
                aria-label="Previous image"
                className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition shadow-md ${
                  activeImage === 0
                    ? "bg-white/40 text-gray-400 cursor-not-allowed opacity-50"
                    : "bg-white/90 hover:bg-white text-[#24160E] hover:scale-105 active:scale-95 cursor-pointer"
                }`}
              >
                <FiChevronLeft size={22} />
              </button>

              <button
                type="button"
                onClick={handleNextImage}
                disabled={activeImage === bannerImages.length - 1}
                aria-label="Next image"
                className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition shadow-md ${
                  activeImage === bannerImages.length - 1
                    ? "bg-white/40 text-gray-400 cursor-not-allowed opacity-50"
                    : "bg-white/90 hover:bg-white text-[#24160E] hover:scale-105 active:scale-95 cursor-pointer"
                }`}
              >
                <FiChevronRight size={22} />
              </button>
            </>
          )}

          {/* Slider dots */}

          {bannerImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md z-20 shadow-sm">
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    activeImage === index
                      ? "bg-white w-6"
                      : "bg-white/60 hover:bg-white/80 w-2"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Items Heading */}

        <div className="flex items-center gap-5 mt-8 mb-5">
          <h2 className="text-[20px] font-bold text-[#7B3C1D]">
            Items Included In This Theme
          </h2>

          <span className="px-3 py-1 rounded-full shadow-sm bg-white text-[#8B5A3C] text-sm">
            {totalItems} items total
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

              {section.open && (
                <div className="border-t px-5 py-4">
                  {themeData.theme_items[section.key].length === 0 ? (
                    <div className="py-4 text-center text-sm text-gray-500">
                      No items selected
                    </div>
                  ) : (
                    themeData.theme_items[section.key].map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-3">
                        <div className="w-12 h-12 rounded-lg border border-[#EFE5DD] bg-[#FAF8F6] flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
                          <img
                            src={
                              item.ProductImage ||
                              item.productImage ||
                              item.thumbnail ||
                              item.image ||
                              item.product_details?.ProductImage ||
                              ""
                            }
                            className="w-full h-full object-contain"
                            alt=""
                          />
                        </div>

                        <div>
                          <p className="font-medium">{item.productName}</p>

                          <p className="text-xs text-gray-500">
                            {item.category?.categoryName}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-10">
        <button
          onClick={onBack}
          className="px-8 py-1 h-10 rounded-xl border border-[#E5D5C8] text-[#8C6E5D] font-medium hover:bg-[#FAF5F2]"
        >
          Back
        </button>

        <Button
          onClick={handlePublish}
          loading={saving}
          className="px-8 py-1 h-10 rounded-xl bg-[#A85A32] text-white font-semibold hover:bg-[#8E4727]"
        >
          Publish Theme
        </Button>
      </div>
    </div>
  );
};

export default PreviewTheme;
