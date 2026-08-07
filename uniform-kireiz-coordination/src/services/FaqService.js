import ApiService from './ApiService'

/**
 * Fetches frequently asked questions (FAQ) list.
 *
 * @param {Object} [params={}] - Optional query parameters for filtering FAQs.
 * @returns {Promise<Object>} API response containing list of FAQs.
 */
export async function apiGetFaq(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/uniformAdmin/faqs/list/',
        method: 'get',
        params,
    })
}
