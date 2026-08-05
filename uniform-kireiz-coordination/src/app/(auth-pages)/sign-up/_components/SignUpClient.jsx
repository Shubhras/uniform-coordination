'use client'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import SignUp from '@/components/auth/SignUp'
import { apiSignUp } from '@/services/AuthService'
import { useRouter } from 'next/navigation'

/**
 * SignUpClient Component.
 * Handles new account registration and redirects user to email verification page.
 *
 * @returns {JSX.Element} Rendered SignUp component with form submit handler.
 */
const SignUpClient = () => {
    const router = useRouter()

    /**
     * Handles account registration form submission.
     *
     * @param {Object} params - Form submission params and functions.
     * @param {Object} params.values - Registration values (name, email, password).
     * @param {Function} params.setSubmitting - Function to toggle loader state.
     * @param {Function} params.setMessage - Function to display error message.
     */
    const handlSignUp = async ({ values, setSubmitting, setMessage }) => {
        try {
            setSubmitting(true)
            const response = await apiSignUp(values)

            // Extract user ID from response payload
            const userId = response?.data?.user_id || response?.data?.data?.user_id || response?.data?.data?.id || 1;
            const userEmail = values?.email || "test@gmail.com";

            // Redirect to email verification page
            router.push(`/email-verification-page?user_id=${userId}&email=${encodeURIComponent(userEmail)}`);
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Signup failed'

            setMessage(errorMessage)
        } finally {
            setSubmitting(false)
        }
    }

    return <SignUp onSignUp={handlSignUp} />
}

export default SignUpClient
