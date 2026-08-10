"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { FiDownload } from "react-icons/fi";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
  apiGetReportsAnalytics,
  apiExportReportsCsv,
} from "@/services/ReportsService";

/*
 * DESIGN NOTE — metric set chosen to match KIREIZ FORM backend data.
 */

// Status colours reused across the donut and the legend.
const STATUS_COLORS = {
  Pending: "#F59E0B",
  Received: "#FBBF24",
  Sent: "#3B82F6",
  Approved: "#10B981",
  Accepted: "#059669",
  Cancelled: "#EF4444",
  Unknown: "#94A3B8",
};

// Symbol comes from SystemSettings via the API — never hardcoded
const formatMoney = (value, symbol = "$") =>
  value === null || value === undefined
    ? "—"
    : `${symbol}${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const num = (value) =>
  value === null || value === undefined ? "—" : Number(value).toLocaleString();

const notify = (title, type, message) =>
  toast.push(
    <Notification title={title} type={type}>
      {message}
    </Notification>,
  );

/* ---------------- small chart primitives (no chart lib needed) ---------------- */

// SVG donut built from arcs so segment angles and the centre hole are exact.
function DonutChart({ segments, size = 180, thickness = 32, requestsText = "requests" }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (!total) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center text-xs text-gray-400"
      >
        No data
      </div>
    );
  }

  const radius = size / 2;
  const inner = radius - thickness;
  const center = size / 2;
  let angle = -90;

  const toRad = (deg) => (deg * Math.PI) / 180;

  const arcs = segments.map((seg) => {
    const sweep = (seg.value / total) * 360;
    const start = angle;
    const end = angle + sweep;
    angle = end;

    const drawEnd = sweep >= 360 ? end - 0.01 : end;

    const x1 = center + radius * Math.cos(toRad(start));
    const y1 = center + radius * Math.sin(toRad(start));
    const x2 = center + radius * Math.cos(toRad(drawEnd));
    const y2 = center + radius * Math.sin(toRad(drawEnd));
    const ix1 = center + inner * Math.cos(toRad(drawEnd));
    const iy1 = center + inner * Math.sin(toRad(drawEnd));
    const ix2 = center + inner * Math.cos(toRad(start));
    const iy2 = center + inner * Math.sin(toRad(start));
    const large = sweep > 180 ? 1 : 0;

    return {
      key: seg.label,
      color: STATUS_COLORS[seg.label] || "#94A3B8",
      d: `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${inner} ${inner} 0 ${large} 0 ${ix2} ${iy2} Z`,
    };
  });

  return (
    <svg width={size} height={size} role="img" aria-label="Status distribution">
      {arcs.map((a) => (
        <path key={a.key} d={a.d} fill={a.color} />
      ))}
      <text
        x={center}
        y={center - 2}
        textAnchor="middle"
        className="fill-[#1C2C56]"
        style={{ fontSize: 22, fontWeight: 600 }}
      >
        {total}
      </text>
      <text
        x={center}
        y={center + 16}
        textAnchor="middle"
        className="fill-[#64748B]"
        style={{ fontSize: 10 }}
      >
        {requestsText}
      </text>
    </svg>
  );
}

// Simple column chart — enough for a 6-point monthly trend.
function BarChart({ data, height = 200, color = "#1C4FA8" }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-[#1C2C56]">
            {d.value || ""}
          </span>
          <div
            className="w-full rounded-t transition-all"
            style={{
              height: `${Math.max((d.value / max) * (height - 44), d.value ? 3 : 1)}px`,
              backgroundColor: d.value ? color : "#E2E8F0",
            }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="text-[10px] text-[#64748B] whitespace-nowrap">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// Horizontal ranked bars for "top N" lists.
function RankedBars({ rows, color = "#1C4FA8", emptyLabel = "No data yet" }) {
  if (!rows?.length) {
    return <p className="text-sm text-gray-400 py-8 text-center">{emptyLabel}</p>;
  }

  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#1C2C56] truncate pr-2">{r.label}</span>
            <span className="text-[#64748B] flex-shrink-0">{r.value}</span>
          </div>
          <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(r.value / max) * 100}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const StatCard = ({ label, value, hint, accent }) => (
  <div className="border border-[#E2E8F0] rounded-xl p-4">
    <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
      {label}
    </p>
    <p
      className={`text-2xl font-semibold mt-2 ${accent || "text-[#1C2C56]"}`}
    >
      {value}
    </p>
    {hint && <p className="text-[11px] text-[#94A3B8] mt-1">{hint}</p>}
  </div>
);

const Panel = ({ title, subtitle, right, children }) => (
  <div className="border border-[#E2E8F0] rounded-xl p-5">
    <div className="flex items-start justify-between mb-4 gap-3">
      <div>
        <h3 className="text-base font-semibold text-[#1C2C56]">{title}</h3>
        {subtitle && (
          <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
    {children}
  </div>
);

/* ------------------------------- page ------------------------------- */

const MONTH_OPTIONS = [3, 6, 12];

const ReportsAnalyticsPage = () => {
  const t = useTranslations("reportsAnalytics");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [data, setData] = useState(null);
  const [months, setMonths] = useState(6);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const getFilterLabel = (m) => {
    if (m === 3) return t("dateRangeFilter.last3Months");
    if (m === 6) return t("dateRangeFilter.last6Months");
    if (m === 12) return t("dateRangeFilter.last12Months");
    return `Last ${m} months`;
  };

  const fetchAnalytics = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiGetReportsAnalytics(accessToken, months);
      if (res?.status) setData(res.data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      notify("Error", "danger", "Could not load analytics");
    } finally {
      setLoading(false);
    }
  }, [accessToken, months]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExport = async (type = "quotations") => {
    if (exporting) return;

    try {
      setExporting(type);
      const blob = await apiExportReportsCsv(accessToken, type);
      const url = window.URL.createObjectURL(
        blob instanceof Blob ? blob : new Blob([blob], { type: "text/csv" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `${type}_report_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export CSV:", error);
      notify("Error", "danger", "Could not export the report");
    } finally {
      setExporting(false);
    }
  };

  const ExportButton = ({ type }) => (
    <button
      type="button"
      onClick={() => handleExport(type)}
      disabled={!!exporting}
      title={`Export ${type} as CSV`}
      className="text-[#64748B] hover:text-[#1C4FA8] disabled:opacity-40 flex-shrink-0"
    >
      <FiDownload size={15} />
    </button>
  );

  const currencySymbol = data?.currency?.symbol || "$";
  const money = (value) => formatMoney(value, currencySymbol);

  const stats = data?.stats;
  const charts = data?.charts;
  const catalog = data?.catalog;

  return (
    <div className="px-5 md:px-8 lg:px-12 py-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1C2C56]">
            {t("pageTitle")}
          </h1>
          <p className="text-sm text-[#64748B]">
            {t("pageSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            disabled={loading}
            className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm bg-white disabled:opacity-50"
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {getFilterLabel(m)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => handleExport("quotations")}
            disabled={!!exporting || loading}
            className="flex items-center gap-2 bg-[#1C4FA8] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <FiDownload size={15} />
            {exporting === "quotations" ? t("exporting") : t("exportQuotations")}
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="border border-[#E2E8F0] rounded-xl p-4 animate-pulse"
            >
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-7 w-16 bg-gray-100 rounded mt-3" />
            </div>
          ))}
        </div>
      )}

      {!loading && stats && (
        <>
          {/* Stat tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label={t("stats.totalRequests")}
              value={num(stats.total_requests)}
            />
            <StatCard
              label={t("stats.pendingReview")}
              value={num(stats.pending_review)}
              accent="text-amber-600"
              hint={t("stats.awaitingAdminQuote")}
            />
            <StatCard
              label={t("stats.sent")}
              value={num(stats.sent)}
              accent="text-blue-600"
              hint={t("stats.awaitingCustomerReply")}
            />
            <StatCard
              label={t("stats.won")}
              value={num(stats.won)}
              accent="text-green-600"
              hint={`${stats.win_rate}% win rate`}
            />
            <StatCard
              label={t("stats.quotedValue")}
              value={money(stats.quoted_value)}
              hint={t("stats.adminEnteredTotals")}
            />
            <StatCard
              label={t("stats.openPipeline")}
              value={money(stats.pipeline_value)}
              hint={t("stats.pendingPlusSent")}
            />
            <StatCard
              label={t("stats.avgResponse")}
              value={
                stats.avg_response_days === null
                  ? "—"
                  : `${stats.avg_response_days} d`
              }
              hint={`Based on ${stats.responded_sample} sent quote${
                stats.responded_sample === 1 ? "" : "s"
              }`}
            />
            <StatCard
              label={t("stats.customers")}
              value={num(stats.customers)}
              hint={`${stats.b2b_accounts} B2B account${
                stats.b2b_accounts === 1 ? "" : "s"
              }`}
            />
          </div>

          {/* Row 1 — trend + status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
            <div className="lg:col-span-2">
              <Panel
                title={`${t("panels.monthlyTrend")} (Last ${data.range_months} Months)`}
                subtitle={t("panels.monthlySubtitle")}
              >
                <BarChart data={charts.quotation_trend} />
              </Panel>
            </div>

            <Panel title={t("panels.statusDistribution")} subtitle={t("panels.statusSubtitle")}>
              <div className="flex flex-col items-center gap-4">
                <DonutChart segments={charts.status_distribution} requestsText={t("requests")} />
                <div className="w-full space-y-1.5">
                  {charts.status_distribution.map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="flex items-center gap-2 text-[#64748B]">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              STATUS_COLORS[s.label] || "#94A3B8",
                          }}
                        />
                        {t(`statusLabels.${s.label}`, { defaultValue: s.label })}
                      </span>
                      <span className="text-[#1C2C56] font-medium">
                        {s.value} ({s.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          {/* Row 2 — industries + fabrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
            <Panel
              title={t("panels.topIndustries")}
              subtitle={t("panels.topIndustriesSubtitle")}
            >
              <RankedBars
                rows={charts.top_industries}
                emptyLabel={t("noData")}
              />
            </Panel>

            <Panel
              title={t("panels.topFabrics")}
              subtitle={t("panels.topFabricsSubtitle")}
              right={<ExportButton type="fabrics" />}
            >
              <RankedBars rows={charts.top_fabrics} color="#0EA5E9" emptyLabel={t("noData")} />
            </Panel>
          </div>

          {/* Row 3 — top customers + top products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
            <Panel
              title={t("panels.topCustomers")}
              subtitle={t("panels.topCustomersSubtitle")}
              right={<ExportButton type="customers" />}
            >
              {charts.top_customers?.length ? (
                <div className="space-y-2">
                  {charts.top_customers.map((c) => (
                    <div
                      key={c.label}
                      className="flex items-center justify-between border border-[#E2E8F0] rounded-lg px-3 py-2"
                    >
                      <span className="text-sm text-[#1C2C56] truncate pr-2">
                        {c.label}
                      </span>
                      <span className="text-xs text-[#64748B] flex-shrink-0">
                        {c.value} {t("requests")} · {c.won} won
                        {c.amount !== null ? ` · ${money(c.amount)}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-8 text-center">
                  {t("noData")}
                </p>
              )}
            </Panel>

            <Panel
              title={t("panels.topProducts")}
              subtitle={t("panels.topProductsSubtitle")}
              right={<ExportButton type="products" />}
            >
              <RankedBars
                rows={charts.top_products}
                color="#8B5CF6"
                emptyLabel={t("noData")}
              />
            </Panel>
          </div>

          {/* Row 4 — customer growth + sales reps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
            <Panel
              title={`${t("panels.customerGrowth")} (Last ${data.range_months} Months)`}
              subtitle={t("panels.customerGrowthSubtitle")}
            >
              <BarChart data={charts.customer_growth} color="#10B981" />
            </Panel>

            <Panel
              title={t("panels.salesRepPerformance")}
              subtitle={t("panels.salesRepPerformanceSubtitle")}
              right={<ExportButton type="sales" />}
            >
              {charts.sales_leaderboard.length ? (
                <div className="space-y-3">
                  {charts.sales_leaderboard.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between border border-[#E2E8F0] rounded-lg px-3 py-2"
                    >
                      <span className="text-sm text-[#1C2C56] truncate pr-2">
                        {r.label}
                      </span>
                      <span className="text-xs text-[#64748B] flex-shrink-0">
                        {r.won}/{r.assigned} won · {r.win_rate}% ·{" "}
                        {money(r.value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-8 text-center">
                  {t("noData")}
                </p>
              )}
            </Panel>
          </div>

          {/* Catalog snapshot */}
          <div className="mt-5">
            <Panel
              title={t("panels.catalogSnapshot")}
              subtitle={t("panels.catalogSnapshotSubtitle")}
            >
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  [t("catalog.products"), catalog.products],
                  [t("catalog.categories"), catalog.categories],
                  [t("catalog.fabrics"), catalog.fabrics],
                  [t("catalog.parts"), catalog.parts],
                  [t("catalog.templates"), catalog.templates],
                ].map(([label, value]) => (
                  <div key={label} className="text-center">
                    <p className="text-xl font-semibold text-[#1C2C56]">
                      {num(value)}
                    </p>
                    <p className="text-xs text-[#64748B]">{label}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsAnalyticsPage;
