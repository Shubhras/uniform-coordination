"use client";

import Chart from "react-apexcharts";

const QuotationRequestsChart = ({ chartData = [] }) => {
  const categories = chartData.map((item) => item.label);

  // Graph values
  const series = [
    {
      name: "Quotation Requests",
      data: chartData.map((item) => item.value),
    },
  ];

  //max value for Y-axis
  const maxValue = Math.max(...series[0].data, 10);

  const options = {
    chart: {
      type: "area",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      fontFamily: "inherit",
    },

    colors: ["#F6D45B"],

    stroke: {
      curve: "smooth",
      width: 3,
    },

    dataLabels: {
      enabled: false,
    },

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.28,
        opacityTo: 0.03,
        stops: [0, 100],
      },
    },

    markers: {
      size: 0,
      hover: {
        size: 6,
      },
    },

    grid: {
      borderColor: "#ECECEC",
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
          colors: "#777777",
          fontSize: "12px",
        },
      },
    },

    yaxis: {
      min: 0,
      max: maxValue,
      tickAmount: 4,
      labels: {
        style: {
          colors: "#777777",
          fontSize: "12px",
        },
      },
    },

    tooltip: {
      theme: "light",
      y: {
        formatter: (val) => `${val}`,
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ECECEC] shadow-sm p-6">
      <h3 className="text-[17px] font-semibold text-[#3B3B3B]">
        Requests This Week
      </h3>

      <div className="border-b border-[#D9D9D9] mt-6 mb-8" />

      <Chart options={options} series={series} type="area" height={300} />
    </div>
  );
};

export default QuotationRequestsChart;
