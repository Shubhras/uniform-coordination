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

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const params = useParams();
  const id = params.id;

  const [themeData, setThemeData] = useState(null);
  const [loading, setLoading] = useState(false);

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
            <FiArrowLeft />
          </button>

          <h1 className="text-[30px] font-bold text-[#24160E]">
            {" "}
            {themeData?.title || "View Theme"}
          </h1>
        </div>

        {/* Banner */}

        <div className="relative overflow-hidden rounded-2xl h-[360px]">
          <img
            src={themeData?.image || bannerImages[activeImage]}
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
            {(themeData?.gallery_images?.length
              ? themeData.gallery_images
              : bannerImages
            ).map((_, index) => (
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
            {Object.values(themeData?.theme_items || {}).flat().length}
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

                  <div>
                    <p className="text-[15px] text-[#2C1810]">
                      {section.title}  : {section.itemsCount} 
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
                          <img
                            src={item.product_details?.ProductImage}
                            alt={item.product_details?.productName}
                            className="w-14 h-14 rounded-lg object-cover border"
                          />

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
