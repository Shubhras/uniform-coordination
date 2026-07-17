"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FiGrid, FiSearch, FiUserPlus } from "react-icons/fi";
import { useState } from "react";

const initialData = {
    unassigned: [
        { id: "1", name: "Acme Corp", tier: "Gold" },
        { id: "2", name: "Globex Inc", tier: "Silver" },
        { id: "3", name: "Soylent Corp", tier: "Gold" },
        { id: "4", name: "Initech", tier: "Silver" },
    ],
    sarah: [
        { id: "5", name: "Umbrella Corp", tier: "Gold" },
        { id: "6", name: "Stark Ind", tier: "Gold" },
    ],
    kyle: [{ id: "7", name: "Wayne Ent", tier: "Gold" }],
    ellen: [{ id: "8", name: "Cyberdyne", tier: "Silver" }],
};

const columns = [
    { id: "unassigned", title: "Unassigned Accounts" },
    { id: "sarah", title: "Sarah Connor" },
    { id: "kyle", title: "Kyle Reese" },
    { id: "ellen", title: "Ellen Ripley" },
];

const Assignments = () => {
    const [data, setData] = useState(initialData);

    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceItems = Array.from(data[source.droppableId]);
        const destItems = Array.from(data[destination.droppableId]);
        const [movedItem] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, movedItem);

        setData({
            ...data,
            [source.droppableId]: sourceItems,
            [destination.droppableId]: destItems,
        });
    };

    return (
        <div className="bg-white rounded-xl shadow border border-[#E2E8F0] md:p-6 p-3">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-[#1C2C56]">
                        Territory & Account Assignment
                    </h1>
                    <p className="text-sm text-[#486284]">
                        Drag accounts to assign them to sales representatives.
                    </p>
                </div>

                <button className="flex items-center gap-2 bg-[#1C4FA8] text-white px-4 py-2 rounded-md text-sm font-medium">
                    <FiUserPlus size={16} />
                    Add Representative
                </button>
            </div>

            {/* Search */}
            <div className="relative w-72 mb-6">
                <FiSearch className="absolute left-3 top-2.5 text-[#64748B]" />
                <input
                    placeholder="Search..."
                    className="w-full pl-9 pr-3 py-2 border border-[#00345F] rounded-md text-sm focus:outline-none"
                />
            </div>

            {/* Drag Board */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

                    {columns.map((col) => (
                        <Droppable droppableId={col.id} key={col.id}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 min-h-[500px]"
                                >
                                    {/* Column Header */}
                                    <h3 className="text-sm font-semibold text-[#1C2C56] mb-3 flex justify-between">
                                        {col.title}
                                        <span className="bg-[#E2E8F0] text-[#1C2C56] text-xs px-2 py-0.5 rounded-full">
                                            {data[col.id].length}
                                        </span>
                                    </h3>

                                    {/* Cards */}
                                    {data[col.id].map((item, index) => (
                                        <Draggable draggableId={item.id} index={index} key={item.id}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className="bg-white border border-[#E2E8F0] rounded-lg p-3 mb-2 shadow-sm hover:bg-[#F1F5F9] transition flex items-center justify-between"
                                                >

                                                    {/* Left Content */}
                                                    <div>
                                                        <p className="font-medium text-sm text-[#1C2C56]">
                                                            {item.name}
                                                        </p>

                                                        <span className="text-xs bg-[#F1F5F9] text-[#486284] px-2 py-0.5 rounded-md mt-1 inline-block">
                                                            {item.tier}
                                                        </span>
                                                    </div>

                                                    {/* Drag Handle Icon */}
                                                    <div
                                                        {...provided.dragHandleProps}
                                                        className="text-gray-400 hover:text-[#1C2C56] cursor-grab"
                                                    >
                                                        <FiGrid className="text-[#94A3B8]" size={18} />
                                                    </div>

                                                </div>
                                            )}
                                        </Draggable>

                                    ))}

                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}

                </div>
            </DragDropContext>
        </div>
    );
};

export default Assignments;
