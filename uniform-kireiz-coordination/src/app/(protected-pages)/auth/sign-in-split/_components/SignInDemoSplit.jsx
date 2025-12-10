import SignIn from '@/components/auth/SignIn'
import Split from '@/components/layouts/AuthLayout/Split'
import SignInLeftPanel from './SignInLeftPanel'

const SignInDemoSplit = () => {
    return (
        <Split image={'/img/others/Illustration.png'}>
            <SignIn
                signUpUrl="/auth/sign-up-split"
                forgetPasswordUrl="/auth/forgot-password-split"
            />
        </Split>

    )
}

export default SignInDemoSplit
