'use client'

import ChangePassword from './ChangePassword'
import AdaptiveCard from '@/components/shared/AdaptiveCard'

const ChangePasswordPage = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <ChangePassword />
        </AdaptiveCard>
    )
}

export default ChangePasswordPage
