'use client'
import SignUp from '@/components/auth/SignUp'
import { apiSignUp } from '@/services/AuthService'
import { useRouter } from 'next/navigation'

/**
 * SignUpClient Component.
 * Handles user sign-up registration API call and redirects to email verification.
 *
 * @returns {JSX.Element} Rendered SignUp component.
 */
const SignUpClient = () => {
    const router = useRouter()

    /**
     * Submits user registration payload to API.
     *
     * @param {Object} params - Form submission parameters.
     * @param {Object} params.values - Registration form values.
     * @param {Function} params.setSubmitting - State updater function for submitting state.
     * @param {Function} params.setMessage - State updater function for displaying error message.
     */
    const handlSignUp = async ({ values, setSubmitting, setMessage }) => {
        try {
            setSubmitting(true)
            const response = await apiSignUp(values)
            const userId = response?.data?.user_id || response?.data?.data?.user_id || response?.data?.data?.id || 1;
            const userEmail = values?.email || "test@gmail.com";
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
