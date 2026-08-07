'use client'

import { apiGetProductDetailsById } from '@/services/ProductService'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

/**
 * UniformSingle Dynamic Component ([id])
 * 
 * Fetches and renders detailed product specifications, pricing, description, and direct link to 3D customization editor.
 */
const UniformSingle = () => {
    const { id } = useParams()
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const [singleProductData, setSingleProductData] = useState(null)

    /**
     * Fetches product detail specifications by route param ID.
     */
    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true)
                setSingleProductData(null)

                const res = await apiGetProductDetailsById(id)

                if (res?.status && res?.data) {
                    setSingleProductData(res.data)
                } else {
                    toast.push(
                        <Notification title="Error!" type="danger">
                            {res?.message || 'Product not found'}
                        </Notification>
                    )
                }
            } catch (err) {
                toast.push(
                    <Notification title="Error!" type="danger">
                        Failed to load product detail
                    </Notification>
                )
                console.error("Failed to load product detail", err)
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchProductDetails()
    }, [id])

    /**
     * Navigates to the 3D uniform customization editor for this specific product ID.
     */
    const handleUniformDesigning = () => {
        // product id 
        router.push(`/dashboards/uniform-3d-design/${id}`);
    };

    return (
        <section className="w-full bg-white flex flex-col lg:flex-row px-6 lg:px-4 py-4 gap-10 mt-15">
            <div className="w-full mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 py-5 md:pt-1">
                    <button onClick={() => router.back()} className="text-[#1C2C56] hover:text-[#1C4FA8] transition-colors" title="Go Back">
                        <FiArrowLeft size={20} />
                    </button>
                    <p className='text-sm text-[#7B3C1D]'>
                        <Link href="/kireiz-form" className="hover:underline hover:text-[#1C4FA8] cursor-pointer">My dashboard</Link>
                        {' '} / {' '}
                        <Link href={`/medical-form/${singleProductData?.category?.id}`} className="hover:underline hover:text-[#1C4FA8] cursor-pointer">{singleProductData?.category?.categoryName}</Link>
                        {' '} / {' '}
                        {singleProductData?.subcategory?.name}
                    </p>
                </div>

                {/* Header */}
                <div className='bg-[#F5F8FF] rounded-xl md:p-8 p-5'>
                    <div className="text-center mb-8">
                        <h2 className="text-[#7B3C1D] text-3xl font-semibold capitalize">
                            {singleProductData?.productName || 'Product Details'}
                        </h2>
                        <div className="w-20 h-1 bg-[#7B3C1D] mx-auto mt-2 rounded-full" />
                        {singleProductData?.category?.categoryName && (
                            <p className="text-[#8B5A3C] mt-2 text-[15px] font-medium">
                                Category: {singleProductData.category.categoryName} {singleProductData.subcategory?.name ? `| ${singleProductData.subcategory.name}` : ''}
                            </p>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Left Info Card */}
                        <div className="order-2 lg:order-1 bg-white border border-[#E8E0D9] rounded-[20px] md:p-8 p-5 flex flex-col shadow-sm">
                            {loading && (
                                <div className="flex justify-center items-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B3C1D]"></div>
                                </div>
                            )}

                            {!loading && !singleProductData && (
                                <p className="text-center text-sm text-[#6B7280]">
                                    No product data available
                                </p>
                            )}

                            {!loading && singleProductData && (
                                <>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-[#2C1810] text-2xl font-semibold capitalize">
                                                {singleProductData.productName}
                                            </h3>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm mt-1">
                                            <div>
                                                <span className="text-[#6B7280] text-[15px]">Price: </span>
                                                <span className="text-[#7B3C1D] font-bold text-[19px]">${singleProductData.price}</span>
                                            </div>
                                            {singleProductData.rental_price_per_day && (
                                                <div className="border-l border-gray-300 pl-4">
                                                    <span className="text-[#6B7280] text-[15px]">Rental: </span>
                                                    <span className="text-[#1C2C56] font-semibold text-[19px]">${singleProductData.rental_price_per_day} <span className="text-xs font-normal text-gray-500">/ day</span></span>
                                                </div>
                                            )}
                                            {singleProductData.discount > 0 && (
                                                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-md font-medium">
                                                    Save {singleProductData.discount}%
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        className="w-full bg-[#8B4513] hover:bg-[#71370F] transition-colors text-white py-3 rounded-md text-sm font-medium mt-6 shadow-sm"
                                        onClick={handleUniformDesigning}
                                    >
                                        Customize
                                    </button>

                                    <div className="pt-6 space-y-5 flex-1">
                                        {/* Description */}
                                        <div>
                                            <h4 className="text-[#2C1810] font-semibold mb-1">
                                                Description
                                            </h4>
                                            <p className="text-[#6B7280] text-[16px] leading-relaxed">
                                                {singleProductData.description || 'No description available'}
                                            </p>
                                        </div>

                                        {/* Specifications */}
                                        <div className="border-t border-[#E8E0D9] pt-4">
                                            <h4 className="text-[#2C1810] font-semibold mb-3">
                                                Product Specifications
                                            </h4>
                                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs sm:text-sm">
                                                {singleProductData.fabric_details?.name && (
                                                    <div>
                                                        <span className="text-gray-500 text-[15px]">Fabric: </span>
                                                        <span className="font-medium text-gray-800 text-[15px]">{singleProductData.fabric_details.name}</span>
                                                    </div>
                                                )}
                                                {singleProductData.color_details?.name && (
                                                    <div>
                                                        <span className="text-gray-500 text-[15px]">Color: </span>
                                                        <span className="font-medium text-gray-800 text-[15px]">{singleProductData.color_details.name}</span>
                                                    </div>
                                                )}
                                                {singleProductData.size && (
                                                    <div>
                                                        <span className="text-gray-500 text-[15px]">Size: </span>
                                                        <span className="font-medium text-gray-800 text-[15px]">{singleProductData.size}</span>
                                                    </div>
                                                )}
                                                {singleProductData.style && (
                                                    <div>
                                                        <span className="text-gray-500 text-[15px]">Style: </span>
                                                        <span className="font-medium text-gray-800 capitalize text-[15px]">{singleProductData.style}</span>
                                                    </div>
                                                )}
                                                {singleProductData.table_shape && (
                                                    <div>
                                                        <span className="text-gray-500 text-[15px]">Shape: </span>
                                                        <span className="font-medium text-gray-800 capitalize text-[15px]">{singleProductData.table_shape}</span>
                                                    </div>
                                                )}
                                                {singleProductData.productType && (
                                                    <div>
                                                        <span className="text-gray-500 text-[15px]">Type: </span>
                                                        <span className="font-medium text-gray-800 capitalize text-[15px]">{singleProductData.productType}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Right Product Image Preview */}
                        <div className="order-1 lg:order-2 relative flex justify-center">
                            <div className="relative z-10">
                                <Image
                                    src={singleProductData?.ProductImage || '/img/table-form/3d-table.png'}
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
            </div>
        </section>
    )
}

export default UniformSingle

