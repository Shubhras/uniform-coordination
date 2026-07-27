"use client";

import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetCustomersDetails } from "@/services/B2BAccountService";

const CustomerDetails = () => {
  const router = useRouter();
  const { id } = useParams();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;
  const [customer, setCustomer] = useState(null);

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(false);

  const getQuotationDetails = async () => {
    try {
      setLoading(true);

      const res = await apiGetCustomersDetails(accessToken, id);

      console.log("Quotation Details", res);

      if (res?.status) {
        setCustomer(res.data);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && id) {
      getQuotationDetails();
    }
  }, [accessToken, id]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6">
      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-9 w-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50"
          >
            <FiArrowLeft size={18} />
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-[#1C2C56]">
                Customer Details
              </h1>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  customer?.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {customer?.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {/* <p className="text-sm text-gray-500 mt-1">
              Customer ID : {customer?.id || id}
            </p> */}
          </div>
        </div>
      </div>

      {/* ================= COMPANY INFO ================= */}

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <h3 className="text-[16px] font-semibold mb-5">Customer Information</h3>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Customer */}

          <div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-[#F5F7FA] flex items-center justify-center text-xl font-bold text-[#1C4FA8]">
                {customer?.firstName?.charAt(0) || "-"}
              </div>

              <div>
                <p className="text-[14px] text-[#374151]">Customer Name</p>

                <h4 className="font-semibold mt-1">
                  {customer?.full_name || "-"}
                </h4>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[14px] text-[#374151]">Phone Number</p>

              <p className="mt-1">{customer?.phone || "-"}</p>
            </div>
          </div>

          {/* Contact */}

          <div>
            <div>
              <p className="text-[14px] text-[#374151]">First Name</p>

              <h4 className="font-semibold mt-1">
                {customer?.firstName || "-"}
              </h4>
            </div>

            <div className="mt-6">
              <p className="text-[14px] text-[#374151]">Last Name</p>

              <p className="mt-1">{customer?.lastName || "-"}</p>
            </div>
          </div>

          {/* Right */}

          <div>
            <div>
              <p className="text-[14px] text-[#374151]">Email</p>

              <p className="mt-1">{customer?.email || "-"}</p>
            </div>

            <div className="mt-6">
              <p className="text-[14px] text-[#374151]">User Type</p>

              <span className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold bg-blue-100 text-blue-700 capitalize">
                {customer?.userType || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* ================= QUOTATION INFORMATION ================= */}

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <h3 className="text-[16px] font-semibold mb-5">Account Information</h3>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
          <div>
            <p className="text-[14px] text-[#374151]">Customer ID</p>
            <p className="mt-1 font-medium">{customer?.id}</p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Username</p>
            <p className="mt-1">{customer?.userName || "-"}</p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Role</p>
            <p className="mt-1 capitalize">{customer?.role_name || "-"}</p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Language</p>
            <p className="mt-1 capitalize">{customer?.language || "-"}</p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Login Type</p>
            <p className="mt-1 capitalize">{customer?.loginType || "-"}</p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Email Verified</p>

            <span
              className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                customer?.is_verify
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {customer?.is_verify ? "Verified" : "Not Verified"}
            </span>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Email Notifications</p>

            <span
              className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                customer?.email_notifications
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {customer?.email_notifications ? "Enabled" : "Disabled"}
            </span>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Push Notifications</p>

            <span
              className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                customer?.push_notifications
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {customer?.push_notifications ? "Enabled" : "Disabled"}
            </span>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Account Status</p>

            <span
              className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                customer?.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {customer?.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Last Login</p>

            <p className="mt-1">
              {customer?.lastLogin
                ? new Date(customer.lastLogin).toLocaleString()
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Created On</p>

            <p className="mt-1">
              {customer?.createdAt
                ? new Date(customer.createdAt).toLocaleString()
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Updated On</p>

            <p className="mt-1">
              {customer?.updatedAt
                ? new Date(customer.updatedAt).toLocaleString()
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
