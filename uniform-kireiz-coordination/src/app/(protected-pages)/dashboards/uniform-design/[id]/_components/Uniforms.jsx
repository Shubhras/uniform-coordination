'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { FiChevronDown } from 'react-icons/fi'
import { useParams, useRouter } from 'next/navigation'
import { apiGetProductById } from '@/services/ProductService'

const Uniforms = () => {
    const router = useRouter()
    const { id } = useParams()

    const handleUniformDesigning = (id) => {
        router.push(`/dashboards/uniform-single/${id}`);
    };

    // const filters = ['All', 'Scrub', 'Lab Coats', 'Patient Care', 'Administrative']
    const tabs = ['All Scrubs', 'Tops', 'Bottoms', 'Sets', 'Best Sellers', 'New Arrivals']
    const sortOptions = ['Oldest', 'Newest']

    const TAB_TYPE_MAP = {
        'All Scrubs': undefined,
        'Tops': 'tops',
        'Bottoms': 'bottoms',
        'Sets': 'sets',
        'Best Sellers': 'best_sellers',
        'New Arrivals': 'new_arrivals',
    }

    const SORT_MAP = {
        Oldest: 'oldest',
        Newest: 'newest',
    }

    const [activeFilter, setActiveFilter] = useState('All')
    const [activeTab, setActiveTab] = useState('All Scrubs')
    const [sortBy, setSortBy] = useState('Newest')
    const [openSort, setOpenSort] = useState(false)

    /* IMAGE DATA */
    const imagesByTab = {
        'All Scrubs': [
            ...Array.from({ length: 6 }, (_, i) => `/img/uniform/top${i + 1}.png`),
            ...Array.from({ length: 3 }, (_, i) => `/img/uniform/bottom${i + 1}.png`),
        ],
        Tops: Array.from({ length: 6 }, (_, i) => `/img/uniform/top${i + 1}.png`),
        Bottoms: Array.from({ length: 3 }, (_, i) => `/img/uniform/bottom${i + 1}.png`),
        Sets: Array.from({ length: 6 }, (_, i) => `/img/uniform/top${i + 1}.png`),
        // 'Best Sellers': Array.from({ length: 3 }, (_, i) => `/img/uniform/bottom${i + 1}.png`),
        // 'New Arrivals': Array.from({ length: 6 }, (_, i) => `/img/uniform/top${i + 1}.png`),
    }

    const { } = imagesByTab

    const [productData, setProductData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)


    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true)
                setError(null)

                const params = {}

                params.subcategory_id = id
                params.productType = 'uniform'

                if (TAB_TYPE_MAP[activeTab]) {
                    params.type = TAB_TYPE_MAP[activeTab]
                }

                if (SORT_MAP[sortBy]) {
                    params.ordering = SORT_MAP[sortBy]
                }

                const res = await apiGetProductById(params)

                if (res?.status) {
                    setProductData(res.data || [])
                } else {
                    setProductData([])
                    setError('Failed to fetch products')
                }
            } catch (err) {
                setProductData([])
                setError('Something went wrong while loading products')
                console.error("Failed to load products detail", err)
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchProduct()
    }, [id, activeTab, sortBy])


    return (
        <section className="w-full bg-white flex flex-col lg:flex-row px-5 md:px-8 lg:px-12 py-5 gap-10 mt-15">
            <div className="w-full mx-auto">
                <p className='text-sm text-[#486284] py-5'>My dashboard / Medical Care Uniforms</p>

                {/* FILTER + SORT */}
                <div className="flex justify-end gap-4 mb-5">

                    {/* FILTERS */}
                    {/* commented code stays commented */}

                    {/* SORT */}
                    <div className="relative">
                        <button
                            onClick={() => setOpenSort(!openSort)}
                            className="flex items-center justify-between gap-2 border border-[#1C2C56] bg-[#F5F8FF]
                                px-4 py-3 rounded-lg text-sm min-w-[190px]"
                        >
                            <span>Sort By : <b>{sortBy}</b></span>
                            <FiChevronDown />
                        </button>

                        {openSort && (
                            <div className="absolute right-0 mt-2 w-full bg-white border rounded-lg shadow-md z-20">
                                {sortOptions.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            setSortBy(option)
                                            setOpenSort(false)
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-[#F5F8FF]"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* HEADER */}
                <div className="bg-[#F5F8FF] rounded-xl pt-10 text-center border-b px-5">
                    <h2 className="text-3xl font-semibold text-[#1C2C56]">
                        Placeholder Text
                    </h2>
                    <div className="w-20 h-1 bg-[#1C2C56] mx-auto mt-2" />
                    <p className="text-sm text-[#6B7280] mt-4 max-w-lg mx-auto">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>

                    {/* TABS */}
                    <div className="flex gap-6 mt-6 justify-start overflow-x-auto ">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-2 text-sm whitespace-nowrap border-b-2 transition
                  ${activeTab === tab
                                        ? 'border-[#1C2C56] text-[#1C2C56] font-medium'
                                        : 'border-transparent text-[#6B7280]'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PRODUCTS GRID */}
                <div className="grid grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
  gap-6 bg-[#F5F8FF] p-5">

                    {loading && (
                        <div className=" col-span-full  flex items-center justify-center text-center text-sm text-[#6B7280] min-h-32">
                            Loading products...
                        </div>
                    )}

                    {!loading && error && (
                        <div className=" col-span-full  flex items-center justify-center text-center text-sm text-red-600 min-h-32">
                            {error}
                        </div>
                    )}

                    {!loading && !error && productData.length === 0 && (
                        <div className="col-span-full  flex items-center justify-center text-sm text-[#6B7280] min-h-32">
                            No products found
                        </div>
                    )}

                    {!loading && !error && productData.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white border border-[#1C2C56] rounded-2xl p-4 flex flex-col justify-between text-start"
                        >
                            <div className="flex justify-center mb-4 ">
                                <Image
                                    src={product.ProductImage || '/img/placeholder.png'}
                                    alt="Uniform"
                                    width={250}
                                    height={250}
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                            <div className='flex flex-col gap-3'>
                                <h4 className="text-[#1C2C56] font-medium">{product.productName}</h4>
                                <p className="text-xs text-[#6B7280]">{product.description}</p>
                                <button
                                    className=" bg-[#1C2C56] text-white text-sm py-2 rounded-md"
                                    onClick={() => handleUniformDesigning(product.id)}
                                >
                                    Customize
                                </button>
                            </div>
                        </div>
                    ))}
                </div>


            </div>
        </section>
    )
}

export default Uniforms
