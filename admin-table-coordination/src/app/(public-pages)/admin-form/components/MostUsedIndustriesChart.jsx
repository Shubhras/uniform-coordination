"use client";

import Chart from "react-apexcharts";
import { useTranslations } from "next-intl";

const MostUsedIndustriesChart = ({ data }) => {
  const t = useTranslations("dashboard.mostRentedTheme");
  const mostRentedTheme = data?.Most_Rented_Theme || [];

  const categories = mostRentedTheme.map(item => item.theme_name || t("unassigned"));

  const options = {
    chart: {
      type: "bar",
      toolbar: {
        show: false,
      },
      fontFamily: "inherit",
    },

    colors: ["#A0522D", "#E8DDD4"],

    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 2,
        columnWidth: "38%",
      },
    },

    stroke: {
      show: false,
    },

    dataLabels: {
      enabled: false,
    },

    legend: {
      show: false,
    },

    grid: {
      borderColor: "#E8E5E1",
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false,
        },
      },
    },

    xaxis: {
      categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#777",
          fontSize: "11px",
          fontWeight: 400,
        },
      },
    },

    yaxis: {
      min: 0,
      labels: {
        style: {
          colors: "#777",
          fontSize: "11px",
        },
      },
    },

    tooltip: {
      enabled: true,
    },
  };

  const series = [
    {
      name: t("seriesName"),
      data: mostRentedTheme.map(item => item.count),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E8DDD4] shadow-sm p-6 min-h-[380px] flex flex-col justify-between">
      <div>
        <h3 className="text-[17px] font-semibold text-[#2A211D] mb-5">
          {t("title")}
        </h3>

        {mostRentedTheme.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[260px] text-gray-400">
            <svg
              className="w-12 h-12 mb-3 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-sm font-medium text-[#8C7E74]">No rented themes data available</p>
          </div>
        ) : (
          <Chart
            options={options}
            series={series}
            type="bar"
            height={280}
          />
        )}
      </div>

      <p className="mt-5 text-xs text-[#8C7E74] flex items-center gap-1">
        {t("growthVisualization")} ↗
      </p>
    </div>
  );
};

export default MostUsedIndustriesChart;