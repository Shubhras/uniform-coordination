"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { FiEye, FiSearch, FiSlash, FiChevronLeft, FiChevronRight, FiRotateCcw } from "react-icons/fi";

const users = [
  { id: "user-1", fullName: "Guy Hawkins", userType: "B2C", email: "debbie.baker@example.com", registrationDate: "12 July 26", status: "Active" },
  { id: "user-2", fullName: "Darlene Robertson", userType: "B2B", email: "nathan.roberts@example.com", registrationDate: "12 July 26", status: "Inactive" },
  { id: "user-3", fullName: "Marvin McKinney", userType: "B2C", email: "tim.jennings@example.com", registrationDate: "12 July 26", status: "Active" },
  { id: "user-4", fullName: "Eleanor Pena", userType: "B2B", email: "deanna.curtis@example.com", registrationDate: "12 July 26", status: "Active" },
  { id: "user-5", fullName: "Theresa Webb", userType: "B2C", email: "felicia.reid@example.com", registrationDate: "12 July 26", status: "Active" },
  { id: "user-6", fullName: "Cody Fisher", userType: "B2B", email: "georgia.young@example.com", registrationDate: "12 July 26", status: "Inactive" },
  { id: "user-7", fullName: "Jerome Bell", userType: "B2C", email: "bill.sanders@example.com", registrationDate: "12 July 26", status: "Active" },
  { id: "user-8", fullName: "Bessie Cooper", userType: "B2B", email: "sara.cruz@example.com", registrationDate: "12 July 26", status: "Active" },
  { id: "user-9", fullName: "Guy Hawkins", userType: "B2C", email: "michael.mitc@example.com", registrationDate: "12 July 26", status: "Active" },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "b2c", label: "B2C" },
  { value: "b2b", label: "B2B" },
];

const statusOptions = [
  { value: "all", label: "Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "34px",
    borderColor: "#F2E5DD",
    borderRadius: "6px",
    boxShadow: "none",
    fontSize: "11px",
    "&:hover": { borderColor: "#E2CFC2" },
  }),
  valueContainer: (base) => ({ ...base, paddingLeft: "8px", paddingRight: "8px" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, color: "#B7774D", padding: "0 8px 0 0" }),
  menu: (base) => ({ ...base, zIndex: 30 }),
  option: (base, state) => ({
    ...base,
    fontSize: "11px",
    backgroundColor: state.isSelected ? "#B56735" : state.isFocused ? "#FCF4EF" : "#FFFFFF",
    color: state.isSelected ? "#FFFFFF" : "#6F625B",
  }),
};

const UsersPermissionsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Users");
  const [searchQuery, setSearchQuery] = useState("");
  const [userType, setUserType] = useState(typeOptions[0]);
  const [status, setStatus] = useState(statusOptions[0]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);

      const matchesType =
        userType.value === "all" || user.userType.toLowerCase() === userType.value;

      const matchesStatus =
        status.value === "all" || user.status.toLowerCase() === status.value;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, status, userType]);

  const handleReset = () => {
    setSearchQuery("");
    setUserType(typeOptions[0]);
    setStatus(statusOptions[0]);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-[30px] font-semibold leading-tight text-[#2A211D]">
        Users &amp; Permissions
      </h1>
      <p className="mt-1 text-[12px] text-[#B29D8C]">
        Manage user accounts, roles, permissions, and access across the platform.
      </p>

      <div className="mt-5 flex gap-8 border-b border-[#E8DDD4]">
        {["Users", "Permissions"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`border-b pb-3 text-[12px] ${
              activeTab === tab
                ? "border-[#B56735] text-[#2B211C]"
                : "border-transparent text-[#7F756E]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Users" ? (
        <>
          <div className="mt-5 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D1A48A]" size={13} />
              <input
                type="text"
                placeholder="Search by user name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-[34px] w-full rounded-md border border-[#F3E7DE] bg-white pl-8 pr-3 text-[11px] text-[#6F625B] outline-none placeholder:text-[#C28E73] focus:border-[#D7B7A3]"
              />
            </div>

            <div className="w-full lg:w-[112px]">
              <Select
                instanceId="users-type-filter"
                inputId="users-type-filter"
                value={userType}
                onChange={(selectedOption) => setUserType(selectedOption ?? typeOptions[0])}
                options={typeOptions}
                isSearchable={false}
                styles={selectStyles}
              />
            </div>

            <div className="w-full lg:w-[96px]">
              <Select
                instanceId="users-status-filter"
                inputId="users-status-filter"
                value={status}
                onChange={(selectedOption) => setStatus(selectedOption ?? statusOptions[0])}
                options={statusOptions}
                isSearchable={false}
                styles={selectStyles}
              />
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="flex h-[34px] w-full items-center justify-center gap-1 rounded-md border border-[#F2E5DD] bg-white px-3 text-[11px] font-medium text-[#B7774D] transition hover:bg-[#FCF4EF] lg:w-auto"
            >
              <FiRotateCcw size={12} />
              Reset
            </button>
          </div>

          <div className="mt-4 overflow-x-auto rounded-md border border-[#F4E9E1]">
            <table className="min-w-[980px] w-full">
              <thead>
                <tr className="bg-[#FBF5F0] text-left text-[11px] font-medium text-[#8F7B6E]">
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">User Type</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Registration Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isActive = user.status === "Active";
                  return (
                    <tr
                      key={user.id}
                      className="border-t border-[#F8EEE8] bg-white text-[11px] text-[#5F534C]"
                    >
                      <td className="px-4 py-3 font-semibold text-[#4A3D36]">{user.fullName}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-2 py-0.5 text-[9px] font-medium ${
                          user.userType === "B2C"
                            ? "bg-[#EAF4FF] text-[#4B93D4]"
                            : "bg-[#FFF0E8] text-[#C58A62]"
                        }`}>
                          {user.userType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#4A3D36]">{user.email}</td>
                      <td className="px-4 py-3 font-semibold text-[#4A3D36]">{user.registrationDate}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                            isActive
                              ? "bg-[#E8FAF2] text-[#007A55]"
                              : "bg-[#FFE9E8] text-[#F04444]"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-[#007A55]" : "bg-[#F04444]"}`} />
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 text-[#7D6C63]">
                          <button
                            type="button"
                            disabled={!isActive}
                            onClick={() => {
                              if (isActive) {
                                router.push(`/users-permissions/${user.id}`);
                              }
                            }}
                            className={isActive ? "" : "cursor-default opacity-60"}
                          >
                            <FiEye size={13} />
                          </button>
                          <button type="button" className="cursor-default">
                            <FiSlash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col gap-3 text-[11px] text-[#9A8C82] sm:flex-row sm:items-center sm:justify-between">
            <p>Showing 1-10</p>

            <div className="flex items-center gap-2">
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded border border-[#E9DDD4] text-[#C9B2A3]">
                <FiChevronLeft size={14} />
              </button>
              <button type="button" className="flex h-8 min-w-[30px] items-center justify-center rounded bg-[#D88957] px-2 text-white">
                1
              </button>
              <button type="button" className="text-[#8C7C73]">2</button>
              <button type="button" className="text-[#8C7C73]">3</button>
              <span className="text-[#8C7C73]">...</span>
              <button type="button" className="text-[#8C7C73]">10</button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded border border-[#E9DDD4] text-[#8C7C73]">
                <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default UsersPermissionsPage;