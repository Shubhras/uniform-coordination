'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import RejectedQuotationDetail from '../RejectedQuotationDetail'

const Page = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <RejectedQuotationDetail />
        </AdaptiveCard>
    )
}

export default Page
