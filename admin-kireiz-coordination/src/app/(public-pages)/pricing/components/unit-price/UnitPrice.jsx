"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FiEdit2, FiDownload, FiChevronDown } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiGetUnitPriceList,
  apiExportUnitPrice,
} from "@/services/UnitPriceService";
import Pagination from "@/components/ui/Pagination";

const exportOptions = [
  { value: "csv", label: "CSV" },
  { value: "excel", label: "Excel" },
  { value: "pdf", label: "PDF" },
];

const UnitPrice = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Export dropdown
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const dropdownRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [pagination, setPagination] = useState({
    total_items: 0,
    total_pages: 1,
  });

  /* ---------- FETCH ---------- */
  const fetchUnitPrices = useCallback(async () => {
    // if (!accessToken) return;

    try {
      setLoading(true);
      const response = await apiGetUnitPriceList(currentPage, pageSize);

      if (response?.status && response?.data) {
        setData(response.data);
        setPagination({
          total_items: response.pagination?.total_items || response.count || 0,
          total_pages: response.pagination?.total_pages || 1,
        });
      }
    } catch (error) {
      console.error("Failed to fetch unit prices:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchUnitPrices();
  }, [fetchUnitPrices]);

  /* ---------- CLOSE DROPDOWN ON OUTSIDE CLICK ---------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------- EXPORT ---------- */
  const handleExport = async (type) => {
    setExporting(true);
    setExportOpen(false);

    try {
      const response = await apiExportUnitPrice(type);

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers?.["content-disposition"];
      let filename = `unit-price-export.${type === "excel" ? "xlsx" : type}`;

      if (contentDisposition) {
        const match = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
        );
        if (match?.[1]) {
          filename = match[1].replace(/['"]/g, "");
        }
      }

      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  /* ---------- SKELETON ---------- */
  const TableSkeleton = () => (
    <div className="overflow-x-auto bg-white rounded-xl border border-[#E2E8F0]">
      <table className="w-full text-sm">
        <thead className="bg-[#F8FAFC] text-[#486284]">
          <tr>
            <th className="px-4 py-4 text-left font-medium">Type</th>
            <th className="px-4 py-4 text-left font-medium">Item Name</th>
            <th className="px-4 py-4 text-left font-medium">Unit</th>
            <th className="px-4 py-4 text-left font-medium">Base Price</th>
            <th className="px-4 py-4 text-left font-medium">Bulk (10+)</th>
            <th className="px-4 py-4 text-left font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr
              key={i}
              className={`${i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}`}
            >
              <td className="px-4 py-4">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className="rounded-xl shadow md:p-6 p-4">
        {/* Header */}
        <div className="flex justify-between sm:flex-row flex-col items-start gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              Unit Price
            </h2>
            <p className="text-sm text-[#486284]">
              {data.total_items} items total
            </p>
          </div>

          <div className="flex gap-3">
            {/* <button className="border border-[#CBD5E1] text-[#1C2C56] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
              Reset Default
            </button> */}

            {/* Export Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setExportOpen(!exportOpen)}
                disabled={exporting}
                className="bg-[#1C4FA8] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 disabled:opacity-60"
              >
                <FiDownload size={16} />
                {exporting ? "Exporting..." : "Export"}
                <FiChevronDown
                  size={14}
                  className={`transition-transform ${exportOpen ? "rotate-180" : ""}`}
                />
              </button>

              {exportOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-[#E2E8F0] z-50 overflow-hidden">
                  {exportOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleExport(opt.value)}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#1C2C56] hover:bg-[#EEF2FF] transition-colors flex items-center gap-2"
                    >
                      <FiDownload size={14} className="text-[#64748B]" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <TableSkeleton />
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-[#94A3B8]">
            No unit price data found
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl border border-[#E2E8F0]">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] text-[#486284]">
                <tr>
                  <th className="px-4 py-4 text-left font-medium">Type</th>
                  <th className="px-4 py-4 text-left font-medium">Item Name</th>
                  <th className="px-4 py-4 text-left font-medium">Unit</th>
                  <th className="px-4 py-4 text-left font-medium">
                    Base Price
                  </th>
                  <th className="px-4 py-4 text-left font-medium">
                    Bulk (10+)
                  </th>
                  {/* <th className="px-4 py-4 text-left font-medium">Action</th> */}
                </tr>
              </thead>

              <tbody>
                {data.map((item, index) => (
                  <tr
                    key={index}
                    className={`text-[#486284] ${
                      index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"
                    }`}
                  >
                    <td className="px-4 py-4">
                      <span className="bg-[#E5E7EB] text-[#1C2C56] px-2 py-1 rounded-full text-xs font-medium">
                        {item.type}
                      </span>
                    </td>

                    <td className="px-4 py-4 font-medium">{item.itemName}</td>

                    <td className="px-4 py-4">{item.unit}</td>

                    <td className="px-4 py-4 font-medium">₹{item.basePrice}</td>

                    <td className="px-4 py-4 font-medium">₹{item.bulk}</td>
                    {/* <td className="px-4 py-4">
                      <button className="text-[#1C4FA8] hover:text-[#163E85] transition-colors">
                        <FiEdit2 size={18} />
                      </button>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="mt-5">
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          total={pagination.total_items}
          onChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </>
  );
};

export default UnitPrice;
