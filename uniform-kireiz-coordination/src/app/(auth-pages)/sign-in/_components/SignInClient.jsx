'use client'
import SignIn from '@/components/auth/SignIn'
import { apiLogin } from '@/services/AuthService'
import { onSignInWithCredentials } from '@/server/actions/auth/handleSignIn'
import handleOauthSignIn from '@/server/actions/auth/handleOauthSignIn'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useSearchParams } from 'next/navigation'
import Notification from '@/components/ui/Notification'
import { useRouter } from 'next/navigation'
import toast from '@/components/ui/toast'
const SignInClient = () => {
    const searchParams = useSearchParams()
    // const callbackUrl = searchParams.get(REDIRECT_URL_KEY)
    const router = useRouter()
    const handleSignIn = async ({ values, setSubmitting, setMessage }) => {
        try {
            console.log("SignInClient values:", values);
            setSubmitting(true)
            const response = await apiLogin(values)
            const data = response
            if (!data?.status) {
                setMessage(data?.message || 'Invalid email or password')
                return
            }
            toast.push(
                <Notification title="Login success!" type="success">
                    Login successfully
                </Notification>,
            )
             router.push('/kireiz-form');
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Login failed'

            setMessage(errorMessage)
        } finally {
            setSubmitting(false)
        }
    }

    // const handleSignIn = ({ values, setSubmitting, setMessage }) => {
    //     setSubmitting(true)

    //     onSignInWithCredentials(values, callbackUrl || '').then((data) => {
    //         if (data?.error) {
    //             setMessage(data.error)
    //             setSubmitting(false)
    //         }
    //     })
    // }
    // return <SignIn onSignIn={handleSignIn} />

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
