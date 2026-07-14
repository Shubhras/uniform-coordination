import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'

const TermsAndConditionsPopup = ({ isOpen, onClose }) => {
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
            <div className="flex flex-col h-full max-h-[90vh]">

                {/* HEADER */}
                <div className="
                    relative
                    px-4 sm:px-6
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
                        Last Updated: December 1, 2025
                    </span>
                </div>

                {/* CONTENT */}
                <div className="
                    px-4 sm:px-6
                    py-4
                    overflow-y-auto
                    flex-1
                ">
                    <h5 className="font-medium mt-3 mb-3">
                        1. AGREEMENT TO TERMS
                    </h5>
                    <p className="text-sm sm:text-base leading-relaxed">
                        By placing an order for custom uniforms through KIREIZU UNIFORM, you acknowledge.
                    </p>
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
