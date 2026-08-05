'use client'
import { apiForgotPassword } from '@/services/AuthService'
import ForgotPassword from '@/components/auth/ForgotPassword'
import { toast } from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useRouter } from 'next/navigation'

/**
 * ForgotPasswordClient Component.
 * Handles the logic for requesting a password reset email from the backend API.
 *
 * @returns {JSX.Element} Rendered ForgotPassword UI component with form submission handler.
 */
const ForgotPasswordClient = () => {
    const router = useRouter()

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
                        We have sent you an email to reset your password
                    </Notification>,
                )

                setEmailSent(true)
                const resetLink = response?.resetLink;
                console.log(response?.resetLink)

                if (!resetLink) {
                    console.error("Reset link missing");
                    return;
                }

                // Redirect to password reset page based on returned reset link (URL or path)
                if (resetLink.startsWith("http")) {
                    const url = new URL(resetLink);
                    router.push(url.pathname + url.search);
                } else {
                    router.push(resetLink);
                }
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
