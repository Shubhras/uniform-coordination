"use client";

import React from "react";
import { FiEdit2 } from "react-icons/fi";

const UnitPrice = () => {
    const data = [
        {
            type: "Fabric",
            name: "Italian Silk",
            unit: "meter",
            base: "₹780",
            bulk: "₹580",
        },
        {
            type: "Part",
            name: "YKK Zipper",
            unit: "Piece",
            base: "₹780",
            bulk: "₹780",
        },
        {
            type: "Fabric",
            name: "Italian Silk",
            unit: "meter",
            base: "₹780",
            bulk: "₹580",
        },
        {
            type: "Part",
            name: "YKK Zipper (Invisible)",
            unit: "Piece",
            base: "₹780",
            bulk: "₹780",
        },
        {
            type: "Fabric",
            name: "Italian Silk",
            unit: "meter",
            base: "₹780",
            bulk: "₹580",
        },
    ];

    return (
        <div className="rounded-xl shadow md:p-6 p-4">
            {/* Header */}
            <div className="flex justify-between sm:flex-row flex-col items-start gap-3 mb-5">
                <div>
                    <h2 className="text-2xl font-semibold text-[#1C2C56]">
                        Unit Price
                    </h2>
                    <p className="text-sm text-[#486284]">55 fabrics total</p>
                </div>

                <div className="flex gap-3">
                    <button className="border border-[#CBD5E1] text-[#1C2C56] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
                        Reset Default
                    </button>

                    <button className="bg-[#1C2C56] text-white px-4 py-2 rounded-md text-sm font-medium">
                        + Export CSV
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-xl border border-[#E2E8F0]">
                <table className="w-full text-sm">
                    <thead className="bg-[#F8FAFC] text-[#486284]">
                        <tr>
                            <th className="px-4 py-4 text-left font-medium">Type</th>
                            <th className="px-4 py-4 text-left font-medium">Item Name</th>
                            <th className="px-4 py-4 text-left font-medium">Unit</th>
                            <th className="px-4 py-4 text-left font-medium">Base Price</th>
                            <th className="px-4 py-4 text-left font-medium">Bulk (10+)</th>
                            <th className="px-4 py-4 text-left font-medium">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((item, index) => (
                            <tr
                                key={index}
                                className={`text-[#486284] ${index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"
                                    }`}
                            >
                                <td className="px-4 py-4">
                                    <span className="bg-[#E5E7EB] text-[#1C2C56] px-2 py-1 rounded-full text-xs font-medium">
                                        {item.type}
                                    </span>
                                </td>

                                <td className="px-4 py-4 font-medium">
                                    {item.name}
                                </td>

                                <td className="px-4 py-4">{item.unit}</td>

                                <td className="px-4 py-4 font-medium">{item.base}</td>

                                <td className="px-4 py-4 font-medium">{item.bulk}</td>

                                <td className="px-4 py-4">
                                    <button className="text-[#1C2C56] hover:text-[#0F172A]">
                                        <FiEdit2 size={16} />
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

export default UnitPrice;
