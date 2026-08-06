import ApiService from './ApiService'

/**
 * Fetches list of uploaded files and media assets.
 *
 * @param {Object} [params] - Query parameters for filtering files.
 * @returns {Promise<Object>} API response containing files list.
 */
export async function apiGetFiles(params) {
    return ApiService.fetchDataWithAxios({
        url: '/files',
        method: 'get',
        params,
    })
}
