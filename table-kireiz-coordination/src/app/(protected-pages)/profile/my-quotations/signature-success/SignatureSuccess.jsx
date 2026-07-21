'use client'

import { FiArrowLeft, FiCheck, FiLock } from 'react-icons/fi'
import { useParams, useRouter } from 'next/navigation'

const progressSteps = [
    { label: 'Submitted', state: 'done' },
    { label: 'Under Review', state: 'done' },
    { label: 'Quotation Ready', state: 'done' },
    { label: 'Contract', state: 'done' },
    { label: 'Completed', state: 'upcoming' },
]

const stepLabelStyles = {
    done: 'text-[#6F946F]',
    active: 'font-medium text-[#C26D3C]',
    upcoming: 'text-[#B8A89E]',
}

const StepIcon = ({ state }) => {
    if (state === 'done') {
        return (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#7E9B71] bg-[#7E9B71] text-white">
                <FiCheck size={16} />
            </div>
        )
    }

    return <div className="h-8 w-8 rounded-full border border-[#E1D4CB] bg-white" />
}

const SignatureSuccess = () => {
    const params = useParams()
    const router = useRouter()
    const quotationId = params?.id || 'QT-2026'

    const handleBack = () => {
        router.push(`/profile/my-quotations/cloudsign-signature/${quotationId}`)
    }

    const handleMakePayment = () => {
        router.push(`/profile/my-quotations/make-payment/${quotationId}`)
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
                <h2 className="text-xl font-semibold text-[#2C1810]">CloudSign Signature</h2>
            </div>

            <div className="rounded-2xl border border-[#F0E4DE] bg-white p-5 shadow-sm md:p-8">
                <div className="mx-auto max-w-[840px]">
                    <div className="hidden md:block">
                        <div className="relative px-3">
                            <div className="absolute left-[8.5%] right-[8.5%] top-4 h-[2px] bg-[#E8DED8]" />
                            <div className="absolute left-[8.5%] right-[18%] top-4 h-[2px] bg-[#6F946F]" />

                            <div className="relative grid grid-cols-5">
                                {progressSteps.map((step) => (
                                    <div key={step.label} className="flex flex-col items-center">
                                        <StepIcon state={step.state} />
                                        <p className={`mt-3 text-sm ${stepLabelStyles[step.state]}`}>
                                            {step.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 md:hidden">
                        {progressSteps.map((step) => (
                            <div
                                key={step.label}
                                className="flex items-center gap-3 rounded-xl border border-[#F1E4DD] px-4 py-3"
                            >
                                <StepIcon state={step.state} />
                                <p className={`text-sm ${stepLabelStyles[step.state]}`}>{step.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 rounded-2xl border border-[#EFE2DB] bg-white px-4 py-8 text-center shadow-[0_10px_25px_rgba(44,24,16,0.08)] md:px-6">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FCE9DF] px-3 py-1 text-[11px] font-semibold text-[#B66636]">
                            <FiLock size={11} />
                            Secured by CloudSign
                        </span>

                        <div className="mx-auto mt-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#A9D8B1] bg-[#ECFAEF] text-[#2F8C47]">
                            <FiCheck size={20} />
                        </div>

                        <h3 className="mt-4 text-2xl font-semibold text-[#2C1810]">
                            Signed Successfully
                        </h3>
                        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#8D7769]">
                            Your signature has been securely recorded. A copy of the fully signed
                            contract has been sent to your email.
                        </p>

                        <div className="mt-6 overflow-hidden rounded-xl border border-[#E8DCD4] bg-[#FBF6F2] text-left">
                            <div className="grid grid-cols-1 gap-y-3 px-4 py-4 text-sm md:grid-cols-[180px_1fr] md:px-5">
                                <p className="text-[#8D7769]">Signer</p>
                                <p className="font-medium text-[#2C1810]">
                                    Yuki Tanaka, Mitsui Fudosan Residential Co., Ltd.
                                </p>
                                <p className="text-[#8D7769]">Signed On</p>
                                <p className="font-medium text-[#2C1810]">Jul 21, 2026, 17:42 JST</p>
                                <p className="text-[#8D7769]">Document Hash</p>
                                <p className="font-medium text-[#2C1810]">872c-91ab-4d0e-773f</p>
                                <p className="text-[#8D7769]">Verification ID</p>
                                <p className="font-medium text-[#2C1810]">CS-JP-2026-66204</p>
                            </div>
                            <div className="border-t border-[#E8DCD4] bg-[#F6ECE5] px-4 py-3 text-xs leading-5 text-[#B07C61] md:px-5">
                                This signature is legally binding under the Japanese Electronic
                                Signature Act. A complete audit trail, including IP address and
                                timestamp verification, is stored with CloudSign and available in
                                your signed contract package.
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleMakePayment}
                            className="mt-6 rounded-md bg-[#A95A2C] px-5 py-2.5 text-sm font-semibold text-white"
                        >
                            Make Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignatureSuccess
