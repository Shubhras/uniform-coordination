'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

import {
    FiSave,
    FiFileText,
    FiScissors,
    FiTag,
    FiLayers,
    FiArchive,
    FiArrowLeft,
} from "react-icons/fi"
import { useRouter, useParams } from 'next/navigation'
import { apiGetProductDetailsById } from '@/services/ProductService'
import { apiExportDesignPdf, apiUpadteDesign } from '@/services/SaveDesignService'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Spinner from '@/components/ui/Spinner'
const iconMap = {
    "Cut Style": FiScissors,
    "Collar Type": FiLayers,
    "Sleeve Length": FiTag,
    "Pocket Configuration": FiArchive,
    "Color": FiTag,
    "Fabric": FiLayers,
    "Pant": FiArchive,
}

const DesignResultPage = () => {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const { data: session } = useSession()
    const params = useParams()

    const id = params?.id    // custom update model id

    const [singleProductData, setSingleProductData] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true)

                const res = await apiGetProductDetailsById(id)

                if (res?.status && res?.data) {
                    setSingleProductData(res.data)
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
                    </Notification>)
                console.error("Failed to load product detail", err)
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchProductDetails()
    }, [id])

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
    const Counter = () => (
        <div className="flex items-center gap-2">
            <button className="w-6 h-6 rounded bg-gray-100 text-gray-600 text-sm">
                −
            </button>
            <span className="text-sm font-medium">1</span>
            <button className="w-6 h-6 rounded bg-gray-100 text-gray-600 text-sm">
                +
            </button>
        </div>
    )

    const handleRedirect = () => {
        router.push('/dashboards/delivery-request')
    }
    const handleSaveDesign = async () => {
        if (!session?.accessToken) return
        setIsSaving(true);

        const payload = {
            "user": session?.user?.id,
            "model_info": id,
            "config_json": {
                "color": "grey",
                "size": "M",
                "material": "cotton"
            },
            "design_specifications": {
                "logo_position": "front",
                "print_type": "embroidery",
                "text": "My Brand"
            },
            "json_file_path": "uploads/configs/user6_model3.json",
            "isActive": true
        }

        try {
            const response = await apiUpadteDesign(id, payload, session.accessToken);
            console.log("Design Saved Successfully:", response);
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
            const userId = session?.user?.id;
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
    return (
        <section className="w-full bg-white flex flex-col lg:flex-row px-6 lg:px-4 py-4 gap-10 mt-15">
            <div className="w-full mx-auto">
                <div className="flex items-center gap-2 py-5">
                    <button onClick={() => router.back()} className="text-[#1C2C56] hover:text-[#1C4FA8] transition-colors" title="Go Back">
                        <FiArrowLeft size={20} />
                    </button>
                    <p className='text-sm text-[#7B3C1D]'>
                        <Link href="/kireiz-form" className="hover:underline hover:text-[#1C4FA8] cursor-pointer">My dashboard</Link>
                        {' '} / {' '}
                        {singleProductData?.category?.categoryName ? (
                            <>
                                <Link href={`/medical-form/${singleProductData?.category?.id}`} className="hover:underline hover:text-[#1C4FA8] cursor-pointer">{singleProductData?.category?.categoryName}</Link>
                                {' '} / {' '}
                            </>
                        ) : null}
                        Design Result
                    </p>
                </div>

                {/* HEADER */}
                <div className='bg-[#F5F8FF] rounded-xl md:p-8 p-5'>
                    <div className="text-center mb-8">
                        <h2 className="text-[#7B3C1D] text-3xl font-semibold capitalize">
                            Design Result
                        </h2>
                        <div className="w-20 h-1 bg-[#7B3C1D] mx-auto mt-2 rounded-full" />
                        {singleProductData?.category?.categoryName && (
                            <p className="text-[#8B5A3C] mt-2 text-sm font-medium">
                                Category: {singleProductData.category.categoryName} {singleProductData.subcategory?.name ? `| ${singleProductData.subcategory.name}` : ''}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* ================= LEFT SECTION ================= */}
                        <div className="order-1 flex flex-col items-center justify-center">
                            <div className="relative flex justify-center items-center h-[520px] w-full">
                                <Image
                                    src={singleProductData?.ProductImage || '/img/uniform/uniform.png'}
                                    alt="Uniform"
                                    width={360}
                                    height={720}
                                    className="object-contain"
                                    priority
                                    unoptimized
                                />
                            </div>
                        </div>

                        {/* ================= RIGHT SECTION ================= */}
                        <div className="order-2 flex flex-col">
                            <div className="bg-white border border-[#E8E0D9] rounded-[20px] overflow-hidden shadow-sm">
                                <div className="px-5 py-4 bg-[#F5F8FF] border-b border-[#E8E0D9]">
                                    <h4 className="text-base font-semibold text-[#7B3C1D]">
                                        Design Specifications
                                    </h4>
                                </div>
                                <div className="p-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                        <SpecCard title="Cut Style" value="Modern Fit" />
                                        <SpecCard title="Collar Type" value="V-Neck Reinforced" />
                                        <SpecCard title="Sleeve Length" value="Short (Standard)" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                        <SpecCard title="Pocket Configuration" value="1 Chest, 2 Lower Patch" />
                                        <SpecCard title="Color" value="Navy Blue" />
                                        <SpecCard title="Fabric" value="Polyester" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <SpecCard title="Pant" value="Straight Pant" />
                                        <div className="border border-[#E8E0D9] rounded-xl px-4 py-3 bg-white">
                                            <p className="text-xs text-gray-500 mb-3">Size Range</p>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-[#2C1810]">XS</span>
                                                <Counter />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-[#2C1810]">S</span>
                                                <Counter />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-between items-center mt-10 gap-4">
                                <div className="flex gap-4">
                                    <button
                                        className="
                                            h-[55px]
                                            w-[140px]
                                            flex flex-col items-center justify-center
                                            gap-2
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
                                        {isSaving ? <Spinner size={18} /> : <FiSave size={18} />}
                                        <span>{isSaving ? 'Saving...' : 'Save Design'}</span>
                                    </button>

                                    <button
                                        className="
                                            h-[55px]
                                            w-[140px]
                                            flex flex-col items-center justify-center
                                            gap-2
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
                                    className="h-[55px] bg-[#8B4513] hover:bg-[#71370F] text-white px-12 rounded-md flex items-center justify-center flex-1 shadow-sm font-medium"
                                    onClick={handleRedirect}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default DesignResultPage