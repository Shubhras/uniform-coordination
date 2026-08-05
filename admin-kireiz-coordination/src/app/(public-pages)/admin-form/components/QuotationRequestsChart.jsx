"use client";

import { useState } from "react";
import Chart from "react-apexcharts";

const QuotationRequestsChart = ({ data }) => {
  const volumeData = data?.Quotation_volume;

  const [period, setPeriod] = useState("yearly");

  const periodData = Array.isArray(volumeData?.[period]) ? volumeData[period] : [];
  const categories = periodData.map((item) => item?.label || "");
  const values = periodData.map((item) => item?.value || 0);

  const options = {
    chart: {
      type: "area",
      toolbar: { show: false },
    },
    colors: ["#FACC15"],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.4,
        opacityFrom: 0.35,
        opacityTo: 0.05,
      },
    },
    dataLabels: { enabled: false },
    grid: {
      strokeDashArray: 4,
      borderColor: "#E2E8F0",
    },
    xaxis: {
      categories,
      labels: {
        style: { colors: "#64748B", fontSize: "12px" },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#64748B", fontSize: "12px" },
      },
    },
    markers: {
      size: 4,
      colors: ["#FACC15"],
      strokeColors: "#fff",
      strokeWidth: 2,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}`,
      },
    },
  };

  const series = [
    {
      name: "Quotation Volume",
      data: values,
    },
  ];

  const periodTabs = [
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" },
    { key: "yearly", label: "Yearly" },
  ];

  return (
    <div className="h-full bg-white border border-[#ececec] rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#1C2C56] font-semibold text-[17px]">
          Quotation Volume
        </h3>

        <div className="flex gap-1 bg-[#F1F5F9] rounded-lg p-1">
          {periodTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${period === tab.key
                  ? "bg-[#1C2C56] text-white"
                  : "text-[#64748B] hover:text-[#1E293B]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <Chart options={options} series={series} type="area" height={300} />
    </div>
  );
};

export default QuotationRequestsChart;
