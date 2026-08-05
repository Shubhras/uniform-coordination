'use client'

import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import React from 'react'
import SingleBlogSection from './SIngleBlogSection'
import HaederPage from '../../../header/HaederPage'
import FooterPage from '../../../footer/FooterPage'
import ChatbotSection from '../../../chatbot-section/ChatbotSection'

/**
 * SingleBlogHome Component.
 * Main container for individual blog post detail page view.
 *
 * @returns {JSX.Element} Single blog post container layout.
 */
const SingleBlogHome = () => {
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
        <main className=" text-base bg-white dark:bg-gray-900">
            <HaederPage toggleMode={toggleMode} mode={mode} />
            <SingleBlogSection />
            <ChatbotSection/>
            <FooterPage mode={mode} />
        </main>
    )
}

export default SingleBlogHome