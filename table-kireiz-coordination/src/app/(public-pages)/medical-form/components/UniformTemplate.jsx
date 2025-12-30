'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
const bottomCards = [
    {
        img: "/img/medical-form/uniform-template/template1.png",
        title: "Item Name",
        points: [
            "Double-Breasted Jacket + Check Pants",
            "White + Black Check",
            "Premium Cotton Blend",
            "Executive Style",
        ],
    },
    {
        img: "/img/medical-form/uniform-template/template3.png",
        title: "Item Name",
        points: [
            "Classic Jacket + Striped Pants",
            "White + Black Stripes",
            "Breathable Fabric",
            "Traditional Look",
        ],
    }, {
        img: "/img/medical-form/uniform-template/template1.png",
        title: "Item Name",
        points: [
            "Double-Breasted Jacket + Check Pants",
            "White + Black Check",
            "Premium Cotton Blend",
            "Executive Style",
        ],
    },
    {
        img: "/img/medical-form/uniform-template/template2.png",
        title: "Item Name",
        points: [
            "Euro-Cut Jacket + Solid Pants",
            "Black + Black Combo",
            "Poly-Cotton Blend",
            "Modern Fit",
        ],
    },
    {
        img: "/img/medical-form/uniform-template/template3.png",
        title: "Item Name",
        points: [
            "Classic Jacket + Striped Pants",
            "White + Black Stripes",
            "Breathable Fabric",
            "Traditional Look",
        ],
    }, {
        img: "/img/medical-form/uniform-template/template1.png",
        title: "Item Name",
        points: [
            "Double-Breasted Jacket + Check Pants",
            "White + Black Check",
            "Premium Cotton Blend",
            "Executive Style",
        ],
    },
    {
        img: "/img/medical-form/uniform-template/template2.png",
        title: "Item Name",
        points: [
            "Euro-Cut Jacket + Solid Pants",
            "Black + Black Combo",
            "Poly-Cotton Blend",
            "Modern Fit",
        ],
    },
    {
        img: "/img/medical-form/uniform-template/template3.png",
        title: "Item Name",
        points: [
            "Classic Jacket + Striped Pants",
            "White + Black Stripes",
            "Breathable Fabric",
            "Traditional Look",
        ],
    }, {
        img: "/img/medical-form/uniform-template/template3.png",
        title: "Item Name",
        points: [
            "Classic Jacket + Striped Pants",
            "White + Black Stripes",
            "Breathable Fabric",
            "Traditional Look",
        ],
    },
];

const UniformTemplate = () => {

    const [index, setIndex] = useState(0);
    const [cardsPerView, setCardsPerView] = useState(4);

    useEffect(() => {
        const updateCards = () => {
            // if (window.innerWidth < 640) setCardsPerView(1);
            // else
            if (window.innerWidth < 768) setCardsPerView(1);
            else if (window.innerWidth < 1024) setCardsPerView(2);
            else if (window.innerWidth < 1440) setCardsPerView(3);
            else setCardsPerView(4);
        };

        updateCards();
        window.addEventListener("resize", updateCards);
        return () => window.removeEventListener("resize", updateCards);
    }, []);


    const handleNext = () => {
        setIndex((prev) => (prev + 1) % bottomCards.length);
    };

    const handlePrev = () => {
        setIndex((prev) => (prev === 0 ? bottomCards.length - 1 : prev - 1));
    };

    return (
        <section className="w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="mt-10">

                {/* HEADER */}
                <div className="text-center mb-10">
                    <h2 className="text-[#1C2C56] lg:text-4xl md:text-3xl text-2xl font-semibold">
                        Popular Medical Uniform Templates
                    </h2>
                    <div className="w-24 h-1 rounded-full bg-[#1C2C56] mx-auto mt-2" />
                    <p className="text-[#6B7280] text-sm mt-4 max-w-xl mx-auto">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                        eiusmod tempor incididunt ut labore et
                    </p>
                </div>

                {/* NAV */}
                <div className="flex justify-end gap-3 mb-6 mr-6">
                    <FiArrowLeft onClick={handlePrev} size={25} className="text-lg text-gray-600 cursor-pointer" />
                    <FiArrowRight onClick={handleNext} size={25} className="text-lg text-gray-600 ml-8 cursor-pointer" />
                </div>

                {/* CARDS */}
                {/* GRID SLIDER */}
                <div className="overflow-hidden ml-6 mr-6 pb-12">
                    <div
                        className="grid gap-6 transition-all duration-500"
                        style={{
                            gridTemplateColumns: `repeat(${cardsPerView}, minmax(0, 1fr))`,
                        }}
                    >
                        {bottomCards
                            .slice(index, index + cardsPerView)
                            .map((item, i) => (
                                <div
                                    key={i}
                                    className="
            bg-white
            border border-[#E3E8F1]
            rounded-[18px]
            shadow-sm
          "
                                >
                                    {/* IMAGE (UNCHANGED) */}
                                    <div className="relative w-full h-[220px] overflow-hidden rounded-t-[18px]">
                                        <Image
                                            src={item.img}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* CONTENT (UNCHANGED) */}
                                    <div className="p-4 space-y-3">
                                        <h3 className="text-[#1C2C56] font-semibold">
                                            {item.title}
                                        </h3>

                                        <ul className="text-[#6B7280] text-sm space-y-1">
                                            {item.points.map((p, idx) => (
                                                <li key={idx}>• {p}</li>
                                            ))}
                                        </ul>

                                        <button className="w-full mt-3 bg-[#1C2C56] text-white py-2 rounded-md text-sm font-medium">
                                            Use Template
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default UniformTemplate;



