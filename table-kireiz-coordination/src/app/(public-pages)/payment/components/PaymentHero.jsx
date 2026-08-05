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
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { FiLock } from 'react-icons/fi'
import { FaGooglePay } from 'react-icons/fa'
import ThankyouPopup from '../../thankyou-popup/ThankyouPopup'
import PaymentFailedPopup from '../../payment-failed-popup/PaymentFailedPopup'

/**
 * PaymentHero Component
 * 
 * Original design layout with brown theme (#8B4513) supporting Stripe Card,
 * PayPal, NP Kakebarai, Bank Transfer, Apple Pay, and Google Pay.
 */
const PaymentHero = () => {
    const stripe = useStripe()
    const elements = useElements()
    const { data: session } = useSession()
    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId')

    const [dialogThankyouPopupOpen, setDialogThankyouPopupOpen] = useState(false)
    const [dialogCancelPopupOpen, setDialogCancelPopupOpen] = useState(false)
    const [paymentId, setPaymentId] = useState(null)

    const [paymentMethod, setPaymentMethod] = useState('card')
    const [cardholderName, setCardholderName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleElementChange = (event) => {
        if (event.error) {
            setError(event.error.message)
        } else {
            setError(null)
        }
    }

    const handlePayment = async () => {
        try {
            setError(null)

            if (!session?.accessToken) {
                setError('Session expired or user not logged in.')
                return
            }

            if (!orderId) {
                setError('Invalid Order ID.')
                return
            }

            if (paymentMethod === 'card') {
                if (!stripe || !elements) {
                    setError('Stripe payment system is loading. Please try again.')
                    return
                }

                const cardNumberElement = elements.getElement(CardNumberElement)
                if (!cardNumberElement) {
                    setError('Card details field missing.')
                    return
                }

                setLoading(true)

                const { error: stripeError, paymentMethod: stripeMethod } = await stripe.createPaymentMethod({
                    type: 'card',
                    card: cardNumberElement,
                })

                if (stripeError) {
                    setError(stripeError.message || 'Please complete all required card fields.')
                    setLoading(false)
                    return
                }

                const payload = {
                    order_id: orderId,
                    payment_method: 'stripe',
                    payment_method_id: stripeMethod.id,
                    currency: 'usd',
                }

                const res = await apiOrderPayment(session.accessToken, payload)

                if (res?.status) {
                    setPaymentId(res?.payment_id || res?.payment_method_id || null);
                    setDialogThankyouPopupOpen(true)
                } else {
                    setError(res?.message || 'Payment processing failed. Please try again.')
                    setDialogCancelPopupOpen(true)
                }
            } else if (paymentMethod === 'googlepay') {
                //setLoading(true)
                // setTimeout(() => {
                //     setLoading(false)
                //     setDialogThankyouPopupOpen(true)
                // }, 1200)
            } else if (paymentMethod === 'paypal') {
                setError('Please click the PayPal button above to complete your payment.')
            } else {
                setError('Selected payment method is currently processing offline. Please choose Credit Card or PayPal.')
            }
        } catch (err) {
            console.error('Payment error:', err)
            setError(err?.message || 'Payment failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handlePayPalSuccess = async (details) => {
        try {
            const payload = {
                order_id: orderId,
                payment_method: 'paypal',
                payment_method_id: details.id,
                currency: 'usd',
            }

            const res = await apiOrderPayment(session?.accessToken, payload)

            if (res?.status) {
                setPaymentId(res?.payment_id || null)
                setDialogThankyouPopupOpen(true)
            } else {
                throw new Error('PayPal payment failed')
            }
        } catch (err) {
            setError(err.message || 'PayPal payment failed')
            setDialogCancelPopupOpen(true)
        }
    }

    return (
        <>
            <section className="w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12 mt-14 min-h-[calc(100vh-360px)] flex flex-col">
                <div className="py-6 max-w-4xl mx-auto w-full">
                    <div className="border-[#D3C4C4] border rounded-xl p-8 space-y-6">
                        <h2 className="text-xl font-semibold text-[#8B4513]">Payment Method</h2>

                        {/* PAYMENT METHODS */}
                        <div className="flex flex-wrap items-center gap-4">
                            {[
                                { id: 'card', label: 'Credit Card' },
                                { id: 'paypal', label: 'PayPal' },
                                { id: 'kakebarai', label: 'NP Kakebarai' },
                                { id: 'bank', label: 'Bank Transfer' },
                                { id: 'apple', label: 'Apple Pay' },
                                { id: 'googlepay', label: 'Google Pay' },
                            ].map((method) => (
                                <label
                                    key={method.id}
                                    className={`flex items-center gap-2.5 border rounded-xl px-4 py-3 cursor-pointer transition ${paymentMethod === method.id
                                        ? 'border-[#8B4513] bg-[#FAF6F4]/60'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        checked={paymentMethod === method.id}
                                        onChange={() => {
                                            setPaymentMethod(method.id)
                                            setError(null)
                                        }}
                                        className="w-4 h-4 accent-[#8B4513] cursor-pointer"
                                    />
                                    <span className="text-base font-medium text-[#374151] whitespace-nowrap">
                                        {method.label}
                                    </span>
                                </label>
                            ))}
                        </div>

                        {/* STRIPE CARD UI */}
                        {paymentMethod === 'card' && (
                            <div className="space-y-4 pt-2">
                                <div>
                                    <label className="text-sm font-medium mb-1 block text-gray-700">
                                        Card Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className={`border rounded-md px-4 py-3 transition ${error ? 'border-red-400 bg-red-50/20' : 'border-gray-300 focus-within:border-[#8B4513]'}`}>
                                        <CardNumberElement onChange={handleElementChange} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block text-gray-700">
                                            Expiry Date <span className="text-red-500">*</span>
                                        </label>
                                        <div className={`border rounded-md px-4 py-3 transition ${error ? 'border-red-400 bg-red-50/20' : 'border-gray-300 focus-within:border-[#8B4513]'}`}>
                                            <CardExpiryElement onChange={handleElementChange} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1 block text-gray-700">
                                            CVV <span className="text-red-500">*</span>
                                        </label>
                                        <div className={`border rounded-md px-4 py-3 transition ${error ? 'border-red-400 bg-red-50/20' : 'border-gray-300 focus-within:border-[#8B4513]'}`}>
                                            <CardCvcElement onChange={handleElementChange} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block text-gray-700">
                                        Cardholder Name
                                    </label>
                                    <input
                                        type="text"
                                        value={cardholderName}
                                        onChange={(e) => setCardholderName(e.target.value)}
                                        placeholder="e.g. Sarah Johnson"
                                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#8B4513] transition"
                                    />
                                </div>

                                <div className="flex items-center gap-2 text-base text-gray-600 pt-2">
                                    <FiLock className="w-5 h-5 text-gray-600" />
                                    <span>Secure payment by Stripe</span>
                                </div>
                            </div>
                        )}

                        {/* GOOGLE PAY FORM */}
                        {/* {paymentMethod === 'googlepay' && (
                            <div className="border border-gray-200 rounded-xl bg-[#FAF6F4]/40 p-6 flex flex-col items-center justify-center gap-4 text-center">
                                <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
                                    <FaGooglePay className="w-16 h-10 text-gray-900" />
                                </div>
                                <p className="text-sm text-gray-600 max-w-sm">
                                    Pay quickly and securely using Google Pay.
                                </p>
                                <button
                                    type="button"
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className="px-8 py-3 bg-[#8B4513] hover:bg-[#71370F] text-white rounded-md transition font-medium text-base disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <FaGooglePay className="w-8 h-5" />
                                    <span>{loading ? 'Processing...' : 'Pay with Google Pay'}</span>
                                </button>
                            </div>
                        )} */}

                        {/* PAYPAL */}
                        {paymentMethod === 'paypal' && (
                            <div className="pt-4 max-w-md mx-auto min-h-[180px] relative z-10">
                                <PayPalScriptProvider
                                    options={{
                                        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test',
                                        currency: 'USD',
                                        intent: 'capture',
                                        disableFunding: 'card,credit',
                                    }}
                                >
                                    <PayPalButtons
                                        style={{
                                            layout: 'vertical',
                                            color: 'gold',
                                            shape: 'rect',
                                            label: 'paypal',
                                            tagline: false,
                                        }}
                                        createOrder={(data, actions) =>
                                            actions.order.create({
                                                purchase_units: [
                                                    {
                                                        amount: {
                                                            value: '10.00',
                                                        },
                                                    },
                                                ],
                                            })
                                        }
                                        onApprove={(data, actions) =>
                                            actions.order.capture().then(handlePayPalSuccess)
                                        }
                                        onError={() => setDialogCancelPopupOpen(true)}
                                    />
                                </PayPalScriptProvider>
                            </div>
                        )}

                        {/* OTHER PAYMENT NOTICES */}
                        {/* {paymentMethod === 'kakebarai' && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-md p-4 text-sm font-medium">
                                NP Kakebarai invoice payment instructions will be sent upon order confirmation.
                            </div>
                        )}

                        {paymentMethod === 'bank' && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-4 text-sm font-medium">
                                Bank Transfer instructions will be sent to your registered email upon order placement.
                            </div>
                        )}

                        {paymentMethod === 'apple' && (
                            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-4 text-sm font-medium">
                                Apple Pay is currently supported on compatible Safari browser devices.
                            </div>
                        )} */}

                        {/* ERROR MESSAGE */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* ACTION BUTTON FOR CARD */}
                        {paymentMethod === 'card' && (
                            <div className="flex justify-end pt-6">
                                <button
                                    disabled={loading || !stripe}
                                    onClick={handlePayment}
                                    className="px-10 py-3 bg-[#8B4513] hover:bg-[#71370F] text-white rounded-md transition font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Continue'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <ThankyouPopup
                isOpen={dialogThankyouPopupOpen}
                onClose={() => setDialogThankyouPopupOpen(false)}
                paymentId={paymentId}
            />

            <PaymentFailedPopup
                isOpen={dialogCancelPopupOpen}
                onClose={() => setDialogCancelPopupOpen(false)}
            />
        </>
    )
}

export default PaymentHero
