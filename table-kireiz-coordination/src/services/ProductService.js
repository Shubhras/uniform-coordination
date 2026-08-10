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
 * @param {string} [token] - Optional user authentication Bearer token.
 * @returns {Promise<Object>} API response with product items.
 */
export async function apiGetBrowseByColorProductData(params = {}, token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  return ApiService.fetchDataWithAxios({
    url: '/v1/space/uniformAdmin/product/list/?productType=table',
    method: 'get',
    params,
    headers,
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

/**
 * Fetches dynamic simulation categories and structures.
 * 
 * @returns {Promise<Object>} API response with list of categories and attribute structures.
 */
export async function apiGetSimulationCategories() {
  return ApiService.fetchDataWithAxios({
    url: '/v1/space/uniformAdmin/simulation/categories/',
    method: 'get',
  })
}

/**
 * Fetches dynamic options for a specific simulation category.
 * 
 * @param {string} categoryName - Category name to filter by.
 * @param {string} [tableShape] - Optional table shape to filter by.
 * @returns {Promise<Object>} API response with list of fabrics, colors, styles, sizes.
 */
export async function apiGetSimulationOptions(categoryName, tableShape = "") {
  return ApiService.fetchDataWithAxios({
    url: '/v1/space/uniformAdmin/simulation/options/',
    method: 'get',
    params: {
      category_name: categoryName,
      table_shape: tableShape
    }
  })
}


