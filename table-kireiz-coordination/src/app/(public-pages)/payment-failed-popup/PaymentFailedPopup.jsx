'use client'

import Dialog from '@/components/ui/Dialog'

/**
 * PaymentFailedPopup Component
 * 
 * Modal dialog displayed when payment transaction fails or is declined.
 * 
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Modal visibility flag.
 * @param {Function} props.onClose - Modal close handler callback.
 */
const PaymentFailedPopup = ({ isOpen, onClose }) => {
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            className="w-full md:min-w-3xl mx-auto"
        >
            <div className="rounded-xl overflow-hidden bg-white">
                {/* Header */}
                <div className="bg-[#FAF6F4] px-6 py-6 text-center mb-3">
                    <div className="flex justify-center items-center gap-2">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full border border-red-400 text-red-500 text-lg">
                            ✕
                        </span>
                        <h2 className="text-lg font-semibold text-[#3F3F3F]">
                            Payment Failed
                        </h2>
                    </div>
                </div>

                {/* Body */}
                <div className="space-y-5 text-base">
                    {/* Message Details */}
                    <div className="shadow-md rounded-md p-4 text-base">
                        <p className="text-[#374151] font-semibold mb-2">
                            Sorry, your payment was declined.
                        </p>
                        <p className="text-[#6B7280]">
                            <span className="font-medium">Reason:</span> Insufficient Funds
                        </p>
                        <p className="text-[#6B7280]">
                            <span className="font-medium">Reference:</span> DEC-12345
                        </p>
                    </div>

                    {/* Suggestions */}
                    <div className="shadow-md rounded-md p-4">
                        <p className="font-semibold text-[#374151] mb-2">
                            Please Try:
                        </p>
                        <ul className="list-inside list-none text-[#6B7280]">
                            <li>Another payment method</li>
                            <li>Contact your bank</li>
                            <li>Verify card details</li>
                        </ul>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-6 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-md bg-[#A0522D] text-white text-sm font-medium"
                    >
                        Try again
                    </button>

                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-md bg-[#A0522D] text-white text-sm font-medium"
                    >
                        Use Different Method
                    </button>
                </div>
            </div>
        </Dialog>
    )
}

export default PaymentFailedPopup

