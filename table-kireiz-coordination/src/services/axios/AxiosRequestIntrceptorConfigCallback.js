import { getAccessToken } from './tokenManager'

const AxiosRequestIntrceptorConfigCallback = (config) => {
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
    return config
}

export default AxiosRequestIntrceptorConfigCallback

