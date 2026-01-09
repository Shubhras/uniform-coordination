import validateCredential from '../server/actions/user/validateCredential'
import Credentials from 'next-auth/providers/credentials'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

// eslint-disable-next-line import/no-anonymous-default-export
export default {
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
                const user = await validateCredential(credentials)
                if (!user) {
                    return null
                }

                return {
                    id: user.id,
                    name: user.userName,
                    email: user.email,
                    image: user.avatar,   
                }
            },
        }),
    ],
    callbacks: {
        async session(payload) {
            /** apply extra user attributes here, for example, we add 'authority' & 'id' in this section */  
            return {
                ...payload.session,
                user: {
                    ...payload.session.user,
                    id: payload.token.sub,
                    authority: ['admin', 'user'],
                },
            }
        },
    },
}


// import validateCredential from '../server/actions/user/validateCredential'
// import Credentials from 'next-auth/providers/credentials'
// import Github from 'next-auth/providers/github'
// import Google from 'next-auth/providers/google'

// export default {
//     providers: [
//         Github({
//             clientId: process.env.GITHUB_AUTH_CLIENT_ID,
//             clientSecret: process.env.GITHUB_AUTH_CLIENT_SECRET,
//         }),
//         Google({
//             clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
//         }),
//         Credentials({
//             async authorize(credentials) {
//                 const user = await validateCredential(credentials)

//                 if (!user || !user.id) {
//                     return null
//                 }

//                 return {
//                     id: String(user.id), // 🔴 ENSURE STRING
//                     name: user.userName,
//                     email: user.email,
//                     image: user.avatar,
//                 }
//             },
//         }),
//     ],

//     // 🔴 REQUIRED FOR MIDDLEWARE
//     session: {
//         strategy: 'jwt',
//     },

//     // 🔴 REQUIRED FOR TOKEN DECRYPTION
//     secret: process.env.NEXTAUTH_SECRET,

//     callbacks: {
//         async session({ session, token }) {
//             return {
//                 ...session,
//                 user: {
//                     ...session.user,
//                     id: token.sub,
//                     authority: ['admin', 'user'],
//                 },
//             }
//         },
//     },
// }

