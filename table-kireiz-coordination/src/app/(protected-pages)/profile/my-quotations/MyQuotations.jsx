'use client'

import { useMemo, useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FiChevronLeft, FiChevronRight, FiEye, FiFileText, FiSearch } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
// import { useSettingsStore } from '../_store/settingsStore'

export const quotationStatusStyles = {
    Accepted: 'bg-[#E8F9ED] text-[#2BA24C]',
    Rejected: 'bg-[#FFE8E8] text-[#F04438]',
    'Quotation Ready': 'bg-[#FFF1E7] text-[#C46A2D]',
    'Contract Pending': 'bg-[#FFF5D6] text-[#F59E0B]',
    Completed: 'bg-[#EAFBF0] text-[#16A34A]',
    Sent: 'bg-[#F1EAFE] text-[#7C3AED]',
    Signed: 'bg-[#E6FFF7] text-[#0F9F6E]',
}

export const quotationStatusOptions = [
    'All Status',
    'Accepted',
    'Rejected',
    'Quotation Ready',
    'Contract Pending',
    'Completed',
    'Sent',
    'Signed',
]

const quotationViewMap = {
    Accepted: 'contract-accepted-detail',
    Sent: 'sent-quotation-detail',
    Rejected: 'rejected-quotation-detail',
    Signed: 'signed-quotation-detail',
    'Quotation Ready': 'quotation-ready-detail',
}

export const quotationsData = [
    {
        id: 'QT-2024',
        rentalPeriod: '12 Jun - 26 Jun 2024',
        items: 6,
        submittedOn: 'Aug 15, 2024',
        status: 'Sent',
        company: 'ABC Hotels Pvt Ltd',
        contact: 'John Smith',
        businessEmail: 'Debra.Holt@Example.Com',
        phone: '(235) 555-0108',
        companyAddress: 'Sakura Grand Hotel C5, Chiyoda-Ku Tokyo, 100-0005 Japan',
        quotationDate: '20 May 2024',
        quotationStatus: 'Sent',
        quotationExpiry: '25 May 2024',
        validity: '25 May 2024',
        rentalStartDate: '12 Jun 2024',
        rentalEndDate: '26 Jun 2024',
        eventType: 'Wedding',
        venue: 'Grand Hyatt Tokyo',
        total: '¥18,500',
        notes:
            'We require the chandeliers to be installed no later than 6 AM on the 14th. All items must coordinate in gold and crystal tones. Please confirm availability at your earliest convenience.',
        requestedItemsSubtitle: '6 items for 2-day rental period',
        requestedItems: [
            { item: 'Crystal Chandelier (Large)', category: 'Lighting', qty: 3, unitRate: '¥450.00' },
            { item: 'Gold Candelabra (Tall)', category: 'Centerpieces', qty: 12, unitRate: '¥85.00' },
            { item: 'Marble Pedestal', category: 'Stands', qty: 6, unitRate: '¥120.00' },
            { item: 'White Velvet Chair Cover', category: 'Linens', qty: 200, unitRate: '¥3.00' },
            { item: 'Gold Charger Plate', category: 'Tableware', qty: 200, unitRate: '¥6.00' },
            { item: 'Crystal Centerpiece Vase', category: 'Centerpieces', qty: 24, unitRate: '¥45.00' },
        ],
    },
    {
        id: 'QT-2025',
        rentalPeriod: '18 Jun - 22 Jun 2024',
        items: 4,
        submittedOn: 'Aug 12, 2024',
        status: 'Rejected',
        company: 'Skyline Events',
        contact: 'Daniel Reed',
        businessEmail: 'daniel@skylineevents.com',
        phone: '(235) 555-0140',
        companyAddress: '88 Garden Avenue, Kyoto, 605-0074 Japan',
        quotationDate: '2024-08-12',
        quotationStatus: 'Rejected',
        quotationExpiry: '2024-08-20',
        validity: '8 WD 2024',
        rentalStartDate: '18 Jun 2024',
        rentalEndDate: '22 Jun 2024',
        eventType: 'Corporate',
        venue: 'Maple Grand Hall',
        total: '¥10,240',
        notes:
            'Client requested a cost reduction on centerpiece rentals and adjusted the guest count after review.',
        rejectionReason:
            'Some requested items are unavailable for the selected rental dates. Please update your request or choose alternative items and submit a new quotation request.',
        requestedItemsSubtitle: '4 items for 2-day rental period',
        requestedItems: [
            { item: 'Acrylic Podium', category: 'Stands', qty: 2, unitRate: '¥180.00' },
            { item: 'Branded Table Runner', category: 'Linens', qty: 10, unitRate: '¥24.00' },
            { item: 'LED Uplighter', category: 'Lighting', qty: 16, unitRate: '¥32.00' },
            { item: 'Cocktail Table Cover', category: 'Linens', qty: 12, unitRate: '¥18.00' },
        ],
    },
    {
        id: 'QT-2026',
        rentalPeriod: '20 Jun - 28 Jun 2024',
        items: 8,
        submittedOn: 'Aug 10, 2024',
        status: 'Quotation Ready',
        company: 'Golden Petals',
        contact: 'Sophia Green',
        businessEmail: 'hello@goldenpetals.co',
        phone: '(235) 555-0176',
        companyAddress: '7 Blossom Street, Osaka, 530-0001 Japan',
        quotationDate: '2024-08-10',
        quotationStatus: 'Quotation Ready',
        quotationExpiry: '2024-08-22',
        validity: '12 WD 2024',
        rentalStartDate: '20 Jun 2024',
        rentalEndDate: '28 Jun 2024',
        eventType: 'Wedding',
        venue: 'Rosewood Pavilion',
        total: '¥26,900',
        notes:
            'Proposal includes floral risers and mirrored stage accents pending final venue walk-through.',
        documentPreviewName: 'Quotation_X-2024-QT.pdf',
        requestedItemsSubtitle: '4 items for 2-day rental period',
        requestedItems: [
            { item: 'Mirror Plinth', category: 'Stands', qty: 8, unitRate: '¥88.00' },
            { item: 'Gold Arch Frame', category: 'Decor', qty: 2, unitRate: '¥320.00' },
            { item: 'Ivory Runner', category: 'Linens', qty: 14, unitRate: '¥16.00' },
            { item: 'Crystal Tea Light', category: 'Tableware', qty: 90, unitRate: '¥3.50' },
        ],
    },
    {
        id: 'QT-2027',
        rentalPeriod: '24 Jun - 29 Jun 2024',
        items: 5,
        submittedOn: 'Aug 08, 2024',
        status: 'Contract Pending',
        company: 'Urban Circle',
        contact: 'Noah Brooks',
        businessEmail: 'events@urbancircle.jp',
        phone: '(235) 555-0199',
        companyAddress: '14 Downtown Plaza, Yokohama, 220-0012 Japan',
        quotationDate: '2024-08-08',
        quotationStatus: 'Contract Pending',
        quotationExpiry: '2024-08-19',
        validity: '11 WD 2024',
        rentalStartDate: '24 Jun 2024',
        rentalEndDate: '29 Jun 2024',
        eventType: 'Events',
        venue: 'City Banquet Hall',
        total: '¥14,600',
        notes:
            'Awaiting signed rental contract and final confirmation on loading dock timing from venue management.',
        requestedItems: [
            { item: 'Black Dining Chair', category: 'Seating', qty: 120, unitRate: '¥10.00' },
            { item: 'Stage Backdrop Panel', category: 'Decor', qty: 6, unitRate: '¥140.00' },
            { item: 'Cocktail Glass Set', category: 'Tableware', qty: 150, unitRate: '¥5.00' },
        ],
    },
    {
        id: 'QT-2028',
        rentalPeriod: '04 Jul - 06 Jul 2024',
        items: 7,
        submittedOn: 'Aug 05, 2024',
        status: 'Completed',
        company: 'Northstar Dining',
        contact: 'Emma Carter',
        businessEmail: 'ops@northstardining.com',
        phone: '(235) 555-0221',
        companyAddress: '210 Riverfront Road, Sapporo, 060-0003 Japan',
        quotationDate: '2024-08-05',
        quotationStatus: 'Completed',
        quotationExpiry: '2024-08-16',
        validity: '11 WD 2024',
        rentalStartDate: '04 Jul 2024',
        rentalEndDate: '06 Jul 2024',
        eventType: 'Events',
        venue: 'The Courtyard',
        total: '¥31,250',
        notes:
            'Delivery, setup, and teardown completed successfully. Final inventory reconciliation signed by client.',
        requestedItems: [
            { item: 'Banquet Table', category: 'Furniture', qty: 20, unitRate: '¥42.00' },
            { item: 'White Plate Set', category: 'Tableware', qty: 220, unitRate: '¥4.00' },
            { item: 'Silver Cutlery Set', category: 'Tableware', qty: 220, unitRate: '¥3.00' },
        ],
    },
    {
        id: 'QT-2029',
        rentalPeriod: '10 Jul - 15 Jul 2024',
        items: 3,
        submittedOn: 'Aug 03, 2024',
        status: 'Sent',
        company: 'Silver Oak',
        contact: 'Liam Walker',
        businessEmail: 'sales@silveroak.jp',
        phone: '(235) 555-0260',
        companyAddress: '31 Orchard Lane, Nagoya, 450-0002 Japan',
        quotationDate: '2024-08-03',
        quotationStatus: 'Sent',
        quotationExpiry: '2024-08-14',
        validity: '11 WD 2024',
        rentalStartDate: '10 Jul 2024',
        rentalEndDate: '15 Jul 2024',
        eventType: 'Parties',
        venue: 'Lakeview Garden',
        total: '¥8,960',
        notes:
            'Client requested a revised beverage station layout; awaiting feedback on alternate plan.',
        requestedItems: [
            { item: 'Cake Display Stand', category: 'Stands', qty: 4, unitRate: '¥55.00' },
            { item: 'Dessert Plate', category: 'Tableware', qty: 80, unitRate: '¥3.00' },
            { item: 'Lantern Set', category: 'Lighting', qty: 12, unitRate: '¥22.00' },
        ],
    },
    {
        id: 'QT-2030',
        rentalPeriod: '16 Jul - 18 Jul 2024',
        items: 9,
        submittedOn: 'Aug 01, 2024',
        status: 'Signed',
        company: 'Pearl & Pine',
        contact: 'Mia Turner',
        businessEmail: 'mia@pearlandpine.com',
        phone: '(235) 555-0290',
        companyAddress: '5 Pearl Square, Kobe, 650-0021 Japan',
        quotationDate: '2024-08-01',
        quotationStatus: 'Signed',
        quotationExpiry: '2024-08-12',
        validity: '11 WD 2024',
        rentalStartDate: '16 Jul 2024',
        rentalEndDate: '18 Jul 2024',
        eventType: 'Wedding',
        venue: 'Pearl Convention',
        total: '¥34,400',
        signedDate: '22 Mar 2024',
        contractStatus: 'Signed',
        customerNotes:
            'We require the chandeliers to be installed no later than 6 AM on the 14th. All items must coordinate in gold and crystal tones. Please confirm availability at your earliest convenience.',
        requestedItemsSubtitle: '4 items for 2-day rental period',
        summary: {
            items: '4 line items',
            rentalDuration: '2 days',
            subtotal: '¥19,500.00',
            discount: '¥650.00',
            delivery: '¥500.00',
            total: '¥18,350.00',
        },
        notes:
            'Accepted package includes custom charger plates and premium lounge furniture for the cocktail area.',
        requestedItems: [
            { item: 'Lounge Sofa', category: 'Furniture', qty: 8, unitRate: '¥130.00' },
            { item: 'Rose Gold Charger', category: 'Tableware', qty: 160, unitRate: '¥6.00' },
            { item: 'Accent Ottoman', category: 'Furniture', qty: 12, unitRate: '¥48.00' },
        ],
    },
    {
        id: 'QT-2031',
        rentalPeriod: '22 Jul - 24 Jul 2024',
        items: 6,
        submittedOn: 'Jul 28, 2024',
        status: 'Accepted',
        company: 'Flora Wave',
        contact: 'James Scott',
        businessEmail: 'team@florawave.com',
        phone: '(235) 555-0315',
        companyAddress: '9 Blossom Court, Fukuoka, 810-0001 Japan',
        quotationDate: '2024-07-28',
        quotationStatus: 'Accepted',
        quotationExpiry: '2024-08-08',
        validity: '11 WD 2024',
        rentalStartDate: '22 Jul 2024',
        rentalEndDate: '24 Jul 2024',
        eventType: 'Events',
        venue: 'Garden Terrace',
        total: '¥19,350',
        notes:
            'Approved for terrace installation with weather backup inventory reserved for indoor transition.',
        requestedItems: [
            { item: 'Garden Chair', category: 'Seating', qty: 90, unitRate: '¥8.00' },
            { item: 'Floral Bowl', category: 'Centerpieces', qty: 18, unitRate: '¥20.00' },
            { item: 'String Lights', category: 'Lighting', qty: 14, unitRate: '¥26.00' },
        ],
    },
]

export const getQuotationById = (quotationId) =>
    quotationsData.find((quotation) => quotation.id === quotationId) || quotationsData[0]

const MyQuotations = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('All Status')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const router = useRouter()
    // const { setCurrentView, setSelectedQuotationId } = useSettingsStore()

    const filteredQuotations = useMemo(() => {
        return quotationsData.filter((quote) => {
            const matchesSearch =
                quote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quote.company.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus =
                statusFilter === 'All Status' || quote.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [searchTerm, statusFilter])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, statusFilter])

    const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage) || 1

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [totalPages, currentPage])

    const paginatedQuotations = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredQuotations.slice(start, start + itemsPerPage)
    }, [filteredQuotations, currentPage])

    const startItem = filteredQuotations.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, filteredQuotations.length)

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return
        setCurrentPage(page)
    }

    const getPageNumbers = () => {
        const pages = []
        const maxVisible = 5

        if (totalPages <= maxVisible + 2) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
            return pages
        }

        pages.push(1)
        let start = Math.max(2, currentPage - 1)
        let end = Math.min(totalPages - 1, currentPage + 1)

        if (currentPage <= 3) end = 4
        if (currentPage >= totalPages - 2) start = totalPages - 3

        if (start > 2) pages.push('...')
        for (let i = start; i <= end; i++) pages.push(i)
        if (end < totalPages - 1) pages.push('...')

        pages.push(totalPages)
        return pages
    }

    const handleViewQuotation = (quotationId) => {
        const selectedQuotation = quotationsData.find((quote) => quote.id === quotationId)
        const targetView = quotationViewMap[selectedQuotation?.status]

        if (!selectedQuotation || !targetView) {
            return
        }

        router.push(`/profile/my-quotations/${targetView}/${quotationId}`)
    }

    const handleResetFilters = () => {
        setSearchTerm('')
        setStatusFilter('All Status')
        setCurrentPage(1)
    }

    return (
        <div className="w-full bg-[#F5F0EE30] md:p-8 p-5 rounded-2xl max-w-7xl mx-auto shadow-md">
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <FiFileText size={22} className="text-[#5A3E2B]" />
                    <h3 className="text-lg font-semibold text-[#2C1810]">
                        My Quotations
                    </h3>
                </div>
                <p className="text-sm text-[#8B6A55] mt-1">
                    Track every request you&apos;ve submitted to KIREIZ SPACE from initial review through signed contract.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C08A72]">
                        <FiSearch size={16} />
                    </span>
                    <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search by Quote ID ..."
                        className="pl-10 border-[#E7D8D0] bg-white w-1/2"
                    />
                </div>

                <div className="flex gap-3 lg:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="min-w-[160px] rounded-md border border-[#E7D8D0] bg-white px-4 py-2 text-sm text-[#8B6A55] outline-none"
                    >
                        {quotationStatusOptions.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>

                    <Button
                        type="button"
                        onClick={handleResetFilters}
                        className="bg-[#A0522D] hover:bg-[#8B4513] text-white px-5"
                    >
                        Reset
                    </Button>
                </div>
            </div>

            <div className="hidden md:block overflow-x-auto rounded-xl border border-[#EFE3DC]">
                <table className="min-w-full bg-[#FFFDFB]">
                    <thead className="bg-[#F3EAE6]">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wide text-[#8B6A55]">
                            <th className="px-6 py-4">Quote ID</th>
                            <th className="px-6 py-4">Rental Period</th>
                            <th className="px-6 py-4">Items</th>
                            <th className="px-6 py-4">Submitted On</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Action</th>

                        </tr>
                    </thead>
                    <tbody>
                        {paginatedQuotations.map((quote) => (
                            <tr
                                key={quote.id}
                                className="border-t border-[#F2E7E1] text-sm text-[#5A3E2B]"
                            >
                                <td className="px-6 py-4 font-medium">{quote.id}</td>
                                <td className="px-6 py-4">{quote.rentalPeriod}</td>
                                <td className="px-6 py-4">{quote.items}</td>
                                <td className="px-6 py-4">{quote.submittedOn}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${quotationStatusStyles[quote.status]}`}
                                    >
                                        {quote.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        type="button"
                                        onClick={() => handleViewQuotation(quote.id)}
                                        className="inline-flex items-center gap-2 rounded-full border border-[#E6D6CD] px-4 py-2 text-xs font-medium text-[#A0522D]"
                                    >
                                        <FiEye size={14} />
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="md:hidden space-y-3">
                {paginatedQuotations.map((quote) => (
                    <div
                        key={quote.id}
                        className="rounded-xl border border-[#EFE3DC] bg-white p-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-[#2C1810]">{quote.id}</p>
                                <p className="text-xs text-[#8B6A55] mt-1">{quote.rentalPeriod}</p>
                            </div>
                            <span
                                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${quotationStatusStyles[quote.status]}`}
                            >
                                {quote.status}
                            </span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-[#5A3E2B]">
                            <p>Items: {quote.items}</p>
                            <p>Submitted: {quote.submittedOn}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleViewQuotation(quote.id)}
                            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#E6D6CD] px-4 py-2 text-xs font-medium text-[#A0522D]"
                        >
                            <FiEye size={14} />
                            View
                        </button>
                    </div>
                ))}
            </div>

            {filteredQuotations.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#E6D6CD] bg-white px-4 py-10 text-center text-sm text-[#8B6A55]">
                    No quotations found for the selected search and status.
                </div>
            )}

            <div className="mt-5 flex flex-col gap-3 text-[11px] text-[#9A8C82] sm:flex-row sm:items-center sm:justify-between">
                <p>
                    {filteredQuotations.length === 0
                        ? 'No results'
                        : `Showing ${startItem}-${endItem} of ${filteredQuotations.length}`}
                </p>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex h-8 w-8 items-center justify-center rounded border border-[#E9DDD4] text-[#C9B2A3] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <FiChevronLeft size={14} />
                    </button>

                    {getPageNumbers().map((page, idx) =>
                        page === '...' ? (
                            <span key={`dots-${idx}`} className="text-[#8C7C73] px-1">
                                ...
                            </span>
                        ) : (
                            <button
                                key={page}
                                type="button"
                                onClick={() => goToPage(page)}
                                className={`flex h-8 min-w-[30px] items-center justify-center rounded px-2 ${currentPage === page
                                    ? 'bg-[#D88957] text-white'
                                    : 'text-[#8C7C73] hover:bg-[#FCF4EF]'
                                    }`}
                            >
                                {page}
                            </button>
                        )
                    )}

                    <button
                        type="button"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex h-8 w-8 items-center justify-center rounded border border-[#E9DDD4] text-[#8C7C73] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <FiChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MyQuotations