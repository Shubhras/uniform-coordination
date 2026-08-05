/**
 * Callback function to handle global API response errors (logging, notifications, authentication redirects, etc.).
 *
 * @param {import('axios').AxiosError} error - The Axios error object.
 */
const AxiosResponseIntrceptorErrorCallback = (error) => {
    console.error('API Response Error:', error)
}

export default AxiosResponseIntrceptorErrorCallback

