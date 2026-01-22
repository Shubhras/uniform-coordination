'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiOrderPayment } from '@/services/paymentService'
import {
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js'
import ThankyouPopup from '../../thankyou-popup/ThankyouPopup'
import PaymentFailedPopup from '../../payment-failed-popup/PaymentFailedPopup'

const PaymentHero = () => {
    const stripe = useStripe()
    const elements = useElements()
    const { data: session } = useSession()
    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId')

    const [dialogThankyouPopupOpen, setDialogThankyouPopupOpen] = useState(false)
    const [dialogCancelPopupOpen, setDialogCancelPopupOpen] = useState(false)

    const [paymentMethod, setPaymentMethod] = useState('card')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    /* ---------------- CREATE PAYMENT METHOD ---------------- */
    const createPaymentMethod = async () => {
        if (!stripe || !elements) {
            throw new Error('Stripe not loaded')
        }

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardNumberElement),
        })

        if (error) {
            throw new Error(error.message)
        }

        return paymentMethod.id
    }

    /* ---------------- HANDLE PAYMENT ---------------- */
    const handlePayment = async () => {
        try {
            setLoading(true)
            setError(null)

            const paymentMethodId = await createPaymentMethod()

            const payload = {
                order_id: orderId,
                payment_method: 'stripe',
                payment_method_id: paymentMethodId,
                currency: 'usd',
            }

            const res = await apiOrderPayment(session?.accessToken, payload)

            if (res?.status) {
                setSuccess(true)
                setDialogThankyouPopupOpen(true)
            } else {
                throw new Error('Payment failed')
            }
        } catch (err) {
            setError(err.message || 'Payment failed')
            setDialogCancelPopupOpen(true)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <section className="w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12 mt-14">
                <div className="py-10 max-w-4xl mx-auto">
                    <div className="border rounded-xl p-8 space-y-6">
                        <h2 className="text-xl font-semibold">Payment Information</h2>

                        {/* PAYMENT METHODS */}
                        <div className="flex flex-wrap gap-6">
                            {[
                                { id: 'card', label: 'Credit Card' },
                                { id: 'paypal', label: 'PayPal' },
                                { id: 'bank', label: 'Bank Transfer' },
                                { id: 'apple', label: 'Apple Pay' },
                            ].map((method) => (
                                <label key={method.id} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={paymentMethod === method.id}
                                        onChange={() => setPaymentMethod(method.id)}
                                    />
                                    <span>{method.label}</span>
                                </label>
                            ))}
                        </div>

                        {/* STRIPE CARD UI */}
                        {paymentMethod === 'card' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm mb-1 block">Card Number</label>
                                    <div className="border rounded-md px-4 py-3">
                                        <CardNumberElement />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm mb-1 block">Expiry Date</label>
                                        <div className="border rounded-md px-4 py-3">
                                            <CardExpiryElement />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm mb-1 block">CVV</label>
                                        <div className="border rounded-md px-4 py-3">
                                            <CardCvcElement />
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500">🔒 Secure payment by Stripe</p>
                            </div>
                        )}

                        {/* ERROR */}
                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        {/* ACTION */}
                        <div className="flex justify-end pt-6">
                            <button
                                disabled={loading || !stripe}
                                onClick={handlePayment}
                                className="px-10 py-3 bg-[#8B4513] text-white rounded-md disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Continue'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <ThankyouPopup
                isOpen={dialogThankyouPopupOpen}
                onClose={() => setDialogThankyouPopupOpen(false)}
            />

            <PaymentFailedPopup
                isOpen={dialogCancelPopupOpen}
                onClose={() => setDialogCancelPopupOpen(false)}
            />
        </>
    )
}

export default PaymentHero
