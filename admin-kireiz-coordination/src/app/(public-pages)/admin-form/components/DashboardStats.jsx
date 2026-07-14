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

  const pendingQuotes = data?.Pending_quotes?.total ?? 0;
  const quoteChange = data?.Pending_quotes?.change_percentage ?? 0;

  const templates = data?.Templates?.total ?? 0;

  const b2bUsers = data?.B2B_Users?.total ?? 0;
  const b2bChange = data?.B2B_Users?.change_percentage ?? 0;

  return (
    <section className="w-full mt-5 px-5 md:px-8 lg:px-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CARD 1 — Recently Updated Products / Colour Parts */}
        {/* <div className="bg-[#F4F7FC] rounded-xl shadow-lg p-5 border border-[#E2E8F0]">
                    <div className="bg-[#1C4FA8] text-white text-sm font-medium px-4 py-2 rounded-md inline-block">
                        Recently Updated Products / Colour Parts
                    </div>

                    <div className="mt-4 space-y-3 text-sm text-[#475569]">
                        {recentProducts.length > 0 ? (
                            recentProducts.map((product, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <span>{product.partcname}</span>
                                    <span className="text-[#94A3B8]">{product.created_date}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-[#94A3B8] text-center py-2">No recent updates</p>
                        )}
                    </div>
                </div>

                <div className="bg-[#F4F7FC] rounded-xl shadow-lg p-5 border border-[#E2E8F0]">
                    <div className="bg-[#1C4FA8] text-white text-sm font-medium px-4 py-2 rounded-md inline-block">
                        Active sales representative
                    </div>

                    <div className="mt-4 space-y-3 text-sm text-[#475569]">
                        {salesRepsList.length > 0 ? (
                            salesRepsList.map((rep, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <span>{rep.name}</span>
                                    <span className="font-medium text-[#1E293B]">{rep.count}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-[#94A3B8] text-center py-2">No active reps</p>
                        )}
                    </div>
                </div> */}

        {/* CARD 3 — Pending Quotes */}
        <div className="bg-[#F4F7FC] rounded-xl border border-[#ececec] shadow-md p-6 flex flex-col justify-between">
          <div>
            <p className="text-[20px] opacity-90 text-[#1C2C56] font-semibold">Pending Quotes</p>
            <h2 className="text-3xl font-semibold mt-2">
              {pendingQuotes}
            </h2>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm">
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
          </div>
        </div>
        <div className="bg-[#F4F7FC] rounded-xl border border-[#ececec] shadow-md p-6 flex flex-col justify-between">
          <div>
            <p className="text-[20px] opacity-90 text-[#1C2C56] font-semibold">Total Templates</p>
            <h2 className="text-3xl font-semibold mt-2 text-[#1C2C56]">
              {templates}
            </h2>
          </div>
        </div>

        {/* B2B Users */}
        <div className="bg-[#F4F7FC] rounded-xl border border-[#ececec] shadow-md p-6 flex flex-col justify-between">
          <div>
            <p className="text-[20px] opacity-90 text-[#1C2C56] font-semibold">B2B Users</p>
            <h2 className="text-3xl font-semibold mt-2">
              {b2bUsers}
            </h2>
          </div>

          {b2bChange !== 0 && (
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
          )}
        </div>
      </div>

      {/* Second row — Templates & B2B Users */}
    
    </section>
  );
};

export default DashboardStats;
