'use client'

import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import React from 'react'
import BlogSection from './BlogSection'
import HaederPage from '../../header/HaederPage'
import FooterPage from '../../footer/FooterPage'
import ChatbotSection from '../../kireiz-form/components/ChatbotSection'

/**
 * BlogHome Component
 *
 * Main landing page container for the Blog module.
 * Controls theme mode state (Light/Dark) and composes the page header,
 * blog list section, AI chatbot widget, and page footer.
 */
const BlogHome = () => {
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
            <BlogSection />
            <ChatbotSection />
            <FooterPage mode={mode} />
        </main>
    )
}

export default BlogHome