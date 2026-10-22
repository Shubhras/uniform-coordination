"use client";

import { useState, useEffect, useMemo } from "react";
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
import { IoColorPaletteOutline } from "react-icons/io5";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import Spinner from "@/components/ui/Spinner";
import Pagination from "@/components/ui/Pagination";
import { apiGetSavedSimulations } from "@/services/SimulationService";
import { useTranslations } from "next-intl";

const SavedSimulations = () => {
  const t = useTranslations("savedSimulations");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [loading, setLoading] = useState(true);
  const [simulations, setSimulations] = useState([]);
  const [counts, setCounts] = useState({ total: 0, product: 0, theme: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'product' | 'theme'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Inspector Modal State
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchSavedSimulations = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const response = await apiGetSavedSimulations(accessToken);
      if (response?.status && response?.data) {
        setSimulations(response.data);
        setCounts({
          total: response.total_count || response.data.length,
          product: response.product_count || response.data.filter(s => s.simulation_type === 'product').length,
          theme: response.theme_count || response.data.filter(s => s.simulation_type === 'theme').length,
        });
      }
    } catch (err) {
      console.error("Failed to fetch saved simulations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchSavedSimulations();
    }
  }, [accessToken]);

  // Filtering
  const filteredSimulations = useMemo(() => {
    return simulations.filter((item) => {
      // Filter by Tab
      if (activeTab !== "all" && item.simulation_type !== activeTab) {
        return false;
      }
      // Filter by Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const userName = (item.user_name || "").toLowerCase();
        const userEmail = (item.user_email || "").toLowerCase();
        const itemName = (item.item_name || "").toLowerCase();
        const categoryName = (item.category_name || "").toLowerCase();
        const itemCode = (item.item_code || "").toLowerCase();

        return (
          userName.includes(query) ||
          userEmail.includes(query) ||
          itemName.includes(query) ||
          categoryName.includes(query) ||
          itemCode.includes(query)
        );
      }
      return true;
    });
  }, [simulations, activeTab, searchQuery]);

  // Pagination slice
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSimulations.slice(start, start + pageSize);
  }, [filteredSimulations, currentPage, pageSize]);

  const handleReset = () => {
    setSearchQuery("");
    setActiveTab("all");
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

    const colorVal = specs.color || config.color;
    if (colorVal && colorVal !== "N/A") badges.push(`${t("specColor")}: ${colorVal}`);

    const fabricVal = specs.fabric || config.fabric;
    if (fabricVal && fabricVal !== "N/A") badges.push(`${t("specFabric")}: ${fabricVal}`);

    const shapeVal = specs.table_shape || config.table_shape;
    if (shapeVal && shapeVal !== "N/A") badges.push(`${t("specShape")}: ${shapeVal}`);

    const sizeVal = specs.size || config.size;
    if (sizeVal && sizeVal !== "N/A") badges.push(`${t("specSize")}: ${sizeVal}`);

    const seatingVal = specs.seating || config.seating;
    if (seatingVal && seatingVal !== "N/A") badges.push(`${t("specSeating")}: ${seatingVal}`);

    if (badges.length === 0 && Object.keys(specs).length > 0) {
      Object.entries(specs).slice(0, 3).forEach(([key, val]) => {
        if ((typeof val === 'string' || typeof val === 'number') && val !== "N/A") {
          badges.push(`${key}: ${val}`);
        }
      });
    }

    if (badges.length === 0) {
      return <span className="text-xs text-gray-400 italic">{t("defaultConfiguration")}</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {badges.slice(0, 3).map((b, idx) => (
          <span
            key={idx}
            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F5EBE6] text-[#8C4A27]"
          >
            {b}
          </span>
        ))}
        {badges.length > 3 && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
            {t("moreCount", { count: badges.length - 3 })}
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
          <h1 className="text-[28px] font-semibold leading-tight text-[#2A211D]">
            {t("title")}
          </h1>
          <p className="mt-1 text-[13px] text-[#B29D8C]">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
          className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${activeTab === "all"
              ? "border-[#C08457] bg-[#FAF5F0] shadow-sm"
              : "border-[#EFE5DD] bg-white hover:border-[#DFC8B7]"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#7D6C63]">{t("totalSavedSimulations")}</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4E9E1] text-[#C08457]">
              <FiBookmark size={20} />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-[#2A1A0E]">{counts.total}</p>
        </div>

        <div
          onClick={() => { setActiveTab("product"); setCurrentPage(1); }}
          className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${activeTab === "product"
              ? "border-[#2563EB] bg-[#EFF6FF] shadow-sm"
              : "border-[#EFE5DD] bg-white hover:border-[#DFC8B7]"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#7D6C63]">{t("productCustomizations")}</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#2563EB]">
              <FiBox size={20} />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-[#2A1A0E]">{counts.product}</p>
        </div>

        <div
          onClick={() => { setActiveTab("theme"); setCurrentPage(1); }}
          className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${activeTab === "theme"
              ? "border-[#9333EA] bg-[#FAF5FF] shadow-sm"
              : "border-[#EFE5DD] bg-white hover:border-[#DFC8B7]"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#7D6C63]">{t("themeCustomizations")}</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E8FF] text-[#9333EA]">
              <IoColorPaletteOutline size={20} />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-[#2A1A0E]">{counts.theme}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C08457] text-sm" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 rounded-lg border border-[#EFE5DD] text-[#2A1A0E] pl-10 pr-4 text-sm outline-none focus:border-[#C08457]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        {/* Tab Filters & Reset */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-[#EFE5DD] bg-[#FAF5F0] p-1">
            <button
              onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === "all"
                  ? "bg-white text-[#2A1A0E] shadow-sm"
                  : "text-[#7D6C63] hover:text-[#2A1A0E]"
                }`}
            >
              {t("all")} ({counts.total})
            </button>
            <button
              onClick={() => { setActiveTab("product"); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === "product"
                  ? "bg-white text-[#2563EB] shadow-sm"
                  : "text-[#7D6C63] hover:text-[#2563EB]"
                }`}
            >
              {t("products")} ({counts.product})
            </button>
            <button
              onClick={() => { setActiveTab("theme"); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === "theme"
                  ? "bg-white text-[#9333EA] shadow-sm"
                  : "text-[#7D6C63] hover:text-[#9333EA]"
                }`}
            >
              {t("themes")} ({counts.theme})
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex h-10 items-center gap-2 rounded-lg border border-[#EFE5DD] bg-white px-4 text-sm font-medium text-[#C08457] transition hover:bg-[#FCF7F3]"
          >
            <FiRotateCcw size={14} />
            {t("reset")}
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto rounded-xl border border-[#EFE5DD] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F7F2EE] text-[#6B7280] text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-semibold">{t("tableType")}</th>
              <th className="text-left px-4 py-3 font-semibold">{t("tableCustomer")}</th>
              <th className="text-left px-4 py-3 font-semibold">{t("tableItemCategory")}</th>
              <th className="text-left px-4 py-3 font-semibold">{t("tableCustomSpecifications")}</th>
              <th className="text-left px-4 py-3 font-semibold">{t("tableSavedDate")}</th>
              <th className="text-right px-4 py-3 font-semibold">{t("tableAction")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFE5DD]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Spinner size={36} customColorClass="text-[#C08457]" />
                    <span className="text-sm text-[#7D6C63]">{t("loading")}</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr
                  key={`${item.simulation_type}-${item.id}`}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-[#FBF7F3]"} hover:bg-[#FAF0E8] transition-colors`}
                >
                  {/* Type Badge */}
                  <td className="px-4 py-3">
                    {item.simulation_type === "product" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <FiBox size={13} />
                        {t("product")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        <IoColorPaletteOutline size={13} />
                        {t("theme")}
                      </span>
                    )}
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4E9E1] text-[#C08457]">
                        <FiUser size={14} />
                      </div>
                      <div>
                        <p className="font-semibold text-[#2A1A0E] text-xs sm:text-sm">
                          {item.user_name || t("guestUser")}
                        </p>
                        {item.user_email && (
                          <p className="text-[11px] text-[#8C7365]">{item.user_email}</p>
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
                          className="h-10 w-10 rounded-lg object-cover border border-[#EFE5DD] bg-gray-50 flex-shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                          <FiBox size={18} />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[#2A1A0E] text-sm leading-tight">
                          {item.item_name}
                        </p>
                        <p className="text-[11px] text-[#8C7365]">
                          {t("category")}: <span className="font-medium text-[#4A3B32]">{item.category_name}</span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Specs */}
                  <td className="px-4 py-3">
                    {renderSpecBadges(item)}
                  </td>

                  {/* Saved Date */}
                  <td className="px-4 py-3 text-xs text-[#7D6C63] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <FiCalendar size={13} className="text-[#C08457]" />
                      <span>{item.formatted_date || item.created_at}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedSimulation(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EFE5DD] bg-white text-xs font-semibold text-[#C08457] hover:bg-[#FAF5F0] hover:border-[#C08457] transition-all shadow-sm"
                    >
                      <FiEye size={14} />
                      {t("viewDetails")}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  <FiBookmark size={28} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium text-gray-600">{t("noSimulationsFound")}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t("noSimulationsSubtitle")}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredSimulations.length > pageSize && (
        <div className="flex justify-end mt-4">
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            total={filteredSimulations.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Inspector Modal */}
      {selectedSimulation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-[#EFE5DD] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFE5DD] bg-[#FAF5F0]">
              <div className="flex items-center gap-2.5">
                {selectedSimulation.simulation_type === "product" ? (
                  <span className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <FiBox size={20} />
                  </span>
                ) : (
                  <span className="p-2 rounded-lg bg-purple-100 text-purple-700">
                    <IoColorPaletteOutline size={20} />
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-bold text-[#2A1A0E]">
                    {selectedSimulation.item_name}
                  </h3>
                  <p className="text-xs text-[#8C7365]">
                    {t("savedSimulationNumber", { id: selectedSimulation.id })} &bull; {(selectedSimulation.simulation_type === "product" ? t("product") : t("theme")).toUpperCase()}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF5F0] border border-[#EFE5DD]">
                <div>
                  <p className="text-xs font-semibold text-[#8C7365] uppercase tracking-wider">{t("customerDetails")}</p>
                  <p className="text-sm font-bold text-[#2A1A0E] mt-1">{selectedSimulation.user_name || t("guestUser")}</p>
                  <p className="text-xs text-gray-600">{selectedSimulation.user_email || t("noEmailProvided")}</p>
                  {selectedSimulation.user_id && (
                    <p className="text-[11px] text-gray-400 mt-0.5">{t("userId", { id: selectedSimulation.user_id })}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#8C7365] uppercase tracking-wider">{t("itemDetails")}</p>
                  <p className="text-sm font-bold text-[#2A1A0E] mt-1">{selectedSimulation.item_name}</p>
                  <p className="text-xs text-gray-600">{t("category")}: {selectedSimulation.category_name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{t("saved")}: {selectedSimulation.formatted_date}</p>
                </div>
              </div>

              {/* Design Specifications Summary */}
              {selectedSimulation.design_specifications && Object.keys(selectedSimulation.design_specifications).length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[#2A1A0E] mb-3 flex items-center gap-2">
                    <FiSliders className="text-[#C08457]" />
                    {t("designSpecifications")}
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
                        <div key={key} className="p-3 rounded-lg border border-[#EFE5DD] bg-white">
                          <span className="text-[11px] font-medium text-[#8C7365] uppercase tracking-wider block">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="text-sm font-bold text-[#2A1A0E] mt-0.5 block truncate" title={displayVal}>
                            {displayVal}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-[#EFE5DD] bg-gray-50">
              <button
                type="button"
                onClick={() => setSelectedSimulation(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-300 transition-colors"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedSimulations;
