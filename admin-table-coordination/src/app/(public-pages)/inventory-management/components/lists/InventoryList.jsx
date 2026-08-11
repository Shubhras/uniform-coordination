"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import { useRouter } from "next/navigation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import Spinner from "@/components/ui/Spinner";
import Pagination from "@/components/ui/Pagination";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiX,
  FiRotateCcw,
} from "react-icons/fi";
import NewDeleteModal from "@/components/shared/NewDeleteModal";
import { apiGetProductList, apiDeleteProduct } from "@/services/ProductService";
import { apiGetFabricList } from "@/services/FabricService";
import { apiGetCategoryList } from "@/services/CategoryService";
import { useTranslations } from "next-intl";

const InventoryList = () => {
  const router = useRouter();
  const t = useTranslations("inventoryManagement.inventoryLists");
  const ts = useTranslations("successTitle");

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [fabricList, setFabricList] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [category, setCategory] = useState({
    value: "all",
    label: "All Categories",
  });

  const [material, setMaterial] = useState({
    value: "all",
    label: "All Fabrics",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fabricToDelete, setFabricToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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
        setTotalItems(response.count || 0); // API count
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

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, category, material]);

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categoryList.map((item) => ({
      value: item.id,
      label: item.categoryName,
    })),
  ];

  const materialOptions = [
    { value: "all", label: "All Fabrics" },
    ...fabricList.map((item) => ({
      value: item.id,
      label: item.fabricName,
    })),
  ];
  const [search, setSearch] = useState("");

  const handleDeleteClick = (item) => {
    setFabricToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fabricToDelete) return;

    setDeleteLoading(true);

    try {
      const res = await apiDeleteProduct(accessToken, fabricToDelete.id);
      toast.push(
        <Notification title="Success" type="success">
          {res.message}
        </Notification>,
      );

      if (res?.status) {
        await fetchProducts();

        setDeleteDialogOpen(false);
        setFabricToDelete(null);
      }
    } catch (err) {
      console.error("Delete Error:", err);
    } finally {
      setDeleteLoading(false);
    }
  };
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

  const handleReset = () => {
    setSearchQuery("");
    setDebouncedSearch("");

    setCategory({
      value: "all",
      label: "All Categories",
    });

    setMaterial({
      value: "all",
      label: "All Fabrics",
    });

    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchFabricList = async () => {
      try {
        const response = await apiGetFabricList(accessToken);

        if (response?.status && response?.data) {
          setFabricList(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (accessToken) {
      fetchFabricList();
    }
  }, [accessToken]);

  return (
    <>
      <div className="space-y-5">
        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ">
          <div className="relative w-full lg:max-w-xl">
            <FiSearch className="absolute left-4  top-1/2 -translate-y-1/2 text-[#C08457] text-sm" />

            <input
              type="text"
              placeholder= {t("searchProducts")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            {/* <div className="relative w-full lg:max-w-xl">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A85A32B2]"
              size={16}
            />

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 rounded-lg border border-[#EFE5DD] pl-10 pr-4 text-sm outline-none focus:border-[#A0522D]"
            />
          </div> */}

            {/* Filters */}
            <div className="flex gap-3">
              <div className="w-52">
                <Select
                  instanceId="status-select"
                  value={category}
                  onChange={setCategory}
                  options={categoryOptions}
                  styles={selectStyles}
                  isSearchable={false}
                />
              </div>

              <div className="w-52">
                <Select
                    instanceId="category-select"
                  value={material}
                  onChange={setMaterial}
                  options={materialOptions}
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F1F5F9] text-[#486284]">
              <tr className="bg-[#F7F2EE] text-[#6B7280] text-sm">
                <th className="text-left  px-4 py-3 font-normal">
                  {t("productName")}
                </th>
                <th className="text-left  px-4 py-3 font-normal"> {t("category")}</th>
                <th className="text-left  px-4 py-3 font-normal"> {t("fabric")}</th>
                <th className="text-left  px-4 py-3 font-normal"> {t("total")}</th>
                <th className="text-left  px-4 py-3 font-normal">{t("available")}</th>
                <th className="text-left  px-4 py-3 font-normal">{t("onRent")}</th>
                <th className="text-left  px-4 py-3 font-normal ">{t("cleaning")}</th>
                <th className="text-left  px-4 py-3 font-normal">{t("inspect")}</th>
                <th className="text-left  px-4 py-3 font-normal text-center">
                  {t("actions")}
                </th>
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
                inventoryData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-[#FBF7F3]"}`}
                  >
                    <td className="px-4 py-3">{item.productName}</td>

                    <td className="px-4 py-3">{item.category?.categoryName}</td>

                    <td className="px-4 py-3">{item.fabric}</td>

                    <td className="px-4 py-3">{item.total_quantity}</td>

                    <td className="px-4 py-3">{item.available_quantity}</td>

                    <td className="px-4 py-3">{item.on_rent_quantity ?? 0}</td>

                    <td className="px-4 py-3">{item.cleaning_quantity ?? 0}</td>

                    <td className="px-4 py-3">{item.inspect_quantity ?? 0}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0">
                        <button
                          onClick={() =>
                            router.push(
                              `/inventory-management/inventory-list/view?id=${item.id}`,
                            )
                          }
                          // className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-[#F1E8E2] transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"
                          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"
                        >
                          <FiEye size={17} />
                        </button>

                        <button
                          onClick={() =>
                            router.push(
                              `/inventory-management/add?mode=edit&id=${item.id}`,
                            )
                          }
                          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"

                          // className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-[#F1E8E2] transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"
                        >
                          <FiEdit2 size={17} />
                        </button>

                        <button
                          onClick={() => handleDeleteClick(item)}
                          // className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-[#F1E8E2] transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"
                          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"
                        >
                          <FiTrash2 size={17} />
                        </button>
                      </div>
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

      <NewDeleteModal
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setFabricToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={t("deleteProduct")}
        message={t("deleteContent")}
        itemName={fabricToDelete?.productName}
        loading={deleteLoading}
      />
    </>
  );
};

export default InventoryList;
