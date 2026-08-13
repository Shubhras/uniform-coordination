'use client'

import { useState, useEffect, useCallback } from 'react'
import { IoNotificationsOutline } from 'react-icons/io5'
import { useRouter } from 'next/navigation'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import { apiGetNotificationList } from '@/services/NotificationService'
const priorityOrder = { high: 0, medium: 1, low: 2 }
import { useTranslations } from "next-intl";

const timeAgo = (dateString) => {
    if (!dateString) return ''
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
}

const priorityDot = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-gray-400',
}

const NotificationPopup = ({ onClose }) => {
    const router = useRouter()
    const { session } = useCurrentSession()
    const accessToken = session?.user?.accessToken

    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchNotifications = useCallback(async () => {
        if (!accessToken) return

        try {
            setLoading(true)
            const response = await apiGetNotificationList(accessToken)

            if (response?.status && response?.data) {
                // Sort by priority (high → medium → low), then by created_at descending
                const sorted = [...response.data].sort((a, b) => {
                    const pA = priorityOrder[a.priority] ?? 3
                    const pB = priorityOrder[b.priority] ?? 3
                    if (pA !== pB) return pA - pB
                    return new Date(b.created_at) - new Date(a.created_at)
                })
                setNotifications(sorted)
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setLoading(false)
        }
    }, [accessToken])

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    // Show only top 3 highest-priority notifications
    const topNotifications = notifications.slice(0, 3)
    const unseenCount = notifications.filter((n) => !n.is_seen).length

    const handleViewAll = () => {
        onClose()
        router.push('/notifications')
    }
const t = useTranslations("notifications");
    return (
        <div className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-18 md:top-full md:mt-2 md:w-80 bg-white rounded-xl shadow-lg border border-[#E2E8F0] z-50 overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#A0522D] flex items-center justify-center">
                        <IoNotificationsOutline size={16} className="text-white font-semibold" />
                    </div>
                    <h3 className="text-base font-semibold text-[#1C2C56]">
                        {t("title")}
                    </h3>
                </div>
                {unseenCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {unseenCount}
                    </span>
                )}
            </div>

            {/* Notification Items */}
            <div className="divide-y divide-[#F1F5F9]">
                {loading ? (
                    <div className="space-y-0 divide-y divide-[#F1F5F9]">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="px-5 py-4 animate-pulse">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-100 rounded w-full" />
                                        <div className="h-2.5 bg-gray-100 rounded w-16" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : topNotifications.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                        <IoNotificationsOutline size={28} className="mx-auto mb-2 text-[#CBD5E1]" />
                        <p className="text-sm text-[#94A3B8]">{t("notfoundnotification")}</p>
                    </div>
                ) : (
                    topNotifications.map((item) => (
                        <div
                            key={item.id}
                            className={`px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors cursor-pointer ${!item.is_seen ? 'bg-[#F8FAFF]' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Icon — dark blue bg, white icon */}
                                <div className="w-8 h-8 rounded-full bg-[#1C2C56] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <IoNotificationsOutline size={14} className="text-white" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-[#1E293B] truncate">
                                            {item.title}
                                        </p>
                                        {/* Priority dot */}
                                        <span
                                            className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[item.priority] || 'bg-gray-300'}`}
                                        />
                                        {/* Unread indicator */}
                                        {!item.is_seen && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-[#64748B] mt-0.5 line-clamp-1">
                                        {item.message}
                                    </p>
                                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                                        {timeAgo(item.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* View All Button */}
            <div className="px-5 py-3 border-t border-[#F1F5F9]">
                <button
                    onClick={handleViewAll}
                    className="w-full text-center border border-[#1C2C56] text-[#1C2C56] rounded-lg py-2 text-sm font-semibold hover:bg-[#FCF7F3] transition-colors"
                >
                    {t("viewAllNotify")}
                </button>
            </div>
        </div>
    )
}

export default NotificationPopup
