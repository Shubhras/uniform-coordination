"use client";

import { useState, useEffect } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiOrderRentalLists } from "@/services/OrderRentals";
import Select from "react-select";
import { FiSearch, FiEye, FiX, FiRotateCcw } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import Pagination from "@/components/ui/Pagination";
import { useTranslations, useLocale } from "next-intl";

const formatRentalPeriod = (startDate, endDate, locale) => {
  if (!startDate || !endDate) return "-";

  const start = new Date(startDate);
  const end = new Date(endDate);

  const startDay = start.getDate();
  const endDay = end.getDate();

  const startMonth = start.toLocaleString(locale, { month: "short" });
  const endMonth = end.toLocaleString(locale, { month: "short" });

  const year = end.getFullYear();

  return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
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

export default function Orders() {
  const t = useTranslations("orderRetals.viewOrder");
  const locale = useLocale();

  const customerOptions = [
    { value: "all", label: t("allRoles") },
    { value: "b2b", label: "B2B" },
    { value: "b2c", label: "B2C" },
  ];

  const statusOptions = [
    { value: "all", label: t("allStatus") },
    { value: "delivered", label: t("statusDelivered") },
    { value: "returned", label: t("statusReturned") },
    { value: "shipped", label: t("statusShipped") },
  ];

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState(customerOptions[0]);
  const [status, setStatus] = useState(statusOptions[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [pagination, setPagination] = useState({
    total_items: 0,
    total_pages: 1,
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleReset = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setCustomer(customerOptions[0]);
    setStatus(statusOptions[0]);
    setCurrentPage(1);
  };

  const fetchOrders = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);

      const res = await apiOrderRentalLists(
        accessToken,
        currentPage,
        pageSize,
        debouncedSearch,
        customer.value,
        status.value,
      );

      if (res?.status) {
        setOrdersData(res.data || []);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Order List Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [accessToken, currentPage, pageSize, debouncedSearch, customer, status]);

  return (
    <>
      <div className="min-h-screen bg-white px-4 py-5">
        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-[#1A1410]">
            {t("orderTitle")}
          </h1>

          <p className="text-[16px] text-[#757575] mt-1">
            {t("orderContent")}
          </p>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="relative w-full lg:max-w-xl">
            <FiSearch
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute left-4  top-1/2 -translate-y-1/2 text-[#C08457] text-sm"
            />

            <input
              type="text"
              placeholder={t("searchProducts")}
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
            <div className="flex gap-3">
              <div className="w-52">
                <Select
                  value={customer}
                  onChange={setCustomer}
                  options={customerOptions}
                  styles={selectStyles}
                  isSearchable={false}
                />
              </div>

              <div className="w-52">
                <Select
                  value={status}
                  onChange={setStatus}
                  options={statusOptions}
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F1F5F9] text-[#486284]">
              <tr className="bg-[#F7F2EE] text-[#6B7280] text-sm">
                <th className="text-left px-4 py-3 font-medium">{t("orderid")}</th>

                <th className="text-left px-4 py-3 font-medium">
                  {t("customerName")}
                </th>
                <th className="text-left px-4 py-3 font-medium">{t("role")}</th>
                <th className="text-left px-4 py-3 font-medium">
                  {t("rentalPeriod")}
                </th>
                <th className="text-left px-4 py-3 font-medium">{t("amount")}</th>
                <th className="text-left px-4 py-3 font-medium">{t("status")}</th>
                <th className="text-left px-4 py-3 font-medium">{t("action")}</th>
              </tr>
            </thead>

            <tbody>
              {ordersData.length > 0 ? (
                ordersData.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`border-t border-[#F3ECE7] text-[14px] ${index % 2 === 0 ? "bg-white" : "bg-[#FCF9F6]"
                      }`}
                  >
                    <td className="px-5 py-5 font-semibold text-[#2C1A0E]">
                      {order.order_id}
                    </td>
                    {/* Name */}
                    <td className="px-5 py-5 font-semibold text-[#2C1A0E]">
                      {order.customer?.full_name || "-"}
                    </td>
                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex items-center rounded-l px-3 py-1 text-[11px] font-semibold uppercase border ${order.customer?.role === "b2b"
                          ? "bg-[#EEF4FF] text-[#2563EB] border-[#C8DAFF]"
                          : order.customer?.role === "b2c"
                            ? "bg-[#F0F9FF] text-[#0069A8] border-[#B8E6FE]"
                            : "bg-[#F3F4F6] text-[#4B5563] border-[#D1D5DB]"
                          }`}
                      >
                        {order.customer?.role || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-5 text-[#2C1A0E] font-semibold">
                      {formatRentalPeriod(
                        order.rental_start_date,
                        order.rental_end_date,
                        locale,
                      )}
                    </td>
                    <td className="px-5 py-5">
                      <span className="text-[12px] text-[#2C1A0E] font-semibold">
                        ${order.total_amount || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold capitalize ${order.status === "pending"
                          ? "bg-[#FFFBEB] text-[#BB4D00] border border-[#FEE685]"
                          : order.status === "delivered"
                            ? "bg-[#E8FFF5] text-[#0E9F6E] border border-[#B6E7D2]"
                            : order.status === "returned"
                              ? "bg-[#FAF5FF] text-[#9333EA] border border-[#E9D4FF]"
                              : "bg-[#EEF4FF] text-[#2563EB] border border-[#C8DAFF]"
                          }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex">
                        <button
                          onClick={() =>
                            router.push(`/orders/${order.order_id}`)
                          }
                          className="inline-flex items-center gap-2 rounded-md border border-[#E6CDBB] bg-white px-4 py-1.5 text-[13px] font-medium text-[#A85A32] hover:bg-[#FFF7F2]"
                        >
                          <FiEye size={14} />
                          {t("view")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10">
                    {loading ? (
                      <div className="flex justify-center">
                        <Spinner size={40} customColorClass="text-[#A0522D]" />
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        {t("noOrders")}
                      </div>
                    )}
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
            total={pagination.total_items}
            onChange={(page) => setCurrentPage(page)}
          // onPageSizeChange={(size) => {
          //   setPageSize(size);
          //   setCurrentPage(1);
          // }}
          />
        </div>
      </div>
    </>
  );
}

{
  /* Orders Table */
}
