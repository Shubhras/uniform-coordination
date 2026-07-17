"use client";

import Chart from "react-apexcharts";

const MostUsedIndustriesChart = () => {
  const categories = [
    "Round 6ft",
    "Round 8ft",
    "Rectangular\n6x3",
    "Rectangular\n8x4",
    "Circle Table",
    "Food service",
  ];

  const options = {
    chart: {
      type: "bar",
      toolbar: {
        show: false,
      },
      fontFamily: "inherit",
    },

    colors: ["#E1D1C7", "#6A341A"],

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
      max: 500,
      tickAmount: 5,

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
      name: "Previous",
      data: [150, 170, 190, 210, 230, 250],
    },
    {
      name: "Current",
      data: [120, 145, 170, 190, 200, 225],
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#ECECEC] shadow-sm p-6">
      <h3 className="text-[17px] font-semibold text-[#3B3B3B] mb-5">
        Most Rented Theme
      </h3>

      <Chart
        options={options}
        series={series}
        type="bar"
        height={280}
      />

      <p className="mt-5 text-xs text-[#9CA3AF] flex items-center gap-1">
        Growth Chart Visualization ↗
      </p>
    </div>
  );
};

export default MostUsedIndustriesChart;