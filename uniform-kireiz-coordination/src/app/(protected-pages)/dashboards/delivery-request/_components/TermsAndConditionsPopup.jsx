import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import React, { useState, useEffect } from 'react'
import { apiPrivatePolicy } from '@/services/privatePolicyService'
import { formatDate } from '@/utils/dateFormater'

const TermsAndConditionsPopup = ({ isOpen, onClose }) => {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [termsConditions, setTermsConditions] = useState(null)


    const fetchPrivatePolicy = async (policyType) => {
        try {
            setLoading(true)
            setError(null)

            const res = await apiPrivatePolicy(policyType)

            if (res?.status && res?.data?.length > 0) {
                setTermsConditions(res.data[0]) // taking first terms conditions
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
        fetchPrivatePolicy("agreement")
    }, [])
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={800}
        >
            <div className="flex flex-col h-full max-h-[90vh] min-h-[400px]">

                {/* HEADER */}
                <div className="
                    relative
                    px-16 sm:px-16
                    pt-5 pb-4
                    border-b
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-2
                ">
                    <h2 className="
                        text-lg
                        sm:text-xl
                        font-semibold
                        text-center
                        sm:text-left
                        text-[#003562]
                    ">
                        Terms & Conditions
                    </h2>

                    <span className="
                        text-xs
                        sm:text-sm
                        text-gray-500
                        text-center
                        sm:text-right
                    ">
                        Last Updated: {termsConditions?.updated_at && formatDate(termsConditions.updated_at)}
                    </span>
                </div>

                {/* CONTENT */}
                <div className="
                    px-4 sm:px-6
                    py-4
                    overflow-y-auto
                    flex-1
                ">
                    {loading && (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C4FA8]"></div>
                        </div>
                    )}

                    {!loading && termsConditions && (
                        <div
                            className="space-y-4 prose max-w-none text-sm sm:text-base leading-relaxed text-[#374151]"
                            dangerouslySetInnerHTML={{ __html: termsConditions.content }}
                        />
                    )}

                    {!loading && !termsConditions && (
                        <div className="py-20 text-center text-gray-500 text-lg font-medium">
                            Data not found
                        </div>
                    )}
                </div>

                {/* FOOTER */}
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
                        Cancel
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
                        onClick={onClose}
                    >
                        I Agree
                    </Button>
                </div>

            </div>
        </Dialog>
    )
}

export default TermsAndConditionsPopup
