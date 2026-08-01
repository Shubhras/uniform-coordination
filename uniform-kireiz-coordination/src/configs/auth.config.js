import validateCredential from '../server/actions/user/validateCredential'
import Credentials from 'next-auth/providers/credentials'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import { apiLogin } from '@/services/AuthService'
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
                /** validate credentials from backend here */
                // const user = await validateCredential(credentials)
                const response = await apiLogin(credentials)
                //console.log("response-----------------", response)
                if (!response?.status) {
                    throw new Error(response?.message || 'Invalid email or password')
                }
                const user = response?.data;

                // return;
                // if (!user?.status) {
                //     setMessage(user?.message || 'Invalid email or password')
                //     return
                // }

                if (!user) {
                    return null
                }

                return {
                    id: user.id,
                    name: user.userName,
                    email: user.email,
                    image: user.avatar || null,
                    roleName: user.roleName,
                    userType: user.userType,
                    accessToken: user.accessToken,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    language: user.language,
                    profileImage: user.profileImage || null,
                    isActive: user.isActive,
                    loginType: user.loginType,

                }


                // if (!user) {
                //     return null
                // }

                // return {
                //     id: user.id,
                //     name: user.userName,
                //     email: user.email,
                //     image: user.avatar,
                // }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id,
                    token.name = user.userName,
                    token.email = user.email,
                    token.image = user.avatar || null,
                    token.roleName = user.roleName,
                    token.userType = user.userType,
                    token.accessToken = user.accessToken,
                    token.firstName = user.firstName,
                    token.lastName = user.lastName,
                    token.language = user.language,
                    token.profileImage = user.profileImage || null,
                    token.isActive = user.isActive,
                    token.loginType = user.loginType
            }
            return token
        },
        // ✅ STEP 2: EXPOSE TOKEN DATA TO SESSION
        async session({ session, token }) {
            session.user = {
                id: token.id,
                name: token.userName,
                email: token.email,
                image: token.avatar || null,
                roleName: token.roleName,
                userType: token.userType,
                accessToken: token.accessToken,
                firstName: token.firstName,
                lastName: token.lastName,
                language: token.language,
                profileImage: token.profileImage || null,
                isActive: token.isActive,
                loginType: token.loginType,
            }

            // Token for APIs
            session.accessToken = token.accessToken

            return session
        },
        // async session(payload) {
        //     /** apply extra user attributes here, for example, we add 'authority' & 'id' in this section */
        //     return {
        //         ...payload.session,
        //         user: {
        //             ...payload.session.user,
        //             id: payload.token.sub,
        //             authority: ['admin', 'user'],
        //         },
        //     }
        // },
    },
    cookies: {
        sessionToken: {
            name: `uniform-kireiz.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? false,
            },
        },
        callbackUrl: {
            name: `uniform-kireiz.callback-url`,
            options: {
                sameSite: 'lax',
                path: '/',
                secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? false,
            },
        },
        csrfToken: {
            name: `uniform-kireiz.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? false,
            },
        },
    },
}
