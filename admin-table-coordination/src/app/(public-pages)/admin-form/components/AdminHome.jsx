"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetDashboard } from "@/services/DashboardService";
import HeroContent from "./HeroContent";
import DashboardStats from "./DashboardStats";
import RecentOrdersCard from "./RecentOrdersCard";
import QuickActionsCard from "./QuickActionsCard";
import RecentlyCards from "./RecentlyCards";
import ActiveAlerts from "./ActiveAlerts";
import DashboardSkeleton from "./DashboardSkeleton";

// Dynamic imports for chart components (apexcharts uses `window` and doesn't support SSR)
const MostUsedIndustriesChart = dynamic(
  () => import("./MostUsedIndustriesChart"),
  { ssr: false },
);
const QuotationRequestsChart = dynamic(
  () => import("./QuotationRequestsChart"),
  { ssr: false },
);
const QuotationsByStatusChart = dynamic(
  () => import("./QuotationsByStatusChart"),
  { ssr: false },
);

const AdminHome = () => {
  const { session } = useCurrentSession();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const accessToken = session?.user?.accessToken;

  const fetchDashboard = async (silent = false) => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      if (!silent) setLoading(true);
      const response = await apiGetDashboard(accessToken);
      if (response?.data) {
        setDashboardData(response.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err?.message || "Failed to load dashboard data");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [accessToken]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <main className="text-base bg-white pb-20">
      <HeroContent data={dashboardData} />
      <DashboardStats data={dashboardData} />
      <div className="mt-5 px-5 md:px-8 lg:px-8">
        <RecentOrdersCard data={dashboardData} />
      </div>
      <div className='mt-5 px-5 md:px-8 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-5'>
        <MostUsedIndustriesChart data={dashboardData} />
        <QuotationRequestsChart chartData={dashboardData?.Orders_This_Week} />
      </div>
      <div className="mt-5 px-5 md:px-8 lg:px-8">
        <QuickActionsCard />
      </div>
      <ActiveAlerts data={dashboardData} onRefresh={() => fetchDashboard(true)} />
    </main>
  );
};

export default AdminHome;
