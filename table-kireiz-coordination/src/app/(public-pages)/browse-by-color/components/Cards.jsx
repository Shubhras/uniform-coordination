import React, { useState } from "react"
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
const FUNCTIONS = ["Cooperate","Weeding","Party","Seasonal","Outdoor","Indoor"]
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
    {
        img: "/img/table-form/tables/table1.png",
        title: "Tablecloth",
        color: "Red",
    },
    {
        img: "/img/table-form/tables/table2.png",
        title: "Napkin",
        color: "Ivory",
    },
    {
        img: "/img/table-form/tables/table3.png",
        title: "Tablecloth",
        color: "Red",
    },
    {
        img: "/img/table-form/tables/table4.png",
        title: "Tablecloth",
        color: "Red",
    },
    {
        img: "/img/table-form/tables/table5.png",
        title: "Napkin",
        color: "Ivory",
    },
    {
        img: "/img/table-form/tables/table6.png",
        title: "Tablecloth",
        color: "Red",
    },
]


const Cards = () => {
    const [selectedColor, setSelectedColor] = useState(null);
    const [activeTab, setActiveTab] = useState("")
    const router = useRouter();
    return (
        <section className="w-full bg-[#fffdfb] px-4 sm:px-6 md:px-8 lg:px-12">
                    
                    <div className="flex gap-3 flex-wrap items-center pt-6 relative">
                         <h4 className='text-sm font-medium'>Filters :</h4>

                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 rounded-full font-medium text-sm transition
              ${activeTab === tab
                                ? "bg-[#A0614D] text-white shadow"
                                : " text-[#6B7280] hover:bg-[#ead7c5]"
                                    }
            `}
                            >
                                {tab}
                            </button>
                        ))}
                        {activeTab === "By Category" && (
                            <div className="absolute top-16 bg-[#FAF6F4] shadow-lg rounded-lg px-4 py-8 z-10 w-full flex gap-5 items-center border border-[#A0522D]">
                                {CATEGORIES.map(cat => (
                                    <label key={cat} className="flex items-center gap-2 text-sm mb-2">
                                        <input type="radio" name="category" />
                                        {cat}
                                    </label>
                                ))}
                            </div>
                        )}
                        {activeTab === "By Color" && (
                            <div className="absolute top-16 bg-[#FAF6F4] shadow-lg rounded-lg px-4 py-8 z-10 w-full flex gap-5 items-center border border-[#A0522D]">
                                <div className="flex items-center gap-3">
                                {COLORS.map((c) => (
                                    <div
                                    key={c.name}
                                    title={c.name}
                                    onClick={() => setSelectedColor(c.name)}
                                    className={`relative w-9 h-10 rounded-md cursor-pointer border border-[#575757] ${c.class}`}
                                    >
                                    {/* Tick */}
                                    {selectedColor === c.name && (
                                        <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow">
                                        <svg
                                            className="w-3 h-3 text-green-600"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        </div>
                                    )}
                                    </div>
                                ))}
                                </div>
                            </div>
                            )}

                        {activeTab === "By Material" && (
                            <div className="absolute top-16 bg-[#FAF6F4] shadow-lg rounded-lg px-4 py-8 z-10 w-full flex gap-5 items-center border border-[#A0522D]">
                                <div className="flex items-center gap-3">
                                    {MATERIALS.map(mat => (
                                    <label key={mat} className="flex items-center gap-2 text-sm mb-2">
                                        <input type="radio" name="material" />
                                        {mat}
                                    </label>
                                ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "By Function" && (
                            <div className="absolute top-16 bg-[#FAF6F4] shadow-lg rounded-lg px-4 py-8 z-10 w-full flex gap-5 items-center border border-[#A0522D]">
                                <div className="flex items-center gap-3">
                                    {FUNCTIONS.map(fun => (
                                    <label key={fun} className="flex items-center gap-2 text-sm mb-2">
                                        <input type="radio" name="function" />
                                        {fun}
                                    </label>
                                ))}
                                </div>
                            </div>
                        )}
                    </div>

                    

                    <div className="my-8 border-t-2 border-[#E5D5C8]" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                        {PRODUCTS.map((item, i) => (
                            <div
                                key={i}
                                className="
                                    group
                                    bg-[#EDEDED]
                                    border
                                    border-[#A0522D4F]
                                    rounded-br-4xl
                                    overflow-hidden
                                    shadow-lg
                                    hover:shadow-xl
                                    transition
                                "
                            >
                                <div className="relative h-[300px] rounded-lg overflow-hidden ">
                                    <Image
                                        src={item.img}
                                        alt={item.title}
                                        fill
                                        className="object-cover h-48 w-48 p-10"
                                    />
                                </div>

                                <div className="p-4 bg-white">
                                    <h3 className="font-semibold text-xl text-[#3B3B3B]">{item.title}</h3>
                                    <p className="text-sm text-[#6B5D57] mb-10">
                                        Color : {item.color}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <button className="flex-1  py-2 text-sm bg-[#A0614D] text-white rounded-lg" onClick={()=>router.push("/dashboards/uniform-3d-design")}>
                                            Preview in Canvas
                                        </button>
                                        <FaRegHeart
                                            size={20}
                                            className="text-black transition"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
         
        </section>
    )
}

export default Cards


           {/* MAIN GRID */}
            {/* <div className="flex flex-col sm:flex-row gap-8"> */}
                {/* FILTERS */}
                    /* <aside className=" sm:max-w-xs w-full rounded-xl p-5 shadow-xl sm:mt-14">

                        <h1 className="text-xl font-normal mb-3">Filters</h1>

                        <div className="mb-6">
                            <h4 className="font-semibold text-sm mb-3">By Category</h4>
                            {CATEGORIES.map(cat => (
                                <label key={cat} className="flex items-center gap-2 text-sm mb-2">
                                    <input type="radio" name="category" />
                                    {cat}
                                </label>
                            ))}
                        </div>

                        <div className="mb-6">
                            <h4 className="font-semibold text-sm mb-3">By Color</h4>
                            <div className="grid grid-cols-4 gap-3">
                                {COLORS.map(c => (
                                    <div
                                        key={c.name}
                                        title={c.name}
                                        className={`w-8 h-10 rounded-md cursor-pointer ${c.class}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="font-semibold text-sm mb-3">By Material</h4>
                            {["Polyester 100%", "Poly/Cotton Blend", "Cotton 100%", "Linen", "Velvet"].map(m => (
                                <label key={m} className="flex items-center gap-2 text-sm mb-2">
                                    <input type="checkbox" />
                                    {m}
                                </label>
                            ))}
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm mb-3">By Function</h4>
                            {["Stain-resistant", "Antibacterial", "Quick-dry", "Wrinkle-free"].map(f => (
                                <label key={f} className="flex items-center gap-2 text-sm mb-2">
                                    <input type="checkbox" />
                                    {f}
                                </label>
                            ))}
                        </div>

                    </aside> */
                {/* PRODUCTS */}
            {/* </div> */}
