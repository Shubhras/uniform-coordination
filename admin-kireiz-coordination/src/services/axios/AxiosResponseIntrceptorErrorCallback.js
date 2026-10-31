import axios from 'axios'
import { signOut } from 'next-auth/react'
import appConfig from '@/configs/app.config'
import {
    getActiveRefreshToken,
    setActiveAccessToken,
    setActiveRefreshToken,
    clearActiveTokens,
} from './tokenStore'

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

export const redirectToLogin = async () => {
    clearActiveTokens()
    if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        const signInPath = appConfig.unAuthenticatedEntryPath || '/sign-in'
        if (!currentPath.includes(signInPath)) {
            try {
                await signOut({ redirect: false })
            } catch (err) {
                console.error('SignOut error:', err)
            }
            const redirectUrl = encodeURIComponent(currentPath + window.location.search)
            window.location.href = `${signInPath}?redirect=${redirectUrl}`
        }
    }
}

const AxiosResponseIntrceptorErrorCallback = async (error, axiosInstance) => {
    const originalRequest = error?.config

    if (!originalRequest) {
        return Promise.reject(error)
    }

    const isUnauthorized =
        error.response?.status === 401 ||
        error.response?.data?.statusCode === 401 ||
        error.response?.data?.code === 'token_not_valid'

    const isRefreshEndpoint = originalRequest.url?.includes('/token/refresh')

    // If refresh token request itself failed or both tokens are expired
    if (isRefreshEndpoint) {
        await redirectToLogin()
        return Promise.reject(error)
    }

    // If 401 and request has not already been retried
    if (isUnauthorized && !originalRequest._retry) {
        const refreshToken = getActiveRefreshToken()

        if (!refreshToken) {
            await redirectToLogin()
            return Promise.reject(error)
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return axiosInstance(originalRequest)
                })
                .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
            // Direct unintercepted axios request to avoid circular interceptor triggers
            const refreshUrl = `${appConfig.apiPrefix}/v1/uniformAdmin/token/refresh/`
            const response = await axios.post(
                refreshUrl,
                {
                    refresh: refreshToken,
                    refresh_token: refreshToken,
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            )

            const data = response.data
            const newAccessToken =
                data?.data?.access_token ||
                data?.data?.access ||
                data?.access_token ||
                data?.access

            const newRefreshToken =
                data?.data?.refresh_token ||
                data?.data?.refresh ||
                data?.refresh_token ||
                data?.refresh

            if (!newAccessToken) {
                throw new Error('New access token not found in refresh response')
            }

            setActiveAccessToken(newAccessToken)
            if (newRefreshToken) {
                setActiveRefreshToken(newRefreshToken)
            }

            processQueue(null, newAccessToken)

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return axiosInstance(originalRequest)
        } catch (refreshError) {
            processQueue(refreshError, null)
            await redirectToLogin()
            return Promise.reject(refreshError)
        } finally {
            isRefreshing = false
        }
    }

    return Promise.reject(error)
}

export default AxiosResponseIntrceptorErrorCallback
