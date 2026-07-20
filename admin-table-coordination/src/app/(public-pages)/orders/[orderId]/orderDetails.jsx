"use client";
import { useState } from "react";
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

export default function OrderDetails({ orderId }) {
  const router = useRouter();
  const [openReturnModal, setOpenReturnModal] = useState(false);
  const [openTimeline, setOpenTimeline] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-[#FAF8F6] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-11 h-11 rounded-full border border-[#E9DED4] bg-white flex items-center justify-center hover:bg-[#F8F3EE]"
            >
              <FiArrowLeft className="text-lg text-[#5B4434]" />
            </button>

            <div className="flex items-center gap-4">
              <h1 className="text-[30px] font-bold text-[#2E241D]">
                Order & Rental Details
              </h1>

              <span className="px-4 py-1 rounded-md bg-[#E6F8ED] text-[#169B62] text-sm font-semibold">
                DELIVERED
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
            <div>
              <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                Company
              </p>
              <p className="font-semibold text-[#241A14]">ABC Hotels Pvt Ltd</p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                Contact Person
              </p>
              <p className="font-semibold text-[#241A14]">John Smith</p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                Business Email
              </p>
              <p className="font-semibold text-[#241A14]">
                debra.holt@example.com
              </p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                Phone Number
              </p>
              <p className="font-semibold text-[#241A14]">(239) 555-0108</p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                Company Address
              </p>
              <p className="font-semibold text-[#241A14] leading-7">
                Sakura Grand Hotel Co.,
                <br />
                Chiyoda-Ku Tokyo,
                <br />
                100-0005 Japan
              </p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#7A6E66] mb-2">
                User Type
              </p>

              <span className="bg-[#FFF0E8] text-[#D97745] px-3 py-1 rounded text-xs font-semibold">
                B2B
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="grid md:grid-cols-2 gap-7">
          {/* Quotation */}
          <div className="bg-white border border-[#EEE3DA] rounded-2xl p-4">
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

                <p className="font-semibold text-[#241A14]">CT-2026-021</p>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                  Contract Status
                </p>

                <p className="text-[#169B62] font-semibold">SIGNED</p>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                  CloudSign Status
                </p>

                <p className="text-[#16A34A] font-semibold">COMPLETED</p>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-[#7A6E66] mb-1">
                  Signed Date
                </p>

                <p className="font-semibold text-[#241A14]">22 May 2024</p>
              </div>
            </div>

            <button className="mt-8 border border-[#D9A17C] text-[#A85A32] font-semibold rounded-lg px-5 py-3 flex items-center gap-2 text-sm bg-[#FFF7F3]">
              <FiDownload />
              Download Contract PDF
            </button>
          </div>
        </div>

        {/* Rental + Sales */}
        <div className="grid md:grid-cols-2 gap-7 mt-7">
          {/* Rental Information */}
          <div className="bg-white border border-[#EEE3DA] rounded-2xl p-6">
            <div className="flex items-center gap-2 text-[#7A6E66] font-semibold text-[12px] mb-7">
              <FiCalendar size={18} className="text-[#A85A32]" />
              RENTAL INFORMATION
            </div>

            <div className="grid grid-cols-2 gap-y-7">
              <div>
                <p className="text-[11px] uppercase text-[#8C8178]">
                  Rental Start
                </p>
                <p className="mt-1 font-semibold text-[#1A1410]">12 Jun 2024</p>
              </div>

              <div>
                <p className="text-[11px] uppercase text-[#8C8178]">
                  Rental End
                </p>
                <p className="mt-1 font-semibold text-[#1A1410]">26 Jun 2024</p>
              </div>

              <div>
                <p className="text-[11px] uppercase text-[#8C8178]">
                  Venue / Event
                </p>
                <p className="mt-1 font-semibold text-[#1A1410]">
                  Grand Hyatt Tokyo
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase text-[#8C8178]">
                  Event Type
                </p>
                <p className="mt-1 font-semibold text-[#1A1410]">Wedding</p>
              </div>
            </div>
          </div>

          {/* Sales Representative */}
          <div className="bg-white border border-[#EEE3DA] rounded-2xl p-6">
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
          </div>
        </div>

        {/* Ordered Items + Payment */}
        <div className="grid grid-cols-12 gap-6 mt-6">
          {/* Ordered Items */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-[#EEE3DA] rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-5 border-b border-[#F1E8E0]">
              <h3 className="font-semibold text-[#1A1410]">Ordered Items</h3>

              <span className="text-[13px] text-[#999]">5 items</span>
            </div>

            <table className="w-full">
              <thead className="bg-[#FBF8F6]">
                <tr className="text-left text-[12px] text-[#8B8178] uppercase">
                  <th className="px-6 py-4">Item</th>
                  <th>Qty</th>
                  <th>Days</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>

              <tbody className="text-[14px]">
                {[
                  {
                    name: "Crystal Chandelier Set (6 pcs)",
                    qty: 2,
                    days: "14d",
                    price: "¥850",
                    total: "¥2380",
                  },
                  {
                    name: "Velvet Banquet Chair",
                    qty: 60,
                    days: "14d",
                    price: "¥4.50",
                    total: "¥3780",
                  },
                  {
                    name: "Marble Top Table (180cm)",
                    qty: 10,
                    days: "14d",
                    price: "¥28",
                    total: "¥3920",
                  },
                  {
                    name: "Marble Top Table (180cm)",
                    qty: 10,
                    days: "14d",
                    price: "¥28",
                    total: "¥3920",
                  },
                  {
                    name: "Marble Top Table (180cm)",
                    qty: 10,
                    days: "14d",
                    price: "¥28",
                    total: "¥3920",
                  },
                ].map((item, i) => (
                  <tr key={i} className="border-t border-[#F4ECE6]">
                    <td className="px-6 py-5 font-medium text-[#1A1410]">
                      {item.name}
                    </td>

                    <td>{item.qty}</td>

                    <td className="text-[#888]">{item.days}</td>

                    <td className="text-[#888]">{item.price}</td>

                    <td className="font-semibold">{item.total}</td>
                  </tr>
                ))}
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
                <span>70</span>
              </div>

              <div className="flex justify-between">
                <span>Unit Price</span>
                <span>¥144</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>¥144</span>
              </div>

              <div className="flex justify-between">
                <span>Consumption Tax</span>
                <span>¥144</span>
              </div>

              <div className="flex justify-between">
                <span>Corporate Discount</span>
                <span>-¥9,800</span>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between font-bold text-[#1A1714] text-[15px]">
                <span>Rental Subtotal</span>
                <span>¥14,112.00</span>
              </div>

              <div className="pt-5">
                <p className="text-[12px] uppercase text-[#888] mb-2">
                  Payment Method
                </p>

                <div className="border rounded-lg p-3 flex items-center gap-3">
                  <span className="text-blue-500 font-medium">NP</span>

                  <span>NP Kakebarai</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-5">
                <span className="text-[12px] uppercase text-[#888]">
                  Payment Status
                </span>

                <span className="bg-[#E8F8EE] text-[#169B62] px-3 py-1 rounded text-xs font-semibold">
                  PAID
                </span>
              </div>

              <div className="flex justify-between pt-3">
                <span className="text-[12px] uppercase text-[#888]">
                  Payment Date
                </span>

                <span>25 May 2024</span>
              </div>

              <button
                onClick={() => router.push(`/orders/${orderId}/timeline`)}
                className="w-full mt-8 border border-[#D8A07C] text-[#A85A32] rounded-lg py-3 hover:bg-[#FFF8F3] flex items-center justify-center gap-2 text-sm font-medium"
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
