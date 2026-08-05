import ApiService from './ApiService'

/**
 * Fetches user profile settings details.
 * 
 * @returns {Promise<Object>} API response with user profile settings.
 */
export async function apiGetSettingsProfile() {
    return ApiService.fetchDataWithAxios({
        url: '/setting/profile',
        method: 'get',
    })
}

/**
 * Fetches user notification preferences settings.
 * 
 * @returns {Promise<Object>} API response with notification settings.
 */
export async function apiGetSettingsNotification() {
    return ApiService.fetchDataWithAxios({
        url: '/setting/notification',
        method: 'get',
    })
}

/**
 * Fetches user billing and payment settings.
 * 
 * @returns {Promise<Object>} API response with billing settings.
 */
export async function apiGetSettingsBilling() {
    return ApiService.fetchDataWithAxios({
        url: '/setting/billing',
        method: 'get',
    })
}

/**
 * Fetches user integration settings.
 * 
 * @returns {Promise<Object>} API response with integration settings.
 */
export async function apiGetSettingsIntergration() {
    return ApiService.fetchDataWithAxios({
        url: '/setting/intergration',
        method: 'get',
    })
}

