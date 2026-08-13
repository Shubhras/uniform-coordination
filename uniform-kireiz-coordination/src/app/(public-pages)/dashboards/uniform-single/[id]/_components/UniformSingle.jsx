'use client'

import { apiGetProductDetailsById } from '@/services/ProductService'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiChevronDown, FiArrowLeft } from 'react-icons/fi'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
const filters = ['All', 'Scrub', 'Lab Coats', 'Patient Care', 'Administrative']
const sortOptions = ['Popular', 'Newest', 'Price: Low to High', 'Price: High to Low']

const UniformSingle = () => {
    const { id } = useParams()
    const { session } = useCurrentSession()
    const [openSort, setOpenSort] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const router = useRouter()
    const [product, setProduct] = useState(null)

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
        const destination = `/dashboards/uniform-3d-design/${id}`

        if (!session?.user?.email) {
            toast.push(
                <Notification title="Login Required" type="warning">
                    Please sign in first to continue.
                </Notification>
            )
            router.push(`/sign-in?${REDIRECT_URL_KEY}=${destination}`)
            return
        }

        router.push(destination)
    };
    return (
        <section className="w-full bg-white flex flex-col lg:flex-row px-6 lg:px-4 py-4 gap-10 mt-6 ">
            <div className="w-full mx-auto">
                {/* <p className='text-sm text-[#486284] py-5'>My dashboard / Medical Care Uniforms</p> */}
                <div className="flex items-center gap-2 py-5">
                    <button onClick={() => router.back()} className="text-[#1C2C56] hover:text-[#1C4FA8] transition-colors" title="Go Back">
                        <FiArrowLeft size={20} />
                    </button>
                    <p className='text-sm text-[#486284]'>
                        <Link href="/kireiz-form" className="hover:underline hover:text-[#1C4FA8] cursor-pointer">My dashboard</Link>
                        {' '} / {' '}
                        <Link href={`/medical-form/${product?.category?.id}`} className="hover:underline hover:text-[#1C4FA8] cursor-pointer">{product?.category?.categoryName}</Link>
                        {' '} / {' '}
                        {product?.subcategory?.name}
                    </p>
                </div>
               
                {/* HEADER */}
                <div className='bg-[#F5F8FF] rounded-xl  md:p-8 p-5'>
                    <div className="text-center mb-12 ">
                        <h2 className="text-[#1C2C56] text-3xl font-semibold capitalize">
                            {product?.productName || 'Uniform Design'}
                        </h2>
                        <div className="w-20 h-1 bg-[#1C2C56] mx-auto mt-2 rounded-full" />
                        <p className="text-[#6B7280] mt-3 text-sm">
                            {product?.category?.categoryName}
                            {product?.category?.categoryName && product?.subcategory?.name ? ' • ' : ''}
                            {product?.subcategory?.name}
                        </p>
                    </div>
                    {/* MAIN CONTENT */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start ">
                        {/* LEFT INFO CARD */}
                        <div className="order-2 lg:order-1 bg-white border border-[#1C2C56] rounded-[20px] md:p-8 p-5 flex flex-col h-full">

                            {/* LOADING */}
                            {loading && (
                                <div className="flex justify-center items-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C4FA8]"></div>
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
                                        <h3 className="text-[#1C2C56] text-2xl font-semibold capitalize">
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
                                        className="w-full bg-[#1C4FA8] text-white py-3 rounded-md text-sm font-medium mt-6"
                                        onClick={handleUniformDesigning}
                                    >
                                        Customize
                                    </button>

                                    <div className="pt-4 space-y-3 flex-1">
                                        <h4 className="text-[#1C2C56] font-semibold">
                                            Description
                                        </h4>

                                        <p className="text-[#6B7280] text-sm leading-relaxed">
                                            {product.description || 'No description available'}
                                        </p>

                                        <p className="text-[#6B7280] text-sm leading-relaxed">
                                            Price: ${product.price}
                                        </p>

                                        {product.type && (
                                            <p className="text-[#6B7280] text-sm leading-relaxed capitalize">
                                                Type: {product.type}
                                            </p>
                                        )}

                                        <p className="text-[#6B7280] text-sm leading-relaxed">
                                            Available Quantity: {product.available_quantity} / {product.total_quantity}
                                        </p>

                                        {Number(product.rental_price_per_day) > 0 && (
                                            <p className="text-[#6B7280] text-sm leading-relaxed">
                                                Rental Price: ${product.rental_price_per_day} / day
                                            </p>
                                        )}

                                        {Number(product.security_deposit) > 0 && (
                                            <p className="text-[#6B7280] text-sm leading-relaxed">
                                                Security Deposit: ${product.security_deposit}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* RIGHT IMAGE WITH BLUE CIRCLE */}
                        <div className="order-1 lg:order-2 relative flex justify-center">
                            <div
                                className="absolute md:w-[380px] md:h-[380px] w-[300px] h-[300px] rounded-full"
                            />
                            <div className="relative z-10">
                                <img
                                    src={product?.ProductImage}
                                    alt={product?.productName || 'Uniform'}
                                    className="w-[450px] max-w-full object-contain"
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
