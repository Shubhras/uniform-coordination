import { handleTokenRefresh, redirectToLogin } from '../tokenStorage'

/**
 * Global response interceptor error callback.
 * Handles 401 Unauthorized errors by refreshing access token and retrying the failed request.
 * If both tokens are expired or refresh fails, navigates to the login page.
 *
 * @param {import('axios').AxiosError} error - The Axios error object.
 * @param {import('axios').AxiosInstance} axiosInstance - The Axios instance for retrying requests.
 * @returns {Promise<any>} Retried request promise or rejection.
 */
const AxiosResponseIntrceptorErrorCallback = async (error, axiosInstance) => {
    const originalRequest = error.config
    const status = error.response ? error.response.status : null

    // Check if error is 401 Unauthorized
    if (status === 401 && originalRequest) {
        const requestUrl = originalRequest.url || ''

        // If the refresh token endpoint or login endpoint itself returned 401,
        // it means both tokens are expired or invalid -> redirect to login page.
        if (requestUrl.includes('/token/refresh/') || requestUrl.includes('/userhub/login/')) {
            console.warn('Auth/Refresh endpoint returned 401. Both tokens expired. Redirecting to login.')
            await redirectToLogin()
            return Promise.reject(error)
        }

        // Prevent infinite loops if request has already been retried once
        if (originalRequest._retry) {
            console.warn('Request was already retried once and failed with 401. Redirecting to login.')
            await redirectToLogin()
            return Promise.reject(error)
        }

        originalRequest._retry = true

        try {
            // Trigger refresh token API flow (/api/v1/userhub/token/refresh/)
            const newAccessToken = await handleTokenRefresh()

            // Update Authorization header for the original request with new token
            if (originalRequest.headers) {
                if (typeof originalRequest.headers.set === 'function') {
                    originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`)
                } else {
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
                }
            }

            // Retry the original request using the updated token
            if (axiosInstance) {
                return axiosInstance(originalRequest)
            }
        } catch (refreshError) {
            // Both tokens are expired or refresh failed -> navigate to login page
            console.error('Refresh token failed. Redirecting to login page:', refreshError)
            await redirectToLogin()
            return Promise.reject(refreshError)
        }
    }

    console.error('API Response Error:', error)
    return Promise.reject(error)
}

export default AxiosResponseIntrceptorErrorCallback
