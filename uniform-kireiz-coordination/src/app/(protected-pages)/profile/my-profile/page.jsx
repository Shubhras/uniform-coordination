'use client'

import MyProfile from './MyProfile'
import AdaptiveCard from '@/components/shared/AdaptiveCard'

const MyProfilePage = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <MyProfile />
        </AdaptiveCard>
    )
}

export default MyProfilePage
