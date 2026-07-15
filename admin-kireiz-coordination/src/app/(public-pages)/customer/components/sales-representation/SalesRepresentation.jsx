import { FiSearch, FiUserPlus, FiMail } from "react-icons/fi";

const reps = [
    {
        name: "Sarah Connor",
        role: "Sales Executive",
        initials: "SC",
        clients: 42,
        revenue: "$1,250,000",
        winRate: "32%",
    },
    {
        name: "Kyle Reese",
        role: "Sales Representative",
        initials: "KR",
        clients: 28,
        revenue: "$850,000",
        winRate: "24%",
    },
    {
        name: "Ellen Ripley",
        role: "Sales Manager",
        initials: "ER",
        clients: 15,
        revenue: "$2,100,000",
        winRate: "45%",
    },
    {
        name: "Rick Deckard",
        role: "Sales Executive",
        initials: "RD",
        clients: 31,
        revenue: "$920,000",
        winRate: "28%",
    },
    {
        name: "Dana Scully",
        role: "Sales Executive",
        initials: "DS",
        clients: 35,
        revenue: "$1,100,000",
        winRate: "30%",
    },
];

const SalesRepresentation = () => {
    return (
        <div className="bg-white md:p-6 p-3 rounded-xl shadow border border-gray-200">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-[#1C2C56]">Sales Team Performance</h1>
                    <p className="text-[#486284] text-sm">Manage discount tiers and corporate rules</p>
                </div>

                <button className="flex items-center gap-2 bg-[#1C4FA8] text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                    <FiUserPlus />
                    Add Representative
                </button>
            </div>

            {/* Search */}
            <div className="relative w-72 mb-6">
                <FiSearch className="absolute left-3 top-2.5 text-gray-500" />
                <input
                    placeholder="Search..."
                    className="w-full pl-9 pr-3 py-2 border border-[#00345F] rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {reps.map((rep, index) => (
                    <div
                        key={index}
                        className="bg-[#F5F7FB] border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                    >
                        {/* Top */}
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-semibold text-gray-700">
                                    {rep.initials}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#1C2C56]">{rep.name}</h3>
                                    <p className="text-sm text-gray-500">{rep.role}</p>
                                </div>
                            </div>

                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                Active
                            </span>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-white p-3 rounded-lg shadow text-center">
                                <p className="text-sm font-semibold">{rep.clients}</p>
                                <p className="text-xs text-gray-500">Clients</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow text-center">
                                <p className="text-sm font-semibold">{rep.revenue}</p>
                                <p className="text-xs text-gray-500">Revenue</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow text-center">
                                <p className="text-sm font-semibold">{rep.winRate}</p>
                                <p className="text-xs text-gray-500">Win Rate</p>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex items-center gap-2">
                            <button className="flex-1 bg-[#1C4FA8] text-white py-2 rounded-lg text-sm font-medium transition">
                                View Profile
                            </button>
                            <button className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">
                                <FiMail />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SalesRepresentation;
