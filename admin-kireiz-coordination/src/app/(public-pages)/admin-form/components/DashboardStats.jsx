"use client";
import { FiTrendingUp } from "react-icons/fi";

const DashboardStats = () => {
    return (
        <section className="w-full mt-10 px-5 md:px-8 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* CARD 1 */}
                <div className="bg-[#F4F7FC] rounded-xl shadow-lg p-5 border border-[#E2E8F0]">
                    <div className="bg-[#1C2C56] text-white text-sm font-medium px-4 py-2 rounded-md inline-block">
                        Recently Updated Products / Colour Parts
                    </div>

                    <div className="mt-4 space-y-3 text-sm text-[#475569]">
                        <div className="flex justify-between">
                            <span>Polyester A fabric</span>
                            <span className="text-[#94A3B8]">Oct 13, 2023</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Sleeves part</span>
                            <span className="text-[#94A3B8]">Oct 11, 2023</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Blue colour</span>
                            <span className="text-[#94A3B8]">Oct 09, 2023</span>
                        </div>
                    </div>
                </div>

                {/* CARD 2 */}
                <div className="bg-[#F4F7FC] rounded-xl shadow-lg p-5 border border-[#E2E8F0]">
                    <div className="bg-[#1C2C56] text-white text-sm font-medium px-4 py-2 rounded-md inline-block">
                        Active sales representative
                    </div>

                    <div className="mt-4 space-y-3 text-sm text-[#475569]">
                        <div className="flex justify-between">
                            <span>Amy</span>
                            <span className="font-medium text-[#1E293B]">2</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Jack</span>
                            <span className="font-medium text-[#1E293B]">1</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Bob</span>
                            <span className="font-medium text-[#1E293B]">1</span>
                        </div>
                    </div>
                </div>

                {/* CARD 3 */}
                <div className="bg-[#1C2C56] rounded-xl shadow-lg p-6 text-white flex flex-col justify-between">
                    <div>
                        <p className="text-sm opacity-90">Pending Quote</p>
                        <h2 className="text-4xl font-semibold mt-2 text-white/80">45</h2>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-green-400">
                        <FiTrendingUp className="text-base" />
                        <span className="font-medium">1.8%</span>
                        <span className="text-white/80">Up from yesterday</span>
                    </div>
                </div>


            </div>
        </section>
    );
};

export default DashboardStats;
