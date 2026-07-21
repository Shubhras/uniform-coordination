'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import CloudSignSignature from '../CloudSignSignature'

const Page = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <CloudSignSignature />
        </AdaptiveCard>
    )
}

export default Page
