'use client'
import Dialog from '@/components/ui/Dialog'

const ThankyouPopup = ({ isOpen, onClose }) => {
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            // closable={false}
            className="w-full md:min-w-3xl mx-auto p-0"
        >
            <div className="rounded-xl overflow-hidden bg-white">

                {/* HEADER */}
                <div className="bg-[#FAF6F4] px-6 py-8 text-center">
                    <h2 className="text-xl font-semibold text-[#3F3F3F]">
                        Thank you for your order! <br /> Your table rental has been confirmed
                    </h2>
                </div>

                {/* BODY */}
                <div className="space-y-6">

                    {/* ORDER SUMMARY */}
                    <div className="bg-white rounded-lg shadow-md p-5">
                        <h4 className="font-medium text-[#111827] mb-4">
                            Order Summary
                        </h4>

                        <div className="text-base text-[#374151]">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>¥24,800</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping:</span>
                                <span>¥2,500</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax:</span>
                                <span>¥2,484</span>
                            </div>
                        </div>
                    </div>

                    {/* RENTAL SUMMARY */}
                    <div className="bg-white rounded-lg shadow-md  p-5 ">
                        <h4 className="font-medium text-[#111827] mb-4">
                            Rental Summary
                        </h4>

                        <div className=" text-base text-[#374151]">
                            <p>
                                <span className="">Start:</span> December 15, 2025
                            </p>
                            <p>
                                <span className="">Return:</span> December 17, 2025
                            </p>
                            <p>
                                <span className="">Duration:</span> 3 days
                            </p>
                        </div>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="px-6 py-6 text-center">
                    <p className="text-sm text-[#6B7280]">
                        Need help? Contact{' '}
                        <span className="text-[#8B4513]">
                            support@kireiz.com
                        </span>
                    </p>
                </div>

            </div>
        </Dialog>
    )
}

export default ThankyouPopup
