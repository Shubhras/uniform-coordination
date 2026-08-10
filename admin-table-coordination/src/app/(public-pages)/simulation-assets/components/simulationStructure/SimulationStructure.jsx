"use client";

import { useState, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import Spinner from "@/components/ui/Spinner";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiGetSimulationStructure,
  apiSaveSimulationStructure,
} from "@/services/SimulationService";
import { apiGetCategoryList } from "@/services/CategoryService";

const DEFAULT_CATEGORIES = [
  "Tablecloths",
  "Chair Covers",
  "Napkins",
  "Centerpieces",
  "Tableware",
  "Additional Decor",
];

const SimulationStructure = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Tablecloths");
  const [structures, setStructures] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      if (!accessToken) return;
      try {
        const res = await apiGetCategoryList(accessToken, 1, 100);
        if (res?.status && res?.data && res.data.length > 0) {
          const names = res.data.map((cat) => cat.categoryName);
          setCategories(names);
          setActiveCategory(names[0]);
        } else {
          setCategories(DEFAULT_CATEGORIES);
          setActiveCategory(DEFAULT_CATEGORIES[0]);
        }
      } catch (err) {
        console.error("Error loading categories", err);
        setCategories(DEFAULT_CATEGORIES);
        setActiveCategory(DEFAULT_CATEGORIES[0]);
      }
    };
    loadCategories();
  }, [accessToken]);

  const fetchStructure = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const res = await apiGetSimulationStructure(accessToken);
      if (res?.status && res?.data) {
        setStructures(res.data);
      }
    } catch (err) {
      console.error("Error fetching structures", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructure();
  }, [accessToken]);

  const handleCheckboxToggle = (attributeName) => {
    setStructures((prev) => {
      const activeList = prev[activeCategory] || [];
      const updatedList = activeList.map((item) => {
        if (item.attribute === attributeName) {
          return { ...item, enabled: !item.enabled };
        }
        return item;
      });
      return { ...prev, [activeCategory]: updatedList };
    });
  };

  const handleOrderChange = (attributeName, val) => {
    setStructures((prev) => {
      const activeList = prev[activeCategory] || [];
      const updatedList = activeList.map((item) => {
        if (item.attribute === attributeName) {
          return { ...item, order: val };
        }
        return item;
      });
      return { ...prev, [activeCategory]: updatedList };
    });
  };

  const handleDeleteAttribute = (attributeName) => {
    setStructures((prev) => {
      const activeList = prev[activeCategory] || [];
      const updatedList = activeList.filter((item) => item.attribute !== attributeName);
      return { ...prev, [activeCategory]: updatedList };
    });
  };

  const handleCancel = () => {
    fetchStructure();
    toast.push(
      <Notification title="Cancelled" type="info">
        Changes reverted to last saved state.
      </Notification>
    );
  };

  const handleSave = async () => {
    if (!accessToken) return;
    try {
      setSaving(true);
      const attributes = structures[activeCategory] || [];
      const res = await apiSaveSimulationStructure(accessToken, activeCategory, attributes);
      if (res?.status) {
        toast.push(
          <Notification title="Success" type="success">
            {res.message || `Simulation structure for ${activeCategory} saved successfully.`}
          </Notification>
        );
      } else {
        toast.push(
          <Notification title="Error" type="danger">
            {res?.message || "Failed to save simulation structure."}
          </Notification>
        );
      }
    } catch (err) {
      console.error("Error saving structure", err);
      toast.push(
        <Notification title="Error" type="danger">
          An error occurred while saving structure.
        </Notification>
      );
    } finally {
      setSaving(false);
    }
  };

  const activeStructure = structures[activeCategory] || [];

  return (
    <div className="mt-5">
      <h2 className="text-[16px] font-semibold text-[#2A211D]">
        Simulation Structure
      </h2>
      <p className="mt-1 text-[12px] text-[#B29D8C]">
        Define the categories and attributes that appear in the simulation tool.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)]">
        <div className="rounded-[10px] border border-[#F0E4DB] bg-white p-4">
          <p className="text-[12px] font-medium text-[#3F332C] border-b pb-2">
            Simulation Categories
          </p>

          <div className="mt-4 space-y-1">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`w-full rounded-[6px] px-3 py-2 text-left text-[11px] font-medium transition ${
                  activeCategory === category
                    ? "bg-[#FDE9DE] text-[#B56735]"
                    : "text-[#4E423B] hover:bg-[#FAF6F3]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[10px] border border-[#F0E4DB] bg-white p-4">
          <h3 className="text-[13px] font-semibold text-[#2F241F]">
            {activeCategory} Structure
          </h3>
          <p className="mt-1 text-[11px] text-[#B29D8C]">
            Select and arrange the attributes that will be shown for {activeCategory}.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[520px] w-full">
              <thead>
                <tr className="bg-[#FBF5F0] text-left text-[11px] font-medium text-[#8F7B6E]">
                  <th className="px-4 py-3">Attribute</th>
                  <th className="px-4 py-3">Show in Simulation</th>
                  <th className="px-4 py-3">Display Order</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center">
                      <div className="flex justify-center">
                        <Spinner size={30} customColorClass="text-[#B56735]" />
                      </div>
                    </td>
                  </tr>
                ) : activeStructure.length > 0 ? (
                  activeStructure.map((item) => (
                    <tr
                      key={item.attribute}
                      className="border-t border-[#F8EEE8] text-[11px] text-[#4E423B]"
                    >
                      <td className="px-4 py-3 font-medium">{item.attribute}</td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => handleCheckboxToggle(item.attribute)}
                          className="h-4 w-4 rounded border-[#DFC8B7] text-[#B56735] accent-[#B56735] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.order}
                          onChange={(e) => handleOrderChange(item.attribute, e.target.value)}
                          className="flex h-7 w-12 items-center justify-center rounded-[4px] border border-[#E9DCD3] text-[11px] text-[#7F736B] text-center outline-none focus:border-[#B56735]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleDeleteAttribute(item.attribute)}
                          className="text-[#F05B53] hover:text-[#d33a32] p-1 rounded hover:bg-red-50 transition"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-500">
                      No attributes configured for this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-[8px] border border-[#F3DDD1] bg-[#FFF6F1] px-3 py-2 text-[10px] text-[#D28B61]">
            Note: Attributes that are enabled here will appear as accordions/filters in the customer simulation tool
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving || loading}
          className="rounded-full border border-[#EAD9CD] px-5 py-2 text-[12px] text-[#7F736B] hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="rounded-full bg-[#B56735] px-5 py-2 text-[12px] font-medium text-white hover:bg-[#a25628] transition disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? "Saving..." : "Save Structure"}
        </button>
      </div>
    </div>
  );
};

export default SimulationStructure;
