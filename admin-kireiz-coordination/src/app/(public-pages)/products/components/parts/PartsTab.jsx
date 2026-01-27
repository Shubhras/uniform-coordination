"use client";

import { useState } from "react";
import { FiSearch, FiEdit2, FiCopy, FiPlus, FiTrash2 } from "react-icons/fi";
import Select from "react-select";
import AddEditPartModal from "./AddEditPartModal";

const PartsTab = () => {
    const [openAdd, setOpenAdd] = useState(false);
    const [editPart, setEditPart] = useState(null); // ✅ ADD
    const [view, setView] = useState("grid");

    const parts = [
        {
            name: "Chef Coat Body",
            category: "Body",
            image: "/img/admin/parts/part-1.png",
        },
        {
            name: "Left Sleeve",
            category: "Sleeves",
            image: "/img/admin/parts/part-2.png",
        },
        {
            name: "Right Sleeve",
            category: "Sleeves",
            image: "/img/admin/parts/part-3.png",
        },
        {
            name: "Collar",
            category: "Details",
            image: "/img/admin/parts/part-4.png",
        }, {
            name: "Chef Coat Body",
            category: "Body",
            image: "/img/admin/parts/part-5.png",
        },
        {
            name: "Left Sleeve",
            category: "Sleeves",
            image: "/img/admin/parts/part-6.png",
        },
        {
            name: "Right Sleeve",
            category: "Sleeves",
            image: "/img/admin/parts/part-7.png",
        },
        {
            name: "Collar",
            category: "Details",
            image: "/img/admin/parts/part-1.png",
        },
    ];

    /* ---------------- SELECT STYLES ---------------- */
    const selectStyles = {
        control: (base) => ({
            ...base,
            minHeight: "40px",
            borderRadius: "6px",
            borderColor: "#00345F",
            boxShadow: "none",
            "&:hover": { borderColor: "#1C2C56" },
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? "#1C2C56"
                : state.isFocused
                    ? "#EEF2FF"
                    : "white",
            color: state.isSelected ? "white" : "#1C2C56",
            fontSize: "14px",
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    };

    const categoryOptions = [
        { value: "all", label: "All Categories" },
        { value: "body", label: "Body" },
        { value: "sleeves", label: "Sleeves" },
        { value: "details", label: "Details" },
        { value: "pockets", label: "Pockets" },
    ];

    const [category, setCategory] = useState(categoryOptions[0]);

    /* ---------------- HANDLERS ---------------- */

    const handleAdd = () => {
        setEditPart(null);      // ✅ ADD MODE
        setOpenAdd(true);
    };

    const handleEdit = (part) => {
        setEditPart(part);     // ✅ EDIT MODE
        setOpenAdd(true);
    };

    const handleCloseModal = () => {
        setOpenAdd(false);
        setEditPart(null);     // ✅ RESET
    };


    return (
        <div className="bg-white rounded-xl shadow md:p-6 p-3">

            {/* HEADER */}
            <div className="flex justify-between sm:flex-row flex-col items-start mb-4 gap-2">
                <div>
                    <h2 className="text-2xl font-semibold text-[#1C2C56]">
                        Part Images Library
                    </h2>
                    <p className="text-base text-[#486284]">
                        {parts.length} parts total
                    </p>
                </div>

                <button
                    onClick={handleAdd}  // ✅ FIXED
                    className="bg-[#1C2C56] text-white px-4 py-2 font-medium rounded-md text-sm flex items-center gap-2"
                >
                    <FiPlus size={14} />
                    Upload New Part
                </button>
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap gap-4 items-center mb-6">
                <div className="relative w-full md:w-72">
                    <FiSearch className="absolute left-3 top-2.5 text-[#64748B]" size={16} />
                    <input
                        type="text"
                        placeholder="Search Parts..."
                        className="w-full border border-[#00345F] rounded-md pl-9 pr-3 py-2 text-sm"
                    />
                </div>

                <Select
                    options={categoryOptions}
                    value={category}
                    onChange={setCategory}
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    className="w-48 text-sm"
                />

                <div className="ml-auto flex border rounded-md overflow-hidden">
                    <button
                        onClick={() => setView("grid")}
                        className={`px-4 py-2 text-sm ${view === "grid"
                            ? "bg-[#EEF2FF] text-[#1C2C56]"
                            : "text-[#486284]"
                            }`}
                    >
                        Grid
                    </button>
                    <button
                        onClick={() => setView("list")}
                        className={`px-4 py-2 text-sm ${view === "list"
                            ? "bg-[#EEF2FF] text-[#1C2C56]"
                            : "text-[#486284]"
                            }`}
                    >
                        List
                    </button>
                </div>
            </div>

            {/* GRID VIEW */}
            {view === "grid" && (
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {parts.map((part, index) => (
                        <div
                            key={index}
                            className="border border-[#1C2C5633] rounded-xl hover:shadow-md transition"
                        >
                            <div className="h-44 bg-[#1C4FA808] p-3">
                                <img
                                    src={part.image}
                                    alt={part.name}
                                    className="w-full h-full object-cover mb-3"
                                />
                            </div>

                            <div className="p-3">
                                <h3 className="text-sm font-semibold text-[#1C2C56]">
                                    {part.name}
                                </h3>
                                <p className="text-xs text-[#486284]">
                                    {part.category}
                                </p>

                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => handleEdit(part)} // ✅ FIXED
                                        className="flex-1 bg-[#1C2C56] text-white text-xs py-1.5 rounded-md"
                                    >
                                        Edit
                                    </button>
                                    <button className="flex-1 border text-[#1C2C56] text-xs py-1.5 rounded-md flex items-center justify-center gap-1">
                                        <FiCopy size={12} />
                                        Duplicate
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* LIST VIEW */}
            {view === "list" && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[#F1F5F9] text-[#486284]">
                            <tr>
                                <th className="text-left px-5 py-4 font-medium">Preview</th>
                                <th className="text-left px-5 py-4 font-medium">Fabric Name</th>
                                <th className="text-left px-5 py-4 font-medium">Category</th>
                                <th className="text-left px-5 py-4 font-medium">Usage</th>
                                <th className="text-left px-5 py-4 font-medium">z-index</th>
                                <th className="text-right px-5 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {parts.map((part, index) => (
                                <tr
                                    key={index}
                                >
                                    {/* Preview */}
                                    <td className="px-4 py-3">
                                        <img
                                            src={part.image}
                                            alt={part.name}
                                            className="w-12 h-12 rounded-md object-cover border"
                                        />
                                    </td>

                                    {/* Name */}
                                    <td className="px-4 py-3 text-[#1C2C56] font-medium">
                                        {part.name}
                                    </td>

                                    {/* Category */}
                                    <td className="px-4 py-3 text-[#486284]">
                                        {part.category}
                                    </td>

                                    {/* Usage */}
                                    <td className="px-4 py-3 text-[#1C2C56]">
                                        45 Templates
                                    </td>

                                    {/* Z Index */}
                                    <td className="px-4 py-3 text-[#486284]">
                                        1
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-3 text-[#1C2C56]">
                                            <button className="p-1.5 rounded hover:bg-[#EEF2FF]" >
                                                <FiCopy size={14} />
                                            </button>
                                            <button
                                                className="p-1.5 rounded hover:bg-[#EEF2FF]"
                                                onClick={() => handleEdit(part)}
                                            >
                                                <FiEdit2 size={14} />
                                            </button>

                                            <button className="p-1.5 rounded hover:bg-[#EEF2FF]">
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL */}
            <AddEditPartModal
                key={editPart ? editPart.name : "add"}
                isOpen={openAdd}
                onClose={handleCloseModal}
                mode={editPart ? "edit" : "add"}
                initialData={editPart}
            />

        </div>
    );
};

export default PartsTab;
