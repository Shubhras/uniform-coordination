'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import { FiExternalLink } from 'react-icons/fi'
import { LuPalette } from 'react-icons/lu'
import { LiaFileDownloadSolid } from 'react-icons/lia'
import { useRouter } from 'next/navigation'
import { apiSimulationExportPdf, apiSimulationHistory } from '@/services/AuthProfileService'
import { apiGetHomeData } from '@/services/HomeService'
import { useSession } from 'next-auth/react'
import { formatDate } from '@/utils/dateFormater'
import { Alert } from '@/components/ui/Alert'

const SimulationHistory = () => {
    const { data: session } = useSession();

    const [simulationData, setSimulationData] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [pdfLoadingId, setPdfLoadingId] = useState(null)
    const [pdfError, setPdfError] = useState('')


    const [filters, setFilters] = useState({
        category: '',
        sort: '',
        range: '',
    })

    const router = useRouter()

    const handleRedirect = () => {
        router.push('/dashboards/uniform-3d-design')
    }

    /* -------------------- FETCH HOME DATA (CATEGORIES) -------------------- */
    const fetchHomeData = async () => {
        try {
            const res = await apiGetHomeData()
            if (res?.status) {
                setCategories(res.data?.categories || [])
            }
        } catch (err) {
            console.error('Failed to load home data', err)
        }
    }

    const handlePdfDownload = async (id) => {   
        try {
            if (!session?.accessToken || !id) return

            setPdfLoadingId(id)
            setPdfError('')

            const res = await apiSimulationExportPdf(session.accessToken, id)

            if (res?.status && res?.pdf_url) {
                window.open(res.pdf_url, '_blank')
            } else {
                setPdfError(res?.message || 'PDF URL not found')
            }
        } catch (err) {
            console.error('Failed to download PDF', err)
            setPdfError('Failed to download PDF. Please try again.')
        } finally {
            setPdfLoadingId(null)
        }
    }


    /* -------------------- FETCH SIMULATION HISTORY -------------------- */
    const fetchSimulationHistory = async () => {
        try {
            if (!session?.accessToken) return
            setLoading(true)

            const params = {}

            if (filters.category) params.category = filters.category
            if (filters.sort) params.sort = filters.sort
            if (filters.range) params.range = filters.range

            const res = await apiSimulationHistory(session.accessToken, params)
            console.log(res)
            if (res?.status) {
                setSimulationData(res.data || [])
            }
        } catch (err) {
            console.error("Failed to load Simulation History", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHomeData()
    }, [])

    useEffect(() => {
        fetchSimulationHistory()
    }, [session?.accessToken, filters])

    return (
        <div className="w-full bg-[#E8EEF842] md:p-8 p-4 rounded-2xl max-w-7xl mx-auto shadow-md">
            {pdfError && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{pdfError}</span>
                </Alert>
            )}

            {/* HEADER */}
            <div className="mb-6">
                <h3 className="text-[#0F2A44] text-[18px] font-semibold flex items-center gap-1">
                    <LuPalette size={23} />
                    Simulation History
                </h3>
                <p className="text-[#6B7280] text-[14px] mt-1">
                    Your recent designs and customizations
                </p>
            </div>

            {/* FILTER BAR */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 mb-8">

                {/* LEFT */}
                <div className="flex gap-2">
                    <select
                        value={filters.category}
                        onChange={(e) =>
                            setFilters({ ...filters, category: e.target.value })
                        }
                        className="w-full sm:w-auto py-2 text-sm rounded-md border border-[#D0D7E2] px-4 sm:px-5 text-[#0F2A44]"
                    >
                        <option value="">Industry</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.slug}>
                                {cat.categoryName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* RIGHT */}
                <div className="flex gap-3">
                    <select
                        value={filters.sort}
                        onChange={(e) =>
                            setFilters({ ...filters, sort: e.target.value })
                        }
                        className="w-full sm:w-auto py-2 text-sm rounded-md border border-[#D0D7E2] px-4 sm:px-5 text-[#0F2A44]"
                    >
                        <option value="">Sort</option>
                        <option value="new">New</option>
                        <option value="old">Old</option>
                    </select>

                    <select
                        value={filters.range}
                        onChange={(e) =>
                            setFilters({ ...filters, range: e.target.value })
                        }
                        className="w-full sm:w-auto py-2 text-sm rounded-md border border-[#D0D7E2] px-4 sm:px-5 text-[#0F2A44]"
                    >
                        <option value="">Date Range</option>
                        <option value="30">Last 30 Days</option>
                        <option value="180">Last 6 Month</option>
                        <option value="365">Last 1 Year</option>
                    </select>
                </div>

            </div>

            {/* LOADING STATE */}
            {loading && (
                <div className="text-center py-10 text-[#6B7280] text-sm">
                    Loading simulations...
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && simulationData.length === 0 && (
                <div className="text-center py-10 text-[#6B7280] text-sm">
                    No simulation history found
                </div>
            )}

            {/* CARDS */}
            {!loading && simulationData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    {simulationData.map((item, i) => {
                        const product = item.product_details?.[0]

                        return (
                            <div
                                key={item.id || i}
                                className="bg-white border border-[#CBD5E1] rounded-2xl p-6"
                            >
                                <div className="flex justify-center mb-6">
                                    <div className="w-[240px] h-[240px] rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                                        <Image
                                            src={product?.ProductImage}
                                            width={240}
                                            height={240}
                                            alt={product?.productName || 'Product'}
                                            className="object-cover h-full w-full"
                                            unoptimized
                                        />
                                    </div>
                                </div>

                                <h4 className="text-[#1C2C56] text-[16px] font-semibold">
                                    {product?.productName || '-'}
                                </h4>

                                <p className="text-[#6B7280] text-[13px] mt-1">
                                    {formatDate(item.created_at)}
                                </p>

                                <div className="mt-6 flex gap-3">
                                    <Button
                                        className="flex-[2] bg-[#1C2C56] hover:bg-[#1C2C56] text-white py-2 rounded-md"
                                        size="sm"
                                        icon={<FiExternalLink size={16} />}
                                        onClick={handleRedirect}
                                    >
                                        OPEN
                                    </Button>

                                    <Button
                                        className="flex-[1] border border-[#1C2C56] text-[#1C2C56] rounded-md"
                                        size="sm"
                                        variant="default"
                                        icon={<LiaFileDownloadSolid />}
                                        disabled={pdfLoadingId === item.id}
                                        onClick={() => handlePdfDownload(item.id)}
                                    >
                                        {pdfLoadingId === item.id ? 'PDF...' : 'PDF'}
                                    </Button>

                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

        </div>
    )
}

export default SimulationHistory
