'use client'

import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import PrivatePolicyHero from './PrivatePolicyHero'
import FooterPage from '../../footer/FooterPage'
import HaederPage from '../../header/HaederPage'
import ChatbotSection from '../../table-form/components/ChatbotSection'

/**
 * PrivatePolicyHome Component
 * 
 * Privacy policy page layout assembling global header, privacy policy document content, chatbot widget, and footer with theme state.
 */
const PrivatePolicyHome = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)

    /**
     * Toggles between Light and Dark theme modes.
     */
    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    return (
        <main className="text-base bg-white dark:bg-gray-900">
            <HaederPage toggleMode={toggleMode} mode={mode} />
            <PrivatePolicyHero />
            <ChatbotSection />
            <FooterPage mode={mode} />
        </main>
    )
}

export default PrivatePolicyHome

