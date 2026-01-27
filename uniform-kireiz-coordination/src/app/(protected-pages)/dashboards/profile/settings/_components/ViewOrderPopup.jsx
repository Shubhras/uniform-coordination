import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { apiGetOrderDetail } from '@/services/AuthProfileService'
import { useSession } from 'next-auth/react'

const ViewOrderPopup = ({ isOpen, onClose, orderId }) => {
    const { data: session } = useSession()

    const [loading, setLoading] = useState(false)
    const [orderData, setOrderData] = useState(null)

    const fetchOrderDetail = async () => {
        try {
            const payload = {
                "order_id": orderId
            }
            if (!session?.accessToken || !orderId) return
            setLoading(true)

            const res = await apiGetOrderDetail(session.accessToken, payload)
            if (res?.status) {
                setOrderData(res.data || null)
            } else {
                setOrderData(null)
            }
        } catch (err) {
            console.error('Failed to fetch order detail', err)
            setOrderData(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchOrderDetail()
        }
    }, [isOpen, orderId])

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            className="w-full md:min-w-3xl mx-auto"
        >
            <div className="flex flex-col">

                {/* LOADING STATE */}
                {loading && (
                    <div className="py-20 text-center text-sm text-gray-500">
                        Loading order details...
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && !orderData && (
                    <div className="py-20 text-center text-sm text-gray-500">
                        Order details not found
                    </div>
                )}

                {/* CONTENT */}
                {!loading && orderData && (
                    <>
                        {/* HEADER */}
                        <div className="border-b px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-[#1C2C56]">
                                    Order #{orderData.orderNumber}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Last updated: {orderData.updatedAt}
                                </p>
                            </div>

                            <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                                {orderData.status}
                            </span>
                        </div>

                        {/* BODY */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                            {/* CUSTOMER & ORDER INFO */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-semibold mb-3">Customer Details</h4>
                                    <p><span className="font-medium">Name:</span> {orderData.customer?.name}</p>
                                    <p><span className="font-medium">Email:</span> {orderData.customer?.email}</p>
                                    <p><span className="font-medium">Phone:</span> {orderData.customer?.phone}</p>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h4 className="font-semibold mb-3">Order Information</h4>
                                    <p><span className="font-medium">Order Date:</span> {orderData.orderDate}</p>
                                    <p><span className="font-medium">Payment:</span> {orderData.paymentMethod}</p>
                                    <p><span className="font-medium">Delivery:</span> {orderData.deliveryType}</p>
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
                                        {orderData.items.map((item, idx) => (
                                            <tr key={idx} className="border-t">
                                                <td className="px-4 py-3">{item.name}</td>
                                                <td className="text-center px-4">{item.quantity}</td>
                                                <td className="text-right px-4">₹{item.price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* SUMMARY */}
                            <div className="border rounded-lg p-4 max-w-full ml-auto space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹{orderData.subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span>₹{orderData.tax}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span>₹{orderData.total}</span>
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
                                className="bg-[#1C2C56] hover:bg-[#1C2C56] text-white px-8"
                                onClick={onClose}
                            >
                                OK
                            </Button>
                        </div>
                    </>
                )}

            </div>
        </Dialog>
    )
}

export default ViewOrderPopup
