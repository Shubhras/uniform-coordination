"use client";

import { useState, useEffect, useCallback } from "react";
import { FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetProductList, apiDeleteProduct } from "@/services/ProductService";
import AddEditProductModal from "./AddEditProductModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const ProductsTab = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total_pages: 1,
    total_items: 0,
  });

  /* ---------- FETCH ---------- */
  const fetchProducts = useCallback(async (page = 1) => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const response = await apiGetProductList(accessToken, page);

      if (response?.status && response?.data) {
        setProducts(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        } else {
          setPagination((prev) => ({
            ...prev,
            total_items: response.count || response.total_items || response.data.length,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [fetchProducts, currentPage]);

  /* ---------- DELETE ---------- */
  const handleDeleteConfirm = async () => {
    if (!productToDelete || !accessToken) return;

    try {
      setDeleteLoading(true);
      await apiDeleteProduct(accessToken, productToDelete.id);
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

  /* ---------- IMAGE URL ---------- */
  const getImageUrl = (path) => {
    if (!path) return "/img/kireiz-form/features/uniform-card-img-one.png";
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path}`;
  };

  /* ---------- PAGINATION ---------- */
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.total_pages) {
      setCurrentPage(page);
    }
  };

  /* ---------- SKELETON ---------- */
  const CardSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="border border-[#E2E8F0] rounded-xl animate-pulse">
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
            Product Creation
          </h2>
          <p className="text-sm text-[#486284]">
            {pagination.total_items || products.length} products available
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="bg-[#1C2C56] text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + Add Product
        </button>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-[#94A3B8]">No products found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {products.map((item) => (
            <div
              key={item.id}
              className="border border-[#E2E8F0] rounded-xl bg-white hover:shadow-md transition"
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

              <div className="px-4 pb-4 text-center">
                <h3 className="text-sm font-semibold text-[#1C2C56]">
                  {item.productName}
                </h3>

                <p className="text-xs text-[#486284] mt-1 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-[#1C2C56] text-white text-xs py-2 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setProductToDelete(item);
                      setDeleteDialogOpen(true);
                    }}
                    className="flex-1 border border-red-200 text-red-500 text-xs py-2 rounded-md flex items-center justify-center gap-1 hover:bg-red-50 transition-colors"
                  >
                    <FiTrash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <p className="text-sm text-[#64748B]">
            Page {pagination.page} of {pagination.total_pages} ({pagination.total_items} items)
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-[#E2E8F0] disabled:opacity-30 hover:bg-[#F1F5F9] transition-colors"
            >
              <FiChevronLeft size={16} />
            </button>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === pagination.total_pages}
              className="p-2 rounded-md border border-[#E2E8F0] disabled:opacity-30 hover:bg-[#F1F5F9] transition-colors"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddEditProductModal
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
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        itemName={productToDelete?.productName}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ProductsTab;
