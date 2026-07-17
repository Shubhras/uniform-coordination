'use client'

import LinkedOrderAndQuotes from './LinkedOrderAndQuotes'
import AdaptiveCard from '@/components/shared/AdaptiveCard'

const OrderHistoryPage = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <LinkedOrderAndQuotes />
        </AdaptiveCard>
    )
}

export default OrderHistoryPage
