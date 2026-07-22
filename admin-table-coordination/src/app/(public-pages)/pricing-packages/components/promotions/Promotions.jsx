"use client";

import { useEffect, useState, useMemo } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { useRouter } from "next/navigation";
import Pagination from "@/components/ui/Pagination";
import Spinner from "@/components/ui/Spinner";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import Select from "react-select";
import {
  FiSearch,
  FiPlus,
  FiX,
  FiEye,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import {
  apiGetPromoCodeList,
  apiDeletePromoCode,
} from "@/services/PricingPackages";
import NewDeleteModal from "@/components/shared/NewDeleteModal";

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "percentage", label: "Percentage" },
  { value: "first purchase", label: "First Purchase" },
  { value: "repeat customer", label: "Repeat Customer" },
  { value: "limited time", label: "Limited Time" },
  { value: "fixed amount", label: "Fixed Amount" },
];

const statusOptions = [
  { value: "all", label: "Status" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "scheduled", label: "Scheduled" },
];

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "44px",
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

const getStatusClasses = (status) => {
  if (status === "Active") return "bg-[#E8FAF2] text-[#007A55]";
  if (status === "Expired") return "bg-[#FFE9E8] text-[#F04444]";
  return "bg-[#FFF6E7] text-[#E6A11E]";
};

const Promotions = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [type, setType] = useState(typeOptions[0]);
  const [status, setStatus] = useState(statusOptions[0]);
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalItems, setTotalItems] = useState(0);

  const getPromotionList = async () => {
    try {
      setLoading(true);

      const res = await apiGetPromoCodeList(accessToken, currentPage, pageSize);

      if (res?.status) {
        setPromotions(res.data || []);
        setTotalItems(res.pagination?.total_items || 0);
      } else {
        setPromotions([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      getPromotionList();
    }
  }, [accessToken, currentPage]);

  const filteredPromotions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return promotions.filter((promotion) => {
      const matchesSearch =
        !query || promotion.promocodeName?.toLowerCase().includes(query);

      const matchesType =
        type.value === "all" || promotion.promocodeType === type.value;

      const promotionStatus = promotion.isActive ? "active" : "inactive";

      const matchesStatus =
        status.value === "all" || promotionStatus === status.value;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [promotions, searchQuery, type, status]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, type, status]);

  const handleDeleteConfirm = async () => {
    if (!promotionToDelete) return;

    try {
      setDeleteLoading(true);

      const res = await apiDeletePromoCode(accessToken, promotionToDelete.id);

      if (res?.status) {
        toast.push(
          <Notification type="success" title="Success">
            Promotion deleted successfully.
          </Notification>,
        );

        setDeleteDialogOpen(false);
        setPromotionToDelete(null);

        getPromotionList(); // Refresh list
      } else {
        toast.push(
          <Notification type="danger" title="Error">
            {res?.message || "Failed to delete promotion."}
          </Notification>,
        );
      }
    } catch (err) {
      console.error(err);

      toast.push(
        <Notification type="danger" title="Error">
          Something went wrong.
        </Notification>,
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="mt-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ">
          <div className="relative w-full lg:max-w-xl">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A85A32B2]"
              size={16}
            />

            <input
              type="text"
              placeholder="Search Theme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 border border-[#D1D5DB] text-[#A85A32B2] rounded-lg pl-10 pr-10 outline-none focus:border-[#1C4FA8]"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <FiX className="text-gray-500" />
              </button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Filters */}
            <div className="flex gap-3">
              <div className="w-52">
                <Select
                  value={status}
                  onChange={setStatus}
                  options={statusOptions}
                  styles={selectStyles}
                  isSearchable={false}
                />
              </div>

              <div className="w-52">
                <Select
                  value={type}
                  onChange={setType}
                  options={typeOptions}
                  styles={selectStyles}
                  isSearchable={false}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead className="bg-[#F1F5F9] text-[#486284]">
              <tr className="bg-[#F7F2EE] text-[#6B7280] text-sm">
                <th className="text-left px-4 py-3">Promotion Name</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className=" text-left px-4 py-3">Value</th>
                <th className="text-left px-4 py-3">Validity</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={100}>
                    <div className="flex justify-center items-center h-[400px]">
                      <Spinner size={40} customColorClass="text-[#A0522D]" />
                    </div>
                  </td>
                </tr>
              ) : filteredPromotions.length ? (
                filteredPromotions.map((promotion) => (
                  <tr
                    key={promotion.id}
                    className="odd:bg-white even:bg-[#FBF8F6]"
                  >
                    <td className="px-4 py-3">{promotion.promocodeName}</td>

                    <td className="px-4 py-3">
                      {promotion.promocodeType.replace("_", " ")}
                    </td>

                    <td className="px-4 py-3">₹ {promotion.amount}</td>

                    <td className="px-4 py-3">
                      <div>
                        {new Date(promotion.started_at).toLocaleDateString()}
                      </div>

                      <div className="text-gray-400">
                        {new Date(promotion.ended_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          promotion.isActive
                            ? "bg-[#E8FAF2] text-[#007A55]"
                            : "bg-[#FFE9E8] text-[#F04444]"
                        }`}
                      >
                        {promotion.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-[#F1E8E2] transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]">
                          <FiEye
                            size={15}
                            onClick={() =>
                              router.push(
                                `/pricing-packages/view/${promotion.id}`,
                              )
                            }
                          />
                        </button>

                        <button className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-[#F1E8E2] transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]">
                          <FiEdit2
                            size={15}
                            onClick={() =>
                              router.push(
                                `/pricing-packages/create-promotion/${promotion.id}`,
                              )
                            }
                          />
                        </button>

                        <button
                          className="flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-[#F1E8E2] transition-all duration-200 hover:shadow-lg hover:bg-[#FFF8F4]"
                          onClick={() => {
                            setPromotionToDelete(promotion);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    No Promotions Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          className="flex justify-end mt-3"
          style={{ marginRight: "6px", marginLeft: "6px" }}
        >
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            total={totalItems || promotions.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
      <NewDeleteModal
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPromotionToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Promotion"
        message="Deleting this promotion will permanently remove it. This action cannot be undone."
        loading={deleteLoading}
      />
    </>
  );
};

export default Promotions;
