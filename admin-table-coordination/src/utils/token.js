import { getSession } from 'next-auth/react'

const ACCESS_TOKEN_KEY = 'admin_access_token'
const REFRESH_TOKEN_KEY = 'admin_refresh_token'

let memoryAccessToken = ''
let memoryRefreshToken = ''

export const tokenStorage = {
    getAccessToken() {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(ACCESS_TOKEN_KEY)
            if (stored) return stored
        }
        return memoryAccessToken || ''
    },

    getRefreshToken() {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(REFRESH_TOKEN_KEY)
            if (stored) return stored
        }
        return memoryRefreshToken || ''
    },

    setTokens({ accessToken, refreshToken }) {
        if (accessToken) {
            memoryAccessToken = accessToken
            if (typeof window !== 'undefined') {
                localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
            }
        }
        if (refreshToken) {
            memoryRefreshToken = refreshToken
            if (typeof window !== 'undefined') {
                localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
            }
        }
    },

    clearTokens() {
        memoryAccessToken = ''
        memoryRefreshToken = ''
        if (typeof window !== 'undefined') {
            localStorage.removeItem(ACCESS_TOKEN_KEY)
            localStorage.removeItem(REFRESH_TOKEN_KEY)
        }
    },
}

export async function getStoredRefreshToken() {
    let token = tokenStorage.getRefreshToken()
    if (!token && typeof window !== 'undefined') {
        try {
            const session = await getSession()
            if (session?.user?.refreshToken) {
                token = session.user.refreshToken
                tokenStorage.setTokens({
                    accessToken: session.user.accessToken,
                    refreshToken: session.user.refreshToken,
                })
            }
        } catch (error) {
            console.error('Failed to get session for refresh token:', error)
        }
    }
    return token
}

export default tokenStorage
