'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiOrderPayment, apiGetSystemSettings } from '@/services/paymentService'
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
    const [settings, setSettings] = useState(null)

    useEffect(() => {
        const fetchSettings = async () => {
            if (session?.accessToken) {
                try {
                    const res = await apiGetSystemSettings(session.accessToken)
                    if (res?.success && res?.data) {
                        setSettings(res.data)
                        const data = res.data
                        if (data.payment_enable_credit_card) {
                            setPaymentMethod('card')
                        } else if (data.payment_enable_paypay) {
                            setPaymentMethod('paypal')
                        } else if (data.payment_enable_kakebarai) {
                            setPaymentMethod('kakebarai')
                        } else if (data.payment_enable_bank_transfer) {
                            setPaymentMethod('bank')
                        } else if (data.payment_enable_applepay) {
                            setPaymentMethod('apple')
                        } else if (data.payment_enable_googlepay) {
                            setPaymentMethod('googlepay')
                        } else if (data.payment_enable_conbini) {
                            setPaymentMethod('conbini')
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch system settings:', err)
                }
            }
        }
        fetchSettings()
    }, [session])

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
            } else if (['bank', 'kakebarai', 'conbini', 'googlepay', 'apple'].includes(paymentMethod)) {
                setLoading(true)
                const payload = {
                    order_id: orderId,
                    payment_method: paymentMethod,
                    currency: 'usd',
                }

                const res = await apiOrderPayment(session.accessToken, payload)

                if (res?.status) {
                    setPaymentId(res?.payment_id || null)
                    setDialogThankyouPopupOpen(true)
                } else {
                    setError(res?.message || 'Payment processing failed. Please try again.')
                }
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

    const allowedMethods = []
    if (settings) {
        if (settings.payment_enable_credit_card) {
            allowedMethods.push({ id: 'card', label: 'Credit Card' })
        }
        if (settings.payment_enable_paypay) {
            allowedMethods.push({ id: 'paypal', label: 'PayPal' })
        }
        if (settings.payment_enable_kakebarai) {
            allowedMethods.push({ id: 'kakebarai', label: 'NP Kakebarai' })
        }
        if (settings.payment_enable_bank_transfer) {
            allowedMethods.push({ id: 'bank', label: 'Bank Transfer' })
        }
        if (settings.payment_enable_applepay) {
            allowedMethods.push({ id: 'apple', label: 'Apple Pay' })
        }
        if (settings.payment_enable_googlepay) {
            allowedMethods.push({ id: 'googlepay', label: 'Google Pay' })
        }
        if (settings.payment_enable_conbini) {
            allowedMethods.push({ id: 'conbini', label: 'Convenience Store' })
        }
    } else {
        // Fallback default
        allowedMethods.push(
            { id: 'card', label: 'Credit Card' },
            { id: 'paypal', label: 'PayPal' },
            { id: 'kakebarai', label: 'NP Kakebarai' },
            { id: 'bank', label: 'Bank Transfer' },
            { id: 'apple', label: 'Apple Pay' },
            { id: 'googlepay', label: 'Google Pay' }
        )
    }

    return (
        <>
            <section className="w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12 mt-14 min-h-[calc(100vh-360px)] flex flex-col">
                <div className="py-6 max-w-4xl mx-auto w-full">
                    <div className="border-[#D3C4C4] border rounded-xl p-8 space-y-6">
                        <h2 className="text-xl font-semibold text-[#8B4513]">Payment Method</h2>

                        {/* PAYMENT METHODS */}
                        <div className="flex flex-wrap items-center gap-4">
                            {allowedMethods.map((method) => (
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

                        {/* OTHER PAYMENT NOTICES & BANK DETAILS */}
                        {paymentMethod === 'bank' && (
                            <div className="bg-amber-50/60 border border-amber-200 text-amber-900 rounded-xl p-6 space-y-4 animate-fadeIn">
                                <h3 className="font-semibold text-base text-[#8B4513]">Bank Transfer Information</h3>
                                <p className="text-sm text-gray-700">
                                    Please transfer the total amount to the following bank account. Your order will be processed once payment is confirmed.
                                </p>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm bg-white/80 p-4 rounded-lg border border-amber-100">
                                    <span className="text-gray-500 font-semibold">Bank Name:</span>
                                    <span className="text-gray-900 font-semibold">{settings?.bank_name || 'Sample Bank'}</span>
                                    
                                    <span className="text-gray-500 font-semibold">Branch:</span>
                                    <span className="text-gray-900 font-semibold">{settings?.bank_branch || 'Main Branch'}</span>
                                    
                                    <span className="text-gray-500 font-semibold">Account Number:</span>
                                    <span className="text-gray-900 font-semibold">{settings?.bank_account_number || '123-456-789'}</span>
                                    
                                    <span className="text-gray-500 font-semibold">Account Holder:</span>
                                    <span className="text-gray-900 font-semibold">{settings?.bank_account_holder || 'Kireiz Space'}</span>
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'kakebarai' && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-md p-4 text-sm font-medium animate-fadeIn">
                                NP Kakebarai invoice payment instructions will be sent upon order confirmation.
                            </div>
                        )}

                        {paymentMethod === 'apple' && (
                            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-4 text-sm font-medium animate-fadeIn">
                                Apple Pay is currently supported on compatible Safari browser devices.
                            </div>
                        )}

                        {paymentMethod === 'conbini' && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-md p-4 text-sm font-medium animate-fadeIn">
                                Convenience Store payment instructions and confirmation barcode will be sent to your registered email.
                            </div>
                        )}

                        {paymentMethod === 'googlepay' && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-md p-4 text-sm font-medium animate-fadeIn">
                                Pay quickly and securely using Google Pay.
                            </div>
                        )}

                        {/* ERROR MESSAGE */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* ACTION BUTTONS */}
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

                        {paymentMethod !== 'card' && paymentMethod !== 'paypal' && (
                            <div className="flex justify-end pt-6">
                                <button
                                    disabled={loading}
                                    onClick={handlePayment}
                                    className="px-10 py-3 bg-[#8B4513] hover:bg-[#71370F] text-white rounded-md transition font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Confirm Order'}
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
