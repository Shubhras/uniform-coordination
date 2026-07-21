'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import OrderConfirmed from '../OrderConfirmed'

const Page = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <OrderConfirmed />
        </AdaptiveCard>
    )
}

export default Page
