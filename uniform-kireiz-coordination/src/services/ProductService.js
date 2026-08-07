import ApiService from "./ApiService";


/**
 * Fetches product list by parameters (subcategoryId, productType, etc.).
 *
 * @param {Object} [params] - Query parameters for fetching product list.
 * @returns {Promise<Object>} API response with list of products.
 */
export async function apiGetProductById(params) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/product/list/`,
    method: "get",
    params,
  });
}

/**
 * Fetches detailed product information by product ID.
 *
 * @param {string|number} id - Product ID.
 * @returns {Promise<Object>} API response with detailed product information.
 */
export async function apiGetProductDetailsById(id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/product/get/${id}/`,
    method: "get",
  });
}
