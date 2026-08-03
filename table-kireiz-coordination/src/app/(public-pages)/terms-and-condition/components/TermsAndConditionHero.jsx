'use client'

import { apiPrivatePolicy } from '@/services/privatePolicyService'
import React, { useEffect, useState } from 'react'

/**
 * TermsAndConditionsContent Component
 * 
 * Fetches and displays legal terms & conditions policy document dynamically from backend service.
 */
const TermsAndConditionsContent = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [policy, setPolicy] = useState(null)

    /**
     * Fetches terms & conditions policy document from API.
     * 
     * @param {string} policyType - Type of policy to retrieve.
     */
    const fetchPrivatePolicy = async (policyType) => {
        try {
            setLoading(true)
            setError(null)

            const res = await apiPrivatePolicy(policyType)

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
        fetchPrivatePolicy("terms_and_conditions")
    }, [])

    return (
        <section className="relative w-full bg-white mx-auto px-5 md:px-8 lg:px-12 py-10 mt-15">
            <div className="max-w-7xl mx-auto text-[#374151] space-y-8">
                <h1 className="text-3xl md:text-4xl font-semibold text-[#8B4513]">
                    Terms and Conditions
                </h1>

                {/* Loading Spinner */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b4513]"></div>
                    </div>
                )}

                {/* Policy Document Content */}
                {!loading && policy && (
                    <>
                        <p className="text-sm text-gray-500">
                            Version {policy.version}
                        </p>

                        <div
                            className="space-y-4 prose max-w-none text-[#374151]"
                            dangerouslySetInnerHTML={{ __html: policy.content }}
                        />
                    </>
                )}

                {!loading && !policy && (
                    <div className="py-20 text-center text-gray-500 text-lg font-medium">
                        {error || 'Data not found'}
                    </div>
                )}
            </div>
        </section>
    )
}

export default TermsAndConditionsContent

