'use client'
import { apiForgotPassword } from '@/services/AuthService'
import ForgotPassword from '@/components/auth/ForgotPassword'
import { toast } from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

/**
 * ForgotPasswordClient Component.
 * Handles the logic for requesting a password reset email from the backend API.
 *
 * @returns {JSX.Element} Rendered ForgotPassword UI component with form submission handler.
 */
const ForgotPasswordClient = () => {
    /**
     * Submits the user's email to initiate the password reset process.
     *
     * @param {Object} params - Form submission helper objects and values.
     * @param {Object} params.values - Form input values containing user's email address.
     * @param {Function} params.setSubmitting - State updater for form submission loading status.
     * @param {Function} params.setMessage - State updater for displaying error/status messages.
     * @param {Function} params.setEmailSent - State updater flag indicating reset email sent status.
     */
    const handleForgotPasswordSubmit = async ({
        values,
        setSubmitting,
        setMessage,
        setEmailSent,
    }) => {
        try {
            setSubmitting(true)

            // Trigger password reset API call with email payload
            const response = await apiForgotPassword(values)
            if (response?.status === true) {

                // Show success toast notification to user
                toast.push(
                    <Notification title="Email sent!" type="success">
                        Reset password link sent successfully to the registered email.
                    </Notification>,
                )

                setEmailSent(true)
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                'No account found with this email'
            setMessage(errorMessage)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <ForgotPassword onForgotPasswordSubmit={handleForgotPasswordSubmit} />
    )
}

export default ForgotPasswordClient
