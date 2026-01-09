import { apiLogin } from "@/services/AuthService";
import validateCredential from "../server/actions/user/validateCredential";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

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
        // const user = await validateCredential(credentials)
        const response = await apiLogin(credentials);
        const user = response?.data;

        if (!user) {
          return null;
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
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        ((token.id = user.id),
          (token.name = user.userName),
          (token.email = user.email),
          (token.image = user.avatar || null),
          (token.roleName = user.roleName),
          (token.userType = user.userType),
          (token.accessToken = user.accessToken),
          (token.firstName = user.firstName),
          (token.lastName = user.lastName),
          (token.language = user.language),
          (token.profileImage = user.profileImage || null),
          (token.isActive = user.isActive),
          (token.loginType = user.loginType));
      }
      return token;
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
      };

      // Token for APIs
      session.accessToken = token.accessToken;

      return session;
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
};

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
