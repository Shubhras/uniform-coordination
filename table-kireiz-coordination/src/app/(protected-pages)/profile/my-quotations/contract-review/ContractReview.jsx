'use client'

import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { useParams, useRouter } from 'next/navigation'

const contractReviewData = {
    id: 'QT-2026',
    company: 'Sakura Elegance Spring Gala',
    contact: 'Yuki Maeda',
    businessEmail: 'y.maeda@kireiz-space.jp',
}

const contractParagraphs = [
    'The Lessor agrees to rent the items listed in Schedule A of the licence for the period noted in the quotation. Items shall be delivered and collected according to the agreed event schedule.',
    'More than 30 days before delivery: no charge. Between 15 and 30 days before delivery: 50% of total rental fee. Within 7 days before delivery: 100% of total rental fee.',
    'If the rented items are not returned by the agreed return date, the Lessee shall pay a late fee per item per day until all items are returned in satisfactory condition.',
    'The Lessee is responsible for any damage, loss, or theft of rented items during the rental period. Compensation shall be assessed at replacement cost or repair cost, whichever is lower.',
]

const ContractReview = () => {
    const params = useParams()
    const router = useRouter()
    const quotationId = params?.id || contractReviewData.id

    const handleBack = () => {
        router.push(`/profile/my-quotations/contract-inbox/${quotationId}`)
    }

    const handleContinue = () => {
        router.push(`/profile/my-quotations/cloudsign-signature/${quotationId}`)
    }

    return (
        <div className="mx-auto w-full max-w-7xl rounded-2xl bg-[#F5F0EE30] p-5 shadow-md md:p-8">
            <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5D5CD] bg-white text-[#8B6A55]"
                    >
                        <FiArrowLeft size={16} />
                    </button>
                    <div>
                        <h2 className="text-xl font-semibold text-[#2C1810]">Contract Review</h2>
                        <p className="mt-1 text-xs text-[#8D7769]">
                            Please review the full agreement and key clauses before proceeding to
                            signature.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleContinue}
                    className="hidden items-center gap-2 rounded-md bg-[#A95A2C] px-4 py-2.5 text-sm font-semibold text-white md:inline-flex"
                >
                    Continue To CloudSign
                    <FiArrowRight size={14} />
                </button>
            </div>

            <div className="rounded-2xl border border-[#EBDDD4] bg-white p-4 shadow-sm md:p-6">
                <div className="overflow-hidden rounded-xl border border-[#E7D7CE] bg-[#FFFDFC]">
                    <div className="flex items-center justify-between bg-[#53311F] px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-[#F8EEE8]">
                        <span>KIREIZ SPACE</span>
                        <span>RSA-{quotationId}</span>
                    </div>

                    <div className="p-5 md:p-8">
                        <div className="text-center">
                            <p className="text-sm tracking-[0.3em] text-[#8A6A58]">Rental Agreement</p>
                            <h3 className="mt-3 text-[22px] font-semibold text-[#2C1810]">
                                Rental Service Agreement
                            </h3>
                            <p className="mt-2 text-sm text-[#8D7769]">{contractReviewData.company}</p>
                        </div>

                        <div className="mt-8 grid gap-4 rounded-xl bg-[#FAF6F2] p-4 md:grid-cols-2 md:p-5">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B98B73]">
                                    Parties
                                </p>
                                <div className="mt-3 text-sm leading-6 text-[#6E574A]">
                                    <p>Lessor: KIREIZ SPACE Inc.</p>
                                    <p>5-14-8 Minami Aoyama</p>
                                    <p>Tokyo 107-0062</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B98B73]">
                                    Lessee
                                </p>
                                <div className="mt-3 text-sm leading-6 text-[#6E574A]">
                                    <p>{contractReviewData.company}</p>
                                    <p>{contractReviewData.contact}</p>
                                    <p>{contractReviewData.businessEmail}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-6 text-sm leading-7 text-[#6A5244]">
                            <div>
                                <p className="font-semibold uppercase tracking-[0.14em] text-[#B35F32]">
                                    Article 1 - Rental Terms
                                </p>
                                <p className="mt-2">{contractParagraphs[0]}</p>
                            </div>

                            <div>
                                <p className="font-semibold uppercase tracking-[0.14em] text-[#B35F32]">
                                    Article 2 - Cancellation Policy
                                </p>
                                <p className="mt-2">{contractParagraphs[1]}</p>
                            </div>

                            <div>
                                <p className="font-semibold uppercase tracking-[0.14em] text-[#B35F32]">
                                    Article 3 - Late Return Fee
                                </p>
                                <p className="mt-2">{contractParagraphs[2]}</p>
                            </div>

                            <div>
                                <p className="font-semibold uppercase tracking-[0.14em] text-[#B35F32]">
                                    Article 4 - Damage Compensation
                                </p>
                                <p className="mt-2">{contractParagraphs[3]}</p>
                            </div>
                        </div>

                        <div className="mt-10 rounded-xl border border-[#E9DCD2] bg-[#FAF6F2] p-5">
                            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B98B73]">
                                Signatures
                            </p>
                            <div className="mt-5 grid gap-6 md:grid-cols-2">
                                <div className="text-sm text-[#6E574A]">
                                    <p className="font-semibold italic text-[#2C1810]">H. Tanaka</p>
                                    <p className="mt-2">Lessor Representative</p>
                                    <p>KIREIZ SPACE</p>
                                    <p>Date: July 13, 2026</p>
                                </div>
                                <div className="text-sm text-[#6E574A] md:text-right">
                                    <p>Lessee Signature</p>
                                    <p className="mt-2">{contractReviewData.contact}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleContinue}
                    className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#A95A2C] px-4 py-2.5 text-sm font-semibold text-white md:hidden"
                >
                    Continue To CloudSign
                    <FiArrowRight size={14} />
                </button>
            </div>
        </div>
    )
}

export default ContractReview
