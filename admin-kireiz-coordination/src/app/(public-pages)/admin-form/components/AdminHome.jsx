"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetDashboard } from "@/services/DashboardService";
import HeroContent from "./HeroContent";
import DashboardStats from "./DashboardStats";
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

  // useCallback so ActiveAlerts can call this again after marking alerts read,
  // without the initial-load effect re-running on every render.
  const fetchDashboard = useCallback(
    async ({ showSkeleton = true } = {}) => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        if (showSkeleton) setLoading(true);
        const response = await apiGetDashboard(accessToken);
        if (response?.data) {
          setDashboardData(response.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        if (showSkeleton) setLoading(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <main className="text-base bg-white pb-20">
      <HeroContent data={dashboardData} />
      <DashboardStats data={dashboardData} />
      <div className="mt-5 px-5 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-5 gap-5 items-stretch">
        <div className="md:col-span-2 h-full">
          <QuotationsByStatusChart data={dashboardData} />
        </div>

        <div className="md:col-span-3 h-full">
          <QuotationRequestsChart data={dashboardData} />
        </div>
      </div>

      <div className="mt-5 px-5 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-5 gap-5 items-stretch">
        <div className="md:col-span-2 h-full">
          <RecentlyCards data={dashboardData} />
        </div>

        <div className="md:col-span-3 h-full">
          <MostUsedIndustriesChart data={dashboardData} />
        </div>
      </div>

      <div className="mt-5 px-5 md:px-8 lg:px-12">
        <QuickActionsCard />
      </div>
      <ActiveAlerts
        data={dashboardData}
        onAlertsRead={() => fetchDashboard({ showSkeleton: false })}
      />
    </main>
  );
};

export default AdminHome;
