import axios from 'axios'
import AxiosResponseIntrceptorErrorCallback from './AxiosResponseIntrceptorErrorCallback'
import AxiosRequestIntrceptorConfigCallback from './AxiosRequestIntrceptorConfigCallback'
import appConfig from '@/configs/app.config'

/**
 * Base Axios instance configured with base API URL prefix, default timeout, and credentials.
 */
const AxiosBase = axios.create({
    timeout: 60000,
    baseURL: appConfig.apiPrefix,
    withCredentials: true,
})

/**
 * Request Interceptor: Attaches authentication headers and request metadata before sending.
 */
AxiosBase.interceptors.request.use(
    (config) => {
        return AxiosRequestIntrceptorConfigCallback(config)
    },
    (error) => {
        return Promise.reject(error)
    },
)

/**
 * Response Interceptor: Handles global HTTP response success and error callbacks.
 */
AxiosBase.interceptors.response.use(
    (response) => response,
    (error) => {
        AxiosResponseIntrceptorErrorCallback(error)
        return Promise.reject(error)
    },
)

export default AxiosBase

