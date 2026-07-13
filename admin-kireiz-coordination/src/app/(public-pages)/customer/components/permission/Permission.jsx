"use client";

import { useState } from "react";

const permissionsData = [
    { name: "View Dashboard", admin: true, b2b: true },
    { name: "Edit Content", admin: true, b2b: true },
    { name: "Manage Users", admin: true, b2b: false },
    { name: "Access Reports", admin: true, b2b: true },
    { name: "System Settings", admin: true, b2b: false },
];

const Permission = () => {
    const [permissions, setPermissions] = useState(permissionsData);

    const togglePermission = (index, role) => {
        if (role === "admin") return; // admin locked

        const updated = [...permissions];
        updated[index][role] = !updated[index][role];
        setPermissions(updated);
    };

    return (
        <div className="bg-white rounded-xl shadow p-6">

            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-[#1C2C56]">
                    Role Permissions
                </h2>
                <p className="text-[#486284] text-sm mt-1">
                    Configure access levels for different system roles. Admin permissions are locked for security.
                </p>
            </div>

            {/* Table */}
            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <tr className="text-[#486284]">
                            <th className="text-left px-5 py-3 font-medium">Feature / Capability</th>
                            <th className="text-center px-5 py-3 font-medium">Admin</th>
                            <th className="text-center px-5 py-3 font-medium">B2B User</th>
                        </tr>
                    </thead>

                    <tbody>
                        {permissions.map((perm, index) => (
                            <tr
                                key={index}
                                className="border-b last:border-none border-[#E2E8F0] hover:bg-[#F9FAFB]"
                            >
                                <td className="px-5 py-4 text-[#1C2C56] font-medium">
                                    {perm.name}
                                </td>

                                {/* Admin Toggle (Locked) */}
                                <td className="px-5 py-4 text-center">
                                    <ToggleSwitch checked={perm.admin} disabled />
                                </td>

                                {/* B2B Toggle */}
                                <td className="px-5 py-4 text-center">
                                    <ToggleSwitch
                                        checked={perm.b2b}
                                        onClick={() => togglePermission(index, "b2b")}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-6">
                <button className="border border-[#CBD5E1] text-[#486284] px-4 py-2 rounded-md text-sm">
                    Cancel
                </button>

                <button className="bg-[#1C4FA8] text-white px-5 py-2 rounded-md text-sm font-medium">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default Permission;
const ToggleSwitch = ({ checked, onClick, disabled }) => {
    return (
        <button
            onClick={disabled ? undefined : onClick}
            className={`relative w-12 h-6 rounded-full transition 
        ${checked ? "bg-[#1C2C56]" : "bg-gray-300"}
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
      `}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition
          ${checked ? "translate-x-6" : ""}
        `}
            ></span>
        </button>
    );
};
