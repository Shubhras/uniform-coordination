'use client'
import SignIn from '@/components/auth/SignIn'
import { onSignInWithCredentials } from '@/server/actions/auth/handleSignIn'
import handleOauthSignIn from '@/server/actions/auth/handleOauthSignIn'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiLogin } from '@/services/AuthService'
import { Notification, toast } from '@/components/ui'

const SignInClient = () => {
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get(REDIRECT_URL_KEY)

    // const handleSignIn = ({ values, setSubmitting, setMessage }) => {
    //     setSubmitting(true)

    //     onSignInWithCredentials(values, callbackUrl || '').then((data) => {
    //         if (data?.error) {
    //             setMessage(data.error)
    //             setSubmitting(false)
    //         }
    //     })
    // }

    const router = useRouter()
    const handleSignIn = async ({ values, setSubmitting, setMessage }) => {
        try {
            // console.log("SignInClient values:", values);
            // setSubmitting(true)
            // const response = await apiLogin(values)
            // const data = response
            // if (!data?.status) {
            //     setMessage(data?.message || 'Invalid email or password')
            //     return
            // }
            // toast.push(
            //     <Notification title="Login success!" type="success">
            //         Login successfully
            //     </Notification>,
            // )
            //  router.push('/table-form');
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
