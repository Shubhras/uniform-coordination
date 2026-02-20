"use client";

import { useEffect, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Select from "react-select";

const tierOptions = [
    { value: "Gold", label: "Gold" },
    { value: "Silver", label: "Silver" },
    { value: "Bronze", label: "Bronze" },
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
}) => {
    const [company, setCompany] = useState("");
    const [person, setPerson] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [tier, setTier] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        if (mode === "edit" && initialData) {
            setCompany(initialData.company || "");
            setPerson(initialData.person || "");
            setEmail(initialData.email || "");
            setPhone(initialData.phone || "");
            setTier(tierOptions.find((t) => t.value === initialData.tier) || null);
        } else {
            setCompany("");
            setPerson("");
            setEmail("");
            setPhone("");
            setTier(null);
        }
    }, [mode, initialData, isOpen]);

    const handleSave = () => {
        const payload = {
            company,
            person,
            email,
            phone,
            tier: tier?.value,
        };

        if (mode === "edit") {
            console.log("EDIT ACCOUNT:", payload);
        } else {
            console.log("ADD ACCOUNT:", payload);
        }

        onClose();
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

                {/* Body */}
                <div className="px-5 py-5 space-y-4">

                    {/* Company Name */}
                    <div>
                        <label className="text-[#1C2C56] text-sm font-medium">
                            Company Name
                        </label>
                        <input
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="e.g. Acme Corp"
                            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                        />
                    </div>

                    {/* Contact Person */}
                    <div>
                        <label className="text-[#1C2C56] text-sm font-medium">
                            Contact Person
                        </label>
                        <input
                            value={person}
                            onChange={(e) => setPerson(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                        />
                    </div>

                    {/* Email + Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[#1C2C56] text-sm font-medium">Email</label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                                className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56]"
                            />
                        </div>

                        <div>
                            <label className="text-[#1C2C56] text-sm font-medium">Phone</label>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+1 (555) 123-4567"
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
                            menuPortalTarget={document.body}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t px-5 py-4 flex justify-end gap-3">

                    <Button variant="plain" size="sm" onClick={onClose}>
                        Cancel
                    </Button>

                    <Button
                        variant="solid"
                        size="sm"
                        className="bg-[#1C2C56] hover:bg-[#1C2C56] text-white px-6"
                        onClick={handleSave}
                    >
                        {mode === "edit" ? "Update Account" : "Create Account"}
                    </Button>

                </div>
            </div>
        </Dialog>
    );
};

export default AddEditB2BAccountModal;
