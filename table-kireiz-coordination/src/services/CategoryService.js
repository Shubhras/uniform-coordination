import ApiService from "./ApiService";

/**
 * Fetches product category list from backend service.
 * 
 * @param {Object} [params={}] - Optional query parameters.
 * @returns {Promise<Object>} API response with list of categories.
 */
export async function apiGetCategories(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/space/uniformAdmin/categories/list/',
        method: 'get',
        params,
    });
}

/**
 * Fetches fabric material list.
 * 
 * @param {Object} [params={}] - Optional query parameters.
 * @returns {Promise<Object>} API response with list of fabrics/materials.
 */
export async function apiGetMaterialList(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/space/uniformAdmin/fabric/list/',
        method: 'get',
        params,
    });
}

/**
 * Fetches product color filter palette options list.
 * 
 * @param {Object} [params={}] - Optional query parameters.
 * @returns {Promise<Object>} API response with list of available colors.
 */
export async function apiGetColorList(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/space/uniformAdmin/colors/list/',
        method: 'get',
        params,
    });
}

