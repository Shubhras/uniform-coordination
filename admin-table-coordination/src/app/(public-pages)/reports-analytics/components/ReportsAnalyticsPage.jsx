"use client";

const summaryCards = [
  { label: "TOTAL REVENUE", value: "¥2,450,000" },
  { label: "TOTAL ORDERS", value: "124" },
  { label: "ACTIVE RENTALS", value: "45" },
  { label: "INVENTORY ITEMS", value: "85,000" },
  { label: "LATE RETURNS", value: "3", valueClass: "text-[#E4574E]" },
  { label: "CUSTOMERS", value: "1,200" },
];

const growthPoints = [
  { month: "Jan", value: 700 },
  { month: "Feb", value: 760 },
  { month: "Mar", value: 820 },
  { month: "Apr", value: 870 },
  { month: "May", value: 920 },
  { month: "Jun", value: 980 },
];

const categoryBars = [
  { label: "Table Cloth", value: 90 },
  { label: "Napkins", value: 140 },
  { label: "Chair Covers", value: 230 },
  { label: "Centre Pieces", value: 260 },
  { label: "Additional Decor", value: 350 },
];

const inventoryLegend = [
  { label: "Available", color: "#B56735" },
  { label: "Rented", color: "#D9A79E" },
  { label: "Maintenance", color: "#F5EDE6" },
  { label: "Damaged", color: "#2A211D" },
];

// --- helpers -----------------------------------------------------------

// Builds an SVG donut made of arcs so segments and labels are always
// mathematically correct (unlike a CSS conic-gradient + hand-placed label).
function DonutChart({
  segments,
  size = 170,
  thickness = 34,
  showLabels = false,
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
        <path key={i} d={arc.path} fill={arc.color} />
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
          ) : null
        )}
    </svg>
  );
}

const ReportsAnalyticsPage = () => {
  const chartWidth = 340;
  const chartLeftPad = 34;
  const chartRightPad = 16;
  const plotWidth = chartWidth - chartLeftPad - chartRightPad;
  const stepX = plotWidth / (growthPoints.length - 1);

  const maxValue = 1000;
  const chartTop = 24;
  const chartBottom = 165;
  const plotHeight = chartBottom - chartTop;

  const yForValue = (value) =>
    chartBottom - (value / maxValue) * plotHeight;

  const polylinePoints = growthPoints
    .map((point, index) => `${chartLeftPad + index * stepX},${yForValue(point.value)}`)
    .join(" ");

  const maxBarValue = 400;
  const barMaxWidthPx = 190; // matches the plotted track width below

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[32px] font-semibold leading-tight text-[#2A211D]">
            Reports &amp; Analytics
          </h1>
          <p className="mt-1 text-[13px] text-[#B29D8C]">
            Track inventory, stock status, and product availability.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-[38px] items-center gap-2 rounded-[8px] bg-[#B56735] px-4 text-[13px] font-medium text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
          Export Data
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[10px] border border-[#F0E4DB] bg-white px-4 py-4"
          >
            <p className="text-[10px] font-semibold tracking-[0.12em] text-[#B3A096]">
              {card.label}
            </p>
            <p className={`mt-2 text-[22px] font-semibold text-[#2F241F] ${card.valueClass ?? ""}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)]">
        <div className="rounded-[12px] border border-[#F0E4DB] bg-white p-5">
          <div className="flex items-start justify-between">
            <h2 className="text-[13px] font-semibold text-[#3C302B]">
              Customer Growth (Last 6 Months)
            </h2>
            <p className="text-[11px] text-[#C0ADA0]">+12% avg growth</p>
          </div>

          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[520px]">
              <svg viewBox={`0 0 ${chartWidth} 190`} className="h-[190px] w-full">
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
                <polyline fill="none" stroke="#B56735" strokeWidth="2" points={polylinePoints} />
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
          <h2 className="text-[13px] font-semibold text-[#3C302B]">Customer Segments</h2>

          <div className="mt-6 flex justify-center">
            <DonutChart
              size={170}
              thickness={34}
              showLabels
              segments={[
                { value: 87.5, color: "#B56735" },
                { value: 12.5, color: "#7FCCF9" },
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
          <h2 className="text-[13px] font-semibold text-[#3C302B]">Top Rented Categories</h2>

          <div className="mt-6 space-y-4">
            {categoryBars.map((item) => (
              <div key={item.label} className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-4">
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
          <h2 className="text-[13px] font-semibold text-[#3C302B]">Inventory Status</h2>

          <div className="mt-6 flex justify-center">
            <DonutChart
              size={170}
              thickness={34}
              segments={[
                { value: 90, color: "#B56735" },
                { value: 5, color: "#D9A79E" },
                { value: 2, color: "#F5EDE6" },
                { value: 3, color: "#2A211D" },
              ]}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-[#8E7C70]">
            {inventoryLegend.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-[2px]"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalyticsPage;