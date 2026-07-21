"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetUserDetails } from "@/services/UserPermissionService";

const recentUserDetailsRequests = new Map();
const USER_DETAILS_REQUEST_DEDUP_MS = 1500;

const getDisplayName = (user) =>
  user?.fullName ||
  user?.full_name ||
  user?.name ||
  user?.user_name ||
  user?.username ||
  "-";

const getDisplayEmail = (user) => user?.email || user?.user_email || "-";

const getDisplayPhone = (user) =>
  user?.phone ||
  user?.phone_number ||
  user?.mobile ||
  user?.contact_number ||
  "-";

const getDisplayStatus = (user) => {
  if (typeof user?.status === "boolean") {
    return user.status ? "Active" : "Inactive";
  }

  if (typeof user?.is_active === "boolean") {
    return user.is_active ? "Active" : "Inactive";
  }

  const rawStatus =
    user?.status_label ||
    user?.statusText ||
    user?.account_status ||
    user?.state;

  if (typeof rawStatus === "string") {
    return rawStatus.toLowerCase() === "active" ? "Active" : "Inactive";
  }

  return "Inactive";
};

const getDisplayUserType = (user) => {
  const rawType =
    user?.display_user_type ||
    user?.user_type_label ||
    user?.customer_type ||
    user?.userType ||
    user?.user_type ||
    user?.type;

  if (typeof rawType === "string") {
    const normalized = rawType.trim().toLowerCase();

    if (["b2b", "business", "corporate", "company"].includes(normalized)) {
      return "B2B";
    }

    if (["b2c", "customer", "individual", "consumer"].includes(normalized)) {
      return "B2C";
    }
  }

  if (typeof user?.role === "number") {
    return user.role === 2 ? "B2C" : "B2B";
  }

  return "B2C";
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).format(date);
};

const normalizeUser = (user) => ({
  ...user,
  id: user?.id ?? user?.user_id ?? user?.pk,
  fullName: getDisplayName(user),
  email: getDisplayEmail(user),
  phoneNumber: getDisplayPhone(user),
  userType: getDisplayUserType(user),
  registrationDate: formatDate(
    user?.registrationDate ||
      user?.registration_date ||
      user?.created_at ||
      user?.date_joined ||
      user?.createdAt,
  ),
  statusLabel: getDisplayStatus(user),
  isActive: getDisplayStatus(user) === "Active",
});

const getRawUserDetails = (payload) => {
  if (!payload) {
    return null;
  }

  if (Array.isArray(payload)) {
    return payload[0] || null;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results[0] || null;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data[0] || null;
  }

  return payload?.user || payload?.results || payload?.data || payload;
};

const UserDetails = ({ userId }) => {
  const router = useRouter();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = useCallback(async () => {
    if (!accessToken || !userId) {
      setLoading(false);
      return;
    }

    const requestKey = `${accessToken}:${userId}`;
    const now = Date.now();
    const previousRequestTime = recentUserDetailsRequests.get(requestKey);

    if (
      typeof previousRequestTime === "number" &&
      now - previousRequestTime < USER_DETAILS_REQUEST_DEDUP_MS
    ) {
      return;
    }

    recentUserDetailsRequests.set(requestKey, now);

    try {
      setLoading(true);
      const response = await apiGetUserDetails(accessToken, userId);
      const payload = response?.data?.data || response?.data || response;
      const rawUser = getRawUserDetails(payload);
      setUser(rawUser ? normalizeUser(rawUser) : null);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, userId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  if (!userId) {
    return <div className="p-6">User not found.</div>;
  }

  const isActive = user?.isActive;

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#EDE0D7] bg-white text-[#6F6058]"
        >
          <FiArrowLeft size={12} />
        </button>

        <h1 className="text-[30px] font-semibold leading-tight text-[#2A211D]">
          Users Details
        </h1>
      </div>

      <div className="mt-5 rounded-2xl border border-[#F1E5DC] bg-white p-6">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index}>
                <div className="h-3 w-20 animate-pulse rounded bg-[#F5ECE6]" />
                <div className="mt-2 h-4 w-28 animate-pulse rounded bg-[#F5ECE6]" />
              </div>
            ))}
          </div>
        ) : user ? (
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B7A39A]">
                Full Name
              </p>
              <p className="mt-2 text-[13px] font-medium text-[#3C302B]">
                {user.fullName}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B7A39A]">
                User Type
              </p>
              <div className="mt-2">
                <span
                  className={`rounded px-2 py-0.5 text-[9px] font-medium ${
                    user.userType === "B2C"
                      ? "bg-[#EAF4FF] text-[#4B93D4]"
                      : "bg-[#FFF0E8] text-[#C58A62]"
                  }`}
                >
                  {user.userType}
                </span>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B7A39A]">
                Email
              </p>
              <p className="mt-2 text-[13px] font-medium text-[#3C302B]">
                {user.email}
              </p>
            </div>

            <div className="md:text-right">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${
                  isActive
                    ? "bg-[#E8FAF2] text-[#007A55]"
                    : "bg-[#FFE9E8] text-[#F04444]"
                }`}
              >
                {user.statusLabel}
              </span>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B7A39A]">
                Phone Number
              </p>
              <p className="mt-2 text-[13px] font-medium text-[#3C302B]">
                {user.phoneNumber}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B7A39A]">
                Registration Date
              </p>
              <p className="mt-2 text-[13px] font-medium text-[#3C302B]">
                {user.registrationDate}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-[13px] text-[#8B6A55]">
            User details not found.
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
