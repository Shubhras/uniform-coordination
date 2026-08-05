'use client'
import { apiForgotPassword } from '@/services/AuthService'
import ForgotPassword from '@/components/auth/ForgotPassword'
import { toast } from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useRouter } from 'next/navigation'

/**
 * ForgotPasswordClient Component.
 * Handles user email submission for password recovery.
 *
 * @returns {JSX.Element} Rendered ForgotPassword component with submit handler.
 */
const ForgotPasswordClient = () => {
    const router = useRouter()

    /**
     * Submits user email to backend API for password reset link generation.
     *
     * @param {Object} params - Form submission helper parameters.
     * @param {Object} params.values - Form values containing user email.
     * @param {Function} params.setSubmitting - State updater for form submission state.
     * @param {Function} params.setMessage - State updater for displaying error/status message.
     * @param {Function} params.setEmailSent - State updater flag for sent status.
     */
    const handleForgotPasswordSubmit = async ({
        values,
        setSubmitting,
        setMessage,
        setEmailSent,
    }) => {
        try {
            setSubmitting(true)

            // Trigger password reset request API call
            const response = await apiForgotPassword(values)
            if (response?.status === true) {

                // Push success notification toast
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

                // Redirect user based on resetLink URL/path returned by backend
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
