import appConfig from '@/configs/app.config'
import { apiRefreshToken } from '../AuthService'
import { tokenStorage, getStoredRefreshToken } from '@/utils/token'
import { signOut as nextAuthSignOut } from 'next-auth/react'

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

const redirectToLogin = async () => {
    tokenStorage.clearTokens()
    if (typeof window !== 'undefined') {
        try {
            await nextAuthSignOut({ redirect: false })
        } catch (e) {
            console.error('SignOut error:', e)
        }
        const loginPath = appConfig.unAuthenticatedEntryPath || '/sign-in'
        if (!window.location.pathname.includes(loginPath)) {
            window.location.href = loginPath
        }
    }
}

const AxiosResponseIntrceptorErrorCallback = async (error, axiosInstance) => {
    const originalRequest = error.config

    const status = error.response?.status
    const isAuthError = status === 401 || status === 403

    // If there is no response or it's not a 401/403 auth error, reject immediately
    if (!error.response || !isAuthError) {
        return Promise.reject(error)
    }

    // If original request was the refresh endpoint itself or already retried, do not loop
    const isRefreshUrl = originalRequest?.url?.includes('/token/refresh')
    if (originalRequest?._retry || isRefreshUrl) {
        return Promise.reject(error)
    }

    // If another request is currently refreshing the token, queue this request
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
        })
            .then((newToken) => {
                if (originalRequest.headers) {
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`
                }
                return axiosInstance(originalRequest)
            })
            .catch((err) => {
                return Promise.reject(err)
            })
    }

    console.log(`🔄 [Auth Interceptor] ${status} Error caught. Initiating refresh...`)
    originalRequest._retry = true
    isRefreshing = true

    try {
        const refreshToken = await getStoredRefreshToken()
        console.log('🔑 [Auth Interceptor] Refresh token available:', !!refreshToken)

        if (!refreshToken) {
            console.warn('⚠️ [Auth Interceptor] No refresh token found. Redirecting to login...')
            await redirectToLogin()
            return Promise.reject(error)
        }

        // Call backend refresh token API
        console.log('📡 [Auth Interceptor] Calling refresh token API...')
        const refreshResponse = await apiRefreshToken(refreshToken)

        const data = refreshResponse?.data
        const newAccessToken =
            data?.data?.access_token ||
            data?.access_token ||
            data?.data?.access ||
            data?.access ||
            data?.token

        const newRefreshToken =
            data?.data?.refresh_token ||
            data?.refresh_token ||
            data?.data?.refresh ||
            data?.refresh ||
            refreshToken

        if (!newAccessToken) {
            throw new Error('No access token returned from refresh API')
        }

        console.log('✅ [Auth Interceptor] Token refreshed successfully! Retrying original request...')

        // Store refreshed tokens
        tokenStorage.setTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        })

        // Retry all queued requests with the new access token
        processQueue(null, newAccessToken)

        // Retry original request with new access token
        if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        }

        return axiosInstance(originalRequest)
    } catch (refreshError) {
        // Both tokens expired or refresh token is invalid
        console.error('❌ [Auth Interceptor] Refresh token failed. Redirecting to login:', refreshError?.response?.data || refreshError?.message)
        processQueue(refreshError, null)
        await redirectToLogin()
        return Promise.reject(refreshError)
    } finally {
        isRefreshing = false
    }
}

export default AxiosResponseIntrceptorErrorCallback
