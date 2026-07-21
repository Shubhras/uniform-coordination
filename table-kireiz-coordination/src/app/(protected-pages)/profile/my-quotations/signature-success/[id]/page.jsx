'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import SignatureSuccess from '../SignatureSuccess'

const Page = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <SignatureSuccess />
        </AdaptiveCard>
    )
}

export default Page
