'use client'

import { FiArrowLeft } from 'react-icons/fi'
import { useParams, useRouter } from 'next/navigation'

const paymentMethods = [
    'NP Kakebarai',
    'PayPal',
    'Convenience Store',
    'ApplePay',
    'Google Pay',
]

const MakePayment = () => {
    const params = useParams()
    const router = useRouter()
    const quotationId = params?.id || 'QT-2026'

    const handleBack = () => {
        router.push(`/profile/my-quotations/signature-success/${quotationId}`)
    }

    const handleContinue = () => {
        router.push(`/profile/my-quotations/order-confirmed/${quotationId}`)
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
                <h2 className="text-xl font-semibold text-[#2C1810]">Make Payment</h2>
            </div>

            <div className="rounded-2xl border border-[#F6EAE4] bg-[#FFF8F5] p-5 shadow-sm md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C38D72]">
                    Select Payment Method
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {paymentMethods.map((method, index) => (
                        <label
                            key={method}
                            className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm text-[#5A3E2B] ${
                                index === 0
                                    ? 'border-[#E0B89F] bg-[#FFF4ED]'
                                    : 'border-[#E7D8D0] bg-white'
                            }`}
                        >
                            <input
                                type="radio"
                                name="payment-method"
                                defaultChecked={index === 0}
                                className="h-4 w-4 accent-[#A95A2C]"
                            />
                            <span>{method}</span>
                        </label>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={handleContinue}
                    className="mt-6 rounded-md bg-[#A95A2C] px-5 py-2.5 text-sm font-semibold text-white"
                >
                    Continue
                </button>
            </div>
        </div>
    )
}

export default MakePayment
