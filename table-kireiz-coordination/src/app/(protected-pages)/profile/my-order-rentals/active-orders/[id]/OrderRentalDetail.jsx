'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import {
    FiArrowLeft,
    FiCalendar,
    FiCreditCard,
    FiDownload,
    FiFileText,
    FiHome,
    FiMail,
    FiMapPin,
    FiPhone,
    FiUser,
} from 'react-icons/fi'
import { useParams, useRouter } from 'next/navigation'

const orderedItems = [
    { item: 'Crystal Chandelier Set (6 pcs)', qty: 2, days: '14d', unitPrice: '¥85.00', subtotal: '¥2,380.00' },
    { item: 'Velvet Banquet Chair', qty: 60, days: '14d', unitPrice: '¥4.50', subtotal: '¥3,780.00' },
    { item: 'Velvet Banquet Chair', qty: 60, days: '14d', unitPrice: '¥4.50', subtotal: '¥3,780.00' },
    { item: 'Velvet Banquet Chair', qty: 60, days: '14d', unitPrice: '¥4.50', subtotal: '¥3,780.00' },
    { item: 'Velvet Banquet Chair', qty: 60, days: '14d', unitPrice: '¥4.50', subtotal: '¥3,780.00' },
]

const PreviewImage = () => (
    <div className="h-[186px] w-full overflow-hidden rounded-xl border border-[#EADCD2] bg-[radial-gradient(circle_at_top,_#f8efe7,_#ead4be_60%,_#e4c7aa)]">
        <div className="relative h-full w-full">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,_rgba(255,247,238,0.9),_transparent_20%),radial-gradient(circle_at_83%_20%,_rgba(255,249,241,0.85),_transparent_18%),linear-gradient(180deg,_rgba(255,252,249,0.2),_rgba(220,188,156,0.18))]" />
            <div className="absolute left-[18%] right-[18%] top-[10%] h-5 rounded-full bg-[#FEF7F0]" />
            <div className="absolute left-[24%] right-[24%] top-[4%] h-5 rounded-full bg-[#F6ECE2]" />
            <div className="absolute left-[21%] top-[10%] h-8 w-[2px] rounded bg-[#FFF5EC]" />
            <div className="absolute right-[21%] top-[10%] h-8 w-[2px] rounded bg-[#FFF5EC]" />
            <div className="absolute left-[14%] right-[14%] top-[31%] h-12 rounded-full bg-[#FFFDFB]" />
            <div className="absolute left-[10%] right-[10%] top-[37%] h-[92px] rounded-t-[70px] bg-[#E9D0BA]" />
            <div className="absolute left-[18%] right-[18%] top-[28%] h-9 rounded-full bg-[#ECE3D8]" />
            <div className="absolute left-[26%] top-[20%] h-9 w-9 rounded-full bg-[#F8EFEA]" />
            <div className="absolute left-[33%] top-[18%] h-10 w-10 rounded-full bg-[#F4E9E4]" />
            <div className="absolute left-[40%] top-[16%] h-11 w-11 rounded-full bg-[#EFE4DB]" />
            <div className="absolute left-[48%] top-[18%] h-10 w-10 rounded-full bg-[#F7EEE7]" />
            <div className="absolute left-[56%] top-[20%] h-9 w-9 rounded-full bg-[#EFE6DE]" />
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-[linear-gradient(180deg,_rgba(229,204,182,0),_rgba(224,194,166,0.92))]" />
        </div>
    </div>
)

const cardClassName = 'rounded-2xl border border-[#F0E4DE] bg-white shadow-sm'

const DetailCard = ({ title, icon, children, className = '' }) => (
    <div className={`${cardClassName} p-4 ${className}`}>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A18C]">
            {icon}
            <p>{title}</p>
        </div>
        <div className="mt-4">{children}</div>
    </div>
)

const InfoRow = ({ label, value, valueClassName = 'text-[#2C1810]' }) => (
    <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A18C]">{label}</p>
        <p className={`mt-1 text-sm font-medium leading-5 ${valueClassName}`}>{value}</p>
    </div>
)

const OrderRentalDetail = ({ backPath }) => {
    const params = useParams()
    const router = useRouter()
    const orderId = params?.id || 'ORD-2024-0091'

    const handleBack = () => {
        router.push(backPath)
    }

    return (
        <AdaptiveCard className="h-full mt-8 border-0">
            <div className="mx-auto w-full max-w-7xl rounded-2xl bg-[#F5F0EE30] p-5 shadow-md md:p-8">
                <div className="mb-5 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5D5CD] bg-white text-[#8B6A55]"
                    >
                        <FiArrowLeft size={16} />
                    </button>
                    <div className="flex-1">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <h2 className="text-xl font-semibold text-[#2C1810]">Grand Tablecloth</h2>
                            <p className="text-xs text-[#8D7769]">Ordered On 26 Jun 2024</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.06fr_0.56fr] xl:items-stretch">
                    <div className="flex h-full flex-col gap-4">
                        <div className={`${cardClassName} p-4`}>
                            <PreviewImage />
                        </div>

                        <DetailCard
                            title="Rental Information"
                            icon={<FiCalendar size={12} className="text-[#B66636]" />}
                            className="flex-1"
                        >
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <InfoRow label="Rental Start" value="12 Jun 2024" />
                                <InfoRow label="Rental End" value="26 Jun 2024" />
                                <InfoRow label="Venue/Event" value="Grand Hyatt Tokyo" />
                                <InfoRow label="Event Type" value="WEDDING" />
                            </div>
                        </DetailCard>
                    </div>

                    <div className="h-full">
                        <div className={`${cardClassName} flex h-full flex-col p-4`}>
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A18C]">
                                <FiCreditCard size={12} className="text-[#B66636]" />
                                <p>Payment Summary</p>
                            </div>
                            <div className="mt-4 space-y-3 text-sm text-[#6D5548]">
                                <div className="flex items-center justify-between">
                                    <span>Total Items</span>
                                    <span>70</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Unit Price</span>
                                    <span>¥144</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Delivery Fee</span>
                                    <span>¥144</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Consumption Tax (10%)</span>
                                    <span>¥144</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Corporate Discount</span>
                                    <span className="text-[#B04E2F]">-¥9,800</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-[#F2E6E0] pt-3 font-semibold text-[#B04E2F]">
                                    <span>Rental Subtotal</span>
                                    <span>¥14,112.00</span>
                                </div>
                            </div>

                            <div className="mt-5 border-t border-[#F2E6E0] pt-5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A18C]">
                                    Payment Method
                                </p>
                                <div className="mt-2 flex items-center gap-2 rounded-md border border-[#EEE1D8] bg-white px-3 py-3 text-sm font-medium text-[#2C1810]">
                                    <span className="rounded bg-[#EEF6FF] px-1.5 py-0.5 text-[10px] font-semibold text-[#2B7FFF]">
                                        NP
                                    </span>
                                    <span>NP Kakebarai</span>
                                </div>
                                <div className="mt-5 flex items-center justify-between text-sm text-[#7C6558]">
                                    <span>Payment Status</span>
                                    <span className="rounded-sm bg-[#EAFBF0] px-2 py-0.5 text-[11px] font-semibold uppercase text-[#16A34A]">
                                        Paid
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-sm text-[#7C6558]">
                                    <span>Payment Date</span>
                                    <span>25 May 2024</span>
                                </div>
                                <button
                                    type="button"
                                    className="mt-5 w-full rounded-md border border-[#E4B292] bg-white px-4 py-2 text-sm font-medium text-[#B66636]"
                                >
                                    Track Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 space-y-4">
                    <DetailCard
                        title="Company Information"
                        icon={<FiUser size={12} className="text-[#B66636]" />}
                    >
                        <div className="grid gap-x-8 gap-y-4 md:grid-cols-3">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A18C]">
                                    Company Name
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F0FAF0] text-[#4CA64C]">
                                        <FiHome size={12} />
                                    </div>
                                    <span className="text-sm font-medium text-[#2C1810]">ABC Hotels Pvt Ltd</span>
                                </div>
                            </div>
                            <InfoRow label="Contact Person" value="John Smith" />
                            <InfoRow label="Business Email" value="Debra.Holt@Example.Com" />
                            <div className="flex items-center gap-2 text-sm text-[#2C1810]">
                                <FiPhone size={14} className="text-[#B48A73]" />
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A18C]">
                                        Phone Number
                                    </p>
                                    <p className="mt-1 font-medium">(239) 555-0108</p>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <div className="flex items-start gap-2 text-sm text-[#2C1810]">
                                    <FiMail size={14} className="mt-0.5 text-transparent" />
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A18C]">
                                            Company Address
                                        </p>
                                        <p className="mt-1 font-medium leading-5">
                                            Sakura Grand Hotel Co., Chiyoda-Ku Tokyo, 100-0005 Japan
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DetailCard>

                    <DetailCard
                        title="Quotation & Contract Information"
                        icon={<FiFileText size={12} className="text-[#B66636]" />}
                    >
                        <div className="grid gap-x-8 gap-y-4 lg:grid-cols-[1.25fr_0.75fr]">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <InfoRow label="Quotation ID" value="QT-2026-105" />
                                <InfoRow label="Quotation Date" value="20 May 2024" />
                                <InfoRow label="Contract ID" value="CT-2026-021" />
                                <InfoRow label="Contract Status" value="Signed" valueClassName="text-[#0F9F6E]" />
                                <InfoRow
                                    label="CloudSign Status"
                                    value="Completed"
                                    valueClassName="text-[#0F9F6E]"
                                />
                                <InfoRow label="Signed Date" value="22 May 2024" />
                            </div>

                            <div className="flex flex-col justify-center gap-4">
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-center gap-2 rounded-md border border-[#E4B292] bg-white px-4 py-2 text-sm font-medium text-[#B66636]"
                                >
                                    <FiDownload size={14} />
                                    Download Quotation PDF
                                </button>
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-center gap-2 rounded-md border border-[#E4B292] bg-white px-4 py-2 text-sm font-medium text-[#B66636]"
                                >
                                    <FiDownload size={14} />
                                    Download Contract PDF
                                </button>
                            </div>
                        </div>
                    </DetailCard>

                    <div className={`${cardClassName} overflow-hidden`}>
                        <div className="flex items-center justify-between border-b border-[#F4E8E2] px-4 py-4">
                            <h3 className="text-sm font-semibold text-[#2C1810]">Ordered Items</h3>
                            <span className="text-xs text-[#B8A89E]">{orderedItems.length} items</span>
                        </div>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full">
                                <thead className="bg-[#FFFDFC] text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A0725B]">
                                    <tr>
                                        <th className="px-4 py-3">Item</th>
                                        <th className="px-4 py-3">Qty</th>
                                        <th className="px-4 py-3">Days</th>
                                        <th className="px-4 py-3">Unit Price</th>
                                        <th className="px-4 py-3">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderedItems.map((item, index) => (
                                        <tr
                                            key={`${item.item}-${index}`}
                                            className="border-t border-[#F7EEEA] text-sm text-[#2C1810]"
                                        >
                                            <td className="px-4 py-3.5">{item.item}</td>
                                            <td className="px-4 py-3.5">{item.qty}</td>
                                            <td className="px-4 py-3.5">{item.days}</td>
                                            <td className="px-4 py-3.5">{item.unitPrice}</td>
                                            <td className="px-4 py-3.5">{item.subtotal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="space-y-3 p-4 md:hidden">
                            {orderedItems.map((item, index) => (
                                <div
                                    key={`${item.item}-${index}-mobile`}
                                    className="rounded-xl border border-[#F3E7E1] bg-[#FFFDFC] p-4"
                                >
                                    <p className="text-sm font-semibold text-[#2C1810]">{item.item}</p>
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-[#6D5548]">
                                        <span>Qty: {item.qty}</span>
                                        <span>Days: {item.days}</span>
                                        <span>{item.unitPrice}</span>
                                        <span>{item.subtotal}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdaptiveCard>
    )
}

export default OrderRentalDetail