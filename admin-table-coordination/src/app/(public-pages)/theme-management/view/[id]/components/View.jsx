"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
} from "react-icons/fi";
import { apiGetThemeDetails } from "@/services/ThemeManagement";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("themeManagement.addtheme");

  const [sections, setSections] = useState(sectionsData);
  const [activeImage, setActiveImage] = useState(0);
  const router = useRouter();

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const params = useParams();
  const id = params.id;

  const [themeData, setThemeData] = useState(null);
  const [loading, setLoading] = useState(false);

  const bannerImages = [
    themeData?.image,
    ...(themeData?.cover_images?.map((item) => item.image) || []),
  ].filter(Boolean);

  const getThemeDetails = async () => {
    if (!accessToken || !id) return;

    try {
      setLoading(true);

      const res = await apiGetThemeDetails(accessToken, id);

      console.log("Theme Details", res);
      if (res?.status) {
        setThemeData(res.data);

        const themeItems = res.data.theme_items || {};

        setSections([
          {
            id: 1,
            title: "Table Setup",
            itemsCount: themeItems.table_setup?.length || 0,
            items: themeItems.table_setup || [],
            open: true,
          },
          {
            id: 2,
            title: "Floral & Decor",
            itemsCount: themeItems.floral_decor?.length || 0,
            items: themeItems.floral_decor || [],
            open: false,
          },
          {
            id: 3,
            title: "Seating",
            itemsCount: themeItems.seating?.length || 0,
            items: themeItems.seating || [],
            open: false,
          },
          {
            id: 4,
            title: "Additional Elements",
            itemsCount: themeItems.additional_elements?.length || 0,
            items: themeItems.additional_elements || [],
            open: false,
          },
        ]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getThemeDetails();
  }, [accessToken, id]);

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
            <FiArrowLeft size={18} className="text-[#1A1410]" />
          </button>

          <h1 className="text-[30px] font-bold text-[#24160E]">
            {" "}
            {themeData?.title || "View Theme"}
          </h1>
        </div>

        {/* Banner */}

        <div className="relative overflow-hidden rounded-2xl h-[380px] md:h-[460px] bg-[#F7F2EE] border border-[#EFE5DD] flex items-center justify-center">
          {bannerImages[activeImage] && (
            <img
              src={bannerImages[activeImage]}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-30 pointer-events-none"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}

          {bannerImages[activeImage] ? (
            <img
              src={bannerImages[activeImage] || "/img/others/table-image.png"}
              alt={themeData?.title || "Theme Banner"}
              className="relative z-10 max-h-full max-w-full object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/img/others/table-image.png";
              }}
            />
          ) : (
            <div className="relative z-10 text-sm text-[#8D8178]">
              No image available
            </div>
          )}

          {/* Preset */}

          <div className="absolute top-5 left-5 z-20">
            <span className="bg-white/95 text-[#7A553D] text-xs font-medium px-3 py-1 rounded-full shadow-sm">
              {t("presetLook")}
            </span>
          </div>

          {/* Slider dots */}

          {bannerImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md z-20 shadow-sm">
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-2 rounded-full transition-all duration-200 ${activeImage === index
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
            {t("itemsIncludedTheme")}
          </h2>

          <span className="px-3 py-1 rounded-full shadow-sm bg-white text-[#8B5A3C] text-sm">
            {Object.values(themeData?.theme_items || {}).flat().length}
          </span>
        </div>

        {/* Sections */}

        <div className="space-y-5">
          {sections.map((section) => (
            <div
              key={section.id}
              className="rounded-2xl border border-[#EFE5DD] bg-white overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#FBF5F0] flex items-center justify-center">
                    <FiPackage size={20} className="text-[#A86B45]" />
                  </div>

                  <div>
                    <p className="text-[15px] text-[#2C1810]">
                      {section.title} : {section.itemsCount}
                    </p>
                    {/* 
                    <p className="text-xs text-gray-500">
                      {section.itemsCount} Items
                    </p> */}
                  </div>
                </div>

                {section.open ? (
                  <FiChevronUp size={20} className="text-[#8B5A3C]" />
                ) : (
                  <FiChevronDown size={20} className="text-[#8B5A3C]" />
                )}
              </button>

              {section.open && (
                <div className="bg-white border-t border-[#EFE5DD] p-4 space-y-3">
                  {section.items?.length > 0 ? (
                    section.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-[#EFE5DD] p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 aspect-square rounded-lg border border-[#EFE5DD] bg-[#FAF8F6] flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
                            <img
                              src={
                                item.product_details?.ProductImage ||
                                "/img/products/product-1.jpg"
                              }
                              alt={
                                item.product_details?.productName || "Product"
                              }
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                  "/img/products/product-1.jpg";
                              }}
                            />
                          </div>

                          <div>
                            <p className="text-[15px] font-medium text-[#2C1810]">
                              {item.product_details?.productName}
                            </p>

                            <p className="text-sm text-gray-500">
                              ₹{item.product_details?.price}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400">
                      No items available
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreviewTheme;
