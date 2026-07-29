"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiOrderRentalDetails } from "@/services/OrderRentals";
import Spinner from "@/components/ui/Spinner";
import {
  FiArrowLeft,
  FiDownload,
  FiBriefcase,
  FiFileText,
  FiCalendar,
  FiHome,
  FiUser,
  FiMail,
  FiPhone,
  FiCreditCard,
  FiClock,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import StatusModal from "./StatusModal";

export default function B2BOrderDetails({ orderId }) {
  const router = useRouter();
  const [openReturnModal, setOpenReturnModal] = useState(false);
  const [openTimeline, setOpenTimeline] = useState(false);

  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const params = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);

      const res = await apiOrderRentalDetails(
        accessToken,
        orderId || params.id,
      );

      if (res?.status) {
        setOrder(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [accessToken, orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Spinner size={40} customColorClass="text-[#A0522D]" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#FAF8F6] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-full border border-[#E9DED4] bg-white flex items-center justify-center hover:bg-[#F8F3EE]"
            >
              <FiArrowLeft className="text-lg text-[#5B4434]" />
            </button>

            <div className="flex items-center gap-4">
              <h1 className="text-[30px] font-bold text-[#2E241D]">
                Order & Rental Details
              </h1>

              <span
                className={`px-4 py-1 rounded-md text-sm font-semibold capitalize ${
                  order?.status === "pending"
                    ? "bg-[#FFF4E5] text-[#D97706]"
                    : order?.status === "delivered"
                      ? "bg-[#E6F8ED] text-[#169B62]"
                      : order?.status === "returned"
                        ? "bg-[#F4EAFF] text-[#9333EA]"
                        : "bg-[#EEF4FF] text-[#2563EB]"
                }`}
              >
                {order?.status}
              </span>
            </div>
          </div>

          <button
            onClick={() => setOpenReturnModal(true)}
            className="bg-[#A85A32] hover:bg-[#95502D] text-white px-5 py-2 rounded-lg text-sm font-semibold"
          >
            Mark As Returned
          </button>
        </div>

        {/* Company Card */}
        <div className="bg-white border border-[#EEE3DA] rounded-2xl p-4 mb-7">
          <div className="flex items-center gap-2 text-[#7A6E66] font-semibold text-[12px] mb-7">
            <FiBriefcase size={18} className="text-[#A0522D]" />
            COMPANY INFORMATION
          </div>

          <div className="grid grid-cols-3 gap-y-8">
            {/* <div>
              <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                Company
              </p>
              <p className="font-semibold text-[#241A14]">
                {order?.customer?.full_name || "-"}
              </p>
            </div> */}

            <div>
              <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                Contact Person
              </p>
              <p className="font-semibold text-[#241A14]">
                {order?.delivery_address?.name || "-"}
              </p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                Business Email
              </p>
              <p className="font-semibold text-[#241A14]">
                {order?.delivery_address?.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                Phone Number
              </p>
              <p className="font-semibold text-[#241A14]">
                {order?.delivery_address?.phone}
              </p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                Company Address
              </p>
              <p className="font-semibold text-[#241A14] leading-7">
                {[
                  order?.delivery_address?.address_line_1,
                  order?.delivery_address?.address_line_2,
                  order?.delivery_address?.city,
                  order?.delivery_address?.postal_code,
                  order?.delivery_address?.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#7A6E66] mb-2">
                User Type
              </p>

              <span className="bg-[#FFF0E8] text-[#D97745] px-3 py-1 rounded text-xs font-semibold">
                {order?.order_type?.toUpperCase() || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="grid md:grid-cols-2 gap-7">
          {/* Quotation */}
          {/* <div className="bg-white border border-[#EEE3DA] rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[#7A6E66] font-semibold text-[12px] mb-7">
              <FiFileText size={18} className="text-[#A0522D]" />
              QUATATION INFORMATION
            </div>

            <div className="grid grid-cols-2 gap-y-8">
              <div>
                <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                  Quotation ID
                </p>

                <p className="font-semibold text-[#241A14]">QT-2026-105</p>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                  Quotation Status
                </p>

                <p className="font-semibold text-[#241A14]">ACCEPTED</p>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                  Quotation Date
                </p>

                <p className="font-semibold text-[#241A14]">20 May 2024</p>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                  Valid Until
                </p>

                <p className="font-semibold text-[#241A14]">25 May 2024</p>
              </div>
            </div>

            <button className="mt-8 border border-[#D9A17C] text-[#A85A32] font-semibold rounded-lg px-5 py-3 flex items-center gap-2 text-sm bg-[#FFF7F3]">
              <FiDownload />
              Download Quotation PDF
            </button>
          </div> */}

          <div className="bg-white border border-[#EEE3DA] rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[#7A6E66] font-semibold text-[12px] mb-7">
              <FiCalendar size={18} className="text-[#A85A32]" />
              RENTAL INFORMATION
            </div>

            <div className="grid grid-cols-2 gap-y-7">
              <div>
                <p className="text-[11px] uppercase text-[#8C8178]">
                  Rental Start
                </p>
                <p className="mt-1 font-semibold text-[#1A1410]">
                  {order?.rental_start_date}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase text-[#8C8178]">
                  Rental End
                </p>
                <p className="mt-1 font-semibold text-[#1A1410]">
                  {order?.rental_end_date}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase text-[#8C8178]">
                  Venue / Event
                </p>
                <p className="mt-1 font-semibold text-[#1A1410]">{"-"}</p>
              </div>

              <div>
                <p className="text-[11px] uppercase text-[#8C8178]">
                  Event Type
                </p>
                <p className="mt-1 font-semibold text-[#1A1410]">
                  {order?.event_type || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Contract */}
          <div className="bg-white border border-[#EEE3DA] rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[#7A6E66] font-semibold text-[12px] mb-7">
              <FiFileText size={18} className="text-[#A0522D]" />
              CONTRACT INFORMATION
            </div>

            <div className="grid grid-cols-2 gap-y-8">
              <div>
                <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                  Contract ID
                </p>

                <p className="font-semibold text-[#241A14]">{"-"}</p>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                  Contract Status
                </p>

                <p className="text-[#169B62] font-semibold">{"-"}</p>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                  CloudSign Status
                </p>

                <p className="text-[#16A34A] font-semibold">{"-"}</p>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                  Signed Date
                </p>

                <p className="font-semibold text-[#241A14]">{"-"}</p>
              </div>
            </div>

            <button className="mt-8 border border-[#D9A17C] text-[#A85A32] font-semibold rounded-lg px-5 py-2 flex items-center gap-2 text-sm bg-[#FFF7F3]">
              <FiDownload />
              Download Contract PDF
            </button>
          </div>
        </div>

        {/* Rental + Sales */}
        <div className="grid md:grid-cols-2 gap-7">
          {/* Rental Information */}

          {/* <div className="bg-white border border-[#EEE3DA] rounded-2xl p-6">
            <div className="flex items-center gap-2 text-[#7A6E66] font-semibold text-[12px] mb-7">
              <FiCalendar size={18} className="text-[#A85A32]" />
              RENTAL INFORMATION
            </div>

            <div className="grid grid-cols-2 gap-y-7">
              <div>
                <p className="text-[11px] uppercase text-[#8C8178]">
                  Rental Start
                </p>
                <p className="mt-1 font-semibold text-[#1A1410]">
                  {order?.rental_start_date}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase text-[#8C8178]">
                  Rental End
                </p>
                <p className="mt-1 font-semibold text-[#1A1410]">
                  {order?.rental_end_date}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase text-[#8C8178]">
                  Venue / Event
                </p>
                <p className="mt-1 font-semibold text-[#1A1410]">{""}</p>
              </div>

              <div>
                <p className="text-[11px] uppercase text-[#8C8178]">
                  Event Type
                </p>
                <p className="mt-1 font-semibold text-[#1A1410]">
                  {order?.order_type}
                </p>
              </div>
            </div>
          </div> */}

          {/* Sales Representative */}
          {/* <div className="bg-white border border-[#EEE3DA] rounded-2xl p-6">
            <div className="flex items-center gap-2 text-[#7A6E66] font-semibold text-[12px]  mb-6">
              <FiUser size={15} className="text-[#A85A32]" /> SALES
              REPRESENTATIVE
            </div>

            <div className="flex items-center gap-4 mb-5">
              <img
                src="https://i.pravatar.cc/80"
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />

              <div>
                <h3 className="font-semibold text-[#1A1410]">Emily Johnson</h3>

                <p className="text-[13px] text-[#7E7E7E]">
                  Senior Account Manager
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-5">
              <div className="flex items-center gap-2 text-[#666] text-[14px]">
                <FiMail size={14} />
                <span>s.harrington@ritzcarlton.com</span>
              </div>

              <div className="flex items-center gap-2 text-[#666] text-[14px]">
                <FiPhone size={14} />
                <span>+1 (212) 555-0142</span>
              </div>
            </div>
          </div> */}
        </div>

        {/* Ordered Items + Payment */}
        <div className="grid grid-cols-12 gap-6 mt-5">
          {/* Ordered Items */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-[#EEE3DA] rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b border-[#F1E8E0]">
              <h3 className="font-semibold text-[15px] text-[#1A1410]">
                Ordered Items
              </h3>

              <span className="text-[13px] text-[#999]">
                {order?.order_items?.length || 0} Items
              </span>
            </div>

            <table className="w-full">
              <thead className="bg-[#FBF8F6]">
                <tr className="text-left text-[12px] text-[#8B8178] uppercase">
                  <th className="text-left px-4 py-3 font-medium">Item</th>
                  <th className="text-left px-4 py-3 font-medium">Qty</th>
                  <th className="text-left px-4 py-3 font-medium">Days</th>
                  <th className="text-left px-4 py-3 font-medium">
                    Unit Price
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Subtotal</th>
                </tr>
              </thead>

              <tbody className="text-sm">
                {order?.order_items?.length > 0 ? (
                  order.order_items.map((item) => (
                    <tr
                      key={item.id}
                      className="odd:bg-white even:bg-[#FBF8F6]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-[58px] h-[40px] rounded object-cover border"
                          />

                          <div>
                            <p className="font-medium text-[#1F2937]">
                              {item.product_name}
                            </p>

                            <p className="text-xs text-[#6B7280] mt-1">
                              {item.category} • {item.color} • {item.fabric} •
                              Size {item.size}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-[#374151]">
                        {item.quantity}
                      </td>

                      <td className="px-6 py-4 text-[#374151]">
                        {item.rental_days}
                      </td>

                      <td className="px-6 py-4 text-[#374151]">
                        {order?.payment_summary?.currency} {item.price_per_day}
                      </td>

                      <td className="px-6 py-4 font-medium text-[#111827]">
                        {order?.payment_summary?.currency} {item.subtotal}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-[#6B7280]">
                      No items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Payment Summary */}
          <div className="col-span-12 lg:col-span-4 bg-white border border-[#EEE3DA] rounded-2xl p-6">
            <div className="flex items-center gap-2 text-[#7A6E66] font-semibold text-[12px] uppercase mb-6">
              <FiCreditCard size={15} className="text-[#A85A32]" />
              PAYMENT SUMMARY
            </div>

            <div className="space-y-4 text-[14px]">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span>
                  {order?.order_items?.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Unit Price</span>
                <span>
                  {order?.payment_summary?.currency}{" "}
                  {order?.payment_summary?.subtotal}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>
                  {order?.payment_summary?.currency}{" "}
                  {order?.payment_summary?.shipping_charge}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Consumption Tax</span>
                <span>
                  {order?.payment_summary?.currency} {order?.tax}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Corporate Discount</span>
                <span>
                  {order?.payment_summary?.currency}{" "}
                  {order?.payment_summary?.tax}
                </span>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between font-bold text-[#1A1714] text-[15px]">
                <span>Rental Subtotal</span>
                <span>
                  {order?.payment_summary?.currency}{" "}
                  {order?.payment_summary?.total_amount}
                </span>
              </div>

              <div className="pt-5">
                <p className="text-[12px] uppercase text-[#888] mb-2">
                  Payment Method
                </p>

                <div className="border rounded-lg p-3 flex items-center gap-3">
                  {/* <span className="text-blue-500 font-medium">NP</span> */}

                  <span>{order?.payment_summary?.payment_method || "-"}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-5">
                <span className="text-[12px] uppercase text-[#888]">
                  Payment Status
                </span>

                <span
                  className={`px-3 py-1 rounded text-xs font-semibold capitalize ${
                    order?.payment_summary?.payment_status === "success"
                      ? "bg-[#E8F8EE] text-[#169B62]"
                      : "bg-[#FFF4E5] text-[#D97706]"
                  }`}
                >
                  {order?.payment_summary?.payment_status || "Pending"}
                </span>
              </div>

              <div className="flex justify-between pt-3">
                <span className="text-[12px] uppercase text-[#888]">
                  Payment Date
                </span>

                <span>{order?.payment_summary?.paid_at?.split("T")[0]}</span>
              </div>

              <button
                onClick={() => router.push(`/orders/${orderId}/timeline`)}
                className="w-full mt-8 border border-[#D8A07C] text-[#A85A32] rounded-lg py-2 hover:bg-[#FFF8F3] flex items-center justify-center gap-2 text-sm font-medium"
              >
                <FiClock size={18} />
                View Timeline
              </button>
            </div>
          </div>
        </div>
      </div>

      <StatusModal
        open={openReturnModal}
        onClose={() => setOpenReturnModal(false)}
      />
    </>
  );
}
