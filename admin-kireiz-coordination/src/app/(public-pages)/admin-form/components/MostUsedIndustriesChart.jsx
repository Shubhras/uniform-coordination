"use client";

import Chart from "react-apexcharts";

const MostUsedIndustriesChart = () => {
  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    colors: ["#CBDCF5"],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "45%",
      },
    },
    dataLabels: { enabled: false },
    grid: {
      strokeDashArray: 4,
      borderColor: "#E2E8F0",
    },
    xaxis: {
      categories: [
        "Chef uniform",
        "Medical Coat",
        "Cotton Fabric",
        "Corporate uniform",
        "Medical Cap",
        "Food service",
      ],
      labels: {
        style: { colors: "#64748B", fontSize: "12px" },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#64748B", fontSize: "12px" },
      },
    },
  };

  const series = [
    {
      name: "Usage",
      data: [300, 320, 350, 380, 420, 450],
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-5">
      <h3 className="text-[#1C2C56] font-semibold mb-4">
        Most Used Industries
      </h3>

      <Chart options={options} series={series} type="bar" height={300} />

      <p className="text-xs text-[#94A3B8] mt-2 flex items-center gap-1">
        Growth Chart Visualization ↗
      </p>
    </div>
  );
};

export default MostUsedIndustriesChart;
