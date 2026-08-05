/**
 * Callback function to mutate or inject custom config/headers before request is sent to the server.
 *
 * @param {import('axios').InternalAxiosRequestConfig} config - The Axios request configuration object.
 * @returns {import('axios').InternalAxiosRequestConfig} Modified request configuration.
 */
const AxiosRequestIntrceptorConfigCallback = (config) => {
    return config
}

export default AxiosRequestIntrceptorConfigCallback

