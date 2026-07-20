"use client";

import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";

const categories = [
  "Tablecloths",
  "Chair Covers",
  "Napkins",
  "Centerpieces",
  "Tableware",
  "Additional Decor",
];

const structureMap = {
  Tablecloths: [
    { attribute: "Fabric", enabled: true, order: "1" },
    { attribute: "Style", enabled: true, order: "2" },
    { attribute: "Color", enabled: false, order: "3" },
    { attribute: "Size", enabled: false, order: "4" },
    { attribute: "Pattern", enabled: false, order: "5" },
  ],
  "Chair Covers": [
    { attribute: "Fabric", enabled: true, order: "1" },
    { attribute: "Fit Type", enabled: true, order: "2" },
    { attribute: "Color", enabled: false, order: "3" },
    { attribute: "Closure", enabled: false, order: "4" },
    { attribute: "Stretch", enabled: false, order: "5" },
  ],
  Napkins: [
    { attribute: "Fabric", enabled: true, order: "1" },
    { attribute: "Fold Style", enabled: true, order: "2" },
    { attribute: "Color", enabled: false, order: "3" },
    { attribute: "Size", enabled: false, order: "4" },
    { attribute: "Trim", enabled: false, order: "5" },
  ],
  Centerpieces: [
    { attribute: "Style", enabled: true, order: "1" },
    { attribute: "Height", enabled: true, order: "2" },
    { attribute: "Color", enabled: false, order: "3" },
    { attribute: "Flowers", enabled: false, order: "4" },
    { attribute: "Base Type", enabled: false, order: "5" },
  ],
  Tableware: [
    { attribute: "Material", enabled: true, order: "1" },
    { attribute: "Finish", enabled: true, order: "2" },
    { attribute: "Color", enabled: false, order: "3" },
    { attribute: "Collection", enabled: false, order: "4" },
    { attribute: "Pieces", enabled: false, order: "5" },
  ],
  "Additional Decor": [
    { attribute: "Style", enabled: true, order: "1" },
    { attribute: "Color", enabled: true, order: "2" },
    { attribute: "Size", enabled: false, order: "3" },
    { attribute: "Material", enabled: false, order: "4" },
    { attribute: "Placement", enabled: false, order: "5" },
  ],
};

const SimulationStructure = () => {
  const [activeCategory, setActiveCategory] = useState("Tablecloths");

  return (
    <div className="mt-5">
      <h2 className="text-[16px] font-semibold text-[#2A211D]">
        Simulation Structure
      </h2>
      <p className="mt-1 text-[12px] text-[#B29D8C]">
        Define the categories and attributes that appear in the simulation tool.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[128px_minmax(0,1fr)]">
        <div className="rounded-[10px] border border-[#F0E4DB] bg-white p-4">
          <p className="text-[12px] font-medium text-[#3F332C]">
            Simulation Categories
          </p>

          <div className="mt-4 space-y-1">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`w-full rounded-[6px] px-3 py-2 text-left text-[11px] ${
                  activeCategory === category
                    ? "bg-[#FDE9DE] text-[#B56735]"
                    : "text-[#4E423B]"
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
                {structureMap[activeCategory].map((item) => (
                  <tr key={item.attribute} className="border-t border-[#F8EEE8] text-[11px] text-[#4E423B]">
                    <td className="px-4 py-3">{item.attribute}</td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        readOnly
                        className="h-4 w-4 rounded border-[#DFC8B7] text-[#B56735] accent-[#B56735]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex h-7 w-9 items-center justify-center rounded-[4px] border border-[#E9DCD3] text-[11px] text-[#7F736B]">
                        {item.order}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#F05B53]">
                      <FiTrash2 size={14} />
                    </td>
                  </tr>
                ))}
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
          className="rounded-full border border-[#EAD9CD] px-5 py-2 text-[12px] text-[#7F736B]"
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded-full bg-[#B56735] px-5 py-2 text-[12px] font-medium text-white"
        >
          Save Structure
        </button>
      </div>
    </div>
  );
};

export default SimulationStructure;
