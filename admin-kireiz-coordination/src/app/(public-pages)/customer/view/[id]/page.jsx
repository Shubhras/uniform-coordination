"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiQuotationDetails } from "@/services/B2BAccountService";

const ViewQuotation = () => {
  const t = useTranslations("customerSalesRep.quotationHistory.viewQuotationPage");
  const router = useRouter();
  const { id } = useParams();
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(false);

  const getQuotationDetails = async () => {
    try {
      setLoading(true);
      const res = await apiQuotationDetails(accessToken, id);

      if (res?.status) {
        setQuotation(res.data);
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
      {/* Header */}
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

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                {t("newBadge")}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              {t("quotationUuid")} : {quotation?.quotation_id || id}
            </p>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <h3 className="text-[16px] font-semibold mb-5">{t("companyInfoSection")}</h3>

        <div className="grid lg:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-[#F5F7FA] flex items-center justify-center text-xl font-bold text-[#B46B36]">
                {(quotation?.company_name || "A")[0].toUpperCase()}
              </div>

              <div>
                <p className="text-[14px] text-[#374151]">{t("companyLabel")}</p>

                <h4 className="font-semibold mt-1">
                  {quotation?.company_name || "-"}
                </h4>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[14px] text-[#374151]">{t("phoneNumberLabel")}</p>

              <p className="mt-1">{quotation?.phone_number || "-"}</p>
            </div>
          </div>

          <div>
            <div>
              <p className="text-[14px] text-[#374151]">{t("contactPersonLabel")}</p>

              <h4 className="font-semibold mt-1">
                {quotation?.contact_person || "-"}
              </h4>
            </div>

            <div className="mt-6">
              <p className="text-[14px] text-[#374151]">{t("companyAddressLabel")}</p>

              <p className="mt-1 leading-6">
                Sakura Grand Hotel Co.
                <br />
                Chiyoda-ku
                <br />
                Tokyo 100-0005
                <br />
                Japan
              </p>
            </div>
          </div>

          <div>
            <div>
              <p className="text-[14px] text-[#374151]">{t("businessEmailLabel")}</p>

              <p className="mt-1">{quotation?.email || "-"}</p>
            </div>
            <div className="mt-6">
              <p className="text-[14px] text-[#374151] mb-2">
                {t("quotationStatusLabel")}
              </p>

              <span
                className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold capitalize
      ${
        quotation?.quotation_status === "approved"
          ? "bg-green-100 text-green-700"
          : quotation?.quotation_status === "pending"
            ? "bg-yellow-100 text-yellow-700"
            : quotation?.quotation_status === "sent"
              ? "bg-blue-100 text-blue-700"
              : quotation?.quotation_status === "cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
      }`}
              >
                {quotation?.quotation_status || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quotation Information */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <h3 className="text-[16px] font-semibold mb-5">
          {t("quotationInfoSection")}
        </h3>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
          <div>
            <p className="text-[14px] text-[#374151]">{t("quoteIdLabel")}</p>
            <p className="mt-1 font-medium">{quotation?.quotation_id || "-"}</p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">{t("itemTypeLabel")}</p>
            <p className="mt-1">{quotation?.item_type || "-"}</p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">{t("materialLabel")}</p>
            <p className="mt-1">{quotation?.material || "-"}</p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">{t("sizeQuantityLabel")}</p>
            <p className="mt-1">{quotation?.size_quantity || "-"}</p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">{t("deliveryDateLabel")}</p>
            <p className="mt-1">
              {quotation?.delivery_date
                ? new Date(quotation.delivery_date).toLocaleDateString()
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">{t("statusLabel")}</p>

            <span
              className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                quotation?.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {quotation?.isActive ? t("activeStatus") : t("inactiveStatus")}
            </span>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">{t("termsAcceptedLabel")}</p>

            <span
              className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                quotation?.agreed_to_terms
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {quotation?.agreed_to_terms ? t("yes") : t("no")}
            </span>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">{t("createdOnLabel")}</p>
            <p className="mt-1">
              {quotation?.created_at
                ? new Date(quotation.created_at).toLocaleString()
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">{t("updatedOnLabel")}</p>
            <p className="mt-1">
              {quotation?.updated_at
                ? new Date(quotation.updated_at).toLocaleString()
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewQuotation;
