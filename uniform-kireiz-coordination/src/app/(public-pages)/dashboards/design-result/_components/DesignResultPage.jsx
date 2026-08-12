'use client'
import { useState, useEffect, useMemo } from 'react'
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
    "Top Colour": FiTag,
    "Bottom Colour": FiTag,
    "Fabric": FiLayers,
    "Part": FiLayers,
    "Pant": FiArchive,
    "Collar": FiLayers,
    "Sleeves": FiTag,
    "Cap": FiTag,
    "Zipper": FiArchive,
    "Cuff": FiTag,
    "Pocket": FiArchive,
    "Aprons": FiArchive,
}

// designJSON.options is keyed by the customiser's internal tool names; these are the
// labels a shopper should read.
const OPTION_LABELS = {
    collar: "Collar",
    sleeves: "Sleeves",
    cap: "Cap",
    zipper: "Zipper",
    cuff: "Cuff",
    pants: "Pant",
    pocket: "Pocket",
    aprons: "Aprons",
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
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

    const [design, setDesign] = useState(null)
    const [loading, setLoading] = useState(true)
    // Size quantities are editable here, so they live in their own state.
    const [sizes, setSizes] = useState({})

    useEffect(() => {
        // Fetches the saved design for this id. The response used to be console.logged
        // and dropped, which is why every specification below was a fixed literal.
        const fetchModalInfo = async () => {
            if (!id || !session?.accessToken) return
            try {
                setLoading(true)
                const res = await apiGetModalInfo(id, session.accessToken);
                const data = res?.data || (res?.status ? res : null)
                if (data) {
                    setDesign(data)
                    setSizes(data.config_json?.sizes || {})
                }
            } catch (err) {
                console.error("Failed to fetch Modal Info:", err);
            } finally {
                setLoading(false)
            }
        };
        fetchModalInfo();
    }, [id, session?.accessToken]);

    const config = design?.config_json || {}

    /*
     * The specification cards, built from what was actually chosen. Only choices that
     * were made appear — an empty Collar is left out rather than filled with a plausible
     * looking default, so this page reflects the design instead of describing one.
     */
    const specs = useMemo(() => {
        const rows = []

        if (config.fabric) rows.push({ title: "Fabric", value: config.fabric })
        if (config.part) rows.push({ title: "Part", value: config.part })

        const colors = config.colors || {}
        Object.entries(colors)
            .filter(([, hex]) => hex)
            .forEach(([half, hex]) =>
                rows.push({
                    title: half === "bottom" ? "Bottom Colour" : "Top Colour",
                    value: hex,
                    swatch: hex,
                }),
            )

        Object.entries(config.options || {})
            .filter(([, v]) => v)
            .forEach(([key, value]) =>
                rows.push({ title: OPTION_LABELS[key] || key, value }),
            )

        return rows
    }, [config])

    const changeSize = (label, delta) =>
        setSizes((prev) => {
            const next = Math.max(0, (Number(prev[label]) || 0) + delta)
            const copy = { ...prev }
            if (next === 0) delete copy[label]
            else copy[label] = next
            return copy
        })
    /**
     * Renders a single design specification card with an icon,
     * title, and value.
     */
    const SpecCard = ({ title, value, swatch }) => {
        const Icon = iconMap[title]
        return (
            <div className="border border-[#E5E7EB] rounded-xl px-4 py-3 bg-white ">
                <div className="flex items-start gap-2 mb-1">
                    {Icon && <Icon size={16} className="text-gray-400 mt-[2px]" />}
                    <p className="text-xs text-gray-500">{title}</p>
                </div>
                <div className="flex items-center gap-2">
                    {swatch && (
                        <span
                            className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                            style={{ background: swatch }}
                        />
                    )}
                    <p className="text-sm font-semibold text-[#1C2C56] truncate">
                        {value}
                    </p>
                </div>
            </div>
        )
    }

    /**
     * Increment/decrement counter for a size's quantity. Used to render a fixed "1" with
     * inert buttons; now it reports the real quantity and changes it.
     */
    const Counter = ({ label }) => (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => changeSize(label, -1)}
                className="w-6 h-6 rounded bg-gray-100 text-gray-600 text-sm"
            >
                −
            </button>
            <span className="text-sm font-medium w-5 text-center">
                {sizes[label] || 0}
            </span>
            <button
                type="button"
                onClick={() => changeSize(label, 1)}
                className="w-6 h-6 rounded bg-gray-100 text-gray-600 text-sm"
            >
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

        // Save what is on screen. This used to post fixed sample values, so pressing
        // Save Design overwrote the shopper's real configuration with grey / M / cotton
        // and "My Brand".
        const payload = {
            "user": session?.user?.id,
            "config_json": {
                ...config,
                "sizes": sizes,
            },
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
                                <p className="text-sm text-[#000000]">Design Result</p>
                                <p className="cursor-pointer "><TbView360Number size={23} className="text-gray-600" />
                                </p>
                            </div>
                            <div className="relative flex justify-center items-center h-[720px] w-full">
                                <div style={{ position: "absolute", top: "45px" }} className="absolute sm:w-[350px] sm:h-[350px] w-[300px] h-[300px] bg-[#BFE3F9] rounded-full" />
                                {/* The designed product's own image. The serializer resolves
                                    it from model_info -> product, so no extra call is needed.
                                    Held back while loading so the fallback picture does not
                                    flash before the real one arrives. */}
                                {loading ? (
                                    <div className="relative z-10 w-[360px] max-w-full h-[420px] rounded-2xl bg-[#F7FBFF] animate-pulse" />
                                ) : (
                                    <Image style={{ top: "-35px" }}
                                        src={design?.ProductImage || "/img/uniform/uniform.png"}
                                        alt={design?.productName || "Uniform"}
                                        width={360}
                                        height={720}
                                        className="relative z-10 object-contain "
                                        unoptimized
                                        priority
                                    />
                                )}
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
                                    {loading && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                                <div key={i} className="border border-[#E5E7EB] rounded-xl h-[74px] animate-pulse bg-[#F7FBFF]" />
                                            ))}
                                        </div>
                                    )}

                                    {/* An older design saved before the customiser's choices were
                                        persisted has nothing to show. Saying so beats printing
                                        specifications the shopper never picked. */}
                                    {!loading && specs.length === 0 && (
                                        <div className="border border-dashed border-[#CBD5E1] rounded-xl py-10 text-center">
                                            <p className="text-sm font-medium text-[#1C2C56]">
                                                No configuration was saved for this design
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Open the design tool and customise the uniform to record your choices.
                                            </p>
                                        </div>
                                    )}

                                    {!loading && specs.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                            {specs.map((s) => (
                                                <SpecCard
                                                    key={s.title}
                                                    title={s.title}
                                                    value={s.value}
                                                    swatch={s.swatch}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {!loading && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="border border-[#E5E7EB] rounded-xl px-4 py-3 bg-white sm:col-span-1">
                                                <p className="text-xs text-gray-500 mb-3">Size Range</p>

                                                {SIZE_ORDER.map((label) => (
                                                    <div
                                                        key={label}
                                                        className="flex justify-between items-center mb-2 last:mb-0"
                                                    >
                                                        <span className="text-sm text-gray-700">{label}</span>
                                                        <Counter label={label} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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
