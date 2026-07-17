'use client'

import SimulationHistory from './SimulationHistory'
import AdaptiveCard from '@/components/shared/AdaptiveCard'

const SimulationHistoryPage = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <SimulationHistory />
        </AdaptiveCard>
    )
}

export default SimulationHistoryPage
