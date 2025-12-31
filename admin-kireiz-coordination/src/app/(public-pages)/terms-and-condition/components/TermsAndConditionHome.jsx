'use client'

import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import FooterPage from '../../footer/FooterPage';
import HaederPage from '../../header/HaederPage';
import ChatbotSection from '../../chatbot-section/ChatbotSection';
import TermsAndConditionHero from './TermsAndConditionHero';
const TermsAndConditionHome = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)
    const schema = useTheme((state) => state.themeSchema)
    const setSchema = useTheme((state) => state.setSchema)

    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    return (
        <main className="px-4 lg:px-0 text-base bg-white dark:bg-gray-900">
            <HaederPage toggleMode={toggleMode} mode={mode} />
            <TermsAndConditionHero />
            <ChatbotSection/>
           <FooterPage mode={mode} />
        </main>
    )
}

export default TermsAndConditionHome
