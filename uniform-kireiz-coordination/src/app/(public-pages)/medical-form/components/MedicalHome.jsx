'use client'

import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import LandingFooter from '../../kireiz-form/components/LandingFooter'
import NavigationBar from '../../kireiz-form/components/NavigationBar'
import HeroContent from './HeroContent'
import CategorySection from './CategorySection'
import ProfessionalSection from './ProfessionalSection'
import ChatbotSection from './ChatbotSection'
import UniformTemplate from './UniformTemplate'
const MedicalHome = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)
    const schema = useTheme((state) => state.themeSchema)
    const setSchema = useTheme((state) => state.setSchema)

    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    return (
        <main className="px-4 lg:px-0 text-base bg-white dark:bg-gray-900">
            <NavigationBar toggleMode={toggleMode} mode={mode} />
            <HeroContent />
            <CategorySection />
            <UniformTemplate />
            <ProfessionalSection />
            <ChatbotSection />
            <LandingFooter mode={mode} />
        </main>
    )
}

export default MedicalHome
