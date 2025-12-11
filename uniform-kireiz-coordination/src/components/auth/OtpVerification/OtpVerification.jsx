import Alert from '@/components/ui/Alert'
import OtpVerificationForm from './OtpVerificationForm'
import sleep from '@/utils/sleep'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'

export const OtpVerification = () => {
    const [otpVerified, setOtpVerified] = useTimeOutMessage()
    const [otpResend, setOtpResend] = useTimeOutMessage()
    const [message, setMessage] = useTimeOutMessage()

    const handleResendOtp = async () => {
        try {
            /** simulate api call with sleep */
            await sleep(500)
            setOtpResend('We have sent you One Time Password.')
        } catch (errors) {
            setMessage?.(
                typeof errors === 'string' ? errors : 'Some error occured!',
            )
        }
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="font-[Plus Jakarta Sans] font-medium text-[28px] tracking-[0.18px] text-[#003560] mb-2">
                    OTP Verification
                </h2>
                <p className="font-[Plus Jakarta Sans] font-medium text-sm  tracking-[0.15px] text-[#4C4E64AD]">
                    We have sent you One Time Password to your email.
                </p>
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            {otpResend && (
                <Alert showIcon className="mb-4" type="info">
                    <span className="break-all">{otpResend}</span>
                </Alert>
            )}
            {otpVerified && (
                <Alert showIcon className="mb-4" type="success">
                    <span className="break-all">{otpVerified}</span>
                </Alert>
            )}
            <OtpVerificationForm
                setMessage={setMessage}
                setOtpVerified={setOtpVerified}
            />
            <div className="mt-4 text-center text-base">
                <span className="font-semibold">Din&apos;t receive OTP? </span>
                <button
                    className="heading-text underline text-blue-400"
                    onClick={handleResendOtp}
                >
                    Resend OTP
                </button>
            </div>
        </div>
    )
}

export default OtpVerification
