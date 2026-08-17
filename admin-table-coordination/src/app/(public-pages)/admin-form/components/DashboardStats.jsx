"use client";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { useTranslations } from "next-intl";

const DashboardStats = ({ data }) => {
  const t = useTranslations("dashboard");

  // Map API response fields
  const recentProducts = data?.Recently_update_product_color_part || [];

  const salesReps = data?.Pending_Sales_Representation_Action || {};
  const salesRepsList = Object.entries(salesReps).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count,
  }));

  const availableInventory = data?.Available_Inventory ?? 0;
  const pendingQuotations = data?.Pending_Orders ?? 0;
  const activeRentals = data?.Active_Rentals ?? 0;
  const upcomingReturns = data?.Upcoming_Returns ?? 0;

  const templates = data?.Templates?.total ?? 0;

  const b2bUsers = data?.B2B_Users?.total ?? 0;
  const b2bChange = data?.B2B_Users?.change_percentage ?? 0;

  return (
    <section className="w-full mt-5 px-5 md:px-8 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#FAFAF5] rounded-xl border border-[#ececec] shadow-md p-6 flex flex-col justify-between">
          <div>
            <p className="text-[15px] opacity-90 text-[#666666] font-semibold">
              {t("stats.availableInventory")}
            </p>
            <h2 className="text-[30px] font-bold mt-2">{availableInventory}</h2>
          </div>
        </div>
        <div className="bg-[#FAFAF5] rounded-xl border border-[#ececec] shadow-md p-6 flex flex-col justify-between">
          <div>
            <p className="text-[15px] opacity-90 text-[#666666] font-semibold">
              {t("stats.activeRentals")}
            </p>
            <h2 className="text-[30px] font-bold mt-2">{activeRentals}</h2>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-[#FAFAF5] rounded-xl border border-[#ececec] shadow-md p-6 flex flex-col justify-between">
          <div>
            <p className="text-[15px] opacity-90 text-[#666666] font-semibold">
              {t("stats.pendingOrders")}
            </p>
            <h2 className="text-[30px] font-bold mt-2">
              {pendingQuotations}
            </h2>
          </div>
        </div>

        {/* Upcoming Returns */}
        <div className="bg-[#FAFAF5] rounded-xl border border-[#ececec] shadow-md p-6 flex flex-col justify-between">
          <div>
            <p className="text-[15px] opacity-90 text-[#666666] font-semibold">
              {t("stats.upcomingReturns")}
            </p>
            <h2 className="text-[30px] font-bold mt-2">{upcomingReturns}</h2>
          </div>
        </div>
      </div>

      {/* Second row — Templates & B2B Users */}
    </section>
  );
};

export default DashboardStats;
