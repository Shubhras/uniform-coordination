'use client'
import React, { useState } from "react"
import {
  IoNotificationsOutline,
  IoChevronForward,
  IoChevronBack,
} from "react-icons/io5"

const notificationsData = [
  {
    id: 1,
    title: "Quote #Q-2024-089 expiring soon",
    description: "ABC Corporation quote expires in 2 days",
    time: "2 hours ago",
  },
  {
    id: 2,
    title: "Invoice #INV-1021 generated",
    description: "New invoice generated for XYZ Ltd",
    time: "5 hours ago",
  },
  {
    id: 3,
    title: "Payment reminder",
    description: "Payment pending from Delta Corp",
    time: "1 day ago",
  },
  {
    id: 4,
    title: "Quote #Q-2024-076 approved",
    description: "Client approved the quotation",
    time: "2 days ago",
  },
  {
    id: 5,
    title: "New inquiry received",
    description: "You received a new sales inquiry",
    time: "3 days ago",
  },
  {
    id: 6,
    title: "Quote #Q-2024-089 expiring soon",
    description: "ABC Corporation quote expires in 2 days",
    time: "2 hours ago",
  },
  {
    id: 7,
    title: "Invoice #INV-1021 generated",
    description: "New invoice generated for XYZ Ltd",
    time: "5 hours ago",
  },
  {
    id: 8,
    title: "Payment reminder",
    description: "Payment pending from Delta Corp",
    time: "1 day ago",
  },
  {
    id: 9,
    title: "Quote #Q-2024-076 approved",
    description: "Client approved the quotation",
    time: "2 days ago",
  },
  {
    id: 10,
    title: "New inquiry received",
    description: "You received a new sales inquiry",
    time: "3 days ago",
  },
  {
    id: 11,
    title: "Quote #Q-2024-089 expiring soon",
    description: "ABC Corporation quote expires in 2 days",
    time: "2 hours ago",
  },
  {
    id: 12,
    title: "Invoice #INV-1021 generated",
    description: "New invoice generated for XYZ Ltd",
    time: "5 hours ago",
  },
  {
    id: 13,
    title: "Payment reminder",
    description: "Payment pending from Delta Corp",
    time: "1 day ago",
  },
  {
    id: 14,
    title: "Quote #Q-2024-076 approved",
    description: "Client approved the quotation",
    time: "2 days ago",
  },
  {
    id: 15,
    title: "New inquiry received",
    description: "You received a new sales inquiry",
    time: "3 days ago",
  },
]

const ITEMS_PER_PAGE = 6

const NotificationSetting = () => {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(
    notificationsData.length / ITEMS_PER_PAGE
  )

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentNotifications = notificationsData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  return (
    <div className="w-full bg-[#E8EEF842] md:p-8 p-5 rounded-2xl">
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
      <div className="flex flex-col gap-3 mb-6">
        {currentNotifications.map((item) => (
          <div
            key={item.id}
            className="bg-[#F2F7FF]  p-4 flex justify-between items-start"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="h-10 w-10 rounded-full bg-[#003562] flex items-center justify-center">
                <IoNotificationsOutline size={20} className="text-white" />
              </div>

              {/* Content */}
              <div>
                <h4 className="font-semibold text-sm text-[#0F172A]">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-500">
                  {item.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {item.time}
                </p>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Page {currentPage} of {totalPages}
        </span>

        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-gray-100 disabled:opacity-40  disabled:cursor-not-allowed"
          >
            <IoChevronBack />
          </button>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <IoChevronForward />
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationSetting
