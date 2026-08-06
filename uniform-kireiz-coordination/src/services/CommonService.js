import ApiService from './ApiService'

/**
 * Fetches count of unread user notifications.
 *
 * @returns {Promise<Object>} API response containing unread notification count.
 */
export async function apiGetNotificationCount() {
    return ApiService.fetchDataWithAxios({
        url: '/notifications/count',
        method: 'get',
    })
}

/**
 * Fetches list of notifications for the user.
 *
 * @returns {Promise<Object>} API response containing list of notifications.
 */
export async function apiGetNotificationList() {
    return ApiService.fetchDataWithAxios({
        url: '/notifications',
        method: 'get',
    })
}

/**
 * Executes a global search query across the application.
 *
 * @param {Object} params - Query parameters including search query string.
 * @returns {Promise<Object>} API response containing search results.
 */
export async function apiGetSearchResult(params) {
    return ApiService.fetchDataWithAxios({
        url: '/search',
        method: 'get',
        params,
    })
}
