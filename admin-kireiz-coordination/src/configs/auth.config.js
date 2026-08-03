import validateCredential from '../server/actions/user/validateCredential'
import Credentials from 'next-auth/providers/credentials'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    trustHost: true,
    providers: [
        Github({
            clientId: process.env.GITHUB_AUTH_CLIENT_ID,
            clientSecret: process.env.GITHUB_AUTH_CLIENT_SECRET,
        }),
        Google({
            clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
            clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
        }),
        Credentials({
            async authorize(credentials) {
                /** validate credentials from backend API */
                const user = await validateCredential(credentials)
                if (!user) {
                    return null
                }

                return {
                    id: user.id,
                    name: user.userName,
                    email: user.email,
                    image: user.avatar,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    authority: user.authority,
                    permissions: user.permissions, // Added permissions here!
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            /** On initial sign in, store extra data in the JWT */
            if (user) {
                token.accessToken = user.accessToken
                token.refreshToken = user.refreshToken
                token.authority = user.authority
                token.permissions = user.permissions
            }
            return token
        },
        async session(payload) {
            /** apply extra user attributes here */
            return {
                ...payload.session,
                user: {
                    ...payload.session.user,
                    id: payload.token.sub,
                    authority: payload.token.authority || ['admin', 'user'],
                    accessToken: payload.token.accessToken,
                    refreshToken: payload.token.refreshToken, 
                    permissions: payload.token.permissions || [],
                    // permissions: payload.token.permissions || [],
                },
            }
        },
    },
    cookies: {
        sessionToken: {
            name: `admin-kireiz.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? false,
            },
        },
        callbackUrl: {
            name: `admin-kireiz.callback-url`,
            options: {
                sameSite: 'lax',
                path: '/',
                secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? false,
            },
        },
        csrfToken: {
            name: `admin-kireiz.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? false,
            },
        },
    },
}
