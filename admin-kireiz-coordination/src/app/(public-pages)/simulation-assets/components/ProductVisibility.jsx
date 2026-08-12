"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiRotateCcw, FiEye, FiAlertTriangle } from "react-icons/fi";
import { useTranslations } from "next-intl";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import Pagination from "@/components/ui/Pagination";
import {
  apiGetProductVisibility,
  apiToggleProductVisibility,
} from "@/services/SimulationAssetService";

/*
 * Admin control over which products the customer simulation offers.
 *
 * Laid out to match the KIREIZ SPACE screen: search, category filter, reset, a
 * table with a Show in Simulation toggle, and paging.
 *
 * The customer endpoints filter on the same Product.show_in_simulation flag, so a
 * toggle here changes the customer side straight away.
 *
 * Note on columns: KIREIZ SPACE shows Style and Color because its products carry
 * those fields. Uniform products do not — fabric lives on the parts a product is
 * built from, and colour is a global palette rather than a per-product value. So
 * Fabric is derived from the product's parts and Style/Color are omitted rather
 * than filled with invented data.
 */

const PAGE_SIZE = 10;

const notify = (title, type, message) =>
  toast.push(
    <Notification title={title} type={type}>
      {message}
    </Notification>,
  );

const ProductVisibility = () => {
  const t = useTranslations("simulationAssets");
  const router = useRouter();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [enabledCount, setEnabledCount] = useState(0);
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiGetProductVisibility(accessToken, {
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        categoryId,
      });
      if (res?.status) {
        setProducts(res.data || []);
        setCategories(res.categories || []);
        setTotal(res.count || 0);
        setEnabledCount(res.enabled_count || 0);
      }
    } catch (error) {
      console.error("Failed to load product visibility:", error);
      notify(t("errorTitle"), "danger", t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, debouncedSearch, categoryId, t]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategoryId("");
    setPage(1);
  };

  const toggle = async (product) => {
    if (savingId) return;
    const next = !product.show_in_simulation;

    // Optimistic — the switch should feel instant; revert if the save fails.
    const previous = products;
    const previousEnabled = enabledCount;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, show_in_simulation: next } : p,
      ),
    );
    setEnabledCount((n) => n + (next ? 1 : -1));

    try {
      setSavingId(product.id);
      const res = await apiToggleProductVisibility(accessToken, product.id, next);
      if (res?.status) {
        notify("Success", "success", res.message);
      } else {
        throw new Error(res?.message || "Toggle failed");
      }
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
      setProducts(previous);
      setEnabledCount(previousEnabled);
      notify(t("errorTitle"), "danger", error?.message || "Could not save");
    } finally {
      setSavingId(null);
    }
  };

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="mt-5">
      <h2 className="text-lg font-semibold text-[#1C2C56]">
        {t("visibilityTitle")}
      </h2>
      <p className="text-sm text-[#64748B] mt-1">{t("visibilitySubtitle")}</p>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mt-5 mb-4">
        <div className="relative flex-1 min-w-[240px]">
          <FiSearch className="absolute left-3 top-2.5 text-[#64748B]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("visibilitySearchByName")}
            className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1C4FA8]/30"
          />
        </div>

        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
          className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm bg-white min-w-[180px]"
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center gap-2 border border-[#CBD5E1] text-[#486284] px-3 py-2 rounded-lg text-sm"
        >
          <FiRotateCcw size={14} />
          {t("reset")}
        </button>
      </div>

      {loading && (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-[#E2E8F0] rounded-lg p-4 animate-pulse h-14"
            />
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="border border-dashed border-[#CBD5E1] rounded-xl py-12 text-center">
          <p className="text-base font-medium text-[#1C2C56]">
            {t("noProducts")}
          </p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <>
          <div className="border border-[#E2E8F0] rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] text-[#64748B]">
                <tr>
                  <th className="text-left font-medium px-4 py-3">
                    {t("colProduct")}
                  </th>
                  <th className="text-left font-medium px-4 py-3">
                    {t("colCategory")}
                  </th>
                  <th className="text-left font-medium px-4 py-3">
                    {t("colFabric")}
                  </th>
                  <th className="text-left font-medium px-4 py-3">
                    {t("colLayers")}
                  </th>
                  <th className="text-left font-medium px-4 py-3">
                    {t("colShowInSimulation")}
                  </th>
                  <th className="text-right font-medium px-4 py-3">
                    {t("colAction")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-[#F1F5F9]">
                    <td className="px-4 py-3 text-[#1C2C56] font-medium">
                      {p.name}
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">
                      {p.category || "—"}
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">
                      {p.fabrics?.length ? p.fabrics.join(", ") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {p.simulatable ? (
                        <span className="text-[#1C2C56]">{p.layer_count}</span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 text-amber-700 text-xs"
                          title={t("noLayersWarning")}
                        >
                          <FiAlertTriangle size={13} />0
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={p.show_in_simulation}
                        disabled={savingId === p.id}
                        onChange={() => toggle(p)}
                        className="w-4 h-4 accent-[#1C4FA8] disabled:opacity-50 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => router.push(`/products/view/${p.id}`)}
                        title={t("viewProductDetails")}
                        className="text-[#94A3B8] hover:text-[#1C2C56]"
                      >
                        <FiEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <span className="text-xs text-[#64748B]">
              {t("showingRange", { from, to, total })} ·{" "}
              {t("enabledOfTotal", { enabled: enabledCount, total })}
            </span>

            {total > PAGE_SIZE && (
              <Pagination
                currentPage={page}
                total={total}
                pageSize={PAGE_SIZE}
                onChange={setPage}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductVisibility;
