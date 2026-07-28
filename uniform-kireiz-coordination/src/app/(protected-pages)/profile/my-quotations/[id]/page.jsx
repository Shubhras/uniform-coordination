'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { useParams } from 'next/navigation'
import QuotationDetailPage from './QuotationDetailPage'

const QuotationDetailRoutePage = () => {
    const params = useParams()

    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <QuotationDetailPage quotationId={params?.id} />
        </AdaptiveCard>
    )
}

export default QuotationDetailRoutePage
