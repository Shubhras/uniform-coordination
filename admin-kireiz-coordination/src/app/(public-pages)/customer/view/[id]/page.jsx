"use client";

import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiQuotationDetails } from "@/services/B2BAccountService";

const ViewQuotation = () => {
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

      console.log("Quotation Details", res);

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
                Quotation Details
              </h1>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                NEW
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              Quotation UUID : {quotation?.quotation_id || id}
            </p>
          </div>
        </div>
      </div>

      {/* ================= COMPANY INFO ================= */}

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <h3 className="text-[16px] font-semibold mb-5">Company Information</h3>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Company */}

          <div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-[#F5F7FA] flex items-center justify-center text-xl font-bold text-[#B46B36]">
                A
              </div>

              <div>
                <p className="text-[14px] text-[#374151]">Company</p>

                <h4 className="font-semibold text-[#1C2C56] mt-1">
                  {quotation?.company_name || "-"}
                </h4>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[14px] text-[#374151]">Phone Number</p>

              <p className="mt-1 text-[#334155]">
                {quotation?.phone_number || "-"}
              </p>
            </div>
          </div>

          {/* Contact */}

          <div>
            <div>
              <p className="text-[14px] text-[#374151]">Contact Person</p>

              <h4 className="font-semibold text-[#1C2C56] mt-1">
                {quotation?.contact_person || "-"}
              </h4>
            </div>

            <div className="mt-6">
              <p className="text-[14px] text-[#374151]">Company Address</p>

              <p className="mt-1 text-[#334155] leading-6">
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

          {/* Business */}

          <div>
            <div>
              <p className="text-[14px] text-[#374151]">Business Email</p>

              <p className="mt-1 text-[#334155]">{quotation?.email || "-"}</p>
            </div>
          </div>
        </div>
      </div>
      {/* ================= QUOTATION INFORMATION ================= */}

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <h3 className="text-[16px] font-semibold mb-5">
          Quotation Information
        </h3>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
          <div>
            <p className="text-[14px] text-[#374151]">Quotation ID</p>
            <p className="mt-1 font-medium text-[#1C2C56]">
              {quotation?.quotation_id || "-"}
            </p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Item Type</p>
            <p className="mt-1">{quotation?.item_type || "-"}</p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Material</p>
            <p className="mt-1">{quotation?.material || "-"}</p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Size & Quantity</p>
            <p className="mt-1">{quotation?.size_quantity || "-"}</p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Delivery Date</p>
            <p className="mt-1">
              {quotation?.delivery_date
                ? new Date(quotation.delivery_date).toLocaleDateString()
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Status</p>

            <span
              className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                quotation?.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {quotation?.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Terms Accepted</p>

            <span
              className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                quotation?.agreed_to_terms
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {quotation?.agreed_to_terms ? "Yes" : "No"}
            </span>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Created On</p>
            <p className="mt-1">
              {quotation?.created_at
                ? new Date(quotation.created_at).toLocaleString()
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-[14px] text-[#374151]">Updated On</p>
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
