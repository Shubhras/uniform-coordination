'use client'

import { FiArrowLeft, FiArrowRight, FiCheck, FiLock } from 'react-icons/fi'
import { useParams, useRouter } from 'next/navigation'

const progressSteps = [
    { label: 'Submitted', state: 'done' },
    { label: 'Under Review', state: 'done' },
    { label: 'Quotation Ready', state: 'done' },
    { label: 'Contract', state: 'active' },
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

    if (state === 'active') {
        return (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D39A70] bg-white">
                <div className="h-4 w-4 rounded-full border-2 border-[#B66636] bg-[#D7925F]" />
            </div>
        )
    }

    return <div className="h-8 w-8 rounded-full border border-[#E1D4CB] bg-white" />
}

const SignatureIcon = () => (
    <div className="relative h-20 w-20">
        <div className="absolute left-2 top-5 h-9 w-9 rounded-lg border-[3px] border-[#B66636]" />
        <div className="absolute left-6 top-2 h-14 w-9 rounded-lg border-[4px] border-[#B66636] bg-white" />
    </div>
)

const CloudSignSignature = () => {
    const params = useParams()
    const router = useRouter()
    const quotationId = params?.id || 'QT-2026'

    const handleBack = () => {
        router.push(`/profile/my-quotations/contract-review/${quotationId}`)
    }

    const handleCompleteSignature = () => {
        router.push(`/profile/my-quotations/signature-success/${quotationId}`)
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

                    <div className="mt-8 rounded-2xl border border-[#EFE2DB] bg-white px-6 py-8 text-center shadow-[0_10px_25px_rgba(44,24,16,0.08)]">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FCE9DF] px-3 py-1 text-[11px] font-semibold text-[#B66636]">
                            <FiLock size={11} />
                            Secured by CloudSign
                        </span>

                        <div className="mt-5 flex justify-center">
                            <SignatureIcon />
                        </div>

                        <h3 className="mt-2 text-2xl font-semibold text-[#2C1810]">
                            Waiting for Signature
                        </h3>
                        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#8D7769]">
                            Please complete your signature within the CloudSign secure window. This
                            page will update automatically once signing is complete.
                        </p>

                        <button
                            type="button"
                            onClick={handleCompleteSignature}
                            className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#A95A2C] px-5 py-2.5 text-sm font-semibold text-white"
                        >
                            Complete Signature
                            <FiArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CloudSignSignature
