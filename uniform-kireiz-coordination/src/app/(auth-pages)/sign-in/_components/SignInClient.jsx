'use client'
import SignIn from '@/components/auth/SignIn'
import { apiLogin } from '@/services/AuthService'
import { onSignInWithCredentials } from '@/server/actions/auth/handleSignIn'
import handleOauthSignIn from '@/server/actions/auth/handleOauthSignIn'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useSearchParams, useRouter } from 'next/navigation'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'

/**
 * SignInClient Component.
 * Manages credential-based and OAuth-based user authentication.
 *
 * @returns {JSX.Element} Rendered SignIn component with sign-in and OAuth handlers.
 */
const SignInClient = () => {
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get(REDIRECT_URL_KEY)
    const router = useRouter()

    /**
     * Handles credential-based user sign-in submission.
     *
     * @param {Object} params - Form submission params.
     * @param {Object} params.values - User credentials (email and password).
     * @param {Function} params.setSubmitting - Function to toggle submitting loader state.
     * @param {Function} params.setMessage - Function to set error message.
     */
    const handleSignIn = async ({ values, setSubmitting, setMessage }) => {
        try {
            setSubmitting(true)
            onSignInWithCredentials(values, callbackUrl || '').then((data) => {
                if (data?.error) {
                    setMessage(data.error)
                    setSubmitting(false)
                }
            })
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Login failed'

            setMessage(errorMessage)
            setSubmitting(false)
        }
    }

    /**
     * Handles OAuth provider sign-in submission (Google, GitHub).
     *
     * @param {Object} params - OAuth provider options.
     * @param {string} params.type - OAuth provider type ('google' | 'github').
     */
    const handleOAuthSignIn = async ({ type }) => {
        if (type === 'google') {
            await handleOauthSignIn('google')
        }
        if (type === 'github') {
            await handleOauthSignIn('github')
        }
    }

    return <SignIn onSignIn={handleSignIn} onOauthSignIn={handleOAuthSignIn} />
}

export default SignInClient
