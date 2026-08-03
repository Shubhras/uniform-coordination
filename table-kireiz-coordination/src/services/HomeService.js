import ApiService from './ApiService'

/**
 * Fetches homepage banner, themes, and uniform catalog data.
 * 
 * @param {Object} [params={}] - Optional query parameters.
 * @returns {Promise<Object>} API response with homepage content data.
 */
export async function apiGetHomeData(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/space/uniformAdmin/uniform-home/?type=table',
        method: 'get',
        params,
    })
}

/**
 * Fetches browse by theme catalog items list.
 * 
 * @param {Object} [params={}] - Optional query parameters.
 * @returns {Promise<Object>} API response with table themes list.
 */
export async function apiGetBrowseByThemeData(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/space/uniformAdmin/tabletheme/get-list/',
        method: 'get',
        params,
    })
}

/**
 * Fetches detailed breakdown and images for a single table theme.
 * 
 * @param {string|number} themeId - Target theme ID.
 * @param {Object} [params={}] - Optional query parameters.
 * @returns {Promise<Object>} API response with theme detail specifications.
 */
export async function apiGetSindleThemeDetails(themeId, params = {}) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/tabletheme/${themeId}/get/`,
        method: 'get',
        params,
    })
}