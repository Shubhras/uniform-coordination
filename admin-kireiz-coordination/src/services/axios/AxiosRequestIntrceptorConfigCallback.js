import { getActiveAccessToken } from './tokenStore'

const AxiosRequestIntrceptorConfigCallback = (config) => {
    /** handle config mutatation here before request to server */
    const isRefreshRequest = config.url?.includes('/token/refresh')

    if (!isRefreshRequest) {
        const token = getActiveAccessToken()
        if (token) {
            if (!config.headers) {
                config.headers = {}
            }
            config.headers.Authorization = `Bearer ${token}`
        }
    }

    return config
}

export default AxiosRequestIntrceptorConfigCallback
