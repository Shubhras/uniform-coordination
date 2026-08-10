"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaRegHeart, FaHeart } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { apiGetBrowseByThemeData } from "@/services/HomeService";
import { apiGetCategories } from "@/services/CategoryService";
import { apiToggleThemeFavourite } from "@/services/AuthProfileService";

/**
 * ThemeCards Component
 * 
 * Renders a category-filterable grid of table design themes fetched from the API.
 * Supports category tab filtering, loading indicators, empty states, and navigation to theme details.
 */
const ThemeCards = () => {
  const { data: session } = useSession();
  const [themeCards, setThemeCards] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleToggleFavourite = async (themeId) => {
    if (!session?.accessToken) {
      toast.push(
        <Notification title="Authentication Required" type="warning">
          Please sign in to add themes to your favorites list.
        </Notification>
      );
      router.push("/sign-in");
      return;
    }

    try {
      const response = await apiToggleThemeFavourite(session.accessToken, themeId);
      if (response && response.status === true) {
        setThemeCards(prevThemes =>
          prevThemes.map(t =>
            t.id === themeId
              ? { ...t, is_favourite: response.data.is_favourite }
              : t
          )
        );
        toast.push(
          <Notification title="Success" type="success">
            {response.data.is_favourite ? "Added to favorites." : "Removed from favorites."}
          </Notification>
        );
      }
    } catch (error) {
      console.error("Error toggling theme favorite:", error);
      toast.push(
        <Notification title="Error" type="danger">
          Failed to toggle favorite status.
        </Notification>
      );
    }
  };

  /**
   * Effect hook to fetch themes filtered by the selected category ID.
   */
  useEffect(() => {
    const fetchThemes = async () => {
      setLoading(true);
      try {
        const response = await apiGetBrowseByThemeData({
          search: "",
          category_id: selectedCategoryId === "all" ? "" : selectedCategoryId,
          ordering: "",
          page: 1,
          page_size: 10,
        }, session?.accessToken);
        if (
          response &&
          response.results &&
          response.results.status === true &&
          Array.isArray(response.results.data)
        ) {
          setThemeCards(response.results.data);
        } else {
          setThemeCards([]);
        }
      } catch (error) {
        console.error("Error fetching themes:", error);
        setThemeCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, [selectedCategoryId, session?.accessToken]);

  /**
   * Effect hook to fetch categories list for filter pill buttons.
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiGetCategories({
          search: "",
          page: 1,
          page_size: 100,
        });
        if (
          response &&
          response.status === true &&
          Array.isArray(response.data)
        ) {
          setCategoryData(response.data);
        } else {
          setCategoryData([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoryData([]);
      }
    };

    fetchCategories();
  }, []);

  /**
   * Navigates to the theme detail and customization view.
   * 
   * @param {string|number} themeId - Unique ID of the theme card.
   */
  const handleCustomizeClick = (themeId) => {
    router.push(`/theme-details?id=${themeId}`);
  };

  const filteredCards = themeCards;

  return (
    <section className="w-full bg-[#fffdfb] px-4 sm:px-6 md:px-8 lg:px-12">
      {/* Category Filter Pills */}
      <div className="flex gap-3 flex-wrap items-center pt-6">
        <button
          onClick={() => setSelectedCategoryId("all")}
          className={`
            px-5 py-2
            rounded-full
            text-xs sm:text-sm font-medium
            transition
            ${selectedCategoryId === "all"
              ? "bg-[#A0614D] text-white shadow"
              : " text-[#6B7280] hover:bg-[#ead7c5]"
            }
          `}
        >
          All
        </button>
        {categoryData.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`
              px-5 py-2
              rounded-full
              text-xs sm:text-sm font-medium
              transition
              ${selectedCategoryId === cat.id
                ? "bg-[#A0614D] text-white shadow"
                : " text-[#6B7280] hover:bg-[#ead7c5]"
              }
            `}
          >
            {cat.categoryName || cat.title || cat.name || "Category"}
          </button>
        ))}
      </div>

      <div className="my-8 border-t-2 border-[#E5D5C8]" />

      {/* Theme Cards Grid Section */}
      <div className="overflow-hidden pb-12">
        {loading ? (
          /* Loading State Spinner */
          <section className="relative w-full bg-[#FBF8F6] mx-auto px-5 md:px-8 lg:px-12 mt-10">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0522D]"></div>
            </div>
          </section>
        ) : filteredCards.length === 0 ? (
          /* Empty State Fallback */
          <section className="relative w-full bg-[#FBF8F6] mx-auto px-5 md:px-8 lg:px-12 mt-10 mb-10 rounded-xl">
            <div className="flex flex-col justify-center items-center py-24 text-center">
              <h3 className="text-xl font-semibold text-[#3B3B3B] mb-2">
                No Products Found
              </h3>
            </div>
          </section>
        ) : (
          /* Cards Grid */
          <div className="grid gap-6 transition-transform duration-500 ease-in-out grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCards.map((item) => (
              <div
                key={item.id}
                className="
                  group
                  relative
                  overflow-hidden
                  shadow-md
                  cursor-pointer
                  w-full
                  p-3
                  rounded-tl-4xl rounded-br-4xl
                  bg-[#F5F0EE]
                  border
                  border-transparent
                  hover:border-[#A0522D]
                  transition
                "
              >
                {/* Theme Image */}
                <div className="relative w-full h-[300px] overflow-hidden rounded-tl-4xl rounded-br-4xl">
                  <Image
                    src={item.image || item.cardImage}
                    alt={item.title || "Theme Image"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%]">
                    <button
                      className="
                        w-full
                        py-2
                        border border-white
                        text-[14px]
                        font-medium
                        text-white
                        bg-[#A0614D]
                        rounded-lg
                        hover:bg-[#8B4513] transition
                      "
                      onClick={() => handleCustomizeClick(item.id)}
                    >
                      View & Customize This Theme
                    </button>
                  </div>
                  <div className="absolute right-3 top-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavourite(item.id);
                      }}
                      className="p-1.5 rounded-full bg-white/80 hover:bg-white transition shadow-sm flex items-center justify-center"
                      title={item.is_favourite ? "Remove from favorites" : "Add to favorites"}
                    >
                      {item.is_favourite ? (
                        <FaHeart
                          size={18}
                          className="text-red-500 cursor-pointer"
                        />
                      ) : (
                        <FaRegHeart
                          size={18}
                          className="text-black cursor-pointer hover:text-red-500 transition"
                        />
                      )}
                    </button>
                  </div>
                </div>
                {/* Theme Details */}
                <div className="p-4">
                  <h3 className="text-[#1C2C56] text-[18px] font-semibold">
                    {item.title}
                  </h3>
                  <p className="text-[#6B7280] text-[14px] mt-2 leading-tight line-clamp-2">
                    {item.description || item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ThemeCards;

