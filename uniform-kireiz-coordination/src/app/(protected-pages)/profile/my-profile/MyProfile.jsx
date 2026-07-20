'use client'

import React, { useEffect, useRef, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
    FiArrowLeft,
    FiBox,
    FiChevronLeft,
    FiChevronRight,
    FiDownload,
    FiEdit2,
    FiFileText,
    FiLock,
    FiPlus,
    FiPrinter,
} from 'react-icons/fi'
import { HiCheckCircle } from 'react-icons/hi'
import { CiUser } from 'react-icons/ci'
import { GoArrowRight } from 'react-icons/go'
import { apiGetProfile, apiGetQuotation } from '@/services/AuthProfileService'
import { jsPDF } from 'jspdf'

const defaultLineItems = [
    {
        name: 'Chef Coat - Premium Cotton',
        meta: 'White, Size M, Embroidered Logo',
        qty: 50,
        price: 45.0,
        total: 2250.0,
    },
    {
        name: 'Apron - Heavy Duty',
        meta: 'Black, Adjustable Strap',
        qty: 50,
        price: 25.0,
        total: 1250.0,
    },
    {
        name: 'Setup Fee - Embroidery',
        meta: 'One-time digitizing fee',
        qty: 1,
        price: 150.0,
        total: 150.0,
    },
]

const recentLinkedItems = [
    { id: '#FORM-3024-TPRO', sub: 'Medical Scrubs Bulk' },
    { id: '#FORM-4024-SFDB', sub: 'Corporate Shirts' },
    { id: 'Corporate Girl', sub: 'Custom Uniform Set' },
]

const recentSimulationItems = [
    { title: 'Medical & Nursing Care', date: '3 hr, Nov 15', status: 'OPEN' },
    { title: 'Food Service & Dining', date: '3 hr, Nov 15', status: 'OPEN' },
    { title: 'Construction & Safety', date: '3 hr, Oct 22', status: 'CLOSED' },
]

const parseSizeRange = (sizeQuantity) => {
    if (Array.isArray(sizeQuantity) && sizeQuantity.length) {
        return sizeQuantity.slice(0, 3).map((item, index) => ({
            label: item?.size || ['XS', 'S', 'M'][index] || `S${index + 1}`,
            value: item?.quantity || 1,
        }))
    }

    if (sizeQuantity && typeof sizeQuantity === 'object') {
        return Object.entries(sizeQuantity)
            .slice(0, 3)
            .map(([label, value]) => ({ label, value: value || 1 }))
    }

    return [
        { label: 'XS', value: 1 },
        { label: 'S', value: 1 },
        { label: 'M', value: 1 },
    ]
}

const formatCreatedLabel = (value) => {
    if (!value) {
        return 'Created 2 days ago'
    }

    const createdAt = new Date(value)
    if (Number.isNaN(createdAt.getTime())) {
        return 'Created 2 days ago'
    }

    const now = new Date('2026-07-20T00:00:00')
    const diff = Math.max(
        0,
        Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    )

    if (diff === 0) return 'Created today'
    if (diff === 1) return 'Created 1 day ago'
    return `Created ${diff} days ago`
}

const buildQuotationPdfBlobUrl = (quotation) => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const marginX = 56

    const navy = [0, 53, 96]
    const darkText = [17, 24, 39]
    const grayText = [75, 85, 99]
    const lightGray = [107, 114, 128]
    const borderBlue = [215, 227, 244]
    const rowBorder = [238, 242, 247]
    const topBarBlue = [13, 77, 126]

    doc.setFillColor(...topBarBlue)
    doc.rect(0, 0, pageWidth, 8, 'F')

    const logoSize = 30
    const logoY = 40
    doc.setDrawColor(...borderBlue)
    doc.rect(marginX, logoY, logoSize, logoSize)
    doc.setTextColor(...navy)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('KF', marginX + logoSize / 2, logoY + logoSize / 2 + 3, { align: 'center' })

    doc.setTextColor(...darkText)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(26)
    doc.text('QUOTATION', marginX, logoY + logoSize + 34)

    doc.setTextColor(...grayText)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const quotationNo = quotation?.quotationNo || quotation?.quotation_id || 'Q-2023-88'
    doc.text(`#${quotationNo}`, marginX, logoY + logoSize + 50)

    const companyName = quotation?.company_name || quotation?.companyName || 'UniformPro Inc.'
    const rightX = pageWidth - marginX
    doc.setTextColor(...navy)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(companyName, rightX, 46, { align: 'right' })
    doc.setTextColor(...grayText)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.text('123 Fashion Blvd', rightX, 60, { align: 'right' })
    doc.text('New York, NY 10001', rightX, 73, { align: 'right' })
    doc.text('USA', rightX, 86, { align: 'right' })

    const tableTop = logoY + logoSize + 90
    const colDesc = marginX
    const colQty = marginX + 250
    const colPrice = marginX + 305
    const colTotal = marginX + 385

    doc.setTextColor(...grayText)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.text('Description', colDesc, tableTop)
    doc.text('Qty', colQty, tableTop)
    doc.text('Unit Price', colPrice, tableTop)
    doc.text('Total', colTotal, tableTop)

    doc.setDrawColor(...borderBlue)
    doc.line(marginX, tableTop + 8, rightX, tableTop + 8)

    const items = quotation?.line_items?.length ? quotation.line_items : defaultLineItems
    let rowY = tableTop + 32
    const rowGap = 54

    items.forEach((item) => {
        doc.setTextColor(...darkText)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9.5)
        doc.text(item.name, colDesc, rowY)

        doc.setTextColor(...lightGray)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.text(item.meta || '', colDesc, rowY + 12)

        doc.setTextColor(...grayText)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.text(String(item.qty), colQty, rowY)
        doc.text(`$${Number(item.price).toFixed(2)}`, colPrice, rowY)

        doc.setTextColor(...darkText)
        doc.setFont('helvetica', 'bold')
        doc.text(`$${Number(item.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, colTotal, rowY)

        doc.setDrawColor(...rowBorder)
        doc.line(marginX, rowY + 20, rightX, rowY + 20)

        rowY += rowGap
    })

    const subtotal = items.reduce((sum, item) => sum + Number(item.total || 0), 0)
    const tax = 0
    const total = subtotal + tax
    const summaryLabelX = colTotal - 80

    doc.setDrawColor(...borderBlue)
    doc.line(summaryLabelX, rowY + 4, rightX, rowY + 4)

    doc.setTextColor(...grayText)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('Subtotal', summaryLabelX, rowY + 22)
    doc.text(`$${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, rightX, rowY + 22, { align: 'right' })

    doc.text('Tax', summaryLabelX, rowY + 38)
    doc.text(`$${tax.toFixed(2)}`, rightX, rowY + 38, { align: 'right' })

    doc.setDrawColor(...borderBlue)
    doc.line(summaryLabelX, rowY + 46, rightX, rowY + 46)

    doc.setTextColor(...navy)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Total Due', summaryLabelX, rowY + 64)
    doc.text(`$${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, rightX, rowY + 64, { align: 'right' })

    const terms = Array.isArray(quotation?.terms) ? quotation.terms : []
    const footerY = doc.internal.pageSize.getHeight() - 70
    doc.setDrawColor(...rowBorder)
    doc.line(marginX, footerY, rightX, footerY)
    doc.setTextColor(...lightGray)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    terms.forEach((term, index) => {
        doc.text(term, marginX, footerY + 16 + index * 12)
    })

    return { url: URL.createObjectURL(doc.output('blob')), doc }
}

const QuotationPreviewCard = ({ quotation }) => {
    const [pdfUrl, setPdfUrl] = useState('')
    const docRef = useRef(null)

    useEffect(() => {
        const existingUrl =
            quotation?.pdf_url ||
            quotation?.pdf ||
            quotation?.quotation_pdf ||
            quotation?.quotationPdf ||
            quotation?.export_pdf_url

        if (existingUrl) {
            setPdfUrl(`${existingUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`)
            docRef.current = null
            return
        }

        const { url, doc } = buildQuotationPdfBlobUrl(quotation)
        docRef.current = doc
        setPdfUrl(`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`)

        return () => {
            URL.revokeObjectURL(url)
        }
    }, [quotation])

    const quotationNo = quotation?.quotationNo || quotation?.quotation_id || 'Uniform_Quote_Q-2023-88'

    const handleDownload = () => {
        if (docRef.current) {
            docRef.current.save(`${quotationNo}.pdf`)
        } else if (pdfUrl) {
            const link = document.createElement('a')
            link.href = pdfUrl.split('#')[0]
            link.download = `${quotationNo}.pdf`
            link.click()
        }
    }

    const handlePrint = () => {
        const rawUrl = pdfUrl.split('#')[0]
        if (!rawUrl) return
        const printWindow = window.open(rawUrl)
        printWindow?.addEventListener('load', () => printWindow.print())
    }

    return (
        <div className="relative h-fit rounded-[20px] bg-[#1F2937] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
            <div className="mb-3 flex items-center justify-between text-[11px] text-white/80">
                <div className="max-w-[200px] truncate rounded-md bg-white/10 px-3 py-1.5">
                    {quotationNo}
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-white/10 px-2.5 py-1.5 text-[10px]">100%</span>
                    <button className="rounded-md p-1.5 hover:bg-white/10" onClick={handleDownload}>
                        <FiDownload size={13} />
                    </button>
                    <button className="rounded-md p-1.5 hover:bg-white/10" onClick={handlePrint}>
                        <FiPrinter size={13} />
                    </button>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-[10px] bg-white">
                {pdfUrl ? (
                    <iframe
                        src={pdfUrl}
                        title="Quotation PDF preview"
                        className="h-[560px] w-full border-0 bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    />
                ) : (
                    <div className="flex h-[560px] items-center justify-center">
                        <Spinner size={24} />
                    </div>
                )}

                <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
                    <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-[#111827] px-3 py-1.5 text-[10px] text-white/85 shadow-md">
                        <button className="text-white/60 hover:text-white">
                            <FiChevronLeft size={14} />
                        </button>
                        <span>Page 1 / 1</span>
                        <button className="text-white/60 hover:text-white">
                            <FiChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const SummarySizeRow = ({ label, value }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-[#4B5563]">{label}</span>
        <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded border border-[#E5E7EB] bg-white text-[10px] text-[#4B5563]">-</span>
            <span className="min-w-4 text-center text-xs font-medium text-[#111827]">{value}</span>
            <span className="flex h-5 w-5 items-center justify-center rounded border border-[#E5E7EB] bg-white text-[10px] text-[#4B5563]">+</span>
        </div>
    </div>
)

const MyProfile = () => {
    const fileRef = useRef(null)
    const { data: session } = useSession()
    const router = useRouter()
    const [profile, setProfile] = useState(null)
    const [quotationData, setQuotationData] = useState([])
    const [image, setImage] = useState(null)
    const [profileLoading, setProfileLoading] = useState(true)
    const [quotationLoading, setQuotationLoading] = useState(true)
    const [selectedQuotation, setSelectedQuotation] = useState(null)

    const activeQuotation = selectedQuotation || quotationData?.[0] || null
    const sizeRange = parseSizeRange(activeQuotation?.size_quantity)
    const terms = Array.isArray(activeQuotation?.terms) ? activeQuotation.terms : []

    const fetchProfile = async () => {
        try {
            if (!session?.accessToken) return
            setProfileLoading(true)
            const res = await apiGetProfile(session.accessToken)
            if (res?.status && res?.data) {
                setProfile(res.data)
                setImage(res.data.profileImage || null)
            }
        } catch (error) {
            console.error('Profile API error:', error)
        } finally {
            setProfileLoading(false)
        }
    }

    const fetchQuotation = async () => {
        try {
            if (!session?.accessToken) return
            setQuotationLoading(true)
            const res = await apiGetQuotation(session.accessToken)
            if (res?.status) {
                setQuotationData(res.data || [])
            }
        } catch (error) {
            console.error('Quotation API error:', error)
        } finally {
            setQuotationLoading(false)
        }
    }

    useEffect(() => {
        if (!session?.accessToken) return
        fetchProfile()
        fetchQuotation()
    }, [session?.accessToken])

    const handleSelectImage = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImage(URL.createObjectURL(file))
    }

    if (profileLoading) {
        return (
            <section className="relative mt-15 mx-auto w-full bg-white px-5 md:px-8 lg:px-12">
                <div className="flex items-center justify-center py-20">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#1C4FA8]" />
                </div>
            </section>
        )
    }

    if (selectedQuotation) {
        return (
            <div className="mx-auto max-w-7xl rounded-[20px] bg-white p-4 md:p-8">
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => setSelectedQuotation(null)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#003560]"
                    >
                        <FiArrowLeft size={16} />
                        Back to Profile
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8 items-start xl:grid-cols-[minmax(0,1.4fr)_320px]">
                    <QuotationPreviewCard quotation={selectedQuotation} />

                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <span className="rounded-full bg-[#E8F1FF] px-3 py-1 text-[10px] font-semibold text-[#1C4FA8]">
                                Pending Review
                            </span>
                            <span className="text-[11px] text-[#9CA3AF]">
                                {formatCreatedLabel(selectedQuotation?.created_at)}
                            </span>
                        </div>

                        <div>
                            <h2 className="text-[38px] font-semibold leading-[1.02] text-[#111827]">
                                Quotation Summary
                            </h2>
                            <p className="mt-2 text-sm text-[#6B7280]">
                                Review the key details before accepting.
                            </p>
                        </div>

                        <div className="rounded-[18px] bg-[#F8FAFC] p-4">
                            <p className="text-[11px] text-[#9CA3AF]">Total Amount (USD)</p>
                            <p className="mt-2 text-xl font-semibold text-[#003560]">
                                {selectedQuotation?.amount || selectedQuotation?.total_amount || ''}
                            </p>
                        </div>

                        <div className="rounded-[18px] bg-[#F8FAFC] p-4">
                            <p className="mb-3 text-[11px] text-[#9CA3AF]">Size Range</p>
                            <div className="space-y-2">
                                {sizeRange.map((item) => (
                                    <SummarySizeRow
                                        key={item.label}
                                        label={item.label}
                                        value={item.value}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[18px] bg-[#F8FAFC] p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <FiBox className="text-[#003560]" size={14} />
                                <p className="text-sm font-semibold text-[#111827]">Notes & Terms</p>
                            </div>
                            <div className="space-y-3">
                                {terms.map((term) => (
                                    <div key={term} className="flex gap-3 text-sm text-[#4B5563]">
                                        <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#60A5FA]" />
                                        <p>{term}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button className="h-12 w-full rounded-lg bg-[#003560] text-white hover:bg-[#002a49]">
                                Accept Quotation
                            </Button>
                            <Button
                                variant="default"
                                className="h-12 w-full rounded-lg border border-[#D7E3F4] bg-white text-[#111827]"
                            >
                                Request Changes
                            </Button>
                            <button className="w-full text-center text-xs text-[#9CA3AF]">
                                Decline Quote
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6 bg-[#F9FAFB]">
            <div className="rounded-[14px] border border-[#D7E3F4] bg-white p-4 md:p-5">
                <div className="flex flex-col gap-4 lg:flex-row">
                    <div className="w-full max-w-[128px] rounded-[14px] border border-[#D7E3F4] bg-[#F7FBFF] p-3">
                        <div className="mx-auto w-fit rounded-full border border-[#D7E3F4] bg-white p-1">
                            <Avatar
                                size={68}
                                icon={<CiUser />}
                                src={image}
                                className="object-cover shadow-sm"
                            />
                        </div>

                        <div className="mt-3 flex justify-center gap-2 text-[10px]">
                            <button className="text-[#60A5FA]" onClick={() => fileRef.current?.click()}>
                                upload
                            </button>
                            <button className="text-[#EF4444]">Preview</button>
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            ref={fileRef}
                            className="hidden"
                            onChange={handleSelectImage}
                        />
                    </div>

                    <div className="flex-1 rounded-[14px] border border-[#D7E3F4] bg-[#FBFDFF] p-4">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <h4 className="text-sm font-semibold text-[#111827]">Personal Details</h4>
                            <span className="flex items-center gap-1 rounded-full bg-[#E8FAF1] px-2 py-1 text-[10px] text-[#22C55E]">
                                <HiCheckCircle size={12} />
                                Verified Account
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <p className="text-[10px] text-[#9CA3AF]">First Name</p>
                                <p className="mt-1 text-xs font-medium text-[#111827]">
                                    {profile?.firstName || 'John'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-[#9CA3AF]">Last Name</p>
                                <p className="mt-1 text-xs font-medium text-[#111827]">
                                    {profile?.lastName || 'Doe'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-[#9CA3AF]">Email Address</p>
                                <p className="mt-1 text-xs font-medium text-[#111827]">
                                    {profile?.email || 'john@company.com'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-[#9CA3AF]">Phone Number</p>
                                <p className="mt-1 text-xs font-medium text-[#111827]">
                                    {profile?.phone || '+91 90-1234-5678'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-[#9CA3AF]">Position</p>
                                <p className="mt-1 text-xs font-medium text-[#111827]">
                                    {profile?.roleName || 'Manager'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                        size="sm"
                        className="border border-[#D7E3F4] bg-white text-[#4B5563]"
                        onClick={() => router.push('/profile/personal-information')}
                    >
                        <FiEdit2 className="mr-2" />
                        Edit Profile
                    </Button>
                    <Button
                        size="sm"
                        className="border border-[#D7E3F4] bg-white text-[#4B5563]"
                        onClick={() => router.push('/profile/change-password')}
                    >
                        <FiLock className="mr-2" />
                        Change Password
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden rounded-[10px] border border-[#8DB4E2] bg-white">
                <div className="flex items-center justify-between border-b border-[#E5EDF7] px-4 py-3">
                    <div>
                        <h4 className="text-sm font-semibold text-[#003560]">Quotation Status</h4>
                        <p className="mt-1 text-[11px] text-[#6B7280]">
                            {activeQuotation?.quotationNo || activeQuotation?.quotation_id || 'RQ-2025-0194'}
                        </p>
                        <p className="text-[10px] text-[#9CA3AF]">November 20, 2025</p>
                    </div>

                    <Button className="rounded-md bg-[#003560] px-4 py-2 text-xs text-white hover:bg-[#002a49]">
                        View Design
                    </Button>
                </div>

                <div className="bg-[#F9FAFB] px-4 py-2">
                    {quotationLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Spinner size={24} />
                        </div>
                    ) : quotationData.length ? (
                        quotationData.slice(0, 3).map((quotation, index) => (
                            <div
                                key={quotation?.quotation_id || quotation?.quotationNo || index}
                                className="flex items-center justify-between border-b border-[#EDF2F7] px-2 py-4 last:border-b-0"
                            >
                                <p className="text-sm text-[#111827]">
                                    {quotation?.company_name || quotation?.companyName || 'Acme Corp'}
                                </p>

                                <button
                                    type="button"
                                    className="flex flex-col items-center gap-1 text-[10px] font-medium text-[#4B5563]"
                                    onClick={() => setSelectedQuotation(quotation)}
                                >
                                    <FiFileText className="text-[#003560]" size={16} />
                                    View PDF
                                </button>
                            </div>
                        ))
                    ) : (
                        ['Acme Corp', 'Umbrella Corp', 'Cyberdyne'].map((company) => (
                            <div
                                key={company}
                                className="flex items-center justify-between border-b border-[#EDF2F7] px-2 py-4 last:border-b-0"
                            >
                                <p className="text-sm text-[#111827]">{company}</p>
                                <button
                                    type="button"
                                    className="flex flex-col items-center gap-1 text-[10px] font-medium text-[#4B5563]"
                                    onClick={() => setSelectedQuotation({ company_name: company })}
                                >
                                    <FiFileText className="text-[#003560]" size={16} />
                                    View PDF
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="overflow-hidden rounded-[10px] border border-[#E5EDF7] bg-white">
                    <div className="flex items-center justify-between px-4 py-3">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                            <FiBox size={14} />
                            Recent Orders
                        </h4>
                        <button
                            className="flex items-center gap-1 text-[11px] text-[#60A5FA]"
                            onClick={() => router.push('/profile/order-history')}
                        >
                            View All <GoArrowRight size={12} />
                        </button>
                    </div>

                    <div className="px-4 pb-4">
                        <div className="rounded-[10px] border border-[#EEF2F7] p-3">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-[#9CA3AF]">ORDER NUMBER</p>
                                    <p className="mt-1 text-xs font-semibold text-[#003560]">#ORD-10234</p>
                                </div>
                                <span className="rounded-full bg-[#DCFCE7] px-2 py-1 text-[10px] text-[#22C55E]">
                                    Completed
                                </span>
                            </div>

                            <div className="mb-3 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-[#9CA3AF]">Date</p>
                                    <p className="mt-1 text-[11px] text-[#111827]">December 2025</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#9CA3AF]">Total Amount</p>
                                    <p className="mt-1 text-[11px] text-[#111827]">¥454.00</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button size="sm" className="bg-[#1C4FA8] text-white hover:bg-[#1C4FA8]">
                                    View Details
                                </Button>
                                <Button
                                    size="sm"
                                    variant="default"
                                    className="border border-[#D7E3F4] bg-white text-[#111827]"
                                >
                                    Track
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="mb-2 text-[11px] font-semibold text-[#4B5563]">
                                Linked Quotes & Orders
                            </p>
                            <div className="space-y-2">
                                {recentLinkedItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded-[10px] border border-[#EEF2F7] px-3 py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="rounded bg-[#F9FAFB] p-2">
                                                <FiFileText className="text-[#94A3B8]" size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-medium text-[#111827]">{item.id}</p>
                                                <p className="text-[10px] text-[#9CA3AF]">{item.sub}</p>
                                            </div>
                                        </div>
                                        <FiChevronRight className="text-[#94A3B8]" size={14} />
                                    </div>
                                ))}
                            </div>

                            <p
                                className="mt-4 cursor-pointer text-center text-[11px] text-[#4B5563]"
                                onClick={() => router.push('/profile/order-history')}
                            >
                                View All Linked Orders
                            </p>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-[10px] border border-[#E5EDF7] bg-white">
                    <div className="flex items-center justify-between px-4 py-3">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                            <FiFileText size={14} />
                            Recent Simulations
                        </h4>
                        <button
                            className="flex items-center gap-1 text-[11px] text-[#60A5FA]"
                            onClick={() => router.push('/profile/simulation-history')}
                        >
                            View All <GoArrowRight size={12} />
                        </button>
                    </div>

                    <div className="px-4 pb-4">
                        <div className="space-y-4">
                            {recentSimulationItems.map((item) => (
                                <div key={`${item.title}-${item.date}`} className="flex items-start justify-between">
                                    <div className="flex gap-3">
                                        <span className="mt-1 h-2.5 w-2.5 rounded-full border border-[#60A5FA]" />
                                        <div>
                                            <p className="text-[11px] font-medium text-[#111827]">{item.title}</p>
                                            <p className="mt-1 text-[10px] text-[#9CA3AF]">{item.date}</p>
                                            <button className="mt-2 flex items-center gap-1 text-[10px] text-[#60A5FA]">
                                                <FiDownload size={12} />
                                                PDF Download
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span
                                            className={`rounded px-2 py-1 text-[10px] ${
                                                item.status === 'OPEN'
                                                    ? 'bg-[#DBEAFE] text-[#60A5FA]'
                                                    : 'bg-[#F3F4F6] text-[#9CA3AF]'
                                            }`}
                                        >
                                            {item.status}
                                        </span>
                                        <p className="mt-3 text-[10px] text-[#9CA3AF]">View Details</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6">
                            <Button
                                variant="default"
                                className="w-full border border-[#D7E3F4] bg-[#F9FAFB] text-[#4B5563]"
                                onClick={() => router.push('/dashboards')}
                            >
                                <FiPlus className="mr-2" />
                                Create New Simulation
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MyProfile