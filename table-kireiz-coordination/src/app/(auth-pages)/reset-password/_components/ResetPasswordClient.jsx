'use client'
import { useState, useEffect } from 'react'
import ResetPassword from '@/components/auth/ResetPassword'
import { apiResetPassword } from '@/services/AuthService'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

/**
 * ResetPasswordClient Component.
 * Reads user_id and token from query string and submits password reset request to backend API.
 *
 * @returns {JSX.Element} Rendered ResetPassword UI component.
 */
const ResetPasswordClient = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const userId = searchParams.get('user_id') || searchParams.get('userId')
    const token = searchParams.get('token')
    const [initialMessage, setInitialMessage] = useState('')

    useEffect(() => {
        if (!userId || !token) {
            setInitialMessage('Invalid or expired reset link. Please check your email or request a new reset link.')
        }
    }, [userId, token])

    /**
     * Handles reset password form submission.
     *
     * @param {Object} payload - Form helper payload and values.
     * @param {Object} payload.values - Form values containing new password.
     * @param {Function} payload.setSubmitting - State updater for form submission state.
     * @param {Function} payload.setMessage - State updater for displaying error message.
     * @param {Function} [payload.setResetComplete] - State updater flag for completion status.
     */
    const handleResetPassword = async (payload) => {
        const { values, setSubmitting, setMessage, setResetComplete } = payload
        try {
            setSubmitting(true)
            if (!userId || !token) {
                setMessage('Invalid or expired reset link. Please check your email or request a new reset link.')
                return
            }
            const response = await apiResetPassword({
                ...values,
                userId,
                token,
            })
            if (response?.status === true || response?.statusCode === 200) {
                toast.push(
                    <Notification title="Password reset successful!" type="success">
                        {response?.message || 'You can now login with your new password'}
                    </Notification>
                )
                setResetComplete?.(true)
                setTimeout(() => {
                    router.push('/sign-in')
                }, 1500)
            } else {
                setMessage(response?.message || 'Unable to reset password.')
            }

        } catch (error) {
            setMessage(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                'Something went wrong. Please try again.'
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <ResetPassword
            initialMessage={initialMessage}
            onResetPasswordSubmit={handleResetPassword}
        />
    )
}

export default ResetPasswordClient

