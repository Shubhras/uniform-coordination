"use client";

import { useState, useEffect, useCallback } from "react";
import { FiUsers, FiCheckCircle, FiXCircle } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetSpecialConditionList, apiUpdateSpecialCondition } from "@/services/SpecialConditionService";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";

/* ---------- EDIT MODAL ---------- */
const EditConditionModal = ({ isOpen, onClose, data, onSaveSuccess, accessToken }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [discountPercentage, setDiscountPercentage] = useState("");
    const [prioritySupport, setPrioritySupport] = useState(false);
    const [net30Terms, setNet30Terms] = useState(false);
    const [freeSamples, setFreeSamples] = useState(false);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen || !data) return;

        setTitle(data.title || "");
        setDescription(data.description || "");
        setDiscountPercentage(data.discount_percentage || "");
        setPrioritySupport(data.priority_support ?? false);
        setNet30Terms(data.net_30_terms ?? false);
        setFreeSamples(data.free_samples ?? false);
        setError("");
    }, [isOpen, data]);

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
                description: description.trim(),
                discount_percentage: discountPercentage,
                priority_support: prioritySupport,
                net_30_terms: net30Terms,
                free_samples: freeSamples,
            };

            await apiUpdateSpecialCondition(accessToken, data.id, payload);

            if (onSaveSuccess) onSaveSuccess();
        } catch (err) {
            console.error("Update failed:", err);
            setError(err?.response?.data?.message || "Failed to update. Please try again.");
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
                        Edit Conditions
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
                            placeholder="Condition title"
                            className="mt-1 w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
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

                <div className="border-t px-6 py-4 flex justify-end gap-3">
                    <Button variant="plain" size="sm" onClick={onClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        size="sm"
                        className="bg-[#1C2C56] text-white px-6"
                        onClick={handleSave}
                        loading={saving}
                    >
                        Update
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

    // Edit modal
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

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
    const handleEdit = (card) => {
        setEditData(card);
        setEditModalOpen(true);
    };

    const handleSaveSuccess = () => {
        setEditModalOpen(false);
        setEditData(null);
        fetchConditions();
    };

    /* ---------- BUILD FEATURES LIST ---------- */
    const getFeatures = (card) => {
        const features = [];

        features.push({
            label: "Priority Support",
            enabled: card.priority_support,
        });
        features.push({
            label: "Net 30 Terms",
            enabled: card.net_30_terms,
        });
        features.push({
            label: "Free Samples",
            enabled: card.free_samples,
        });

        return features;
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
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-[#1C2C56]">
                        Special Conditions
                    </h2>
                    <p className="text-base text-[#486284]">
                        Manage discount tiers and corporate rules
                    </p>
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
                                        {parseFloat(card.discount_percentage).toFixed(0)}%
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

                                    {/* Button */}
                                    <button
                                        onClick={() => handleEdit(card)}
                                        className="mt-auto bg-[#0B3C66] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#083255] transition"
                                    >
                                        Edit Conditions
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <EditConditionModal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setEditData(null);
                }}
                data={editData}
                onSaveSuccess={handleSaveSuccess}
                accessToken={accessToken}
            />
        </>
    );
};

export default SpecialConditions;
