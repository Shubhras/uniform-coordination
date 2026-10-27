'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Spinner from '@/components/ui/Spinner'
import {
    apiDownloadUserQuotationPdf,
    apiGetUserQuotationDetail,
    apiGetQuotationRequestDetail,
} from '@/services/QuotationRequestService'
import QuotationDetailContent from '../QuotationDetailContent'

const statusStyles = {
    approved: {
        text: '#34C759',
        bg: '#1C4FA80F',
        label: 'Approved',
    },
    cancelled: {
        text: '#C10007',
        bg: '#1C4FA80F',
        label: 'Cancelled',
    },
    declined: {
        text: '#C10007',
        bg: '#1C4FA80F',
        label: 'Declined',
    },
    pending: {
        text: '#4580ED',
        bg: '#1C4FA80F',
        label: 'Pending',
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
        quotation?.status ||
            quotation?.quotation_status ||
            quotation?.request_status ||
            quotation?.state ||
            'submitted',
    ).toLowerCase()

    if (rawStatus.includes('approv') || rawStatus.includes('accept') || rawStatus.includes('agree')) return 'approved'
    if (rawStatus.includes('cancel')) return 'cancelled'
    if (rawStatus.includes('declin') || rawStatus.includes('reject')) return 'declined'
    if (rawStatus.includes('pend')) return 'pending'
    if (rawStatus.includes('submit') || rawStatus.includes('sent')) return 'submitted'
    if (rawStatus.includes('receiv') || rawStatus.includes('review') || rawStatus.includes('request')) return 'received'

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
        return source.map((item, index) => ({
            id: item?.id || `item-${index}`,
            uniform_name:
                item?.uniform_name || item?.name || item?.product_name || 'Medical Scrub Set',
            category: item?.category || item?.item_type || 'Medical',
            quantity: item?.quantity || item?.qty || '-',
        }))
    }

    if (
        quotation?.product_name ||
        quotation?.item_type ||
        quotation?.product_category_name ||
        quotation?.size_quantity
    ) {
        return [
            {
                id: quotation?.product_id || quotation?.uuids || quotation?.quotation_id || 'item-0',
                uniform_name:
                    quotation?.product_name || quotation?.item_type || 'Medical Scrub Set',
                category:
                    quotation?.product_category_name ||
                    quotation?.product_subcategory_name ||
                    quotation?.material ||
                    'Medical',
                quantity:
                    quotation?.size_quantity ||
                    quotation?.quantity ||
                    quotation?.qty ||
                    '-',
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
        id: quotation?.id || quotation?.quotation_id || quotation?.quotationNo || '',
        quotationId:
            quotation?.uuid ||
            quotation?.quotation_uuid ||
            quotation?.quotation_id ||
            quotation?.id ||
            '',
        requestId: quotation?.quotationNo || quotation?.quotation_id || '-',
        statusKey,
        statusLabel: statusStyles[statusKey]?.label || quotation?.status || 'Pending',
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
            />
        </div>
    )
}

export default QuotationDetailPage
