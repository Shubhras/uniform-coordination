'use client'
import React, { useState, useEffect, useCallback } from "react"
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
import toast from "@/components/ui/toast"
import Notification from "@/components/ui/Notification"
import useCurrentSession from "@/utils/hooks/useCurrentSession"

const NotificationSetting = () => {
  const { data: nextAuthSession } = useSession()
  const { session: currentSession } = useCurrentSession()
  const session = nextAuthSession || currentSession
  const token = session?.accessToken || session?.user?.accessToken
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const fetchNotifications = useCallback(async (page = 1) => {
    if (!token) {
      setNotifications([])
      setTotalCount(0)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const params = {
        page,
        page_size: pageSize,
      }
      const res = await apiGetUserNotifications(token, params)
      if (res?.status && Array.isArray(res?.data)) {
        setNotifications(res.data)
        setTotalCount(res.count ?? res.total ?? res.data.length)
        if (res.page_size) setPageSize(res.page_size)
      } else if (Array.isArray(res?.data?.results)) {
        setNotifications(res.data.results)
        setTotalCount(res?.data?.count ?? res.data.results.length)
      } else if (Array.isArray(res)) {
        setNotifications(res)
        setTotalCount(res.length)
      } else {
        setNotifications([])
        setTotalCount(0)
      }
    } catch (err) {
      setNotifications([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [token, pageSize])

  useEffect(() => {
    fetchNotifications(currentPage)
  }, [fetchNotifications, currentPage])

  const handleMarkRead = async (id) => {
    if (id === undefined || id === null) return

    if (!token) {
      toast.push(
        <Notification title="Notice" type="info">
          Please sign in to update notifications.
        </Notification>
      )
      return
    }

    const previousNotifications = notifications

    // Optimistically mark as read
    setNotifications((prev) =>
      prev.map((item) => (String(item.id) === String(id) ? { ...item, is_read: true } : item))
    )

    try {
      const res = await apiMarkNotificationRead(token, id)
      if (res && res.status === false) {
        throw new Error(res.message || "Failed to mark notification as read.")
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('notificationsUpdated'))
      }
    } catch (err) {
      // Rollback optimistic state
      setNotifications(previousNotifications)
      toast.push(
        <Notification title="Error" type="danger">
          {err?.response?.data?.message || err?.message || "Failed to mark notification as read."}
        </Notification>
      )
    }
  }

  const handleMarkAllRead = async () => {
    if (!token) {
      toast.push(
        <Notification title="Notice" type="info">
          Please sign in to update notifications.
        </Notification>
      )
      return
    }

    const previousNotifications = notifications

    // Optimistically mark all as read
    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })))

    try {
      const res = await apiMarkNotificationRead(token, null)
      if (res && res.status === false) {
        throw new Error(res.message || "Failed to mark all notifications as read.")
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('notificationsUpdated'))
      }
    } catch (err) {
      // Rollback optimistic state
      setNotifications(previousNotifications)
      toast.push(
        <Notification title="Error" type="danger">
          {err?.response?.data?.message || err?.message || "Failed to mark all notifications as read."}
        </Notification>
      )
    }
  }

  const handleDelete = async (id) => {
    if (id === undefined || id === null) return

    if (!token) {
      toast.push(
        <Notification title="Notice" type="info">
          Please sign in to delete notifications.
        </Notification>
      )
      return
    }

    const previousNotifications = notifications

    // Optimistically remove from list
    setNotifications((prev) => prev.filter((item) => String(item.id) !== String(id)))

    try {
      const res = await apiDeleteNotification(token, id)
      if (res && res.status === false) {
        throw new Error(res.message || "Failed to delete notification.")
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('notificationsUpdated'))
      }
      setTotalCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      // Rollback optimistic state
      setNotifications(previousNotifications)
      toast.push(
        <Notification title="Error" type="danger">
          {err?.response?.data?.message || err?.message || "Failed to delete notification. Please try again."}
        </Notification>
      )
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1

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
      ) : notifications.length === 0 ? (
        <div className="py-12 text-center text-gray-400">No notifications found</div>
      ) : (
        <div className="flex flex-col gap-3 mb-6">
          {notifications.map((item) => {
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
      {!loading && totalCount > 0 && totalPages > 1 && (
        <div className="mt-6 flex justify-end pt-4 border-t border-[#E2E8F0]">
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            total={totalCount}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  )
}

export default NotificationSetting
