"use client";

import { useCallback, useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  FiGrid,
  FiSearch,
  FiImage,
  FiAlertTriangle,
  FiInfo,
} from "react-icons/fi";
import { useTranslations } from "next-intl";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
  apiGetSimulationAssets,
  apiUpdateSimulationAsset,
  apiReorderSimulationAssets,
} from "@/services/SimulationAssetService";

/*
 * DESIGN NOTE — no Figma for this screen. KS has a "Simulation Assets" menu but its
 * component is an empty 41-line placeholder, so there was nothing to port.
 *
 * Scope is limited on purpose: this manages layer **stacking order** and
 * **registration offsets** for existing part images. Those are needed by any
 * layered-canvas renderer, whether colour ends up being applied by swapping
 * pre-rendered images or by tinting a mask — so none of it is wasted once that
 * decision lands. Colour/material mapping is intentionally absent until then.
 * See doc/md/07-review-findings.md finding #2.
 */

const notify = (title, type, message) =>
  toast.push(
    <Notification title={title} type={type}>
      {message}
    </Notification>,
  );

const SimulationAssets = () => {
  const t = useTranslations("simulationAssets");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [layers, setLayers] = useState([]);
  const [missingCount, setMissingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLayers = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiGetSimulationAssets(accessToken, {
        search: debouncedSearch,
      });
      if (res?.status) {
        setLayers(res.data?.layers || []);
        setMissingCount(res.data?.missing_image_count || 0);
      }
    } catch (error) {
      console.error("Failed to load simulation assets:", error);
      notify(t("errorTitle"), "danger", t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [accessToken, debouncedSearch, t]);

  useEffect(() => {
    fetchLayers();
  }, [fetchLayers]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const items = Array.from(layers);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    // Optimistic: reflect the new stack immediately, roll back if saving fails.
    const previous = layers;
    setLayers(items.map((l, i) => ({ ...l, z_index: i })));

    try {
      const res = await apiReorderSimulationAssets(
        accessToken,
        items.map((l) => l.id),
      );
      if (!res?.status) throw new Error(res?.message || t("reorderFailed"));
    } catch (error) {
      console.error("Failed to save layer order:", error);
      setLayers(previous);
      notify(t("errorTitle"), "danger", t("saveOrderFailed"));
    }
  };

  const saveOffset = async (layer, field, value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;

    const key = field === "offset_x" ? "offset_x" : "offset_y";
    if (layer[key] === parsed) return;

    try {
      setSavingId(layer.id);
      const res = await apiUpdateSimulationAsset(accessToken, layer.id, {
        [key]: parsed,
      });
      if (res?.status) {
        setLayers((prev) =>
          prev.map((l) => (l.id === layer.id ? { ...l, [key]: parsed } : l)),
        );
      } else {
        notify(
          t("errorTitle"),
          "danger",
          res?.message || t("saveOffsetFailed"),
        );
      }
    } catch (error) {
      console.error("Failed to save offset:", error);
      notify(t("errorTitle"), "danger", t("saveOffsetFailed"));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="px-5 md:px-8 lg:px-12 py-8 bg-white min-h-screen">
      {/* Header */}
      <p className="text-sm text-[#486284] mb-2">
        {t("breadcrumbDashboard")} /{" "}
        <span className="text-[#1C2C56]">{t("breadcrumbCurrent")}</span>
      </p>
      <h1 className="text-2xl font-semibold text-[#1C2C56]">
        {t("pageTitle")}
      </h1>
      <p className="text-base font-medium text-[#64748B]">
        {t("pageSubtitle")}
      </p>

      {/* Scope note — explains what this screen does and does not cover */}
      <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 mt-5">
        <FiInfo className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
        <p className="text-xs text-blue-900">{t("scopeNote")}</p>
      </div>

      {missingCount > 0 && (
        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 mt-3">
          <FiAlertTriangle
            className="text-amber-600 mt-0.5 flex-shrink-0"
            size={16}
          />
          <p className="text-xs text-amber-900">
            {t("missingImages", { count: missingCount })}
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative w-72 mt-6 mb-4">
        <FiSearch className="absolute left-3 top-2.5 text-[#64748B]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1C4FA8]/30"
        />
      </div>

      {loading && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-[#E2E8F0] rounded-xl p-4 animate-pulse flex gap-4"
            >
              <div className="w-14 h-14 bg-gray-200 rounded" />
              <div className="flex-1">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-100 rounded mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && layers.length === 0 && (
        <div className="border border-dashed border-[#CBD5E1] rounded-xl py-12 text-center">
          <p className="text-base font-medium text-[#1C2C56]">
            {debouncedSearch ? t("noSearchResults") : t("noParts")}
          </p>
          <p className="text-sm text-[#64748B] mt-1">
            {t("noPartsDescription")}
          </p>
        </div>
      )}

      {/* Layer stack */}
      {!loading && layers.length > 0 && (
        <>
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span>{t("layerCount", { count: layers.length })}</span>
            <span>{t("stackDirection")}</span>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="simulationLayers">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3"
                >
                  {layers.map((layer, index) => (
                    <Draggable
                      key={layer.id}
                      draggableId={String(layer.id)}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center gap-4"
                        >
                          {/* Drag handle */}
                          <span
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing flex-shrink-0"
                          >
                            <FiGrid className="text-[#94A3B8]" size={18} />
                          </span>

                          {/* Thumbnail */}
                          <div className="w-14 h-14 rounded-lg bg-[#F1F5F9] flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {layer.image ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={layer.image}
                                alt={layer.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <FiImage className="text-[#CBD5E1]" size={20} />
                            )}
                          </div>

                          {/* Meta */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-[#1C2C56] truncate">
                                {layer.name}
                              </p>
                              <span className="text-[10px] bg-[#F1F5F9] text-[#486284] px-2 py-0.5 rounded">
                                z {layer.z_index}
                              </span>
                              {!layer.has_image && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                  {t("noImage")}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#64748B] mt-0.5 truncate">
                              {[layer.fabric, layer.category, layer.subcategory]
                                .filter(Boolean)
                                .join(" · ") || "—"}
                            </p>
                          </div>

                          {/* Offsets */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {[
                              ["offset_x", "X"],
                              ["offset_y", "Y"],
                            ].map(([field, label]) => (
                              <label
                                key={field}
                                className="flex items-center gap-1.5"
                              >
                                <span className="text-xs text-[#64748B]">
                                  {label}
                                </span>
                                <input
                                  type="number"
                                  defaultValue={layer[field]}
                                  disabled={savingId === layer.id}
                                  onBlur={(e) =>
                                    saveOffset(layer, field, e.target.value)
                                  }
                                  className="w-20 border border-[#E2E8F0] rounded-md px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-[#1C4FA8]/30 disabled:opacity-50"
                                />
                              </label>
                            ))}
                            <span className="text-[10px] text-[#94A3B8] w-8">
                              {t("pixels")}
                            </span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </>
      )}
    </div>
  );
};

export default SimulationAssets;
