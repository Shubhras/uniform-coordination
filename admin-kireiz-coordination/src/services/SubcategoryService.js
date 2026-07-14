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

export async function apiCreateSubcategory(accessToken, formData) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/subcategory/create/`,
        method: 'post',
        data: formData,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
        },
    })
}

export async function apiUpdateSubcategory(accessToken, id, formData) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/subcategory/update/${id}/`,
        method: 'put',
        data: formData,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
        },
    })
}

export async function apiDeleteSubcategory(accessToken, id) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/subcategory/delete/${id}/`,
        method: 'delete',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}
