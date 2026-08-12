import NextAuth from 'next-auth'

import authConfig from '@/configs/auth.config'
import {
    authRoutes as _authRoutes,
    publicRoutes as _publicRoutes,
} from '@/configs/routes.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import appConfig from '@/configs/app.config'

const { auth } = NextAuth(authConfig)

const publicRoutes = Object.entries(_publicRoutes).map(([key]) => key)
const authRoutes = Object.entries(_authRoutes).map(([key]) => key)

const BASE_PATH = ''

export default auth((req) => {
    const { nextUrl } = req
    const isSignedIn = !!req.auth

    /** nextUrl.pathname includes the basePath; strip it for route matching */
    const rawPathname = nextUrl.pathname.startsWith(BASE_PATH)
        ? nextUrl.pathname.slice(BASE_PATH.length) || '/'
        : nextUrl.pathname

    /** Skip middleware for internal Next.js API auth routes */
    const isApiAuthRoute = rawPathname.startsWith('/api/auth')
    if (isApiAuthRoute) return

    const isPublicRoute = publicRoutes.includes(rawPathname)
    const isAuthRoute = authRoutes.includes(rawPathname)

    if (isAuthRoute) {
        if (isSignedIn) {
            /** Redirect to admin-form if already signed in & trying to access auth route */
            return Response.redirect(
                new URL(BASE_PATH + appConfig.authenticatedEntryPath, nextUrl),
            )
        }
        return
    }

    /** If not signed in and not a public route, redirect to sign-in */
    if (!isSignedIn && !isPublicRoute) {
        let callbackUrl = nextUrl.pathname
        if (nextUrl.search) {
            callbackUrl += nextUrl.search
        }

        return Response.redirect(
            new URL(
                `${BASE_PATH}${appConfig.unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${callbackUrl}`,
                nextUrl,
            ),
        )
    }
})

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api)(.*)'],
}
