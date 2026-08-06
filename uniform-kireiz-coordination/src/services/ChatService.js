import ApiService from './ApiService'

/**
 * Fetches conversation chat messages by conversation ID.
 *
 * @param {Object} options - Options containing conversation ID.
 * @param {string|number} options.id - Conversation ID.
 * @returns {Promise<Object>} API response containing conversation chat details.
 */
export async function apiGetConversation({ id }) {
    return ApiService.fetchDataWithAxios({
        url: `/conversations/${id}`,
        method: 'get',
    })
}

/**
 * Fetches list of chat contacts.
 *
 * @returns {Promise<Object>} API response containing contact list.
 */
export async function apiGetContacts() {
    return ApiService.fetchDataWithAxios({
        url: `/contacts`,
        method: 'get',
    })
}

/**
 * Fetches contact profile details by contact ID.
 *
 * @param {Object} options - Options containing contact ID.
 * @param {string|number} options.id - Contact ID.
 * @returns {Promise<Object>} API response containing detailed contact info.
 */
export async function apiGetContactDetails({ id }) {
    return ApiService.fetchDataWithAxios({
        url: `/contacts/${id}`,
        method: 'get',
    })
}
