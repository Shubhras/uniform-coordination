import ApiService from './ApiService';

/**
 * Sends a message/email directly to support.
 *
 * @param {Object} data - Payload with to_email, subject, message.
 * @param {string} [token] - Optional user token.
 * @returns {Promise<Object>} API response.
 */
export async function apiContactSupport(data, token) {
    const headers = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return ApiService.fetchDataWithAxios({
        url: '/v1/userhub/contact-support/',
        method: 'post',
        data,
        headers,
    });
}
