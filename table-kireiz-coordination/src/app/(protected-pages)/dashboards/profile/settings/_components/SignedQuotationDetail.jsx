'use client'

import { FiArrowLeft, FiDownload, FiFileText, FiMapPin, FiPhone } from 'react-icons/fi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import { useSettingsStore } from '../_store/settingsStore'

const cardClassName = 'rounded-2xl border border-[#F0E4DE] bg-white'

const quotation = {
    id: 'QT-2026-105',
    company: 'ABC Hotels Pvt Ltd',
    contact: 'John Smith',
    businessEmail: 'Debra.Holt@Example.Com',
    phone: '(239) 555-0108',
    companyAddress: 'Sakura Grand Hotel Co., Chiyoda-Ku Tokyo, 100-0085 Japan',

    quotationStatus: 'SIGNED',
    quotationDate: '20 May 2024',
    signedDate: '22 Mar 2024',
    contractId: 'CT-2026-021',
    contractStatus: 'SIGNED',

    rentalStartDate: '12 Jun 2024',
    rentalEndDate: '26 Jun 2024',
    venue: 'Grand Hyatt Tokyo',
    eventType: 'WEDDING',

    items: 6,
    requestedItemsSubtitle: '6 items for 2-day rental period',
    requestedItems: [
        { item: 'Crystal Chandelier (Large)', category: 'Lighting', qty: 3, unitRate: '¥450.00' },
        { item: 'Gold Candelabra (Tall)', category: 'Centerpieces', qty: 12, unitRate: '¥85.00' },
        { item: 'Marble Pedestal', category: 'Stands', qty: 6, unitRate: '¥120.00' },
        { item: 'White Velvet Chair Cover', category: 'Linens', qty: 200, unitRate: '¥8.00' },
        { item: 'Gold Charger Plate', category: 'Tableware', qty: 200, unitRate: '¥6.00' },
        { item: 'Crystal Centerpiece Vase', category: 'Centerpieces', qty: 24, unitRate: '¥45.00' },
    ],

    customerNotes:
        'We require the chandeliers to be installed no later than 6 AM on the 14th. All items must coordinate in gold and crystal tones. Please confirm availability at your earliest convenience.',

    summary: {
        items: '6 line items',
        rentalDuration: '2 days',
        subtotal: '¥19,200.00',
        discount: '-¥960.00',
        delivery: '¥350.00',
        total: '¥18,590.00',
    },
}

export const quotationStatusStyles = {
    SIGNED: 'text-[#0F9F6E]',
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
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3">No Of Items</th>
                        <th className="px-5 py-3">Unit Rate/Day</th>
                    </tr>
                </thead>
                <tbody>
                    {quotation.requestedItems.map((item) => (
                        <tr
                            key={`${quotation.id}-${item.item}`}
                            className="border-t border-[#F7EEEA] text-sm text-[#2C1810]"
                        >
                            <td className="px-5 py-3.5 font-medium">{item.item}</td>
                            <td className="px-5 py-3.5">
                                <span className="inline-flex rounded-full bg-[#F8F1ED] px-2.5 py-1 text-[10px] text-[#A0725B]">
                                    {item.category}
                                </span>
                            </td>
                            <td className="px-5 py-3.5">{item.qty}</td>
                            <td className="px-5 py-3.5">{item.unitRate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="space-y-3 p-4 md:hidden">
            {quotation.requestedItems.map((item) => (
                <div
                    key={`${quotation.id}-${item.item}-mobile`}
                    className="rounded-xl border border-[#F3E7E1] bg-[#FFFDFC] p-4"
                >
                    <p className="text-sm font-semibold text-[#2C1810]">{item.item}</p>
                    <p className="mt-2 text-xs text-[#A0725B]">{item.category}</p>
                    <div className="mt-3 flex items-center justify-between text-sm text-[#6D5548]">
                        <span>Qty: {item.qty}</span>
                        <span>{item.unitRate}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
)

const QuoteSummary = ({ quotation }) => (
    <div className={`${cardClassName} p-5`}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A18C]">
            Quote Summary
        </p>
        <div className="mt-4 space-y-3 text-sm text-[#6D5548]">
            <div className="flex items-center justify-between">
                <span>Items</span>
                <span>{quotation.summary?.items || '-'}</span>
            </div>
            <div className="flex items-center justify-between">
                <span>Rental Day</span>
                <span>{quotation.summary?.rentalDuration || '-'}</span>
            </div>
            <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{quotation.summary?.subtotal || '-'}</span>
            </div>
            <div className="flex items-center justify-between text-[#2BA24C]">
                <span>Discount (5%)</span>
                <span>{quotation.summary?.discount || '-'}</span>
            </div>
            <div className="flex items-center justify-between">
                <span>Delivery</span>
                <span>{quotation.summary?.delivery || '-'}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#F2E6E0] pt-3 font-semibold text-[#B04E2F]">
                <span>Total</span>
                <span>{quotation.summary?.total || quotation.total}</span>
            </div>
        </div>
    </div>
)

const SignedQuotationDetail = () => {
    const { setCurrentView, setSelectedQuotationId } = useSettingsStore()

    const handleBack = () => {
        setCurrentView('my-quotations')
        setSelectedQuotationId(null)
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
                </SectionCard>

                <SectionCard
                    icon={<FiFileText size={16} />}
                    title="Quotation & Contract Information"
                >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <InfoField label="Quotation ID" value={quotation.id} />
                        <InfoField label="Quotation Date" value={quotation.quotationDate} />
                        <div />
                        <InfoField label="Contract ID" value={quotation.contractId} />
                        <InfoField label="Signed Date" value={quotation.signedDate} />
                        <InfoField
                            label="Contract Status"
                            value={quotation.contractStatus || quotation.quotationStatus}
                            accentClassName={quotationStatusStyles[quotation.contractStatus] || 'text-[#0F9F6E]'}
                        />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-lg border border-[#F0D8CC] bg-[#FFF7F2] px-4 py-2 text-sm font-medium text-[#B04E2F]"
                        >
                            <FiDownload size={14} />
                            Download Quotation PDF
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-lg border border-[#F0D8CC] bg-[#FFF7F2] px-4 py-2 text-sm font-medium text-[#B04E2F]"
                        >
                            <FiDownload size={14} />
                            Download Contract PDF
                        </button>
                    </div>
                </SectionCard>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <SectionCard icon={<FiMapPin size={16} />} title="Rental Information">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <InfoField label="Rental Start" value={quotation.rentalStartDate} />
                            <InfoField label="Rental End" value={quotation.rentalEndDate} />
                            <InfoField label="Venue/Event" value={quotation.venue} />
                            <InfoField label="Event Type" value={quotation.eventType} />
                        </div>
                    </SectionCard>

                    <SectionCard icon={<FiPhone size={16} />} title="Customer Notes">
                        <p className="text-sm leading-7 text-[#6D5548]">
                            {quotation.customerNotes || quotation.notes}
                        </p>
                    </SectionCard>
                </div>

                <RequestedItemsTable quotation={quotation} />

                <QuoteSummary quotation={quotation} />
            </div>
        </div>
    )
}

export default SignedQuotationDetail