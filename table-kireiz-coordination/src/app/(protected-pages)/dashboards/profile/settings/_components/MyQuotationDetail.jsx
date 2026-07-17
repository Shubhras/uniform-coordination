'use client'

import Image from 'next/image'
import { FiArrowLeft, FiFileText, FiMapPin, FiPhone } from 'react-icons/fi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import {
    getQuotationById,
    quotationStatusStyles,
} from './MyQuotations'
import { useSettingsStore } from '../_store/settingsStore'

const DetailCard = ({ icon, title, children }) => (
    <div className="rounded-2xl border border-[#E7D8D0] bg-white overflow-hidden">
        <div className="flex items-center gap-2  border-[#F0E4DE] px-5 py-4">
            <span className="text-[#C08A72]">{icon}</span>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A0725B]">
                {title}
            </h3>
        </div>
        <div className="p-5">{children}</div>
    </div>
)

const Field = ({ label, value }) => (
    <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#B58B78]">
            {label}
        </p>
        <p className="mt-2 text-sm font-medium text-[#2C1810] break-words">
            {value || '-'}
        </p>
    </div>
)

const MyQuotationDetail = () => {
    const {
        selectedQuotationId,
        setCurrentView,
        setSelectedQuotationId,
    } = useSettingsStore()

    const quotation = getQuotationById(selectedQuotationId)

    const handleBack = () => {
        setCurrentView('my-quotations')
        setSelectedQuotationId(null)
    }

    return (
        <div className="w-full bg-[#F5F0EE30] md:p-8 p-5 rounded-2xl max-w-7xl mx-auto shadow-md space-y-5">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={handleBack}
                    className="h-9 w-9 rounded-full border border-[#E5D5CD] bg-white flex items-center justify-center text-[#8B6A55]"
                >
                    <FiArrowLeft size={16} />
                </button>
                <div>
                    <h2 className="text-xl font-semibold text-[#2C1810]">
                        My Quotations
                    </h2>
                    <p className="text-sm text-[#8B6A55]">
                        Full quotation request details for {quotation.id}
                    </p>
                </div>
            </div>

            <DetailCard
                icon={<HiOutlineBuildingOffice2 size={16} />}
                title="Company Information"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#B58B78] mb-2">
                            Company Name
                        </p>
                        <div className="flex items-center gap-3">
                            <Image
                                src="/img/logo/logo-table.png"
                                alt="Kireiz Space"
                                width={24}
                                height={24}
                                className="object-contain"
                            />
                            <p className="text-sm font-medium text-[#2C1810]">
                                {quotation.company}
                            </p>
                        </div>
                    </div>

                    <Field label="Contact Person" value={quotation.contact} />
                    <Field label="Business Email" value={quotation.businessEmail} />
                    <Field label="Phone Number" value={quotation.phone} />
                    <div className="md:col-span-2">
                        <Field label="Company Address" value={quotation.companyAddress} />
                    </div>
                </div>
            </DetailCard>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <DetailCard icon={<FiFileText size={16} />} title="Quotation Information">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Quotation ID" value={quotation.id} />
                        <Field label="Quotation Status" value={quotation.quotationStatus} />
                        <Field label="Quotation Date" value={quotation.quotationDate} />
                        <Field label="Valid Until" value={quotation.validity} />
                    </div>
                </DetailCard>

                <DetailCard icon={<FiMapPin size={16} />} title="Rental Information">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Rental Start" value={quotation.rentalStartDate} />
                        <Field label="Rental End" value={quotation.rentalEndDate} />
                        <Field label="Venue/Event" value={quotation.venue} />
                        <Field label="Event Type" value={quotation.eventType} />
                    </div>
                </DetailCard>
            </div>

            <DetailCard icon={<FiPhone size={16} />} title="Notes">
                <p className="text-sm leading-7 text-[#6D5548]">
                    {quotation.notes}
                </p>
            </DetailCard>

            <div className="rounded-2xl border border-[#E7D8D0] bg-white overflow-hidden">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between  border-[#F0E4DE] px-5 py-4">
                    <div>
                        <h3 className="text-base font-semibold text-[#2C1810]">
                            Requested Items
                        </h3>
                        <p className="text-xs text-[#A0725B]">
                            6 items for 2-day rental period
                        </p>
                    </div>
                    <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${quotationStatusStyles[quotation.status]}`}
                    >
                        {quotation.status}
                    </span>
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-[#FBF5F1]">
                            <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A0725B]">
                                <th className="px-5 py-4">Item</th>
                                <th className="px-5 py-4">Category</th>
                                <th className="px-5 py-4">No of Items</th>
                                <th className="px-5 py-4">Unit Rate/Day</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotation.requestedItems.map((item) => (
                                <tr
                                    key={`${quotation.id}-${item.item}`}
                                    className="border-t border-[#F4EAE5] text-sm text-[#2C1810]"
                                >
                                    <td className="px-5 py-4 font-medium">{item.item}</td>
                                    <td className="px-5 py-4">
                                        <span className="rounded-full bg-[#F7EEE9] px-3 py-1 text-xs text-[#A0725B]">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">{item.qty}</td>
                                    <td className="px-5 py-4">{item.unitRate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden space-y-3 p-4">
                    {quotation.requestedItems.map((item) => (
                        <div
                            key={`${quotation.id}-${item.item}-mobile`}
                            className="rounded-xl border border-[#F0E4DE] bg-[#FFFCFA] p-4"
                        >
                            <p className="text-sm font-semibold text-[#2C1810]">
                                {item.item}
                            </p>
                            <p className="mt-2 text-xs text-[#A0725B]">
                                {item.category}
                            </p>
                            <div className="mt-3 flex items-center justify-between text-sm text-[#6D5548]">
                                <span>Qty: {item.qty}</span>
                                <span>{item.unitRate}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MyQuotationDetail
