"use client";

import { useEffect, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";
import { FiEye, FiEyeOff } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiCreateB2BAccount, apiUpdateB2BAccount } from "@/services/B2BAccountService";

const tierOptions = [
    { value: "gold", label: "Gold" },
    { value: "silver", label: "Silver" },
    { value: "bronze", label: "Bronze" },
];

const selectStyles = {
    control: (base) => ({
        ...base,
        borderRadius: "6px",
        borderColor: "#CBD5E1",
        minHeight: "38px",
        boxShadow: "none",
        "&:hover": { borderColor: "#1C2C56" },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const AddEditB2BAccountModal = ({
    isOpen,
    onClose,
    mode = "add",
    initialData,
    onSaveSuccess,
}) => {
    const { session } = useCurrentSession();
    const accessToken = session?.user?.accessToken;

    const [name, setName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [tier, setTier] = useState(null);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Save state
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        if (mode === "edit" && initialData) {
            setName(initialData.name || "");
            setCompanyName(initialData.company_name || "");
            setEmail(initialData.email || "");
            setMobile(initialData.mobile || "");
            setTier(tierOptions.find((t) => t.value === initialData.tier) || null);
            setPassword("");
        } else {
            setName("");
            setCompanyName("");
            setEmail("");
            setMobile("");
            setTier(null);
            setPassword("");
        }
        setShowPassword(false);
        setError("");
    }, [mode, initialData, isOpen]);

    const handleSave = async () => {
        if (!name.trim()) {
            setError("Name is required");
            return;
        }
        if (!email.trim()) {
            setError("Email is required");
            return;
        }
        if (mode === "add" && !password.trim()) {
            setError("Password is required for new accounts");
            return;
        }

        setError("");
        setSaving(true);

        try {
            const payload = {
                name: name.trim(),
                company_name: companyName.trim(),
                email: email.trim(),
                mobile: mobile.trim(),
                tier: tier?.value || "",
            };

            // Only include password if provided
            if (password.trim()) {
                payload.password = password.trim();
            }

            if (mode === "edit" && initialData?.id) {
                await apiUpdateB2BAccount(accessToken, initialData.id, payload);
            } else {
                await apiCreateB2BAccount(accessToken, payload);
            }

            if (onSaveSuccess) {
                onSaveSuccess();
            }
        } catch (err) {
            console.error("B2B account save error:", err);
            setError(err?.response?.data?.message || "Failed to save account. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            className="w-full md:min-w-[520px] mx-auto"
        >
            <div className="flex flex-col">

                {/* Header */}
                <div className="border-b p-3 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-[#1C2C56]">
                        {mode === "edit" ? "Edit Account" : "Add New Account"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        ✕
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
                        {error}
                    </div>
                )}

                {/* Body */}
                <div className="px-5 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                    {/* Name */}
                    <div>
                        <label className="text-[#1C2C56] text-sm font-medium">
                            Name<span className="text-red-500">*</span>
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                        />
                    </div>

                    {/* Company Name */}
                    <div>
                        <label className="text-[#1C2C56] text-sm font-medium">
                            Company Name
                        </label>
                        <input
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g. HP Pvt Ltd"
                            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                        />
                    </div>

                    {/* Email + Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[#1C2C56] text-sm font-medium">
                                Email<span className="text-red-500">*</span>
                            </label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                                className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                            />
                        </div>

                        <div>
                            <label className="text-[#1C2C56] text-sm font-medium">Mobile</label>
                            <input
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="9763880909"
                                className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                            />
                        </div>
                    </div>

                    {/* Tier Select */}
                    <div>
                        <label className="text-[#1C2C56] text-sm font-medium">Tier</label>
                        <Select
                            value={tier}
                            onChange={setTier}
                            options={tierOptions}
                            placeholder="Select Tier"
                            styles={selectStyles}
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                            className="mt-1"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-[#1C2C56] text-sm font-medium">
                            Password{mode === "add" && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative mt-1">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={mode === "edit" ? "Leave blank to keep current" : "Enter password"}
                                className="w-full border rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1C2C56]"
                            >
                                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                        </div>
                        {mode === "edit" && (
                            <p className="text-xs text-[#94A3B8] mt-1">Leave blank to keep the current password</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t px-6 py-4 flex justify-end sm:flex-row flex-col gap-3">
                    <Button variant="plain" onClick={onClose} size="sm" disabled={saving}>
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        size="sm"
                        className="bg-[#1C4FA8] px-6 hover:bg-[#1C2C56] text-white py-2 rounded-md"
                        onClick={handleSave}
                        loading={saving}
                    >
                        {/* {mode === "edit" ? "Update" : "Save"} */}
                        {mode === "edit" ? "Update" : "Create Account"}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default AddEditB2BAccountModal;
