'use client'

import React, { useEffect, useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Spinner from '@/components/ui/Spinner'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
    FiArrowLeft,
    FiChevronLeft,
    FiChevronRight,
    FiDownload,
    FiList,
    FiMaximize2,
    FiMinus,
    FiPlus,
    FiPrinter,
} from 'react-icons/fi'
import { jsPDF } from 'jspdf'
import {
    apiCancelQuotation,
    apiDownloadUserQuotationPdf,
    apiGetQuotationRequestDetail,
    apiGetUserQuotationDetail,
} from '@/services/QuotationRequestService'

const defaultTerms = [
    'Price includes one-time embroidery setup fee of $150.',
    'Standard shipping via FedEx Ground (3-5 business days).',
    '50% deposit required upon acceptance to begin production.',
    'Returns only accepted for manufacturing defects.',
]

const getQuotationStatusMeta = (status) => {
    const normalizedStatus = String(status || 'pending').toLowerCase()

    if (normalizedStatus.includes('accept')) {
        return {
            label: 'Accepted',
            badgeClass: 'bg-[#E8FAF1] text-[#22C55E]',
        }
    }

    if (
        normalizedStatus.includes('cancel') ||
        normalizedStatus.includes('declin') ||
        normalizedStatus.includes('reject')
    ) {
        return {
            label: normalizedStatus.includes('cancel') ? 'Cancelled' : 'Declined',
            badgeClass: 'bg-[#FEF2F2] text-[#DC2626]',
        }
    }

    if (normalizedStatus.includes('review') || normalizedStatus.includes('receiv')) {
        return {
            label: 'In Review',
            badgeClass: 'bg-[#FFF7ED] text-[#EA580C]',
        }
    }

    return {
        label: 'Pending',
        badgeClass: 'bg-[#E8F1FF] text-[#1C4FA8]',
    }
}

const normalizePdfUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') {
        return rawUrl
    }

    const sanitizedUrl = rawUrl.replace(/\[|\]|\(|\)|"|`/g, '').trim()

    if (!sanitizedUrl) {
        return rawUrl
    }

    const preferredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!preferredBaseUrl) {
        return sanitizedUrl
    }

    try {
        const preferredOrigin = new URL(preferredBaseUrl).origin

        if (sanitizedUrl.startsWith('/')) {
            return new URL(sanitizedUrl, preferredOrigin).toString()
        }

        const parsedUrl = new URL(sanitizedUrl)
        if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
            return new URL(
                `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`,
                preferredOrigin,
            ).toString()
        }

        return parsedUrl.toString()
    } catch (error) {
        console.error('Failed to normalize PDF URL:', error)
        return sanitizedUrl
    }
}

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

const normalizeSizeRange = (quotation) => {
    if (Array.isArray(quotation?.size_range) && quotation.size_range.length) {
        return quotation.size_range.map((item, index) => ({
            label: item?.size || item?.label || `Size ${index + 1}`,
            value: item?.quantity || item?.value || 0,
        }))
    }

    return parseSizeRange(quotation?.size_quantity)
}

const formatCreatedLabel = (value) => {
    if (!value) return 'Created recently'

    const createdAt = new Date(value)
    if (Number.isNaN(createdAt.getTime())) return 'Created recently'

    const now = new Date()
    const diff = Math.max(
        0,
        Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    )

    if (diff === 0) return 'Created today'
    if (diff === 1) return 'Created 1 day ago'
    return `Created ${diff} days ago`
}

const normalizeQuotationItem = (item, index) => ({
    id: item?.id || `line-item-${index}`,
    name: item?.name || item?.description || item?.product_name || 'Quotation Item',
    meta: item?.meta || item?.detail || '',
    qty: item?.qty || item?.quantity || 0,
    price: item?.price || item?.unit_price || 0,
    total: item?.total || 0,
})

const normalizeQuotationRecord = (quotation) => {
    const itemsSource = Array.isArray(quotation?.line_items)
        ? quotation.line_items
        : Array.isArray(quotation?.requested_items)
          ? quotation.requested_items
          : Array.isArray(quotation?.items)
            ? quotation.items
            : Array.isArray(quotation?.products)
              ? quotation.products
              : []

    return {
        ...quotation,
        id:
            quotation?.id ||
            quotation?.uuids ||
            quotation?.uuid ||
            quotation?.quotation_id ||
            '',
        uuids: quotation?.uuids || quotation?.uuid || quotation?.id || '',
        quotationNo:
            quotation?.quotationNo || quotation?.quotation_id || quotation?.request_id || '',
        company_name:
            quotation?.company_name ||
            quotation?.companyName ||
            quotation?.contact_person ||
            'Quotation',
        amount:
            quotation?.amount ||
            quotation?.total_amount ||
            quotation?.grand_total ||
            quotation?.total ||
            '0.00',
        total_amount:
            quotation?.total_amount ||
            quotation?.amount ||
            quotation?.grand_total ||
            quotation?.total ||
            '0.00',
        terms: quotation?.terms || quotation?.notes_terms || defaultTerms,
        line_items: itemsSource.map(normalizeQuotationItem),
        pdf_url: normalizePdfUrl(quotation?.pdf_url || quotation?.pdf || ''),
        created_at: quotation?.created_at || quotation?.submitted_at || '',
        status_label:
            quotation?.status_label ||
            getQuotationStatusMeta(quotation?.quotation_status || quotation?.status).label,
        size_quantity: quotation?.size_quantity || quotation?.size_range || {},
        size_range: normalizeSizeRange(quotation),
    }
}

const extractQuotationDetailRecord = (payload) =>
    payload?.data?.data || payload?.data || payload?.result || payload

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
    doc.text('KF', marginX + logoSize / 2, logoY + logoSize / 2 + 3, {
        align: 'center',
    })

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

    const items = quotation?.line_items?.length ? quotation.line_items : []
    let rowY = tableTop + 32

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
        doc.text(
            `$${Number(item.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            colTotal,
            rowY,
        )

        doc.setDrawColor(...rowBorder)
        doc.line(marginX, rowY + 20, rightX, rowY + 20)
        rowY += 54
    })

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

const ZOOM_STEP = 10

const QuotationPreviewCard = ({ quotation, accessToken }) => {
    const [pdfBaseUrl, setPdfBaseUrl] = useState('')
    const [previewLoading, setPreviewLoading] = useState(true)
    const [zoomLevel, setZoomLevel] = useState(100)
    const docRef = useRef(null)

    useEffect(() => {
        let previewObjectUrl = ''
        let generatedObjectUrl = ''
        let isMounted = true

        const loadPreview = async () => {
            setPreviewLoading(true)
            setZoomLevel(100)

            const existingUrl =
                quotation?.pdf_url ||
                quotation?.pdf ||
                quotation?.quotation_pdf ||
                quotation?.quotationPdf ||
                quotation?.export_pdf_url

            const quotationUuid =
                quotation?.uuids ||
                quotation?.uuid ||
                quotation?.id ||
                quotation?.quotation_id

            if (existingUrl && accessToken && quotationUuid) {
                try {
                    const pdfBlob = await apiDownloadUserQuotationPdf(
                        quotationUuid,
                        accessToken,
                        normalizePdfUrl(existingUrl),
                    )

                    if (!isMounted) return

                    previewObjectUrl = URL.createObjectURL(pdfBlob)
                    docRef.current = null
                    setPdfBaseUrl(previewObjectUrl)
                    setPreviewLoading(false)
                    return
                } catch (error) {
                    console.error('Quotation preview blob error:', error)
                }
            }

            const { url, doc } = buildQuotationPdfBlobUrl(quotation)
            if (!isMounted) {
                URL.revokeObjectURL(url)
                return
            }

            generatedObjectUrl = url
            docRef.current = doc
            setPdfBaseUrl(url)
            setPreviewLoading(false)
        }

        loadPreview()

        return () => {
            isMounted = false
            if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl)
            if (generatedObjectUrl) URL.revokeObjectURL(generatedObjectUrl)
        }
    }, [quotation, accessToken])

    const quotationNo = quotation?.quotationNo || quotation?.quotation_id || 'Uniform_Quote_Q-2023-88'
    const pdfFileName = `${quotationNo}.pdf`
    const pdfUrl = pdfBaseUrl
        ? `${pdfBaseUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`
        : ''
    const zoomScale = zoomLevel / 100

    const handleDownload = () => {
        if (docRef.current) {
            docRef.current.save(pdfFileName)
        } else if (pdfBaseUrl) {
            const link = document.createElement('a')
            link.href = pdfBaseUrl
            link.download = pdfFileName
            link.click()
        }
    }

    const handlePrint = () => {
        if (!pdfBaseUrl) return
        const printWindow = window.open(pdfBaseUrl)
        printWindow?.addEventListener('load', () => printWindow.print())
    }

    return (
        <div className="relative h-fit rounded-[20px] bg-[#1F2937] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
            <div className="mb-3 flex items-center justify-between gap-3 text-[11px] text-white/80">
                <div className="flex items-center gap-3">
                    <span className="max-w-[220px] truncate rounded-md bg-[#344054] px-3 py-2 text-[11px] text-white">
                        {pdfFileName}
                    </span>
                    <span className="rounded-md bg-[#344054] px-3 py-2 text-[10px] text-white/90">
                        Read Only
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-md bg-[#1A2233] text-white">
                        <button
                            className="flex h-8 w-8 items-center justify-center rounded-l-md text-white transition-colors hover:bg-white/10"
                            onClick={() => setZoomLevel((prev) => Math.max(10, prev - ZOOM_STEP))}
                        >
                            <FiMinus size={14} />
                        </button>
                        <button
                            className="min-w-[64px] text-center text-[12px] font-medium text-white"
                            onClick={() => setZoomLevel(100)}
                        >
                            {zoomLevel}%
                        </button>
                        <button
                            className="flex h-8 w-8 items-center justify-center rounded-r-md text-white transition-colors hover:bg-white/10"
                            onClick={() => setZoomLevel((prev) => prev + ZOOM_STEP)}
                        >
                            <FiPlus size={14} />
                        </button>
                    </div>
                    <span className="h-6 w-px bg-white/20" />
                    <button
                        className="rounded-md p-1.5 text-white transition-colors hover:bg-white/10"
                        onClick={handleDownload}
                    >
                        <FiDownload size={14} />
                    </button>
                    <button
                        className="rounded-md p-1.5 text-white transition-colors hover:bg-white/10"
                        onClick={handlePrint}
                    >
                        <FiPrinter size={14} />
                    </button>
                </div>
            </div>

            <div className="relative h-[560px] overflow-auto rounded-[10px] bg-[#E5E7EB]">
                {pdfUrl && !previewLoading ? (
                    <div
                        className={`relative flex min-h-[560px] ${
                            zoomLevel <= 100 ? 'items-start justify-center' : 'items-start justify-start'
                        }`}
                        style={{
                            width: zoomLevel > 100 ? `${zoomLevel}%` : '100%',
                            height: zoomLevel > 100 ? `${560 * zoomScale}px` : '560px',
                            minWidth: zoomLevel > 100 ? `${zoomLevel}%` : '100%',
                        }}
                    >
                        <iframe
                            key={pdfBaseUrl}
                            src={pdfUrl}
                            title="Quotation PDF preview"
                            className="border-0 bg-white"
                            style={{
                                width: `${100 / zoomScale}%`,
                                height: `${560 / zoomScale}px`,
                                transform: `scale(${zoomScale})`,
                                transformOrigin: zoomLevel <= 100 ? 'top center' : 'top left',
                                flexShrink: 0,
                            }}
                        />
                    </div>
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

const SummarySizeRow = ({ label }) => (
    <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#4B5563]">{label}</span>
    </div>
)

const ProfileQuotationDetail = ({ quotationId }) => {
    const { data: session } = useSession()
    const router = useRouter()
    const [quotation, setQuotation] = useState(null)
    const [loading, setLoading] = useState(true)
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [cancelSubmitting, setCancelSubmitting] = useState(false)
    const [cancelError, setCancelError] = useState('')

    useEffect(() => {
        const fetchQuotationDetail = async () => {
            if (!session?.accessToken || !quotationId) return

            try {
                setLoading(true)
                try {
                    const res = await apiGetQuotationRequestDetail(
                        quotationId,
                        session.accessToken,
                    )
                    const requestDetail = extractQuotationDetailRecord(res)
                    const detailUuid =
                        requestDetail?.uuids ||
                        requestDetail?.uuid ||
                        requestDetail?.id

                    if (detailUuid) {
                        try {
                            const fullDetailRes = await apiGetUserQuotationDetail(
                                detailUuid,
                                session.accessToken,
                            )
                            const fullDetail = extractQuotationDetailRecord(fullDetailRes)
                            setQuotation(
                                normalizeQuotationRecord({
                                    ...requestDetail,
                                    ...fullDetail,
                                }),
                            )
                            return
                        } catch (fullDetailError) {
                            console.error('Full quotation detail API error:', fullDetailError)
                        }
                    }

                    setQuotation(normalizeQuotationRecord(requestDetail))
                    return
                } catch (requestError) {
                    const fallbackRes = await apiGetUserQuotationDetail(
                        quotationId,
                        session.accessToken,
                    )
                    setQuotation(
                        normalizeQuotationRecord(
                            extractQuotationDetailRecord(fallbackRes),
                        ),
                    )
                }
            } catch (error) {
                console.error('Quotation detail API error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchQuotationDetail()
    }, [quotationId, session?.accessToken])

    const handleCancelQuotation = async () => {
        const id = quotation?.uuids || quotation?.uuid || quotation?.id || quotation?.quotation_id

        if (!session?.accessToken || !id) {
            setCancelError('Quotation not found.')
            return
        }

        if (!cancelReason.trim()) {
            setCancelError('Please enter a reason.')
            return
        }

        try {
            setCancelSubmitting(true)
            setCancelError('')

            const res = await apiCancelQuotation(
                id,
                { cancel_reason: cancelReason.trim() },
                session.accessToken,
            )

            if (res?.success || res?.status) {
                setQuotation((prev) => ({
                    ...prev,
                    status_label: 'Cancelled',
                    quotation_status: 'cancelled',
                    status: 'cancelled',
                    cancel_reason: cancelReason.trim(),
                }))
                setCancelDialogOpen(false)
                setCancelReason('')
                return
            }

            setCancelError(res?.message || 'Unable to cancel quotation.')
        } catch (error) {
            console.error('Cancel quotation error:', error)
            setCancelError(
                error?.response?.data?.message ||
                    error?.response?.data?.detail ||
                    'Unable to cancel quotation.',
            )
        } finally {
            setCancelSubmitting(false)
        }
    }

    if (loading) {
        return (
            <section className="relative mx-auto w-full bg-white px-5 md:px-8 lg:px-12">
                <div className="flex items-center justify-center py-20">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#1C4FA8]" />
                </div>
            </section>
        )
    }

    if (!quotation) {
        return (
            <div className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]">
                Unable to load quotation details.
            </div>
        )
    }

    const selectedStatusMeta = getQuotationStatusMeta(
        quotation?.quotation_status || quotation?.status_label,
    )
    const canCancelQuotation = selectedStatusMeta.label.toLowerCase() === 'pending'
    const sizeRange =
        Array.isArray(quotation?.size_range) && quotation.size_range.length
            ? quotation.size_range
            : parseSizeRange(quotation?.size_quantity)
    const terms =
        Array.isArray(quotation?.terms) && quotation.terms.length
            ? quotation.terms
            : defaultTerms

    return (
        <>
            <div className="mx-auto max-w-7xl rounded-[20px] bg-white p-4 md:p-8">
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => router.push('/profile/my-profile')}
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#003560]"
                    >
                        <FiArrowLeft size={16} />
                        Back to Profile
                    </button>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1.4fr)_320px]">
                    <QuotationPreviewCard quotation={quotation} accessToken={session?.accessToken} />

                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${selectedStatusMeta.badgeClass}`}>
                                {quotation?.status_label || selectedStatusMeta.label}
                            </span>
                            <span className="text-[11px] text-[#9CA3AF]">
                                {formatCreatedLabel(quotation?.created_at)}
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

                        <div className="rounded-[18px] border border-[#F3F4F6] bg-[#F8FAFC] p-4">
                            <p className="text-[11px] text-[#9CA3AF]">Total Amount (USD)</p>
                            <p className="mt-2 text-xl font-semibold text-[#003560]">
                                {quotation?.amount || quotation?.total_amount || '0.00'}
                            </p>
                        </div>

                        <div className="rounded-[18px] bg-[#F7FBFF] p-4">
                            <p className="mb-3 flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
                                <FiMaximize2 size={11} />
                                Size Range
                            </p>
                            <div className="space-y-2">
                                {sizeRange.map((item) => (
                                    <SummarySizeRow key={item.label} label={item.label} value={item.value} />
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[18px] bg-[#DBEAFE] p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <FiList className="text-[#003560]" size={14} />
                                <p className="text-sm font-semibold text-[#111827]">Notes & Terms</p>
                            </div>
                            <div className="space-y-3">
                                {terms.map((term) => (
                                    <div key={term} className="flex gap-3 text-sm text-[#4B5563]">
                                        <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#36A9F8]" />
                                        <p>{term}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {canCancelQuotation && (
                                <Button
                                    className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#003560] text-white hover:bg-[#002a49]"
                                    onClick={() => {
                                        setCancelError('')
                                        setCancelReason('')
                                        setCancelDialogOpen(true)
                                    }}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog
                isOpen={cancelDialogOpen}
                onClose={() => !cancelSubmitting && setCancelDialogOpen(false)}
                onRequestClose={() => !cancelSubmitting && setCancelDialogOpen(false)}
                width={520}
                contentClassName="p-0"
            >
                <div className="rounded-[20px] bg-white p-6">
                    <div className="mb-5">
                        <h3 className="text-xl font-semibold text-[#111827]">Cancel Quotation</h3>
                        <p className="mt-2 text-sm text-[#6B7280]">
                            Please enter the reason for cancellation.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="cancel-reason" className="mb-2 block text-sm font-medium text-[#374151]">
                            Reason
                        </label>
                        <textarea
                            id="cancel-reason"
                            value={cancelReason}
                            onChange={(event) => setCancelReason(event.target.value)}
                            placeholder="Enter cancellation reason"
                            className="min-h-[140px] w-full resize-none rounded-xl border border-[#D7E3F4] px-4 py-3 text-sm text-[#111827] outline-none transition-colors focus:border-[#1C4FA8]"
                        />
                        {cancelError && <p className="mt-2 text-sm text-[#DC2626]">{cancelError}</p>}
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3">
                        <Button
                            variant="default"
                            className="h-11 rounded-lg border border-[#D7E3F4] bg-white px-5 text-[#475569]"
                            onClick={() => {
                                setCancelReason('')
                                setCancelError('')
                            }}
                            disabled={cancelSubmitting}
                        >
                            Reset
                        </Button>
                        <Button
                            className="h-11 rounded-lg bg-[#003560] px-5 text-white hover:bg-[#002a49]"
                            onClick={handleCancelQuotation}
                            loading={cancelSubmitting}
                        >
                            Send
                        </Button>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default ProfileQuotationDetail
