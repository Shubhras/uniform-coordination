"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { FiSearch, FiX, FiChevronDown, FiCheckCircle } from "react-icons/fi";
import { apiGetProductList } from "@/services/ProductService";
import { apiGetCategoryList } from "@/services/CategoryService";
import { apiGetFabricList } from "@/services/FabricService";

export default function InventoryItemsModal({ isOpen, onClose, onAdd }) {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const [inventoryData, setInventoryData] = useState([]);

  const [categoryList, setCategoryList] = useState([]);
  const [fabricList, setFabricList] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [category, setCategory] = useState({
    value: "all",
    label: "All Categories",
  });

  const [material, setMaterial] = useState({
    value: "all",
    label: "All Fabrics",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);

    try {
      let params = "";

      if (category.value !== "all") {
        params += `&category_id=${category.value}`;
      }

      if (material.value !== "all") {
        params += `&fabric_id=${material.value}`;
      }

      if (debouncedSearch.trim()) {
        params += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
      }

      const res = await apiGetProductList(accessToken, 1, 100, "table", params);

      if (res?.status) {
        setInventoryData(res.data || []);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await apiGetCategoryList(accessToken, 1, 100);

      if (res?.status) {
        setCategoryList(res.data);
      }
    };

    if (accessToken) fetchCategories();
  }, [accessToken]);

  useEffect(() => {
    const fetchFabricList = async () => {
      const res = await apiGetFabricList(accessToken);

      if (res?.status) {
        setFabricList(res.data);
      }
    };

    if (accessToken) fetchFabricList();
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetchProducts();
    }
  }, [accessToken, category, material, debouncedSearch]);

  const categoryOptions = [
    {
      value: "all",
      label: "All Categories",
    },
    ...categoryList.map((item) => ({
      value: item.id,
      label: item.categoryName,
    })),
  ];

  const materialOptions = [
    {
      value: "all",
      label: "All Fabrics",
    },
    ...fabricList.map((item) => ({
      value: item.id,
      label: item.fabricName,
    })),
  ];

  if (!isOpen) return null;

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "42px",
      borderRadius: "9999px",
      borderColor: "#EFE5DD",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#C08457",
      },
    }),

    singleValue: (base) => ({
      ...base,
      color: "#A85A32",
    }),

    placeholder: (base) => ({
      ...base,
      color: "#A85A32",
    }),

    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const handleSelect = (item) => {
    setSelected((prev) => {
      const exists = prev.some((i) => i.id === item.id);

      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      }

      return [...prev, item];
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}

        <div className="flex justify-between items-start px-6 py-5 border-b">
          <div>
            <h2 className="text-lg font-semibold text-[#1A1410]">
              Add Inventory Items
            </h2>

            <p className="text-sm text-[#8D8178] mt-1">
              Table Setup · Select items to include
            </p>
          </div>

          <button onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}

        <div className="p-5">
          {/* Search */}

          <div className="relative mb-4">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />

            <input
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 border rounded-full pl-10 pr-4 text-sm outline-none focus:border-[#A0522D]"
            />
          </div>

          {/* Filters */}

          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <Select
                value={category}
                onChange={setCategory}
                options={categoryOptions}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>

            <div className="flex-1">
              <Select
                value={material}
                onChange={setMaterial}
                options={materialOptions}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>
          </div>

          {/* Count */}

          <div className="flex justify-between text-[13px] text-[#8A8078] mb-3">
            <span>{inventoryData.length} results</span>

            {/* <span>{selected ? "1 selected" : "0 selected"}</span> */}
            <span>{selected.length} selected</span>
          </div>

          {/* List */}

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {inventoryData.map((item) => {
              // const active = selected?.id === item.id;
              const active = selected.some((i) => i.id === item.id);

              return (
                <div
                  key={item.id}
                  // onClick={() => setSelected(item)}
                  onClick={() => handleSelect(item)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 cursor-pointer transition ${
                    active
                      ? "border-[#C56E42] bg-[#FFF5EF]"
                      : "border-[#EFE7E1] hover:border-[#D8C1B3]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        active
                          ? "border-[#A0522D] bg-[#A0522D]"
                          : "border-gray-300"
                      }`}
                    >
                      {active && (
                        <FiCheckCircle size={12} className="text-white" />
                      )}
                    </div>

                    <img
                      src={item.ProductImage}
                      className="w-12 h-12 rounded-full object-cover"
                      alt=""
                    />

                    <div>
                      <h4 className="font-medium">{item.productName}</h4>

                      <p className="text-xs text-gray-500">
                        {item.category?.categoryName} • {item.fabric}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}

        <div className="border-t px-5 py-4 flex gap-4 bg-white">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-[#E6DDD6] font-medium"
          >
            Cancel
          </button>

          <button
            // onClick={() => {
            //   if (!selected) return;

            //   onAdd(selected);
            // }}
            onClick={() => {
              if (!selected.length) return;

              onAdd(selected);
            }}
            className="flex-1 h-11 rounded-xl bg-[#A0522D] text-white font-medium hover:bg-[#8D4524]"
          >
            {/* Add Selected ({selected ? 1 : 0}) */}
            Add Selected ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}
