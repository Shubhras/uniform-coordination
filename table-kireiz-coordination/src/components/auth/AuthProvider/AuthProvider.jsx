'use client'
import { useEffect } from 'react'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import SessionContext from './SessionContext'
import { setTokens, clearTokens } from '@/services/axios/tokenManager'

const AuthProvider = (props) => {
    const { session, children } = props

    useEffect(() => {
        if (session?.accessToken || session?.user?.accessToken) {
            setTokens({
                accessToken: session?.accessToken || session?.user?.accessToken,
                refreshToken: session?.refreshToken || session?.user?.refreshToken,
            })
        } else if (!session) {
            clearTokens()
        }
    }, [session])

    return (
        /** since the next auth useSession hook was triggering mutliple re-renders, hence we are using the our custom session provider and we still included the next auth session provider, incase we need to use any client hooks from next auth */
        <NextAuthSessionProvider session={session} refetchOnWindowFocus={false}>
            <SessionContext.Provider value={session}>
                {children}
            </SessionContext.Provider>
        </NextAuthSessionProvider>
    )
}

export default AuthProvider

