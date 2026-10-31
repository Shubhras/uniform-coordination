/**
 * Token manager to handle in-memory and local storage tokens for API synchronization.
 */

const ACCESS_TOKEN_KEY = 'app_access_token'
const REFRESH_TOKEN_KEY = 'app_refresh_token'

let inMemoryAccessToken = null
let inMemoryRefreshToken = null

/**
 * Stores active access and refresh tokens.
 *
 * @param {Object} tokens
 * @param {string} [tokens.accessToken]
 * @param {string} [tokens.refreshToken]
 */
export const setTokens = ({ accessToken, refreshToken }) => {
    if (accessToken) {
        inMemoryAccessToken = accessToken
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
            } catch (e) {
                console.error('Error saving access token to localStorage', e)
            }
        }
    }

    if (refreshToken) {
        inMemoryRefreshToken = refreshToken
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
            } catch (e) {
                console.error('Error saving refresh token to localStorage', e)
            }
        }
    }
}

/**
 * Retrieves the current access token.
 *
 * @returns {string|null}
 */
export const getAccessToken = () => {
    if (inMemoryAccessToken) {
        return inMemoryAccessToken
    }
    if (typeof window !== 'undefined') {
        try {
            const token = localStorage.getItem(ACCESS_TOKEN_KEY)
            if (token) {
                inMemoryAccessToken = token
                return token
            }
        } catch (e) {
            console.error('Error reading access token from localStorage', e)
        }
    }
    return null
}

/**
 * Retrieves the current refresh token.
 *
 * @returns {string|null}
 */
export const getRefreshToken = () => {
    if (inMemoryRefreshToken) {
        return inMemoryRefreshToken
    }
    if (typeof window !== 'undefined') {
        try {
            const token = localStorage.getItem(REFRESH_TOKEN_KEY)
            if (token) {
                inMemoryRefreshToken = token
                return token
            }
        } catch (e) {
            console.error('Error reading refresh token from localStorage', e)
        }
    }
    return null
}

/**
 * Clears all tokens from memory and storage on logout.
 */
export const clearTokens = () => {
    inMemoryAccessToken = null
    inMemoryRefreshToken = null
    if (typeof window !== 'undefined') {
        try {
            localStorage.removeItem(ACCESS_TOKEN_KEY)
            localStorage.removeItem(REFRESH_TOKEN_KEY)
        } catch (e) {
            console.error('Error clearing tokens from localStorage', e)
        }
    }
}
