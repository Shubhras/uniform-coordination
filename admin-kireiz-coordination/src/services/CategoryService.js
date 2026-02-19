import ApiService from './ApiService'

export async function apiGetCategoryList(accessToken, page = 1, pageSize = 100) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/categories/list/?page=${page}&page_size=${pageSize}`,
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiGetSubcategoryList(accessToken, page = 1, pageSize = 100) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/subcategory/list/?page=${page}&page_size=${pageSize}`,
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}
