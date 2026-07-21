import ApiService from './ApiService'

export async function apiGetPartsList(accessToken, page = 1, pageSize = 10) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/parts/list/?page=${page}&page_size=${pageSize}`,
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiDeletePart(accessToken, id) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/parts/delete/${id}/`,
        method: 'delete',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiCreatePart(accessToken, formData) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/parts/create/`,
        method: 'post',
        data: formData,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
        },
    })
}

export async function apiUpdatePart(accessToken, id, formData) {
    return ApiService.fetchDataWithAxios({
        url: `/v1/space/uniformAdmin/parts/update/${id}/`,
        method: 'put',
        data: formData,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
        },
    })
}
