'use client'
import Alert from '@/components/ui/Alert'
import SignInForm from './SignInForm'
import OauthSignIn from './OauthSignIn'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import useTheme from '@/utils/hooks/useTheme'
import Split from '@/components/layouts/AuthLayout/Split'

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
            <Split>
                <div className='mx-4'>
                    <div className="mb-6">
                        <h2 className="font-[Plus Jakarta Sans]  font-medium text-[28px] tracking-[0.18px] text-[#1C2C56] mb-2">
                            Welcome to KIREIZ FORM!
                        </h2>
                        <p className="font-[Plus Jakarta Sans] font-medium text-sm  tracking-[0.15px] text-[#4C4E64AD]">
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
                            <>
                                {/* Remember Me */}
                                <div className="mb-6 mt-2 flex justify-between items-center">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className="relative w-5 h-5 shrink-0 flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded bg-white checked:bg-[#003562] checked:border-[#003562] cursor-pointer transition-all m-0"
                                            />
                                            <svg
                                                className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-gray-700">Remember me</span>
                                    </label>

                                    {/* Forgot password */}
                                    <ActionLink
                                        href={forgetPasswordUrl}
                                        className="text-blue-400 heading-text text-sm"
                                        themeColor={false}
                                    >
                                        Forgot Password?
                                    </ActionLink>
                                </div>
                            </>
                        }
                        onSignIn={onSignIn}
                    />

                    {/* <div className="mt-3 text-center text-base">
                        <span>{`New on our platform?`} </span>
                        <ActionLink
                            href={signUpUrl}
                            className="heading-text text-blue-400"
                            themeColor={false}
                        >
                            Create an account
                        </ActionLink>
                    </div> */}
                    
                    {/* <div className="mt-4">
                        <div className="flex items-center gap-5 mb-2">
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
                    </div> */}
                </div>
            </Split>
        </>
    )
}

export default SignIn
