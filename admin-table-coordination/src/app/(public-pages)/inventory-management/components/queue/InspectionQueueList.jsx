"use client";

import { useState, useEffect } from "react";
import {
  FiSearch,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import Select from "react-select";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiInspectionQueueList } from "@/services/InventoryManagement";
import Spinner from "@/components/ui/Spinner";
import Pagination from "@/components/ui/Pagination";

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

const InspectionQueueList = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [inspectionData, setInspectionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const statusOptions = [
    { value: "", label: "Status" },
    { value: "pending", label: "Pending" },
    { value: "passed", label: "Passed" },
    { value: "failed", label: "Failed" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchInspectionQueue = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);

      const res = await apiInspectionQueueList(
        accessToken,
        currentPage,
        pageSize,
        debouncedSearch,
        status?.value || "",
      );

      if (res?.status) {
        setInspectionData(res.data || []);

        setTotal(res.pagination?.count || 0);
      } else {
        setInspectionData([]);
        setTotal(0);
      }
    } catch (err) {
      console.error(err);
      setInspectionData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspectionQueue();
  }, [accessToken, currentPage, pageSize, debouncedSearch, status]);

  return (
    <>
      <div className="bg-white rounded-lg">
        {" "}
        {/* Search + Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-full lg:max-w-xl">
            <FiSearch className="absolute left-4  top-1/2 -translate-y-1/2 text-[#C08457] text-sm" />

            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 rounded-lg border border-[#EFE5DD] text-[#C08457] pl-10 pr-4  text-sm outline-none focus:border-[#C08457]"
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

          {/* <div className="w-44">
            <Select
              value={status}
              onChange={setStatus}
              options={statusOptions}
              styles={selectStyles}
              placeholder="Status"
              isClearable={false}
            />
          </div> */}
        </div>
        {/* Table */}
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F1F5F9] text-[#486284]">
              <tr className="bg-[#F7F2EE] text-[#6B7280] text-sm">
                <th className="text-left  px-4 py-3 font-normal">
                  Product Name
                </th>
                <th className="text-left  px-4 py-3 font-normal">Order ID</th>
                <th className="text-left  px-4 py-3 font-normal">
                  Returned Qty
                </th>
                <th className="text-left  px-4 py-3 font-normal">
                  Return Date
                </th>
                <th className="text-left  px-4 py-3 font-normal">Action</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10">
                    <div className="flex justify-center">
                      <Spinner size={40} customColorClass="text-[#A0522D]" />
                    </div>
                  </td>
                </tr>
              ) : inspectionData.length > 0 ? (
                inspectionData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`text-[13px] ${
                      index % 2 === 0 ? "bg-white" : "bg-[#FBF7F3]"
                    }`}
                  >
                    <td className="px-5 py-3">
                      <h3 className="text-[#2C1A0E] text-[15px] font-semibold">
                        {item.category_name}
                      </h3>

                      <p className="text-[12px] text-[#A08070]">
                        {item.item_name}
                      </p>
                    </td>

                    <td className="px-5 py-3 text-[#2C1A0E] font-semibold text-[14px]">
                      #ORD-{item.id}
                    </td>

                    <td className="px-5 py-3 text-[#2C1A0E] font-semibold text-[14px]">
                      {item.returned_qty} Units
                    </td>

                    <td className="px-5 py-3 text-[#2C1A0E] font-semibold text-[14px]">
                      {new Date(item.inspected_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex gap-3">
                        <button className="min-w-[68px] h-7 rounded-md border border-[#B8F1D4] bg-[#F2FFF7] text-[#0E9F6E] text-[13px] font-semibold">
                          Pass
                        </button>

                        <button className="min-w-[68px] h-7 rounded-md border border-[#FFD0D7] bg-white text-[#E11D48] text-[13px] font-semibold">
                          Fail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    No inspection records found.
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
          total={total}
          onChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </>
  );
};

export default InspectionQueueList;
