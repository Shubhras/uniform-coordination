'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import { apiGetDashboard } from '@/services/DashboardService'
import HeroContent from './HeroContent'
import DashboardStats from './DashboardStats'
import QuickActionsCard from './QuickActionsCard'
import ActiveAlerts from './ActiveAlerts'
import DashboardSkeleton from './DashboardSkeleton'

// Dynamic imports for chart components (apexcharts uses `window` and doesn't support SSR)
const MostUsedIndustriesChart = dynamic(() => import('./MostUsedIndustriesChart'), { ssr: false })
const QuotationRequestsChart = dynamic(() => import('./QuotationRequestsChart'), { ssr: false })
const QuotationsByStatusChart = dynamic(() => import('./QuotationsByStatusChart'), { ssr: false })

const AdminHome = () => {
  const { session } = useCurrentSession()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const accessToken = session?.user?.accessToken

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!accessToken) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await apiGetDashboard(accessToken)
        if (response?.data) {
          setDashboardData(response.data)
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        setError(err?.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [accessToken])

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <main className="text-base bg-[#F8FAFC] pb-20">
      <HeroContent data={dashboardData} />
      <DashboardStats data={dashboardData} />
      <div className=' mt-10 px-5 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-5'>
        <MostUsedIndustriesChart data={dashboardData} />
        <QuotationRequestsChart data={dashboardData} />
      </div>
      <div className=' mt-10 px-5 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-5'>
        <QuickActionsCard data={dashboardData} />
        <QuotationsByStatusChart data={dashboardData} />
      </div>
      <ActiveAlerts data={dashboardData} />
    </main>
  )
}

export default AdminHome
