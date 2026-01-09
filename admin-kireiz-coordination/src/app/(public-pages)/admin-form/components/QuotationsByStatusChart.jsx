"use client";

import Chart from "react-apexcharts";

const QuotationsByStatusChart = () => {
  const options = {
    chart: {
      type: "donut",
    },
    labels: ["Pending", "Sent", "Rejected", "Received"],
    colors: ["#FACC15", "#1D4ED8", "#EF4444", "#86EFAC"],
    legend: {
      position: "bottom",
      labels: {
        colors: "#64748B",
      },
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              color: "#64748B",
            },
          },
        },
      },
    },
  };

  const series = [18, 22, 7, 10]; // total = 57

  return (
    <div className="bg-white rounded-xl shadow-lg p-5">
      <h3 className="text-[#1C2C56] font-semibold mb-6">
        Quotations by Status
      </h3>

      <Chart options={options} series={series} type="donut" height={280} />
    </div>
  );
};

export default QuotationsByStatusChart;
