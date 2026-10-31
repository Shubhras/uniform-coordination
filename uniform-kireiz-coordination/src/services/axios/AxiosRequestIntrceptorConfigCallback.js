import { getStoredAccessToken } from '../tokenStorage'

/**
 * Public authentication endpoints that should NOT have Bearer token injected or overwritten.
 */
const PUBLIC_AUTH_ENDPOINTS = [
    '/v1/userhub/login/',
    '/v1/userhub/signup/',
    '/v1/userhub/forgot-password/',
    '/v1/userhub/reset-password/',
    '/v1/userhub/verify-user/',
    '/v1/userhub/token/refresh/',
]

/**
 * Callback function to mutate or inject custom config/headers before request is sent to the server.
 * Ensures the latest active access token is attached to protected requests.
 *
 * @param {import('axios').InternalAxiosRequestConfig} config - The Axios request configuration object.
 * @returns {import('axios').InternalAxiosRequestConfig} Modified request configuration.
 */
const AxiosRequestIntrceptorConfigCallback = (config) => {
    const url = config.url || ''
    const isPublicAuthEndpoint = PUBLIC_AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint))

    if (!isPublicAuthEndpoint) {
        const latestToken = getStoredAccessToken()
        if (latestToken) {
            config.headers = config.headers || {}

            // Attach or keep the authorization header up-to-date with latest token
            if (typeof config.headers.set === 'function') {
                config.headers.set('Authorization', `Bearer ${latestToken}`)
            } else {
                config.headers['Authorization'] = `Bearer ${latestToken}`
            }
        }
    }

    return config
}

export default AxiosRequestIntrceptorConfigCallback
