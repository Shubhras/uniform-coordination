'use client'
import ResetPassword from '@/components/auth/ResetPassword'
import { apiResetPassword } from '@/services/AuthService'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

/**
 * ResetPasswordClient Component.
 * Reads user_id from query parameters and calls API to update the user's password.
 *
 * @returns {JSX.Element} Rendered ResetPassword component with submit handler.
 */
const ResetPasswordClient = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const userId = searchParams.get('user_id')

    /**
     * Handles password reset form submission.
     *
     * @param {Object} payload - Form helper functions and values.
     * @param {Object} payload.values - Form payload containing new password.
     * @param {Function} payload.setSubmitting - State updater for form submission state.
     * @param {Function} payload.setMessage - State updater for displaying error messages.
     * @param {Function} [payload.setResetComplete] - State updater flag for completion status.
     */
    const handleResetPassword = async (payload) => {
        const { values, setSubmitting, setMessage, setResetComplete } = payload
        try {
            setSubmitting(true)
            if (!userId) {
                setMessage('Invalid or expired reset link. Please request a new one.')
                return
            }
            await apiResetPassword({
                ...values,
                userId,
            })
            toast.push(
                <Notification title="Password reset successful!" type="success">
                    You can now login with your new password
                </Notification>
            )
            setResetComplete?.(true)
            router.push('/sign-in')

        } catch (error) {
            setMessage(
                error?.response?.data?.message ||
                error?.message ||
                'Something went wrong. Please try again.'
            )
        } finally {
            setSubmitting(false)
        }
    }

    return <ResetPassword onResetPasswordSubmit={handleResetPassword} />
}

export default ResetPasswordClient
