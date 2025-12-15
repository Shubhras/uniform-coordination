'use client'

import SignUp from '@/components/auth/SignUp'
import SplitSignup from '@/components/layouts/AuthLayout/SplitSignup'

const SignUpDemoSplit = () => {
    return (
        <SplitSignup>
            <SignUp signInUrl="/auth/sign-in-split" />
        </SplitSignup>
    )
}

export default SignUpDemoSplit
