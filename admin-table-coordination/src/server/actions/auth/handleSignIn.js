'use server'
import { auth, signIn } from '@/auth'
import appConfig from '@/configs/app.config'
import { AuthError } from 'next-auth'

export const onSignInWithCredentials = async (
    { email, password },
    callbackUrl,
) => {
    try {
        const redirectUrl = await signIn('credentials', {
            email,
            password,
            redirect: false,
            redirectTo: callbackUrl || appConfig.authenticatedEntryPath,
        })

        let target = redirectUrl || callbackUrl || appConfig.authenticatedEntryPath
        try {
            const session = await auth()
            if (session?.user?.entryPath) {
                target = callbackUrl || session.user.entryPath
            }
        } catch {
            // fallback to default
        }

        return {
            success: true,
            redirectUrl: target,
        }
    } catch (error) {
        if (error instanceof AuthError) {
            /** Customize error message based on AuthError */
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: 'Invalid credentials!' }
                default:
                    return { error: 'Something went wrong!' }
            }
        }
        if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
            return {
                success: true,
                redirectUrl: callbackUrl || appConfig.authenticatedEntryPath,
            }
        }
        throw error
    }
}
