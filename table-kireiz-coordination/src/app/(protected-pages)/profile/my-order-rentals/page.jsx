'use client'

import MyOrderRentals from './MyOrderRentals'
import AdaptiveCard from '@/components/shared/AdaptiveCard'

const MyOrderRentalsPage = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <MyOrderRentals />
        </AdaptiveCard>
    )
}

export default MyOrderRentalsPage
