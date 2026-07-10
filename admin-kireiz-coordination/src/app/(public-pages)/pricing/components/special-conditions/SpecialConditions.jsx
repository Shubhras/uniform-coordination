"use client";

import { useState, useEffect, useCallback } from "react";
import { FiUsers, FiCheckCircle, FiXCircle, FiPlus, FiTrash2 } from "react-icons/fi";
import Select from "react-select";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import {
    apiGetSpecialConditionList,
    apiCreateSpecialCondition,
    apiUpdateSpecialCondition,
    apiDeleteSpecialCondition,
} from "@/services/SpecialConditionService";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

/* ---------- CONDITION TYPE OPTIONS ---------- */
const conditionTypeOptions = [
    { value: "corporate", label: "Corporate Standard" },
    { value: "wholesale", label: "Wholesale Partner" },
    { value: "enterprise", label: "Global Enterprise" },
];

const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: "42px",
        borderRadius: "8px",
        borderColor: state.isFocused ? "#1C2C56" : "#CBD5E1",
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
        color: state.isSelected ? "white" : "#1E293B",
        fontSize: "14px",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

/* ---------- ADD/EDIT MODAL ---------- */
const AddEditConditionModal = ({ isOpen, onClose, mode = "add", initialData, onSaveSuccess, accessToken }) => {
    const [title, setTitle] = useState("");
    const [conditionType, setConditionType] = useState(null);
    const [description, setDescription] = useState("");
    const [discountPercentage, setDiscountPercentage] = useState("");
    const [prioritySupport, setPrioritySupport] = useState(false);
    const [net30Terms, setNet30Terms] = useState(false);
    const [freeSamples, setFreeSamples] = useState(false);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        if (mode === "edit" && initialData) {
            setTitle(initialData.title || "");
            setDescription(initialData.description || "");
            setDiscountPercentage(initialData.discount_percentage || "");
            setPrioritySupport(initialData.priority_support ?? false);
            setNet30Terms(initialData.net_30_terms ?? false);
            setFreeSamples(initialData.free_samples ?? false);

            const typeMatch = conditionTypeOptions.find(
                (o) => o.value === initialData.condition_type
            );
            setConditionType(typeMatch || null);
        } else {
            setTitle("");
            setConditionType(null);
            setDescription("");
            setDiscountPercentage("");
            setPrioritySupport(false);
            setNet30Terms(false);
            setFreeSamples(false);
        }
        setError("");
    }, [isOpen, mode, initialData]);

    const handleSave = async () => {
        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        setError("");
        setSaving(true);

        try {
            const payload = {
                title: title.trim(),
                condition_type: conditionType?.value || "",
                description: description.trim(),
                discount_percentage: parseFloat(discountPercentage || 0),
                priority_support: prioritySupport,
                net_30_terms: net30Terms,
                free_samples: freeSamples,
            };

            if (mode === "edit" && initialData?.id) {
                await apiUpdateSpecialCondition(accessToken, initialData.id, payload);
            } else {
                await apiCreateSpecialCondition(accessToken, payload);
            }

            if (onSaveSuccess) onSaveSuccess();
        } catch (err) {
            console.error("Save failed:", err);
            setError(err?.response?.data?.message || "Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            className="w-full md:min-w-[560px] mx-auto"
        >
            <div className="flex flex-col">
                <div className="border-b px-6 py-4">
                    <h2 className="text-2xl font-semibold text-[#1C2C56]">
                        {mode === "edit" ? "Edit Condition" : "Add Condition"}
                    </h2>
                </div>

                {error && (
                    <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
                        {error}
                    </div>
                )}

                <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                    {/* Title */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Title<span className="text-red-500">*</span>
                        </label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Wholesale Partner"
                            className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                        />
                    </div>

                    {/* Condition Type (React Select) */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Condition Type
                        </label>
                        <Select
                            options={conditionTypeOptions}
                            value={conditionType}
                            onChange={setConditionType}
                            styles={selectStyles}
                            placeholder="Select condition type..."
                            isClearable
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                            menuPosition="fixed"
                            className="mt-1"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the condition..."
                            rows={3}
                            className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                        />
                    </div>

                    {/* Discount Percentage */}
                    <div>
                        <label className="text-base font-medium text-[#1C2C56]">
                            Discount Percentage
                        </label>
                        <input
                            type="number"
                            value={discountPercentage}
                            onChange={(e) => setDiscountPercentage(e.target.value)}
                            placeholder="e.g. 15.00"
                            min="0"
                            max="100"
                            step="0.01"
                            className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                        />
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3">
                        <label className="text-base font-medium text-[#1C2C56]">Features</label>

                        <div className="flex items-center justify-between bg-[#F8FAFC] rounded-lg px-4 py-3">
                            <span className="text-sm text-[#486284]">Priority Support</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={prioritySupport}
                                    onChange={(e) => setPrioritySupport(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#1C2C56] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                            </label>
                        </div>

                        <div className="flex items-center justify-between bg-[#F8FAFC] rounded-lg px-4 py-3">
                            <span className="text-sm text-[#486284]">Net 30 Terms</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={net30Terms}
                                    onChange={(e) => setNet30Terms(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#1C2C56] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                            </label>
                        </div>

                        <div className="flex items-center justify-between bg-[#F8FAFC] rounded-lg px-4 py-3">
                            <span className="text-sm text-[#486284]">Free Samples</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={freeSamples}
                                    onChange={(e) => setFreeSamples(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#1C2C56] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer — Fabric pattern */}
                <div className="border-t px-6 py-4 flex justify-end sm:flex-row flex-col gap-3">
                    <Button variant="plain" onClick={onClose} size="sm" disabled={saving}>
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        size="sm"
                        className="bg-[#1C2C56] px-6 hover:bg-[#1C2C56] text-white py-2 rounded-md"
                        onClick={handleSave}
                        loading={saving}
                    >
                        {mode === "edit" ? "Update" : "Save"}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

/* ---------- MAIN COMPONENT ---------- */
const SpecialConditions = () => {
    const { session } = useCurrentSession();
    const accessToken = session?.user?.accessToken;

    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add/Edit modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [editData, setEditData] = useState(null);

    // Delete
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    /* ---------- FETCH ---------- */
    const fetchConditions = useCallback(async () => {
        if (!accessToken) return;

        try {
            setLoading(true);
            const response = await apiGetSpecialConditionList(accessToken);

            if (response?.status && response?.data) {
                setCards(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch special conditions:", error);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        fetchConditions();
    }, [fetchConditions]);

    /* ---------- HANDLERS ---------- */
    const handleAdd = () => {
        setEditData(null);
        setModalMode("add");
        setModalOpen(true);
    };

    const handleEdit = (card) => {
        setEditData(card);
        setModalMode("edit");
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditData(null);
    };

    const handleSaveSuccess = () => {
        handleCloseModal();
        fetchConditions();
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete || !accessToken) return;

        try {
            setDeleteLoading(true);
            await apiDeleteSpecialCondition(accessToken, itemToDelete.id);
            setDeleteDialogOpen(false);
            setItemToDelete(null);
            fetchConditions();
        } catch (error) {
            console.error("Failed to delete condition:", error);
        } finally {
            setDeleteLoading(false);
        }
    };

    /* ---------- BUILD FEATURES LIST ---------- */
    const getFeatures = (card) => {
        return [
            { label: "Priority Support", enabled: card.priority_support },
            { label: "Net 30 Terms", enabled: card.net_30_terms },
            { label: "Free Samples", enabled: card.free_samples },
        ];
    };

    /* ---------- SKELETON ---------- */
    const CardSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-4" />
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                    <div className="h-3 bg-gray-100 rounded w-3/4 mb-4" />
                    <div className="h-8 bg-gray-200 rounded w-20 mb-4" />
                    <div className="space-y-2 mb-6">
                        <div className="h-3 bg-gray-100 rounded w-28" />
                        <div className="h-3 bg-gray-100 rounded w-24" />
                        <div className="h-3 bg-gray-100 rounded w-24" />
                    </div>
                    <div className="h-10 bg-gray-200 rounded-lg" />
                </div>
            ))}
        </div>
    );

    return (
        <>
            <div className="bg-[#F4F7FC] rounded-xl shadow md:p-6 p-4">
                {/* Header */}
                <div className="flex justify-between sm:flex-row flex-col items-start gap-3 mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-[#1C2C56]">
                            Special Conditions
                        </h2>
                        <p className="text-base text-[#486284]">
                            Manage discount tiers and corporate rules
                        </p>
                    </div>

                    <button
                        className="bg-[#1C2C56] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                        onClick={handleAdd}
                    >
                        <FiPlus size={16} />
                        Add Condition
                    </button>
                </div>

                {/* Cards */}
                {loading ? (
                    <CardSkeleton />
                ) : cards.length === 0 ? (
                    <div className="text-center py-16 text-[#94A3B8]">No special conditions found</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {cards.map((card) => {
                            const features = getFeatures(card);

                            return (
                                <div
                                    key={card.id}
                                    className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col"
                                >
                                    {/* Icon */}
                                    <div className="w-12 h-12 bg-[#EEF2F7] rounded-full flex items-center justify-center mb-4">
                                        <FiUsers className="text-[#1C2C56]" size={22} />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-semibold text-[#1C2C56] mb-2">
                                        {card.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-[#64748B] mb-4">
                                        {card.description}
                                    </p>

                                    {/* Discount */}
                                    <div className="text-3xl font-bold text-[#E47A1C] mb-4">
                                        {parseFloat(card.discount_percentage || 0).toFixed(0)}%
                                        <span className="text-sm font-medium text-[#64748B] ml-1">
                                            OFF
                                        </span>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-2 mb-6">
                                        {features.map((f, i) => (
                                            <li
                                                key={i}
                                                className="flex items-center gap-2 text-sm text-[#486284]"
                                            >
                                                {f.enabled ? (
                                                    <FiCheckCircle className="text-green-500" size={16} />
                                                ) : (
                                                    <FiXCircle className="text-[#CBD5E1]" size={16} />
                                                )}
                                                {f.label}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Edit + Delete Buttons */}
                                    <div className="mt-auto flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(card)}
                                            className="flex-1 bg-[#0B3C66] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#083255] transition"
                                        >
                                            Edit Conditions
                                        </button>
                                        <button
                                            onClick={() => {
                                                setItemToDelete(card);
                                                setDeleteDialogOpen(true);
                                            }}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AddEditConditionModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                mode={modalMode}
                initialData={editData}
                onSaveSuccess={handleSaveSuccess}
                accessToken={accessToken}
            />

            {/* Delete Confirmation */}
            <DeleteConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setItemToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Condition"
                message="Are you sure you want to delete this special condition? This action cannot be undone."
                itemName={itemToDelete?.title}
                loading={deleteLoading}
            />
        </>
    );
};

export default SpecialConditions;
