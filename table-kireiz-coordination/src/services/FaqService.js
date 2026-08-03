import ApiService from './ApiService'

/**
 * Fetches FAQ items list for table type category.
 * 
 * @param {Object} [params={}] - Optional query parameters.
 * @returns {Promise<Object>} API response with list of FAQ items.
 */
export async function apiGetFaq(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/space/uniformAdmin/faqs/list/?type=table',
        method: 'get',
        params,
    })
}