'use client'
import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import SignInForm from './SignInForm'
import OauthSignIn from './OauthSignIn'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import useTheme from '@/utils/hooks/useTheme'

const SignIn = ({
    signUpUrl = '/sign-up',
    forgetPasswordUrl = '/forgot-password',
    onSignIn,
    onOauthSignIn,
}) => {
    const [message, setMessage] = useTimeOutMessage()

    const mode = useTheme((state) => state.mode)

    return (
        <>
            <div className="mb-6">
                <h2 className="font-[Plus Jakarta Sans] font-semibold text-[24px] leading-[32px] tracking-[0.18px] text-[#003560] mb-0">
                    Welcome to KIREIZ!
                </h2>
                <p className="font-[Plus Jakarta Sans] font-normal text-[14px] leading-[20px] tracking-[0.15px] text-[#4C4E64AD]">
                    Professional Uniforms & Event Styling
                </p>
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <SignInForm
                setMessage={setMessage}
                passwordHint={
                    <div className="mb-7 mt-2">
                        <ActionLink
                            href={forgetPasswordUrl}
                            className="font-semibold heading-text mt-2 underline"
                            themeColor={false}
                        >
                            Forgot password
                        </ActionLink>
                    </div>
                }
                onSignIn={onSignIn}
            />
          
            <div>
                <div className="mt-6 text-center">
                    <span>{`New on our platform?`} </span>
                    <ActionLink
                        href={signUpUrl}
                        className="heading-text font-bold"
                        themeColor={false}
                    >
                        Create an account
                    </ActionLink>
                </div>
            </div>
            <div className="mt-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="border-t border-gray-200 dark:border-gray-800 flex-1 mt-[1px]" />
                    <p className="font-semibold heading-text">
                        or 
                    </p>
                    <div className="border-t border-gray-200 dark:border-gray-800 flex-1 mt-[1px]" />
                </div>
                <OauthSignIn
                    setMessage={setMessage}
                    onOauthSignIn={onOauthSignIn}
                />
            </div>
        </>
    )
}

export default SignIn
