'use client'

import React, { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Spinner from '@/components/ui/Spinner'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiDownload, FiList, FiMaximize2 } from 'react-icons/fi'
import {
    apiCancelQuotation,
    apiDownloadUserQuotationPdf,
    apiGetQuotationRequestDetail,
    apiGetUserQuotationDetail,
} from '@/services/QuotationRequestService'

const getStatusMeta = (status) => {
    const value = String(status || 'pending').toLowerCase()

    if (value.includes('accept')) {
        return { label: 'Accepted', badgeClass: 'bg-[#E8FAF1] text-[#22C55E]' }
    }

    if (value.includes('cancel') || value.includes('declin') || value.includes('reject')) {
        return { label: 'Cancelled', badgeClass: 'bg-[#FEF2F2] text-[#DC2626]' }
    }

    if (value.includes('review') || value.includes('receiv')) {
        return { label: 'In Review', badgeClass: 'bg-[#FFF7ED] text-[#EA580C]' }
    }

    return { label: 'Pending', badgeClass: 'bg-[#E8F1FF] text-[#1C4FA8]' }
}

const getResponseData = (payload) => payload?.data?.data || payload?.data || payload?.result || payload
const getQuotationId = (quotation) =>
    quotation?.uuids || quotation?.uuid || quotation?.id || quotation?.quotation_id || ''
const getPdfSource = (quotation) =>
    quotation?.pdf_url || quotation?.pdf || quotation?.quotation_pdf || quotation?.quotationPdf || quotation?.export_pdf_url || ''

const normalizePdfUrl = (url) => {
    if (!url || typeof url !== 'string') return ''

    const cleanUrl = url.replace(/\[|\]|\(|\)|"|`/g, '').trim()
    if (!cleanUrl) return ''

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!baseUrl) return cleanUrl

    try {
        const preferredOrigin = new URL(baseUrl).origin

        if (cleanUrl.startsWith('/')) {
            return new URL(cleanUrl, preferredOrigin).toString()
        }

        const parsedUrl = new URL(cleanUrl)
        if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
            return new URL(
                `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`,
                preferredOrigin,
            ).toString()
        }

        return parsedUrl.toString()
    } catch {
        return cleanUrl
    }
}

const getSizeRange = (quotation) => {
    if (Array.isArray(quotation?.size_range) && quotation.size_range.length) {
        return quotation.size_range.map((item, index) => ({
            label: item?.size || item?.label || `Size ${index + 1}`,
        }))
    }

    if (Array.isArray(quotation?.size_quantity) && quotation.size_quantity.length) {
        return quotation.size_quantity.map((item, index) => ({
            label: item?.size || `Size ${index + 1}`,
        }))
    }

    if (quotation?.size_quantity && typeof quotation.size_quantity === 'object') {
        return Object.keys(quotation.size_quantity).map((size) => ({ label: size }))
    }

    return [{ label: 'XS' }, { label: 'S' }, { label: 'M' }]
}

const formatCreatedLabel = (value) => {
    if (!value) return 'Created recently'

    const createdAt = new Date(value)
    if (Number.isNaN(createdAt.getTime())) return 'Created recently'

    const diff = Math.max(
        0,
        Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    )

    if (diff === 0) return 'Created today'
    if (diff === 1) return 'Created 1 day ago'
    return `Created ${diff} days ago`
}

const normalizeQuotation = (raw) => ({
    ...raw,
    id: getQuotationId(raw),
    quotationNo: raw?.quotationNo || raw?.quotation_id || raw?.request_id || raw?.id || '',
    amount: raw?.amount || raw?.total_amount || raw?.grand_total || raw?.total || '0.00',
    pdf_url: normalizePdfUrl(getPdfSource(raw)),
    created_at: raw?.created_at || raw?.submitted_at || '',
    status_label: raw?.status_label || raw?.quotation_status || raw?.status || 'pending',
    terms: Array.isArray(raw?.terms || raw?.notes_terms)
        ? raw?.terms || raw?.notes_terms
        : defaultTerms,
})

const PdfPreview = ({ quotation, accessToken }) => {
    const [pdfUrl, setPdfUrl] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let objectUrl = ''
        let active = true

        const loadPdf = async () => {
            setLoading(true)
            setPdfUrl('')

            if (!quotation?.pdf_url || !quotation?.id || !accessToken) {
                if (quotation?.pdf_url) {
                    setPdfUrl(quotation.pdf_url)
                }
                setLoading(false)
                return
            }

            try {
                const blob = await apiDownloadUserQuotationPdf(
                    quotation.id,
                    accessToken,
                    quotation.pdf_url,
                )

                if (!active) return
                objectUrl = URL.createObjectURL(blob)
                setPdfUrl(objectUrl)
            } catch (error) {
                console.error('Quotation preview error:', error)

                if (active && quotation?.pdf_url) {
                    setPdfUrl(quotation.pdf_url)
                }
            } finally {
                if (active) setLoading(false)
            }
        }

        loadPdf()

        return () => {
            active = false
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }, [accessToken, quotation?.id, quotation?.pdf_url])

    const fileName = `${quotation?.quotationNo || 'quotation'}.pdf`
    const iframeUrl = pdfUrl.startsWith('blob:') ? `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0` : pdfUrl

    return (
        <div className="rounded-[20px] bg-[#1F2937] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
            <div className="mb-3 flex items-center justify-between gap-3 text-white/80">
                <div className="flex items-center gap-3">
                    <span className="max-w-[220px] truncate rounded-md bg-[#344054] px-3 py-2 text-[11px] text-white">
                        {fileName}
                    </span>
                    <span className="rounded-md bg-[#344054] px-3 py-2 text-[10px] text-white/90">
                        Read Only
                    </span>
                </div>

                {pdfUrl && (
                    <button
                        type="button"
                        onClick={() => {
                            const link = document.createElement('a')
                            link.href = pdfUrl
                            link.download = fileName
                            link.click()
                        }}
                        className="rounded-md p-2 text-white transition-colors hover:bg-white/10"
                    >
                        <FiDownload size={14} />
                    </button>
                )}
            </div>

            <div className="flex h-[560px] items-center justify-center overflow-hidden rounded-[10px] bg-[#E5E7EB]">
                {loading && <Spinner size={24} />}

                {!loading && pdfUrl && (
                    <iframe
                        src={iframeUrl}
                        title="Quotation PDF preview"
                        className="h-full w-full border-0 bg-white"
                    />
                )}

                {!loading && !pdfUrl && (
                    <div className="px-6 text-center text-sm text-[#4B5563]">
                        PDF preview available nahi hai.
                    </div>
                )}
            </div>
        </div>
    )
}

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
        const fetchQuotation = async () => {
            if (!quotationId) {
                setLoading(false)
                return
            }

            if (!session?.accessToken) return

            try {
                setLoading(true)

                let baseData

                try {
                    const detail = await apiGetQuotationRequestDetail(quotationId, session.accessToken)
                    baseData = getResponseData(detail)
                } catch {
                    const detail = await apiGetUserQuotationDetail(quotationId, session.accessToken)
                    baseData = getResponseData(detail)
                }

                const detailId = baseData?.uuids || baseData?.uuid || baseData?.id

                if (detailId) {
                    try {
                        const fullDetail = await apiGetUserQuotationDetail(
                            detailId,
                            session.accessToken,
                        )
                        baseData = { ...baseData, ...getResponseData(fullDetail) }
                    } catch (error) {
                        console.error('Quotation detail merge error:', error)
                    }
                }

                setQuotation(normalizeQuotation(baseData))
            } catch (error) {
                console.error('Quotation detail API error:', error)
                setQuotation(null)
            } finally {
                setLoading(false)
            }
        }

        fetchQuotation()
    }, [quotationId, session?.accessToken])

    const statusMeta = getStatusMeta(
        quotation?.quotation_status || quotation?.status_label || quotation?.status,
    )
    const sizeRange = getSizeRange(quotation)
    const canCancelQuotation = statusMeta.label.toLowerCase() === 'pending'
    const resetCancelForm = () => {
        setCancelReason('')
        setCancelError('')
    }

    const handleCancelQuotation = async () => {
        if (!session?.accessToken || !quotation?.id) {
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

            const response = await apiCancelQuotation(
                quotation.id,
                { cancel_reason: cancelReason.trim() },
                session.accessToken,
            )

            if (!(response?.success || response?.status)) {
                setCancelError(response?.message || 'Unable to cancel quotation.')
                return
            }

            setQuotation((prev) => ({
                ...prev,
                status: 'cancelled',
                quotation_status: 'cancelled',
                status_label: 'Cancelled',
            }))
            resetCancelForm()
            setCancelDialogOpen(false)
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
                    <PdfPreview quotation={quotation} accessToken={session?.accessToken} />

                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <span
                                className={`rounded-full px-3 py-1 text-[10px] font-semibold ${statusMeta.badgeClass}`}
                            >
                                {statusMeta.label}
                            </span>
                            <span className="text-[11px] text-[#9CA3AF]">
                                {formatCreatedLabel(quotation.created_at)}
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
                                {quotation.amount}
                            </p>
                        </div>

                        <div className="rounded-[18px] bg-[#F7FBFF] p-4">
                            <p className="mb-3 flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
                                <FiMaximize2 size={11} />
                                Size Range
                            </p>
                            <div className="space-y-2">
                                {sizeRange.map((item) => (
                                    <div key={item.label} className="text-[10px] text-[#4B5563]">
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[18px] bg-[#DBEAFE] p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <FiList className="text-[#003560]" size={14} />
                                <p className="text-sm font-semibold text-[#DBEAFE]">Notes & Terms</p>
                            </div>
                            <div className="space-y-3">
                                {quotation.terms.map((term) => (
                                    <div key={term} className="flex gap-3 text-sm text-[#4B5563]">
                                        <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#36A9F8]" />
                                        <p>{term}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {canCancelQuotation && (
                            <Button
                                className="flex h-12 w-full items-center justify-center rounded-lg bg-[#003560] text-white hover:bg-[#002a49]"
                                onClick={() => {
                                    resetCancelForm()
                                    setCancelDialogOpen(true)
                                }}
                            >
                                Cancel
                            </Button>
                        )}
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

                    <div className="mt-6 flex items-center justify-end gap-3">
                        <Button
                            variant="default"
                            className="h-11 rounded-lg border border-[#D7E3F4] bg-white px-5 text-[#475569]"
                            onClick={resetCancelForm}
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
