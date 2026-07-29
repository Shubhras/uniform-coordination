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
import Pagination from '@/components/ui/Pagination'
import { formatUSDate as formatDate } from '@/utils/formatDate'
import { HiCheck } from 'react-icons/hi'

// const ITEMS_PER_PAGE = 8

const CustomOption = (props) => {
    const { innerProps, label, isSelected, isDisabled } = props
    return (
        <div
            className={`flex items-center justify-between px-3 py-1.5 cursor-pointer ${isSelected ? 'text-[#A0522D] bg-[#F2F7FF]' : 'text-[#1C2C56] hover:bg-gray-100'
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

const SimulationHistory = () => {
    const { data: session } = useSession()

    const [simulationData, setSimulationData] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [pdfLoadingId, setPdfLoadingId] = useState(null)
    const [pdfError, setPdfError] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(8)
    const [totalCount, setTotalCount] = useState(0)
    const [filters, setFilters] = useState({
        category: '',
        sort: 'new',
        range: '30',
    })

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
            const params = {
                page: currentPage,
                page_size: pageSize,
            }

            if (filters.category) params.category = filters.category
            if (filters.sort) params.sort = filters.sort
            if (filters.range) params.range = filters.range

            const res = await apiSimulationHistory(session.accessToken, params)

            let list = []
            let total = 0

            if (res?.status && Array.isArray(res?.data)) {
                list = res.data
                total = res?.pagination?.total_records ?? res?.total ?? res?.count ?? res?.data?.length ?? 0
            } else if (res?.results && Array.isArray(res?.results)) {
                list = res.results
                total = res?.pagination?.total_records ?? res?.count ?? res?.results?.length ?? 0
            } else if (Array.isArray(res)) {
                list = res
                total = res.length
            }

            setSimulationData(list)
            setTotalCount(total)
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
        setCurrentPage(1)
    }, [filters])

    useEffect(() => {
        fetchSimulationHistory()
    }, [session?.accessToken, filters, currentPage])

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
                <div className="flex gap-2 w-full sm:w-auto relative z-10">
                    <Select
                        instanceId="simulation-category-select"
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
                            control: (base) => ({
                                ...base,
                                borderRadius: '10px',
                                borderColor: '#E7D8D0',
                                borderStyle: 'solid',
                                borderWidth: '1px',
                                backgroundColor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '2px 4px',
                                cursor: 'pointer',
                                boxShadow: 'none',
                                '&:hover': { borderColor: '#D7B7A3' },
                            }),
                            menu: (base) => ({
                                ...base,
                                marginTop: '4px',
                                borderRadius: '14px',
                                padding: '6px',
                                overflow: 'hidden',
                            }),
                            menuList: (base) => ({
                                ...base,
                                paddingTop: 0,
                                paddingBottom: 0,
                                maxHeight: '220px',
                                overflowY: 'auto',
                            }),
                            singleValue: () => ({ color: '#A0522D', fontWeight: 500, fontSize: '14px' })
                        }}
                        maxMenuHeight={220}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-end relative z-10 ">
                    <Select
                        instanceId="simulation-sort-select"
                        options={sortOptions}
                        value={sortOptions.find((o) => o.value === filters.sort) || sortOptions[0]}
                        onChange={(selected) =>
                            setFilters({ ...filters, sort: selected?.value || '' })
                        }
                        className="w-full min-w-[180px]"
                        components={{ Option: CustomOption }}
                        styles={{
                            control: (base) => ({
                                ...base,
                                borderRadius: '10px',
                                borderColor: '#E7D8D0',
                                borderStyle: 'solid',
                                borderWidth: '1px',
                                backgroundColor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '2px 4px',
                                cursor: 'pointer',
                                boxShadow: 'none',
                                '&:hover': { borderColor: '#D7B7A3' },
                            }),
                            menu: (base) => ({
                                ...base,
                                marginTop: '4px',
                                borderRadius: '14px',
                                padding: '6px',
                                overflow: 'hidden',
                            }),
                            menuList: (base) => ({
                                ...base,
                                paddingTop: 0,
                                paddingBottom: 0,
                                maxHeight: '220px',
                                overflowY: 'auto',
                            }),
                            singleValue: () => ({ color: '#A0522D', fontWeight: 500, fontSize: '14px' })
                        }}
                        maxMenuHeight={220}
                    />
                    <Select
                        instanceId="simulation-range-select"
                        options={rangeOptions}
                        value={rangeOptions.find((o) => o.value === filters.range) || rangeOptions[0]}
                        onChange={(selected) =>
                            setFilters({ ...filters, range: selected?.value || '' })
                        }
                        className="w-full min-w-[180px]"
                        components={{ Option: CustomOption }}
                        styles={{
                            control: (base) => ({
                                ...base,
                                borderRadius: '10px',
                                borderColor: '#E7D8D0',
                                borderStyle: 'solid',
                                borderWidth: '1px',
                                backgroundColor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '2px 4px',
                                cursor: 'pointer',
                                boxShadow: 'none',
                                '&:hover': { borderColor: '#D7B7A3' },
                            }),
                            menu: (base) => ({
                                ...base,
                                marginTop: '4px',
                                borderRadius: '14px',
                                padding: '6px',
                                overflow: 'hidden',
                            }),
                            menuList: (base) => ({
                                ...base,
                                paddingTop: 0,
                                paddingBottom: 0,
                                maxHeight: '220px',
                                overflowY: 'auto',
                            }),
                            singleValue: () => ({ color: '#A0522D', fontWeight: 500, fontSize: '14px' })
                        }}
                        maxMenuHeight={220}
                    />
                </div>
            </div>

            {loading ? (
                <section className="relative w-full bg-white mx-auto px-5 md:px-8 lg:px-12 mt-15">
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0522D]"></div>
                    </div>
                </section>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {simulationData.map((item) => (
                            <div
                                key={item?.id}
                                className="bg-[#F5F0EE] border border-[#D0BEB6] rounded-2xl overflow-hidden"
                            >
                                <div className="flex justify-center mb-3 px-3 pt-3">
                                    <Image
                                        src={item?.ProductImage || '/img/no-image.png'}
                                        alt={item?.productName || 'Simulation'}
                                        width={240}
                                        height={240}
                                        className="w-full h-auto object-cover rounded-lg"
                                        unoptimized
                                    />
                                </div>

                                <div className="p-3 sm:p-4">
                                    <h4 className="text-sm sm:text-[16px] font-semibold">
                                        {item?.productName}
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

                    {simulationData.length === 0 && (
                        <div className="text-center py-12 text-[#6B7280]">
                            No simulation history found.
                        </div>
                    )}

                    {totalCount > pageSize && (
                        <div className="flex justify-end mt-8">
                            <Pagination
                                onChange={(page) => setCurrentPage(page)}
                                currentPage={currentPage}
                                total={totalCount}
                                pageSize={pageSize}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default SimulationHistory
