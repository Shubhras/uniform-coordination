'use client'
import ResetPassword from '@/components/auth/ResetPassword'
import { apiResetPassword } from '@/services/AuthService'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
const ResetPasswordClient = () => {
    const router = useRouter();
    const searchParams = useSearchParams()

    /** Token or Verification Code ensures the request is tied to the correct user */
    // const token = searchParams.get('token')

    const userId = searchParams.get('user_id')

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
