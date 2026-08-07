"use client";

import Chart from "react-apexcharts";

const MostUsedIndustriesChart = ({ data }) => {
  const mostRentedTheme = data?.Most_Rented_Theme || [];

  const categories = mostRentedTheme.length > 0
    ? mostRentedTheme.map(item => item.theme_name || "Unassigned")
    : [
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

    colors: ["#6A341A", "#E1D1C7"],

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
      name: "Orders/Rentals",
      data: mostRentedTheme.length > 0
        ? mostRentedTheme.map(item => item.count)
        : [120, 145, 170, 190, 200, 225],
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