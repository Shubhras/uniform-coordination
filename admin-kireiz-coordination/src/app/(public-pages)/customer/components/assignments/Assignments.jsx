"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FiGrid, FiSearch, FiUserPlus, FiUser } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
    apiGetAssignmentBoard,
    apiAssignAccount,
} from "@/services/SalesRepService";
import AddRepModal from "../sales-representation/AddRepModal";

const notify = (title, type, message) =>
    toast.push(
        <Notification title={title} type={type}>
            {message}
        </Notification>,
    );

const Assignments = () => {
    const t = useTranslations("customerSalesRep.assignments");
    const { session } = useCurrentSession();
    const accessToken = session?.user?.accessToken;

    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [addOpen, setAddOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchBoard = useCallback(async () => {
        if (!accessToken) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await apiGetAssignmentBoard(accessToken, debouncedSearch);
            if (res?.status) setColumns(res.data?.columns || []);
        } catch (error) {
            console.error("Failed to load assignment board:", error);
            notify("Error", "danger", "Could not load the assignment board");
        } finally {
            setLoading(false);
        }
    }, [accessToken, debouncedSearch]);

    useEffect(() => {
        fetchBoard();
    }, [fetchBoard]);

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        const previous = columns;

        // Optimistic move so the drag lands instantly; rolled back if the save fails.
        const next = columns.map((col) => ({ ...col, accounts: [...col.accounts] }));
        const from = next.find((c) => c.id === source.droppableId);
        const to = next.find((c) => c.id === destination.droppableId);
        if (!from || !to) return;

        const [moved] = from.accounts.splice(source.index, 1);
        to.accounts.splice(destination.index, 0, moved);
        setColumns(next);

        try {
            const res = await apiAssignAccount(
                accessToken,
                Number(draggableId),
                to.sales_rep_id, // null for the Unassigned column
            );
            if (!res?.status) throw new Error(res?.message || "Assignment failed");
            notify("Success", "success", res.message);
        } catch (error) {
            console.error("Failed to save assignment:", error);
            setColumns(previous);
            notify("Error", "danger", "Could not save the assignment");
        }
    };

    const repColumns = columns.filter((c) => c.id !== "unassigned");

    return (
        <div className="bg-white rounded-xl shadow border border-[#E2E8F0] md:p-6 p-3">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-[#1C2C56]">
                        {t("title")}
                    </h1>
                    <p className="text-sm text-[#486284]">
                        {t("subtitle")}
                    </p>
                </div>

                <button
                    onClick={() => setAddOpen(true)}
                    className="flex items-center gap-2 bg-[#1C4FA8] text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                    <FiUserPlus size={16} />
                    {t("addRepresentative")}
                </button>
            </div>

            {/* Search */}
            <div className="relative w-72 mb-6">
                <FiSearch className="absolute left-3 top-2.5 text-[#64748B]" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="w-full pl-9 pr-3 py-2 border border-[#00345F] rounded-md text-sm focus:outline-none"
                />
            </div>

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 min-h-[300px] animate-pulse"
                        >
                            <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
                            <div className="h-14 w-full bg-white rounded mb-2" />
                            <div className="h-14 w-full bg-white rounded" />
                        </div>
                    ))}
                </div>
            )}

            {!loading && repColumns.length === 0 && (
                <div className="border border-dashed border-[#CBD5E1] rounded-xl py-12 text-center mb-5">
                    <p className="text-base font-medium text-[#1C2C56]">
                        {t("noData")}
                    </p>
                    <p className="text-sm text-[#64748B] mt-1">
                        {t("noDataSubtitle")}
                    </p>
                </div>
            )}

            {/* Drag Board */}
            {!loading && columns.length > 0 && (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                        {columns.map((col) => (
                            <Droppable droppableId={col.id} key={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`border rounded-xl p-3 min-h-[500px] transition-colors ${
                                            snapshot.isDraggingOver
                                                ? "bg-blue-50 border-blue-300"
                                                : "bg-[#F8FAFC] border-[#E2E8F0]"
                                        }`}
                                    >
                                        {/* Column Header */}
                                        <h3 className="text-sm font-semibold text-[#1C2C56] mb-3 flex items-center justify-between gap-2">
                                            <span className="flex items-center gap-1.5 truncate">
                                                {col.sales_rep_id && (
                                                    <FiUser
                                                        size={14}
                                                        className="text-[#64748B] flex-shrink-0"
                                                    />
                                                )}
                                                <span className="truncate">
                                                    {col.title}
                                                </span>
                                            </span>
                                            <span className="bg-[#E2E8F0] text-[#1C2C56] text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                                                {col.accounts.length}
                                            </span>
                                        </h3>

                                        {/* Cards */}
                                        {col.accounts.map((item, index) => (
                                            <Draggable
                                                draggableId={String(item.id)}
                                                index={index}
                                                key={item.id}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className="bg-white border border-[#E2E8F0] rounded-lg p-3 mb-2 shadow-sm hover:bg-[#F1F5F9] transition flex items-center justify-between"
                                                    >
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
                                                            <FiGrid
                                                                className="text-[#94A3B8]"
                                                                size={18}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}

                                        {col.accounts.length === 0 && (
                                            <p className="text-xs text-[#94A3B8] text-center mt-6">
                                                Drop accounts here
                                            </p>
                                        )}

                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>
            )}

            {addOpen && (
                <AddRepModal
                    accessToken={accessToken}
                    onClose={() => setAddOpen(false)}
                    onCreated={() => {
                        setAddOpen(false);
                        // Refetch so the new rep shows up as a column immediately.
                        fetchBoard();
                    }}
                />
            )}
        </div>
    );
};

export default Assignments;
