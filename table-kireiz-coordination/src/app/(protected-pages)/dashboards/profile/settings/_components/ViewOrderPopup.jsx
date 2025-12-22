import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'

const ViewOrderPopup = ({ isOpen, onClose }) => {

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            className="w-full md:min-w-3xl mx-auto "
        >
            <div className="flex flex-col">

                {/* HEADER */}
                <div className="border-b px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Order #ORD-10234
                        </h2>
                        <p className="text-sm text-gray-500">
                            Last updated: December 1, 2025
                        </p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                        Completed
                    </span>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                    {/* CUSTOMER & ORDER INFO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Customer Details</h4>
                            <p><span className="font-medium">Name:</span> John Doe</p>
                            <p><span className="font-medium">Email:</span> john@example.com</p>
                            <p><span className="font-medium">Phone:</span> +91 98765 43210</p>
                        </div>

                        <div className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Order Information</h4>
                            <p><span className="font-medium">Order Date:</span> Nov 28, 2025</p>
                            <p><span className="font-medium">Payment:</span> Credit Card</p>
                            <p><span className="font-medium">Delivery:</span> Standard</p>
                        </div>
                    </div>

                    {/* ITEMS TABLE */}
                    <div className="border rounded-lg overflow-hidden">
                        <h4 className="font-semibold px-4 py-3 border-b">
                            Ordered Items
                        </h4>

                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-4 py-2">Product</th>
                                    <th className="text-center px-4 py-2">Qty</th>
                                    <th className="text-right px-4 py-2">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t">
                                    <td className="px-4 py-3">Corporate Uniform – Navy Blue</td>
                                    <td className="text-center px-4">2</td>
                                    <td className="text-right px-4">₹2,400</td>
                                </tr>
                                <tr className="border-t">
                                    <td className="px-4 py-3">Chef Coat – White</td>
                                    <td className="text-center px-4">1</td>
                                    <td className="text-right px-4">₹1,200</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* SUMMARY */}
                    <div className="border rounded-lg p-4 max-w-full ml-auto space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹3,600</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax</span>
                            <span>₹180</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg">
                            <span>Total</span>
                            <span>₹3,780</span>
                        </div>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="border-t px-6 py-4 flex justify-end gap-3">
                    <Button variant="plain" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        variant="solid"
                        className="bg-[#A0522D] hover:bg-[#A0522D] text-white px-8"
                        onClick={onClose}
                    >
                        OK
                    </Button>
                </div>

            </div>
        </Dialog>
    )
}

export default ViewOrderPopup
