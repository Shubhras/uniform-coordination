"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiSearch,
} from "react-icons/fi";

const products = [
  { id: "grand-tablecloth-1", name: "Grand Tablecloth", categoryFabric: "Linen", style: "Pleated", color: "White", show: true, category: "Tablecloth" },
  { id: "ivory-cotton-classic", name: "Ivory Cotton Classic", categoryFabric: "Linen", style: "Pleated", color: "White", show: true, category: "Tablecloth" },
  { id: "grand-tablecloth-2", name: "Grand Tablecloth", categoryFabric: "Cotton", style: "Pleated", color: "White", show: true, category: "Tablecloth" },
  { id: "grand-tablecloth-3", name: "Grand Tablecloth", categoryFabric: "Linen", style: "Pleated", color: "White", show: false, category: "Tablecloth" },
  { id: "gold-satin-royale", name: "Gold Satin Royale", categoryFabric: "Velvet", style: "Pleated", color: "White", show: true, category: "Tablecloth" },
  { id: "grand-tablecloth-4", name: "Grand Tablecloth", categoryFabric: "Linen", style: "Pleated", color: "White", show: false, category: "Tablecloth" },
  { id: "grand-tablecloth-5", name: "Grand Tablecloth", categoryFabric: "Linen", style: "Pleated", color: "White", show: true, category: "Tablecloth" },
  { id: "grand-tablecloth-6", name: "Grand Tablecloth", categoryFabric: "Linen", style: "Pleated", color: "White", show: true, category: "Tablecloth" },
  { id: "grand-tablecloth-7", name: "Grand Tablecloth", categoryFabric: "Linen", style: "Pleated", color: "White", show: true, category: "Tablecloth" },
];

const categoryOptions = [
  { value: "tablecloth", label: "Tablecloth" },
  { value: "napkin", label: "Napkin" },
];

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "34px",
    borderColor: "#F2E5DD",
    borderRadius: "6px",
    boxShadow: "none",
    fontSize: "11px",
    "&:hover": { borderColor: "#E2CFC2" },
  }),
  valueContainer: (base) => ({ ...base, paddingLeft: "8px", paddingRight: "8px" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, color: "#B7774D", padding: "0 8px 0 0" }),
  menu: (base) => ({ ...base, zIndex: 30 }),
  option: (base, state) => ({
    ...base,
    fontSize: "11px",
    backgroundColor: state.isSelected ? "#B56735" : state.isFocused ? "#FCF4EF" : "#FFFFFF",
    color: state.isSelected ? "#FFFFFF" : "#6F625B",
  }),
};

const ProductVisibility = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState(categoryOptions[0]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query || product.name.toLowerCase().includes(query);
      const matchesCategory =
        category.value === "tablecloth"
          ? product.category === "Tablecloth"
          : product.category === "Napkin";

      return matchesSearch && matchesCategory;
    });
  }, [category, searchQuery]);

  return (
    <div className="mt-5">
      <h2 className="text-[16px] font-semibold text-[#2A211D]">
        Product Visibility
      </h2>
      <p className="mt-1 text-[12px] text-[#B29D8C]">
        Choose which inventory items will be available in the simulation
      </p>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D1A48A]" size={13} />
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-[34px] w-full rounded-md border border-[#F3E7DE] bg-white pl-8 pr-3 text-[11px] text-[#6F625B] outline-none placeholder:text-[#C28E73] focus:border-[#D7B7A3]"
          />
        </div>

        <div className="w-full lg:w-[120px]">
          <Select
            instanceId="simulation-assets-category-filter"
            inputId="simulation-assets-category-filter"
            value={category}
            onChange={(selectedOption) => setCategory(selectedOption ?? categoryOptions[0])}
            options={categoryOptions}
            isSearchable={false}
            styles={selectStyles}
          />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-md border border-[#F4E9E1]">
        <table className="min-w-[980px] w-full">
          <thead>
            <tr className="bg-[#FBF5F0] text-left text-[11px] font-medium text-[#8F7B6E]">
              <th className="px-4 py-3">Product Name</th>
              <th className="px-4 py-3">Category Fabric</th>
              <th className="px-4 py-3">Style</th>
              <th className="px-4 py-3">Color</th>
              <th className="px-4 py-3">Show in Simulation</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="border-t border-[#F8EEE8] bg-white text-[11px] text-[#5F534C]"
              >
                <td className="px-4 py-3 font-semibold text-[#4A3D36]">{product.name}</td>
                <td className="px-4 py-3">{product.categoryFabric}</td>
                <td className="px-4 py-3 font-semibold text-[#4A3D36]">{product.style}</td>
                <td className="px-4 py-3 font-semibold text-[#4A3D36]">{product.color}</td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={product.show}
                    readOnly
                    className="h-4 w-4 rounded border-[#DFC8B7] text-[#B56735] accent-[#B56735]"
                  />
                </td>
                <td className="px-4 py-3 text-[#7D6C63]">
                  <button
                    type="button"
                    onClick={() => router.push(`/simulation-assets/${product.id}`)}
                  >
                    <FiEye size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-col gap-3 text-[11px] text-[#9A8C82] sm:flex-row sm:items-center sm:justify-between">
        <p>Showing 1-10</p>

        <div className="flex items-center gap-2">
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded border border-[#E9DDD4] text-[#C9B2A3]">
            <FiChevronLeft size={14} />
          </button>
          <button type="button" className="flex h-8 min-w-[30px] items-center justify-center rounded bg-[#D88957] px-2 text-white">
            1
          </button>
          <button type="button" className="text-[#8C7C73]">2</button>
          <button type="button" className="text-[#8C7C73]">3</button>
          <span className="text-[#8C7C73]">...</span>
          <button type="button" className="text-[#8C7C73]">10</button>
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded border border-[#E9DDD4] text-[#8C7C73]">
            <FiChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductVisibility;
