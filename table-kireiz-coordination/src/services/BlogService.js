import ApiService from './ApiService'

export async function apiGetBlogs(params = {}) {
  return ApiService.fetchDataWithAxios({
    url: '/v1/space/uniformAdmin/blogs/list/?type=table',
    method: 'get',
    params,
  })
}

export async function apiGetBlogDetail(id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/uniformAdmin/blogs/detail/${id}/`,
    method: "get",
  });
}