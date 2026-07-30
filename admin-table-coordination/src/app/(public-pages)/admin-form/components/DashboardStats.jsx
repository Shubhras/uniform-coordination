"use client";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const DashboardStats = ({ data }) => {
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

  const templates = data?.Templates?.total ?? 0;

  const b2bUsers = data?.B2B_Users?.total ?? 0;
  const b2bChange = data?.B2B_Users?.change_percentage ?? 0;

  return (
    <section className="w-full mt-5 px-5 md:px-8 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[#FAFAF5] rounded-xl border border-[#ececec] shadow-md p-6 flex flex-col justify-between">
          <div>
            <p className="text-[15px] opacity-90 text-[#666666] font-semibold">
              AVAILABLE INVENTORY
            </p>
            <h2 className="text-[30px] font-bold mt-2">{availableInventory}</h2>
          </div>

          {/* <div className="mt-4 flex items-center gap-2 text-sm">
            {quoteChange >= 0 ? (
              <>
                <FiTrendingUp className="text-base text-green-400" />
                <span className="font-medium text-green-400">
                  {quoteChange}%
                </span>
                <span className="text-[#486284]">Up from yesterday</span>
              </>
            ) : (
              <>
                <FiTrendingDown className="text-base text-red-400" />
                <span className="font-medium text-red-400">
                  {Math.abs(quoteChange)}%
                </span>
                <span className="text-[#486284]">Down from yesterday</span>
              </>
            )}
          </div> */}
        </div>
        <div className="bg-[#FAFAF5] rounded-xl border border-[#ececec] shadow-md p-6 flex flex-col justify-between">
          <div>
            <p className="text-[15px] opacity-90 text-[#666666] font-semibold">
              ACTIVE RENTALS
            </p>
            <h2 className="text-[30px] font-bold mt-2">{activeRentals}</h2>
          </div>
        </div>

        {/* B2B Users */}
        <div className="bg-[#FAFAF5] rounded-xl border border-[#ececec] shadow-md p-6 flex flex-col justify-between">
          <div>
            <p className="text-[15px] opacity-90 text-[#666666] font-semibold">
              PENDING ORDERS
            </p>
            <h2 className="text-[30px] font-bold mt-2">
              {" "}
              {pendingQuotations}{" "}
            </h2>
          </div>

          {/* {b2bChange !== 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              {b2bChange >= 0 ? (
                <>
                  <FiTrendingUp className="text-green-400" />
                  <span className="text-green-400 font-medium">
                    {b2bChange}%
                  </span>
                  <span className="text-[#486284]">Up from yesterday</span>
                </>
              ) : (
                <>
                  <FiTrendingDown className="text-red-400" />
                  <span className="text-red-400 font-medium">
                    {Math.abs(b2bChange)}%
                  </span>
                  <span className="text-[#486284]">Down from yesterday</span>
                </>
              )}
            </div>
          )} */}
        </div>
      </div>

      {/* Second row — Templates & B2B Users */}
    </section>
  );
};

export default DashboardStats;
