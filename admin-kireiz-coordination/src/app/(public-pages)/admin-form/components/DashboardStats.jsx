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
        <section className="w-full mt-10 px-5 md:px-8 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* CARD 1 — Recently Updated Products / Colour Parts */}
                <div className="bg-[#F4F7FC] rounded-xl shadow-lg p-5 border border-[#E2E8F0]">
                    <div className="bg-[#1C2C56] text-white text-sm font-medium px-4 py-2 rounded-md inline-block">
                        Recently Updated Products / Colour Parts
                    </div>

                    <div className="mt-4 space-y-3 text-sm text-[#475569]">
                        {recentProducts.length > 0 ? (
                            recentProducts.map((product, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <span>{product.productname}</span>
                                    <span className="text-[#94A3B8]">{product.created_date}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-[#94A3B8] text-center py-2">No recent updates</p>
                        )}
                    </div>
                </div>

                {/* CARD 2 — Pending Sales Representation Action */}
                <div className="bg-[#F4F7FC] rounded-xl shadow-lg p-5 border border-[#E2E8F0]">
                    <div className="bg-[#1C2C56] text-white text-sm font-medium px-4 py-2 rounded-md inline-block">
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
                </div>

                {/* CARD 3 — Pending Quotes */}
                <div className="bg-[#1C2C56] rounded-xl shadow-lg p-6 text-white flex flex-col justify-between">
                    <div>
                        <p className="text-sm opacity-90">Pending Quotes</p>
                        <h2 className="text-4xl font-semibold mt-2 text-white/80">{pendingQuotes}</h2>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm">
                        {quoteChange >= 0 ? (
                            <>
                                <FiTrendingUp className="text-base text-green-400" />
                                <span className="font-medium text-green-400">{quoteChange}%</span>
                                <span className="text-white/80">Up from yesterday</span>
                            </>
                        ) : (
                            <>
                                <FiTrendingDown className="text-base text-red-400" />
                                <span className="font-medium text-red-400">{Math.abs(quoteChange)}%</span>
                                <span className="text-white/80">Down from yesterday</span>
                            </>
                        )}
                    </div>
                </div>

            </div>

            {/* Second row — Templates & B2B Users */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                {/* CARD 4 — Templates */}
                <div className="bg-[#F4F7FC] rounded-xl shadow-lg p-5 border border-[#E2E8F0] flex items-center justify-between">
                    <div>
                        <p className="text-sm text-[#64748B]">Total Templates</p>
                        <h3 className="text-3xl font-semibold text-[#1E293B] mt-1">{templates}</h3>
                    </div>
                    <div className="bg-[#1C2C56] text-white p-3 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                    </div>
                </div>

                {/* CARD 5 — B2B Users */}
                <div className="bg-[#F4F7FC] rounded-xl shadow-lg p-5 border border-[#E2E8F0] flex items-center justify-between">
                    <div>
                        <p className="text-sm text-[#64748B]">B2B Users</p>
                        <h3 className="text-3xl font-semibold text-[#1E293B] mt-1">{b2bUsers}</h3>
                        {b2bChange !== 0 && (
                            <div className="flex items-center gap-1 mt-1 text-xs">
                                {b2bChange >= 0 ? (
                                    <>
                                        <FiTrendingUp className="text-green-500" />
                                        <span className="text-green-500 font-medium">{b2bChange}%</span>
                                    </>
                                ) : (
                                    <>
                                        <FiTrendingDown className="text-red-500" />
                                        <span className="text-red-500 font-medium">{Math.abs(b2bChange)}%</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="bg-[#1C2C56] text-white p-3 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default DashboardStats;
