'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import QuotationReadyDetail from '../QuotationReadyDetail'

const Page = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <QuotationReadyDetail />
        </AdaptiveCard>
    )
}

export default Page
