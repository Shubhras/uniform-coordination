import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'

const QuoteRequestPopup = ({ isOpen, onClose }) => {
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            className="
                w-full
                max-w-[800px]
                mx-4
                sm:mx-auto
            "
        >
            <div className="
                flex
                flex-col
                bg-white
                rounded-xl
                w-full
                max-h-[90vh]
                overflow-hidden
            ">
                {/* Header */}
                <div className="px-4 sm:px-6 pt-6 sm:pt-8 text-center">
                    <h2 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">
                        Your Quote Request Has Been Submitted!
                    </h2>
                    <p className="text-gray-600 mt-2 text-xs sm:text-sm">
                        Thank you! Our team has received your request and will contact you within 24 hours.
                    </p>
                </div>

                {/* Body */}
                <div className="
                    flex-1
                    overflow-y-auto
                    px-4 sm:px-6
                    py-6
                    custom-scrollbar
                ">
                    <div className="bg-white border rounded-lg p-4 sm:p-6 mb-8 shadow-sm">
                        <h5 className="font-medium mb-1">Request Details:</h5>
                        <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                            <li>• Request ID: RQ-2025-0194</li>
                            <li>• Submitted on: 26 Nov 2025</li>
                            <li>• Service/Product: (Auto-fill from form)</li>
                            <li>• Quantity/Requirements: (Auto-fill)</li>
                            <li>• Preferred Contact: Email / Phone</li>
                        </ul>
                    </div>

                    <div className="mb-8">
                        <h5 className="font-medium mb-1">We’ll reach out to:</h5>
                        <p className="mt-2 text-xs sm:text-sm text-gray-700">
                            Abc@example.com
                        </p>
                        <p className="text-xs sm:text-sm text-gray-700">
                            +91 XXXXX XXXXX
                        </p>
                    </div>

                    <div className="mb-10">
                        <h5 className="font-medium mb-1">Small Note:</h5>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            You can update your contact info in your profile anytime.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="
                    p-4 sm:p-6
                    bg-white
                    flex
                    flex-col-reverse
                    sm:flex-row
                    sm:justify-end
                    gap-3 sm:gap-4
                ">
                    <Button
                        variant="solid"
                        className="
                            w-full sm:w-auto
                            bg-[#1C2C56]
                            hover:bg-[#1C2C56]
                            text-white
                            px-10
                            py-2
                            rounded-md
                        "
                        onClick={onClose}
                    >
                        Back to Home
                    </Button>

                    <button
                        className="
                            w-full sm:w-auto
                            border
                            px-6
                            py-2
                            rounded-md
                            flex
                            items-center
                            justify-center
                            gap-2
                        "
                    >
                        📄 Export PDF
                    </button>
                </div>
            </div>
        </Dialog>
    )
}

export default QuoteRequestPopup
