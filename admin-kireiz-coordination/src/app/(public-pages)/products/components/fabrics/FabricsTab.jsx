"use client";

import { useState } from "react";


import { FiSearch, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import AddEditFabricModal from "./AddEditFabricModal";

const FabricsTab = () => {
    const [openAdd, setOpenAdd] = useState(false);
    const [editFabric, setEditFabric] = useState(null);

    const fabrics = [
        { name: "Cotton Canvas", color: "#5B4636", price: 780 },
        { name: "Polyester Blend", color: "#1E3A8A", price: 780 },
        { name: "Wool Gabardine", color: "#D97706", price: 780 },
        { name: "Denim Twill", color: "#475569", price: 780 },
        { name: "Fabric Name", color: "#7DD3FC", price: 780 },
        { name: "Fabric Name", color: "#FDBA74", price: 780 },
        { name: "Fabric Name", color: "#2563EB", price: 780 },
        { name: "Fabric Name", color: "#14B8A6", price: 780 },
        { name: "Fabric Name", color: "#93C5FD", price: 780 },
        { name: "Fabric Name", color: "#6B7280", price: 780 },
    ];

    return (
        <div className="bg-white rounded-xl shadow md:p-6 p-3 ">
            <div className="flex justify-between sm:flex-row flex-col items-start mb-4 gap-2">
                <div>
                    <h2 className="text-2xl font-semibold text-[#1C2C56]">
                        Fabric Library
                    </h2>
                    <p className="text-base text-[#486284]">55 fabrics total</p>
                </div>

                <button
                    onClick={() => {
                        setEditFabric(null);
                        setOpenAdd(true);
                    }}

                    className="bg-[#1C2C56] text-white px-4 py-2  font-medium rounded-md text-sm"
                >
                    + Add New Fabric
                </button>
            </div>

            <div className="relative w-full md:w-72 mb-4">
                <FiSearch className="absolute left-3 top-2.5 text-[#64748B]" size={16} />
                <input
                    type="text"
                    placeholder="Search Fabrics..."
                    className="w-full border border-[#00345F] rounded-md pl-9 pr-3 py-2 text-sm"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-base">
                    <thead className="bg-[#1C4FA80F] text-[#486284] ">
                        <tr className="">
                            <th className="text-left px-5 py-4 font-medium">Fabric Name</th>
                            <th className="text-left px-5 py-4 font-medium">Color</th>
                            <th className="text-left px-5 py-4 font-medium">Price per Unit</th>
                            <th className="text-right px-5 py-4 font-medium">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {fabrics.map((fabric, index) => (
                            <tr
                                key={index}
                                className={`text-base  ${index % 2 === 0 ? "bg-white" : "bg-[#1C4FA80F]"
                                    }`}
                            >
                                <td className="px-5 py-4 text-[#1C2C56] font-medium">
                                    {fabric.name}
                                </td>

                                <td className="px-5 py-4 flex items-center gap-2">
                                    <span
                                        className="w-4 h-4 rounded-full border"
                                        style={{ backgroundColor: fabric.color }}
                                    />
                                    <span className="text-[#486284] ">
                                        #FF5FDC
                                    </span>
                                </td>

                                <td className="px-5 py-4 text-[#1C2C56] font-medium">
                                    ₹{fabric.price}
                                </td>

                                <td className="px-5 py-4">
                                    <div className="flex justify-end gap-3">
                                        <button className="p-2 rounded-md bg-[#EEF2FF] text-[#1C2C56]" onClick={() => {
                                            setEditFabric(fabric);
                                            setOpenAdd(true);
                                        }}
                                        >
                                            <FiEdit2 size={14} />
                                        </button>
                                        <button className="p-2 rounded-md bg-[#EEF2FF] text-[#1C2C56]">
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AddEditFabricModal
                isOpen={openAdd}
                onClose={() => setOpenAdd(false)}
                mode={editFabric ? "edit" : "add"}
                initialData={editFabric}
            />

        </div>
    );
};

export default FabricsTab;
