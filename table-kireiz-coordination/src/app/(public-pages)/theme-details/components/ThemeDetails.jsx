'use client'
import React, { useRef, useState } from "react";
import { AiOutlineExpand } from "react-icons/ai";
import { CiCircleInfo, CiDeliveryTruck } from "react-icons/ci";
import { FiChevronLeft, FiChevronDown, FiBox } from "react-icons/fi";

const themeItems = [
    {
        title: "Table Setup",
        items: [
            { name: "Round Table", qty: "x10" },
            { name: "Ivory Tablecloth", qty: "x10" },
            { name: "Gold Charger Plates", qty: "x80" },
            { name: "White Dinner Plates", qty: "x80" },
            { name: "Crystal Glassware", qty: "x80" },
            { name: "Cloth Napkins (Ivory)", qty: "x80" },
        ],
    },
    {
        title: "Floral & Decor",
        items: [
            { name: "Centerpiece: Soft Rose Arrangement", qty: "x10" },
            { name: "Candle Stands (Gold)", qty: "x20" },
            { name: "Table Numbers (Acrylic)", qty: "x10" },
        ],
    },
    {
        title: "Seating",
        items: [
            { name: "Chiavari Chairs (Gold)", qty: "x80" },
            { name: "White Chair Cushions", qty: "x80" },
        ],
    },
    {
        title: "Additional Elements",
        items: [
            { name: "Welcome Sign", qty: "x1" },
            { name: "Menu Cards", qty: "x80" },
            { name: "Place Cards", qty: "x80" },
        ],
    },
];

const ThemeDetails = () => {
    const images = [
        "/img/table-form/themes/theme3.png",
        "/img/table-form/themes/theme3.png",
        "/img/table-form/themes/theme3.png",
    ];
    const scrollRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [open, setOpen] = useState(false);
    const [openSections, setOpenSections] = useState([]);

    const toggleSection = (index) => {
        setOpenSections((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
    };


    const scrollToIndex = (index) => {
        if (!scrollRef.current) return;
        const width = scrollRef.current.offsetWidth;
        scrollRef.current.scrollTo({
            left: index * width,
            behavior: "smooth",
        });
        setActiveIndex(index);
    };

    const handleScroll = () => {
        const el = scrollRef.current;
        const index = Math.round(el.scrollLeft / el.offsetWidth);
        setActiveIndex(index);
    };
    return (
        <section className="w-full px-10 py-8 mt-14">
            {/* HEADER */}
            <div className="flex items-start mb-6 gap-8">
                <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 text-[#7B3C1D] font-bold text-5xl">
                        <FiChevronLeft size={30} />
                        <span>Romantic Wedding</span>
                    </div>
                    <p className="text-sm text-[#8B5A3C] mt-2 pl-10">
                        Elegant whites, ivories, and delicate floral accents
                    </p>
                </div>

                <div className="flex gap-3">
                    <button className="w-auto min-w-max whitespace-nowrap text-base px-4 py-2 rounded-md border border-[#7B3C1D33] text-[#7B3C1D] font-medium">
                        Back to Theme
                    </button>

                    <button className="w-auto min-w-max whitespace-nowrap text-base px-4 py-2 rounded-md bg-[#7B3C1D] text-white font-medium">
                        Customize in Canvas
                    </button>
                </div>

            </div>


            {/* MAIN GRID */}
            <div className="flex items-start gap-8">
                {/* LEFT CONTENT */}
                <div className="w-[70%] space-y-6">
                    <div className="relative rounded-xl overflow-hidden shadow">
                        {/* SCROLLABLE IMAGES */}
                        <div
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
                        >
                            {images.map((img, i) => (
                                <img
                                    key={i}
                                    src={img}
                                    alt="Theme Preview"
                                    onClick={() => setOpen(true)}
                                    className="w-full h-[500px] object-cover flex-shrink-0 snap-center cursor-pointer"
                                />
                            ))}
                        </div>

                        {/* PRESET LOOK */}
                        <span className="absolute top-4 left-4 bg-white text-[#7B3C1D] text-xs px-4 py-1 rounded-full shadow">
                            Preset Look
                        </span>

                        {/* EXPAND ICON */}
                        <button
                            onClick={() => setOpen(true)}
                            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-md hover:bg-black/70"
                        >
                            <AiOutlineExpand size={18} />
                        </button>

                        {/* DOTS */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, i) => (
                                <span
                                    key={i}
                                    onClick={() => scrollToIndex(i)}
                                    className={`w-2 h-2 rounded-full transition ${activeIndex === i ? "bg-white" : "bg-white/50"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* FULL SCREEN MODAL */}
                    {open && (
                        <div
                            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
                            onClick={() => setOpen(false)}
                        >
                            <img
                                src={images[activeIndex]}
                                className="max-w-[90%] max-h-[90%] rounded-lg"
                            />
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[#7B3C1D] font-semibold">
                                Items Included in This Theme
                            </h3>
                            <span className="text-xs text-[#8B5A3C] px-2 py-1 shadow-sm rounded-full">
                                14 items total
                            </span>
                        </div>

                        <div className="space-y-4">
                            {themeItems.map((section, index) => {
                                const isOpen = openSections.includes(index);

                                return (
                                    <div
                                        key={index}
                                        className="bg-[#00000008] border border-[#DCCBC1] rounded-xl overflow-hidden"
                                    >
                                        {/* HEADER */}
                                        <button
                                            onClick={() => toggleSection(index)}
                                            className="w-full flex items-center justify-between p-5"
                                        >
                                            <div className="flex items-center gap-3 text-[#7B3C1D] font-medium">
                                                <FiBox size={18} />
                                                {section.title}
                                            </div>

                                            <FiChevronDown
                                                size={20}
                                                className={`text-[#7B3C1D] transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </button>

                                        {/* CONTENT */}
                                        <div
                                            className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                                                }`}
                                        >
                                            <div className="px-5 py-5 bg-white">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {section.items.map((item, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center gap-4 border border-[#DCCBC1] rounded-lg p-4"
                                                        >
                                                            <div className="w-10 h-10 rounded bg-[#E8DDD7]" />
                                                            <div>
                                                                <p className="text-sm font-medium text-[#2C1810]">{item.name}</p>
                                                                <p className="text-xs text-[#8B5A3C]">{item.qty}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>


                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className=" w-[30%] bg-[#EFE7E3] rounded-xl h-fit border border-[#E1E1E1] overflow-hidden">
                    <h4 className=" text-center text-lg font-medium text-gray-700 p-6">
                        Estimated Package Value
                    </h4>

                    <div className="bg-white p-6 space-y-4 ">
                        <h5 className="text-center text-[#7B3C1D] font-semibold text-2xl">
                            Price
                        </h5>

                        <div className="bg-[#FBF9F7] p-4 text-xs text-gray-600 flex gap-2 font-medium">
                            <span className="text-[#7B3C1D]"><CiCircleInfo size={20} /></span>
                            Final pricing varies based on your customization choices in the Canvas.
                        </div>

                        <div className="text-xs text-gray-600 flex gap-2 p-4">
                            <span className="text-[#7B3C1D]"><CiDeliveryTruck size={20} />
                            </span>
                            Delivery & Setup<br />
                            Professional setup included within 25 miles.
                        </div>
                    </div>
                </div>
            </div>
            {/* ITEMS INCLUDED */}

        </section>
    );
};

export default ThemeDetails;
