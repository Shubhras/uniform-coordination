"use client";

const Shimmer = ({ className = "" }) => (
    <div className={`animate-pulse bg-gradient-to-r from-[#E2E8F0] via-[#F1F5F9] to-[#E2E8F0] bg-[length:200%_100%] rounded ${className}`} />
);

const DashboardSkeleton = () => {
    return (
        <main className="text-base bg-[#F8FAFC] pb-20">

            {/* ── Hero Section Skeleton ── */}
            <section className="relative w-full rounded-2xl px-5 md:px-8 lg:px-12 py-10 overflow-hidden">
                <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #E9D5FF 0%, #DBEAFE 50%, #E0E7FF 100%)" }} />
                <div className="relative z-10 bg-white rounded-xl shadow-lg p-5 md:p-8 flex flex-col gap-6">
                    {/* Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <Shimmer className="h-9 w-32 rounded-md" />
                        <Shimmer className="h-9 w-36 rounded-md" />
                        <Shimmer className="h-9 w-28 rounded-md" />
                        <Shimmer className="h-9 w-28 rounded-md" />
                    </div>
                    {/* Text + Image */}
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                        <div className="flex-1 space-y-3">
                            <Shimmer className="h-7 w-72" />
                            <Shimmer className="h-4 w-96 max-w-full" />
                            <Shimmer className="h-4 w-80 max-w-full" />
                        </div>
                        <Shimmer className="h-44 w-60 rounded-xl" />
                    </div>
                </div>
            </section>

            {/* ── Stats Cards Skeleton ── */}
            <section className="w-full mt-10 px-5 md:px-8 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-[#F4F7FC] rounded-xl shadow-lg p-5 border border-[#E2E8F0]">
                            <Shimmer className="h-8 w-52 rounded-md mb-4" />
                            <div className="space-y-3">
                                {[1, 2, 3].map((j) => (
                                    <div key={j} className="flex justify-between">
                                        <Shimmer className="h-4 w-28" />
                                        <Shimmer className="h-4 w-20" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Charts Row Skeleton ── */}
            <div className="mt-10 px-5 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-lg p-5">
                        <Shimmer className="h-5 w-44 mb-4" />
                        <Shimmer className="h-[300px] w-full rounded-lg" />
                    </div>
                ))}
            </div>

            {/* ── Quick Actions + Donut Chart Row Skeleton ── */}
            <div className="mt-10 px-5 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg p-5">
                    <Shimmer className="h-5 w-32 mb-6" />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex flex-col items-center gap-2 border border-[#E2E8F0] rounded-lg py-6">
                                <Shimmer className="h-10 w-10 rounded-md" />
                                <Shimmer className="h-4 w-20" />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Donut Chart */}
                <div className="bg-white rounded-xl shadow-lg p-5">
                    <Shimmer className="h-5 w-44 mb-6" />
                    <div className="flex justify-center">
                        <Shimmer className="h-[250px] w-[250px] rounded-full" />
                    </div>
                </div>
            </div>

            {/* ── Active Alerts Skeleton ── */}
            <div className="mt-10 px-5 md:px-8 lg:px-12">
                <div className="bg-white rounded-xl shadow-lg p-5">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <Shimmer className="h-5 w-28" />
                            <Shimmer className="h-5 w-6 rounded-full" />
                        </div>
                        <Shimmer className="h-4 w-24" />
                    </div>
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-[#E2E8F0] rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Shimmer className="h-5 w-5 rounded mt-1" />
                                    <div className="space-y-2">
                                        <Shimmer className="h-4 w-16" />
                                        <Shimmer className="h-4 w-56" />
                                    </div>
                                </div>
                                <Shimmer className="h-9 w-28 rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default DashboardSkeleton;
