import axios from 'axios'
import AxiosResponseIntrceptorErrorCallback from './AxiosResponseIntrceptorErrorCallback'
import AxiosRequestIntrceptorConfigCallback from './AxiosRequestIntrceptorConfigCallback'
import appConfig from '@/configs/app.config'

const AxiosBase = axios.create({
    timeout: 60000,
    baseURL: appConfig.apiPrefix,
    withCredentials: true,
})

AxiosBase.interceptors.request.use(
    (config) => {
        return AxiosRequestIntrceptorConfigCallback(config)
    },
    (error) => {
        return Promise.reject(error)
    },
)

AxiosBase.interceptors.response.use(
    (response) => {
        if (
            response?.data?.statusCode === 401 ||
            response?.data?.code === 'token_not_valid'
        ) {
            const fakeError = {
                config: response.config,
                response: response,
            }
            return AxiosResponseIntrceptorErrorCallback(fakeError, AxiosBase)
        }
        return response
    },
    (error) => {
        return AxiosResponseIntrceptorErrorCallback(error, AxiosBase)
    },
)

export default AxiosBase
