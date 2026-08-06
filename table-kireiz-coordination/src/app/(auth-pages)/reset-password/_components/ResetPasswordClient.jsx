'use client'
import ResetPassword from '@/components/auth/ResetPassword'
import { apiResetPassword } from '@/services/AuthService'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

/**
 * ResetPasswordClient Component.
 * Reads user_id from query string and submits password reset request to backend API.
 *
 * @returns {JSX.Element} Rendered ResetPassword UI component.
 */
const ResetPasswordClient = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const userId = searchParams.get('user_id')

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
        console.log(values)
        try {
            setSubmitting(true)
            if (!userId) {
                setMessage('Invalid or expired reset link. Please request a new one.')
                return
            }
            await apiResetPassword({
                ...values,
                userId
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
