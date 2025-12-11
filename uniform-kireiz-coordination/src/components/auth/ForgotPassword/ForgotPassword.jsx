'use client'
import { useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import ActionLink from '@/components/shared/ActionLink'
import ForgotPasswordForm from './ForgotPasswordForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useRouter } from 'next/navigation'
import { FiChevronLeft } from 'react-icons/fi'

export const ForgotPassword = ({
    signInUrl = '/sign-in',
    onForgotPasswordSubmit,
}) => {
    const [emailSent, setEmailSent] = useState(false)
    const [message, setMessage] = useTimeOutMessage()

    const router = useRouter()

    const handleContinue = () => {
        router.push(signInUrl)
    }

    return (
        <div>
            <div className="mb-6">
                {emailSent ? (
                    <>
                        <h2 className="font-[Plus Jakarta Sans] font-medium text-[28px] tracking-[0.18px] text-[#003560] mb-2">
                            Check your email
                        </h2>
                        <p className="font-[Plus Jakarta Sans] font-medium text-sm  tracking-[0.15px] text-[#4C4E64AD]">
                            We have sent a password recovery to your email
                        </p>

                    </>
                ) : (
                    <>
                        <h2 className="font-[Plus Jakarta Sans] font-medium text-[28px] tracking-[0.18px] text-[#003560] mb-2">
                            Forgot Password
                        </h2>
                        <p className="font-[Plus Jakarta Sans] font-medium text-sm  tracking-[0.15px] text-[#4C4E64AD]">
                            Please enter your email to receive a verification code
                        </p>

                    </>
                )}
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <ForgotPasswordForm
                emailSent={emailSent}
                setMessage={setMessage}
                setEmailSent={setEmailSent}
                onForgotPasswordSubmit={onForgotPasswordSubmit}
            >
                <Button
                    block
                    variant="solid"
                    type="button"
                    onClick={handleContinue}
                >
                    Continue
                </Button>
            </ForgotPasswordForm>
            <div className="mt-4 text-center text-base">
                <ActionLink
                    href={signInUrl}
                    className="heading-text text-blue-400"
                    themeColor={false}
                >
                    <span className='flex justify-center items-center'>
                        <FiChevronLeft size={27}/>
                        Back to Login
                    </span>
                </ActionLink>
            </div>
        </div>
    )
}

export default ForgotPassword
