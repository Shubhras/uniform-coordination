'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    IoNotificationsOutline,
    IoChevronForward,
    IoChevronBack,
    IoCheckmarkCircle,
} from 'react-icons/io5'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import { apiGetNotificationList } from '@/services/NotificationService'

const ITEMS_PER_PAGE = 7

const tabs = [
    { key: 'all', label: 'All' },
    { key: 'high', label: 'High priority' },
    { key: 'medium', label: 'Medium priority' },
    { key: 'low', label: 'Low priority' },
]

const priorityConfig = {
    high: {
        label: 'High',
        bgColor: 'bg-red-100',
        textColor: 'text-red-600',
    },
    medium: {
        label: 'Medium',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
    },
    low: {
        label: 'Low',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
    },
}

const priorityOrder = { high: 0, medium: 1, low: 2 }

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

const NotificationPage = () => {
    const { session } = useCurrentSession()
    const accessToken = session?.user?.accessToken

    const [activeTab, setActiveTab] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    /* ---------- FETCH ---------- */
    const fetchNotifications = useCallback(async () => {
        if (!accessToken) return

        try {
            setLoading(true)
            const response = await apiGetNotificationList(accessToken)

            if (response?.status && response?.data) {
                // Sort by priority, then by created_at descending
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

    // Filter by tab
    const filtered = useMemo(() => {
        if (activeTab === 'all') return notifications
        return notifications.filter((n) => n.priority === activeTab)
    }, [activeTab, notifications])

    // Tab counts
    const tabCounts = useMemo(() => ({
        all: notifications.length,
        high: notifications.filter((n) => n.priority === 'high').length,
        medium: notifications.filter((n) => n.priority === 'medium').length,
        low: notifications.filter((n) => n.priority === 'low').length,
    }), [notifications])

    // Pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const currentNotifications = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    // Reset page when tab changes
    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setCurrentPage(1)
    }

    // Mark all read (local only for now)
    const handleMarkAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_seen: true })))
    }

    /* ---------- SKELETON ---------- */
    const ListSkeleton = () => (
        <div className="flex flex-col">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 md:p-5 border-b border-[#F1F5F9] animate-pulse">
                    <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-100 rounded w-full" />
                            <div className="h-3 bg-gray-100 rounded w-20" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )

    return (
        <div className="px-5 md:px-8 lg:px-12 py-8 bg-white min-h-screen">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#1C2C56]">
                        Notification
                    </h1>
                    <p className="text-sm text-[#64748B] mt-1">
                        Stay updated with alerts and activities
                    </p>
                </div>

                <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-2 text-sm text-[#1C2C56] border border-[#E2E8F0] rounded-lg px-4 py-2 hover:bg-[#F8FAFC] transition-colors"
                >
                    <IoCheckmarkCircle size={18} />
                    Mark All Read
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-[#E2E8F0] mb-6">
                <div className="flex gap-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`pb-3 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 ${activeTab === tab.key
                                ? 'text-[#1C2C56] border-[#1C2C56]'
                                : 'text-[#94A3B8] border-transparent hover:text-[#64748B]'
                                }`}
                        >
                            {tab.label}
                            <span
                                className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${activeTab === tab.key
                                    ? 'bg-[#1C2C56] text-white'
                                    : 'bg-[#F1F5F9] text-[#64748B]'
                                    }`}
                            >
                                {tabCounts[tab.key]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Notification List */}
            {loading ? (
                <ListSkeleton />
            ) : (
                <div className="flex flex-col">
                    {currentNotifications.length === 0 ? (
                        <div className="text-center py-16 text-[#94A3B8]">
                            <IoNotificationsOutline size={48} className="mx-auto mb-3 opacity-40" />
                            <p>No notifications found</p>
                        </div>
                    ) : (
                        currentNotifications.map((item) => {
                            const priority = priorityConfig[item.priority] || priorityConfig.low

                            return (
                                <div
                                    key={item.id}
                                    className="flex items-start justify-between p-4 md:p-5 border-b border-[#F1F5F9] hover:bg-[#FAFBFF] transition-colors cursor-pointer group bg-[#EFF5FF] mb-2"
                                >
                                    <div className="flex items-start gap-3 md:gap-4 flex-1">
                                        {/* Icon — dark blue bg, white icon */}
                                        <div className="w-10 h-10 rounded-full bg-[#1C2C56] flex items-center justify-center flex-shrink-0">
                                            <IoNotificationsOutline size={20} className="text-white" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-sm font-semibold text-[#0F172A]">
                                                    {item.title}
                                                </h4>

                                                {/* Priority Badge */}
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${priority.bgColor} ${priority.textColor}`}>
                                                    {priority.label}
                                                </span>

                                                {/* Unread dot */}
                                                {!item.is_seen && (
                                                    <span className="w-2 h-2 rounded-full bg-[#3B82F6] flex-shrink-0" />
                                                )}
                                            </div>

                                            <p className="text-sm text-[#64748B] mt-0.5">
                                                {item.message}
                                            </p>

                                            <p className="text-xs text-[#94A3B8] mt-1">
                                                {timeAgo(item.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
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
                                : 'border-[#1C2C56] bg-[#1C2C56] text-white hover:bg-[#142040]'
                                }`}
                        >
                            <IoChevronBack size={16} />
                        </button>

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`h-9 w-9 flex items-center justify-center rounded-md border transition-colors ${currentPage === totalPages
                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                : 'border-[#1C2C56] bg-[#1C2C56] text-white hover:bg-[#142040]'
                                }`}
                        >
                            <IoChevronForward size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationPage
