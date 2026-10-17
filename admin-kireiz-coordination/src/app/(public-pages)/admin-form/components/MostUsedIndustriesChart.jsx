"use client";

import { useTranslations } from "next-intl";

const MostUsedIndustriesChart = ({ data }) => {
  const t = useTranslations("dashboard.mostUsedFabrics");

  const fabrics = data?.most_used_fabrics || [];
  const maxCount = fabrics.length > 0 ? Math.max(...fabrics.map((item) => item.count), 1) : 1;

  return (
    <div className="bg-white border border-[#E9EDF5] rounded-2xl shadow-sm p-6 h-full">
      <h2 className="text-[18px] font-semibold text-[#1C2C56] mb-8">
        {t("mostUsedFabrics")}
      </h2>

      {fabrics.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[260px] text-gray-400">
          <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm font-medium">No fabric or item usage data available</p>
        </div>
      ) : (
        <div className="space-y-8">
          {fabrics.map((item, index) => {
            const percentage = (item.count / maxCount) * 100;

            return (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[14px] text-[#475569] font-medium truncate">
                    {item.fabric_name}
                  </p>

                  <span className="text-[14px] font-semibold text-[#1C2C56]">
                    {item.count}
                  </span>
                </div>

                <div className="w-full h-[10px] rounded-full bg-[#EEF3FB] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1E3A8A] transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MostUsedIndustriesChart;
