'use client'
import { apiPrivatePolicy } from '@/services/privatePolicyService'
import React, { useEffect, useState } from 'react'

const PrivatePolicyHero = () => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [policy, setPolicy] = useState(null)

    const fetchPrivatePolicy = async () => {
        try {
            setLoading(true)
            setError(null)

            const res = await apiPrivatePolicy()

            if (res?.status && res?.data?.length > 0) {
                setPolicy(res.data[0]) // taking first policy
            } else {
                setError('Privacy policy not found')
            }
        } catch (err) {
            setError('Failed to load privacy policy')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPrivatePolicy()
    }, [])

    return (
        <section className="relative w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12 py-20 mt-15">
            <div className="max-w-7xl mx-auto text-[#374151] space-y-8">

                {/* LOADING STATE */}
                {loading && (
                    <p className="text-sm text-gray-500">
                        Loading privacy policy...
                    </p>
                )}

                {/* ERROR STATE */}
                {!loading && error && (
                    <p className="text-sm text-red-500">
                        {error}
                    </p>
                )}

                {/* CONTENT */}
                {!loading && !error && policy && (
                    <>
                        {/* HEADING */}
                        <h1 className="text-3xl md:text-4xl font-semibold text-[#1C2C56]">
                            {policy.title}
                        </h1>

                        <p className="text-sm text-gray-500">
                            Version {policy.version}
                        </p>

                        {/* POLICY CONTENT */}
                        <div className="space-y-4 whitespace-pre-line">
                            {policy.content}
                        </div>
                    </>
                )}

            </div>
        </section>
    )
}

export default PrivatePolicyHero
