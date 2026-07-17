'use client'
import { useEffect, useState } from 'react'
import { apiGetHomeData } from '@/services/HomeService'
import HeroContent from './HeroContent'
import Demos from './Demos'
import TechStack from './TechStack'
import OtherFeatures from './OtherFeatures'
import Components from './Components'
import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import UniformBusinessEnquiry from './UniformBusinessEnquiry'
import UniformLatestBlogPosts from './UniformLatestBlogPosts'
import UniformLatestFAQPosts from './UniformLatestFAQPosts'
import UniformAbouUsPage from './UniformAbouUsPage'
import ChatbotSection from './ChatbotSection'
import HaederPage from '../../header/HaederPage'
import FooterPage from '../../footer/FooterPage'

const UniformHome = () => {
  const mode = useTheme((state) => state.mode)
  const setMode = useTheme((state) => state.setMode)
  const schema = useTheme((state) => state.themeSchema)
  const setSchema = useTheme((state) => state.setSchema)
  const [homeData, setHomeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const toggleMode = () => {
    setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
  }
  useEffect(() => {
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
      {/* <div className="relative">
                <div
                    className="absolute inset-0 [mask-image:linear-gradient(to_bottom,white_5%,transparent_70%)] pointer-events-none select-none"
                ></div>
                <HeroContent mode={mode} />
            </div> */}
      <UniformBusinessEnquiry categories={homeData?.categories} />
      {/* <Demos mode={mode} /> */}
      {/*  How it works */}
      <TechStack />
      <UniformLatestBlogPosts blogs={homeData?.blogs} loading={loading} />
      <UniformLatestFAQPosts faqs={homeData?.faqs} loading={loading} />
      <UniformAbouUsPage />
      {/* <OtherFeatures /> */}
      {/* <Components /> */}
      <ChatbotSection />
      <FooterPage mode={mode} />
    </main>
  )
}

export default UniformHome
