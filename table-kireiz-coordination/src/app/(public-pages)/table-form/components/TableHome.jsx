'use client'

import HeroContent from './HeroContent'
import Demos from './Demos'
import TechStack from './TechStack'
import OtherFeatures from './OtherFeatures'
import Components from './Components'
import LandingFooter from './LandingFooter'
import useTheme from '@/utils/hooks/useTheme'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import UniformBusinessEnquiry from './UniformBusinessEnquiry'
import UniformLatestBlogPosts from './UniformLatestBlogPosts'
import UniformLatestFAQPosts from './UniformLatestFAQPosts'
import ChatbotSection from './ChatbotSection'
import TableAbouUsPage from './TableAbouUsPage'
import PlaceholderSection from './PlaceholderSection'
import FooterPage from '../../footer/FooterPage'
import HaederPage from '../../header/HaederPage'
import { useEffect, useState } from 'react'
import { apiGetHomeData } from '@/services/HomeService'

const TableHome = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)
    const schema = useTheme((state) => state.themeSchema)
    const setSchema = useTheme((state) => state.setSchema)

    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    const [homeData, setHomeData] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setLoading(true)
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
            <UniformBusinessEnquiry categories={homeData?.categories}/>
            {/* <Demos mode={mode} /> */}
            {/*  How it works */}
            <TechStack />
            {/* <PlaceholderSection /> */}
            <UniformLatestBlogPosts   blogs={homeData?.blogs} loading={loading}/>
            <UniformLatestFAQPosts />
            {/* <TableAbouUsPage /> */}
            {/* <OtherFeatures /> */}
            {/* <Components /> */}
            <ChatbotSection />
            {/* <LandingFooter mode={mode} /> */}
            <FooterPage mode={mode} />
        </main>
    )
}

export default TableHome
