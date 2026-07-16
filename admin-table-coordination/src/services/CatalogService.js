import ApiService from './ApiService'

export async function apiGetCatalogImageList(accessToken, page = 1, pageSize = 10) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/catalog-image/list/?page=${page}&page_size=${pageSize}`,
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiDeleteCatalogImage(accessToken, id) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/catalog-image/delete/${id}/`,
        method: 'delete',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiCreateCatalogImage(accessToken, formData) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/catalog-image/create/`,
        method: 'post',
        data: formData,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
        },
    })
}

export async function apiUpdateCatalogImage(accessToken, id, formData) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/uniformAdmin/catalog-image/update/${id}/`,
        method: 'put',
        data: formData,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
        },
    })
}
