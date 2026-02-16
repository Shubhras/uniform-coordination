"use client";

import { useState } from "react";
import { FiSearch, FiMoreVertical, FiPlus, FiMail, FiPhone } from "react-icons/fi";
import AddEditB2BAccountModal from "./AddEditB2BAccountModal";
const accounts = [
    {
        company: "Acme Corp",
        person: "John Doe",
        email: "john@acme.com",
        phone: "+1 (555) 123-4567",
        tier: "Gold",
    },
    {
        company: "Globex Inc",
        person: "Sarah Smith",
        email: "sarah@globex.com",
        phone: "+1 (555) 987-6543",
        tier: "Silver",
    },
    {
        company: "Soylent Corp",
        person: "Mike Jones",
        email: "mike@soylent.com",
        phone: "+1 (555) 456-7890",
        tier: "Bronze",
    },
    {
        company: "Initech",
        person: "Peter Gibbons",
        email: "peter@initech.com",
        phone: "+1 (555) 111-2222",
        tier: "Silver",
    },
];

const tierColors = {
    Gold: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    Silver: "bg-slate-50 text-slate-700 border border-slate-200",
    Bronze: "bg-orange-50 text-orange-700 border border-orange-200",
};

const B2BAccounts = () => {
    const [openModal, setOpenModal] = useState(false);
    const [editData, setEditData] = useState(null);
    return (
        <>
            <div className="bg-white rounded-xl shadow md:p-6 p-3">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-[#1C2C56]">B2B Accounts</h2>
                        <p className="text-[#486284] text-sm">
                            Manage discount tiers and corporate rules
                        </p>
                    </div>

                    <button
                        className="bg-[#1C2C56] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                        onClick={() => {
                            setEditData(null);
                            setOpenModal(true);
                        }}
                    >
                        <FiPlus size={16} />
                        Add Account
                    </button>

                </div>

                {/* Search */}
                <div className="relative w-full md:w-80 mb-6">
                    <FiSearch className="absolute left-3 top-2.5 text-[#64748B]" size={16} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full border border-[#00345F] rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
                    <table className="min-w-[800px] w-full text-sm text-left">
                        <thead className="bg-[#F4F7FC] text-[#486284] border-b">
                            <tr>
                                <th className="px-5 py-3 font-medium">Company</th>
                                <th className="px-5 py-3 font-medium">Contact Person</th>
                                <th className="px-5 py-3 font-medium">Contact Info</th>
                                <th className="px-5 py-3 font-medium">Tier</th>
                                <th className="px-5 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {accounts.map((acc, index) => (
                                <tr
                                    key={index}
                                    className="border-b last:border-none hover:bg-gray-50 transition"
                                >
                                    <td className="px-5 py-4 font-medium text-[#1C2C56]">
                                        {acc.company}
                                    </td>

                                    <td className="px-5 py-4 text-gray-600">{acc.person}</td>

                                    <td className="px-5 py-4 text-gray-600">
                                        <div className="flex flex-col gap-1 text-xs">

                                            <div className="flex items-center gap-2">
                                                <FiMail className="text-[#1C2C56]" size={14} />
                                                <span>{acc.email}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <FiPhone className="text-[#1C2C56]" size={14} />
                                                <span>{acc.phone}</span>
                                            </div>

                                        </div>
                                    </td>


                                    <td className="px-5 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${tierColors[acc.tier]}`}
                                        >
                                            {acc.tier}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-right">
                                        <button
                                            className="text-gray-500 hover:text-[#1C2C56]"
                                            onClick={() => {
                                                setEditData(acc);
                                                setOpenModal(true);
                                            }}
                                        >
                                            <FiMoreVertical size={18} />
                                        </button>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddEditB2BAccountModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                mode={editData ? "edit" : "add"}
                initialData={editData}
            />
        </>
    );
};

export default B2BAccounts;
