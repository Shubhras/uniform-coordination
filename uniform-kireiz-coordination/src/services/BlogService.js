import ApiService from './ApiService'

/**
 * Fetches list of blog articles for uniform category.
 *
 * @param {Object} [params={}] - Optional query parameters for filtering blogs.
 * @returns {Promise<Object>} API response containing blog articles list.
 */
export async function apiGetBlogs(params = {}) {
  return ApiService.fetchDataWithAxios({
    url: '/v1/uniformAdmin/blogs/list/?type=uniform',
    method: 'get',
    params,
  })
}

/**
 * Fetches specific blog article details by blog ID.
 *
 * @param {string|number} id - Blog ID.
 * @returns {Promise<Object>} API response containing blog article details.
 */
export async function apiGetBlogDetail(id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/blogs/detail/${id}/`,
    method: "get",
  });
}