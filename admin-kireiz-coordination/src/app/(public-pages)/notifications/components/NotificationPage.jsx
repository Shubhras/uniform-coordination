'use client'

import { useState, useMemo } from 'react'
import {
    IoNotificationsOutline,
    IoChevronForward,
    IoChevronBack,
    IoCheckmarkCircle,
} from 'react-icons/io5'
import { FiChevronRight } from 'react-icons/fi'
import { notificationsData, priorityConfig } from '../data/notificationsData'

const ITEMS_PER_PAGE = 7

const tabs = [
    { key: 'all', label: 'All' },
    { key: 'high', label: 'High priority' },
    { key: 'low', label: 'Low priority' },
    { key: 'medium', label: 'Medium priority' },
]

const NotificationPage = () => {
    const [activeTab, setActiveTab] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [notifications, setNotifications] = useState(notificationsData)

    // Filter by tab
    const filtered = useMemo(() => {
        if (activeTab === 'all') return notifications
        return notifications.filter((n) => n.priority === activeTab)
    }, [activeTab, notifications])

    // Tab counts
    const tabCounts = useMemo(() => ({
        all: notifications.length,
        high: notifications.filter((n) => n.priority === 'high').length,
        low: notifications.filter((n) => n.priority === 'low').length,
        medium: notifications.filter((n) => n.priority === 'medium').length,
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

    // Mark all read
    const handleMarkAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }

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
            <div className="flex flex-col">
                {currentNotifications.length === 0 ? (
                    <div className="text-center py-16 text-[#94A3B8]">
                        <IoNotificationsOutline size={48} className="mx-auto mb-3 opacity-40" />
                        <p>No notifications found</p>
                    </div>
                ) : (
                    currentNotifications.map((item, idx) => {
                        const priority = priorityConfig[item.priority]
                        const isFirst = idx === 0 && currentPage === 1

                        return (
                            <div
                                key={item.id}
                                className={`flex items-start justify-between p-4 md:p-5 border-b border-[#F1F5F9] hover:bg-[#FAFBFF] transition-colors cursor-pointer group
                                    ${!item.read ? 'bg-[#F8FAFF] border-l-[3px] border-l-[#1C2C56]' : 'border-l-[3px] border-l-transparent'}
                                `}
                            >
                                <div className="flex items-start gap-3 md:gap-4 flex-1">
                                    {/* Bell icon — only on first item */}
                                    {isFirst ? (
                                        <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                                            <IoNotificationsOutline size={20} className="text-[#1C2C56]" />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 flex-shrink-0" />
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className={`text-sm font-semibold text-[#0F172A] ${!item.read ? 'underline decoration-[#1C2C56]' : ''}`}>
                                                {item.title}
                                            </h4>

                                            {/* Priority Badge */}
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${priority.bgColor} ${priority.textColor}`}>
                                                {priority.label}
                                            </span>

                                            {/* Unread dot */}
                                            {!item.read && (
                                                <span className="w-2 h-2 rounded-full bg-[#3B82F6] flex-shrink-0" />
                                            )}
                                        </div>

                                        <p className="text-sm text-[#64748B] mt-0.5">
                                            {item.description}
                                        </p>

                                        <p className="text-xs text-[#94A3B8] mt-1">
                                            {item.time}
                                        </p>
                                    </div>
                                </div>

                                {/* Arrow */}
                                {isFirst && (
                                    <FiChevronRight
                                        size={18}
                                        className="text-[#94A3B8] group-hover:text-[#1C2C56] flex-shrink-0 mt-2 transition-colors"
                                    />
                                )}
                            </div>
                        )
                    })
                )}
            </div>

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
