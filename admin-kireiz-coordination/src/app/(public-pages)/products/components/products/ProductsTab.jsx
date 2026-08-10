"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiSearch, FiPlus,
  FiX,
} from "react-icons/fi";
import Select from "react-select";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { apiGetProductList, apiDeleteProduct } from "@/services/ProductService";
import { apiFabricCategoryList } from "@/services/FabricService";
import AddEditProductModal from "./AddEditProductModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import Pagination from "@/components/ui/Pagination";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const ProductsTab = () => {
  const t = useTranslations("productSpecification.products");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [categoryOptions, setCategoryOptions] = useState([
    { value: "", label: t("allCategories") },
  ]);

  const [selectedCategory, setSelectedCategory] = useState({
    value: "",
    label: t("allCategories"),
  });

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "40px",
      borderRadius: "6px",
      borderColor: state.isFocused ? "#1C2C56" : "#E2E8F0",
      boxShadow: "none",
      "&:hover": { borderColor: "#1C2C56" },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#1C4FA8"
        : state.isFocused
          ? "#EEF2FF"
          : "white",
      color: state.isSelected ? "white" : "#1E293B",
      fontSize: "14px",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total_pages: 1,
    total_items: 0,
  });

  /* ---------- FETCH CATEGORIES ---------- */
  useEffect(() => {
    const fetchCategories = async () => {
      if (!accessToken) return;
      try {
        const response = await apiFabricCategoryList(accessToken, 1, 100);
        if (response?.status && response?.data) {
          const opts = [
            { value: "", label: t("allCategories") },
            ...response.data.map((c) => ({
              value: c.id,
              label: c.categoryName,
            })),
          ];
          setCategoryOptions(opts);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    fetchCategories();
  }, [accessToken, t]);

  /* ---------- FETCH PRODUCTS ---------- */
  const fetchProducts = useCallback(
    async (page = 1) => {
      if (!accessToken) return;

      try {
        setLoading(true);
        const catValue = selectedCategory?.value || "";

        const response = await apiGetProductList(accessToken, {
          page,
          pageSize,
          productType: "uniform",
          search: debouncedSearch,
          categoryId: catValue,
        });

        if (response?.status && response?.data) {
          setProducts(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          } else {
            setPagination((prev) => ({
              ...prev,
              total_items:
                response.count || response.total_items || response.data.length,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, debouncedSearch, selectedCategory, pageSize],
  );

  useEffect(() => {
    fetchProducts(currentPage);
  }, [fetchProducts, currentPage, pageSize]);

  /* ---------- DELETE ---------- */
  const handleDeleteConfirm = async () => {
    if (!productToDelete || !accessToken) return;

    try {
      setDeleteLoading(true);
      await apiDeleteProduct(accessToken, productToDelete.id);
      toast.push(
        <Notification title={t("successTitle")} type="success">
          {t("deleteSuccess")}
        </Notification>,
      );
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      fetchProducts(currentPage);
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ---------- HANDLERS ---------- */
  const handleAdd = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    fetchProducts(currentPage);
  };

  /* ---------- FILTER ---------- */
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (item) =>
        item.productName?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query),
    );
  }, [products, searchQuery]);

  /* ---------- HELPERS ---------- */
  const getImageUrl = (path) => {
    if (!path) return "/img/admin/products/product-1.png";
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path}`;
  };

  /* ---------- SKELETON ---------- */
  const CardSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="border border-[#E2E8F0] rounded-xl animate-pulse"
        >
          <div className="flex justify-center items-center p-3">
            <div className="w-32 h-32 rounded-full bg-gray-200" />
          </div>
          <div className="px-4 pb-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-7 bg-gray-200 rounded mt-3" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow md:p-6 p-3">
      <div className="flex justify-between items-start flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#1C2C56]">
            {t("title")}
          </h2>
          <p className="text-sm text-[#486284]">
            {t("totalCount", { count: pagination.total_items || products.length })}
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="bg-[#1C4FA8] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-[#163F86] transition-colors"
        >
          <FiPlus size={14} />
          {t("addNew")}
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="relative w-full md:w-72">
          <FiSearch
            className="absolute left-3 top-2.5 text-[#64748B]"
            size={16}
          />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-[#00345F] rounded-md pl-9 pr-3 py-2 text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1C2C56]"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        <Select
          options={categoryOptions}
          value={selectedCategory}
          onChange={setSelectedCategory}
          styles={selectStyles}
          menuPortalTarget={
            typeof document !== "undefined" ? document.body : null
          }
          menuPosition="fixed"
          className="w-48 text-sm"
        />

        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setSelectedCategory(categoryOptions[0]);
            setCurrentPage(1);
          }}
          className="border border-[#CBD5E1] px-4 py-2 rounded-md text-sm text-white bg-[#1C4FA8] hover:bg-[#163F86] transition-colors"
        >
          {t("reset")}
        </button>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 text-[#94A3B8]">
          {t("noData")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredProducts.map((item) => (
            <div
              key={item.id}
              className="border border-[#E2E8F0] rounded-xl bg-white hover:shadow-md transition flex flex-col"
            >
              <div className="flex justify-center items-center p-3">
                <div className="w-32 h-32 flex items-center justify-center">
                  <img
                    src={getImageUrl(item.ProductImage)}
                    alt={item.productName}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>

              <div className="px-4 pb-4 text-center flex flex-col flex-1">
                <h3 className="text-sm font-semibold text-[#1C2C56]">
                  {item.productName}
                </h3>

                <p className="text-xs text-[#486284] mt-1 line-clamp-2 mb-2">
                  {item.description}
                </p>

                <div className="flex gap-2 mt-auto mt-4">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-[#1C4FA8] text-white text-xs py-2 rounded-md"
                  >
                    {t("edit")}
                  </button>
                  <button
                    onClick={() => {
                      setProductToDelete(item);
                      setDeleteDialogOpen(true);
                    }}
                    className="flex-1 border border-red-200 text-red-500 text-xs py-2 rounded-md flex items-center justify-center gap-1 hover:bg-red-50 transition-colors"
                  >
                    <FiTrash2 size={12} />
                    {t("delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5">
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          total={pagination.total_items}
          onChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Modals */}
      <AddEditProductModal
        key={selectedProduct?.id ?? "new-product"}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={selectedProduct}
        onSaveSuccess={handleSaveSuccess}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={t("deleteDialog.title")}
        message={t("deleteDialog.message")}
        itemName={productToDelete?.productName}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ProductsTab;
