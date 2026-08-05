'use client'

import HeroContent from './HeroContent'
import TechStack from './TechStack'
import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import UniformBusinessEnquiry from './UniformBusinessEnquiry'
import UniformLatestBlogPosts from './UniformLatestBlogPosts'
import UniformLatestFAQPosts from './UniformLatestFAQPosts'
import ChatbotSection from './ChatbotSection'
import FooterPage from '../../footer/FooterPage'
import HaederPage from '../../header/HaederPage'
import { useEffect, useState } from 'react'
import { apiGetHomeData } from '@/services/HomeService'

/**
 * TableHome Component
 * 
 * Main homepage component fetching table themes, latest blogs, and FAQs, assembling hero, enquiry, and footer sections.
 */
const TableHome = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)

    /**
     * Toggles between Light and Dark theme modes.
     */
    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    const [homeData, setHomeData] = useState(null)
    const [loading, setLoading] = useState(false)

    /**
     * Fetches homepage catalog data including themes, blogs, and FAQs.
     */
    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setLoading(true)
                const res = await apiGetHomeData()
                if (res?.status) {
                    setHomeData(res.data)
                }
            } catch (err) {
                // Handle API error silently
            } finally {
                setLoading(false)
            }
        }

        fetchHomeData()
    }, [])

    return (
        <main className="text-base bg-white dark:bg-gray-900">
            <HaederPage toggleMode={toggleMode} mode={mode} />
            <HeroContent mode={mode} />
            <UniformBusinessEnquiry tableThemes={homeData?.table_themes} />
            <TechStack />
            <UniformLatestBlogPosts blogs={homeData?.blogs} loading={loading} />
            <UniformLatestFAQPosts faqs={homeData?.faqs} loading={loading} />
            <ChatbotSection />
            <FooterPage mode={mode} />
        </main>
    )
}

export default TableHome

