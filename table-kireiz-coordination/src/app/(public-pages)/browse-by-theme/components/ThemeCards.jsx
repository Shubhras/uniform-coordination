"use client";

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { FaRegHeart } from 'react-icons/fa6'
import { useRouter } from 'next/navigation'
import { apiGetBrowseByThemeData } from '@/services/HomeService'
import { apiGetCategories } from '@/services/CategoryService'



const ThemeCards = () => {
    const [activeFilter, setActiveFilter] = useState('All')
    const [themeCards, setThemeCards] = useState([])
    const [categoryData, setCategoryData] = useState([])
    const [selectedCategoryId, setSelectedCategoryId] = useState('all')
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchThemes = async () => {
            setLoading(true);
            try {
                const response = await apiGetBrowseByThemeData({
                    search: "",
                    category_id: selectedCategoryId === 'all' ? "" : selectedCategoryId,
                    ordering: "",
                    page: 1,
                    page_size: 10
                });
                if (response && response.results && response.results.status === true && Array.isArray(response.results.data)) {
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
    }, [selectedCategoryId]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiGetCategories({
                    search: "",
                    page: 1,
                    page_size: 100
                });
                if (response && response.status === true && Array.isArray(response.data)) {
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

    const handleCustomizeClick = (themeId) => {
        router.push(`/theme-details?id=${themeId}`)
    }

    const filteredCards = themeCards;

    return (
        <section className="w-full bg-[#fffdfb] px-4 sm:px-6 md:px-8 lg:px-12">

            {/* ================= FILTER SECTION ================= */}
            <div className="flex gap-3 flex-wrap items-center pt-6">
                <h4 className='text-sm font-medium'>Filters :</h4>

                {/* All Button */}
                <button
                    onClick={() => setSelectedCategoryId('all')}
                    className={`
                        px-5 py-2
                        rounded-full
                        text-xs sm:text-sm font-medium
                        transition
                        ${selectedCategoryId === 'all'
                            ? "bg-[#A0614D] text-white shadow"
                            : " text-[#6B7280] hover:bg-[#ead7c5]"
                        }
                    `}
                >
                    All
                </button>

                {/* Category Buttons */}
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
                        {cat.categoryName || cat.title || cat.name || 'Category'}
                    </button>
                ))}
            </div>

            {/* ================= DIVIDER ================= */}
            <div className="my-8 border-t-2 border-[#E5D5C8]" />

            {/* ================= CARDS ================= */}
            <div className="overflow-hidden pb-12">
                {loading ? (
                    <section className="relative w-full bg-[#FBF8F6] mx-auto px-5 md:px-8 lg:px-12 mt-10">
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0522D]"></div>
                        </div>
                    </section>
                ) : (
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
                            {/* IMAGE */}
                            <div className="relative w-full h-[300px] overflow-hidden rounded-tl-4xl rounded-br-4xl">
                                <Image
                                    // src={item.image || item.cardImage || "/img/table-form/themes/theme1.png"}
                                    src="/img/table-form/themes/theme1.png"
                                    alt={item.title || "Theme Image"}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />

                                {/* BUTTON */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%]">
                                    <button
                                        className="
                                            w-full
                                            py-3
                                            border border-white
                                            text-lg
                                            font-medium
                                            text-white
                                            bg-[#A0614D]
                                            rounded-xl
                                        "
                                        onClick={() => handleCustomizeClick(item.id)}
                                    >
                                        View & Customize This Theme
                                    </button>
                                </div>

                                {/* HEART */}
                                <div className="absolute right-3 top-3">
                                    <FaRegHeart
                                        size={20}
                                        className="text-black group-hover:text-white transition"
                                    />
                                </div>
                            </div>

                            {/* TEXT */}
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
    )
}

export default ThemeCards
