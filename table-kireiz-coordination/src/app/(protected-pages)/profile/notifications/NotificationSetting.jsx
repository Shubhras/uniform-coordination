'use client'
import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  IoNotificationsOutline,
  IoChevronForward,
  IoChevronBack,
  IoCheckmarkDoneOutline,
  IoTrashOutline,
  IoCarOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoDocumentTextOutline,
  IoWarningOutline
} from "react-icons/io5"
import {
  apiGetUserNotifications,
  apiMarkNotificationRead,
  apiDeleteNotification
} from "@/services/AuthProfileService"

// Default fallbacks matching user's requested notification modules
const defaultNotifications = [
  {
    id: 'def-1',
    title: 'Shipping Notification',
    message: 'Your order #ORD26-00005 has been shipped and is on its way to your location.',
    notification_type: 'shipping',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    is_read: false,
  },
  {
    id: 'def-2',
    title: 'Return Reminder Notification',
    message: 'Reminder: Rental return date for order #ORD26-00005 is approaching in 2 days.',
    notification_type: 'return_reminder',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    is_read: false,
  },
  {
    id: 'def-3',
    title: 'Return Received Notification',
    message: 'We have received your returned rental items for order #ORD26-00004.',
    notification_type: 'return_received',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    is_read: true,
  },
  {
    id: 'def-4',
    title: 'Return Not Received Notification',
    message: 'Action Required: Return deadline passed for order #ORD26-00003. Please dispatch return items.',
    notification_type: 'return_not_received',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    is_read: false,
  },
  {
    id: 'def-5',
    title: 'Late Fee Notification',
    message: 'A late fee invoice #INV-LF-001 has been generated for overdue rental items.',
    notification_type: 'late_fee',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    is_read: false,
  },
  {
    id: 'def-6',
    title: 'Lost Item Notification',
    message: 'Item inspection completed: 1 napkin reported missing in order #ORD26-00002.',
    notification_type: 'lost_item',
    created_at: new Date(Date.now() - 3600000 * 60).toISOString(),
    is_read: true,
  },
  {
    id: 'def-7',
    title: 'Compensation Charge Notice',
    message: 'A compensation charge notice of $45.00 has been issued for item damage inspection.',
    notification_type: 'compensation_charge',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    is_read: false,
  },
]

const ITEMS_PER_PAGE = 5

const NotificationSetting = () => {
  const { data: session } = useSession()
  const token = session?.user?.accessToken
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchNotifications = async () => {
    if (!token) {
      setNotifications(defaultNotifications)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await apiGetUserNotifications(token)
      if (res?.status && Array.isArray(res?.data)) {
        setNotifications(res.data)
      } else {
        setNotifications(defaultNotifications)
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
      setNotifications(defaultNotifications)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [token])

  const handleMarkRead = async (id) => {
    if (token && id !== undefined && id !== null) {
      try {
        await apiMarkNotificationRead(token, id)
      } catch (err) {
        console.error("Failed to mark read:", err)
      }
    }
    setNotifications((prev) =>
      prev.map((item) => (String(item.id) === String(id) ? { ...item, is_read: true } : item))
    )
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('notificationsUpdated'))
    }
  }

  const handleMarkAllRead = async () => {
    if (token) {
      try {
        await apiMarkNotificationRead(token, null)
      } catch (err) {
        console.error("Failed to mark all read:", err)
      }
    }
    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('notificationsUpdated'))
    }
  }

  const handleDelete = async (id) => {
    if (token && id !== undefined && id !== null) {
      try {
        await apiDeleteNotification(token, id)
      } catch (err) {
        console.error("Failed to delete notification:", err)
      }
    }
    setNotifications((prev) => prev.filter((item) => String(item.id) !== String(id)))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('notificationsUpdated'))
    }
  }

  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE) || 1
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentNotifications = notifications.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1)
  }

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1)
  }

  const getTypeBadge = (type) => {
    switch (type) {
      case 'shipping':
        return { label: 'Shipping', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: IoCarOutline }
      case 'return_reminder':
        return { label: 'Return Reminder', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: IoTimeOutline }
      case 'return_received':
        return { label: 'Return Received', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: IoCheckmarkDoneOutline }
      case 'return_not_received':
        return { label: 'Return Overdue', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: IoAlertCircleOutline }
      case 'late_fee':
        return { label: 'Late Fee', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: IoDocumentTextOutline }
      case 'lost_item':
        return { label: 'Lost Item', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: IoWarningOutline }
      case 'compensation_charge':
        return { label: 'Compensation Notice', color: 'bg-red-100 text-red-700 border-red-200', icon: IoAlertCircleOutline }
      default:
        return { label: 'Notification', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: IoNotificationsOutline }
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="w-full bg-white md:p-8 p-5 rounded-2xl max-w-7xl mx-auto shadow-md border border-[#E2E8F0]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <IoNotificationsOutline size={24} className="text-[#A85A32]" />
            <h3 className="text-xl font-bold text-[#1C2C56]">
              Notifications & Alerts
            </h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Stay updated with your shipping, rentals, returns, and order activity
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#A85A32] bg-[#A85A3215] hover:bg-[#A85A3225] rounded-lg transition-colors"
          >
            <IoCheckmarkDoneOutline size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-12 text-center text-gray-400">Loading notifications...</div>
      ) : currentNotifications.length === 0 ? (
        <div className="py-12 text-center text-gray-400">No notifications found</div>
      ) : (
        <div className="flex flex-col gap-3 mb-6">
          {currentNotifications.map((item) => {
            const badge = getTypeBadge(item.notification_type || item.type)
            const BadgeIcon = badge.icon
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                  item.is_read
                    ? 'bg-gray-50/60 border-gray-200 opacity-80'
                    : 'bg-[#FAF6F3] border-[#A85A3230] shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  {/* Icon */}
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.is_read ? 'bg-gray-200 text-gray-600' : 'bg-[#A85A32] text-white shadow-sm'
                    }`}
                  >
                    <BadgeIcon size={20} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm text-[#1C2C56]">
                        {item.title}
                      </h4>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#A85A32] inline-block" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-snug">
                      {item.message || item.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <IoTimeOutline size={13} />
                      {formatDate(item.created_at || item.time)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!item.is_read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkRead(item.id)
                      }}
                      title="Mark as read"
                      className="p-1.5 text-gray-400 hover:text-[#A85A32] hover:bg-[#A85A3220] rounded-md transition-all cursor-pointer"
                    >
                      <IoCheckmarkDoneOutline size={20} className="text-[#A85A32]" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(item.id)
                    }}
                    title="Delete notification"
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  >
                    <IoTrashOutline size={17} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-[#E2E8F0]">
          <span>
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="h-8 w-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <IoChevronBack size={16} />
            </button>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <IoChevronForward size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationSetting
