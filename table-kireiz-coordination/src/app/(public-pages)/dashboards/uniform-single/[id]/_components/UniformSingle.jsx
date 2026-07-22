'use client'

import { apiGetProductDetailsById } from '@/services/ProductService'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiChevronDown, FiArrowLeft } from 'react-icons/fi'
const filters = ['All', 'Scrub', 'Lab Coats', 'Patient Care', 'Administrative']
const sortOptions = ['Popular', 'Newest', 'Price: Low to High', 'Price: High to Low']

const UniformSingle = () => {
    const { id } = useParams()

    const [activeFilter, setActiveFilter] = useState('All')
    const [sortBy, setSortBy] = useState('Popular')
    const [openSort, setOpenSort] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const router = useRouter()
    const [circleColor, setCircleColor] = useState('#BFE3F9')
    const [product, setProduct] = useState(null)

    const colors = [
        '#1C2C56',
        '#000000',
        '#BFE3F9',
        '#A7F3D0',
        '#FEF08A'
    ]
    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true)
                setError(null)
                setProduct(null)

                const res = await apiGetProductDetailsById(id)

                if (res?.status && res?.data) {
                    setProduct(res.data)
                } else {
                    setError('Product not found')
                }
            } catch (err) {
                setError('Something went wrong while loading product details')
                console.error("Failed to load product detail", err)
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchProductDetails()
    }, [id])


    const handleUniformDesigning = () => {
        // product id 
        router.push(`/dashboards/uniform-3d-design/${id}`);
    };
    return (
        <section className="w-full bg-white flex flex-col lg:flex-row px-6 lg:px-4 py-4 gap-10 mt-15 ">
            <div className="w-full mx-auto">
                {/* <p className='text-sm text-[#486284] py-5'>My dashboard / Medical Care Uniforms</p> */}
                <div className="flex items-center gap-2 py-5">
                    <button onClick={() => router.back()} className="text-[#1C2C56] hover:text-[#1C4FA8] transition-colors" title="Go Back">
                        <FiArrowLeft size={20} />
                    </button>
                    <p className='text-sm text-[#7B3C1D]'>
                        <Link href="/kireiz-form" className="hover:underline hover:text-[#1C4FA8] cursor-pointer">My dashboard</Link>
                        {' '} / {' '}
                        <Link href={`/medical-form/${product?.category?.id}`} className="hover:underline hover:text-[#1C4FA8] cursor-pointer">{product?.category?.categoryName}</Link>
                        {' '} / {' '}
                        {product?.subcategory?.name}
                    </p>
                </div>
                {/* FILTER + SORT */}
                {/* <div className="flex flex-col lg:flex-row justify-between gap-4 mb-5">
                   
                    <div className="flex flex-wrap items-center gap-2 border border-[#1C2C56] bg-[#F5F8FF] rounded-lg px-3 py-2">
                        <span className="text-sm font-medium text-[#1C2C56] mr-1">Filters :</span>
                        {filters.map(item => (
                            <button
                                key={item}
                                onClick={() => setActiveFilter(item)}
                                className={`text-sm px-3 py-1 rounded-md transition
                  ${activeFilter === item
                                        ? 'bg-[#1C2C56] text-white'
                                        : 'text-[#1C2C56] hover:bg-[#1C2C5615]'
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
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
                </div> */}
                {/* HEADER */}
                <div className='bg-[#F5F8FF] rounded-xl  md:p-8 p-5'>
                    <div className="text-center mb-12 ">
                        <h2 className="text-[#7B3C1D] text-3xl font-semibold">
                            Placeholder Text
                        </h2>
                        <div className="w-20 h-1 bg-[#7B3C1D] mx-auto mt-2 rounded-full" />
                        <p className="text-[#8B5A3C] mt-3 text-sm">
                            Comfortable, functional scrubs for healthcare professionals
                        </p>
                    </div>
                    {/* MAIN CONTENT */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start ">
                        {/* LEFT INFO CARD */}
                        <div className="order-2 lg:order-1 bg-white border border-[#E8E0D9] rounded-[20px] md:p-8 p-5 flex flex-col h-full">

                            {/* LOADING */}
                            {loading && (
                                <div className="flex justify-center items-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FBF8F6]"></div>
                                </div>
                            )}

                            {/* ERROR */}
                            {!loading && error && (
                                <p className="text-center text-sm text-red-600">
                                    {error}
                                </p>
                            )}

                            {/* EMPTY */}
                            {!loading && !error && !product && (
                                <p className="text-center text-sm text-[#6B7280]">
                                    No product data available
                                </p>
                            )}

                            {/* DATA */}
                            {!loading && !error && product && (
                                <>
                                    <div className="flex flex-col gap-5">
                                        <h3 className="text-[#2C1810] text-2xl font-semibold capitalize">
                                            {product.productName}
                                        </h3>

                                        <div className="flex justify-between items-center text-xs">
                                            <p className="text-[#6B7280]">
                                                Category: {product.subcategory?.name || 'N/A'}
                                            </p>

                                            {product.discount > 0 && (
                                                <span className="text-green-600 text-sm font-medium">
                                                    Save {product.discount}%
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        className="w-full bg-[#8B4513] text-white py-3 rounded-md text-sm font-medium mt-6"
                                        onClick={handleUniformDesigning}
                                    >
                                        Customize
                                    </button>

                                    <div className="pt-4 space-y-3 flex-1">
                                        <h4 className="text-[#2C1810] font-semibold">
                                            Description
                                        </h4>

                                        <p className="text-[#6B7280] text-sm leading-relaxed">
                                            {product.description || 'No description available'}
                                        </p>

                                        <p className="text-[#6B7280] text-sm leading-relaxed">
                                            Price: ₹{product.price}
                                        </p>

                                        <p className="text-[#6B7280] text-sm leading-relaxed">
                                            Available Quantity: {product.available_quantity}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>


                        {/* RIGHT IMAGE WITH BLUE CIRCLE */}
                        <div className="order-1 lg:order-2 relative flex justify-center">
                            {/* <div className="absolute right-0 top-10 flex flex-col items-center gap-3 z-20">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setCircleColor(color)}
                                        className={`w-8 h-10 rounded border ${circleColor === color ? 'ring-1' : ''
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <button className="mt-2 text-[8px] w-8 h-10 p-1 border border-gray-300 rounded text-gray-600 bg-white">
                                    View All
                                </button>
                            </div> */}
                            <div
                                className="absolute md:w-[380px] md:h-[380px] w-[300px] h-[300px] rounded-full transition-colors duration-300"
                            // style={{ backgroundColor: circleColor }}
                            />
                            <div className="relative z-10">
                                <Image
                                    //src="/img/uniform/uniform.png"
                                    src={product?.ProductImage || '/img/uniform/uniform.png'}
                                    alt="Uniform"
                                    width={450}
                                    height={800}
                                    className="object-contain"
                                    priority
                                    unoptimized
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div className='md:p-10 p-5 border-x-2 border-t-2 rounded-xl border-[#87CEEB]'>
                    <h1 className='text-4xl font-semibold mb-2'>Size Guide</h1>
                    <div className='flex items-center justify-center'>
                        <Image
                            src="/img/uniform/chart.png"
                            alt="Uniform"
                            width={800}
                            height={800}
                            className="object-contain"
                            priority
                        />
                    </div>
                </div> */}
            </div>
        </section>
    )
}

export default UniformSingle
