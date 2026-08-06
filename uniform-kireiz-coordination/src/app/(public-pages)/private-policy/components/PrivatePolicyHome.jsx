'use client'

import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import PrivatePolicyHero from './PrivatePolicyHero'
import FooterPage from '../../footer/FooterPage';
import HaederPage from '../../header/HaederPage';
import ChatbotSection from '../../chatbot-section/ChatbotSection';

/**
 * PrivatePolicyHome Component.
 * Container component for rendering the Privacy Policy page layout.
 *
 * @returns {JSX.Element} Privacy Policy main view layout.
 */
const PrivatePolicyHome = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)
    const schema = useTheme((state) => state.themeSchema)
    const setSchema = useTheme((state) => state.setSchema)

    /**
     * Toggles between Light and Dark mode themes.
     */
    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    return (
        <main className="px-4 lg:px-0 text-base bg-white dark:bg-gray-900">
            <HaederPage toggleMode={toggleMode} mode={mode} />
            <PrivatePolicyHero />
            <ChatbotSection/>
           <FooterPage mode={mode} />
        </main>
    )
}

export default PrivatePolicyHome
