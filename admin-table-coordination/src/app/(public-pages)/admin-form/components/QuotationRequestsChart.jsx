"use client";

import Chart from "react-apexcharts";
import { useTranslations } from "next-intl";

const QuotationRequestsChart = ({ chartData = [] }) => {
  const t = useTranslations("dashboard.ordersThisWeek");
  const categories = chartData.map((item) => item.label);

  // Graph values
  const series = [
    {
      name: t("seriesName"),
      data: chartData.map((item) => item.value),
    },
  ];

  const tickAmount = 4;
  const rawMax = Math.max(...series[0].data, 4);
  const maxValue = Math.ceil(rawMax / tickAmount) * tickAmount;

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
      tickAmount: tickAmount,
      labels: {
        style: {
          colors: "#777777",
          fontSize: "12px",
        },
        formatter: (val) => Math.round(val),
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
        {t("title")}
      </h3>

      <div className="border-b border-[#D9D9D9] mt-6 mb-8" />

      <Chart options={options} series={series} type="area" height={300} />
    </div>
  );
};

export default QuotationRequestsChart;
