"use client";

import { useState, useEffect, useCallback } from "react";
import { FiSearch, FiPlus, FiX } from "react-icons/fi";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import AddEditAttributeModal from "./AddEditAttributeModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import Pagination from "@/components/ui/Pagination";
import Spinner from "@/components/ui/Spinner";

const AttributeTab = ({ attributeTitle, service }) => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total_pages: 1,
    total_items: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchItems = useCallback(
    async (page = 1, search = "") => {
      if (!accessToken || !service) return;

      try {
        setLoading(true);
        const response = await service.list(accessToken, page, pageSize, search);

        if (response?.status && response?.data) {
          setItems(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          } else if (response.count !== undefined) {
            setPagination((prev) => ({ ...prev, total_items: response.count }));
          }
        }
      } catch (error) {
        console.error(`Failed to fetch ${attributeTitle}:`, error);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, service, pageSize, attributeTitle]
  );

  useEffect(() => {
    fetchItems(currentPage, debouncedSearch);
  }, [fetchItems, currentPage, pageSize, debouncedSearch]);

  const handleAdd = () => {
    setModalMode("add");
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setModalMode("edit");
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !accessToken || !service) return;

    try {
      setDeleteLoading(true);
      const response = await service.delete(accessToken, itemToDelete.id);

      toast.push(
        <Notification title="Success" type="success">
          {response.message || `${attributeTitle} deleted successfully`}
        </Notification>
      );
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchItems(currentPage, debouncedSearch);
    } catch (error) {
      console.error(`Failed to delete ${attributeTitle}:`, error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="bg-[#FFFDFC] border border-[#E8DDD4] rounded-xl shadow md:p-6 p-3">
        <div className="flex justify-between items-start flex-wrap gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#1C2C56]">{attributeTitle} Management</h2>
            <p className="text-sm text-[#486284]">
              {pagination.total_items} {attributeTitle} Available
            </p>
          </div>

          <button
            onClick={handleAdd}
            className="bg-[#A0522D] text-white px-4 py-2 font-semibold rounded-md text-sm flex items-center gap-2 hover:bg-[#8B4513] transition-colors"
          >
            <FiPlus size={14} />
            Add {attributeTitle}
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72 mb-6">
          <FiSearch className="absolute left-3 top-2.5 text-[#64748B]" size={16} />
          <input
            type="text"
            placeholder={`Search ${attributeTitle.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-[#00345F] rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
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

        {loading ? (
          <div className="flex justify-center items-center h-[300px] w-full">
            <Spinner size={40} customColorClass="text-[#A0522D]" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-[#94A3B8]">
            No {attributeTitle.toLowerCase()} found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="border border-[#1C2C5633] rounded-xl overflow-hidden bg-white hover:shadow-md transition flex flex-col"
              >
                <div className="h-40 bg-gray-50 flex items-center justify-center p-3 border-b border-gray-100 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#EEF2FF] text-[#1C2C56] font-bold text-xl flex items-center justify-center">
                      {item.name ? item.name.charAt(0).toUpperCase() : "A"}
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#1C2C56]">{item.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Status: {item.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 bg-[#A0522D] text-white text-xs py-1.5 rounded-md hover:bg-[#8B4513] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setItemToDelete(item);
                        setDeleteDialogOpen(true);
                      }}
                      className="flex-1 border border-red-200 text-red-500 text-xs py-1.5 rounded-md flex items-center justify-center gap-1 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

      <AddEditAttributeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={selectedItem}
        attributeTitle={attributeTitle}
        service={service}
        onSaveSuccess={() => {
          setIsModalOpen(false);
          fetchItems(currentPage, debouncedSearch);
        }}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${attributeTitle}`}
        message={`Are you sure you want to delete this ${attributeTitle.toLowerCase()}?`}
        itemName={itemToDelete?.name}
        loading={deleteLoading}
      />
    </>
  );
};

export default AttributeTab;
