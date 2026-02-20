import ApiService from './ApiService'

export async function apiGetSubcategoriesByCategoryId(accessToken, categoryId) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/subcategory/list/?categoryId=${categoryId}`,
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}
