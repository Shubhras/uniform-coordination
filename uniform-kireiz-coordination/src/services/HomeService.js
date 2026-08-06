import ApiService from './ApiService'

/**
 * Fetches homepage banners, featured products, and configuration data.
 *
 * @param {Object} [params={}] - Optional query parameters for homepage content.
 * @returns {Promise<Object>} API response containing homepage content data.
 */
export async function apiGetHomeData(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/uniformAdmin/uniform-home/?type=uniform',
        method: 'get',
        params,
    })
}