"use client";

import { useEffect, useState, useMemo } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { useRouter } from "next/navigation";
import Pagination from "@/components/ui/Pagination";
import Spinner from "@/components/ui/Spinner";
import Select from "react-select";
import {
  FiSearch,
  FiPlus,
  FiX,
  FiEye,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import { apiGetPromoCodeList } from "@/services/PricingPackages";

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
    minHeight: "34px",
    borderColor: "#F2E5DD",
    borderRadius: "6px",
    boxShadow: "none",
    fontSize: "11px",
    "&:hover": { borderColor: "#E2CFC2" },
  }),
  valueContainer: (base) => ({
    ...base,
    paddingLeft: "8px",
    paddingRight: "8px",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#B7774D",
    padding: "0 8px 0 0",
  }),
  menu: (base) => ({ ...base, zIndex: 30 }),
  option: (base, state) => ({
    ...base,
    fontSize: "11px",
    backgroundColor: state.isSelected
      ? "#B56735"
      : state.isFocused
        ? "#FCF4EF"
        : "#FFFFFF",
    color: state.isSelected ? "#FFFFFF" : "#6F625B",
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

  return (
    <div className="mt-5">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative w-full md:w-72">
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

        {/* <div className="w-full lg:w-[112px]">
          <Select
            instanceId="pricing-packages-type-filter"
            inputId="pricing-packages-type-filter"
            value={type}
            onChange={(selectedOption) =>
              setType(selectedOption ?? typeOptions[0])
            }
            options={typeOptions}
            isSearchable={false}
            styles={selectStyles}
          />
        </div>

        <div className="w-full lg:w-[96px]">
          <Select
            instanceId="pricing-packages-status-filter"
            inputId="pricing-packages-status-filter"
            value={status}
            onChange={(selectedOption) =>
              setStatus(selectedOption ?? statusOptions[0])
            }
            options={statusOptions}
            isSearchable={false}
            styles={selectStyles}
          />
        </div> */}
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
                <div className="flex justify-center items-center h-[400px]">
                  <Spinner size={40} />
                </div>
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
                    <div className="flex items-center gap-3">
                      <button>
                        <FiEye size={14} />
                      </button>

                      <button>
                        <FiEdit2 size={14} />
                      </button>

                      <button>
                        <FiTrash2 size={14} />
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
  );
};

export default Promotions;
