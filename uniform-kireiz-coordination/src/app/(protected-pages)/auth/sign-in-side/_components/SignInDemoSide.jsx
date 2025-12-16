import SignIn from '@/components/auth/SignIn'
import Side from '@/components/layouts/AuthLayout/Side'
import Split from '@/components/layouts/AuthLayout/Split'

const SignInDemoSplit = () => {
    return (
        <Split>
            <SignIn
                signUpUrl="/auth/sign-up-side"
                forgetPasswordUrl="/auth/forgot-password-side"
            />
        </Split>
    )
}

export default SignInDemoSplit
