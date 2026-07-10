'use client'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import SignUp from '@/components/auth/SignUp'
import { apiSignUp } from '@/services/AuthService'
import { useRouter } from 'next/navigation'

const SignUpClient = () => {
    const router = useRouter()

    const handlSignUp = async ({ values, setSubmitting, setMessage }) => {
        try {
            setSubmitting(true)
            const response = await apiSignUp(values)
            toast.push(
                <Notification title="Account created!" type="success">
                    {response?.data?.message || response?.message || "User created successfully."}
                </Notification>,
            )
            router.push('/sign-in')
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
