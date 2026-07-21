'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import ContractReview from '../ContractReview'

const Page = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <ContractReview />
        </AdaptiveCard>
    )
}

export default Page
