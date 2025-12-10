'use client'
import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import SignUpForm from './SignUpForm'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import useTheme from '@/utils/hooks/useTheme'
import OauthSignIn from '../SignIn/OauthSignIn'

export const SignUp = ({ onSignUp, signInUrl = '/sign-in', onSignIn,
    onOauthSignIn, }) => {
    const [message, setMessage] = useTimeOutMessage()

    const mode = useTheme((state) => state.mode)

    return (
        <>
            {/* <div className="mb-8">
                <Logo
                    type="streamline"
                    mode={mode}
                    logoWidth={60}
                    logoHeight={60}
                />
            </div> */}

            <div className="mb-6">
                <h2 className="font-[Plus Jakarta Sans] font-medium text-[28px] tracking-[0.18px] text-[#003560] mb-2">
                    Sign Up
                </h2>
                <p className="font-[Plus Jakarta Sans] font-medium text-sm  tracking-[0.15px] text-[#4C4E64AD]">
                    And lets get started with your free trial
                </p>
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <SignUpForm onSignUp={onSignUp} setMessage={setMessage} />

            <div className="mt-6 text-center  text-base">
                <span>Already have an account? </span>
                <ActionLink
                    href={signInUrl}
                    className="heading-text  text-blue-400"
                    themeColor={false}
                >
                    Sign in Instead
                </ActionLink>
            </div>
            <div className="mt-6">
                <div className="flex items-center gap-5 mb-6">
                    <div className="border-t border-gray-200 dark:border-gray-800 flex-1 " />
                    <p className="text-base">
                        or
                    </p>
                    <div className="border-t border-gray-200 dark:border-gray-800 flex-1 " />
                </div>
                <OauthSignIn
                    setMessage={setMessage}
                    onOauthSignIn={onOauthSignIn}
                />
            </div>
        </>
    )
}

export default SignUp
