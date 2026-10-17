"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetDashboard } from "@/services/DashboardService";
import { sidebarMenu } from "@/app/(public-pages)/_components/AdminSidebar";
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
  const router = useRouter();
  const { session } = useCurrentSession();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const accessToken = session?.user?.accessToken;
  const userPermissions = session?.user?.permissions || [];
  const userRole = session?.user?.authority?.[0]?.toLowerCase();

  const hasDashboardPermission =
    userRole === "admin" ||
    userPermissions.some((permSlug) => {
      const norm = (permSlug || "").toLowerCase().replace(/_and_|-|_/g, "");
      return norm === "dashboard" || norm.includes("dashboard");
    });

  const firstPermitted = useMemo(() => {
    if (!userRole || userRole === "admin" || hasDashboardPermission) return null;
    if (session?.user?.entryPath && session.user.entryPath !== "/admin-form") {
      return { path: session.user.entryPath };
    }
    return sidebarMenu.find((item) => {
      if (item.slug === "dashboard") return false;
      const normItemSlug = (item.slug || "").toLowerCase().replace(/_and_|-|_/g, "");
      const normItemPath = (item.path || "").toLowerCase().replace(/^\//, "");
      return userPermissions.some((permSlug) => {
        const normPerm = (permSlug || "").toLowerCase().replace(/_and_|-|_/g, "");
        if (!normPerm) return false;
        return (
          normPerm === normItemSlug ||
          normPerm === normItemPath ||
          normPerm.includes(normItemSlug) ||
          normItemSlug.includes(normPerm) ||
          (item.slug === "order_rentals" && (normPerm.includes("order") || normPerm.includes("rental"))) ||
          (item.slug === "user_permission" && (normPerm.includes("user") || normPerm.includes("permission") || normPerm.includes("staff")))
        );
      });
    });
  }, [userRole, hasDashboardPermission, userPermissions, session?.user?.entryPath]);

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
    if (!session) return;

    if (firstPermitted?.path) {
      window.location.replace(firstPermitted.path);
      return;
    }

    if (accessToken && hasDashboardPermission) {
      fetchDashboard();
    } else if (!hasDashboardPermission) {
      setLoading(false);
    }
  }, [accessToken, session, hasDashboardPermission, firstPermitted]);

  if (!hasDashboardPermission && userRole && userRole !== "admin") {
    if (firstPermitted?.path || loading) {
      return <DashboardSkeleton />;
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-xl font-semibold text-[#2A211D]">Access Restricted</h2>
        <p className="text-sm text-[#786D66] mt-2">
          Your role does not have permission to view the Dashboard.
        </p>
      </div>
    );
  }

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
