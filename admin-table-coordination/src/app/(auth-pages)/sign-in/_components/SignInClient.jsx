'use client'
import SignIn from '@/components/auth/SignIn'
import { onSignInWithCredentials } from '@/server/actions/auth/handleSignIn'
import handleOauthSignIn from '@/server/actions/auth/handleOauthSignIn'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useSearchParams } from 'next/navigation'

const SignInClient = () => {
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get(REDIRECT_URL_KEY)

    const handleSignIn = async ({ values, setSubmitting, setMessage }) => {
        setSubmitting(true)

        try {
            const data = await onSignInWithCredentials(values, callbackUrl || '')
            if (data?.error) {
                setMessage(data.error)
                setSubmitting(false)
            } else if (data?.success) {
                const target = data?.redirectUrl || callbackUrl || '/admin-form'
                window.location.href = target
            }
        } catch (err) {
            console.error('Sign-in error:', err)
            setMessage('Failed to sign in. Please try again.')
            setSubmitting(false)
        }
    }

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
