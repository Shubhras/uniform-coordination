/**
 * In-memory token store for keeping the latest access and refresh tokens.
 * This ensures that even if a React component closure holds a stale access token,
 * all outgoing requests, interceptors, and queued retries use the freshest active token.
 */

let activeAccessToken = ''
let activeRefreshToken = ''

export const setActiveAccessToken = (token) => {
    activeAccessToken = token || ''
}

export const getActiveAccessToken = () => {
    return activeAccessToken
}

export const setActiveRefreshToken = (token) => {
    activeRefreshToken = token || ''
}

export const getActiveRefreshToken = () => {
    return activeRefreshToken
}

export const setTokens = ({ accessToken, refreshToken }) => {
    if (accessToken) {
        activeAccessToken = accessToken
    }
    if (refreshToken) {
        activeRefreshToken = refreshToken
    }
}

export const clearActiveTokens = () => {
    activeAccessToken = ''
    activeRefreshToken = ''
}
