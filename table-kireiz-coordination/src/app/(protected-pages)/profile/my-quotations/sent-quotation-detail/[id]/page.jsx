'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import SentQuotationDetail from '../SentQuotationDetail'

const Page = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <SentQuotationDetail />
        </AdaptiveCard>
    )
}

export default Page
