'use client'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import SignUp from '@/components/auth/SignUp'
import { apiSignUp } from '@/services/AuthService'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
// import EmailVerificationPopup from '@/app/(public-pages)/email-verification-page/EmailVerificationPage'

const SignUpClient = () => {
    const router = useRouter()
    const [showEmailPopup, setShowEmailPopup] = useState(false)
    // const [email, setEmail] = useState("");
    const handlSignUp = async ({ values, setSubmitting, setMessage }) => {
        try {
            setSubmitting(true)
            const response = await apiSignUp(values)
            console.log(response)
            if (response?.status === true) {

                toast.push(
                    <Notification title="Account created!" type="success">
                        You can now sign in from our sign in page
                    </Notification>,
                )
                setShowEmailPopup(true)
                // setEmail(response?.data?.email)
                // router.push('/sign-in')
            }
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

    return (

        <>
            <SignUp onSignUp={handlSignUp} />

            {/* <EmailVerificationPopup
                email={email}
                isOpen={showEmailPopup}
                onClose={() => setShowEmailPopup(false)}
            /> */}
        </>
    )
}

export default SignUpClient
