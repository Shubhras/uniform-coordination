import React, { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { FaRegHeart } from "react-icons/fa6"
import { useRouter } from "next/navigation"

const TABS = ["By Category", "By Color", "By Material", "By Function"]

const CATEGORIES = [
    "Tablecloths & Runners",
    "Chair Covers",
    "Napkins & Linens",
    "Centerpieces",
    "Tableware",
]

const MATERIALS = ["Polyester 100%", "Poly/Cotton Blend", "Cotton 100%", "Linen", "Velvet"]
const FUNCTIONS = ["Cooperate", "Weeding", "Party", "Seasonal", "Outdoor", "Indoor"]

const COLORS = [
    { name: "Red", class: "bg-red-600" },
    { name: "Blue", class: "bg-blue-600" },
    { name: "Green", class: "bg-green-600" },
    { name: "Grey", class: "bg-gray-400" },
    { name: "White", class: "bg-white border" },
    { name: "Black", class: "bg-black" },
    { name: "Ivory", class: "bg-[#F8F5E8]" },
    { name: "Silver", class: "bg-gray-300" },
    { name: "Pink", class: "bg-pink-500" },
    { name: "Purple", class: "bg-purple-600" },
    { name: "Orange", class: "bg-orange-500" },
    { name: "Gold", class: "bg-yellow-600" },
]

const PRODUCTS = [
    { img: "/img/table-form/tables/table1.png", title: "Tablecloth", color: "Red" },
    { img: "/img/table-form/tables/table2.png", title: "Napkin", color: "Ivory" },
    { img: "/img/table-form/tables/table3.png", title: "Tablecloth", color: "Red" },
    { img: "/img/table-form/tables/table4.png", title: "Tablecloth", color: "Red" },
    { img: "/img/table-form/tables/table5.png", title: "Napkin", color: "Ivory" },
    { img: "/img/table-form/tables/table6.png", title: "Tablecloth", color: "Red" },
]

const Cards = () => {
    const [selectedColor, setSelectedColor] = useState(null)
    const [activeTab, setActiveTab] = useState("")
    const router = useRouter()
    const filterRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setActiveTab("")
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <section className="w-full bg-[#fffdfb] px-4 sm:px-6 md:px-8 lg:px-12">
            {/* FILTER BAR */}
            <div
                ref={filterRef}
                className="flex flex-wrap gap-2 sm:gap-3 items-center pt-6 relative"
            >
                <h4 className="text-sm font-medium whitespace-nowrap">Filters :</h4>

                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 sm:px-5 py-2 rounded-full font-medium text-xs sm:text-sm transition whitespace-nowrap
                            ${activeTab === tab
                                ? "bg-[#A0614D] text-white shadow"
                                : "text-[#6B7280] hover:bg-[#ead7c5]"
                            }`}
                    >
                        {tab}
                    </button>
                ))}

                {/* BY CATEGORY */}
                {activeTab === "By Category" && (
                    <div className="absolute top-14 sm:top-16 left-0 w-full max-h-[60vh] overflow-y-auto bg-[#FAF6F4] shadow-lg rounded-lg px-4 py-6 z-20 border border-[#A0522D]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {CATEGORIES.map(cat => (
                                <label key={cat} className="flex items-center gap-2 text-sm">
                                    <input type="radio" name="category" className="accent-[#A0614D]" />
                                    {cat}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* BY COLOR */}
                {activeTab === "By Color" && (
                    <div className="absolute top-14 sm:top-16 left-0 w-full max-h-[60vh] overflow-y-auto bg-[#FAF6F4] shadow-lg rounded-lg px-4 py-6 z-20 border border-[#A0522D]">
                        <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                            {COLORS.map(c => (
                                <label key={c.name} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="color"
                                        value={c.name}
                                        checked={selectedColor === c.name}
                                        onChange={() => setSelectedColor(c.name)}
                                        className="sr-only"
                                    />
                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#575757] flex items-center justify-center ${c.class}`}>
                                        {selectedColor === c.name && (
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* BY MATERIAL */}
                {activeTab === "By Material" && (
                    <div className="absolute top-14 sm:top-16 left-0 w-full max-h-[60vh] overflow-y-auto bg-[#FAF6F4] shadow-lg rounded-lg px-4 py-6 z-20 border border-[#A0522D]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {MATERIALS.map(mat => (
                                <label key={mat} className="flex items-center gap-2 text-sm">
                                    <input type="radio" name="material" className="accent-[#A0614D]" />
                                    {mat}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* BY FUNCTION */}
                {activeTab === "By Function" && (
                    <div className="absolute top-14 sm:top-16 left-0 w-full max-h-[60vh] overflow-y-auto bg-[#FAF6F4] shadow-lg rounded-lg px-4 py-6 z-20 border border-[#A0522D]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {FUNCTIONS.map(fun => (
                                <label key={fun} className="flex items-center gap-2 text-sm">
                                    <input type="radio" name="function" className="accent-[#A0614D]" />
                                    {fun}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="my-8 border-t-2 border-[#E5D5C8]" />

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-5">
                {PRODUCTS.map((item, i) => (
                    <div
                        key={i}
                        className="group bg-[#EDEDED] border border-[#A0522D4F] rounded-br-4xl overflow-hidden shadow-lg hover:shadow-xl transition"
                    >
                        <div className="relative h-[220px] sm:h-[260px] lg:h-[300px] overflow-hidden">
                            <Image
                                src={item.img}
                                alt={item.title}
                                fill
                                className="object-cover p-8 sm:p-10"
                            />
                        </div>

                        <div className="p-4 bg-white">
                            <h3 className="font-semibold text-lg text-[#3B3B3B]">{item.title}</h3>
                            <p className="text-sm text-[#6B5D57] mb-6">
                                Color : {item.color}
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    className="flex-1 py-2 text-sm bg-[#A0614D] text-white rounded-lg"
                                    onClick={() => router.push("/dashboards/uniform-3d-design")}
                                >
                                    Preview in Canvas
                                </button>
                                <FaRegHeart size={20} className="text-black" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Cards
