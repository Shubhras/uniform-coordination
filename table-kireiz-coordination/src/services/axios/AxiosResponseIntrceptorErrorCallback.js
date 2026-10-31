import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'
import appConfig from '@/configs/app.config'
import { getRefreshToken, setTokens, clearTokens } from './tokenManager'

let isRefreshing = false
let failedQueue = []

/**
 * Resolves or rejects queued requests waiting for a refreshed token.
 *
 * @param {Error|null} error
 * @param {string|null} token
 */
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
 * Response Interceptor Error Callback.
 * Intercepts HTTP 401 errors, calls the token refresh endpoint, retries failed requests,
 * and redirects to the sign-in page if both tokens are expired.
 *
 * @param {Object} error - Axios error object.
 * @param {Function} axiosInstance - Axios instance to retry failed requests.
 * @returns {Promise<any>}
 */
const AxiosResponseIntrceptorErrorCallback = async (error, axiosInstance) => {
    const originalRequest = error?.config

    // If there is no response or error is not 401, reject immediately
    if (error?.response?.status !== 401 || !originalRequest) {
        return Promise.reject(error)
    }

    // If the 401 error is from the refresh token API itself, both tokens are expired/invalid
    if (originalRequest?.url?.includes('/token/refresh/')) {
        clearTokens()
        if (typeof window !== 'undefined') {
            try {
                await signOut({ redirect: false })
            } catch (err) {
                console.error('Error during signOut:', err)
            }
            window.location.href = appConfig.unAuthenticatedEntryPath || '/sign-in'
        }
        return Promise.reject(error)
    }

    // Prevent infinite loop if already retried
    if (originalRequest._retry) {
        return Promise.reject(error)
    }

    // If a token refresh is already in progress, queue this request
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
        })
            .then((newToken) => {
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`
                return axiosInstance(originalRequest)
            })
            .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    // Retrieve the refresh token from tokenManager or session
    let refreshToken = getRefreshToken()
    if (!refreshToken && typeof window !== 'undefined') {
        try {
            const session = await getSession()
            refreshToken = session?.refreshToken || session?.user?.refreshToken
        } catch (err) {
            console.error('Failed to retrieve refresh token from session:', err)
        }
    }

    // If no refresh token exists, both tokens are expired/missing -> redirect to sign-in
    if (!refreshToken) {
        processQueue(new Error('No refresh token available'), null)
        clearTokens()
        if (typeof window !== 'undefined') {
            try {
                await signOut({ redirect: false })
            } catch (err) {
                console.error('Error during signOut:', err)
            }
            window.location.href = appConfig.unAuthenticatedEntryPath || '/sign-in'
        }
        return Promise.reject(error)
    }

    try {
        const refreshUrl = `${appConfig.apiPrefix}/v1/space/userhub/token/refresh/`

        const response = await axios.post(
            refreshUrl,
            {
                refresh: refreshToken,
                refreshToken: refreshToken,
            },
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        )

        const responseData = response?.data?.data || response?.data
        const newAccessToken =
            responseData?.accessToken ||
            responseData?.access ||
            responseData?.token
        const newRefreshToken =
            responseData?.refreshToken ||
            responseData?.refresh ||
            refreshToken

        if (!newAccessToken) {
            throw new Error('New access token not found in refresh response')
        }

        // Store refreshed tokens
        setTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        })

        // Resolve queued requests with the new token
        processQueue(null, newAccessToken)

        // Retry the original failed request with the new access token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        return axiosInstance(originalRequest)
    } catch (refreshError) {
        // Both tokens expired or refresh token invalid -> clear session and navigate to login
        processQueue(refreshError, null)
        clearTokens()

        if (typeof window !== 'undefined') {
            try {
                await signOut({ redirect: false })
            } catch (err) {
                console.error('Error during signOut:', err)
            }
            window.location.href = appConfig.unAuthenticatedEntryPath || '/sign-in'
        }

        return Promise.reject(refreshError)
    } finally {
        isRefreshing = false
    }
}

export default AxiosResponseIntrceptorErrorCallback
