'use client'

import React, { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import {
    FiBox,
    FiClock,
    FiCheckCircle,
    FiLoader,
} from 'react-icons/fi'
import { CiDeliveryTruck } from 'react-icons/ci'
import ViewOrderPopup from './ViewOrderPopup'
import { useSession } from 'next-auth/react'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'

const ITEMS_PER_PAGE = 3
import { apiOrderAndQuotation } from '@/services/AuthProfileService'
import { formatDate } from '@/utils/dateFormater'

const tabs = ['ALL', 'Drafted', 'Submitted Request']
const tabFilterMap = {
    ALL: '',
    Drafted: 'drafted',
    'Submitted Request': 'submitted',
}

// const orders = [
//     {
//         id: '#FORM-2024-7890',
//         title: 'Medical Scrubs',
//         status: 'Drafted',
//         statusIcon: <FiClock />,
//         statusColor: 'text-red-500',
//         info: 'Delivery: Dec 20, 2024 · 120 sets',
//         amount: '¥576,000',
//     },
//     {
//         id: '#FORM-2024-5678',
//         title: 'Corporate Shirt',
//         status: 'Submitted',
//         statusIcon: <CiDeliveryTruck />,
//         statusColor: 'text-[#1C4FA8]',
//         info: 'Today, 9AM–12PM · 12 guests',
//         amount: '¥45,794',
//     },
// ]


const LinkedOrderAndQuotes = () => {
    const [activeTab, setActiveTab] = useState('ALL')
    const [selectedOrderId, setSelectedOrderId] = useState(null)

    const [dialogViewOrderOpen, setDialogViewOrderOpen] = useState(false)
    const openDialogViewOrder = (orderId) => {
        setSelectedOrderId(orderId)
        setDialogViewOrderOpen(true)
    }

    const { data: session } = useSession()

    const [orderAndQuotationData, setOrderAndQuotationData] = useState([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.ceil(orderAndQuotationData.length / ITEMS_PER_PAGE) || 1
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const currentOrders = orderAndQuotationData.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    )

    const fetchSimulationHistory = async () => {
        try {
            if (!session?.accessToken) return
            setLoading(true)

            const params = {}

            const filterValue = tabFilterMap[activeTab]
            if (filterValue) {
                params.type = filterValue
            }

            const res = await apiOrderAndQuotation(session?.accessToken, params)

            if (res?.status) {
                setOrderAndQuotationData(res.data || [])
            }
        } catch (err) {
            console.error("Failed to load order and quotation", err)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchSimulationHistory()
    }, [session?.accessToken, activeTab])


    return (
        <>
            <div className="w-full bg-[#E8EEF842] p-4 md:p-8 rounded-2xl max-w-7xl mx-auto shadow-md">
                {/* Header */}
                <div className="flex items-center gap-2 mb-1">
                    <FiBox size={18} className="text-[#003562]" />
                    <h3 className="text-base sm:text-lg font-semibold text-[#003562]">
                        Linked Orders & Quotes
                    </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-5">
                    Orders and quotes connected to your profile
                </p>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab)
                                setCurrentPage(1)
                            }}
                            className={`py-2 px-3 sm:px-5 text-xs sm:text-sm font-medium border rounded-md transition flex items-center gap-2 whitespace-nowrap
                ${activeTab === tab
                                    ? 'bg-[#1C2C56] text-white'
                                    : 'bg-white text-[#1C2C56] border-[#1C2C56]'
                                }`}
                        >
                            {tab === 'Drafted' && (
                                <FiClock
                                    size={14}
                                    className={
                                        activeTab === tab ? 'text-white' : 'text-[#1C2C56]'
                                    }
                                />
                            )}

                            {tab === 'Submitted Request' && (
                                <FiCheckCircle
                                    size={14}
                                    className={
                                        activeTab === tab ? 'text-white' : 'text-[#1C2C56]'
                                    }
                                />
                            )}

                            {tab}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <section className="relative w-full bg-white mx-auto px-5 md:px-8 lg:px-12 mt-15">
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C4FA8]"></div>
                        </div>
                    </section>
                )}

                {/* Empty State */}
                {!loading && orderAndQuotationData.length < 1 && (
                    <div className="text-center py-10 text-gray-500 text-sm">
                        No linked orders or quotes found
                    </div>
                )}

                {/* Orders */}
                {!loading && currentOrders.length > 0 && (
                    <div className="space-y-8">
                        {currentOrders.map((order, i) => (
                            <div key={i}>
                                {/* Order meta */}
                                <p className="text-[#003562] text-sm font-medium mb-1">
                                    #{order.order_no}
                                </p>
                                <h4 className="text-[#003562] text-sm sm:text-base font-semibold mb-2">
                                    {order.title}
                                </h4>

                                {/* Card */}
                                <div className="bg-white rounded-xl shadow-md p-5 mb-3">
                                    {order.status == "Drafted" && (
                                        <div className={`flex items-center gap-2 text-xs sm:text-sm font-medium mb-2 text-red-500`}>
                                            <FiClock size={18} />
                                            Status: {order.status}
                                        </div>
                                    )}
                                    {order.status == "Submitted" && (
                                        <div className={`flex items-center gap-2 text-xs sm:text-sm font-medium mb-2 text-[#1C4FA8]`}>
                                            <CiDeliveryTruck size={22} />
                                            Status: {order.status}
                                        </div>
                                    )}
                                    {order.status == "Pending" && (
                                        <div className={`flex items-center gap-2 text-xs sm:text-sm font-medium mb-2 text-orange-500`}>
                                            <FiLoader size={18} />
                                            Status: {order.status}
                                        </div>
                                    )}

                                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                                        Delivery: {formatDate(order.date)}
                                    </p>

                                    <p className="text-xs sm:text-sm text-gray-700">
                                        Amount: {order.amount}
                                    </p>
                                </div>

                                {/* Action */}
                                <Button
                                    size="sm"
                                    onClick={() => openDialogViewOrder(order.id)}
                                    className="w-full sm:w-auto bg-[#1C4FA8] hover:bg-[#1C4FA8]] px-6 text-white py-2 rounded-md"
                                >
                                    View order
                                </Button>

                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8 text-sm text-[#64748B]">
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`h-9 w-9 flex items-center justify-center rounded-md border transition-colors ${currentPage === 1
                                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                    : 'border-[#1C4FA8] bg-[#1C4FA8] text-white hover:bg-[#1C4FA8]'
                                    }`}
                            >
                                <IoChevronBack size={16} />
                            </button>

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={`h-9 w-9 flex items-center justify-center rounded-md border transition-colors ${currentPage === totalPages
                                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                    : 'border-[#1C4FA8] bg-[#1C4FA8] text-white hover:bg-[#1C4FA8]'
                                    }`}
                            >
                                <IoChevronForward size={16} />
                            </button>
                        </div>
                    </div>
                )}

            </div>

            <ViewOrderPopup
                isOpen={dialogViewOrderOpen}
                onClose={() => setDialogViewOrderOpen(false)}
                orderId={selectedOrderId}
            />

        </>
    )
}

export default LinkedOrderAndQuotes
