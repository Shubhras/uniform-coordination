"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiEyeOff,
  FiInfo,
  FiLayers,
  FiMaximize,
  FiRotateCcw,
  FiTag,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";
import { useTranslations } from "next-intl";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
  apiGetSimulationOptions,
  apiGetSimulationStructure,
} from "@/services/SimulationAssetService";

/*
 * Admin preview of what the customer simulation will show for a product.
 *
 * Laid out like the KIREIZ SPACE screen — icon rail, config panel, canvas, toolbar —
 * so both admins drive the simulation the same way.
 *
 * Two deliberate differences from KIREIZ SPACE:
 *
 *   1. The canvas here draws the real part images, stacked by z-index at their
 *      configured offsets. KIREIZ SPACE shows a fixed placeholder render.
 *
 *   2. Picking a fabric highlights the layers that use it rather than recolouring the
 *      composite. How colour reaches the render (pre-rendered image swap vs. canvas
 *      tinting) is still an open decision, so tinting here would show the admin
 *      something the customer site does not do.
 *
 * Reads the customer endpoints (simulation/options/, simulation-assets/structure/)
 * rather than admin-only ones, so this is literally what a shopper receives — if the
 * two ever disagree, this screen is where it shows.
 */

// Canvas the offsets are expressed against. Matches the largest preset in
// PDF & Simulation Configuration (A4 at 72 DPI ≈ 595 x 842).
const CANVAS_W = 595;
const CANVAS_H = 842;

const ZOOM_MIN = 50;
const ZOOM_MAX = 200;
const ZOOM_STEP = 25;

const notify = (title, type, message) =>
  toast.push(
    <Notification title={title} type={type}>
      {message}
    </Notification>,
  );

const matches = (name, ...needles) => {
  const n = (name || "").toLowerCase();
  return needles.some((x) => n.includes(x));
};

const PreviewSimulation = ({ initialProductId = null }) => {
  const t = useTranslations("simulationAssets");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [products, setProducts] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [colors, setColors] = useState([]);
  const [structures, setStructures] = useState({});
  const [loading, setLoading] = useState(true);

  const [activePanel, setActivePanel] = useState("product");
  const [selectedId, setSelectedId] = useState("");
  const [openCategory, setOpenCategory] = useState("");
  const [selectedFabric, setSelectedFabric] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [hidden, setHidden] = useState(() => new Set());
  const [zoom, setZoom] = useState(100);

  const load = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [optionsRes, structureRes] = await Promise.all([
        apiGetSimulationOptions(accessToken),
        apiGetSimulationStructure(accessToken),
      ]);

      if (optionsRes?.status) {
        const rows = optionsRes.data?.products || [];
        setProducts(rows);
        setFabrics(optionsRes.data?.fabrics || []);
        setColors(optionsRes.data?.colors || []);

        // Open on something that actually draws. Picking rows[0] blindly lands on a
        // product with no part images and the canvas reads as broken.
        setSelectedId((prev) => {
          if (initialProductId) return String(initialProductId);
          if (prev) return prev;
          const drawable = rows.find((p) => p.layer_count > 0);
          return String((drawable || rows[0])?.id || "");
        });
      }
      if (structureRes?.status) setStructures(structureRes.data || {});
    } catch (error) {
      console.error("Failed to load preview data:", error);
      notify(t("errorTitle"), "danger", t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [accessToken, initialProductId, t]);

  useEffect(() => {
    load();
  }, [load]);

  const product = useMemo(
    () => products.find((p) => String(p.id) === String(selectedId)) || null,
    [products, selectedId],
  );

  // Already sorted bottom-to-top by the API; render in that order.
  const layers = product?.layers || [];

  // Only categories that own a simulatable product — a category with nothing to
  // draw would be a dead end in the rail.
  const categories = useMemo(() => {
    const seen = new Map();
    products.forEach((p) => {
      if (p.category && !seen.has(p.category)) seen.set(p.category, 0);
      if (p.category) seen.set(p.category, seen.get(p.category) + 1);
    });
    return [...seen.entries()].map(([name, count]) => ({ name, count }));
  }, [products]);

  const enabledAttributes = useMemo(() => {
    const rows = structures[openCategory || product?.category] || [];
    return rows
      .filter((a) => a.enabled)
      .slice()
      .sort((a, b) => Number(a.order) - Number(b.order));
  }, [structures, openCategory, product]);

  // Fabrics the selected product actually uses, so the panel does not offer a
  // fabric that appears nowhere in the render.
  const productFabricIds = useMemo(
    () => new Set(layers.map((l) => l.fabric_id).filter(Boolean)),
    [layers],
  );
  const productFabrics = useMemo(
    () => fabrics.filter((f) => productFabricIds.has(f.id)),
    [fabrics, productFabricIds],
  );

  const visibleLayers = layers.filter((l) => !hidden.has(l.id));
  const highlighting = !!selectedFabric && productFabricIds.size > 0;

  const toggleLayer = (id) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setHidden(visibleLayers.length ? new Set(layers.map((l) => l.id)) : new Set());

  const resetView = () => {
    setHidden(new Set());
    setZoom(100);
    setSelectedFabric("");
    setSelectedColor("");
  };

  const pickCategory = (name) => {
    setOpenCategory(name);
    // Show the category's own render straight away, otherwise clicking a category
    // changes the panel but leaves an unrelated product on the canvas.
    const first =
      products.find((p) => p.category === name && p.layer_count > 0) ||
      products.find((p) => p.category === name);
    if (first) {
      setSelectedId(String(first.id));
      setHidden(new Set());
    }
    setSelectedFabric("");
  };

  const selectProduct = (id) => {
    setSelectedId(id);
    setHidden(new Set());
    setSelectedFabric("");
  };

  if (loading) {
    return (
      <div className="mt-5 grid gap-4 lg:grid-cols-[72px_210px_minmax(0,1fr)]">
        <div className="h-[100px] border border-[#E2E8F0] rounded-xl animate-pulse" />
        <div className="h-96 border border-[#E2E8F0] rounded-xl animate-pulse" />
        <div className="h-96 border border-[#E2E8F0] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mt-5">
        <h2 className="text-lg font-semibold text-[#1C2C56]">
          {t("previewTitle")}
        </h2>
        <p className="text-sm text-[#64748B] mt-1">{t("previewSubtitle")}</p>
        <div className="mt-5 border border-dashed border-[#CBD5E1] rounded-xl py-12 text-center">
          <p className="text-base font-medium text-[#1C2C56]">
            {t("previewNoProducts")}
          </p>
          <p className="text-sm text-[#64748B] mt-1">
            {t("previewNoProductsHint")}
          </p>
        </div>
      </div>
    );
  }

  const railItems = [
    { id: "product", label: t("previewRailProduct"), Icon: FiTag },
    { id: "categories", label: t("previewRailCategories"), Icon: FiLayers },
  ];

  const renderAttribute = (attr) => {
    const name = attr.attribute;

    if (matches(name, "fabric", "material")) {
      return (
        <div className="mt-4" key={name}>
          <p className="text-[11px] font-semibold text-[#1C2C56]">{name}</p>
          {productFabrics.length ? (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {productFabrics.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() =>
                    setSelectedFabric((prev) => (prev === f.id ? "" : f.id))
                  }
                  className={`rounded-lg border px-2 py-2 text-left transition ${
                    selectedFabric === f.id
                      ? "border-[#1C4FA8] bg-[#E8EEF9]"
                      : "border-[#E2E8F0] bg-white hover:border-[#1C4FA8]"
                  }`}
                >
                  <span className="block text-[10px] font-medium text-[#1C2C56] truncate">
                    {f.name}
                  </span>
                  <span className="block text-[9px] text-[#94A3B8] truncate">
                    {f.material_type || "—"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[10px] text-[#94A3B8] italic">
              {t("previewNoFabrics")}
            </p>
          )}
        </div>
      );
    }

    if (matches(name, "color", "colour")) {
      return (
        <div className="mt-4" key={name}>
          <p className="text-[11px] font-semibold text-[#1C2C56]">{name}</p>
          {colors.length ? (
            <div className="mt-2 grid grid-cols-5 gap-2">
              {colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  title={c.name}
                  onClick={() =>
                    setSelectedColor((prev) => (prev === c.id ? "" : c.id))
                  }
                  className={`h-7 rounded-md border-2 transition ${
                    selectedColor === c.id
                      ? "border-[#1C4FA8]"
                      : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                  }`}
                  style={{ backgroundColor: c.code || "#fff" }}
                />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[10px] text-[#94A3B8] italic">
              {t("previewNoColors")}
            </p>
          )}
        </div>
      );
    }

    // Attributes such as Collar or Sleeve are enabled in the structure but have no
    // option table behind them yet. Showing the attribute with an honest note beats
    // inventing choices the customer site could not offer.
    return (
      <div className="mt-4" key={name}>
        <p className="text-[11px] font-semibold text-[#1C2C56]">{name}</p>
        <p className="mt-1 text-[10px] text-[#94A3B8] italic">
          {t("previewAttrNoOptions")}
        </p>
      </div>
    );
  };

  return (
    <div className="mt-5">
      <h2 className="text-lg font-semibold text-[#1C2C56]">
        {t("previewTitle")}
      </h2>
      <p className="text-sm text-[#64748B] mt-1">{t("previewSubtitle")}</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[72px_210px_minmax(0,1fr)]">
        {/* Rail */}
        <div className="flex gap-2 lg:flex-col">
          {railItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActivePanel(id);
                if (id === "categories") setOpenCategory("");
              }}
              className={`flex h-[92px] w-[64px] flex-col items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-2 text-center shadow-sm transition ${
                activePanel === id
                  ? "border-r-[3px] border-r-[#1C4FA8]"
                  : "border-r-[3px] border-r-transparent hover:bg-[#F8FAFC]"
              }`}
            >
              <Icon
                size={20}
                className={
                  activePanel === id ? "text-[#1C4FA8]" : "text-[#94A3B8]"
                }
              />
              <span
                className={`text-[9px] font-medium leading-tight ${
                  activePanel === id ? "text-[#1C2C56]" : "text-[#94A3B8]"
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Config panel */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          {activePanel === "product" ? (
            <>
              <h3 className="text-[12px] font-semibold text-[#1C2C56]">
                {t("previewSelectProduct")}
              </h3>

              <select
                value={selectedId}
                onChange={(e) => selectProduct(e.target.value)}
                className="mt-2 w-full rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5 text-[11px] text-[#1C2C56]"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.layer_count})
                  </option>
                ))}
              </select>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-[#64748B]">
                    {t("previewScale")}
                  </p>
                  <span className="text-[10px] font-medium text-[#1C2C56]">
                    {zoom}%
                  </span>
                </div>
                <input
                  type="range"
                  min={ZOOM_MIN}
                  max={ZOOM_MAX}
                  step={ZOOM_STEP}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="mt-2 w-full accent-[#1C4FA8]"
                />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                    {t("previewLayerList")}
                  </p>
                  <span className="text-[10px] text-[#94A3B8]">
                    {visibleLayers.length}/{layers.length}
                  </span>
                </div>

                {layers.length === 0 ? (
                  <p className="mt-2 text-[10px] text-[#94A3B8] italic">
                    {t("previewNoLayers")}
                  </p>
                ) : (
                  /* Top of stack first, so this reads like a layers panel. */
                  <ul className="mt-2 space-y-1">
                    {[...layers].reverse().map((layer) => (
                      <li
                        key={layer.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5"
                      >
                        <span className="min-w-0">
                          <span className="block text-[10px] text-[#1C2C56] truncate">
                            {layer.name}
                          </span>
                          <span className="block text-[9px] text-[#94A3B8]">
                            z {layer.z_index} · ({layer.offset_x},{" "}
                            {layer.offset_y})
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleLayer(layer.id)}
                          title={t("previewToggleLayer")}
                          className="flex-shrink-0 text-[#94A3B8] hover:text-[#1C2C56]"
                        >
                          {hidden.has(layer.id) ? (
                            <FiEyeOff size={13} />
                          ) : (
                            <FiEye size={13} />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-4 rounded-lg border border-[#BFD3F2] bg-white px-3 py-2.5 text-[9px] leading-4 text-[#486284]">
                {t("previewTip")}
                <br />
                {t("previewTipText")}
              </div>
            </>
          ) : !openCategory ? (
            <>
              <h3 className="text-[12px] font-semibold text-[#1C2C56]">
                {t("previewCategoriesTitle")}
              </h3>
              <div className="mt-3 space-y-2">
                {categories.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => pickCategory(c.name)}
                    className="flex w-full items-center justify-between rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-[11px] text-[#1C2C56] transition hover:border-[#1C4FA8]"
                  >
                    <span className="truncate">{c.name}</span>
                    <span className="flex items-center gap-1 text-[#94A3B8]">
                      {c.count}
                      <FiChevronRight size={13} />
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setOpenCategory("")}
                className="flex w-full items-center gap-2 rounded-lg bg-[#1C2C56] px-3 py-2 text-[11px] font-medium text-white transition hover:bg-[#16234a]"
              >
                <FiChevronLeft size={13} />
                <span className="truncate">{openCategory}</span>
              </button>

              <select
                value={selectedId}
                onChange={(e) => selectProduct(e.target.value)}
                className="mt-2 w-full rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5 text-[11px] text-[#1C2C56]"
              >
                {products
                  .filter((p) => p.category === openCategory)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.layer_count})
                    </option>
                  ))}
              </select>

              {enabledAttributes.length ? (
                <div className="mt-1 max-h-[420px] overflow-y-auto pr-1">
                  {enabledAttributes.map(renderAttribute)}
                </div>
              ) : (
                <p className="mt-6 text-center text-[10px] text-[#94A3B8] italic">
                  {t("previewNoAttributes")}
                </p>
              )}
            </>
          )}
        </div>

        {/* Canvas */}
        <div className="flex flex-col items-center">
          <div className="relative flex min-h-[360px] w-full items-center justify-center overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            {layers.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">{t("previewNoLayers")}</p>
            ) : (
              <div
                className="relative overflow-hidden rounded-lg border border-[#E2E8F0] bg-white"
                style={{
                  width: "100%",
                  maxWidth: CANVAS_W,
                  aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
                }}
              >
                <div
                  className="absolute inset-0 origin-center transition-transform"
                  style={{ transform: `scale(${zoom / 100})` }}
                >
                  {layers.map((layer) =>
                    hidden.has(layer.id) ? null : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={layer.id}
                        src={layer.image}
                        alt={layer.name}
                        title={`${layer.name} (z ${layer.z_index})`}
                        className={`absolute object-contain transition-opacity ${
                          highlighting && layer.fabric_id !== selectedFabric
                            ? "opacity-20"
                            : "opacity-100"
                        }`}
                        style={{
                          // Offsets are in canvas pixels; express them as a
                          // percentage so the preview scales with the container.
                          left: `${(layer.offset_x / CANVAS_W) * 100}%`,
                          top: `${(layer.offset_y / CANVAS_H) * 100}%`,
                          width: "100%",
                          height: "100%",
                          zIndex: layer.z_index,
                        }}
                      />
                    ),
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="mt-5 flex w-full max-w-[340px] items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-[#486284] shadow-sm">
            <span className="rounded-md bg-[#1C4FA8] p-2 text-white">
              <FiTag size={13} />
            </span>
            <button
              type="button"
              onClick={toggleAll}
              title={t("previewToggleAll")}
              className="transition hover:text-[#1C4FA8]"
            >
              {visibleLayers.length ? <FiEye size={14} /> : <FiEyeOff size={14} />}
            </button>
            <button
              type="button"
              onClick={resetView}
              title={t("previewReset")}
              className="transition hover:text-[#1C4FA8]"
            >
              <FiRotateCcw size={14} />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
              disabled={zoom <= ZOOM_MIN}
              title={t("previewZoomOut")}
              className="transition hover:text-[#1C4FA8] disabled:opacity-40"
            >
              <FiZoomOut size={14} />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
              disabled={zoom >= ZOOM_MAX}
              title={t("previewZoomIn")}
              className="transition hover:text-[#1C4FA8] disabled:opacity-40"
            >
              <FiZoomIn size={14} />
            </button>
            <span className="text-[12px] font-medium text-[#1C2C56]">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(100)}
              title={t("previewFit")}
              className="transition hover:text-[#1C4FA8]"
            >
              <FiMaximize size={14} />
            </button>
          </div>
        </div>
      </div>

      {product?.parts_without_image?.length > 0 && (
        <div className="mt-5 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <FiAlertTriangle
            className="mt-0.5 flex-shrink-0 text-amber-600"
            size={14}
          />
          <p className="text-xs text-amber-900">
            {t("previewMissingImages", {
              count: product.parts_without_image.length,
            })}
          </p>
        </div>
      )}

      <div className="mt-4 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <FiInfo className="mt-0.5 flex-shrink-0 text-blue-600" size={16} />
        <p className="text-xs text-blue-900">
          {highlighting ? t("previewFabricHighlight") : t("previewNote")}
        </p>
      </div>
    </div>
  );
};

export default PreviewSimulation;
