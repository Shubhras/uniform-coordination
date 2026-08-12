"use client";

import { useState } from "react";
import Chart from "react-apexcharts";
import Select from "react-select";
import { useTranslations } from "next-intl";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "34px",
    borderRadius: "8px",
    borderColor: state.isFocused ? "#1C2C56" : "#E2E8F0",
    boxShadow: "none",
    "&:hover": { borderColor: "#1C2C56" },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#1C2C56"
      : state.isFocused
        ? "#EEF2FF"
        : "white",
    color: state.isSelected ? "white" : "#1E293B",
    fontSize: "14px",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const QuotationRequestsChart = ({ data }) => {
  const t = useTranslations("dashboard.quotationVolume");

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
    colors: ["#1C2C56"],
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
        colorStops: [
          { offset: 0, color: "#818CF8", opacity: 0.4 },
          { offset: 100, color: "#818CF8", opacity: 0.05 },
        ],
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
      colors: ["#1C2C56"],
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
      name: t("quotationVolume"),
      data: values,
    },
  ];

  const periodTabs = [
    { key: "weekly", labelKey: "weekly" },
    { key: "monthly", labelKey: "monthly" },
    { key: "yearly", labelKey: "yearly" },
  ];

  const periodOptions = periodTabs.map((tab) => ({
    value: tab.key,
    label: t(tab.labelKey),
  }));

  return (
    <div className="h-full bg-white border border-[#ececec] rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#1C2C56] font-semibold text-[17px]">
          {t("quotationVolume")}
        </h3>

        <div className="w-36">
          <Select
            value={periodOptions.find((opt) => opt.value === period)}
            onChange={(opt) => setPeriod(opt.value)}
            options={periodOptions}
            styles={selectStyles}
            isSearchable={false}
          />
        </div>
      </div>

      <Chart options={options} series={series} type="area" height={300} />
    </div>
  );
};

export default QuotationRequestsChart;
