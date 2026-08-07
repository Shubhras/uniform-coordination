'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

import {
    FiSave,
    FiFileText,
    FiScissors,
    FiLayers,
    FiDroplet,
    FiMaximize2,
    FiGrid,
    FiInbox,
    FiFeather,
    FiColumns,
} from "react-icons/fi"

import { useRouter, useParams } from 'next/navigation'
import { apiExportDesignPdf, apiGetModalInfoDesignById, apiUpadteDesign } from '@/services/SaveDesignService'
import { apiAddToCart } from '@/services/CartSummaryService'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Spinner from '@/components/ui/Spinner'

/**
 * Icon mapping for specification detail cards.
 */
const iconMap = {
    "Style": FiScissors,
    "Type": FiLayers,
    "Table Shape": FiGrid,
    "Pocket Configuration": FiInbox,
    "Color": FiDroplet,
    "Fabric": FiFeather,
    "Pant": FiColumns,
    "Size": FiMaximize2,
}

/**
 * SpecCard Component
 * 
 * Renders an individual design specification detail card with icon and title.
 * 
 * @param {string} title - Specification label/type.
 * @param {string} value - Specification value.
 */
const SpecCard = ({ title, value }) => {
    const Icon = iconMap[title]
    return (
        <div className="border border-[#E8E0D9] rounded-xl px-4 py-3 bg-white">
            <div className="flex items-start gap-2 mb-1">
                {Icon && <Icon size={16} className="text-[#8B5A3C] mt-[2px]" />}
                <p className="text-xs text-gray-500">{title}</p>
            </div>
            <p className="text-sm font-semibold text-[#2C1810]">
                {value}
            </p>
        </div>
    )
}

/**
 * DesignResultPage Component
 * 
 * Displays customized design specifications, 3D/2D preview image, and provides actions to save, export PDF, or add to cart.
 */
const DesignResultPage = () => {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isAddCart, setIsAddCart] = useState(false);
    const { data: session } = useSession()
    const params = useParams()

    const id = params?.id

    const [modalInfoDesignData, setModalInfoDesignData] = useState(null)
    const [loading, setLoading] = useState(false)

    /**
     * Fetches design specifications by ID on initial mount.
     */
    useEffect(() => {
        const fetchModalInfoDesignById = async () => {
            try {
                setLoading(true)

                const res = await apiGetModalInfoDesignById(id, session?.accessToken)

                if (res?.status && res?.data) {
                    setModalInfoDesignData(res.data)
                } else {
                    toast.push(
                        <Notification title="Error!" type="danger">
                            {res?.message || "Failed to get product detail"}
                        </Notification>
                    );
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

        if (id) fetchModalInfoDesignById()
    }, [id, session?.accessToken])

    /**
     * Saves the current customized design configuration.
     */
    const handleSaveDesign = async () => {
        if (!session?.accessToken) return
        setIsSaving(true);

        const payload = {
            "user": session?.user?.id,
            "config_json": {
                "color": "grey",
                "size": "M",
                "material": "cotton"
            },
            "design_specifications": modalInfoDesignData?.design_specifications,
            "json_file_path": "uploads/configs/user6_model3.json",
            "isActive": true
        }

        try {
            await apiUpadteDesign(id, payload, session.accessToken);
            toast.push(
                <Notification title="Success!" type="success">
                    Design saved successfully
                </Notification>
            );
        } catch (error) {
            console.error("Save Design Error:", error);
            toast.push(
                <Notification title="Error!" type="danger">
                    Failed to save design
                </Notification>
            );
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Exports the design specifications to PDF and opens in a new tab.
     */
    const handleExportPdf = async () => {
        if (!session?.accessToken) {
            toast.push(
                <Notification title="Warning!" type="warning">
                    Please login first
                </Notification>
            );
            return;
        }

        try {
            const response = await apiExportDesignPdf(
                id,
                session.accessToken
            );
            const pdfUrl = response?.pdf_url;
            if (!pdfUrl) {
                throw new Error("PDF URL not found in response");
            }

            window.open(pdfUrl, "_blank");
        } catch (error) {
            console.error("Export PDF Error:", error);
            toast.push(
                <Notification title="Error!" type="danger">
                    Failed to export PDF
                </Notification>
            );
        }
    };

    /**
     * Adds the customized product design to the user's cart.
     */
    const handleAddToCart = async () => {
        if (!session?.accessToken) {
            toast.push(
                <Notification title="Warning!" type="warning">
                    Please login first
                </Notification>
            );
            return;
        }
        setIsAddCart(true);
        try {
            const response = await apiAddToCart(
                session.accessToken,
                modalInfoDesignData?.product_id,
                1
            );
            if (!response?.status) {
                throw new Error("Failed to add to cart");
            }
            toast.push(<Notification title="Success!" type="success">Added to cart successfully</Notification>);
            router.push('/cart-summary')
        } catch (error) {
            console.error("Add to Cart Error:", error);
            toast.push(
                <Notification title="Error!" type="danger">
                    Failed to add to cart
                </Notification>
            );
        } finally {
            setIsAddCart(false);
        }
    }

    return (
        <section className="w-full bg-white flex flex-col lg:flex-row px-6 lg:px-4 py-4 gap-10 mt-15">
            <div className="w-full mx-auto">
                {/* Header */}
                <div className='bg-[#F5F8FF] rounded-xl md:p-8 md:pt-4 p-5'>
                    <div className="text-center mb-8">
                        <h2 className="text-[#7B3C1D] text-3xl font-semibold capitalize">
                            Design Result
                        </h2>
                        <div className="w-20 h-1 bg-[#7B3C1D] mx-auto mt-2 rounded-full" />
                        {modalInfoDesignData?.category?.categoryName && (
                            <p className="text-[#8B5A3C] mt-2 text-sm font-medium">
                                Category: {modalInfoDesignData.category.categoryName} {modalInfoDesignData.subcategory?.name ? `| ${modalInfoDesignData.subcategory.name}` : ''}
                            </p>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0522D]"></div>
                        </div>
                    ) : !modalInfoDesignData ? (
                        <div className="py-20 text-center text-gray-500">
                            Design not found
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                            {/* Left Section: Design Image Preview */}
                            <div className="order-1 flex flex-col items-center justify-center w-full">
                                <div className="relative flex justify-center items-center h-[350px] lg:h-[520px] w-full bg-white border border-[#E8E0D9] rounded-[20px] overflow-hidden p-4 lg:p-8">
                                    <Image
                                        src={modalInfoDesignData?.ProductImage || '/img/table-form/3d-table.png'}
                                        alt="Uniform"
                                        width={360}
                                        height={720}
                                        className="object-contain w-full h-full drop-shadow-md hover:scale-105 transition-transform duration-500 ease-in-out"
                                        priority
                                        unoptimized
                                    />
                                </div>
                            </div>

                            {/* Right Section: Specifications & Action Buttons */}
                            <div className="order-2 flex flex-col">
                                {modalInfoDesignData?.productName && (
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-[#7B3C1D] mb-3 capitalize">
                                            {modalInfoDesignData.productName}
                                        </h2>
                                        <p className="text-gray-600 leading-relaxed text-sm text-justify">
                                            {modalInfoDesignData?.description || "Enhance your setting with our premium customized design, crafted to match your specific requirements."}
                                        </p>
                                    </div>
                                )}

                                <div className="bg-white border border-[#E8E0D9] rounded-[20px] overflow-hidden shadow-sm">
                                    <div className="px-5 py-4 bg-[#F5F8FF] border-b border-[#E8E0D9]">
                                        <h4 className="text-base font-semibold text-[#7B3C1D]">
                                            Design Specifications
                                        </h4>
                                    </div>
                                    <div className="p-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                            <SpecCard title="Style" value={modalInfoDesignData?.design_specifications?.style || ""} />
                                            <SpecCard title="Type" value={modalInfoDesignData?.type || ""} />
                                            <SpecCard title="Table Shape" value={modalInfoDesignData?.table_shape || ""} />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                            <SpecCard title="Color" value={modalInfoDesignData?.design_specifications?.color_details?.name || ""} />
                                            <SpecCard title="Fabric" value={modalInfoDesignData?.design_specifications?.fabric_details?.name || ""} />
                                            <SpecCard title="Size" value={modalInfoDesignData?.design_specifications?.size || ""} />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col lg:flex-row justify-between items-center mt-10 gap-4 w-full">
                                    <div className="flex w-full lg:w-auto gap-4">
                                        <button
                                            className="
                                                h-[55px]
                                                flex-1 lg:flex-none lg:w-[140px]
                                                flex flex-col items-center justify-center
                                                gap-1
                                                text-xs
                                                border border-[#E8E0D9]
                                                rounded-lg
                                                bg-white
                                                text-[#7B3C1D]
                                                hover:bg-[#F5F8FF]
                                                transition
                                            "
                                            onClick={handleSaveDesign}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? <Spinner size={18} customColorClass="text-[#A0522D]" /> : <FiSave size={18} />}
                                            <span>{isSaving ? 'Saving...' : 'Save Design'}</span>
                                        </button>

                                        <button
                                            className="
                                                h-[55px]
                                                flex-1 lg:flex-none lg:w-[140px]
                                                flex flex-col items-center justify-center
                                                gap-1
                                                text-xs
                                                border border-[#E8E0D9]
                                                rounded-lg
                                                bg-white
                                                text-[#7B3C1D]
                                                hover:bg-[#F5F8FF]
                                                transition
                                            "
                                            onClick={handleExportPdf}
                                        >
                                            <FiFileText size={18} />
                                            <span>Export PDF</span>
                                        </button>
                                    </div>

                                    <button
                                        className="w-full lg:w-auto bg-[#8B4513] hover:bg-[#71370F] text-white px-12 py-2 rounded-md flex items-center justify-center lg:flex-1 lg:max-w-[200px] shadow-sm font-medium gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        onClick={handleAddToCart}
                                        disabled={isAddCart}
                                    >
                                        {isAddCart ? <Spinner size={18} customColorClass="text-white" /> : null}
                                        {isAddCart ? 'Adding...' : 'Add to cart'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default DesignResultPage