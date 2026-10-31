'use client'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { getSession, signOut } from 'next-auth/react'

const ACCESS_TOKEN_KEY = 'uniform_access_token'
const REFRESH_TOKEN_KEY = 'uniform_refresh_token'

// In-memory cache for fast synchronous access
let memoryTokens = {
    accessToken: null,
    refreshToken: null,
}

/**
 * Gets a cookie value by name from document.cookie
 */
function getCookie(name) {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'))
    return match ? decodeURIComponent(match[3]) : null
}

/**
 * Sets a cookie in document.cookie
 */
function setCookie(name, value, days = 7) {
    if (typeof document === 'undefined') return
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`
}

/**
 * Removes a cookie from document.cookie
 */
function deleteCookie(name) {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
}

/**
 * Stores tokens into in-memory cache, localStorage, and client cookies.
 */
export function setStoredTokens({ accessToken, refreshToken }) {
    if (accessToken) {
        memoryTokens.accessToken = accessToken
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
            }
            setCookie(ACCESS_TOKEN_KEY, accessToken)
        } catch (e) {
            // Ignore storage access errors
        }
    }

    if (refreshToken) {
        memoryTokens.refreshToken = refreshToken
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
            }
            setCookie(REFRESH_TOKEN_KEY, refreshToken)
        } catch (e) {
            // Ignore storage access errors
        }
    }
}

/**
 * Gets the current access token.
 */
export function getStoredAccessToken() {
    if (memoryTokens.accessToken) return memoryTokens.accessToken

    if (typeof window !== 'undefined') {
        try {
            const local = window.localStorage ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null
            if (local) {
                memoryTokens.accessToken = local
                return local
            }
        } catch (e) {}

        const cookieVal = getCookie(ACCESS_TOKEN_KEY)
        if (cookieVal) {
            memoryTokens.accessToken = cookieVal
            return cookieVal
        }
    }

    return null
}

/**
 * Gets the current refresh token.
 */
export function getStoredRefreshToken() {
    if (memoryTokens.refreshToken) return memoryTokens.refreshToken

    if (typeof window !== 'undefined') {
        try {
            const local = window.localStorage ? window.localStorage.getItem(REFRESH_TOKEN_KEY) : null
            if (local) {
                memoryTokens.refreshToken = local
                return local
            }
        } catch (e) {}

        const cookieVal = getCookie(REFRESH_TOKEN_KEY)
        if (cookieVal) {
            memoryTokens.refreshToken = cookieVal
            return cookieVal
        }
    }

    return null
}

/**
 * Clears all stored tokens across memory, localStorage, and cookies.
 */
export function clearStoredTokens() {
    memoryTokens = {
        accessToken: null,
        refreshToken: null,
    }

    if (typeof window !== 'undefined') {
        try {
            if (window.localStorage) {
                window.localStorage.removeItem(ACCESS_TOKEN_KEY)
                window.localStorage.removeItem(REFRESH_TOKEN_KEY)
            }
        } catch (e) {}

        deleteCookie(ACCESS_TOKEN_KEY)
        deleteCookie(REFRESH_TOKEN_KEY)
    }
}

/**
 * Handles complete logout and redirection to login page when both tokens expire.
 */
export async function redirectToLogin() {
    clearStoredTokens()

    if (typeof window !== 'undefined') {
        try {
            await signOut({ redirect: false })
        } catch (e) {
            // Ignore signOut errors if any
        }

        const currentPath = window.location.pathname + window.location.search
        const loginUrl = `${appConfig.unAuthenticatedEntryPath || '/sign-in'}?${REDIRECT_URL_KEY}=${encodeURIComponent(currentPath)}`
        window.location.href = loginUrl
    }
}

/**
 * Directly calls the refresh token API endpoint.
 * URL: /api/v1/userhub/token/refresh/
 *
 * @param {string} refreshToken
 * @returns {Promise<{accessToken: string, refreshToken?: string}>}
 */
export async function requestRefreshTokenApi(refreshToken) {
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://172.237.71.124').replace(/\/+$/, '')
    const url = `${apiBase}/api/v1/userhub/token/refresh/`

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            refresh: refreshToken,
            refreshToken: refreshToken,
        }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok || data?.status === false) {
        const error = new Error(data?.message || data?.detail || 'Failed to refresh token')
        error.response = { status: response.status, data }
        throw error
    }

    // Extract access and refresh tokens from various possible response formats
    const newAccessToken =
        data?.data?.accessToken ||
        data?.data?.access ||
        data?.accessToken ||
        data?.access

    const newRefreshToken =
        data?.data?.refreshToken ||
        data?.data?.refresh ||
        data?.refreshToken ||
        data?.refresh ||
        refreshToken

    if (!newAccessToken) {
        throw new Error('No access token returned from refresh API')
    }

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    }
}

// Concurrency control for token refreshing
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

/**
 * Coordinates token refresh, queuing simultaneous requests to prevent race conditions.
 */
export async function handleTokenRefresh() {
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
        })
    }

    isRefreshing = true

    try {
        let refreshToken = getStoredRefreshToken()

        if (!refreshToken) {
            // Attempt to retrieve from NextAuth session
            const session = await getSession().catch(() => null)
            refreshToken = session?.refreshToken || session?.user?.refreshToken
        }

        if (!refreshToken) {
            throw new Error('No refresh token available')
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await requestRefreshTokenApi(refreshToken)

        setStoredTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        })

        // Also update NextAuth session if available
        try {
            const { getCsrfToken } = await import('next-auth/react')
            const csrfToken = await getCsrfToken().catch(() => null)
            if (csrfToken) {
                await fetch('/api/auth/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        csrfToken,
                        data: {
                            accessToken: newAccessToken,
                            refreshToken: newRefreshToken,
                        },
                    }),
                }).catch(() => {})
            }
        } catch (e) {
            // Silent catch
        }

        processQueue(null, newAccessToken)
        return newAccessToken
    } catch (err) {
        processQueue(err, null)
        await redirectToLogin()
        throw err
    } finally {
        isRefreshing = false
    }
}
