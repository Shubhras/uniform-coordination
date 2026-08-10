"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiGetCustomersDetails } from "@/services/B2BAccountService";
import { formatDate } from "@/utils/formatDate";

const CustomerDetails = () => {
  const t = useTranslations("customerSalesRep.customerDetails");
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
                {t("pageTitle")}
              </h1>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  customer?.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {customer?.isActive ? t("statusActive") : t("statusInactive")}
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
        <h3 className="text-[16px] font-semibold mb-5">
          {t("customerInformation")}
        </h3>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Customer */}

          <div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-[#F5F7FA] flex items-center justify-center text-xl font-bold text-[#1C4FA8]">
                {customer?.firstName?.charAt(0) || "-"}
              </div>

              <div>
                <p className="text-[14px] text-[#374151]">{t("customerName")}</p>

                <h4 className="font-semibold mt-1">
                  {customer?.full_name || "-"}
                </h4>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[14px] text-[#374151]">{t("phoneNumber")}</p>

              <p className="mt-1">{customer?.phone || "-"}</p>
            </div>
          </div>

          {/* Contact */}

          <div>
            <div>
              <p className="text-[14px] text-[#374151]">{t("firstName")}</p>

              <h4 className="font-semibold mt-1">
                {customer?.firstName || "-"}
              </h4>
            </div>

            <div className="mt-6">
              <p className="text-[14px] text-[#374151]">{t("lastName")}</p>

              <p className="mt-1">{customer?.lastName || "-"}</p>
            </div>
          </div>

          {/* Right */}

          <div>
            <div>
              <p className="text-[14px] text-[#374151]">{t("email")}</p>

              <p className="mt-1">{customer?.email || "-"}</p>
            </div>

            <div className="mt-6">
              <p className="text-[14px] text-[#374151]">{t("userType")}</p>

              <span className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold bg-blue-100 text-blue-700 capitalize">
                {customer?.userType || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* ================= QUOTATION INFORMATION ================= */}

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <h3 className="text-[16px] font-semibold mb-5">
          {t("accountInformation")}
        </h3>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
          <div>
            <p className="text-[14px] text-[#374151]">{t("customerId")}</p>
            <p className="mt-1 font-medium">{customer?.id}</p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">{t("username")}</p>
            <p className="mt-1">{customer?.userName || "-"}</p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">{t("role")}</p>
            <p className="mt-1 capitalize">{customer?.role_name || "-"}</p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">{t("language")}</p>
            <p className="mt-1 capitalize">{customer?.language || "-"}</p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">{t("loginType")}</p>
            <p className="mt-1 capitalize">{customer?.loginType || "-"}</p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">{t("emailVerified")}</p>

            <span
              className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                customer?.is_verify
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {customer?.is_verify ? t("verified") : t("notVerified")}
            </span>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">
              {t("emailNotifications")}
            </p>

            <span
              className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                customer?.email_notifications
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {customer?.email_notifications ? t("enabled") : t("disabled")}
            </span>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">
              {t("pushNotifications")}
            </p>

            <span
              className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                customer?.push_notifications
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {customer?.push_notifications ? t("enabled") : t("disabled")}
            </span>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">{t("accountStatus")}</p>

            <span
              className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                customer?.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {customer?.isActive ? t("statusActive") : t("statusInactive")}
            </span>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">{t("lastLogin")}</p>

            <p className="mt-1">
              {customer?.lastLogin ? formatDate(customer.lastLogin) : "-"}
            </p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">{t("createdOn")}</p>

            <p className="mt-1">
              {customer?.createdAt ? formatDate(customer.createdAt) : "-"}
            </p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">{t("updatedOn")}</p>

            <p className="mt-1">
              {customer?.updatedAt ? formatDate(customer.updatedAt) : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
