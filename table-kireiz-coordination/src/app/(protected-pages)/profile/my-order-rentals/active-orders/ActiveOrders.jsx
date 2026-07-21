'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { FiCalendar, FiMapPin, FiSearch } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

const activeOrders = [
    {
        id: 'ORD-2024-0091',
        date: '26 Jun 2024',
        title: 'Grand Tablecloth',
        period: '12 Jun - 26 Jun 2024',
        address: 'Otemachi Financial City, 1-9-2 Otemachi, Chiyoda-ku, Tokyo',
        amount: '¥1,680,000',
    },
    {
        id: 'ORD-2024-0091',
        date: '26 Jun 2024',
        title: 'Grand Tablecloth',
        period: '12 Jun - 26 Jun 2024',
        address: 'Otemachi Financial City, 1-9-2 Otemachi, Chiyoda-ku, Tokyo',
        amount: '¥1,680,000',
    },
    {
        id: 'ORD-2024-0091',
        date: '26 Jun 2024',
        title: 'Grand Tablecloth',
        period: '12 Jun - 26 Jun 2024',
        address: 'Otemachi Financial City, 1-9-2 Otemachi, Chiyoda-ku, Tokyo',
        amount: '¥1,680,000',
    },
]

const completedOrders = [
    {
        id: 'ORD-2024-0077',
        date: '12 May 2024',
        title: 'Grand Tablecloth',
        period: '28 Apr - 10 May 2024',
        address: 'Marunouchi Building, 2-4-1 Marunouchi, Chiyoda-ku, Tokyo',
        amount: '¥1,680,000',
    },
    {
        id: 'ORD-2024-0076',
        date: '02 May 2024',
        title: 'Grand Tablecloth',
        period: '18 Apr - 30 Apr 2024',
        address: 'Marunouchi Building, 2-4-1 Marunouchi, Chiyoda-ku, Tokyo',
        amount: '¥1,680,000',
    },
]

const OrderImage = () => (
    <div className="h-[102px] w-[98px] overflow-hidden rounded-xl border border-[#F0E4DE] bg-[radial-gradient(circle_at_top,_#fef6ee,_#f2dfcf_65%,_#ead3bf)]">
        <div className="relative h-full w-full">
            <div className="absolute left-2 right-2 top-2 h-7 rounded-full bg-[#F7EEDD]" />
            <div className="absolute left-4 right-4 top-3 h-5 rounded-full bg-[#FFFFFF]" />
            <div className="absolute left-3 right-3 top-1 h-8 rounded-full bg-[#F9F2E8]" />
            <div className="absolute left-2 right-2 top-8 h-10 rounded-t-[40px] bg-[#EED9C8]" />
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-[linear-gradient(180deg,_rgba(229,204,182,0),_rgba(224,194,166,0.9))]" />
            <div className="absolute left-4 top-3 h-10 w-1 rounded bg-[#F6E7D5]" />
            <div className="absolute right-4 top-3 h-10 w-1 rounded bg-[#F6E7D5]" />
            <div className="absolute left-7 top-2 h-2 w-2 rounded-full bg-[#E8C9B2]" />
            <div className="absolute left-9 top-1 h-2 w-2 rounded-full bg-[#F2D8C4]" />
            <div className="absolute left-11 top-2 h-2 w-2 rounded-full bg-[#EFD5C3]" />
            <div className="absolute right-8 top-2 h-2 w-2 rounded-full bg-[#F1DACA]" />
            <div className="absolute right-10 top-1 h-2 w-2 rounded-full bg-[#E9C9B1]" />
        </div>
    </div>
)

const OrdersList = ({ activeTab }) => {
    const router = useRouter()
    const orders = activeTab === 'completed-orders' ? completedOrders : activeOrders

    const handleTabChange = (tab) => {
        router.push(`/profile/my-order-rentals/${tab}`)
    }

    const handleViewDetails = (orderId) => {
        router.push(`/profile/my-order-rentals/${activeTab}/${orderId}`)
    }

    const handleTrackDelivery = (orderId) => {
        router.push(`/profile/my-order-rentals/${activeTab}/${orderId}`)
    }

    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <div className="mx-auto w-full max-w-7xl rounded-2xl bg-[#F5F0EE30] p-5 shadow-md md:p-8">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-[#2C1810]">My Order & Rentals</h2>
                    <p className="mt-1 text-sm text-[#8D7769]">
                        Manage your rental orders and deliveries
                    </p>
                </div>

                <div className="border-b border-[#ECDDD3]">
                    <div className="flex items-center gap-8">
                        <button
                            type="button"
                            onClick={() => handleTabChange('active-orders')}
                            className={`relative pb-3 text-sm font-medium ${
                                activeTab === 'active-orders'
                                    ? 'text-[#2C1810]'
                                    : 'text-[#8D7769]'
                            }`}
                        >
                            Active Orders
                            <span className="ml-1 text-[11px] text-[#B66636]">4</span>
                            {activeTab === 'active-orders' ? (
                                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#B66636]" />
                            ) : null}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('completed-orders')}
                            className={`relative pb-3 text-sm font-medium ${
                                activeTab === 'completed-orders'
                                    ? 'text-[#2C1810]'
                                    : 'text-[#8D7769]'
                            }`}
                        >
                            Completed Orders
                            <span className="ml-1 text-[11px] text-[#8D7769]">1</span>
                            {activeTab === 'completed-orders' ? (
                                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#B66636]" />
                            ) : null}
                        </button>
                    </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 md:flex-row">
                    <div className="relative flex-1">
                        <FiSearch
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C69A84]"
                        />
                        <input
                            type="text"
                            readOnly
                            value=""
                            placeholder="Search by Order ID ..."
                            className="w-full rounded-md border border-[#EFE1D8] bg-white py-2.5 pl-9 pr-4 text-sm text-[#5E463B] outline-none"
                        />
                    </div>
                    <select className="rounded-md border border-[#EFE1D8] bg-white px-3 py-2.5 text-sm text-[#9C7F6D] outline-none md:w-[120px]">
                        <option>Status</option>
                    </select>
                </div>

                <div className="mt-5 space-y-3">
                    {activeOrders.map((order, index) => (
                        <div
                            key={`${activeTab}-${order.id}-${index}`}
                            className="rounded-2xl border border-[#F0E4DE] bg-white p-3 shadow-sm md:p-4"
                        >
                            <div className="flex flex-col gap-4 md:flex-row">
                                <OrderImage />

                                <div className="flex-1">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#B49786]">
                                                {order.id} • {order.date}
                                            </p>
                                            <h3 className="mt-2 text-lg font-semibold text-[#2C1810]">
                                                {order.title}
                                            </h3>
                                        </div>
                                        <p className="text-lg font-semibold text-[#C26D3C]">
                                            {order.amount}
                                        </p>
                                    </div>

                                    <div className="mt-2 flex flex-col gap-2 text-sm text-[#7C6558]">
                                        <div className="flex items-center gap-2">
                                            <FiCalendar size={14} className="text-[#B48A73]" />
                                            <span>{order.period}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FiMapPin size={14} className="text-[#B48A73]" />
                                            <span>{order.address}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleViewDetails(order.id)}
                                            className="rounded-md border border-[#E4B292] bg-white px-4 py-2 text-sm font-medium text-[#B66636]"
                                        >
                                            View Details
                                        </button>
                                        {activeTab === 'active-orders' ? (
                                            <button
                                                type="button"
                                                onClick={() => handleTrackDelivery(order.id)}
                                                className="rounded-md border border-[#E4B292] bg-white px-4 py-2 text-sm font-medium text-[#B66636]"
                                            >
                                                Track Delivery
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdaptiveCard>
    )
}

const ActiveOrders = ({ activeTab = 'active-orders' }) => <OrdersList activeTab={activeTab} />

export default ActiveOrders
