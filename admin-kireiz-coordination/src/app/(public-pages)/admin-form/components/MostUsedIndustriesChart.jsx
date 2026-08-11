"use client";

import { useTranslations } from "next-intl";

const MostUsedIndustriesChart = ({ data }) => {
  const t = useTranslations("dashboard.mostUsedFabrics");

  const fabrics = data?.most_used_fabrics || [];

  // fallback data
  const list =
    fabrics.length > 0
      ? fabrics
      : [
          { fabric_name: "Polyester A", count: 25 },
          { fabric_name: "Tops", count: 23 },
          { fabric_name: "Pants", count: 20 },
          { fabric_name: "Aprons", count: 15 },
        ];

  // highest count
  const maxCount = Math.max(...list.map((item) => item.count), 1);

  return (
    <div className="bg-white border border-[#E9EDF5] rounded-2xl shadow-sm p-6 h-full">
      <h2 className="text-[18px] font-semibold text-[#1C2C56] mb-8">
        {t("mostUsedFabrics")}
      </h2>

      <div className="space-y-8">
        {list.map((item, index) => {
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
    </div>
  );
};

export default MostUsedIndustriesChart;
