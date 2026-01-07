'use client'
import ResetPassword from '@/components/auth/ResetPassword'
import { apiResetPassword } from '@/services/AuthService'
import { useSearchParams } from 'next/navigation'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
const ResetPasswordClient = () => {
    const searchParams = useSearchParams()

    /** Token or Verification Code ensures the request is tied to the correct user */
    const token = searchParams.get('token')

    const handleResetPassword = async (payload) => {
        const { values, setSubmitting, setMessage, setResetComplete } = payload
        try {
            setSubmitting(true)
            await apiResetPassword({
                ...values,
                userId: 9,
            })
            toast.push(
                <Notification title="Password reset successful!" type="success">
                    You can now login with your new password
                </Notification>
            )
            setResetComplete?.(true)

        } catch (error) {
            setMessage(error)
        } finally {
            setSubmitting(false)
        }
    }

    return <ResetPassword onResetPasswordSubmit={handleResetPassword} />
}

export default ResetPasswordClient
