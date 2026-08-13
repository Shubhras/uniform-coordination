"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiSearch,
  FiX,
  FiRotateCcw,
} from "react-icons/fi";
import { apiGetProductList, apiDeleteProduct } from "@/services/ProductService";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import Spinner from "@/components/ui/Spinner";
import Pagination from "@/components/ui/Pagination";
import { apiGetCategoryList } from "@/services/CategoryService";
import { apiToggleProductVisibility } from "@/services/SimulationService";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { useTranslations } from "next-intl";

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "40px",
    borderColor: "#EFE5DD",
    boxShadow: "none",
    borderRadius: "8px",
    "&:hover": {
      borderColor: "#C08457",
    },
  }),

  singleValue: (base) => ({
    ...base,
    color: "#A85A32B2",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#A85A32B2",
  }),

  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#A0522D"
      : state.isFocused
        ? "#F8F2ED"
        : "#fff",
    color: state.isSelected ? "#fff" : "#444",
  }),
};

const ProductVisibility = () => {
  const t = useTranslations("simulationAssets.productVisibility");
  const ts = useTranslations("successTitle");
  const te = useTranslations("errorTitle");
  const router = useRouter();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryList, setCategoryList] = useState([]);

  const handleVisibilityToggle = async (productId, currentShow) => {
    if (!accessToken) return;
    try {
      // Optimistic update
      setInventoryData((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, show: !currentShow } : p))
      );

      const res = await apiToggleProductVisibility(accessToken, productId, !currentShow);
      if (res?.status) {
        toast.push(
          <Notification title={ts("success")} type="success">
            {res.message || t("updated")}
          </Notification>
        );
      } else {
        // Revert optimistic update
        setInventoryData((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, show: currentShow } : p))
        );
        toast.push(
          <Notification title={te("error")} type="danger">
            {res?.message || t("updateFailed")}
          </Notification>
        );
      }
    } catch (err) {
      console.error("Error toggling product visibility", err);
      // Revert optimistic update
      setInventoryData((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, show: currentShow } : p))
      );
      toast.push(
        <Notification title={te("error")} type="danger">
          {t("updateError")}
        </Notification>
      );
    }
  };

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [material] = useState({ value: "all", label: t("all") });

  const categoryOptions = [
    { value: "all", label: t("allCategories") },
    ...categoryList.map((item) => ({
      value: item.id,
      label: item.categoryName,
    })),
  ];
  const [category, setCategory] = useState(categoryOptions[0]);

  const fetchProducts = async () => {
    setLoading(true);

    try {
      let params = "";

      if (category?.value !== "all") {
        params += `&category_id=${category.value}`;
      }

      if (material?.value !== "all") {
        params += `&fabric_id=${material.value}`;
      }

      if (debouncedSearch.trim()) {
        params += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
      }

      const response = await apiGetProductList(
        accessToken,
        currentPage,
        pageSize,
        "table",
        params,
      );

      if (response?.status) {
        setInventoryData(response.data || []);
        setTotalItems(response.count || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (accessToken) {
      fetchProducts();
    }
  }, [accessToken, category, material, debouncedSearch, currentPage]);

  const handleReset = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setCategory(categoryOptions[0]);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiGetCategoryList(accessToken, 1, 100);

        if (response?.status && response?.data) {
          setCategoryList(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (accessToken) {
      fetchCategories();
    }
  }, [accessToken]);

  return (
    <>
      <div className="mt-5">
        <h2 className="text-[24px] font-semibold text-[#2A1A0E]">
          {t("title")}
        </h2>
        <p className="mt-1 text-[16px] text-[#8B7355]">
          {t("subtitle")}
        </p>

        <div className="mt-5 mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4  top-1/2 -translate-y-1/2 text-[#C08457] text-sm" />

            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full h-10 rounded-lg border border-[#EFE5DD] text-[#C08457] pl-10 pr-4  text-sm outline-none focus:border-[#C08457]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <FiX className="text-gray-500" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-52">
              <Select
                value={category}
                onChange={setCategory}
                options={categoryOptions}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="flex h-10 items-center gap-2 rounded-lg border border-[#EFE5DD] bg-white px-4 text-sm font-medium text-[#C08457] transition hover:bg-[#FCF7F3]"
            >
              <FiRotateCcw size={14} />
              {t("reset")}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F1F5F9] text-[#486284]">
              <tr className="bg-[#F7F2EE] text-[#6B7280] text-sm">
                <th className="text-left  px-4 py-3 font-normal">
                  {t("productName")}
                </th>
                <th className="text-left  px-4 py-3 font-normal">
                  {t("catFabric")}
                </th>
                <th className="text-left  px-4 py-3 font-normal">{t("style")}</th>
                <th className="text-left  px-4 py-3 font-normal">{t("color")}</th>
                <th className="text-left  px-4 py-3 font-normal">
                  {t("showIn")}
                </th>
                <th className="text-left  px-4 py-3 font-normal">{t("action")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16">
                    <div className="flex justify-center items-center">
                      <Spinner size={40} customColorClass="text-[#A0522D]" />
                    </div>
                  </td>
                </tr>
              ) : inventoryData.length > 0 ? (
                inventoryData.map((product, index) => (
                  <tr
                    key={product.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-[#FBF7F3]"}`}
                  >
                    <td className="px-4 py-3 text-[#2C1A0E] font-semibold">
                      {product.productName}
                    </td>
                    <td className="px-4 py-3 text-[#2C1A0E] font-semibold">
                      {product.category?.categoryName}
                    </td>
                    <td className="px-4 py-3 text-[#2C1A0E] font-semibold">
                      {product.style}
                    </td>
                    <td className="px-4 py-3 text-[#2C1A0E] font-semibold">
                      {product.color_details?.name}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={product.show}
                        onChange={() => handleVisibilityToggle(product.id, product.show)}
                        className="h-4 w-4 rounded border-[#DFC8B7] text-[#B56735] accent-[#B56735] cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-2 text-[#7D6C63]">
                      <button
                        type="button"
                        className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"
                        onClick={() =>
                          router.push(
                            `/inventory-management/inventory-list/view?id=${product.id}`,
                          )
                        }
                      >
                        <FiEye size={17} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-500">
                    {t("noProducts")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div
        className="flex justify-end mt-3"
        style={{ marginRight: "6px", marginLeft: "6px" }}
      >
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          total={totalItems}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>
    </>
  );
};

export default ProductVisibility;
