"use client";

import { useCallback, useEffect, useState } from "react";
import { FiSearch, FiUserPlus, FiMail, FiX } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
    apiGetSalesReps,
    apiGetSalesRepProfile,
} from "@/services/SalesRepService";
import AddRepModal from "./AddRepModal";

const money = (value) =>
    `$${Number(value || 0).toLocaleString(undefined, {
        maximumFractionDigits: 0,
    })}`;

const notify = (title, type, message) =>
    toast.push(
        <Notification title={title} type={type}>
            {message}
        </Notification>,
    );

const SalesRepresentation = () => {
    const { session } = useCurrentSession();
    const accessToken = session?.user?.accessToken;

    const [reps, setReps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [addOpen, setAddOpen] = useState(false);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchReps = useCallback(async () => {
        if (!accessToken) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await apiGetSalesReps(accessToken, debouncedSearch);
            if (res?.status) setReps(res.data || []);
        } catch (error) {
            console.error("Failed to load sales reps:", error);
            notify("Error", "danger", "Could not load sales representatives");
        } finally {
            setLoading(false);
        }
    }, [accessToken, debouncedSearch]);

    useEffect(() => {
        fetchReps();
    }, [fetchReps]);

    const openProfile = async (rep) => {
        try {
            const res = await apiGetSalesRepProfile(accessToken, rep.id);
            if (res?.status) setProfile(res.data);
        } catch (error) {
            console.error("Failed to load profile:", error);
            notify("Error", "danger", "Could not load the profile");
        }
    };

    return (
        <div className="bg-white md:p-6 p-3 rounded-xl shadow border border-gray-200">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-[#1C2C56]">
                        Sales Team Performance
                    </h1>
                    <p className="text-[#486284] text-sm">
                        Track clients, revenue and win rate per representative
                    </p>
                </div>

                <button
                    onClick={() => setAddOpen(true)}
                    className="flex items-center gap-2 bg-[#1C4FA8] text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                    <FiUserPlus />
                    Add Representative
                </button>
            </div>

            {/* Search */}
            <div className="relative w-72 mb-6">
                <FiSearch className="absolute left-3 top-2.5 text-gray-500" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-9 pr-3 py-2 border border-[#00345F] rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="bg-[#F5F7FB] border border-gray-200 rounded-xl p-5 animate-pulse"
                        >
                            <div className="h-12 w-12 bg-gray-200 rounded-full" />
                            <div className="h-4 w-32 bg-gray-200 rounded mt-4" />
                            <div className="h-16 w-full bg-gray-100 rounded mt-4" />
                        </div>
                    ))}
                </div>
            )}

            {!loading && reps.length === 0 && (
                <div className="border border-dashed border-[#CBD5E1] rounded-xl py-12 text-center">
                    <p className="text-base font-medium text-[#1C2C56]">
                        {debouncedSearch
                            ? "No representatives match that search"
                            : "No sales representatives yet"}
                    </p>
                    <p className="text-sm text-[#64748B] mt-1">
                        {debouncedSearch
                            ? "Try a different name or email."
                            : 'Use "Add Representative" to create the first one.'}
                    </p>
                </div>
            )}

            {/* Cards Grid */}
            {!loading && reps.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {reps.map((rep) => (
                        <div
                            key={rep.id}
                            className="bg-[#F5F7FB] border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                        >
                            {/* Top */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-semibold text-gray-700">
                                        {rep.initials}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#1C2C56]">
                                            {rep.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {rep.designation}
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        rep.is_active
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-200 text-gray-600"
                                    }`}
                                >
                                    {rep.is_active ? "Active" : "Inactive"}
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="bg-white p-3 rounded-lg shadow text-center">
                                    <p className="text-sm font-semibold">
                                        {rep.clients}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Clients
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow text-center">
                                    <p className="text-sm font-semibold">
                                        {money(rep.revenue)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Revenue
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow text-center">
                                    <p className="text-sm font-semibold">
                                        {rep.win_rate}%
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Win Rate
                                    </p>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openProfile(rep)}
                                    className="flex-1 bg-[#1C4FA8] text-white py-2 rounded-lg text-sm font-medium transition"
                                >
                                    View Profile
                                </button>
                                <a
                                    href={`mailto:${rep.email}`}
                                    title={`Email ${rep.email}`}
                                    className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
                                >
                                    <FiMail />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {addOpen && (
                <AddRepModal
                    accessToken={accessToken}
                    onClose={() => setAddOpen(false)}
                    onCreated={() => {
                        setAddOpen(false);
                        fetchReps();
                    }}
                />
            )}

            {profile && (
                <ProfileModal
                    profile={profile}
                    onClose={() => setProfile(null)}
                />
            )}
        </div>
    );
};

/* ---------- View Profile ---------- */
const ProfileModal = ({ profile, onClose }) => (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-semibold text-gray-700">
                        {profile.initials}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[#1C2C56]">
                            {profile.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {profile.designation}
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <FiX size={20} />
                </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
                <Stat label="Clients" value={profile.clients} />
                <Stat label="Revenue" value={money(profile.revenue)} />
                <Stat label="Win Rate" value={`${profile.win_rate}%`} />
            </div>

            <dl className="text-sm space-y-1 mb-5">
                <Row label="Email" value={profile.email} />
                <Row label="Mobile" value={profile.mobile || "—"} />
                <Row
                    label="Quotations"
                    value={`${profile.won_quotations} won of ${profile.assigned_quotations} assigned`}
                />
            </dl>

            <section className="mb-5">
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                    Assigned Accounts ({profile.accounts?.length || 0})
                </p>
                {profile.accounts?.length ? (
                    <ul className="space-y-1">
                        {profile.accounts.map((a) => (
                            <li
                                key={a.id}
                                className="flex items-center justify-between text-sm border border-[#E2E8F0] rounded-lg px-3 py-2"
                            >
                                <span className="text-[#1C2C56]">{a.name}</span>
                                <span className="text-xs bg-[#F1F5F9] text-[#486284] px-2 py-0.5 rounded">
                                    {a.tier}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-400">No accounts assigned yet.</p>
                )}
            </section>

            <section>
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                    Recent Quotations
                </p>
                {profile.recent_quotations?.length ? (
                    <ul className="space-y-1">
                        {profile.recent_quotations.map((q) => (
                            <li
                                key={q.quotation_id}
                                className="flex items-center justify-between text-sm border border-[#E2E8F0] rounded-lg px-3 py-2"
                            >
                                <span className="text-[#1C2C56]">
                                    {q.company || q.quotation_id}
                                </span>
                                <span className="text-xs text-[#64748B]">
                                    {q.status} · {q.date}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-400">No quotations yet.</p>
                )}
            </section>
        </div>
    </div>
);

const Stat = ({ label, value }) => (
    <div className="bg-[#F5F7FB] p-3 rounded-lg text-center">
        <p className="text-sm font-semibold text-[#1C2C56]">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
    </div>
);

const Row = ({ label, value }) => (
    <div className="flex gap-2">
        <dt className="text-gray-500 w-24">{label}:</dt>
        <dd className="text-[#1C2C56] font-medium">{value}</dd>
    </div>
);

export default SalesRepresentation;
