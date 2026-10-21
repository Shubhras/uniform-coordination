'use server'
import { signIn } from '@/auth'
import appConfig from '@/configs/app.config'
import { AuthError } from 'next-auth'
import validateCredential from '@/server/actions/user/validateCredential'

export const onSignInWithCredentials = async (
    { email, password },
    callbackUrl,
) => {
    // 1. Validate credentials against backend API first to catch lockout / attempts warning
    const check = await validateCredential({ email, password })
    if (check?.error) {
        return { error: check.error }
    }

    try {
        await signIn('credentials', {
            email,
            password,
            redirectTo: callbackUrl || check?.entryPath || appConfig.authenticatedEntryPath,
        })
    } catch (error) {
        if (error instanceof AuthError) {
            /** Customize error message based on AuthError */
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: check?.error || 'Invalid credentials!' }
                default:
                    return { error: 'Something went wrong!' }
            }
        }
        throw error
    }
}
