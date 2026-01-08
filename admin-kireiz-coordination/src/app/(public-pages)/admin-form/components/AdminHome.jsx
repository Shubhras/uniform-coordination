'use client'
import { useEffect, useState } from 'react'
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
import DashboardStats from './DashboardStats'
import BasicArea from '@/app/(protected-pages)/ui-components/charts/_components/BasicArea'
import BasicColumn from '@/app/(protected-pages)/ui-components/charts/_components/BasicColumn'
import Chart from '@/components/shared/Chart'
import MostUsedIndustriesChart from './MostUsedIndustriesChart'
import QuotationRequestsChart from './QuotationRequestsChart'
import DonutGraph from './QuotationsByStatusChart'
import QuickActionsCard from './QuickActionsCard'
import QuotationsByStatusChart from './QuotationsByStatusChart'
import ActiveAlerts from './ActiveAlerts'

const AdminHome = () => {
  const mode = useTheme((state) => state.mode)
  const setMode = useTheme((state) => state.setMode)
  const schema = useTheme((state) => state.themeSchema)
  const setSchema = useTheme((state) => state.setSchema)
  const toggleMode = () => {
    setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
  }
  // useEffect(() => {
  //     const fetchHomeData = async () => {
  //       try {
  //         const res = await apiGetHomeData()
  //         if (res?.status) {
  //           setHomeData(res.data)
  //         }
  //       } catch (err) {
  //         console.error('Home API error', err)
  //       } finally {
  //         setLoading(false)
  //       }
  //     }

  //     fetchHomeData()
  //   }, [])
  return (
    <main className="text-base bg-white dark:bg-gray-900 pb-20">
      <HaederPage toggleMode={toggleMode} mode={mode} />
      <HeroContent mode={mode} />
      <DashboardStats />
      <div className=' mt-10 px-5 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-5'>
        <MostUsedIndustriesChart />
        <QuotationRequestsChart />
      </div>
      <div className=' mt-10 px-5 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-5'>
        <QuickActionsCard />
        <QuotationsByStatusChart />
      </div>
      <ActiveAlerts/>
      {/* <UniformBusinessEnquiry /> */}
      {/* <Demos mode={mode} /> */}
      {/*  How it works */}
      {/* <TechStack />
      <UniformLatestBlogPosts />
      <UniformLatestFAQPosts />
      <UniformAbouUsPage /> */}
      {/* <OtherFeatures /> */}
      {/* <Components /> */}
      {/* <ChatbotSection /> */}
      {/* <FooterPage mode={mode} /> */}
    </main>
  )
}

export default AdminHome
