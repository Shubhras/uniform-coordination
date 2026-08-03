import AxiosBase from './axios/AxiosBase'

/**
 * ApiService
 * 
 * Core HTTP client service wrapping AxiosBase instance for making API requests.
 */
const ApiService = {
    /**
     * Executes HTTP request using AxiosBase instance and returns response data.
     * 
     * @param {Object} param - Axios request configuration options.
     * @returns {Promise<Object>} Promise resolving to response data or rejecting on error.
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

