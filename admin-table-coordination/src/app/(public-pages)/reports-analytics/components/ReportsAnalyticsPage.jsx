"use client";

import { useEffect, useState } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetReportAnalytics } from "@/services//ReportAnalytics";
import { FiDownload } from "react-icons/fi";

const inventoryColors = {
  Available: "#B56735",
  Rented: "#D9A79E",
  Maintenance: "#F5EDE6",
  Damaged: "#2A211D",
};

// --- helpers -----------------------------------------------------------

// Builds an SVG donut made of arcs so segments and labels are always
// mathematically correct (unlike a CSS conic-gradient + hand-placed label).
function DonutChart({
  segments,
  size = 170,
  thickness = 34,
  showLabels = false,
  onHover,
  onLeave,
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = size / 2;
  const innerRadius = radius - thickness;
  const center = size / 2;

  let cumulativeAngle = -90; // start at 12 o'clock

  const arcs = segments.map((seg) => {
    const angle = (seg.value / total) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const toRad = (deg) => (deg * Math.PI) / 180;

    const x1 = center + radius * Math.cos(toRad(startAngle));
    const y1 = center + radius * Math.sin(toRad(startAngle));
    const x2 = center + radius * Math.cos(toRad(endAngle));
    const y2 = center + radius * Math.sin(toRad(endAngle));

    const ix1 = center + innerRadius * Math.cos(toRad(startAngle));
    const iy1 = center + innerRadius * Math.sin(toRad(startAngle));
    const ix2 = center + innerRadius * Math.cos(toRad(endAngle));
    const iy2 = center + innerRadius * Math.sin(toRad(endAngle));

    const largeArc = angle > 180 ? 1 : 0;

    const path = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${ix2} ${iy2}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}
      Z
    `;

    const midAngle = (startAngle + endAngle) / 2;
    const labelRadius = (radius + innerRadius) / 2;
    const lx = center + labelRadius * Math.cos(toRad(midAngle));
    const ly = center + labelRadius * Math.sin(toRad(midAngle));

    return {
      path,
      color: seg.color,
      percent: Math.round((seg.value / total) * 1000) / 10,
      lx,
      ly,
    };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {arcs.map((arc, i) => (
        <path
          key={i}
          d={arc.path}
          fill={arc.color}
          onMouseMove={(e) =>
            onHover?.({
              x: e.clientX,
              y: e.clientY,
              data: segments[i],
            })
          }
          onMouseLeave={onLeave}
        />
      ))}
      {showLabels &&
        arcs.map((arc, i) =>
          arc.percent >= 6 ? (
            <text
              key={i}
              x={arc.lx}
              y={arc.ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontWeight={500}
              fill="#ffffff"
            >
              {arc.percent}%
            </text>
          ) : null,
        )}
    </svg>
  );
}

const ReportsAnalyticsPage = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  const chartWidth = 340;
  const chartLeftPad = 34;
  const chartRightPad = 16;
  const plotWidth = chartWidth - chartLeftPad - chartRightPad;

  const summaryCards = [
    {
      label: "TOTAL REVENUE",
      value: `${reportData?.kpi?.total_revenue ?? 0}`,
    },
    {
      label: "TOTAL ORDERS",
      value: reportData?.kpi?.total_orders ?? 0,
    },
    {
      label: "ACTIVE RENTALS",
      value: reportData?.kpi?.active_rentals ?? 0,
    },
    {
      label: "INVENTORY ITEMS",
      value: reportData?.kpi?.inventory_items ?? 0,
    },
    {
      label: "LATE RETURNS",
      value: reportData?.kpi?.late_returns ?? 0,
      valueClass: "text-[#E4574E]",
    },
    {
      label: "CUSTOMERS",
      value: reportData?.kpi?.total_customers ?? 0,
    },
  ];

  const categoryBars =
    reportData?.top_rented_categories?.map((item) => ({
      label: item.label,
      value: item.count,
    })) || [];

  const growthPoints =
    reportData?.customer_growth?.map((item) => ({
      month: item.label,
      value: item.value,
    })) || [];

  const maxValue =
    Math.max(...growthPoints.map((item) => item.value), 100) || 100;
  const chartTop = 24;
  const chartBottom = 165;
  const plotHeight = chartBottom - chartTop;

  const yForValue = (value) => chartBottom - (value / maxValue) * plotHeight;
  const maxBarValue =
    Math.max(...categoryBars.map((item) => item.value), 100) || 100;

  const stepX =
    growthPoints.length > 1 ? plotWidth / (growthPoints.length - 1) : plotWidth;

  const polylinePoints = growthPoints
    .map(
      (point, index) =>
        `${chartLeftPad + index * stepX},${yForValue(point.value)}`,
    )
    .join(" ");

  const getReportAnalytics = async () => {
    try {
      setLoading(true);

      const res = await apiGetReportAnalytics(accessToken, "table");

      console.log("Report API", res);

      if (res?.status) {
        setReportData(res.data);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      getReportAnalytics();
    }
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight text-[#2A211D]">
            Reports &amp; Analytics
          </h1>
          <p className="text-[13px] text-[#B29D8C]">
            Track inventory, stock status, and product availability.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-[38px] items-center gap-2 rounded-[8px] bg-[#A0522D] px-4 text-[13px] font-medium text-white"
        >
          <FiDownload size={14} />
          Export Data
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[10px] border border-[#F0E4DB] bg-white px-4 py-4"
          >
            <p className="text-[12px] font-semibold tracking-[0.12em] text-[#757575]">
              {card.label}
            </p>
            <p
              className={`mt-2 text-[22px] font-semibold text-[#2F241F] ${card.valueClass ?? ""}`}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)]">
        <div className="rounded-[12px] border border-[#F0E4DB] bg-white p-5">
          <div className="flex items-start justify-between">
            <h2 className="text-[16px] font-semibold text-[#3B3B3B]">
              Customer Growth (Last 6 Months)
            </h2>
            <p className="text-[11px] text-[#C0ADA0]">+12% avg growth</p>
          </div>

          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[520px]">
              <svg
                viewBox={`0 0 ${chartWidth} 190`}
                className="h-[190px] w-full"
              >
                {[0, 200, 400, 600, 800, 1000].map((value) => (
                  <line
                    key={value}
                    x1={chartLeftPad}
                    y1={yForValue(value)}
                    x2={chartWidth - chartRightPad}
                    y2={yForValue(value)}
                    stroke="#F4EAE3"
                    strokeWidth="1"
                  />
                ))}
                <polygon
                  fill="#B56735"
                  fillOpacity="0.08"
                  points={`${chartLeftPad},${chartBottom} ${polylinePoints} ${chartLeftPad + (growthPoints.length - 1) * stepX},${chartBottom}`}
                />
                <polyline
                  fill="none"
                  stroke="#B56735"
                  strokeWidth="2"
                  points={polylinePoints}
                />
                {growthPoints.map((point, index) => (
                  <g key={point.month}>
                    <circle
                      cx={chartLeftPad + index * stepX}
                      cy={yForValue(point.value)}
                      r="3.5"
                      fill="#B56735"
                    />
                    <text
                      x={chartLeftPad + index * stepX}
                      y={chartBottom + 18}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#B3A096"
                    >
                      {point.month}
                    </text>
                  </g>
                ))}
                {[0, 200, 400, 600, 800, 1000].map((label) => (
                  <text
                    key={label}
                    x={chartLeftPad - 8}
                    y={yForValue(label) + 3}
                    textAnchor="end"
                    fontSize="10"
                    fill="#B3A096"
                  >
                    {label}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#F0E4DB] bg-white p-5">
          <h2 className="text-[16px] font-semibold text-[#3B3B3B]">
            Customer Segments
          </h2>

          <div className="mt-6 flex justify-center">
            <DonutChart
              size={170}
              thickness={34}
              showLabels
              segments={[
                {
                  value:
                    reportData?.customer_segments?.find(
                      (x) => x.label === "B2B",
                    )?.percentage || 0,
                  color: "#B56735",
                },
                {
                  value:
                    reportData?.customer_segments?.find(
                      (x) => x.label === "B2C",
                    )?.percentage || 0,
                  color: "#7FCCF9",
                },
              ]}
            />
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-[#8E7C70]">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-[#B56735]" />
              <span>B2B</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#7FCCF9]" />
              <span>B2C</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[12px] border border-[#F0E4DB] bg-white p-5">
          <h2 className="text-[16px] font-semibold text-[#3B3B3B]">
            Top Rented Categories
          </h2>

          <div className="mt-6 space-y-4">
            {categoryBars.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-4"
              >
                <p className="text-[11px] text-[#9F8D81]">{item.label}</p>
                <div className="h-5 w-full rounded-[3px] bg-[#F4EAE3]">
                  <div
                    className="h-5 rounded-[3px] bg-[#B56735]"
                    style={{ width: `${(item.value / maxBarValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between pl-[126px] pr-1 text-[10px] text-[#B3A096]">
            <span>0</span>
            <span>100</span>
            <span>200</span>
            <span>300</span>
            <span>400</span>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#F0E4DB] bg-white p-5">
          <h2 className="text-[16px] font-semibold text-[#3B3B3B]">
            Inventory Status
          </h2>

          <div className="mt-6 flex justify-center">
            <DonutChart
              size={170}
              thickness={34}
              segments={
                reportData?.inventory_status?.map((item) => ({
                  label: item.label,
                  count: item.count,
                  value: item.percentage,
                  color: inventoryColors[item.label],
                })) || []
              }
              onHover={setTooltip}
              onLeave={() => setTooltip(null)}
            />
            {tooltip && (
              <div
                className="fixed z-50 rounded-md bg-black px-3 py-2 text-xs text-white font-bold pointer-events-none"
                style={{
                  left: tooltip.x + 10,
                  top: tooltip.y + 10,
                }}
              >
                <div>{tooltip.data.label}</div>
                <div>Count: {tooltip.data.count}</div>
                <div>{tooltip.data.value}%</div>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-[#8E7C70]">
            {reportData?.inventory_status?.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-[14px]">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-[2px]"
                  style={{
                    backgroundColor: inventoryColors[item.label] || "#CCCCCC",
                  }}
                />
                <span>
                  {item.label} ({item.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalyticsPage;
