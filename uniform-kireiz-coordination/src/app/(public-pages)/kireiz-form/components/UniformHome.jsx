'use client'

import { useEffect, useState } from 'react'
import { apiGetHomeData } from '@/services/HomeService'
import HeroContent from './HeroContent'
import TechStack from './TechStack'
import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import UniformBusinessEnquiry from './UniformBusinessEnquiry'
import UniformLatestBlogPosts from './UniformLatestBlogPosts'
import UniformLatestFAQPosts from './UniformLatestFAQPosts'
import UniformAbouUsPage from './UniformAbouUsPage'
import ChatbotSection from './ChatbotSection'
import HaederPage from '../../header/HaederPage'
import FooterPage from '../../footer/FooterPage'

/**
 * UniformHome Component.
 * Main homepage composition container for Uniform Coordination landing page.
 * Fetches homepage data (categories, blogs, FAQs) and renders header, hero, enquiry form, workflow, blogs, FAQs, about section, chatbot, and footer.
 *
 * @returns {JSX.Element} Landing page view component.
 */
const UniformHome = () => {
  const mode = useTheme((state) => state.mode)
  const setMode = useTheme((state) => state.setMode)
  const [homeData, setHomeData] = useState(null)
  const [loading, setLoading] = useState(true)

  /**
   * Toggles theme mode between Light and Dark.
   */
  const toggleMode = () => {
    setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
  }

  useEffect(() => {
    /**
     * Fetches landing page dynamic content (categories, blogs, FAQs).
     */
    const fetchHomeData = async () => {
      try {
        const res = await apiGetHomeData()
        if (res?.status) {
          setHomeData(res.data)
        }
      } catch (err) {
        console.error('Home API error', err)
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
      <UniformBusinessEnquiry categories={homeData?.categories} />
      <TechStack />
      <UniformLatestBlogPosts blogs={homeData?.blogs} loading={loading} />
      <UniformLatestFAQPosts faqs={homeData?.faqs} loading={loading} />
      <UniformAbouUsPage />
      <ChatbotSection />
      <FooterPage mode={mode} />
    </main>
  )
}

export default UniformHome
