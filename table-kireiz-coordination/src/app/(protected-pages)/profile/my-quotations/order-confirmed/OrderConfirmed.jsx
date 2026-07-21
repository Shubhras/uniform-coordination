'use client'

import { FiArrowLeft, FiCheck } from 'react-icons/fi'
import { useParams, useRouter } from 'next/navigation'

const progressSteps = [
    { label: 'Submitted', state: 'done' },
    { label: 'Under Review', state: 'done' },
    { label: 'Quotation Ready', state: 'done' },
    { label: 'Contract', state: 'done' },
    { label: 'Completed', state: 'done' },
]

const StepIcon = () => (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#7E9B71] bg-[#7E9B71] text-white">
        <FiCheck size={16} />
    </div>
)

const OrderConfirmed = () => {
    const params = useParams()
    const router = useRouter()
    const quotationId = params?.id || 'QT-2026'

    const handleBack = () => {
        router.push(`/profile/my-quotations/make-payment/${quotationId}`)
    }

    const handleViewOrder = () => {
        router.push('/profile/my-quotations')
    }

    return (
        <div className="mx-auto w-full max-w-7xl rounded-2xl bg-[#F5F0EE30] p-5 shadow-md md:p-8">
            <div className="mb-5 flex items-center gap-3">
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5D5CD] bg-white text-[#8B6A55]"
                >
                    <FiArrowLeft size={16} />
                </button>
                <h2 className="text-xl font-semibold text-[#2C1810]">Order Confirmed</h2>
            </div>

            <div className="rounded-2xl border border-[#F0E4DE] bg-white px-5 py-8 text-center shadow-sm md:px-8 md:py-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#A9D8B1] bg-[#ECFAEF] text-[#2F8C47]">
                    <FiCheck size={22} />
                </div>

                <h3 className="mt-6 text-[32px] font-semibold leading-tight text-[#2C1810]">
                    Your order is fully confirmed
                </h3>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#8D7769]">
                    The signed contract for Q-2026-0847 has been recorded. Our logistics team will
                    be in touch ahead of your delivery window on Sep 12, 2026.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A18C]">
                            Order ID
                        </p>
                        <p className="mt-2 text-sm font-medium text-[#B66636]">KRZ-2026-08847</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A18C]">
                            Signed On
                        </p>
                        <p className="mt-2 text-sm font-medium text-[#B66636]">Jul 21, 2026</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A18C]">
                            Status
                        </p>
                        <p className="mt-2 text-sm font-medium text-[#6F946F]">Completed</p>
                    </div>
                </div>

                <div className="mt-8 hidden md:block">
                    <div className="relative mx-auto max-w-[840px] px-3">
                        <div className="absolute left-[8.5%] right-[8.5%] top-4 h-[2px] bg-[#6F946F]" />

                        <div className="relative grid grid-cols-5">
                            {progressSteps.map((step) => (
                                <div key={step.label} className="flex flex-col items-center">
                                    <StepIcon />
                                    <p className="mt-3 text-sm text-[#6F946F]">{step.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-3 md:hidden">
                    {progressSteps.map((step) => (
                        <div
                            key={step.label}
                            className="flex items-center gap-3 rounded-xl border border-[#F1E4DD] px-4 py-3"
                        >
                            <StepIcon />
                            <p className="text-sm text-[#6F946F]">{step.label}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        onClick={handleViewOrder}
                        className="rounded-md bg-[#A95A2C] px-5 py-2.5 text-sm font-semibold text-white"
                    >
                        View Order
                    </button>
                    <button
                        type="button"
                        className="rounded-md border border-[#D8A37F] bg-white px-5 py-2.5 text-sm font-semibold text-[#B66636]"
                    >
                        Download Signed Contract
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OrderConfirmed
