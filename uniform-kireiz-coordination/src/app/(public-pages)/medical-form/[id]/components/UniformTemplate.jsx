'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { apiGetTemplateByCategory } from "@/services/CategoryService";

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
const UniformTemplate = () => {
    const params = useParams();
    const router = useRouter();
    const categoryId = params?.id;

    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [index, setIndex] = useState(0);
    const [cardsPerView, setCardsPerView] = useState(4);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!categoryId) return;
            try {
                setLoading(true);
                const res = await apiGetTemplateByCategory(categoryId);
                if (cancelled) return;
                if (res?.status) setTemplates(res.data || []);
            } catch (err) {
                console.error("Failed to load templates:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [categoryId]);

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

    /** Advances carousel slider forward */
    const handleNext = () => {
        setIndex((prev) => (prev + 1) % Math.max(templates.length, 1));
    };

    /** Rewinds carousel slider backward */
    const handlePrev = () => {
        setIndex((prev) => (prev === 0 ? Math.max(templates.length - 1, 0) : prev - 1));
    };

    // Arrows are pointless when everything already fits on screen.
    const showArrows = templates.length > cardsPerView;

    /**
     * Applies the template: the shopper next picks which uniform in this category to put
     * the style on. A template is a style, not a garment, so it does not name a product
     * itself — every product in the category can carry it.
     */
    const useTemplate = (item) => {
        // router.push(
        //     `/dashboards/uniform-3d-design?category=${categoryId}&template=${item.id}`,
        // );
        router.push(`/dashboards/uniform-3d-design`,);
    };

    return (
        <section className="w-full bg-white px-5 md:px-8 lg:px-12">
            <div className="mt-10">

                {/* HEADER */}
                <div className="text-center mb-10">
                    <div className="inline-flex flex-col items-end">
                        <h2 className="text-[#1C2C56] md:text-3xl text-2xl font-semibold">
                            Popular Medical Uniform Templates
                        </h2>
                        <div className="w-[180px] md:w-[270px] h-[3px] bg-[#87CEEB] mt-2" />
                    </div>
                    <p className="text-[#6B7280] text-sm mt-4 max-w-xl mx-auto">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                        eiusmod tempor incididunt ut labore et
                    </p>
                </div>

                {/* NAV */}
                {showArrows && (
                    <div className="flex justify-end gap-3 mb-6 mr-6">
                        <FiArrowLeft onClick={handlePrev} size={25} className="text-lg text-gray-600 cursor-pointer" />
                        <FiArrowRight onClick={handleNext} size={25} className="text-lg text-gray-600 ml-8 cursor-pointer" />
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

                {!loading && templates.length === 0 && (
                    <div className="ml-6 mr-6 pb-12">
                        <div className="border border-dashed border-[#CBD5E1] rounded-[18px] py-16 text-center">
                            <p className="text-base font-medium text-[#1C2C56]">
                                No templates published for this category yet
                            </p>
                            <p className="text-sm text-[#6B7280] mt-1">
                                Please check back soon.
                            </p>
                        </div>
                    </div>
                )}

                {/* CARDS */}
                {!loading && templates.length > 0 && (
                    <div className="overflow-hidden ml-6 mr-6 pb-12">
                        <div
                            className="grid gap-6 transition-all duration-500"
                            style={{
                                gridTemplateColumns: `repeat(${cardsPerView}, minmax(0, 1fr))`,
                            }}
                        >
                            {templates
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
                                    "
                                    >
                                        <div className="relative w-full h-[220px] overflow-hidden rounded-t-[18px] bg-[#F7FBFF]">
                                            {item.templateImage && (
                                                <Image
                                                    src={item.templateImage}
                                                    alt={item.templateName}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            )}
                                        </div>

                                        <div className="p-4 space-y-3 flex flex-col flex-1">
                                            <h3 className="text-[#1C2C56] font-semibold">
                                                {item.templateName}
                                            </h3>

                                            {/* Only what the admin actually entered — no filler bullets. */}
                                            {item.specifications?.length > 0 && (
                                                <ul className="text-[#6B7280] text-sm space-y-1">
                                                    {item.specifications.map((p, idx) => (
                                                        <li key={idx}>• {p}</li>
                                                    ))}
                                                </ul>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => useTemplate(item)}
                                                title={`Pick a uniform to apply ${item.templateName} to`}
                                                className="w-full mt-auto py-2 rounded-md text-sm font-medium bg-[#1C4FA8] text-white hover:bg-[#17418c] transition"
                                            >
                                                Use Template
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
