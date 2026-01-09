"use client";

import Chart from "react-apexcharts";

const QuotationRequestsChart = () => {
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
      categories: ["Jan", "Feb", "March", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
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
        formatter: (val) => `${val}%`,
      },
    },
  };

  const series = [
    {
      name: "Quotation Requests",
      data: [55, 35, 70, 50, 85, 70, 60, 95, 75],
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-5">
      <h3 className="text-[#1C2C56] font-semibold mb-4">
        Quotation Requests
      </h3>

      <Chart options={options} series={series} type="area" height={300} />
    </div>
  );
};

export default QuotationRequestsChart;
