"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiChevronDown, FiPlus, FiTrash2 } from "react-icons/fi";
import { useTranslations } from "next-intl";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
  apiGetSimulationStructure,
  apiSaveSimulationStructure,
} from "@/services/SimulationAssetService";

/*
 * Which attributes the customer simulation shows per category, and their order.
 * Mirrors the KIREIZ SPACE screen so both platforms are configured the same way.
 *
 * The customer side reads the same endpoint, so enabling an attribute here is what
 * makes it appear as a filter/accordion in the simulation tool.
 */

const notify = (title, type, message) =>
  toast.push(
    <Notification title={title} type={type}>
      {message}
    </Notification>,
  );

/*
 * Attributes that can be added here.
 *
 * Only the four whose choices the admin actually manages: Fabric, Parts and Color from
 * their own tabs under Product & Specification, and Size from the Size tab. Adding one of
 * these gives the admin the whole attribute — whether it appears, in what order, and what
 * a shopper can pick.
 *
 * Collar, Sleeves, Cap, Zipper, Cuff, Pocket, Pant and Apron are deliberately absent. The
 * storefront has working tools for them, but their choices are fixed artwork with no admin
 * screen behind them, so offering them here would mean adding an attribute and then having
 * nowhere to manage its options.
 *
 * Rows already saved under those names still show in the table below and keep working —
 * this list only governs what can be added.
 */
const ADDABLE_ATTRIBUTES = ["Fabric", "Parts", "Color", "Size"];

// "Colors" and "Color", "Fabrics" and "Fabric" are the same attribute. Existing rows
// were seeded with singular names, so compare on a normalised stem rather than the
// literal string.
const normalise = (name) =>
  (name || "").trim().toLowerCase().replace(/s$/, "");

/*
 * Which customer tool an attribute name drives.
 *
 * Mirrors ATTRIBUTE_TO_PANEL in the storefront's Uniform3DmoduleDegisn — the two must
 * stay in step, and this copy exists so the dropdown can hide an attribute whose tool is
 * already covered under a different name. Seeded rows use names like "Apron Type",
 * "Cap Type" and "Closure", which drive the same tools as "Apron", "Cap" and "Zipper";
 * matching on the name alone would offer both and leave the admin with two rows for one
 * tool.
 */
const ATTRIBUTE_TO_PANEL = [
  [["fabric", "material"], "fabric"],
  [["colour", "color"], "color"],
  [["part"], "parts"],
  [["size"], "size"],
  [["collar"], "collar"],
  [["sleeve"], "sleeves"],
  [["cap"], "cap"],
  [["cuff"], "cuff"],
  [["pocket"], "pocket"],
  [["apron"], "aprons"],
  [["zip", "closure"], "zipper"],
  [["pant", "trouser", "bottom"], "pants"],
  [["top"], "top"],
  [["leg"], "legy"],
];

const panelKeyFor = (name) => {
  const n = (name || "").toLowerCase();
  const hit = ATTRIBUTE_TO_PANEL.find(([needles]) =>
    needles.some((x) => n.includes(x)),
  );
  return hit ? hit[1] : null;
};

const SimulationStructure = () => {
  const t = useTranslations("simulationAssets");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  // { [categoryName]: [{attribute, enabled, order}, ...] }
  const [structures, setStructures] = useState({});
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [saved, setSaved] = useState("{}");
  const addRef = useRef(null);

  const load = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiGetSimulationStructure(accessToken);
      if (res?.status) {
        const data = res.data || {};
        setStructures(data);
        // Snapshot of what the server holds, so edits can be told apart from it.
        setSaved(JSON.stringify(data));
        setActive((prev) => prev ?? Object.keys(data)[0] ?? null);
      }
    } catch (error) {
      console.error("Failed to load simulation structure:", error);
      notify(t("errorTitle"), "danger", t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [accessToken, t]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = active ? structures[active] || [] : [];

  const dirty = JSON.stringify(structures) !== saved;

  // Only what this category does not already have — matched by name and by the tool the
  // name drives, so "Apron" is not offered when "Apron Type" is already listed.
  const takenNames = new Set(rows.map((r) => normalise(r.attribute)));
  const takenPanels = new Set(
    rows.map((r) => panelKeyFor(r.attribute)).filter(Boolean),
  );
  const available = ADDABLE_ATTRIBUTES.filter(
    (a) => !takenNames.has(normalise(a)) && !takenPanels.has(panelKeyFor(a)),
  );

  useEffect(() => {
    const onClickOutside = (e) => {
      if (addRef.current && !addRef.current.contains(e.target)) {
        setAddOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const addRow = (attribute) => {
    // Enabled on add — the admin picked it deliberately, so making them tick a second
    // box to make it count would be busywork. Order continues the existing list.
    const nextOrder = String(
      rows.reduce((max, r) => Math.max(max, Number(r.order) || 0), 0) + 1,
    );
    setStructures((prev) => ({
      ...prev,
      [active]: [
        ...(prev[active] || []),
        { attribute, enabled: true, order: nextOrder },
      ],
    }));
    setAddOpen(false);
  };

  const updateRow = (index, patch) => {
    setStructures((prev) => ({
      ...prev,
      [active]: prev[active].map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      ),
    }));
  };

  const removeRow = (index) => {
    setStructures((prev) => ({
      ...prev,
      [active]: prev[active].filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (saving || !active) return;

    try {
      setSaving(true);
      const res = await apiSaveSimulationStructure(accessToken, active, rows);
      if (res?.status) {
        // Now the server matches what is on screen, so the unsaved marker clears.
        setSaved(JSON.stringify(structures));
        notify("Success", "success", t("structureSaved"));
      } else {
        notify(t("errorTitle"), "danger", res?.message || t("structureSaveFailed"));
      }
    } catch (error) {
      console.error("Failed to save simulation structure:", error);
      notify(
        t("errorTitle"),
        "danger",
        error?.response?.data?.message || t("structureSaveFailed"),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="border border-[#E2E8F0] rounded-xl p-4 animate-pulse h-72" />
        <div className="lg:col-span-3 border border-[#E2E8F0] rounded-xl p-4 animate-pulse h-72" />
      </div>
    );
  }

  const categories = Object.keys(structures);

  if (categories.length === 0) {
    return (
      <div className="mt-5 border border-dashed border-[#CBD5E1] rounded-xl py-12 text-center">
        <p className="text-base font-medium text-[#1C2C56]">
          {t("noCategories")}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <h2 className="text-lg font-semibold text-[#1C2C56]">
        {t("structureTitle")}
      </h2>
      <p className="text-sm text-[#64748B] mt-1">{t("structureSubtitle")}</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mt-5">
        {/* Category list */}
        <div className="border border-[#E2E8F0] rounded-xl p-3 h-fit">
          <p className="text-sm font-medium text-[#1C2C56] px-2 pb-2 border-b border-[#E2E8F0]">
            {t("structureCategories")}
          </p>
          <ul className="mt-2 space-y-1">
            {categories.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => setActive(name)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition ${
                    active === name
                      ? "bg-[#E8EEF9] text-[#1C2C56] font-medium"
                      : "text-[#486284] hover:bg-[#F8FAFC]"
                  }`}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Attribute table */}
        <div className="lg:col-span-3 border border-[#E2E8F0] rounded-xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[#1C2C56]">
                {t("structureFor", { category: active })}
              </h3>
              <p className="text-sm text-[#64748B] mt-0.5">
                {t("structureForSubtitle", { category: active })}
              </p>
            </div>

            <div className="relative" ref={addRef}>
              <button
                type="button"
                onClick={() => setAddOpen((o) => !o)}
                disabled={available.length === 0}
                title={
                  available.length === 0 ? t("allAttributesAdded") : undefined
                }
                className="flex items-center gap-2 border border-[#CBD5E1] text-[#486284] px-3 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPlus size={14} />
                {t("addAttribute")}
                <FiChevronDown size={14} />
              </button>

              {addOpen && available.length > 0 && (
                <div className="absolute right-0 top-full mt-1 z-30 w-[190px] max-h-64 overflow-y-auto bg-white border border-[#E2E8F0] rounded-lg shadow-lg">
                  {available.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => addRow(name)}
                      className="w-full text-left px-3 py-2 text-sm text-[#1C2C56] hover:bg-[#F8FAFC]"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] text-[#64748B]">
                <tr>
                  <th className="text-left font-medium px-4 py-3">
                    {t("colAttribute")}
                  </th>
                  <th className="text-left font-medium px-4 py-3">
                    {t("colShowInSimulation")}
                  </th>
                  <th className="text-left font-medium px-4 py-3">
                    {t("colDisplayOrder")}
                  </th>
                  <th className="text-right font-medium px-4 py-3">
                    {t("colAction")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr className="border-t border-[#F1F5F9]">
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-sm text-[#94A3B8]"
                    >
                      {t("noAttributesYet")}
                    </td>
                  </tr>
                )}

                {rows.map((row, index) => (
                  <tr
                    key={`${row.attribute}-${index}`}
                    className="border-t border-[#F1F5F9]"
                  >
                    <td className="px-4 py-3 text-[#1C2C56]">
                      {row.attribute}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={!!row.enabled}
                        onChange={(e) =>
                          updateRow(index, { enabled: e.target.checked })
                        }
                        className="w-4 h-4 accent-[#1C4FA8]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        value={row.order}
                        onChange={(e) =>
                          updateRow(index, { order: e.target.value })
                        }
                        className="w-20 border border-[#E2E8F0] rounded-md px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-[#1C4FA8]/30"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="text-[#94A3B8] hover:text-red-500"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3 mt-6">
        {/* Add and delete only touch local state until this is saved. Without saying so,
            a deleted row reappearing after a refresh looks like the delete failed. */}
        {dirty && (
          <span className="text-xs text-amber-700 mr-auto">
            {t("unsavedChanges")}
          </span>
        )}

        <button
          type="button"
          onClick={load}
          disabled={saving}
          className="border border-[#CBD5E1] text-[#486284] px-4 py-2 rounded-lg text-sm disabled:opacity-50"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="bg-[#1C4FA8] text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : t("saveStructure")}
        </button>
      </div>
    </div>
  );
};

export default SimulationStructure;
