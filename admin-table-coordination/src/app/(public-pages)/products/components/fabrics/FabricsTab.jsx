"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiPlus,
  FiRotateCcw,
} from "react-icons/fi";
import Select from "react-select";
import { useTranslations } from "next-intl";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
  apiGetFabricList,
  apiDeleteFabric,
  apiFabricCategoryList,
} from "@/services/FabricService";
import Spinner from "@/components/ui/Spinner";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import AddEditFabricModal from "./AddEditFabricModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import Pagination from "@/components/ui/Pagination";

const FabricsTab = () => {
  const t = useTranslations("productSpecification.fabric");
  const ts = useTranslations("successTitle");
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total_pages: 1,
    total_items: 0,
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch category options
  useEffect(() => {
    if (!accessToken) return;

    const fetchCategories = async () => {
      try {
        const res = await apiFabricCategoryList(accessToken);
        const options =
          res?.data?.map((item) => ({
            value: item.id,
            label: item.categoryName,
          })) || [];
        setCategoryOptions(options);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, [accessToken]);

  // Modal states
  const [openAdd, setOpenAdd] = useState(false);
  const [editFabric, setEditFabric] = useState(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fabricToDelete, setFabricToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  // Fetch fabrics
  const fetchFabrics = useCallback(
    async (page = 1) => {
      if (!accessToken) return;

      try {
        setLoading(true);
        const response = await apiGetFabricList(
          accessToken,
          page,
          pageSize,
          debouncedSearch,
          selectedCategory?.value || null,
        );

        if (response?.status && response?.data) {
          setFabrics(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (error) {
        console.error("Failed to fetch fabrics:", error);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, pageSize, debouncedSearch, selectedCategory],
  );

  useEffect(() => {
    fetchFabrics(currentPage);
  }, [fetchFabrics, currentPage, pageSize]);

  // Reset filters
  const handleReset = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "40px",
      height: "40px",
      borderColor: "#D1D5DB",
      boxShadow: "none",
      borderRadius: "8px",
      "&:hover": {
        borderColor: "#A85A32B2",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      height: "40px",
      padding: "0 8px",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "40px",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#A85A32B2",
      fontSize: "14px",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#A85A32B2",
      fontSize: "14px",
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
      fontSize: "14px",
    }),
  };

  // Delete fabric
  const handleDeleteConfirm = async () => {
    if (!fabricToDelete || !accessToken) return;

    try {
      setDeleteLoading(true);
      const response = await apiDeleteFabric(accessToken, fabricToDelete.id);

      toast.push(
        <Notification title={ts("success")} type="success">
          {response.message}
        </Notification>,
      );
      setDeleteDialogOpen(false);
      setFabricToDelete(null);
      fetchFabrics(currentPage); // refresh
    } catch (error) {
      console.error("Failed to delete fabric:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // After save/update, refresh
  const handleSaveSuccess = () => {
    setOpenAdd(false);
    setEditFabric(null);
    fetchFabrics(currentPage);
  };

  return (
    <div className="bg-[#FFFDFC] border border-[#E8DDD4] rounded-xl shadow md:p-6 p-3">
      <div className="flex justify-between sm:flex-row flex-col items-start mb-4 gap-2">
        <div>
          <h2 className="text-2xl font-semibold text-[#2A211D]">
            {/* Fabric Library */}
            {t("fabriLibrary")}
          </h2>
          <p className="text-base text-[#B29D8C]">
            {pagination.total_items} {t("fabricTotal")}
          </p>
        </div>

        <button
          onClick={() => {
            setEditFabric(null);
            setOpenAdd(true);
          }}
          className="bg-[#A0522D] text-white px-4 py-2 font-semibold rounded-md text-sm flex items-center gap-2"
        >
          <FiPlus />
          {t("addFabric")}
        </button>
      </div>

      {/* Filters: Search, Category Select, Reset */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A85A32B2]"
            size={16}
          />
          <input
            type="text"
            placeholder={t("searchFabric")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 border border-[#D1D5DB] text-[#A85A32B2] rounded-lg pl-10 pr-10 outline-none focus:border-[#A85A32B2]"
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

        {/* Category Select */}
        <div className="w-full sm:w-56">
          <Select
            instanceId="fabric-category-select"
            placeholder={t("selectCategory")}
            value={selectedCategory}
            onChange={(val) => {
              setSelectedCategory(val);
              setCurrentPage(1);
            }}
            options={categoryOptions}
            styles={selectStyles}
            isClearable={false}
          />
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={handleReset}
          className="flex h-10 items-center gap-2 rounded-lg border border-[#EFE5DD] bg-white px-4 text-sm font-medium text-[#C08457] transition hover:bg-[#FCF7F3]"
        >
          <FiRotateCcw size={14} />
          {t("reset")}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F1F5F9] text-[#486284]">
            <tr className="bg-[#F7F2EE] text-[#6B7280] text-sm">
              <th className="text-left px-5 py-4 font-medium">
                {t("fabricName")}
              </th>
              <th className="text-left px-5 py-4 font-medium">{t("color")}</th>
              <th className="text-left px-5 py-4 font-medium">
                {t("material")}
              </th>
              <th className="text-left px-5 py-4 font-medium">
                {t("pricePer")}
              </th>
              <th className="text-left px-5 py-4 font-medium">{t("status")}</th>
              <th className="text-left px-5 py-4 font-medium">
                {t("actions")}
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="h-[400px]">
                  <div className="flex justify-center items-center h-full">
                    <Spinner size={40} customColorClass="text-[#A0522D]" />
                  </div>
                </td>
              </tr>
            ) : fabrics.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-[#64748B]">
                  {t("noFabricsFound")}
                </td>
              </tr>
            ) : (
              fabrics.map((fabric, index) => (
                <tr
                  key={fabric.id}
                  className="text-base odd:bg-white even:bg-[#FBF8F6]"
                >
                  <td className="px-5 py-4 text-[#2A211D] font-medium">
                    {fabric.fabricName}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: fabric.color || "#ccc" }}
                      />
                      <span className="text-[#78716C]">{fabric.color}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-[#78716C] capitalize">
                    {fabric.materialType}
                  </td>

                  <td className="px-5 py-4 text-[#2A211D] font-medium">
                    ${Number(fabric.pricePerUnit).toLocaleString()}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${fabric.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                        }`}
                    >
                      {fabric.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0">
                      <button
                        className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"
                        onClick={() => {
                          setEditFabric(fabric);
                          setOpenAdd(true);
                        }}
                      >
                        <FiEdit2 size={17} />
                      </button>
                      <button
                        className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"
                        // className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-[#F1E8E2] transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"
                        onClick={() => {
                          setFabricToDelete(fabric);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <FiTrash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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

      {/* Add/Edit Modal */}
      <AddEditFabricModal
        isOpen={openAdd}
        onClose={() => {
          setOpenAdd(false);
          setEditFabric(null);
        }}
        mode={editFabric ? "edit" : "add"}
        initialData={editFabric}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setFabricToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={t("deleteFabric")}
        message={t("deleteFabricContent")}
        itemName={fabricToDelete?.fabricName}
        loading={deleteLoading}
      />
    </div>
  );
};

export default FabricsTab;
