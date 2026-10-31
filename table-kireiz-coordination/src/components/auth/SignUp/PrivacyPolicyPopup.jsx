import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import React, { useState, useEffect } from 'react'
import { apiPrivatePolicy } from '@/services/privatePolicyService'
import formatDate from '@/utils/formatDate'

/**
 * PrivacyPolicyPopup Component
 * 
 * Modal dialog rendering privacy policy content fetched from backend policy service.
 * 
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Modal visibility flag.
 * @param {Function} props.onClose - Modal close handler callback.
 * @param {string} [props.policyType] - Policy type identifier (defaults to 'privacy_and_policy').
 * @param {Function} [props.onAgree] - Callback triggered when user clicks 'I Agree'.
 */
const PrivacyPolicyPopup = ({
    isOpen,
    onClose,
    policyType = 'privacy_and_policy',
    onAgree,
}) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [policy, setPolicy] = useState(null)

    /**
     * Fetches privacy policy data from API.
     * 
     * @param {string} type - Policy type identifier.
     */
    const fetchPolicy = async (type = 'privacy_and_policy') => {
        try {
            setLoading(true)
            setError(null)

            const res = await apiPrivatePolicy(type)

            if (res?.status && res?.data?.length > 0) {
                setPolicy(res.data[0])
            } else {
                setError('Data not found')
            }
        } catch (err) {
            setError('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchPolicy(policyType)
        }
    }, [isOpen, policyType])

    const handleAgree = () => {
        if (onAgree) {
            onAgree()
        }
        onClose()
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={800}
        >
            <div className="flex flex-col h-full max-h-[90vh] min-h-[400px]">
                {/* HEADER */}
                <div className="relative pt-5 pb-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-center sm:text-left text-[#8B4513]">
                        {policy?.title || 'Privacy Policy'}
                    </h2>

                    {policy?.updated_at && (
                        <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
                            Last Updated: {formatDate(policy.updated_at)}
                        </span>
                    )}
                </div>

                {/* CONTENT */}
                <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1">
                    {loading && (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
                        </div>
                    )}

                    {!loading && policy && (
                        <div
                            className="space-y-4 prose max-w-none text-sm sm:text-base leading-relaxed text-[#374151]"
                            dangerouslySetInnerHTML={{ __html: policy.content }}
                        />
                    )}

                    {!loading && !policy && (
                        <div className="py-20 text-center text-gray-500 text-lg font-medium">
                            {error || 'Data not found'}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="px-4 sm:px-6 py-4 border-t flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <Button
                        variant="plain"
                        className="w-full sm:w-auto"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="solid"
                        className="w-full sm:w-auto bg-[#8B4513] hover:bg-[#71370F] text-white px-10 py-2 rounded-md"
                        onClick={handleAgree}
                    >
                        I Agree
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default PrivacyPolicyPopup
