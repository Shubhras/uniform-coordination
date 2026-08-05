import ApiService from './ApiService'

/**
 * Fetches blog articles list for table type category.
 * 
 * @param {Object} [params={}] - Optional query parameters for filtering blogs.
 * @returns {Promise<Object>} API response with list of blog posts.
 */
export async function apiGetBlogs(params = {}) {
  return ApiService.fetchDataWithAxios({
    url: '/v1/space/uniformAdmin/blogs/list/?type=table',
    method: 'get',
    params,
  })
}

/**
 * Fetches detailed blog article by blog ID.
 * 
 * @param {string|number} id - Target blog article ID.
 * @returns {Promise<Object>} API response with blog article details.
 */
export async function apiGetBlogDetail(id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/blogs/detail/${id}/`,
    method: "get",
  });
}