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
        <div className="bg-white rounded-xl border border-[#E8DDD4] shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <p className="text-[13px] text-[#786D66] font-semibold uppercase tracking-wider">
              {t("stats.availableInventory")}
            </p>
            <h2 className="text-[30px] font-bold mt-2 text-[#2A211D]">{availableInventory}</h2>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8DDD4] shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <p className="text-[13px] text-[#786D66] font-semibold uppercase tracking-wider">
              {t("stats.activeRentals")}
            </p>
            <h2 className="text-[30px] font-bold mt-2 text-[#2A211D]">{activeRentals}</h2>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-xl border border-[#E8DDD4] shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <p className="text-[13px] text-[#786D66] font-semibold uppercase tracking-wider">
              {t("stats.pendingOrders")}
            </p>
            <h2 className="text-[30px] font-bold mt-2 text-[#2A211D]">
              {pendingQuotations}
            </h2>
          </div>
        </div>

        {/* Upcoming Returns */}
        <div className="bg-white rounded-xl border border-[#E8DDD4] shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <p className="text-[13px] text-[#786D66] font-semibold uppercase tracking-wider">
              {t("stats.upcomingReturns")}
            </p>
            <h2 className="text-[30px] font-bold mt-2 text-[#2A211D]">{upcomingReturns}</h2>
          </div>
        </div>
      </div>

      {/* Second row — Templates & B2B Users */}
    </section>
  );
};

export default DashboardStats;
