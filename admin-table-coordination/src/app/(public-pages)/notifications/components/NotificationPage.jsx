"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiSearch,
  FiX,
} from "react-icons/fi";

const notifications = [
  {
    id: "NOT-0001",
    recipient: "Sophia Hartmann",
    email: "sophia.hartmann@outlook.com",
    orderId: "ORD-88421",
    status: "Sent",
    sentAt: "09 Jul 2025, 20:02",
  },
  {
    id: "NOT-0002",
    recipient: "Courtney Henry",
    email: "curtis.weaver@example.com",
    orderId: "ORD-88421",
    status: "Failed",
    sentAt: "09 Jul 2025, 20:02",
  },
  {
    id: "NOT-0003",
    recipient: "Darrell Steward",
    email: "deanna.curtis@example.com",
    orderId: "ORD-88421",
    status: "Sent",
    sentAt: "09 Jul 2025, 20:02",
  },
  {
    id: "NOT-0004",
    recipient: "Leslie Alexander",
    email: "dolores.chambers@example.com",
    orderId: "ORD-88421",
    status: "Sent",
    sentAt: "09 Jul 2025, 20:02",
  },
  {
    id: "NOT-0005",
    recipient: "Albert Flores",
    email: "kenzi.lawson@example.com",
    orderId: "ORD-88421",
    status: "Sent",
    sentAt: "09 Jul 2025, 20:02",
  },
  {
    id: "NOT-0006",
    recipient: "Kristin Watson",
    email: "dolores.chambers@example.com",
    orderId: "ORD-88421",
    status: "Sent",
    sentAt: "09 Jul 2025, 20:02",
  },
  {
    id: "NOT-0007",
    recipient: "Cameron Williamson",
    email: "michael.mitc@example.com",
    orderId: "ORD-88421",
    status: "Sent",
    sentAt: "09 Jul 2025, 20:02",
  },
  {
    id: "NOT-0008",
    recipient: "Dianne Russell",
    email: "bill.sanders@example.com",
    orderId: "ORD-88421",
    status: "Sent",
    sentAt: "09 Jul 2025, 20:02",
  },
];

const statusOptions = [
  { value: "all", label: "Status" },
  { value: "sent", label: "Sent" },
  { value: "failed", label: "Failed" },
];

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "34px",
    borderColor: "#F2E5DD",
    borderRadius: "6px",
    boxShadow: "none",
    fontSize: "11px",
    "&:hover": {
      borderColor: "#E2CFC2",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    paddingLeft: "8px",
    paddingRight: "8px",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#B7774D",
    padding: "0 8px 0 0",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 30,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "11px",
    backgroundColor: state.isSelected
      ? "#B56735"
      : state.isFocused
        ? "#FCF4EF"
        : "#FFFFFF",
    color: state.isSelected ? "#FFFFFF" : "#6F625B",
  }),
};

const NotificationPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState(statusOptions[0]);

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return notifications.filter((item) => {
      const matchesSearch =
        !query ||
        item.recipient.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.orderId.toLowerCase().includes(query);

      const matchesStatus =
        status.value === "all" ||
        item.status.toLowerCase() === status.value.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, status]);

  return (
    <div className="min-h-screen bg-white px-3 py-4 sm:px-6 sm:py-5">
      <div className="mb-4">
        <h1 className="text-[24px] font-semibold leading-tight text-[#241915] sm:text-[28px]">
          Notifications
        </h1>
        <p className="mt-1 text-[11px] text-[#94867C] sm:text-xs">
          All transactional notifications sent by KIREIZ SPACE
        </p>
      </div>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:flex-1">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D1A48A]"
            size={13}
          />
          <input
            type="text"
            placeholder="Search by ID, recipient, order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[34px] w-full rounded-md border border-[#F3E7DE] bg-white pl-8 pr-8 text-[11px] text-[#6F625B] outline-none placeholder:text-[#C28E73] focus:border-[#D7B7A3]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A8E86]"
              aria-label="Clear search"
            >
              <FiX size={13} />
            </button>
          )}
        </div>

        <div className="w-full sm:w-[96px]">
          <Select
            instanceId="notifications-status-filter"
            inputId="notifications-status-filter"
            value={status}
            onChange={(selectedOption) =>
              setStatus(selectedOption ?? statusOptions[0])
            }
            options={statusOptions}
            isSearchable={false}
            styles={selectStyles}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-[#F4E9E1]">
        <table className="min-w-[980px] w-full">
          <thead>
            <tr className="bg-[#FBF5F0] text-left text-[11px] font-medium text-[#8F7B6E]">
              <th className="px-3 py-3">Recipient</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Order ID</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Sent At</th>
              <th className="px-3 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotifications.map((item) => {
              const isSent = item.status === "Sent";
              return (
                <tr
                  key={item.id}
                  className="border-t border-[#F8EEE8] bg-white text-[11px] text-[#5F534C]"
                >
                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#4A3D36]">
                    {item.recipient}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-[#4A3D36]">
                    {item.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#4A3D36]">
                    {item.orderId}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                        isSent
                          ? "bg-[#E8FAF2] text-[#15AA78]"
                          : "bg-[#FFE9E8] text-[#F04444]"
                      }`}
                    >
                      {isSent ? (
                        <FiCheckCircle size={11} />
                      ) : (
                        <FiAlertCircle size={11} />
                      )}
                      {item.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#4A3D36]">
                    {item.sentAt}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/notifications/${item.status.toLowerCase()}`)
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-[#EDD8CA] bg-white px-3 py-1 text-[10px] font-medium text-[#C17443] transition hover:bg-[#FCF4EE]"
                    >
                      <FiEye size={11} />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationPage;
