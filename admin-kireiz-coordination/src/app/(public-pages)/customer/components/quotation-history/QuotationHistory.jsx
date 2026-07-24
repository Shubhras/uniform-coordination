import { useMemo, useState, useEffect } from "react";
import { FiSearch, FiEye, FiDownload, FiX, FiEdit2 } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetQUotationList } from "@/services/B2BAccountService";
import { useRouter } from "next/navigation";
import Pagination from "@/components/ui/Pagination";

const QuotationHistory = () => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const router = useRouter();

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const [totalItems, setTotalItems] = useState(0);

  const getQuotationList = async () => {
    try {
      setLoading(true);

      const res = await apiGetQUotationList(
        accessToken,
        currentPage,
        pageSize,
        debouncedSearch,
      );
      if (res?.status) {
        setQuotes(res.data || []);
        setTotalItems(res?.count || 0);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      getQuotationList();
    }
  }, [accessToken, currentPage, pageSize, debouncedSearch]);

  return (
    <>
      <div className="bg-white md:p-6 p-3 rounded-xl shadow border border-gray-200">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-[#1C2C56]">
              Quotation History
            </h1>
            <p className="text-[#486284] text-sm">
              Manage discount tiers and corporate rules
            </p>
          </div>

          <button className="flex items-center gap-2 bg-[#1C4FA8] text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            <FiDownload />
            Export CSV
          </button>
        </div>

        {/* Search */}
        <div className="relative w-72 mb-4">
          <FiSearch className="absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#00345F] rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1C2C56]"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F8FAFC] text-[#486284] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-5 py-3">Quote ID</th>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Contact Person</th>
                <th className="px-5 py-3">Item Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    Loading...
                  </td>
                </tr>
              ) : quotes.length > 0 ? (
                quotes.map((q, i) => (
                  <tr
                    key={q.uuids || i}
                    className="border-b last:border-none border-[#E2E8F0] hover:bg-gray-50 transition"
                  >
                    <td className="px-5 py-3 font-medium text-[#1C2C56]">
                      {q.quotation_id}
                    </td>

                    <td className="px-5 py-3 text-[#486284]">
                      {q.company_name}
                    </td>

                    <td className="px-5 py-3 text-[#486284]">
                      {q.contact_person}
                    </td>

                    <td className="px-5 py-3">{q.item_type}</td>

                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize
      ${
        q.quotation_status === "approved"
          ? "bg-green-100 text-green-700"
          : q.quotation_status === "pending"
            ? "bg-yellow-100 text-yellow-700"
            : q.quotation_status === "sent"
              ? "bg-blue-100 text-blue-700"
              : q.quotation_status === "cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
      }`}
                      >
                        {q.quotation_status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            router.push(`/customer/edit/${q.uuids}`)
                          }
                          className="text-gray-500 hover:text-[#1C2C56]"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/customer/view/${q.uuids}`)
                          }
                          className="text-gray-500 hover:text-[#1C2C56]"
                        >
                          <FiEye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No quotations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-5">
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          total={totalItems || quotes.length}
          onChange={(page) => setCurrentPage(page)}
          // onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </>
  );
};

export default QuotationHistory;
