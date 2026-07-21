'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import MakePayment from '../MakePayment'

const Page = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <MakePayment />
        </AdaptiveCard>
    )
}

export default Page
