import React, { useState } from 'react'
import Image from "next/image";
import { FaRegHeart } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';

const ThemeCards = () => {
    const [activeFilter, setActiveFilter] = useState("All");
    const router = useRouter();
    const filters = ["All", "Wedding", "Corporate", "Parties", "Seasonal"];

    const bottomCards = [
        {
            img: "/img/table-form/themes/theme1.png",
            title: "Warm Elegance",
            desc: "Romantic whites and ivories for your special day",
            category: "Wedding",
        },
        {
            img: "/img/table-form/themes/theme2.png",
            title: "Olive Chic",
            desc: "Modern natural tones with sophisticated greenery",
            category: "Parties",
        },
        {
            img: "/img/table-form/themes/theme3.png",
            title: "Classy Corporate",
            desc: "Modern natural tones with sophisticated greenery",
            category: "Corporate",
        }, {
            img: "/img/table-form/themes/theme1.png",
            title: "Warm Elegance",
            desc: "Romantic whites and ivories for your special day",
            category: "Corporate",
        },
        {
            img: "/img/table-form/themes/theme2.png",
            title: "Olive Chic",
            desc: "Modern natural tones with sophisticated greenery",
            category: "Seasonal",
        },
        {
            img: "/img/table-form/themes/theme3.png",
            title: "Classy Corporate",
            desc: "Modern natural tones with sophisticated greenery",
            category: "Wedding",
        }, {
            img: "/img/table-form/themes/theme1.png",
            title: "Warm Elegance",
            desc: "Romantic whites and ivories for your special day",
            category: "Wedding",
        },
        {
            img: "/img/table-form/themes/theme2.png",
            title: "Olive Chic",
            desc: "Modern natural tones with sophisticated greenery",
            category: "Seasonal",
        },
    ];

    const handleCustomizeClick = () => {
        router.push("/dashboards/uniform-3d-design")
    }
    const filteredCards =
        activeFilter === "All"
            ? bottomCards
            : bottomCards.filter(card => card.category === activeFilter);

    return (
        <section className="w-full bg-[#fffdfb] px-4 sm:px-6 md:px-8 lg:px-12">

            {/* ================= FILTER SECTION ================= */}
            <div className="flex gap-3 flex-wrap items-center pt-6">
                <h4 className='text-sm font-medium'>Filters :</h4>
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`
                            px-5 py-2
                            rounded-full
                            text-sm font-medium
                            transition
                            ${activeFilter === filter
                                ? "bg-[#A0614D] text-white shadow"
                                : " text-[#6B7280] hover:bg-[#ead7c5]"
                            }
                        `}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* ================= DIVIDER ================= */}
            <div className="my-8 border-t-2 border-[#E5D5C8]" />

            {/* ================= CARDS ================= */}
            <div className="overflow-hidden pb-12">
                <div className="grid gap-6 transition-transform duration-500 ease-in-out grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredCards.map((item, i) => (
                        <div
                            key={i}
                            className="
                            group
                                relative
                                overflow-hidden
                                shadow-md
                                cursor-pointer
                                w-full
                                p-3
                                rounded-tl-4xl rounded-br-4xl
                                bg-[#F5E9DB]
                                border
                                border-[#D4A6A6]
                                hover:border-[#A0522D]
                                transition
                            "
                        >
                            {/* IMAGE */}
                            <div className="relative w-full h-[300px] overflow-hidden rounded-tl-4xl rounded-br-4xl">
                                <Image
                                    src={item.img}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
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
                                        onClick={handleCustomizeClick}
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
                                <p className="text-[#6B7280] text-[14px] mt-2 leading-tight">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </section>
    )
}

export default ThemeCards

