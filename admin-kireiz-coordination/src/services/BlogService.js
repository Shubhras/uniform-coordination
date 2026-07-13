import ApiService from './ApiService'

export async function apiGetBlogList(accessToken, page = 1, pageSize = 10) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/blogs/list/?page=${page}&page_size=${pageSize}`,
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiDeleteBlog(accessToken, id) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/blogs/delete/${id}/`,
        method: 'delete',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiCreateBlog(accessToken, formData) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/blogs/create/`,
        method: 'post',
        data: formData,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
        },
    })
}

export async function apiUpdateBlog(accessToken, id, formData) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/blogs/update/${id}/`,
        method: 'put',
        data: formData,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
        },
    })
}

export async function apiGetBlogCategoryList(accessToken, page = 1, pageSize = 100) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/categories/list/?page=${page}&page_size=${pageSize}`,
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}
