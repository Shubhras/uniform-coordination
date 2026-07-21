'use client'

import { FiArrowLeft, FiCheck } from 'react-icons/fi'
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

const contractInboxData = {
    id: 'QT-2026',
    company: 'Sakura Elegance Spring Gala',
    quotationDate: 'Jul 13, 2026',
    contractStatus: 'Pending Signature',
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

const ContractPreviewCard = () => (
    <div className="flex h-[190px] w-[130px] shrink-0 rounded-xl border-[6px] border-[#F0E8E1] bg-white p-3 shadow-sm">
        <div className="w-full space-y-3">
            <div className="space-y-2">
                <div className="h-1.5 w-10 rounded bg-[#ECE2D7]" />
                <div className="h-1.5 w-full rounded bg-[#F1E8DF]" />
                <div className="h-1.5 w-4/5 rounded bg-[#F1E8DF]" />
            </div>
            <div className="h-5 w-full rounded bg-[#F2E8DE]" />
            <div className="space-y-2">
                <div className="h-1.5 w-8 rounded bg-[#ECE2D7]" />
                <div className="h-1.5 w-full rounded bg-[#F1E8DF]" />
                <div className="h-1.5 w-5/6 rounded bg-[#F1E8DF]" />
            </div>
            <div className="h-5 w-full rounded bg-[#F2E8DE]" />
            <div className="space-y-2">
                <div className="h-1.5 w-full rounded bg-[#F1E8DF]" />
                <div className="h-1.5 w-4/5 rounded bg-[#F1E8DF]" />
            </div>
        </div>
    </div>
)

const ContractInbox = () => {
    const params = useParams()
    const router = useRouter()
    const quotationId = params?.id || contractInboxData.id

    const handleBack = () => {
        router.push(`/profile/my-quotations/contract-accepted-detail/${quotationId}`)
    }

    const handleReviewContract = () => {
        router.push(`/profile/my-quotations/contract-review/${quotationId}`)
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
                <h2 className="text-xl font-semibold text-[#2C1810]">Contract Inbox</h2>
            </div>

            <div className="rounded-2xl border border-[#F0E4DE] bg-white p-5 shadow-sm md:p-8">
                <h3 className="text-[26px] font-semibold leading-tight text-[#2C1810]">
                    Your contract is ready for review
                </h3>
                <p className="mt-2 text-sm text-[#8D7769]">
                    KIREIZ SPACE has generated your rental agreement. Review the document, then
                    sign securely via CloudSign.
                </p>

                <div className="mt-8 hidden md:block">
                    <div className="relative mx-auto max-w-[840px] px-3">
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

                <div className="mt-6 space-y-3 md:hidden">
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

                <div className="mt-8 rounded-2xl border border-[#EFE2DB] bg-white p-6 shadow-[0_10px_25px_rgba(44,24,16,0.08)]">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                        <ContractPreviewCard />

                        <div className="flex-1">
                            <h4 className="max-w-xl text-[20px] font-semibold leading-snug text-[#2C1810]">
                                Rental Service Agreement - {contractInboxData.company}
                            </h4>
                            <p className="mt-2 text-sm text-[#9E8677]">
                                Linked to Quotation {contractInboxData.id}
                            </p>

                            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B69786]">
                                        Generated On
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-[#2C1810]">
                                        {contractInboxData.quotationDate}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B69786]">
                                        Contract Status
                                    </p>
                                    <span className="mt-1 inline-flex rounded-full bg-[#FCE9DF] px-3 py-1 text-xs font-semibold text-[#C26D3C]">
                                        {contractInboxData.contractStatus}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleReviewContract}
                                className="mt-8 rounded-md bg-[#A95A2C] px-5 py-2.5 text-sm font-semibold text-white"
                            >
                                Review Contract
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContractInbox
