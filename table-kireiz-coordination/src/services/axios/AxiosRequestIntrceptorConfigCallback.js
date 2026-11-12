import { getAccessToken } from './tokenManager'

const PUBLIC_ENDPOINTS = [
    '/v1/userhub/login/',
    '/v1/userhub/signup/',
    '/v1/userhub/forgot-password/',
    '/v1/userhub/reset-password/',
    '/v1/userhub/verify-user/',
    '/v1/userhub/token/refresh/',
    '/v1/uniformAdmin/uniform-home/',
    '/v1/uniformAdmin/blogs/',
    '/v1/uniformAdmin/faqs/',
    '/v1/uniformAdmin/privacy-policy/',
    '/v1/uniformAdmin/category/',
]

const AxiosRequestIntrceptorConfigCallback = (config) => {
    const url = config.url || ''
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint))

    if (!isPublicEndpoint) {
        /** Attach or synchronize the latest access token if available */
        const currentToken = getAccessToken()
        if (currentToken) {
            if (!config.headers) {
                config.headers = {}
            }
            // If no Authorization header is present or it's a Bearer token, ensure it has the latest token
            if (!config.headers.Authorization || config.headers.Authorization.startsWith('Bearer ')) {
                config.headers.Authorization = `Bearer ${currentToken}`
            }
        }
    }
    return config
}

export default AxiosRequestIntrceptorConfigCallback

