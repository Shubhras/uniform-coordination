'use client'

import { useState, useCallback } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import ActiveOrders from './ActiveOrders'
import CompletedOrders from './CompletedOrders'

// Orders tab list component
const OrdersList = () => {
    // Active tab & count states
    const [activeTab, setActiveTab] = useState('active-orders')
    const [activeOrdersCount, setActiveOrdersCount] = useState(0)
    const [completedOrdersCount, setCompletedOrdersCount] = useState(0)

    // Tab change handler
    const handleTabChange = (tab) => {
        setActiveTab(tab)
    }

    // Active orders count callback
    const handleActiveTotalCount = useCallback((count) => {
        setActiveOrdersCount(count)
    }, [])

    // Completed orders count callback
    const handleCompletedTotalCount = useCallback((count) => {
        setCompletedOrdersCount(count)
    }, [])

    return (
        // <div className="mx-auto w-full max-w-7xl py-6 px-4 md:px-8">
        <div className="mx-auto w-full max-w-7xl pt-[70px] pb-6 px-4 md:px-8">
            <div className="mb-5">
                <h2 className="text-2xl font-bold text-[#2C1810]">My Order & Rentals</h2>
                <p className="mt-1 text-sm text-[#8D7769]">
                    Manage your rental orders and deliveries
                </p>
            </div>

            <div className="border-b border-[#ECDDD3]">
                <div className="flex items-center gap-8">
                    <button
                        type="button"
                        onClick={() => handleTabChange('active-orders')}
                        className={`relative pb-3 text-sm font-medium ${activeTab === 'active-orders' ? 'text-[#2C1810]' : 'text-[#8D7769]'
                            }`}
                    >
                        Active Orders
                        <span className="ml-1.5 text-[11px] font-semibold text-[#B66636]">
                            {activeOrdersCount}
                        </span>
                        {activeTab === 'active-orders' ? (
                            <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#B66636]" />
                        ) : null}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabChange('completed-orders')}
                        className={`relative pb-3 text-sm font-medium ${activeTab === 'completed-orders' ? 'text-[#2C1810]' : 'text-[#8D7769]'
                            }`}
                    >
                        Completed Orders
                        <span className="ml-1.5 text-[11px] font-semibold text-[#8D7769]">
                            {completedOrdersCount}
                        </span>
                        {activeTab === 'completed-orders' ? (
                            <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#B66636]" />
                        ) : null}
                    </button>
                </div>
            </div>

            {activeTab === 'active-orders' ? (
                <ActiveOrders onTotalCountChange={handleActiveTotalCount} />
            ) : (
                <CompletedOrders onTotalCountChange={handleCompletedTotalCount} />
            )}
        </div>
    )
}

export default OrdersList
