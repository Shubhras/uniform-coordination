import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FiSearch, FiUserPlus, FiMail, FiX, FiEdit2, FiTrash2 } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import {
    apiGetSalesReps,
    apiGetSalesRepProfile,
    apiDeleteSalesRep,
} from "@/services/SalesRepService";
import AddRepModal from "./AddRepModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import ComposeEmailModal from "../ComposeEmailModal";

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
    const t = useTranslations("customerSalesRep.salesRepresentation");
    const tStatus = useTranslations("customerSalesRep.statusFilter");
    const { session } = useCurrentSession();
    const accessToken = session?.user?.accessToken;

    const [reps, setReps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [addOpen, setAddOpen] = useState(false);
    const [editRep, setEditRep] = useState(null);
    const [deleteRep, setDeleteRep] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [profile, setProfile] = useState(null);

    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [emailRecipient, setEmailRecipient] = useState({ email: "", name: "" });

    const handleOpenComposeEmail = (email, name) => {
        setEmailRecipient({ email: email || "", name: name || "" });
        setEmailModalOpen(true);
    };

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
            const response = await apiGetSalesReps(accessToken, debouncedSearch);
            if (response?.status && Array.isArray(response.data)) {
                setReps(response.data);
            } else if (Array.isArray(response)) {
                setReps(response);
            }
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

    const handleDeleteRep = async () => {
        if (!deleteRep) return;
        try {
            setDeleting(true);
            const res = await apiDeleteSalesRep(accessToken, deleteRep.id);
            if (res?.status) {
                notify("Success", "success", "Sales representative deleted successfully.");
                setDeleteRep(null);
                fetchReps();
            } else {
                notify("Error", "danger", res?.message || "Failed to delete representative.");
            }
        } catch (err) {
            console.error("Delete rep error:", err);
            notify("Error", "danger", err?.response?.data?.message || "Failed to delete representative.");
        } finally {
            setDeleting(false);
        }
    };

    const openProfile = async (rep) => {
        try {
            const data = await apiGetSalesRepProfile(accessToken, rep.id);
            setProfile(data?.data || data || rep);
        } catch (error) {
            console.error("Failed to fetch rep profile:", error);
            setProfile(rep);
        }
    };

    return (
        <div className="bg-white md:p-6 p-3 rounded-xl shadow border border-gray-200">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-[#1C2C56]">
                        {t("title")}
                    </h1>
                    <p className="text-[#486284] text-sm">
                        {t("subtitle")}
                    </p>
                </div>

                <button
                    onClick={() => setAddOpen(true)}
                    className="flex items-center gap-2 bg-[#1C4FA8] text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                    <FiUserPlus />
                    {t("addRepresentative")}
                </button>
            </div>

            {/* Search */}
            <div className="relative w-72 mb-6">
                <FiSearch className="absolute left-3 top-2.5 text-gray-500" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("searchPlaceholder")}
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
                            : t("noData")}
                    </p>
                    <p className="text-sm text-[#64748B] mt-1">
                        {debouncedSearch
                            ? "Try a different name or email."
                            : t("noDataSubtitle")}
                    </p>
                </div>
            )}

            {/* Cards Grid */}
            {!loading && reps.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {reps.map((rep) => (
                        <div
                            key={rep.id}
                            className="bg-[#F5F7FB] border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition overflow-hidden"
                        >
                            {/* Top */}
                            <div className="flex items-start justify-between gap-2.5 mb-4">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-semibold text-gray-700 shrink-0">
                                        {rep.initials}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3
                                            className="font-semibold text-[#1C2C56] truncate"
                                            title={rep.name}
                                        >
                                            {rep.name}
                                        </h3>
                                        <p
                                            className="text-sm text-gray-500 truncate"
                                            title={rep.designation}
                                        >
                                            {rep.designation}
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap self-start ${rep.is_active
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-200 text-gray-600"
                                        }`}
                                >
                                    {rep.is_active ? tStatus("active") : tStatus("inactive")}
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="bg-white p-3 rounded-lg shadow text-center">
                                    <p className="text-sm font-semibold">
                                        {rep.clients}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {t("clients")}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow text-center">
                                    <p className="text-sm font-semibold">
                                        {money(rep.revenue)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {t("revenue")}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow text-center">
                                    <p className="text-sm font-semibold">
                                        {rep.win_rate}%
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {t("winRate")}
                                    </p>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openProfile(rep)}
                                    className="flex-1 bg-[#1C4FA8] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#153e85] transition"
                                >
                                    {t("viewProfile")}
                                </button>
                                <button
                                    onClick={() => setEditRep(rep)}
                                    title={`Edit ${rep.name}`}
                                    className="p-2 border border-gray-300 rounded-lg text-[#1C2C56] hover:bg-gray-100 transition"
                                >
                                    <FiEdit2 size={16} />
                                </button>
                                <button
                                    onClick={() => setDeleteRep(rep)}
                                    title={`Delete ${rep.name}`}
                                    className="p-2 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleOpenComposeEmail(rep.email, rep.name)}
                                    title={`Email ${rep.email}`}
                                    className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[#1C4FA8] transition"
                                >
                                    <FiMail size={16} />
                                </button>
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

            {editRep && (
                <AddRepModal
                    accessToken={accessToken}
                    initialData={editRep}
                    onClose={() => setEditRep(null)}
                    onCreated={() => {
                        setEditRep(null);
                        fetchReps();
                    }}
                />
            )}

            <DeleteConfirmDialog
                isOpen={Boolean(deleteRep)}
                onClose={() => setDeleteRep(null)}
                onConfirm={handleDeleteRep}
                loading={deleting}
                title="Delete Sales Representative"
                message={`Are you sure you want to delete ${deleteRep?.name || "this representative"}? This action cannot be undone.`}
            />

            {profile && (
                <ProfileModal
                    profile={profile}
                    onClose={() => setProfile(null)}
                    onSendEmail={(email, name) => {
                        setProfile(null);
                        handleOpenComposeEmail(email, name);
                    }}
                />
            )}

            <ComposeEmailModal
                isOpen={emailModalOpen}
                onClose={() => {
                    setEmailModalOpen(false);
                    setEmailRecipient({ email: "", name: "" });
                }}
                recipientEmail={emailRecipient.email}
                recipientName={emailRecipient.name}
            />
        </div>
    );
};

/* ---------- View Profile ---------- */
const ProfileModal = ({ profile, onClose, onSendEmail }) => {
    const t = useTranslations("customerSalesRep.salesRepresentation.viewProfileModal");

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-semibold text-gray-700 shrink-0">
                            {profile.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold text-[#1C2C56] truncate" title={profile.name}>
                                {profile.name}
                            </h3>
                            <p className="text-sm text-gray-500 truncate" title={profile.designation}>
                                {profile.designation}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        title={t("close")}
                        aria-label={t("close")}
                        className="text-gray-400 hover:text-gray-600 shrink-0"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                    <Stat label={t("clients")} value={profile.clients} />
                    <Stat label={t("revenue")} value={money(profile.revenue)} />
                    <Stat label={t("winRate")} value={`${profile.win_rate}%`} />
                </div>

                <dl className="text-sm space-y-2 mb-5">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            <dt className="text-gray-500 w-24">{t("email")}:</dt>
                            <dd className="text-[#1C2C56] font-medium">{profile.email}</dd>
                        </div>
                        {profile.email && onSendEmail && (
                            <button
                                type="button"
                                onClick={() => onSendEmail(profile.email, profile.name)}
                                title={t("sendEmailTitle", { email: profile.email })}
                                className="text-[#1C4FA8] hover:text-[#153e85] text-xs flex items-center gap-1 font-medium bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition"
                            >
                                <FiMail size={12} />
                                {t("compose")}
                            </button>
                        )}
                    </div>
                    <Row label={t("mobile")} value={profile.mobile || "—"} />
                    <Row
                        label={t("quotations")}
                        value={t("quotationsRatio", {
                            won: profile.won_quotations,
                            assigned: profile.assigned_quotations,
                        })}
                    />
                </dl>

                <section className="mb-5">
                    <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                        {t("assignedAccounts")} ({profile.accounts?.length || 0})
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
                        <p className="text-sm text-gray-400">{t("noAccounts")}</p>
                    )}
                </section>

                <section>
                    <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                        {t("recentQuotations")}
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
                        <p className="text-sm text-gray-400">{t("noQuotations")}</p>
                    )}
                </section>
            </div>
        </div>
    );
};

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
