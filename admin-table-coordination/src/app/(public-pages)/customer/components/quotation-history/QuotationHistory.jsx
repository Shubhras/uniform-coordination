import { useMemo, useState } from "react";
import { FiSearch, FiEye, FiDownload ,FiX} from "react-icons/fi";

const quotes = [
  {
    id: "Q-2024-001",
    company: "Acme Corp",
    amount: "$125,000",
    date: "Oct 24, 2023",
    status: "Approved",
  },
  {
    id: "Q-2024-002",
    company: "Globex Inc",
    amount: "$45,000",
    date: "Oct 25, 2023",
    status: "Pending",
  },
  {
    id: "Q-2024-003",
    company: "Soylent Corp",
    amount: "$12,000",
    date: "Oct 26, 2023",
    status: "Rejected",
  },
  {
    id: "Q-2024-004",
    company: "Initech",
    amount: "$85,000",
    date: "Oct 27, 2023",
    status: "Pending",
  },
  {
    id: "Q-2024-005",
    company: "Umbrella Corp",
    amount: "$450,000",
    date: "Oct 28, 2023",
    status: "Approved",
  },
  {
    id: "Q-2024-006",
    company: "Stark Ind",
    amount: "$950,000",
    date: "Oct 29, 2023",
    status: "Pending",
  },
  {
    id: "Q-2024-007",
    company: "Wayne Ent",
    amount: "$320,000",
    date: "Oct 30, 2023",
    status: "Approved",
  },
  {
    id: "Q-2024-008",
    company: "Cyberdyne",
    amount: "$67,000",
    date: "Oct 31, 2023",
    status: "Rejected",
  },
];

const statusColors = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Rejected: "bg-red-100 text-red-700",
};

const QuotationHistory = () => {
  const [search, setSearch] = useState("");

  const filteredQuotes = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return quotes;

    return quotes.filter(
      (quote) =>
        quote.id.toLowerCase().includes(term) ||
        quote.company.toLowerCase().includes(term) ||
        quote.amount.toLowerCase().includes(term) ||
        quote.date.toLowerCase().includes(term) ||
        quote.status.toLowerCase().includes(term),
    );
  }, [search]);

  return (
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
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {quotes.map((q, i) => (
              <tr
                key={i}
                className="border-b last:border-none border-[#E2E8F0] hover:bg-gray-50 transition"
              >
                <td className="px-5 py-3 font-medium text-[#1C2C56]">{q.id}</td>
                <td className="px-5 py-3 text-[#486284]">{q.company}</td>
                <td className="px-5 py-3 font-medium">{q.amount}</td>
                <td className="px-5 py-3 text-[#486284]">{q.date}</td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[q.status]}`}
                  >
                    {q.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-gray-500 hover:text-[#1C2C56]">
                    <FiEye fontSize={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuotationHistory;
