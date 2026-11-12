import NextAuth from 'next-auth'
import appConfig from '@/configs/app.config'
import authConfig from '@/configs/auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
    pages: {
        signIn: appConfig.unAuthenticatedEntryPath || '/sign-in',
        error: appConfig.unAuthenticatedEntryPath || '/sign-in',
    },
    ...authConfig,
})
