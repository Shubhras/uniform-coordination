'use client'

import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import HeroContent from './HeroContent'
import CategorySection from './CategorySection'
import ProfessionalSection from './ProfessionalSection'
import UniformTemplate from './UniformTemplate'
import HaederPage from '../../header/HaederPage'
import FooterPage from '../../footer/FooterPage'
import ChatbotSection from '../../kireiz-form/components/ChatbotSection'
// import ChatbotSection from '../../chatbot-section/ChatbotSection'
const MedicalHome = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)
    const schema = useTheme((state) => state.themeSchema)
    const setSchema = useTheme((state) => state.setSchema)

    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    return (
        <main className="text-base bg-white dark:bg-gray-900">
            <HaederPage toggleMode={toggleMode} mode={mode} />
            <HeroContent />
            <CategorySection />
            <UniformTemplate />
            <ProfessionalSection />
            <ChatbotSection />
            <FooterPage mode={mode} />
        </main>
    )
}

export default MedicalHome
