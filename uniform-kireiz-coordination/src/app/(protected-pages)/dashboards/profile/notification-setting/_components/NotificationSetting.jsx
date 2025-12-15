import React from 'react'
import { IoNotificationsOutline } from 'react-icons/io5'

const NotificationSetting = () => {
  return (

    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <IoNotificationsOutline size={23} className="text-[#003562]" />
        <h3 className="text-[#003562] text-lg font-semibold">
          Notification Setting
        </h3>
      </div>
    </div>
  )
}

export default NotificationSetting