'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Spinner from '@/components/ui/Spinner'
import {
    apiDownloadUserQuotationPdf,
    apiGetUserQuotationDetail,
    apiGetQuotationRequestDetail,
    apiCancelQuotation,
    apiApproveQuotation,
} from '@/services/QuotationRequestService'
import QuotationDetailContent from '../QuotationDetailContent'

const statusStyles = {
    approved: {
        text: '#34C759',
        bg: '#1C4FA80F',
        label: 'Agreed',
    },
    cancelled: {
        text: '#C10007',
        bg: '#1C4FA80F',
        label: 'Cancelled',
    },
    declined: {
        text: '#C10007',
        bg: '#1C4FA80F',
        label: 'Cancelled',
    },
    pending: {
        text: '#4580ED',
        bg: '#1C4FA80F',
        label: 'Pending',
    },
    sent: {
        text: '#4580ED',
        bg: '#1C4FA80F',
        label: 'Submitted',
    },
    submitted: {
        text: '#4580ED',
        bg: '#1C4FA80F',
        label: 'Submitted',
    },
    received: {
        text: '#FF8D28',
        bg: '#1C4FA80F',
        label: 'Received',
    },
}

const getNormalizedStatus = (quotation) => {
    const rawStatus = String(
        quotation?.quotation_status ||
            quotation?.status ||
            'pending',
    ).toLowerCase()

    if (rawStatus.includes('cancel') || rawStatus.includes('declin') || rawStatus.includes('reject')) return 'cancelled'
    if (rawStatus.includes('approv') || rawStatus.includes('agree')) return 'approved'
    if (rawStatus.includes('accept') || rawStatus.includes('submit') || rawStatus.includes('sent')) return 'submitted'
    if (rawStatus.includes('receiv') || rawStatus.includes('quot') || rawStatus.includes('review')) return 'received'
    if (rawStatus.includes('pend') || rawStatus.includes('request')) return 'pending'

    return 'pending'
}

const normalizePdfUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') {
        return ''
    }

    const preferredBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        (typeof window !== 'undefined' ? window.location.origin : '')

    if (!preferredBaseUrl) {
        return rawUrl
    }

    try {
        const preferredOrigin = new URL(preferredBaseUrl).origin

        if (rawUrl.startsWith('/')) {
            return new URL(rawUrl, preferredOrigin).toString()
        }

        const parsedUrl = new URL(rawUrl)
        if (
            parsedUrl.hostname === 'localhost' ||
            parsedUrl.hostname === '127.0.0.1' ||
            parsedUrl.hostname.includes('dxtspace.com')
        ) {
            return new URL(
                `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`,
                preferredOrigin,
            ).toString()
        }

        return parsedUrl.toString()
    } catch (error) {
        console.error('Failed to normalize PDF URL:', error)
        return rawUrl
    }
}

const getPdfUrl = (quotation) =>
    quotation?.pdf_url ||
    quotation?.pdf ||
    quotation?.quotation_pdf ||
    quotation?.quotationPdf ||
    quotation?.export_pdf_url ||
    ''

const getDownloadUrl = (quotation) =>
    quotation?.download_url ||
    quotation?.downloadUrl ||
    quotation?.pdf_download_url ||
    quotation?.quotation_download_url ||
    ''

const getRequestedItems = (quotation) => {
    const source =
        quotation?.requested_items ||
        quotation?.items ||
        quotation?.products ||
        quotation?.line_items

    if (Array.isArray(source) && source.length) {
        return source.map((item, index) => {
            const sizesObj = item?.sizes || item?.configuration?.sizes || {}
            const calculatedQty =
                Object.values(sizesObj).length > 0
                    ? Object.values(sizesObj).reduce((sum, val) => sum + (Number(val) || 0), 0)
                    : item?.quantity || item?.qty || '-'

            return {
                ...item,
                id: item?.id || item?.product_id || `item-${index}`,
                uniform_name:
                    item?.uniform_name || item?.product_name || item?.item_type || item?.name || 'Medical Scrub Set',
                product_name:
                    item?.product_name || item?.uniform_name || item?.item_type || item?.name || 'Medical Scrub Set',
                category:
                    item?.product_category_name || item?.category || item?.item_type || 'Medical',
                quantity: calculatedQty,
            }
        })
    }

    if (
        quotation?.product_name ||
        quotation?.item_type ||
        quotation?.product_category_name ||
        quotation?.size_quantity ||
        quotation?.product_image ||
        quotation?.sizes ||
        quotation?.configuration
    ) {
        const sizesObj = quotation?.sizes || quotation?.configuration?.sizes || {}
        const calculatedQty =
            Object.values(sizesObj).length > 0
                ? Object.values(sizesObj).reduce((sum, val) => sum + (Number(val) || 0), 0)
                : quotation?.size_quantity || quotation?.quantity || quotation?.qty || '-'

        return [
            {
                ...quotation,
                id: quotation?.product_id || quotation?.uuids || quotation?.quotation_id || 'item-0',
                uniform_name:
                    quotation?.product_name || quotation?.item_type || 'Medical Scrub Set',
                product_name:
                    quotation?.product_name || quotation?.item_type || 'Medical Scrub Set',
                category:
                    quotation?.product_category_name ||
                    quotation?.product_subcategory_name ||
                    quotation?.material ||
                    'Medical',
                quantity: calculatedQty,
            },
        ]
    }

    return []
}

const extractQuotationDetailRecord = (payload) =>
    payload?.data?.data || payload?.data || payload?.result || payload

const normalizeQuotation = (quotation) => {
    const statusKey = getNormalizedStatus(quotation)
    const exportPdfUrl = normalizePdfUrl(quotation?.export_pdf_url || getPdfUrl(quotation))
    const downloadUrl = normalizePdfUrl(getDownloadUrl(quotation)) || exportPdfUrl
    const signedPdfUrl = normalizePdfUrl(quotation?.signed_pdf_url || quotation?.signed_pdf || '')

    // Build comprehensive attachments array
    const rawAttachments = quotation?.attachments || []
    const normalizedAttachments = Array.isArray(rawAttachments) ? [...rawAttachments] : []

    const hasQuotationAttachment = normalizedAttachments.some(
        (a) => a.type === 'quotation_pdf' || a.id === 'quotation-pdf',
    )
    if (!hasQuotationAttachment) {
        normalizedAttachments.unshift({
            id: 'quotation-pdf',
            name: `Quotation_${quotation?.quotation_id || quotation?.quotationNo || 'Proposal'}.pdf`,
            title: 'Quotation Proposal (Official PDF)',
            type: 'quotation_pdf',
            category: 'Official Quotation',
            file_url: exportPdfUrl,
            download_url: downloadUrl,
            is_available: true,
            created_at: quotation?.last_sent_at || quotation?.updated_at || quotation?.created_at || '',
        })
    }

    if (signedPdfUrl) {
        const hasSignedAttachment = normalizedAttachments.some(
            (a) => a.type === 'signed_contract' || a.id === 'signed-contract-pdf',
        )
        if (!hasSignedAttachment) {
            normalizedAttachments.push({
                id: 'signed-contract-pdf',
                name: `Signed_Contract_${quotation?.quotation_id || quotation?.quotationNo || 'Document'}.pdf`,
                title: 'Signed Agreement & Contract',
                type: 'signed_contract',
                category: 'Signed Document',
                file_url: signedPdfUrl,
                download_url: signedPdfUrl,
                is_available: true,
                created_at: quotation?.signed_at || quotation?.updated_at || '',
            })
        }
    }

    // Extract assigned sales rep
    let salesRep = quotation?.sales_rep_details || null
    if (!salesRep && (quotation?.sales_rep_name || quotation?.sales_rep)) {
        salesRep = {
            name:
                quotation?.sales_rep_name ||
                (typeof quotation?.sales_rep === 'object' ? quotation?.sales_rep?.name : null) ||
                'Assigned Sales Representative',
            email:
                (typeof quotation?.sales_rep === 'object' ? quotation?.sales_rep?.email : '') || '',
            phone:
                (typeof quotation?.sales_rep === 'object'
                    ? quotation?.sales_rep?.phone || quotation?.sales_rep?.mobile
                    : '') || '',
            designation:
                (typeof quotation?.sales_rep === 'object'
                    ? quotation?.sales_rep?.designation
                    : '') || 'B2B Sales Account Specialist',
        }
    }

    return {
        ...quotation,
        id: quotation?.id || quotation?.quotation_id || quotation?.quotationNo || '',
        quotationId:
            quotation?.uuid ||
            quotation?.quotation_uuid ||
            quotation?.quotation_id ||
            quotation?.id ||
            '',
        requestId: quotation?.quotationNo || quotation?.quotation_id || '-',
        statusKey,
        statusLabel:
            (quotation?.quotation_status
                ? quotation.quotation_status.charAt(0).toUpperCase() + quotation.quotation_status.slice(1)
                : '') ||
            statusStyles[statusKey]?.label ||
            quotation?.status ||
            'Pending',
        quotation_status: quotation?.quotation_status || quotation?.status || '',
        rawStatus: quotation?.quotation_status || quotation?.status || '',
        workflowStatus: quotation?.workflow_status || '',
        companyName: quotation?.company_name || '-',
        contactPerson: quotation?.contact_person || quotation?.name || '-',
        email: quotation?.email || '-',
        phoneNumber: quotation?.phone_number || quotation?.phone || '-',
        tier: quotation?.tier || '-',
        requestedDate: quotation?.requested_date || quotation?.created_at || '',
        validUntil: quotation?.valid_until || null,
        subtotal: quotation?.subtotal || null,
        discountPercent: quotation?.discount_percent || null,
        total: quotation?.total || null,
        lastSentAt: quotation?.last_sent_at || null,
        salesRep,
        attachments: normalizedAttachments,
        signedPdfUrl,
        exportPdfUrl,
        pdfUrl: exportPdfUrl,
        downloadUrl,
        items: getRequestedItems(quotation),
    }
}

const QuotationDetailPage = ({ quotationId }) => {
    const router = useRouter()
    const { data: session } = useSession()
    const [quotation, setQuotation] = useState(null)
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [downloadLoading, setDownloadLoading] = useState(false)
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
    const [agreeDialogOpen, setAgreeDialogOpen] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [actionSubmitting, setActionSubmitting] = useState(false)
    const [actionError, setActionError] = useState('')

    useEffect(() => {
        const fetchQuotationDetail = async () => {
            if (!session?.accessToken || !quotationId) return

            setLoading(true)
            setErrorMessage('')

            try {
                try {
                    const res = await apiGetQuotationRequestDetail(
                        quotationId,
                        session.accessToken,
                    )
                    const detailRecord = extractQuotationDetailRecord(res)
                    setQuotation(normalizeQuotation(detailRecord))
                    return
                } catch (requestError) {
                    const fallbackRes = await apiGetUserQuotationDetail(
                        quotationId,
                        session.accessToken,
                    )
                    const fallbackDetailRecord = extractQuotationDetailRecord(fallbackRes)
                    setQuotation(normalizeQuotation(fallbackDetailRecord))
                    return
                }
            } catch (error) {
                console.error('Quotation detail API error:', error)
                setErrorMessage(
                    error?.response?.data?.message ||
                        error?.message ||
                        'Unable to load quotation details right now.',
                )
            } finally {
                setLoading(false)
            }
        }

        fetchQuotationDetail()
    }, [quotationId, session?.accessToken])

    const handleDownloadDocument = async (attachmentOrEvent) => {
        if (!session?.accessToken || !quotation) return

        const attachment =
            attachmentOrEvent && typeof attachmentOrEvent === 'object' && attachmentOrEvent.name
                ? attachmentOrEvent
                : null

        let targetUrl =
            attachment?.download_url ||
            attachment?.file_url ||
            quotation.downloadUrl ||
            quotation.exportPdfUrl ||
            quotation.pdfUrl

        try {
            setDownloadLoading(true)

            // If the URL is an export endpoint returning JSON, call export to get the static PDF url
            if (targetUrl && targetUrl.includes('/export/')) {
                try {
                    const exportRes = await apiExportQuotationPdf(
                        quotation.quotationId,
                        session.accessToken,
                    )
                    const extractedUrl =
                        exportRes?.pdf_url || exportRes?.data?.pdf_url || exportRes?.data?.url
                    if (extractedUrl) {
                        targetUrl = extractedUrl
                    }
                } catch (exportErr) {
                    console.warn('apiExportQuotationPdf fallback error:', exportErr)
                }
            }

            // Direct download link if it's an external file, media PDF, or direct PDF stream
            if (
                targetUrl &&
                (targetUrl.includes('/media/') ||
                    targetUrl.endsWith('.pdf') ||
                    targetUrl.includes('/pdf/'))
            ) {
                // Ensure ?download=1 is appended for PDF stream endpoints
                const finalDownloadUrl =
                    targetUrl.includes('/pdf/') && !targetUrl.includes('download=1')
                        ? `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}download=1`
                        : targetUrl

                const link = document.createElement('a')
                link.href = finalDownloadUrl
                link.download = attachment?.name || `${quotation.requestId || 'quotation'}.pdf`
                link.target = '_blank'
                document.body.appendChild(link)
                link.click()
                link.remove()
                return
            }

            // Otherwise download via authorized API blob
            const pdfBlob = await apiDownloadUserQuotationPdf(
                quotation.quotationId,
                session.accessToken,
                targetUrl,
            )

            const blobUrl = window.URL.createObjectURL(pdfBlob)
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = attachment?.name || `${quotation.requestId || 'quotation'}.pdf`
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(blobUrl)
        } catch (error) {
            console.error('Quotation document download error:', error)
            if (targetUrl) {
                window.open(targetUrl, '_blank')
                return
            }
            setErrorMessage(
                error?.response?.data?.message ||
                    error?.message ||
                    'Unable to download document right now.',
            )
        } finally {
            setDownloadLoading(false)
        }
    }

    const handleViewDocument = (attachment) => {
        let targetUrl =
            attachment?.file_url ||
            attachment?.download_url ||
            quotation?.pdfUrl ||
            quotation?.exportPdfUrl

        if (targetUrl) {
            // Remove download=1 parameter when viewing inline
            const viewUrl = targetUrl.replace(/[?&]download=1/, '')
            window.open(viewUrl, '_blank')
        } else {
            handleDownloadDocument(attachment)
        }
    }

    const handleOpenCancelDialog = () => {
        setCancelReason('')
        setActionError('')
        setCancelDialogOpen(true)
    }

    const handleOpenAgreeDialog = () => {
        setActionError('')
        setAgreeDialogOpen(true)
    }

    const handleConfirmCancel = async () => {
        const targetId =
            quotation?.uuids ||
            quotation?.uuid ||
            quotation?.quotation_uuid ||
            quotationId ||
            quotation?.quotationId ||
            quotation?.id

        if (!session?.accessToken || !targetId) {
            setActionError('Quotation identification not found.')
            return
        }

        try {
            setActionSubmitting(true)
            setActionError('')

            const payload = {
                cancel_reason: cancelReason.trim() || 'Cancelled by user',
            }

            const response = await apiCancelQuotation(
                targetId,
                payload,
                session.accessToken,
            )

            if (response && response.status === false) {
                setActionError(response.message || 'Unable to cancel quotation.')
                return
            }

            setQuotation((prev) => ({
                ...prev,
                status: 'cancelled',
                quotation_status: 'cancelled',
                statusKey: 'cancelled',
                statusLabel: 'Cancelled',
                rawStatus: 'cancelled',
            }))

            setCancelDialogOpen(false)
            setCancelReason('')

            toast.push(
                <Notification title="Quotation Cancelled" type="success">
                    {response?.message || 'Quotation has been cancelled successfully.'}
                </Notification>,
            )
        } catch (error) {
            console.error('Cancel quotation error:', error)
            setActionError(
                error?.response?.data?.message ||
                error?.response?.data?.detail ||
                error?.message ||
                'Unable to cancel quotation.',
            )
        } finally {
            setActionSubmitting(false)
        }
    }

    const handleConfirmAgree = async () => {
        const targetId =
            quotation?.uuids ||
            quotation?.uuid ||
            quotation?.quotation_uuid ||
            quotationId ||
            quotation?.quotationId ||
            quotation?.id

        if (!session?.accessToken || !targetId) {
            setActionError('Quotation identification not found.')
            return
        }

        try {
            setActionSubmitting(true)
            setActionError('')

            const payload = {
                quotation_status: 'approved',
                status: 'approved',
            }

            const response = await apiApproveQuotation(
                targetId,
                payload,
                session.accessToken,
            )

            if (response && response.status === false) {
                setActionError(response.message || 'Unable to agree to quotation.')
                return
            }

            setQuotation((prev) => ({
                ...prev,
                status: 'approved',
                quotation_status: 'approved',
                statusKey: 'approved',
                statusLabel: 'Approved',
                rawStatus: 'approved',
                workflowStatus: 'AGREED',
            }))

            setAgreeDialogOpen(false)

            toast.push(
                <Notification title="Quotation Agreed" type="success">
                    {response?.message || 'Quotation proposal agreed successfully!'}
                </Notification>,
            )
        } catch (error) {
            console.error('Agree quotation error:', error)
            setActionError(
                error?.response?.data?.message ||
                error?.response?.data?.detail ||
                error?.message ||
                'Unable to agree to quotation.',
            )
        } finally {
            setActionSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Spinner size={28} />
            </div>
        )
    }

    if (!quotation) {
        return (
            <div className="rounded-2xl bg-white px-4 py-6 shadow-sm md:px-6">
                <div className="mb-6 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
                    {errorMessage || 'Quotation detail not found.'}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full rounded-2xl bg-white px-4 py-6 shadow-sm md:px-6">
            {errorMessage ? (
                <div className="mb-6 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
                    {errorMessage}
                </div>
            ) : null}

            <QuotationDetailContent
                quotation={quotation}
                onBack={() => router.push('/profile/my-quotations')}
                onDownload={handleDownloadDocument}
                onView={handleViewDocument}
                downloadLoading={downloadLoading}
                onCancel={handleOpenCancelDialog}
                onAgree={handleOpenAgreeDialog}
                actionLoading={actionSubmitting}
            />

            {/* Cancel Quotation Confirmation Modal */}
            <Dialog
                isOpen={cancelDialogOpen}
                onClose={() => !actionSubmitting && setCancelDialogOpen(false)}
                onRequestClose={() => !actionSubmitting && setCancelDialogOpen(false)}
                width={500}
                contentClassName="p-0"
            >
                <div className="rounded-2xl bg-white p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-[#111827]">
                            Cancel Quotation
                        </h3>
                        <p className="mt-1.5 text-xs text-[#6B7280]">
                            Are you sure you want to cancel this quotation request? This action cannot be undone.
                        </p>
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="cancel-reason"
                            className="mb-1.5 block text-xs font-medium text-[#374151]"
                        >
                            Reason for cancellation (optional)
                        </label>
                        <textarea
                            id="cancel-reason"
                            rows={3}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Please enter a reason for cancellation..."
                            className="w-full resize-none rounded-xl border border-[#D7E3F4] p-3 text-xs text-[#111827] outline-none transition-colors focus:border-[#003560]"
                        />
                    </div>

                    {actionError ? (
                        <div className="mb-4 rounded-lg bg-[#FEF2F2] p-2.5 text-xs text-[#DC2626]">
                            {actionError}
                        </div>
                    ) : null}

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
                        <Button
                            size="sm"
                            variant="default"
                            className="rounded-lg border border-[#D7E3F4] px-4 text-xs font-medium text-[#475569]"
                            onClick={() => setCancelDialogOpen(false)}
                            disabled={actionSubmitting}
                        >
                            Keep Quotation
                        </Button>
                        <Button
                            size="sm"
                            className="rounded-lg bg-[#DC2626] px-4 text-xs font-semibold text-white hover:bg-[#B91C1C]"
                            onClick={handleConfirmCancel}
                            loading={actionSubmitting}
                        >
                            Confirm Cancel
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Agree Quotation Confirmation Modal */}
            <Dialog
                isOpen={agreeDialogOpen}
                onClose={() => !actionSubmitting && setAgreeDialogOpen(false)}
                onRequestClose={() => !actionSubmitting && setAgreeDialogOpen(false)}
                width={500}
                contentClassName="p-0"
            >
                <div className="rounded-2xl bg-white p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-[#111827]">
                            Agree to Quotation Proposal
                        </h3>
                        <p className="mt-1.5 text-xs text-[#6B7280]">
                            Are you sure you want to agree to this quotation proposal? Once agreed, contract finalization will begin.
                        </p>
                    </div>

                    <div className="mb-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-[#64748B]">Request Ref:</span>
                            <span className="font-semibold text-[#111827]">{quotation.requestId}</span>
                        </div>
                        {quotation.total ? (
                            <div className="flex justify-between">
                                <span className="text-[#64748B]">Total Amount:</span>
                                <span className="font-bold text-[#003560]">${Number(quotation.total).toLocaleString()}</span>
                            </div>
                        ) : null}
                    </div>

                    {actionError ? (
                        <div className="mb-4 rounded-lg bg-[#FEF2F2] p-2.5 text-xs text-[#DC2626]">
                            {actionError}
                        </div>
                    ) : null}

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
                        <Button
                            size="sm"
                            variant="default"
                            className="rounded-lg border border-[#D7E3F4] px-4 text-xs font-medium text-[#475569]"
                            onClick={() => setAgreeDialogOpen(false)}
                            disabled={actionSubmitting}
                        >
                            Back
                        </Button>
                        <Button
                            size="sm"
                            className="rounded-lg bg-[#003560] px-4 text-xs font-semibold text-white hover:bg-[#002a49]"
                            onClick={handleConfirmAgree}
                            loading={actionSubmitting}
                        >
                            Confirm Agreement
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default QuotationDetailPage
