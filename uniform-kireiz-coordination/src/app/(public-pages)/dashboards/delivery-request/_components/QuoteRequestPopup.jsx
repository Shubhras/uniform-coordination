import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { apiExportQuotationPdf } from '@/services/QuotationRequestService'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

/**
 * QuoteRequestPopup Component
 *
 * Displays a confirmation popup after a quotation request is submitted,
 * showing request details and options to export the quote as PDF or
 * navigate back to the home page.
 */
const QuoteRequestPopup = ({ isOpen, onClose, quoteData }) => {
    const router = useRouter()
    const { data: session } = useSession()
    if (!isOpen || !quoteData) return null
    const {
        quotation_id,
        email,
        phone_number,
        created_at,
    } = quoteData
    /**
    * Closes the popup and navigates back to the home page.
    */
    const handleBackToHome = () => {
        onClose()
        router.push('/kireiz-form')
    }
    const formattedDate = new Date(created_at).toLocaleDateString(
        'en-GB',
        { day: '2-digit', month: 'short', year: 'numeric' }
    )
    /**
 * Exports the quotation as a PDF by calling the API and opening
 * the returned PDF URL or Blob in a new tab.
 */
    const handleExportPdf = async () => {
        if (!session?.accessToken) {
            alert("Please login first")
            return
        }
        try {
            const response = await apiExportQuotationPdf(
                quotation_id,
                session.accessToken
            )
            if (response?.pdf_url) {
                window.open(response.pdf_url, "_blank")
                return
            }
            if (response instanceof Blob) {
                const url = window.URL.createObjectURL(response)
                window.open(url, "_blank")
            }

        } catch (error) {
            console.error("Export PDF Error:", error)
            alert("Failed to export PDF")
        }
    }
    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleBackToHome}
            onRequestClose={handleBackToHome}
            width={800}
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
                <div className="px-4 sm:px-6 pt-6 sm:pt-8 text-center">
                    <h2 className="text-xl sm:text-2xl font-semibold text-[#003562]">
                        Your Quote Request Has Been Submitted!
                    </h2>
                    <p className="text-gray-600 mt-2 text-xs sm:text-sm">
                        Thank you! Our team has received your request and will contact you within 24 hours.
                    </p>
                </div>
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
                            <li>• Request ID: {quotation_id}</li>
                            <li>• Submitted on: {formattedDate}</li>
                            <li>• Service/Product: (Auto-fill from form)</li>
                            <li>• Quantity/Requirements: (Auto-fill)</li>
                            <li>• Preferred Contact: {email || 'N/A'}</li>
                        </ul>
                    </div>

                    <div className="mb-8">
                        <h5 className="font-medium mb-1">We’ll reach out to:</h5>
                        <p className="mt-2 text-xs sm:text-sm text-gray-700">
                            {email || 'N/A'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-700">
                            {phone_number || 'N/A'}
                        </p>
                    </div>

                    <div className="mb-10">
                        <h5 className="font-medium mb-1">Small Note:</h5>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            You can update your contact info in your profile anytime.
                        </p>
                    </div>
                </div>
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
                            bg-[#1C4FA8]
                            hover:bg-[#1C4FA8]
                            text-white
                            px-10
                            py-2
                            rounded-md
                        "
                        onClick={handleBackToHome}
                    >
                        Back to Home
                    </Button>
                    <button
                        className="
                            w-full sm:w-auto
                            border  border-[#1C4FA8]
                            text-[#003562]
                            px-6
                            py-2
                            rounded-md
                            flex
                            items-center
                            justify-center
                            gap-2
                        "
                        onClick={handleExportPdf}
                    >
                        📄 Export PDF
                    </button>
                </div>
            </div>
        </Dialog>
    )
}
export default QuoteRequestPopup
