'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import SignedQuotationDetail from '../SignedQuotationDetail'

const Page = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <SignedQuotationDetail />
        </AdaptiveCard>
    )
}

export default Page
