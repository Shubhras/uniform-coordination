'use client'

import NotificationSetting from './NotificationSetting'
import AdaptiveCard from '@/components/shared/AdaptiveCard'

const NotificationsPage = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <NotificationSetting />
        </AdaptiveCard>
    )
}

export default NotificationsPage
