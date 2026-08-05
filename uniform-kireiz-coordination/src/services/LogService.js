import ApiService from './ApiService'

/**
 * Fetches application activity/error log entries.
 *
 * @param {Object} [params] - Optional query parameters for filtering logs.
 * @returns {Promise<Object>} API response containing log entries list.
 */
export async function apiGetLogs(params) {
    return ApiService.fetchDataWithAxios({
        url: '/logs',
        method: 'get',
        params,
    })
}
