"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { FiEdit2, FiDownload, FiChevronDown, FiX } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiGetUnitPriceList,
  apiExportUnitPrice,
  apiUpdateUnitPrice,
} from "@/services/UnitPriceService";
import Pagination from "@/components/ui/Pagination";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";

// `value` is the API's export format and stays untranslated.
const exportOptions = [
  { value: "csv", labelKey: "csv" },
  { value: "excel", labelKey: "excel" },
  { value: "pdf", labelKey: "pdf" },
];

const UnitPrice = () => {
  const t = useTranslations("pricingQuotation.unitPrice");
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

  // Edit Unit Price Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [fieldError, setFieldError] = useState("");

  const [pagination, setPagination] = useState({
    total_items: 0,
    total_pages: 1,
  });

  /* ---------- FETCH ---------- */
  const fetchUnitPrices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiGetUnitPriceList(currentPage, pageSize);

      if (response?.status && response?.data) {
        setData(response.data);
        setPagination({
          total_items: response.pagination?.total_items || response.count || response.data.length,
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
    if (exporting) return;
    setExporting(true);
    setExportOpen(false);

    try {
      const response = await apiExportUnitPrice(type);

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

  /* ---------- EDIT MODAL OPEN ---------- */
  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setEditPrice(item.basePrice != null ? String(item.basePrice) : "");
    setEditError("");
    setFieldError("");
    setEditModalOpen(true);
  };

  /* ---------- EDIT PRICE CHANGE ---------- */
  const handlePriceChange = (val) => {
    setEditPrice(val);
    if (val === "") {
      setFieldError(t("editModal.validation.priceRequired"));
    } else if (Number(val) < 0) {
      setFieldError(t("editModal.validation.priceNegative"));
    } else if (isNaN(Number(val))) {
      setFieldError(t("editModal.validation.priceInvalid"));
    } else {
      setFieldError("");
    }
  };

  /* ---------- EDIT SAVE ---------- */
  const handleSavePrice = async () => {
    if (!selectedItem || editSaving) return;
    if (editPrice === "" || editPrice === null || editPrice === undefined) {
      setFieldError(t("editModal.validation.priceRequired"));
      return;
    }
    const num = Number(editPrice);
    if (isNaN(num)) {
      setFieldError(t("editModal.validation.priceInvalid"));
      return;
    }
    if (num < 0) {
      setFieldError(t("editModal.validation.priceNegative"));
      return;
    }

    try {
      setEditSaving(true);
      setEditError("");
      setFieldError("");
      const res = await apiUpdateUnitPrice(accessToken, {
        id: selectedItem.id,
        type: selectedItem.type,
        basePrice: num,
      });

      if (res?.status) {
        toast.push(
          <Notification title={t("editModal.successTitle")} type="success">
            {res.message || t("editModal.successMessage")}
          </Notification>,
        );
        setEditModalOpen(false);
        setSelectedItem(null);
        fetchUnitPrices();
      } else {
        setEditError(res?.message || t("editModal.saveFailed"));
      }
    } catch (err) {
      console.error("Failed to update unit price:", err);
      setEditError(
        err?.response?.data?.message || err?.message || t("editModal.saveFailed"),
      );
    } finally {
      setEditSaving(false);
    }
  };

  /* ---------- SKELETON ---------- */
  const TableSkeleton = () => (
    <div className="overflow-x-auto bg-white rounded-xl border border-[#E2E8F0]">
      <table className="w-full text-sm">
        <thead className="bg-[#F8FAFC] text-[#486284]">
          <tr>
            <th className="px-4 py-4 text-left font-medium">
              {t("table.type")}
            </th>
            <th className="px-4 py-4 text-left font-medium">
              {t("table.itemName")}
            </th>
            <th className="px-4 py-4 text-left font-medium">
              {t("table.unit")}
            </th>
            <th className="px-4 py-4 text-left font-medium">
              {t("table.basePrice")}
            </th>
            <th className="px-4 py-4 text-left font-medium">
              {t("table.bulk")}
            </th>
            <th className="px-4 py-4 text-left font-medium">
              {t("table.action")}
            </th>
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
                <div className="h-4 bg-gray-200 rounded w-10 animate-pulse" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className="bg-[#F4F7FC] rounded-xl shadow md:p-6 p-4">
        {/* Header */}
        <div className="flex justify-between sm:flex-row flex-col items-start gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#1C2C56]">
              {t("title")}
            </h2>
            {/* <p className="text-base text-[#486284]">{t("subtitle")}</p> */}
          </div>

          <div className="flex gap-3">
            {/* Export Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setExportOpen((prev) => !prev)}
                disabled={exporting}
                className="bg-white border border-[#CBD5E1] text-[#1C2C56] px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-[#F8FAFC] transition-colors disabled:opacity-50"
              >
                <FiDownload size={15} />
                {exporting ? t("exporting") : t("export")}
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
                      {t(opt.labelKey)}
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
          <div className="text-center py-16 text-[#94A3B8]">{t("noData")}</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl border border-[#E2E8F0]">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] text-[#486284]">
                <tr>
                  <th className="px-4 py-4 text-left font-medium">
                    {t("table.type")}
                  </th>
                  <th className="px-4 py-4 text-left font-medium">
                    {t("table.itemName")}
                  </th>
                  <th className="px-4 py-4 text-left font-medium">
                    {t("table.unit")}
                  </th>
                  <th className="px-4 py-4 text-left font-medium">
                    {t("table.basePrice")}
                  </th>
                  <th className="px-4 py-4 text-left font-medium">
                    {t("table.bulk")}
                  </th>
                  <th className="px-4 py-4 text-left font-medium">
                    {t("table.action")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.map((item, index) => (
                  <tr
                    key={item.id ? `${item.type}-${item.id}` : index}
                    className={`text-[#486284] ${index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"
                      }`}
                  >
                    <td className="px-4 py-4">
                      <span className="bg-[#E5E7EB] text-[#1C2C56] px-2 py-1 rounded-full text-xs font-medium">
                        {item.type}
                      </span>
                    </td>

                    <td className="px-4 py-4 font-medium">{item.itemName}</td>

                    <td className="px-4 py-4">{item.unit}</td>

                    <td className="px-4 py-4 font-medium">
                      {item.basePrice != null ? `$${Number(item.basePrice).toFixed(2)}` : "-"}
                    </td>

                    <td className="px-4 py-4 font-medium text-green-700">
                      {item.bulk != null ? `$${Number(item.bulk).toFixed(2)}` : "-"}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Unit Price"
                        className="text-[#1C4FA8] hover:text-[#163E85] transition-colors p-1.5 rounded hover:bg-blue-50"
                      >
                        <FiEdit2 size={16} />
                      </button>
                    </td>
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

      {/* Edit Unit Price Modal */}
      <Dialog
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onRequestClose={() => setEditModalOpen(false)}
        width={480}
      >
        <div className="p-4">
          <div className="flex justify-between items-center pb-3 border-b">
            <h3 className="text-lg font-semibold text-[#1C2C56]">
              {t("editModal.title")}
            </h3>
            <button
              onClick={() => setEditModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX size={18} />
            </button>
          </div>

          {selectedItem && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  {t("editModal.itemName")}
                </label>
                <div className="mt-1 p-2 bg-gray-50 rounded-lg text-sm font-medium text-[#1C2C56] border">
                  {selectedItem.itemName} ({selectedItem.type})
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  {t("editModal.unit")}
                </label>
                <div className="mt-1 p-2 bg-gray-50 rounded-lg text-sm text-gray-700 border">
                  {t("editModal.perUnit", { unit: selectedItem.unit })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase">
                  {t("editModal.basePrice")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="0.00"
                  className={`w-full mt-1 border ${
                    fieldError
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-[#1C4FA8]"
                  } rounded-lg px-3 py-2 text-sm outline-none focus:ring-2`}
                />
                {fieldError && (
                  <p className="text-red-500 text-xs mt-1">{fieldError}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  {t("editModal.bulkDiscount")}
                </label>
                <div className="mt-1 p-2 bg-green-50 text-green-700 rounded-lg text-sm font-semibold border border-green-200">
                  $
                  {editPrice && !isNaN(Number(editPrice)) && Number(editPrice) >= 0
                    ? (Number(editPrice) * 0.9).toFixed(2)
                    : "0.00"}
                </div>
              </div>

              {editError && (
                <div className="p-2.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-200">
                  {editError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t">
                <Button
                  type="button"
                  size="sm"
                  variant="plain"
                  onClick={() => setEditModalOpen(false)}
                >
                  {t("editModal.cancel")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="solid"
                  className="bg-[#1C4FA8] text-white hover:bg-[#163e85]"
                  disabled={editSaving}
                  onClick={handleSavePrice}
                >
                  {editSaving ? t("editModal.saving") : t("editModal.save")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default UnitPrice;
