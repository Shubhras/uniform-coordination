'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { TbView360Number } from 'react-icons/tb'

import {
    FiSave,
    FiFileText,
    FiScissors,
    FiTag,
    FiLayers,
    FiArchive,
} from "react-icons/fi"
import { useRouter, useParams } from 'next/navigation'
import { apiUpadteDesign, apiExportDesignPdf, apiGetModalInfo } from '@/services/SaveDesignService'
import { useSession } from 'next-auth/react'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Spinner from '@/components/ui/Spinner'

// Maps spec titles to their corresponding icon components
const iconMap = {
    "Cut Style": FiScissors,
    "Collar Type": FiLayers,
    "Sleeve Length": FiTag,
    "Pocket Configuration": FiArchive,
    "Color": FiTag,
    "Fabric": FiLayers,
    "Pant": FiArchive,
}
/**
 * DesignResultPage Component
 *
 * Displays the final uniform design result along with its
 * specifications. Fetches saved modal info on load, and lets the
 * user save the design, export it as PDF, or proceed to the
 * delivery request page.
 */
const DesignResultPage = () => {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const { data: session } = useSession()
    const params = useParams()

    const id = params?.id

    useEffect(() => {
        // Fetches saved modal/design info for the current design id
        const fetchModalInfo = async () => {
            if (id && session?.accessToken) {
                try {
                    const res = await apiGetModalInfo(id, session.accessToken);
                    console.log("Modal Info Response:", res);
                } catch (err) {
                    console.error("Failed to fetch Modal Info:", err);
                }
            }
        };
        fetchModalInfo();
    }, [id, session?.accessToken]);
    /**
     * Renders a single design specification card with an icon,
     * title, and value.
     */
    const SpecCard = ({ title, value }) => {
        const Icon = iconMap[title]
        return (
            <div className="border border-[#E5E7EB] rounded-xl px-4 py-3 bg-white ">
                <div className="flex items-start gap-2 mb-1">
                    {Icon && <Icon size={16} className="text-gray-400 mt-[2px]" />}
                    <p className="text-xs text-gray-500">{title}</p>
                </div>
                <p className="text-sm font-semibold text-[#1C2C56]">
                    {value}
                </p>
            </div>
        )
    }

    /**
     * Simple increment/decrement counter used for size range selection.
     */
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
 /**
     * Redirects to the Delivery Request Form page for the current design.
     */
    const handleRedirect = () => {
        router.push(`/dashboards/delivery-request/${id}`);
    }
        /**
     * Saves the current design configuration by calling the update
     * design API and shows a success/error notification.
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

  /**
     * Exports the current design as a PDF by calling the API and
     * opening the returned PDF URL in a new tab.
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
        <>
            <div className="w-full max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl md:p-8 p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div className="flex flex-col items-center lg:border-r lg:border-[#E5E7EB] border-r-none">
                            <div className="w-full flex justify-between items-center mb-6 px-2 sm:w-[420px]">
                                <p className="text-sm text-gray-600">Design Result</p>
                                <p className="cursor-pointer "><TbView360Number size={23} className="text-gray-600" />
                                </p>
                            </div>
                            <div className="relative flex justify-center items-center h-[720px] w-full">
                                <div style={{ position: "absolute", top: "45px" }} className="absolute sm:w-[350px] sm:h-[350px] w-[300px] h-[300px] bg-[#BFE3F9] rounded-full" />
                                <Image style={{ top: "-35px" }}
                                    src="/img/uniform/uniform.png"
                                    alt="Uniform"
                                    width={360}
                                    height={720}
                                    className="relative z-10 object-contain "
                                    priority
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="bg-white border border-[#E5E7EB] rounded-[16px] overflow-hidden">
                                <div className="px-5 py-4 bg-[#F7FBFF]">
                                    <h4 className="text-base font-semibold text-[#1C2C56]">
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
                                        <div className="border border-[#E5E7EB] rounded-xl px-4 py-3 bg-white">
                                            <p className="text-xs text-gray-500 mb-3">Size Range</p>

                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-700">XS</span>
                                                <Counter />
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-700">S</span>
                                                <Counter />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4 w-full">
                                <button
                                    onClick={handleSaveDesign}
                                    disabled={isSaving}
                                    className={`w-full sm:w-auto flex-1 flex flex-col items-center justify-center gap-2 text-xs border border-[#E5E7EB] rounded-lg bg-[#F7FBFF] text-[#1C2C56] hover:bg-[#EEF5FF] transition py-2 h-[55px] ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSaving ? <Spinner size={18} /> : <FiSave size={18} />}
                                    <span>{isSaving ? 'Saving...' : 'Save Design'}</span>
                                </button>
                                <button onClick={handleExportPdf}
                                    className="w-full sm:w-auto flex-1 flex flex-col items-center justify-center gap-2 text-xs border border-[#E5E7EB] rounded-lg bg-[#F7FBFF] text-[#1C2C56] hover:bg-[#EEF5FF] transition py-2 h-[55px]"
                                >
                                    <FiFileText size={18} />
                                    <span>Export PDF</span>
                                </button>
                                <button
                                    className=" w-full sm:w-auto flex-[2] h-[55px] bg-[#1C4FA8] text-white px-12 py-4 rounded-md flex items-center justify-center"
                                    onClick={handleRedirect}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DesignResultPage
