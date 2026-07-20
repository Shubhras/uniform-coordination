'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FiChevronDown, FiArrowLeft } from 'react-icons/fi'
import { useParams, useRouter } from 'next/navigation'
import { apiGetProductById } from '@/services/ProductService'
import Select from '@/components/ui/Select'
import { HiCheck } from 'react-icons/hi'

const CustomOption = (props) => {
    const { innerProps, label, isSelected, isDisabled } = props
    return (
        <div
            className={`flex items-center justify-between px-3 py-2 cursor-pointer ${isSelected ? 'text-[#1C4FA8] bg-[#F2F7FF]' : 'text-[#1C2C56] hover:bg-gray-100'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            {...innerProps}
        >
            <span className="text-sm font-medium">{label}</span>
            {isSelected && <HiCheck className="text-lg text-[#1C4FA8]" />}
        </div>
    )
}

const Uniforms = () => {
    const router = useRouter()
    const { id } = useParams()

    const handleUniformDesigning = (id) => {
        // product id 
        router.push(`/dashboards/uniform-single/${id}`);
    };

    const tabs = [
        { key: '', name: 'All Scrubs' },
        { key: 'top', name: 'Tops' },
        { key: 'bottom', name: 'Bottoms' },
        { key: 'set', name: 'Sets' },
        { key: 'best_seller', name: 'Best Sellers' },
        { key: 'newest', name: 'New Arrivals' }
    ]

    const sortOptions = [
        { key: '', name: 'All' },
        { key: 'oldest', name: 'Oldest' },
        { key: 'newest', name: 'Newest' }
    ]

    const [activeTab, setActiveTab] = useState(tabs[0])
    const [sortBy, setSortBy] = useState(sortOptions[0])
    const [openSort, setOpenSort] = useState(false)
    const [productData, setProductData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [subCategoryData, setSubCategoryData] = useState({});

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true)
                setError(null)

                const params = {}

                params.subcategory_id = id
                params.productType = 'uniform'

                params.type = activeTab.key;
                params.ordering = sortBy.key;

                const res = await apiGetProductById(params)

                if (res?.status) {
                    setProductData(res.data || [])
                    setSubCategoryData(res?.subcategory)
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
                <div className="flex items-center gap-2 py-5">
                    <button onClick={() => router.back()} className="text-[#1C2C56] hover:text-[#1C4FA8] transition-colors" title="Go Back">
                        <FiArrowLeft size={20} />
                    </button>
                    <p className='text-sm text-[#486284]'>
                        <Link href="/kireiz-form" className="hover:underline hover:text-[#1C4FA8] cursor-pointer">My dashboard</Link>
                        {' '} / {' '}
                        <Link href={`/medical-form/${subCategoryData?.category?.id}`} className="hover:underline hover:text-[#1C4FA8] cursor-pointer">{subCategoryData?.category?.categoryName}</Link>
                        {' '} / {' '}
                        {subCategoryData?.name}
                    </p>
                </div>

                {/* FILTER + SORT */}
                <div className="flex justify-end gap-4 mb-5">

                    {/* FILTERS */}
                    {/* commented code stays commented */}

                    {/* SORT */}
                    <div className="relative min-w-[220px] z-[60]">
                        <Select
                            options={sortOptions.map(opt => ({ value: opt.key, label: `${opt.name}` }))}
                            value={{ value: sortBy.key, label: `Sort By : ${sortBy.name}` }}
                            onChange={(selected) => {
                                const option = sortOptions.find(o => o.key === selected.value);
                                if (option) setSortBy(option);
                            }}
                            components={{ Option: CustomOption }}
                            styles={{
                                control: () => ({
                                    borderRadius: '8px',
                                    borderColor: '#1C2C56',
                                    borderStyle: 'solid',
                                    borderWidth: '1px',
                                    backgroundColor: '#F5F8FF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '2px 8px',
                                    cursor: 'pointer',
                                    height: '38px'
                                }),
                                singleValue: () => ({ color: '#1C2C56', fontSize: '14px' }),
                                placeholder: () => ({ color: '#1C2C56', fontSize: '14px' })
                            }}
                        />
                    </div>
                </div>

                {/* HEADER */}
                <div className="bg-[#F5F8FF] rounded-xl pt-10 text-center border-b px-5">
                    <div className="text-center mb-6">
                        <div className="inline-flex flex-col items-end">
                            <h2 className="text-[#1C2C56] md:text-3xl text-2xl font-semibold">
                                Placeholder Text
                            </h2>
                            <div className="w-[50px] md:w-[70px] h-[3px] bg-[#87CEEB] mt-2" />
                        </div>
                    </div>
                    <p className="text-sm text-[#6B7280] mt-4 max-w-lg mx-auto">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>

                    {/* TABS */}
                    <div className="flex gap-6 mt-6 justify-start overflow-x-auto ">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-2 text-sm whitespace-nowrap border-b-3 transition
                  ${activeTab.key === tab.key
                                        ? 'border-[#1C2C56] text-[#1C2C56] font-medium'
                                        : 'border-transparent text-[#6B7280]'
                                    }`}
                            >
                                {tab.name}
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
                        <div className="col-span-full flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C4FA8]"></div>
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
                                    className=" bg-[#1C4FA8] text-white text-sm py-2 rounded-md"
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
