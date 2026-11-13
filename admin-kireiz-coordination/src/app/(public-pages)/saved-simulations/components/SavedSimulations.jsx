"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiBookmark,
  FiBox,
  FiSearch,
  FiX,
  FiRotateCcw,
  FiEye,
  FiCalendar,
  FiUser,
  FiSliders,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import { useTranslations } from "next-intl";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import Pagination from "@/components/ui/Pagination";
import { apiGetSavedSimulations } from "@/services/SimulationAssetService";

const SavedSimulations = () => {
  const t = useTranslations("savedSimulations");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [loading, setLoading] = useState(true);
  const [simulations, setSimulations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Inspector Modal State
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [copied, setCopied] = useState(false);

  // Debounce search query (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSavedSimulations = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const response = await apiGetSavedSimulations(accessToken, {
        page: currentPage,
        pageSize,
        search: debouncedSearch.trim(),
      });
      if (response?.status && response?.data) {
        const items = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.results)
            ? response.data.results
            : [];
        setSimulations(items);
        const total =
          response.total_count ??
          response.count ??
          response.pagination?.total_items ??
          response.total ??
          items.length;
        setTotalCount(total);
      }
    } catch (err) {
      console.error("Failed to fetch saved simulations:", err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, currentPage, pageSize, debouncedSearch]);

  useEffect(() => {
    if (accessToken) {
      fetchSavedSimulations();
    }
  }, [fetchSavedSimulations]);

  // Display data handling (with fallback if backend returned unpaginated list)
  const displayData = useMemo(() => {
    let list = simulations;
    if (list.length > pageSize) {
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const clientFiltered = list.filter((item) => {
          const userName = (item.user_name || "").toLowerCase();
          const userEmail = (item.user_email || "").toLowerCase();
          const itemName = (item.item_name || "").toLowerCase();
          const categoryName = (item.category_name || "").toLowerCase();
          const itemCode = (item.item_code || "").toLowerCase();
          return (
            userName.includes(q) ||
            userEmail.includes(q) ||
            itemName.includes(q) ||
            categoryName.includes(q) ||
            itemCode.includes(q)
          );
        });
        if (clientFiltered.length < list.length) {
          list = clientFiltered;
        }
      }
      const start = (currentPage - 1) * pageSize;
      return list.slice(start, start + pageSize);
    }
    return list;
  }, [simulations, currentPage, pageSize, debouncedSearch]);

  const totalItems = useMemo(() => {
    if (totalCount > 0) return totalCount;
    return simulations.length;
  }, [totalCount, simulations.length]);

  const handleReset = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  const handleCopyJson = (data) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format design specifications helper
  const renderSpecBadges = (item) => {
    const specs = item.design_specifications || {};
    const config = item.config_json || {};

    const badges = [];

    if (item.quotation_id) {
      badges.push(`Quote: #${item.quotation_id}`);
    }

    const colorVal = specs.color || config.color || config.colour;
    if (colorVal && colorVal !== "N/A") badges.push(`${t("specs.color")}: ${colorVal}`);

    const fabricVal = specs.fabric || config.fabric;
    if (fabricVal && fabricVal !== "N/A") badges.push(`${t("specs.fabric")}: ${fabricVal}`);

    const partVal = specs.part || config.part;
    if (partVal && partVal !== "N/A") badges.push(`Part: ${partVal}`);

    const sizeVal = specs.size || config.size;
    if (sizeVal && sizeVal !== "N/A") badges.push(`${t("specs.size")}: ${sizeVal}`);

    const qtyVal = specs.quantity || config.quantity || config.total_quantity;
    if (qtyVal && qtyVal !== "N/A") badges.push(`Qty: ${qtyVal}`);

    if (badges.length === 0 && Object.keys(specs).length > 0) {
      Object.entries(specs).slice(0, 3).forEach(([key, val]) => {
        if ((typeof val === 'string' || typeof val === 'number') && val !== "N/A") {
          badges.push(`${key}: ${val}`);
        }
      });
    }

    if (badges.length === 0) {
      return <span className="text-xs text-gray-400 italic">{t("specs.defaultConfig")}</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {badges.slice(0, 3).map((b, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${b.startsWith("Quote:")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-[#E8EEF9] text-[#1C2C56]"
              }`}
          >
            {b}
          </span>
        ))}
        {badges.length > 3 && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
            {t("specs.moreCount", { count: badges.length - 3 })}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight text-[#1C2C56]">
            {t("pageTitle")}
          </h1>
          <p className="mt-1 text-[13px] text-[#64748B]">
            {t("pageSubtitle")}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1C2C56] text-sm" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 rounded-lg border border-[#E2E8F0] text-[#1C2C56] pl-10 pr-4 text-sm outline-none focus:border-[#1C2C56]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setDebouncedSearch("");
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        {/* Reset */}
        <button
          type="button"
          onClick={handleReset}
          className="flex h-10 items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#1C2C56] transition hover:bg-[#F8FAFC]"
        >
          <FiRotateCcw size={14} />
          {t("reset")}
        </button>
      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8FAFC] text-[#64748B] text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-semibold">{t("tableHeaders.type")}</th>
              <th className="text-left px-4 py-3 font-semibold">{t("tableHeaders.customer")}</th>
              <th className="text-left px-4 py-3 font-semibold">{t("tableHeaders.itemCategory")}</th>
              <th className="text-left px-4 py-3 font-semibold">{t("tableHeaders.customSpecs")}</th>
              <th className="text-left px-4 py-3 font-semibold">{t("tableHeaders.savedDate")}</th>
              <th className="text-right px-4 py-3 font-semibold">{t("tableHeaders.action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}
                >
                  {/* Type Badge */}
                  <td className="px-4 py-3">
                    <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-24 rounded bg-gray-200 animate-pulse" />
                        <div className="h-2.5 w-32 rounded bg-gray-200 animate-pulse" />
                      </div>
                    </div>
                  </td>

                  {/* Item & Category */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-28 rounded bg-gray-200 animate-pulse" />
                        <div className="h-2.5 w-20 rounded bg-gray-200 animate-pulse" />
                      </div>
                    </div>
                  </td>

                  {/* Custom Specs */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <div className="h-5 w-16 rounded bg-gray-200 animate-pulse" />
                      <div className="h-5 w-20 rounded bg-gray-200 animate-pulse" />
                      <div className="h-5 w-14 rounded bg-gray-200 animate-pulse" />
                    </div>
                  </td>

                  {/* Saved Date */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-3.5 w-3.5 rounded bg-gray-200 animate-pulse" />
                      <div className="h-3.5 w-24 rounded bg-gray-200 animate-pulse" />
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-block h-8 w-8 rounded-md bg-gray-200 animate-pulse" />
                  </td>
                </tr>
              ))
            ) : displayData.length > 0 ? (
              displayData.map((item, index) => (
                <tr
                  key={`${item.simulation_type}-${item.id}`}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"} hover:bg-[#F1F5F9] transition-colors`}
                >
                  {/* Type Badge */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      <FiBox size={13} />
                      {item.quotation_id ? `Quote #${item.quotation_id}` : t("typeProduct")}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E2E8F0] text-[#1C2C56]">
                        <FiUser size={14} />
                      </div>
                      <div>
                        <p className="font-semibold text-[#1C2C56] text-xs sm:text-sm">
                          {item.user_name || t("guestUser")}
                        </p>
                        {item.user_email && (
                          <p className="text-[11px] text-[#64748B]">{item.user_email}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Item & Category */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.item_name}
                          className="h-10 w-10 rounded-lg object-cover border border-[#E2E8F0] bg-gray-50 flex-shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                          <FiBox size={18} />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[#1C2C56] text-sm leading-tight">
                          {item.item_name}
                        </p>
                        <p className="text-[11px] text-[#64748B]">
                          {t("categoryLabel")}: <span className="font-medium text-[#1C2C56]">{item.category_name}</span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Specs */}
                  <td className="px-4 py-3">
                    {renderSpecBadges(item)}
                  </td>

                  {/* Saved Date */}
                  <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <FiCalendar size={13} className="text-[#1C2C56]" />
                      <span>{item.formatted_date || item.created_at}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedSimulation(item)}
                      className="p-2 rounded-md bg-[#EEF4FF] text-[#1C4FA8] hover:bg-[#DCE8FF] transition-colors shadow-sm"
                    >
                      <FiEye size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  <FiBookmark size={28} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium text-gray-600">{t("emptyState.title")}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalItems > pageSize && (
        <div className="flex justify-end mt-4">
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            total={totalItems}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Inspector Modal */}
      {selectedSimulation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <FiBox size={20} />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-[#1C2C56]">
                    {selectedSimulation.item_name}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    {t("modal.savedSimulationNumber", { id: selectedSimulation.id })} &bull;{" "}
                    {selectedSimulation.quotation_id ? `Quote #${selectedSimulation.quotation_id}` : t("typeProduct")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSimulation(null)}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer & Item Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div>
                  <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">{t("modal.customerDetails")}</p>
                  <p className="text-sm font-bold text-[#1C2C56] mt-1">{selectedSimulation.user_name || t("guestUser")}</p>
                  <p className="text-xs text-gray-600">{selectedSimulation.user_email || t("modal.noEmail")}</p>
                  {selectedSimulation.user_id && (
                    <p className="text-[11px] text-gray-400 mt-0.5">{t("modal.userId")}: #{selectedSimulation.user_id}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">{t("modal.itemDetails")}</p>
                  <p className="text-sm font-bold text-[#1C2C56] mt-1">{selectedSimulation.item_name}</p>
                  <p className="text-xs text-gray-600">{t("categoryLabel")}: {selectedSimulation.category_name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{t("modal.savedDateLabel")}: {selectedSimulation.formatted_date}</p>
                  {selectedSimulation.quotation_id && (
                    <p className="text-xs font-semibold text-green-700 mt-1">
                      Quotation Request: #{selectedSimulation.quotation_id} ({selectedSimulation.quotation_status || "Pending"})
                    </p>
                  )}
                </div>
              </div>

              {/* Design Specifications Summary */}
              {selectedSimulation.design_specifications && Object.keys(selectedSimulation.design_specifications).length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[#1C2C56] mb-3 flex items-center gap-2">
                    <FiSliders className="text-[#1C2C56]" />
                    {t("modal.designSpecs")}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(selectedSimulation.design_specifications).map(([key, val]) => {
                      const displayVal = (() => {
                        if (val === null || val === undefined || val === "" || val === "N/A") return null;
                        if (Array.isArray(val)) {
                          if (val.length === 0) return null;
                          const str = val
                            .map((v) => (typeof v === "object" ? v?.name || v?.categoryName || JSON.stringify(v) : String(v)))
                            .filter(Boolean)
                            .join(", ");
                          return (str && str !== "N/A") ? str : null;
                        }
                        if (typeof val === "object") {
                          const res = val.categoryName || val.name || val.label || JSON.stringify(val);
                          return (res && res !== "N/A") ? res : null;
                        }
                        const strVal = String(val).trim();
                        return (strVal === "N/A" || strVal === "null" || strVal === "undefined") ? null : strVal;
                      })();

                      if (!displayVal) return null;

                      return (
                        <div key={key} className="p-3 rounded-lg border border-[#E2E8F0] bg-white">
                          <span className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider block">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="text-sm font-bold text-[#1C2C56] mt-0.5 block truncate" title={displayVal}>
                            {displayVal}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>


          </div>
        </div>
      )}
    </div>
  );
};

export default SavedSimulations;
