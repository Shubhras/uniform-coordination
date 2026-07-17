'use client'

import { FiArrowLeft } from 'react-icons/fi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import { useSettingsStore } from '../_store/settingsStore'
import { getQuotationById } from './MyQuotations'

const cardClassName = 'rounded-2xl border border-[#F0E4DE] bg-white'
const fallbackQuotation = {
    id: 'QT-2026-105',
    company: 'ABC Hotels Pvt Ltd',
    contact: 'John Smith',
    businessEmail: 'Debra.Holt@Example.Com',
    phone: '(239) 555-0108',
    companyAddress: 'Sakura Grand Hotel Co., Chiyoda-Ku Tokyo, 100-0005 Japan',

    quotationStatus: 'QUOTATION READY',
    quotationDate: '20 May 2024',
    rentalPeriod: '12 -14 Jun 2024 (3 Days)',
    eventType: 'WEDDING',
    venue: 'Grand Hyatt Tokyo',

    documentPreviewName: 'Quotation_Q-2026-0617.pdf',

    items: 6,
    requestedItemsSubtitle: '6 items for 2-day rental period',
    requestedItems: [
        { item: 'Crystal Chandelier (Large)', category: 'Lighting', qty: 3, unitRate: '¥450.00' },
        { item: 'Gold Candelabra (Tall)', category: 'Centerpieces', qty: 12, unitRate: '¥85.00' },
        { item: 'Gold Candelabra (Tall)', category: 'Centerpieces', qty: 12, unitRate: '¥85.00' },
        { item: 'Gold Candelabra (Tall)', category: 'Centerpieces', qty: 12, unitRate: '¥85.00' },
        { item: 'Gold Candelabra (Tall)', category: 'Centerpieces', qty: 12, unitRate: '¥85.00' },
    ],
}

export const quotationStatusStyles = {
    'QUOTATION READY': 'text-[#C46A2D]',
}

const SectionCard = ({ icon, title, children }) => (
    <div className={cardClassName}>
        <div className="flex items-center gap-2 px-5 py-4">
            <span className="text-[#D7A48E]">{icon}</span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A18C]">
                {title}
            </p>
        </div>
        <div className="px-5 pb-5">{children}</div>
    </div>
)

const InfoField = ({ label, value, accentClassName = 'text-[#2C1810]' }) => (
    <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A18C]">
            {label}
        </p>
        <p className={`mt-2 break-words text-sm font-medium ${accentClassName}`}>
            {value || '-'}
        </p>
    </div>
)

const RequestedItemsTable = ({ quotation }) => (
    <div className={`${cardClassName} overflow-hidden`}>
        <div className="px-5 py-4">
            <h3 className="text-sm font-semibold text-[#2C1810]">Requested Items</h3>
            <p className="mt-1 text-xs text-[#B58B78]">
                {quotation.requestedItemsSubtitle || `${quotation.items} items for rental period`}
            </p>
        </div>
        <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full">
                <thead className="border-y border-[#F4E8E2] bg-[#FFFDFC]">
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A0725B]">
                        <th className="px-5 py-3">Item</th>
                        <th className="px-5 py-3">No Of Items</th>
                        <th className="px-5 py-3">Unit Rate/Day</th>
                    </tr>
                </thead>
                <tbody>
                    {quotation.requestedItems.map((item, idx) => (
                        <tr
                            key={`${quotation.id}-${item.item}-${idx}`}
                            className="border-t border-[#F7EEEA] text-sm text-[#2C1810]"
                        >
                            <td className="px-5 py-3.5">
                                <p className="font-medium">{item.item}</p>
                                <p className="mt-0.5 text-xs text-[#B58B78]">{item.category}</p>
                            </td>
                            <td className="px-5 py-3.5">{item.qty}</td>
                            <td className="px-5 py-3.5">{item.unitRate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="space-y-3 p-4 md:hidden">
            {quotation.requestedItems.map((item, idx) => (
                <div
                    key={`${quotation.id}-${item.item}-${idx}-mobile`}
                    className="rounded-xl border border-[#F3E7E1] bg-[#FFFDFC] p-4"
                >
                    <p className="text-sm font-semibold text-[#2C1810]">{item.item}</p>
                    <p className="mt-1 text-xs text-[#A0725B]">{item.category}</p>
                    <div className="mt-3 flex items-center justify-between text-sm text-[#6D5548]">
                        <span>Qty: {item.qty}</span>
                        <span>{item.unitRate}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
)

const PreviewCard = ({ fileName }) => (
    <div className={`${cardClassName} p-5`}>
        <h3 className="text-sm font-semibold text-[#2C1810]">Document Preview</h3>
        <div className="mt-4 rounded-2xl border border-[#F0E4DE] bg-[#FFF9F5] p-4">
            <div className="mx-auto flex h-[220px] max-w-[180px] flex-col rounded-xl border border-[#E9D8CD] bg-white p-3 shadow-sm">
                <div className="mb-3 h-4 w-4 rounded-full border border-[#E3B6A1]" />
                <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-[#F3E3D8]" />
                    <div className="h-3 w-4/5 rounded bg-[#F6EAE2]" />
                    <div className="h-20 rounded bg-[#FBF3ED]" />
                    <div className="h-3 w-3/4 rounded bg-[#F6EAE2]" />
                    <div className="h-3 w-2/3 rounded bg-[#F6EAE2]" />
                </div>
            </div>
            <p className="mt-4 text-[11px] text-[#8B6A55]">{fileName}</p>
        </div>
    </div>
)

const QuotationReadyDetail = () => {
    const { selectedQuotationId, setCurrentView, setSelectedQuotationId } = useSettingsStore()
    const quotation = getQuotationById(selectedQuotationId) || fallbackQuotation

    const handleBack = () => {
        setCurrentView('my-quotations')
        setSelectedQuotationId(null)
    }

    const handleAccept = () => {
        setCurrentView('contract-accepted-detail')
    }

    return (
        <div className="mx-auto w-full max-w-7xl rounded-2xl bg-[#F5F0EE30] p-5 shadow-md md:p-8">
            <div className="mb-5 flex items-center gap-3">
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5D5CD] bg-white text-[#8B6A55]"
                >
                    <FiArrowLeft size={16} />
                </button>
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-semibold text-[#2C1810]">My Quotations</h2>
                </div>
            </div>

            <div className="space-y-5">
                <SectionCard
                    icon={<HiOutlineBuildingOffice2 size={16} />}
                    title="Company Information"
                >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <InfoField label="Company Name" value={quotation.company} />
                        <InfoField label="Contact Person" value={quotation.contact} />
                        <InfoField label="Business Email" value={quotation.businessEmail} />
                        <InfoField label="Phone Number" value={quotation.phone} />
                        <div className="md:col-span-2">
                            <InfoField label="Company Address" value={quotation.companyAddress} />
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-5 border-t border-[#F4E8E2] pt-5 md:grid-cols-3">
                        <InfoField label="Quotation ID" value={quotation.id} />
                        <InfoField
                            label="Quotation Status"
                            value={quotation.quotationStatus}
                            accentClassName={quotationStatusStyles[quotation.quotationStatus] || 'text-[#C46A2D]'}
                        />
                        <InfoField label="Quotation Date" value={quotation.quotationDate} />
                        <InfoField label="Rental Period" value={quotation.rentalPeriod} />
                        <InfoField label="Event Type" value={quotation.eventType} />
                        <InfoField label="Venue/Event" value={quotation.venue} />
                    </div>
                </SectionCard>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_0.95fr]">
                    <RequestedItemsTable quotation={quotation} />
                    <PreviewCard fileName={quotation.documentPreviewName || 'Quotation.pdf'} />
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        className="rounded-md bg-[#E11D48] px-5 py-2.5 text-sm font-semibold text-white"
                    >
                        Reject
                    </button>
                    <button
                        type="button"
                        onClick={handleAccept}
                        className="rounded-md bg-[#0F9F6E] px-5 py-2.5 text-sm font-semibold text-white"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    )
}

export default QuotationReadyDetail
