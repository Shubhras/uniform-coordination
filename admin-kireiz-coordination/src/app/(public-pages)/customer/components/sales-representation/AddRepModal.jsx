"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { apiCreateSalesRep } from "@/services/SalesRepService";

// Shared by the Sales Representation and Assignments tabs — both have an
// "Add Representative" button in the design.
// Note: no Figma design exists for this modal, so it follows the surrounding
// admin form styling.

// maxLength mirrors the DB column widths — MySQL errors on overflow rather than
// truncating, so it's better to stop it at the input.
const FIELDS = [
    { name: "name", label: "Full Name", type: "text", maxLength: 255 },
    { name: "email", label: "Email", type: "email", maxLength: 254 },
    {
        name: "mobile",
        label: "Mobile (optional)",
        type: "tel",
        maxLength: 15,
        autoComplete: "off",
    },
    { name: "designation", label: "Designation", type: "text", maxLength: 100 },
    { name: "password", label: "Password", type: "password" },
];

const notify = (title, type, message) =>
    toast.push(
        <Notification title={title} type={type}>
            {message}
        </Notification>,
    );

const AddRepModal = ({ accessToken, onClose, onCreated }) => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        mobile: "",
        designation: "Sales Representative",
        password: "",
    });
    const [saving, setSaving] = useState(false);

    const change = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const submit = async () => {
        if (!form.name.trim() || !form.email.trim() || !form.password) {
            notify("Required", "warning", "Name, email and password are required");
            return;
        }

        try {
            setSaving(true);
            const res = await apiCreateSalesRep(accessToken, form);
            if (res?.status) {
                notify("Success", "success", "Representative added");
                onCreated?.();
            } else {
                notify(
                    "Error",
                    "danger",
                    res?.message || "Could not add representative",
                );
            }
        } catch (error) {
            console.error("Failed to create rep:", error);
            notify(
                "Error",
                "danger",
                error?.response?.data?.message ||
                    "Could not add representative",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                <div className="flex items-start justify-between mb-5">
                    <h3 className="text-lg font-semibold text-[#1C2C56]">
                        Add Representative
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <div className="space-y-3">
                    {FIELDS.map((field) => (
                        <div key={field.name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {field.label}
                            </label>
                            <input
                                type={field.type}
                                name={field.name}
                                value={form[field.name]}
                                onChange={change}
                                maxLength={field.maxLength}
                                autoComplete={field.autoComplete}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg text-sm bg-[#1C4FA8] text-white disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Add Representative"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddRepModal;
