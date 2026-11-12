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
import Pagination from "@/components/ui/Pagination"
import Spinner from "@/components/ui/Spinner"

const ITEMS_PER_PAGE = 5

const NotificationSetting = () => {
  const { data: session } = useSession()
  const token = session?.accessToken || session?.user?.accessToken
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchNotifications = async () => {
    if (!token) {
      setNotifications([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await apiGetUserNotifications(token)
      if (res?.status && Array.isArray(res?.data)) {
        setNotifications(res.data)
      } else if (Array.isArray(res?.data?.results)) {
        setNotifications(res.data.results)
      } else if (Array.isArray(res?.data)) {
        setNotifications(res.data)
      } else if (Array.isArray(res)) {
        setNotifications(res)
      } else {
        setNotifications([])
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
      setNotifications([])
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
    <div className="w-full bg-white md:p-5 p-4 rounded-2xl max-w-7xl mx-auto shadow-md border border-[#E2E8F0]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            {/* <IoNotificationsOutline size={24} className="text-[#A85A32]" /> */}
            <h3 className="text-2xl font-bold text-[#1C2C56]">
              Notifications & Alerts
            </h3>
          </div>
          <p className="text-sm text-gray-500">
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
        <div className="py-20 flex justify-center items-center">
          <Spinner size={40} customColorClass="text-[#A85A32]" />
        </div>
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
                className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${item.is_read
                  ? 'bg-gray-50/60 border-gray-200 opacity-80'
                  : 'bg-[#FAF6F3] border-[#A85A3230] shadow-sm'
                  }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  {/* Icon */}
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.is_read ? 'bg-gray-200 text-gray-600' : 'bg-[#A85A32] text-white shadow-sm'
                      }`}
                  >
                    <BadgeIcon size={20} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h4 className="text-[15px]">
                        {item.title}
                      </h4>
                      <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#A85A32] inline-block" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-snug">
                      {item.message || item.description}
                    </p>
                    <p className="text-[13px] text-gray-500 mt-1.5 flex items-center gap-1">
                      <IoTimeOutline size={14} />
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
                    <IoTrashOutline size={19} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && notifications.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex justify-end pt-4 border-t border-[#E2E8F0]">
          <Pagination
            currentPage={currentPage}
            pageSize={ITEMS_PER_PAGE}
            total={notifications.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  )
}

export default NotificationSetting
