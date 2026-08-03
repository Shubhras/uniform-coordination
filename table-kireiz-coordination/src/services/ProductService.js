import ApiService from './ApiService'

/**
 * Fetches generic products list.
 * 
 * @param {Object} params - Query filter parameters.
 * @returns {Promise<Object>} API response with products.
 */
export async function apiGetProductList(params) {
  return ApiService.fetchDataWithAxios({
    url: '/products',
    method: 'get',
    params,
  })
}

/**
 * Fetches single product details by ID.
 * 
 * @param {Object} param0 - Object containing product id and params.
 * @returns {Promise<Object>} API response with product data.
 */
export async function apiGetProduct({ id, ...params }) {
  return ApiService.fetchDataWithAxios({
    url: `/products/${id}`,
    method: 'get',
    params,
  })
}

/**
 * Fetches browse by color product catalog list.
 * 
 * @param {Object} [params={}] - Optional query parameters for filtering by color or category.
 * @returns {Promise<Object>} API response with product items.
 */
export async function apiGetBrowseByColorProductData(params = {}) {
  return ApiService.fetchDataWithAxios({
    url: '/v1/space/uniformAdmin/product/list/?productType=table',
    method: 'get',
    params,
  })
}

/**
 * Fetches table product catalog list filtered by parameters.
 * 
 * @param {Object} params - Query filter parameters.
 * @returns {Promise<Object>} API response with table products catalog.
 */
export async function apiGetProductById(params) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/product/list/`,
    method: "get",
    params,
  });
}

/**
 * Fetches detailed specification for a product by ID.
 * 
 * @param {string|number} id - Target product ID.
 * @returns {Promise<Object>} API response with full product specifications.
 */
export async function apiGetProductDetailsById(id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/product/get/${id}/`,
    method: "get",
  });
}


