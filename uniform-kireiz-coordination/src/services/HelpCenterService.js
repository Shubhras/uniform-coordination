import ApiService from './ApiService'

/**
 * Fetches list of support hub and help center articles.
 *
 * @param {Object} [params] - Query parameters for filtering support articles.
 * @returns {Promise<Object>} API response containing support articles list.
 */
export async function apiGetSupportHubArticles(params) {
    return ApiService.fetchDataWithAxios({
        url: '/helps/articles',
        method: 'get',
        params,
    })
}

/**
 * Deletes specified support hub articles.
 *
 * @param {Object} data - Payload specifying articles to delete.
 * @returns {Promise<Object>} API response confirming deletion of articles.
 */
export async function apiDeleteSupportHubArticles(data) {
    return ApiService.fetchDataWithAxios({
        url: '/helps/articles',
        method: 'delete',
        data,
    })
}
