'use client'
import React, { useState, useEffect } from "react"
import useCurrentSession from "@/utils/hooks/useCurrentSession"
import { apiGetNotifications } from "@/services/AuthProfileService"
import { IoNotificationsOutline } from "react-icons/io5"
import Pagination from "@/components/ui/Pagination"

const NotificationSetting = () => {
  const { session } = useCurrentSession()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (session?.user?.accessToken) {
        setLoading(true)
        try {
          const res = await apiGetNotifications(session.user.accessToken, currentPage)
          const data = res?.data || []
          setNotifications(Array.isArray(data) ? data : [])
          const pages = res?.total_pages || 1
          setTotalPages(pages)
          const size = res?.page_size || res?.limit || 10
          setPageSize(size)
          const count =
            res?.count ??
            res?.total ??
            res?.total_items ??
            res?.pagination?.total_items ??
            pages * size
          setTotalCount(count)
        } catch (error) {
          console.error("Error fetching notifications:", error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchNotifications()
  }, [session?.user?.accessToken, currentPage])

  return (
    <div className="w-full bg-[#E8EEF842] md:p-8 p-5 rounded-2xl max-w-7xl mx-auto shadow-md">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-4">
        <div className="flex items-center gap-2">
          <IoNotificationsOutline size={23} className="text-[#003562]" />
          <h3 className="text-[#003562] text-lg font-semibold">
            Notification Setting
          </h3>
        </div>
        <p className="text-sm text-gray-500">
          Stay updated with alerts and activities
        </p>
      </div>

      {/* Notifications List */}
      {loading ? (
        <section className="relative w-full bg-transparent mx-auto px-5 md:px-8 lg:px-12 mt-15 mb-6">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C4FA8]"></div>
          </div>
        </section>
      ) : notifications.length === 0 ? (
        <div className="text-center py-10 text-sm text-gray-500 mb-6">
          No notifications found.
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-6">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex justify-between items-start rounded-xl ${!item.is_seen ? 'bg-white' : 'bg-white border border-[#E2E8F0]'}`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="h-10 w-10 rounded-full bg-[#1C4FA8] flex items-center justify-center shrink-0">
                  <IoNotificationsOutline size={20} className="text-white" />
                </div>

                {/* Content */}
                <div>
                  <h4 className="font-semibold text-sm text-[#0F172A]">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {item.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.created_at).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-5">
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
