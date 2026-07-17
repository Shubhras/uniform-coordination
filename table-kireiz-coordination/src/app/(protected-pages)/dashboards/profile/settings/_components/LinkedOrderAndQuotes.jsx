'use client'

import React, { useState } from 'react'
import Button from '@/components/ui/Button'
import {
    FiBox,
    FiClock,
    FiCheckCircle,
} from 'react-icons/fi'
import { CiDeliveryTruck } from 'react-icons/ci'
import ViewOrderPopup from './ViewOrderPopup'

const tabs = ['ALL', 'Drafted', 'Submitted Request']

const orders = [
    {
        id: '#FORM-2024-7890',
        title: 'Medical Scrubs',
        status: 'Drafted',
        statusIcon: <FiClock />,
        statusColor: 'text-red-500',
        info: 'Delivery: Dec 20, 2024 · 120 sets',
        amount: '¥576,000',
    },
    {
        id: '#FORM-2024-5678',
        title: 'Corporate Shirt',
        status: 'Submitted',
        statusIcon: <CiDeliveryTruck />,
        statusColor: 'text-[#000000]',
        info: 'Today, 9AM–12PM · 12 guests',
        amount: '¥45,794',
    },
]

const LinkedOrderAndQuotes = () => {
    const [activeTab, setActiveTab] = useState('ALL')
    const [dialogViewOrderOpen, setDialogViewOrderOpen] = useState(false);
    const openDialogViewOrder = () => {
        setDialogViewOrderOpen(true)
    }
    return (
        <>
            <div className="w-full bg-[#F5F0EE30] p-4 md:p-8 rounded-2xl max-w-7xl mx-auto shadow-md">

                {/* Header */}
                <div className="flex items-center gap-2 mb-1">
                    <FiBox size={18} />
                    <h3 className="text-base sm:text-lg font-semibold">
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
                            onClick={() => setActiveTab(tab)}
                            className={`py-2 px-3 sm:px-5 text-xs sm:text-sm font-medium border rounded-md transition flex items-center gap-2 whitespace-nowrap
                ${activeTab === tab
                                    ? 'bg-[#A0522D] text-white'
                                    : 'bg-white text-[#A0522D] border-[#A0522D]'
                                }`}
                        >
                            {tab === 'Drafted' && (
                                <FiClock size={14} />
                            )}
                            {tab === 'Submitted Request' && (
                                <FiCheckCircle size={14} />
                            )}
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Orders */}
                <div className="space-y-8">
                    {orders.map((order, i) => (
                        <div
                            key={i}
                        >
                            {/* Order meta */}
                            <p className="text-[#A0522D] text-xs font-medium mb-1">
                                {order.id}
                            </p>
                            <h4 className="text-[#A0522D] text-sm sm:text-base font-semibold mb-2">
                                {order.title}
                            </h4>

                            {/* Status */}
                            <div className="bg-white rounded-xl shadow-md p-5 mb-3">
                                <div
                                    className={`flex items-center gap-2 text-xs sm:text-sm font-medium mb-2 ${order.statusColor}`}
                                >
                                    {order.statusIcon}
                                    Status: {order.status}
                                </div>

                                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                                    {order.info}
                                </p>

                                <p className="text-xs sm:text-sm text-gray-700">
                                    Amount: {order.amount}
                                </p>
                            </div>


                            {/* Action */}
                            <Button
                                size="sm"
                                onClick={openDialogViewOrder}
                                className="w-full sm:w-auto bg-[#A0522D] px-6 hover:bg-[#A0522D] text-white py-2 rounded-md"
                            >
                                View order
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                < div className="mt-8 text-center" >
                    <button className="text-[#8a5a75] text-xs sm:text-sm font-medium">
                        View All Orders
                    </button>
                </div>

            </div>

            <ViewOrderPopup
                isOpen={dialogViewOrderOpen}
                onClose={() => setDialogViewOrderOpen(false)}
            />
        </>

    )
}

export default LinkedOrderAndQuotes
