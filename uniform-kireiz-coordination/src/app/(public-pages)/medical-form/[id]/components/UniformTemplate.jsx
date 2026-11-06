'use client'

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { apiGetSimulationOptions } from "@/services/SimulationService";
import { apiGetProductById } from "@/services/ProductService";
import { apiGetHomeData } from "@/services/HomeService";

/*
 * Templates for this industry, from Admin -> Product & Specification -> Template.
 *
 * This section used to render a fixed array of nine cards, every one titled "Item Name"
 * with invented bullet points and three repeating local images, so nothing the admin
 * configured ever reached the storefront.
 *
 * The route is /medical-form/<category id>, and templates are filtered to that category.
 */

/**
 * UniformTemplate Component.
 * Carousel of the templates the admin published for this category.
 *
 * @returns {JSX.Element} Uniform template showcase carousel section.
 */
const UniformTemplate = ({ categoryName: propCategoryName = "" }) => {
    const params = useParams();
    const router = useRouter();
    const categoryId = params?.id;

    const [products, setProducts] = useState([]);
    const [categoryName, setCategoryName] = useState(propCategoryName);
    const [allCategories, setAllCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState("");
    const [categoryPage, setCategoryPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [index, setIndex] = useState(0);
    const [cardsPerView, setCardsPerView] = useState(4);

    const CATEGORIES_PER_VIEW = 4;

    useEffect(() => {
        if (propCategoryName) {
            setCategoryName(propCategoryName);
        }
    }, [propCategoryName]);

    // Fetch all categories once to display other categories horizontally
    useEffect(() => {
        let cancelled = false;
        const fetchCategories = async () => {
            try {
                const res = await apiGetHomeData();
                if (!cancelled && res?.status) {
                    setAllCategories(res.data?.categories || []);
                }
            } catch (err) {
                console.error("Failed to load categories for products:", err);
            }
        };
        fetchCategories();
        return () => {
            cancelled = true;
        };
    }, []);

    // Filter out the present category of this page so only "other" categories show
    const otherCategories = useMemo(() => {
        if (!allCategories || allCategories.length === 0) return [];
        return allCategories
            .filter((cat) => cat.isActive !== false && !cat.isDeleted)
            .filter((cat) => {
                const isCurrentId = categoryId && String(cat.id) === String(categoryId);
                const isCurrentName =
                    categoryName &&
                    cat.categoryName &&
                    cat.categoryName.trim().toLowerCase() === categoryName.trim().toLowerCase();
                return !isCurrentId && !isCurrentName;
            });
    }, [allCategories, categoryId, categoryName]);

    const activeCategoryId = selectedCategoryId || categoryId;

    const totalCategoryPages = Math.ceil(otherCategories.length / CATEGORIES_PER_VIEW);
    const showCategoryArrows = totalCategoryPages > 1;

    const visibleCategories = useMemo(() => {
        const start = categoryPage * CATEGORIES_PER_VIEW;
        return otherCategories.slice(start, start + CATEGORIES_PER_VIEW);
    }, [otherCategories, categoryPage]);

    const handlePrevCategoryPage = () => {
        setCategoryPage((prev) => Math.max(0, prev - 1));
    };

    const handleNextCategoryPage = () => {
        setCategoryPage((prev) => Math.min(totalCategoryPages - 1, prev + 1));
    };

    useEffect(() => {
        setCategoryPage(0);
    }, [categoryId, otherCategories.length]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!activeCategoryId) return;
            try {
                setLoading(true);
                setIndex(0);
                let prods = [];
                try {
                    const simRes = await apiGetSimulationOptions({ categoryId: activeCategoryId });
                    if (simRes?.status && simRes.data?.products?.length > 0) {
                        prods = simRes.data.products;
                    }
                } catch (e) {
                    console.error("Simulation options error:", e);
                }

                if (prods.length === 0) {
                    try {
                        const globalRes = await apiGetSimulationOptions();
                        if (globalRes?.status && globalRes.data?.products?.length > 0) {
                            prods = globalRes.data.products.filter(
                                (p) =>
                                    String(p.category_id) === String(activeCategoryId) ||
                                    (selectedCategoryName && p.category && p.category.toLowerCase() === selectedCategoryName.toLowerCase()) ||
                                    (categoryName && p.category && p.category.toLowerCase() === categoryName.toLowerCase())
                            );
                        }
                    } catch (e) {
                        console.error("Global simulation options error:", e);
                    }
                }

                if (prods.length === 0) {
                    try {
                        const pRes = await apiGetProductById({ category_id: activeCategoryId, categoryId: activeCategoryId });
                        if (pRes?.status && pRes.data?.length > 0) {
                            prods = pRes.data;
                        }
                    } catch (e) {
                        console.error("Product list error:", e);
                    }
                }

                if (cancelled) return;
                setProducts(prods);
            } catch (err) {
                console.error("Failed to load products:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [activeCategoryId, categoryId, selectedCategoryId, selectedCategoryName, categoryName]);

    useEffect(() => {
        /** Updates carousel card counts per view based on viewport width breakpoints */
        const updateCards = () => {
            if (window.innerWidth < 768) setCardsPerView(1);
            else if (window.innerWidth < 1024) setCardsPerView(2);
            else if (window.innerWidth < 1440) setCardsPerView(3);
            else setCardsPerView(4);
        };

        updateCards();
        window.addEventListener("resize", updateCards);
        return () => window.removeEventListener("resize", updateCards);
    }, []);

    const isPrevDisabled = index === 0;
    const isNextDisabled = index + cardsPerView >= products.length;

    /** Advances carousel slider forward by cardsPerView */
    const handleNext = () => {
        if (index + cardsPerView < products.length) {
            setIndex((prev) => prev + cardsPerView);
        }
    };

    /** Rewinds carousel slider backward by cardsPerView */
    const handlePrev = () => {
        if (index - cardsPerView >= 0) {
            setIndex((prev) => prev - cardsPerView);
        } else {
            setIndex(0);
        }
    };

    // Arrows are pointless when everything already fits on screen.
    const showArrows = products.length > cardsPerView;

    /**
     * Navigates to 3D uniform design page with product ID and category_id.
     */
    const handleCustomize = (item) => {
        const catId =
            item?.category_id ||
            (typeof item?.category === 'object' ? item.category?.id : null) ||
            selectedCategoryId ||
            categoryId ||
            11;
        router.push(`/dashboards/uniform-3d-design/${item.id}?category_id=${catId}`);
    };

    const handleCategoryClick = (cat) => {
        if (String(selectedCategoryId) === String(cat.id)) {
            // Toggle off -> returns to present category
            setSelectedCategoryId(null);
            setSelectedCategoryName("");
        } else {
            setSelectedCategoryId(cat.id);
            setSelectedCategoryName(cat.categoryName || "");
        }
    };

    const handleResetToPresentCategory = () => {
        setSelectedCategoryId(null);
        setSelectedCategoryName("");
    };

    const displayCategoryName = categoryName || propCategoryName || "Medical Uniform";

    return (
        <section className="w-full bg-white px-5 md:px-8 lg:px-12">
            <div className="mt-10">

                {/* HEADER */}
                <div className="text-center mb-8">
                    <span className="inline-block bg-[#EAF2FF] text-[#1C4FA8] text-xs font-semibold uppercase px-4 py-1.5 rounded-full mb-3 tracking-wide">
                        PRE-DEFINED COORDINATION
                    </span>
                    <h2 className="text-[#1C2C56] md:text-3xl text-2xl font-bold">
                        Industry Product Suggestions
                    </h2>
                    <p className="text-[#6B7280] text-sm md:text-base mt-2">
                        Curated complete uniform products designed for {selectedCategoryName || displayCategoryName}.
                    </p>
                    <div className="w-[160px] md:w-[220px] h-[3px] bg-[#87CEEB] mx-auto mt-3 rounded-full" />
                </div>

                {/* HORIZONTAL CATEGORIES BAR WITH FIXED POSITION ARROWS */}
                {otherCategories.length > 0 && (
                    <div className="relative w-full max-w-4xl mx-auto mb-8 flex items-center justify-center px-12">
                        {showCategoryArrows && (
                            <button
                                type="button"
                                onClick={handlePrevCategoryPage}
                                disabled={categoryPage === 0}
                                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[#1C2C56] transition hover:bg-[#F1F5F9] hover:border-[#1C4FA8] ${categoryPage === 0
                                        ? "opacity-30 cursor-not-allowed"
                                        : "cursor-pointer hover:shadow-xs"
                                    }`}
                                aria-label="Previous categories"
                            >
                                <FiChevronLeft size={18} />
                            </button>
                        )}

                        <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 max-w-full">
                            {selectedCategoryId && (
                                <button
                                    type="button"
                                    onClick={handleResetToPresentCategory}
                                    className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border border-[#1C4FA8] bg-[#F0F5FF] text-[#1C4FA8] hover:bg-[#E1EDFF] transition flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
                                    title={`Return to ${displayCategoryName}`}
                                >
                                    <span className="text-xs">✕</span>
                                    <span>Back to {displayCategoryName}</span>
                                </button>
                            )}

                            {visibleCategories.map((cat) => {
                                const isSelected = String(selectedCategoryId) === String(cat.id);
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleCategoryClick(cat)}
                                        className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap transition-all duration-200 cursor-pointer ${isSelected
                                                ? "bg-[#1C4FA8] text-white border-[#1C4FA8] shadow-xs"
                                                : "border-[#CBD5E1] text-[#486284] hover:border-[#1C4FA8] bg-white"
                                            }`}
                                    >
                                        {cat.categoryName}
                                    </button>
                                );
                            })}
                        </div>

                        {showCategoryArrows && (
                            <button
                                type="button"
                                onClick={handleNextCategoryPage}
                                disabled={categoryPage >= totalCategoryPages - 1}
                                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[#1C2C56] transition hover:bg-[#F1F5F9] hover:border-[#1C4FA8] ${categoryPage >= totalCategoryPages - 1
                                        ? "opacity-30 cursor-not-allowed"
                                        : "cursor-pointer hover:shadow-xs"
                                    }`}
                                aria-label="Next categories"
                            >
                                <FiChevronRight size={18} />
                            </button>
                        )}
                    </div>
                )}

                {/* NAV */}
                {showArrows && (
                    <div className="flex justify-end gap-3 mb-6 mr-6">
                        <FiArrowLeft
                            onClick={!isPrevDisabled ? handlePrev : undefined}
                            size={25}
                            className={`transition ${isPrevDisabled
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:text-black cursor-pointer"
                                }`}
                        />
                        <FiArrowRight
                            onClick={!isNextDisabled ? handleNext : undefined}
                            size={25}
                            className={`ml-8 transition ${isNextDisabled
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:text-black cursor-pointer"
                                }`}
                        />
                    </div>
                )}

                {loading && (
                    <div className="ml-6 mr-6 pb-12 grid gap-6"
                        style={{ gridTemplateColumns: `repeat(${cardsPerView}, minmax(0, 1fr))` }}>
                        {Array.from({ length: cardsPerView }).map((_, i) => (
                            <div key={i} className="border border-[#E3E8F1] rounded-[18px] h-[380px] animate-pulse bg-[#F7FBFF]" />
                        ))}
                    </div>
                )}

                {!loading && products.length === 0 && (
                    <div className="ml-6 mr-6 pb-12">
                        <div className="border border-dashed border-[#CBD5E1] rounded-[18px] py-16 text-center">
                            <p className="text-base font-medium text-[#1C2C56]">
                                No products published for this category yet
                            </p>
                            <p className="text-sm text-[#6B7280] mt-1">
                                Please check back soon.
                            </p>
                        </div>
                    </div>
                )}

                {/* CARDS */}
                {!loading && products.length > 0 && (
                    <div className="overflow-hidden ml-6 mr-6 pb-12">
                        <div
                            className="grid gap-6 transition-all duration-500"
                            style={{
                                gridTemplateColumns: `repeat(${cardsPerView}, minmax(0, 1fr))`,
                            }}
                        >
                            {products
                                .slice(index, index + cardsPerView)
                                .map((item) => (
                                    <div
                                        key={item.id}
                                        className="
                                        bg-white
                                        border border-[#E3E8F1]
                                        rounded-[18px]
                                        shadow-sm
                                        flex flex-col
                                        overflow-hidden
                                    "
                                    >
                                        <div className="relative w-full h-[220px] overflow-hidden rounded-t-[18px] bg-[#F7FBFF] flex items-center justify-center">
                                            <Image
                                                src={item.image || item.product_image || item.productImage || "/img/uniform/uniform.png"}
                                                alt={item.name || item.product_name || "Uniform Product"}
                                                fill
                                                className="object-contain p-3"
                                                unoptimized
                                            />
                                        </div>

                                        <div className="p-4 space-y-3 flex flex-col flex-1 justify-between">
                                            <div>
                                                <h3 className="text-[#1C2C56] font-semibold text-base truncate" title={item.name || item.product_name}>
                                                    {item.name || item.product_name}
                                                </h3>
                                                <p className="text-xs text-[#6B7280] truncate mt-1">
                                                    {item.category || (typeof item.category === 'object' ? item.category?.categoryName : '') || displayCategoryName || "—"}
                                                    {item.subcategory ? ` • ${typeof item.subcategory === 'object' ? item.subcategory?.name : item.subcategory}` : ""}
                                                </p>

                                                {item.specifications?.length > 0 && (
                                                    <ul className="text-[#6B7280] text-sm space-y-1 mt-2">
                                                        {item.specifications.map((p, idx) => (
                                                            <li key={idx}>• {p}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleCustomize(item)}
                                                title={`Customize ${item.name || item.product_name || 'this'}`}
                                                className="w-full mt-auto py-2 rounded-md text-sm font-medium bg-[#1C4FA8] text-white hover:bg-[#17418c] transition cursor-pointer"
                                            >
                                                Customize this
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

            </div>
        </section>
    );
};

export default UniformTemplate;
