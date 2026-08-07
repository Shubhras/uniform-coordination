'use client'

import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import React from 'react'
import FaqHero from './FaqHero'
import FaqSection from './FaqSection'
import HaederPage from '../../header/HaederPage'
import FooterPage from '../../footer/FooterPage'
import ChatbotSection from '../../kireiz-form/components/ChatbotSection'

/**
 * FaqHome Component.
 * Main container for the Frequently Asked Questions (FAQ) page.
 * Manages theme mode state and renders header, hero, FAQ accordion, chatbot widget, and footer.
 *
 * @returns {JSX.Element} FAQ page layout container.
 */
const FaqHome = () => {
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
        <main className=" text-base bg-white dark:bg-gray-900">
            <HaederPage toggleMode={toggleMode} mode={mode} />
            <FaqHero />
            <FaqSection />
            <ChatbotSection/>
            <FooterPage mode={mode} />
        </main>
    )
}

export default FaqHome