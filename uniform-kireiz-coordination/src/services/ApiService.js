import AxiosBase from './axios/AxiosBase'

/**
 * ApiService
 * 
 * Core HTTP client service wrapping AxiosBase instance for making API requests across the application.
 */
const ApiService = {
    /**
     * Executes an HTTP request using the configured AxiosBase instance and returns response data.
     * 
     * @param {import('axios').AxiosRequestConfig} param - Axios request configuration options.
     * @returns {Promise<any>} Promise resolving to response payload or rejecting on error.
     */
    fetchDataWithAxios(param) {
        return new Promise((resolve, reject) => {
            AxiosBase(param)
                .then((response) => {
                    resolve(response.data)
                })
                .catch((errors) => {
                    reject(errors)
                })
        })
    },
}

export default ApiService

