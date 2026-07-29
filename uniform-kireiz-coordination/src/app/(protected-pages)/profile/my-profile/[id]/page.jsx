'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { useParams } from 'next/navigation'
import ProfileQuotationDetail from './ProfileQuotationDetail'

const ProfileQuotationDetailPage = () => {
    const params = useParams()

    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <ProfileQuotationDetail quotationId={params?.id} />
        </AdaptiveCard>
    )
}

export default ProfileQuotationDetailPage
