'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import ContractInbox from '../ContractInbox'

const Page = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <ContractInbox />
        </AdaptiveCard>
    )
}

export default Page
