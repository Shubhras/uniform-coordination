'use client'

import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import FooterPage from '../../footer/FooterPage'
import HaederPage from '../../header/HaederPage'
import TermsAndConditionHero from './TermsAndConditionHero'
import ChatbotSection from '../../table-form/components/ChatbotSection'

/**
 * TermsAndConditionHome Component
 * 
 * Terms & conditions page layout assembling global header, terms content, chatbot widget, and footer with theme state.
 */
const TermsAndConditionHome = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)
    const schema = useTheme((state) => state.themeSchema)
    const setSchema = useTheme((state) => state.setSchema)

    /**
     * Toggles between Light and Dark theme modes.
     */
    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    return (
        <main className="text-base bg-white dark:bg-gray-900">
            <HaederPage toggleMode={toggleMode} mode={mode} />
            <TermsAndConditionHero />
            <ChatbotSection />
            <FooterPage mode={mode} />
        </main>
    )
}

export default TermsAndConditionHome


