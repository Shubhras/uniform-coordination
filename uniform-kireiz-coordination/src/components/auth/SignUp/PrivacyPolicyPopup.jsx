'use client'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import React, { useState, useEffect } from 'react'
import { apiGetPrivacyPolicy } from '@/services/privatePolicyService'
import { formatDate } from '@/utils/dateFormater'

/**
 * PrivacyPolicyPopup Component
 *
 * Displays the privacy policy modal by fetching all privacy policy
 * items from the API endpoint when opened and rendering them.
 */
const PrivacyPolicyPopup = ({ isOpen, onClose, onAgree }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [policyList, setPolicyList] = useState([])

    /**
     * Fetches privacy policy list from the API.
     */
    const fetchPrivacyPolicy = async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await apiGetPrivacyPolicy()

            let list = []
            if (Array.isArray(res?.data)) {
                list = res.data
            } else if (Array.isArray(res?.data?.results)) {
                list = res.data.results
            } else if (Array.isArray(res?.results)) {
                list = res.results
            } else if (Array.isArray(res)) {
                list = res
            } else if (res?.data && typeof res.data === 'object') {
                list = [res.data]
            } else if (res?.data && typeof res.data === 'string') {
                list = [{ content: res.data }]
            }

            if (list.length > 0) {
                setPolicyList(list)
            } else {
                setError('No privacy policy found.')
            }
        } catch (err) {
            console.error('Failed to load privacy policy:', err)
            setError('Failed to load privacy policy.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchPrivacyPolicy()
        }
    }, [isOpen])

    const lastUpdatedDate =
        policyList?.find((item) => item?.updated_at)?.updated_at ||
        policyList?.[0]?.updated_at ||
        policyList?.[0]?.created_at

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={800}
        >
            <div className="flex flex-col h-full max-h-[90vh] min-h-[400px]">
                <div className=" relative px-4 pt-5 pb-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-center sm:text-left">
                        Privacy Policy
                    </h2>
                </div>
                <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1">
                    {loading && (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C4FA8]"></div>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="py-20 text-center text-red-500 text-sm sm:text-base font-medium">
                            {error}
                        </div>
                    )}

                    {!loading && !error && policyList.length > 0 && (
                        <div className="space-y-6">
                            {policyList.map((item, index) => (
                                <div
                                    key={item.id || index}
                                    className="space-y-3 pb-5 border-b border-gray-100 last:border-b-0 last:pb-0"
                                >
                                    {item.title && (
                                        <h3 className="text-base sm:text-lg font-semibold text-[#003562]">
                                            {item.title}
                                        </h3>
                                    )}
                                    {item.content ? (
                                        <div
                                            className="space-y-4 prose max-w-none text-sm sm:text-base leading-relaxed text-[#374151]"
                                            dangerouslySetInnerHTML={{ __html: item.content }}
                                        />
                                    ) : typeof item === 'string' ? (
                                        <div
                                            className="space-y-4 prose max-w-none text-sm sm:text-base leading-relaxed text-[#374151]"
                                            dangerouslySetInnerHTML={{ __html: item }}
                                        />
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && !error && policyList.length === 0 && (
                        <div className="py-20 text-center text-gray-500 text-lg font-medium">
                            Data not found
                        </div>
                    )}
                </div>
                <div className="
                    px-4 sm:px-6
                    py-4
                    border-t
                    flex
                    flex-col-reverse
                    sm:flex-row
                    sm:justify-end
                    gap-3
                ">
                    <Button
                        variant="plain"
                        className="w-full sm:w-auto"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                    <Button
                        variant="solid"
                        className="
                            w-full sm:w-auto
                            bg-[#1C4FA8]
                            hover:bg-[#1C4FA8]
                            text-white
                            px-10
                            py-2
                            rounded-md
                        "
                        onClick={() => {
                            onAgree?.()
                            onClose()
                        }}
                    >
                        I Agree
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default PrivacyPolicyPopup
