"use client";

import { useTranslations } from "next-intl";

const RecentlyCards = ({ data }) => {
  const t = useTranslations("dashboard");

  const recentProducts = data?.Recently_update_product_color_part || [];

  const rawRepsStatus = data?.sales_reps_status;
  const salesReps = data?.Pending_Sales_Representation_Action || {};

  const salesRepsList = rawRepsStatus && Array.isArray(rawRepsStatus) && rawRepsStatus.length > 0
    ? rawRepsStatus.map(r => ({
        name: (r.name || "").charAt(0).toUpperCase() + (r.name || "").slice(1),
        count: r.count || 0,
        is_active: r.is_active !== false
      }))
    : Object.entries(salesReps).map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        is_active: true
      }));

  return (
    <div className="h-[420px] flex flex-col gap-2">
      <div className="flex-1 bg-[#E6E6FA] border border-[#ececec] rounded-xl shadow-md border border-gray-200 p-5 overflow-y-auto">
        <h3 className="text-[#1C2C56] text-[14px] font-semibold">
          {t("salesRepActions.pendingSalesRepActions")}
        </h3>

        <div className="mt-4 space-y-4 text-sm text-[#475569]">
          {salesRepsList.length > 0 ? (
            salesRepsList.map((rep, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#1C2C56]">{rep.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      rep.is_active
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {rep.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-[#1C2C56] font-semibold text-sm shadow-sm border border-gray-200">
                  {rep.count}
                </span>
              </div>
            ))
          ) : (
            <p className="text-[#94A3B8] text-center py-2">
              {t("salesRepActions.noActiveReps")}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 bg-[#E6E6FA] border border-[#ececec] rounded-xl shadow-md border border-gray-200 p-5 overflow-y-auto">
        <h3 className="text-[#1C2C56] text-[14px] font-semibold">
          {t("recentlyUpdated.recentlyUpdatedProducts")}
        </h3>

        <div className="mt-4 space-y-4 text-sm text-[#475569]">
          {recentProducts.length > 0 ? (
            recentProducts.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[#1C2C56]">
                      {item.productname || item.colorname || item.partcname}
                    </p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold border ${
                        item.is_active !== false
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {item.is_active !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8] capitalize">
                    {item.type}
                  </p>
                </div>

                <span className="text-[#94A3B8] text-xs">
                  {item.created_date}
                </span>
              </div>
            ))
          ) : (
            <p className="text-[#94A3B8] text-center py-2">
              {t("recentlyUpdated.noRecentUpdates")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentlyCards;
