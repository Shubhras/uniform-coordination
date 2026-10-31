import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

async function loginUser(credentials) {
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8006').replace(/\/+$/, '')
  const url = `${apiBase}/api/v1/space/userhub/login/`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...credentials,
      userType: 'table',
    }),
  })
  return res.json()
}

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
        /** validate credentials from backend here using edge-safe fetch */
        const response = await loginUser(credentials);
        if (!response?.status) {
          throw new Error(response?.message || 'Invalid email or password');
        }
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
          accessToken: user.accessToken || user.access,
          refreshToken: user.refreshToken || user.refresh || null,
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name || user.userName;
        token.userName = user.name || user.userName;
        token.email = user.email;
        token.image = user.avatar || user.image || null;
        token.roleName = user.roleName;
        token.userType = user.userType;
        token.accessToken = user.accessToken || user.access;
        token.refreshToken = user.refreshToken || user.refresh || null;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.language = user.language;
        token.profileImage = user.profileImage || null;
        token.isActive = user.isActive;
        token.loginType = user.loginType;
      }
      if (trigger === 'update' && session) {
        if (session.accessToken) token.accessToken = session.accessToken;
        if (session.refreshToken) token.refreshToken = session.refreshToken;
      }
      return token;
    },
    // ✅ STEP 2: EXPOSE TOKEN DATA TO SESSION
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        name: token.name || token.userName,
        userName: token.userName || token.name,
        email: token.email,
        image: token.image || token.avatar || null,
        roleName: token.roleName,
        userType: token.userType,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        firstName: token.firstName,
        lastName: token.lastName,
        language: token.language,
        profileImage: token.profileImage || null,
        isActive: token.isActive,
        loginType: token.loginType,
      };

      // Token for APIs
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;

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
  cookies: {
    sessionToken: {
      name: `table-kireiz.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? false,
      },
    },
    callbackUrl: {
      name: `table-kireiz.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? false,
      },
    },
    csrfToken: {
      name: `table-kireiz.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? false,
      },
    },
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
