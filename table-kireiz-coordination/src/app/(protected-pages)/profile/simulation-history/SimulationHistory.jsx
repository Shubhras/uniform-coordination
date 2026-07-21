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
import { Alert } from '@/components/ui/Alert'
import Select from '@/components/ui/Select'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { HiCheck } from 'react-icons/hi'

const ITEMS_PER_PAGE = 8

const CustomOption = (props) => {
    const { innerProps, label, isSelected, isDisabled } = props
    return (
        <div
            className={`flex items-center justify-between px-3 py-2 cursor-pointer ${
                isSelected ? 'text-[#1C4FA8] bg-[#F2F7FF]' : 'text-[#1C2C56] hover:bg-gray-100'
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            {...innerProps}
        >
            <span className="ml-2 text-sm font-medium">{label}</span>
            {isSelected && <HiCheck className="text-lg" />}
        </div>
    )
}

const sortOptions = [
    { value: '', label: 'Sort' },
    { value: 'new', label: 'Newest' },
    { value: 'old', label: 'Oldest' },
]

const rangeOptions = [
    { value: '', label: 'Select Date Range' },
    { value: '30', label: 'Last 30 Days' },
    { value: '180', label: 'Last 6 Month' },
    { value: '365', label: 'Last 1 Year' },
]

const formatDate = (date) => {
    if (!date) return ''

    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

const SimulationHistory = () => {
    const { data: session } = useSession()

    const [simulationData, setSimulationData] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [pdfLoadingId, setPdfLoadingId] = useState(null)
    const [pdfError, setPdfError] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [filters, setFilters] = useState({
        category: '',
        sort: 'new',
        range: '30',
    })

    const totalPages = Math.ceil(simulationData.length / ITEMS_PER_PAGE) || 1
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const currentSimulations = simulationData.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    const router = useRouter()

    const handleRedirect = (id) => {
        router.push(`/dashboards/design-result/${id}`)
    }

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

    const fetchSimulationHistory = async () => {
        try {
            if (!session?.accessToken) return
            setLoading(true)
            setCurrentPage(1)
            const params = {}

            if (filters.category) params.category = filters.category
            if (filters.sort) params.sort = filters.sort
            if (filters.range) params.range = filters.range

            const res = await apiSimulationHistory(session.accessToken, params)
            if (res?.status) {
                setSimulationData(res.data || [])
            }
        } catch (err) {
            console.error('Failed to load Simulation History', err)
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
        <div className="w-full bg-[#F5F0EE30] p-4 sm:p-5 md:p-8 rounded-2xl max-w-7xl mx-auto shadow-md">
            {pdfError && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{pdfError}</span>
                </Alert>
            )}

            <div className="mb-6">
                <h3 className="text-base sm:text-[18px] font-semibold flex items-center gap-2">
                    <LuPalette size={20} className="sm:hidden" />
                    <LuPalette size={23} className="hidden sm:block" />
                    Simulation History
                </h3>
                <p className="text-[#6B7280] text-xs sm:text-[14px] mt-1">
                    Your recent designs and customizations
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex gap-2 w-full sm:w-auto z-[60]">
                    <Select
                        options={[
                            { value: '', label: 'All Industry' },
                            ...categories.map((cat) => ({
                                value: cat.slug,
                                label: cat.categoryName,
                            })),
                        ]}
                        value={
                            [
                                { value: '', label: 'All Industry' },
                                ...categories.map((cat) => ({
                                    value: cat.slug,
                                    label: cat.categoryName,
                                })),
                            ].find((o) => o.value === filters.category) || {
                                value: '',
                                label: 'All Industry',
                            }
                        }
                        onChange={(selected) =>
                            setFilters({ ...filters, category: selected?.value || '' })
                        }
                        className="w-full min-w-[180px]"
                        components={{ Option: CustomOption }}
                        styles={{
                            control: () => ({
                                borderRadius: '10px',
                                borderColor: '#B2C7E3',
                                borderStyle: 'solid',
                                borderWidth: '1px',
                                backgroundColor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '4px 8px',
                                cursor: 'pointer',
                            }),
                            singleValue: () => ({
                                color: '#1C2C56',
                                fontWeight: 500,
                                fontSize: '14px',
                            }),
                            placeholder: () => ({
                                color: '#1C2C56',
                                fontWeight: 500,
                                fontSize: '14px',
                            }),
                        }}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-end z-[50]">
                    <Select
                        options={sortOptions}
                        value={sortOptions.find((o) => o.value === filters.sort) || sortOptions[0]}
                        onChange={(selected) =>
                            setFilters({ ...filters, sort: selected?.value || '' })
                        }
                        className="w-full min-w-[180px]"
                        components={{ Option: CustomOption }}
                        styles={{
                            control: () => ({
                                borderRadius: '10px',
                                borderColor: '#B2C7E3',
                                borderStyle: 'solid',
                                borderWidth: '1px',
                                backgroundColor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '4px 8px',
                                cursor: 'pointer',
                            }),
                            singleValue: () => ({
                                color: '#1C2C56',
                                fontWeight: 500,
                                fontSize: '14px',
                            }),
                        }}
                    />
                    <Select
                        options={rangeOptions}
                        value={rangeOptions.find((o) => o.value === filters.range) || rangeOptions[0]}
                        onChange={(selected) =>
                            setFilters({ ...filters, range: selected?.value || '' })
                        }
                        className="w-full min-w-[160px]"
                        components={{ Option: CustomOption }}
                        styles={{
                            control: () => ({
                                borderRadius: '10px',
                                borderColor: '#B2C7E3',
                                borderStyle: 'solid',
                                borderWidth: '1px',
                                backgroundColor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '4px 8px',
                                cursor: 'pointer',
                            }),
                            singleValue: () => ({
                                color: '#1C2C56',
                                fontWeight: 500,
                                fontSize: '14px',
                            }),
                        }}
                    />
                </div>
            </div>

            {loading ? (
                <section className="relative w-full bg-white mx-auto px-5 md:px-8 lg:px-12 mt-15">
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C4FA8]"></div>
                    </div>
                </section>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {currentSimulations.map((item) => (
                            <div
                                key={item?.id}
                                className="bg-[#F5F0EE] border border-[#D0BEB6] rounded-2xl overflow-hidden"
                            >
                                <div className="flex justify-center mb-3 px-3 pt-3">
                                    <Image
                                        src={item?.image || '/img/no-image.png'}
                                        alt={item?.category_name || 'Simulation'}
                                        width={240}
                                        height={320}
                                        className="w-full h-auto object-cover rounded-lg"
                                    />
                                </div>

                                <div className="p-3 sm:p-4">
                                    <h4 className="text-sm sm:text-[16px] font-semibold">
                                        {item?.category_name}
                                    </h4>
                                    <p className="text-xs sm:text-[13px] mt-1 text-[#6B7280]">
                                        {formatDate(item?.created_at)}
                                    </p>

                                    <div className="mt-5 flex gap-3">
                                        <Button
                                            className="flex-[2] bg-[#A0522D] hover:bg-[#A0522D] text-white py-2 rounded-md text-xs sm:text-sm"
                                            size="sm"
                                            icon={<FiExternalLink size={14} />}
                                            onClick={() => handleRedirect(item?.id)}
                                        >
                                            OPEN
                                        </Button>

                                        <Button
                                            className="flex-[1] border border-[#A0522D] text-[#A0522D] rounded-md text-xs sm:text-sm"
                                            size="sm"
                                            variant="default"
                                            icon={<LiaFileDownloadSolid size={14} />}
                                            onClick={() => handlePdfDownload(item?.id)}
                                            disabled={pdfLoadingId === item?.id}
                                        >
                                            {pdfLoadingId === item?.id ? '...' : 'PDF'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {currentSimulations.length === 0 && (
                        <div className="text-center py-12 text-[#6B7280]">
                            No simulation history found.
                        </div>
                    )}

                    {simulationData.length > ITEMS_PER_PAGE && (
                        <div className="flex items-center justify-center gap-3 mt-8">
                            <button
                                type="button"
                                className="w-9 h-9 rounded-full border border-[#CBD5E1] flex items-center justify-center text-[#0F2A44] disabled:opacity-50"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <IoChevronBack />
                            </button>
                            <span className="text-sm text-[#0F2A44]">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                type="button"
                                className="w-9 h-9 rounded-full border border-[#CBD5E1] flex items-center justify-center text-[#0F2A44] disabled:opacity-50"
                                onClick={() =>
                                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                }
                                disabled={currentPage === totalPages}
                            >
                                <IoChevronForward />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default SimulationHistory
