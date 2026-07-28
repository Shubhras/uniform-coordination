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

    if (rawStatus.includes('approv') || rawStatus.includes('accept')) return 'approved'
    if (rawStatus.includes('cancel')) return 'cancelled'
    if (rawStatus.includes('declin') || rawStatus.includes('reject')) return 'declined'
    if (rawStatus.includes('pend')) return 'pending'
    if (rawStatus.includes('submit')) return 'submitted'
    if (rawStatus.includes('receiv') || rawStatus.includes('review')) return 'received'

    return 'pending'
}

const normalizePdfUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') {
        return ''
    }

    const preferredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!preferredBaseUrl) {
        return rawUrl
    }

    try {
        const preferredOrigin = new URL(preferredBaseUrl).origin

        if (rawUrl.startsWith('/')) {
            return new URL(rawUrl, preferredOrigin).toString()
        }

        const parsedUrl = new URL(rawUrl)
        if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
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
        statusLabel: statusStyles[statusKey].label,
        companyName: quotation?.company_name || '-',
        contactPerson: quotation?.contact_person || quotation?.name || '-',
        email: quotation?.email || '-',
        phoneNumber: quotation?.phone_number || quotation?.phone || '-',
        tier: quotation?.tier || '-',
        requestedDate: quotation?.requested_date || quotation?.created_at || '',
        pdfUrl: normalizePdfUrl(getPdfUrl(quotation)),
        downloadUrl: normalizePdfUrl(getDownloadUrl(quotation)),
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

    const handleDownloadQuotationPdf = async () => {
        if (!session?.accessToken || !quotation) return

        try {
            setDownloadLoading(true)
            const pdfBlob = await apiDownloadUserQuotationPdf(
                quotation.quotationId,
                session.accessToken,
                quotation.downloadUrl,
            )

            const blobUrl = window.URL.createObjectURL(pdfBlob)
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = `${quotation.requestId || 'quotation'}.pdf`
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(blobUrl)
        } catch (error) {
            console.error('Quotation PDF download error:', error)
            setErrorMessage(
                error?.response?.data?.message ||
                    error?.message ||
                    'Unable to download quotation PDF right now.',
            )
        } finally {
            setDownloadLoading(false)
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
                onDownload={handleDownloadQuotationPdf}
                downloadLoading={downloadLoading}
            />
        </div>
    )
}

export default QuotationDetailPage
