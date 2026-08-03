import React, { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { FaRegHeart } from "react-icons/fa6"
import { useRouter } from "next/navigation"
import Button from '@/components/ui/Button'
import { apiGetCategories } from "@/services/CategoryService"
import { apiGetMaterialList } from "@/services/CategoryService"
import { apiGetColorList } from "@/services/CategoryService"
import { apiGetBrowseByColorProductData } from "@/services/ProductService"

/**
 * Filter tab navigation options for product categorization.
 */
const TABS = ["By Category", "By Color", "By Material", "By Function"]

/**
 * Available product function types for filtering.
 */
export const PRODUCT_TYPES = [
    { key: "tablecloth", label: "Tablecloth" },
    { key: "napkin", label: "Napkin" },
    { key: "runner", label: "Runner" },
    { key: "chair_cover", label: "Chair Cover" },
    { key: "background", label: "Background" },
];

/**
 * BrowseCards Component
 * 
 * Interactive product catalog featuring multi-attribute filtering 
 * (Category, Color swatch, Material fabric, Function type) and canvas preview navigation.
 */
const BrowseCards = () => {
    const [selectedColor, setSelectedColor] = useState(null)
    const [activeTab, setActiveTab] = useState("")
    const router = useRouter()
    const filterRef = useRef(null)
    const [categoryData, setCategoryData] = useState([])
    const [materialData, setMaterialData] = useState([])
    const [colorData, setColorData] = useState([])
    const [browseByColorProduct, setBrowseByColorProduct] = useState([])
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [refresh, setRefresh] = useState(0);

    /**
     * Effect hook to fetch filter options (Categories, Fabrics, Colors) on component mount.
     */
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
        const fetchMaterialList = async () => {
            try {
                const response = await apiGetMaterialList({
                    search: "",
                    page: 1,
                    page_size: 100
                });
                if (response && response.status === true && Array.isArray(response.data)) {
                    setMaterialData(response.data);
                } else {
                    setMaterialData([]);
                }
            } catch (error) {
                console.error("Error fetching materials:", error);
                setMaterialData([]);
            }
        };
        const fetchColorList = async () => {
            try {
                const response = await apiGetColorList({
                    search: "",
                    page: 1,
                    page_size: 100
                });
                if (response && response.status === true && Array.isArray(response.data)) {
                    setColorData(response.data);
                } else {
                    setColorData([]);
                }
            } catch (error) {
                console.error("Error fetching colors:", error);
                setColorData([]);
            }
        };

        fetchCategories();
        fetchMaterialList();
        fetchColorList();
    }, []);

    /**
     * Effect hook to fetch filtered products whenever filter selections change.
     */
    useEffect(() => {
        const fetchBrowseByColorProductData = async () => {
            setLoading(true);
            try {
                const response = await apiGetBrowseByColorProductData({
                    category_id: selectedCategory,
                    fabric_id: selectedMaterial,
                    color_id: selectedColor,
                    search: "",
                    isActive: true,
                    ordering: '',
                    type: selectedType,
                    page: 1,
                    page_size: 10
                });

                if (response && response.status === true && Array.isArray(response.data)) {
                    setBrowseByColorProduct(response.data);

                } else {
                    setBrowseByColorProduct([]);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setBrowseByColorProduct([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBrowseByColorProductData();
    }, [selectedCategory, selectedMaterial, selectedColor, selectedType, refresh]);

    /**
     * Closes dropdown filter panels when clicking outside the filter area.
     */
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setActiveTab("")
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    /**
     * Navigates to the uniform single product preview canvas page.
     * 
     * @param {string|number} productId - Unique ID of the product.
     */
    const previewInCanvas = (productId) => {
        router.push(`/dashboards/uniform-single/${productId}`)
    }

    return (
        <section className="w-full bg-[#fffdfb] px-4 sm:px-6 md:px-8 lg:px-12">
            {/* Filter Navigation Bar */}
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
                <button
                    onClick={() => {
                        setSelectedCategory("");
                        setSelectedMaterial("");
                        setSelectedColor("");
                        setSelectedType("");
                        setActiveTab("");
                        setRefresh(prev => prev + 1);
                    }}
                    className="px-4 sm:px-5 py-2 rounded-xl font-medium text-xs sm:text-sm transition whitespace-nowrap text-white bg-[#A0522D] hover:bg-[#8B4513]"
                >
                    Reset
                </button>
                {/* Dropdown: By Category */}
                {activeTab === "By Category" && (
                    <div className="absolute top-14 sm:top-16 left-0 w-full max-h-[60vh] overflow-y-auto bg-[#FAF6F4] shadow-lg rounded-lg px-4 py-6 z-20 border border-[#A0522D]">
                        <div className="flex md:flex-row flex-col flex-wrap gap-3">
                            {categoryData.map(cat => (
                                <label key={cat.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name="category"
                                        className="accent-[#A0614D]"
                                        value={cat.id}
                                        checked={selectedCategory === cat.id}
                                        onChange={() => setSelectedCategory(cat.id)}
                                    />
                                    {cat.categoryName}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                {/* Dropdown: By Color Swatches */}
                {activeTab === "By Color" && (
                    <div className="absolute top-14 sm:top-16 left-0 w-full  max-h-[60vh] overflow-y-auto bg-[#FAF6F4] shadow-lg rounded-lg px-4 py-6 z-20 border border-[#A0522D]">
                        <div className="flex  flex-wrap gap-3">
                            {colorData.map(c => (
                                <label key={c.id} className="cursor-pointer" title={c.colorName}>
                                    <input
                                        type="radio"
                                        name="color"
                                        value={c.id}
                                        checked={selectedColor === c.id}
                                        onChange={() => setSelectedColor(c.id)}
                                        className="sr-only"
                                    />
                                    <div
                                        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-300 flex items-center justify-center"
                                        style={{ backgroundColor: c.colorCode }}
                                    >
                                        {selectedColor === c.id && (
                                            <div className=" bg-white rounded-full  absolute top-0 -right-1 shadow-sm">
                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                {/* Dropdown: By Material */}
                {activeTab === "By Material" && (
                    <div className="absolute top-14 sm:top-16 left-0 w-full max-h-[60vh] overflow-y-auto bg-[#FAF6F4] shadow-lg rounded-lg px-4 py-6 z-20 border border-[#A0522D]">
                        <div className="flex md:flex-row flex-col flex-wrap gap-3">
                            {materialData.map(mat => (
                                <label key={mat.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name="material"
                                        className="accent-[#A0614D]"
                                        value={mat.id}
                                        checked={selectedMaterial === mat.id}
                                        onChange={() => setSelectedMaterial(mat.id)}
                                    />
                                    {mat.fabricName}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                {/* Dropdown: By Function */}
                {activeTab === "By Function" && (
                    <div className="absolute top-14 sm:top-16 left-0 w-full max-h-[60vh] overflow-y-auto bg-[#FAF6F4] shadow-lg rounded-lg px-4 py-6 z-20 border border-[#A0522D]">
                        <div className="flex md:flex-row flex-col flex-wrap gap-3">
                            {PRODUCT_TYPES.map(fun => (
                                <label key={fun.key} className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name="function"
                                        className="accent-[#A0614D]"
                                        value={fun.key}
                                        checked={selectedType === fun.key}
                                        onChange={() => setSelectedType(fun.key)}
                                    />
                                    {fun.label}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="my-8 border-t-2 border-[#E5D5C8]" />
            {/* Product Cards Grid Section */}
            {loading ? (
                /* Loading State Spinner */
                <section className="relative w-full bg-[#FBF8F6] mx-auto px-5 md:px-8 lg:px-12 mt-10">
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0522D]"></div>
                    </div>
                </section>
            ) : browseByColorProduct.length === 0 ? (
                /* Empty Product List State */
                <section className="relative w-full bg-[#FBF8F6] mx-auto px-5 md:px-8 lg:px-12 mt-10 mb-10 rounded-xl">
                    <div className="flex flex-col justify-center items-center py-24 text-center">
                        <h3 className="text-xl font-semibold text-[#3B3B3B] mb-2">No Products Found</h3>
                    </div>
                </section>
            ) : (
                /* Product Cards Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-5">
                    {browseByColorProduct.map((item, i) => (
                        <div
                            key={item.id || i}
                            className="group bg-[#EDEDED] border border-[#A0522D4F] rounded-br-4xl overflow-hidden shadow-lg hover:shadow-xl transition"
                        >
                            <div className="relative h-[220px] sm:h-[260px] lg:h-[300px] overflow-hidden">
                                <Image
                                    src={item.ProductImage}
                                    alt={item.productName}
                                    fill
                                    className="object-cover p-8 sm:p-10"
                                    unoptimized
                                />
                            </div>

                            <div className="p-4 bg-white">
                                <h3 className="font-semibold text-lg text-[#3B3B3B]">{item.productName}</h3>
                                <p className="text-sm text-[#6B5D57] mb-6">
                                    Color : {item.color_details?.name || item.color}
                                </p>
                                <div className="flex items-center gap-3">
                                    <button
                                        className="flex-1 py-2 text-sm bg-[#A0614D] text-white rounded-lg hover:bg-[#8B4513] transition"
                                        onClick={() => previewInCanvas(item.id)}
                                    >
                                        Preview in Canvas
                                    </button>
                                    <FaRegHeart size={20} className="text-black cursor-pointer hover:text-red-500 transition" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

export default BrowseCards
