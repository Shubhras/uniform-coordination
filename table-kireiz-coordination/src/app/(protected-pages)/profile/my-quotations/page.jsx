'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import MyQuotations from './MyQuotations'

const MyQuotationsPage = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <MyQuotations />
        </AdaptiveCard>
    )
}

export default MyQuotationsPage
