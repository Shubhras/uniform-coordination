'use client'

import { IoMailOutline } from 'react-icons/io5'
import { useRouter } from 'next/navigation'
import { notificationsData } from '@/app/(public-pages)/notifications/data/notificationsData'

const NotificationPopup = ({ onClose }) => {
    const router = useRouter()

    // Show only 3 most recent
    const recentNotifications = notificationsData.slice(0, 3)

    const handleViewAll = () => {
        onClose()
        router.push('/notifications')
    }

    return (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#E2E8F0] z-50 overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center gap-2">
                <IoMailOutline size={20} className="text-[#1C2C56]" />
                <h3 className="text-base font-semibold text-[#1C2C56]">
                    Email Notification
                </h3>
            </div>

            {/* Notification Items */}
            <div className="divide-y divide-[#F1F5F9]">
                {recentNotifications.map((item) => (
                    <div
                        key={item.id}
                        className="px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    >
                        <p className="text-sm font-medium text-[#1E293B]">
                            {item.title}
                        </p>
                        <p className="text-xs text-[#94A3B8] mt-1">
                            {item.time}
                        </p>
                    </div>
                ))}
            </div>

            {/* View All Button */}
            <div className="px-5 py-3 border-t border-[#F1F5F9]">
                <button
                    onClick={handleViewAll}
                    className="w-full text-center border border-[#1C2C56] text-[#1C2C56] rounded-lg py-2 text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
                >
                    View all Notification
                </button>
            </div>
        </div>
    )
}

export default NotificationPopup
