'use client'

import PersonalInformation from './PersonalInformation'
import AdaptiveCard from '@/components/shared/AdaptiveCard'

const PersonalInformationPage = () => {
    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <PersonalInformation />
        </AdaptiveCard>
    )
}

export default PersonalInformationPage
