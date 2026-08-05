import ApiService from './ApiService'

/**
 * Fetches customer logs and activity records.
 *
 * @param {Object} params - Query parameters for fetching customer logs.
 * @returns {Promise<Object>} API response containing customer log entries.
 */
export async function apiGetCustomerLog({ ...params }) {
    return ApiService.fetchDataWithAxios({
        url: `/customers/log`,
        method: 'get',
        params,
    })
}

/**
 * Fetches customers list with optional filters.
 *
 * @param {Object} params - Query parameters for filtering customer records.
 * @returns {Promise<Object>} API response containing list of customers.
 */
export async function apiGetCustomers({ ...params }) {
    return ApiService.fetchDataWithAxios({
        url: `/customers`,
        method: 'get',
        params,
    })
}
