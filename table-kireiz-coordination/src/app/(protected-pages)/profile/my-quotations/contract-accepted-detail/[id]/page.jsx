'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import ContractAcceptedDetail from '../ContractAcceptedDetail'

const Page = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <ContractAcceptedDetail />
        </AdaptiveCard>
    )
}

export default Page
