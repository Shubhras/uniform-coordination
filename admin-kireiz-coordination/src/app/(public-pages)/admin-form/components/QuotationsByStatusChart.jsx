"use client";

import Chart from "react-apexcharts";
import { useTranslations } from "next-intl";

const QuotationsByStatusChart = ({ data }) => {
  const t = useTranslations("dashboard.quoteStatus");

  const statusData = Array.isArray(data?.Quote_status_distribution?.data)
    ? data.Quote_status_distribution.data 
    : [];

  const labels = statusData.map((item) => item?.label || "");
  const values = statusData.map((item) => item?.value || 0);

  // Fallback if no data
  const hasData = values.some((v) => v > 0);
  const total = values.reduce((sum, v) => sum + v, 0);

  const options = {
    chart: {
      type: "donut",
    },
    labels: labels.length > 0 ? labels : [t("noData")],
    colors: ["#FACC15", "#1D4ED8", "#86EFAC", "#EF4444"],
    legend: {
      position: "bottom",
      labels: {
        colors: "#64748B",
      },
      formatter: (seriesName, opts) => {
        if (!hasData) return seriesName;
        const value = opts.w.globals.series[opts.seriesIndex];
        const percent = total > 0 ? Math.round((value / total) * 100) : 0;
        return `${seriesName}: ${percent}% (${value} ${t("quotes")})`;
      },
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "",
              fontSize: "14px",
              color: "#64748B",
            },
          },
        },
      },
    },
  };

  return (
    <div className="h-full bg-white border border-[#ececec] rounded-xl shadow-sm p-5">
      <h3 className="text-[#1C2C56] font-semibold mb-6 text-[17px]">
        {t("quoteStatusDistribution")}
      </h3>

      <Chart
        options={options}
        series={hasData ? values : [1]}
        type="donut"
        height={300}
      />
    </div>
  );
};

export default QuotationsByStatusChart;
