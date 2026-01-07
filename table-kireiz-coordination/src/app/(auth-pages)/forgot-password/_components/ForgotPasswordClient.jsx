'use client'
import { apiForgotPassword } from '@/services/AuthService'
import ForgotPassword from '@/components/auth/ForgotPassword'
import { toast } from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useRouter } from 'next/navigation'

const ForgotPasswordClient = () => {
    const router = useRouter()
    const handleForgotPasswordSubmit = async ({
        values,
        setSubmitting,
        setMessage,
        setEmailSent,
    }) => {
        try {
            setSubmitting(true)
            // await apiForgotPassword(values)
            const response = await apiForgotPassword(values)
            const data = response?.data
            toast.push(
                <Notification title="Email sent!" type="success">
                    We have sent you an email to reset your password
                </Notification>,
            )

            setEmailSent(true)
            router.push('/reset-password')
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
